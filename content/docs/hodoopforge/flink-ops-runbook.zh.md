---
title: "Flink 运维手册"
weight: 70
type: "docs"
---


> **版本**：v1.0（2026-11-03）  
> **适用**：qixuandata 集群，Flink 1.20.1 Standalone，EduLake 实时 ODS 接入  
> **配套脚本**：`ambari3/scripts/flink-health-check.sh`、`ambari3/scripts/iceberg-maintenance.sh`  
> **2026-11-26 更新**：JM/TM 已 Kerberos；Kafka 已 SASL_PLAINTEXT/GSSAPI；checkpoint 20s；warehouse 为 `-ha`；当前作业 `adb1b6a9…` RUNNING。

---

## 一、架构与数据流

```
应用(192.168.0.168)
  │ Kafka: ai_inference_log / rag_query_log
  ▼
Flink 1.20.1（h0 JM + h2/h3 TM，2×2 slots）
  │ hadoop catalog → 写 ODS
  ▼
Iceberg ODS（hdfs://qixuandata/iceberg-warehouse-ha）
  │
  ▼
Spark ThriftServer(10016) → DWD/DWS/ADS
```

### 关键约束

| 约束 | 说明 |
|---|---|
| 单写者 | ODS 仅 Flink 写；DWD/DWS/ADS 仅 Spark 写 |
| 二选一 | Flink 与 Python bridge 不能同时写 ODS（bridge 已停） |
| 时区 | Flink/Spark 均 `Asia/Shanghai` |
| 幂等 | `log_id=ai_<p>_<o>`、`query_id=rag_<p>_<o>` |
| 维护互斥 | Iceberg 治理需避开 Flink 写入（建议暂停作业或低峰） |

---

## 二、关键配置

| 文件/项 | 值 |
|---|---|
| Flink 配置 | `/etc/flink/conf/flink-conf.yaml`；JM2 用 `/etc/flink/conf-jm2`；**agent 已锁，Ambari 不再下发** |
| Catalog | `catalog-type=hadoop`，warehouse `hdfs://qixuandata/iceberg-warehouse-ha` |
| Kerberos | `security.kerberos.login.keytab=flink.headless.keytab`，`zookeeper.sasl.disable=true` |
| Kafka | `SASL_PLAINTEXT` + `GSSAPI` + 显式 JAAS |
| Checkpoint | **20s**，EXACTLY_ONCE，RocksDB，`hdfs://qixuandata/flink-checkpoints/edulake` |
| TM 资源 | 2 TM × 2 slots × 2048m（h2/h3） |
| Prometheus | `metrics.reporter.prom`，端口 **9249**（JM/TM） |
| Spark 时区 | `spark.sql.session.timeZone=Asia/Shanghai` |

---

## 三、日常巡检

```bash
# 一键健康检查（9 项）
bash ambari3/scripts/flink-health-check.sh
```

期望：`PASS=9 FAIL=0`、`RESULT: HEALTHY`。

检查项：作业 RUNNING、TM/slots、checkpoint、Kafka lag、bridge 停止、ODS 重复。

---

## 四、监控（Prometheus）

### 4.1 抓取目标

| 目标 | 地址 |
|---|---|
| Flink JM | `192.168.0.60:9249/metrics`（h0） |
| Flink TM1 | h2:9249 |
| Flink TM2 | h3:9249 |

> **Prometheus 已部署（2026-11-03）**：
> - 地址：`http://192.168.0.60:9090`（宿主机 `/home/rkam/prometheus`）
> - 抓取 targets：`172.19.0.2:9249`(JM) / `172.19.0.3:9249`(TM) / `172.19.0.4:9249`(TM)，全部 up
> - Grafana：数据源 `Prometheus-Flink`（`http://172.19.0.1:9090`），Dashboard「Apache Flink (2021)」uid=`wKbnD5Gnk`
> - 开机自启：用户 crontab `@reboot`

### 4.1.1 轻量告警（当前已启用）

无 Prometheus 期间的替代方案：

```bash
# 每 10 分钟执行健康检查，异常写入 /tmp/flink-health.log
*/10 * * * * bash /home/rkam/hadoop-ops-course/ambari3/scripts/flink-alert-cron.sh
```

- 日志：`/tmp/flink-health.log`（OK/ALERT + 详情）
- 可选 webhook：设置环境变量 `FLINK_ALERT_WEBHOOK`（企业微信/钉钉/Slack）
- 已通过 `crontab` 安装，可用 `crontab -l` 确认

### 4.2 关键指标

| 指标 | 含义 |
|---|---|
| `flink_taskmanager_job_task_numRecordsIn` | 输入记录数 |
| `flink_taskmanager_job_task_numRecordsOut` | 输出记录数 |
| `flink_jobmanager_job_lastCheckpointDuration` | checkpoint 耗时 |
| `flink_jobmanager_job_numberOfFailedCheckpoints` | 失败次数 |
| `flink_taskmanager_job_task_operator_numRecordsIn` | 算子级输入 |
| Kafka lag | 通过 `kafka-consumer-groups --describe` |

### 4.3 建议告警规则（Prometheus）

```yaml
groups:
- name: flink-edulake
  rules:
  - alert: FlinkJobNotRunning
    expr: flink_jobmanager_job_uptime < 0 or absent(flink_jobmanager_job_uptime)
    for: 2m
    labels: {severity: critical}
    annotations: {summary: "Flink 作业未运行"}

  - alert: FlinkCheckpointFailing
    expr: increase(flink_jobmanager_job_numberOfFailedCheckpoints[10m]) > 0
    for: 5m
    labels: {severity: warning}
    annotations: {summary: "Flink checkpoint 失败"}

  - alert: FlinkKafkaLagHigh
    expr: kafka_consumergroup_lag{group=~"edulake_flink_.*"} > 10000
    for: 5m
    labels: {severity: warning}
    annotations: {summary: "Flink 消费积压 > 10000"}

  - alert: FlinkNoRecordsIn
    expr: increase(flink_taskmanager_job_task_numRecordsIn[15m]) == 0
    for: 15m
    labels: {severity: warning}
    annotations: {summary: "Flink 15 分钟无输入（业务侧无流量或卡住）"}
```

> Kafka lag 需 `kafka-exporter` 或自建采集。

---

## 五、小文件治理

流式写入会产生大量小文件（当前约 15 个/表，~4KB/个）。

```bash
# 先查看（不修改）
bash ambari3/scripts/iceberg-maintenance.sh --dry-run

# 实跑（建议低峰或暂停 Flink）
bash ambari3/scripts/iceberg-maintenance.sh
```

脚本对两张 ODS 执行：
- `rewrite_data_files`（目标 128MB，合并小文件）
- `expire_snapshots`（保留最近 3 个、清理 7 天前）

建议频率：**每周一次**，或文件数 > 200 时触发。

> ⚠️ hadoop catalog 无分布式锁：执行期间避免 Flink 写入同一表（可暂停作业或选凌晨）。

---

## 六、故障恢复

### 6.1 作业挂了

```bash
# 1) 查看状态
docker exec bigtop_hostname0 bash -c "curl -s http://localhost:8081/jobs/overview"

# 2) 重新提交（group-offsets 自动从 committed offset 继续）
docker exec bigtop_hostname0 bash -c "su -s /bin/bash flink -c '
  export HADOOP_HOME=/usr/bigtop/current/hadoop-client
  export HADOOP_CONF_DIR=/etc/hadoop/conf
  export HADOOP_CLASSPATH=\$(\$HADOOP_HOME/bin/hadoop classpath)
  /usr/lib/flink/bin/sql-client.sh -Dexecution.target=remote \
    -Drest.address=localhost -Drest.port=8081 -f /tmp/edulake_flink_jobs.sql'
```

### 6.2 从 checkpoint 恢复（更严格）

```bash
# 找到最新 checkpoint
hdfs dfs -ls /flink-checkpoints/edulake/<job-id>/

# 提交时指定
sql-client.sh ... -s hdfs:///flink-checkpoints/edulake/<job-id>/chk-<N>
```

### 6.3 Flink 整体重启

Ambari → FLINK → 重启组件。**Standalone 重启后作业不会自动恢复**，需重新提交（见 6.1）。

### 6.4 TM 缺 jar 导致 `Cannot load user class`

JM 与所有 TM 的 `/usr/lib/flink/lib/` 必须一致：
```bash
for h in bigtop_hostname0 bigtop_hostname2 bigtop_hostname3; do
  docker exec $h ls /usr/lib/flink/lib/ | grep -E 'kafka|iceberg'
done
```

---

## 七、回滚到 Python bridge

```bash
# 1) 停 Flink 作业（Ambari 或 REST cancel）
# 2) 重置 bridge 消费组到 latest
kafka-consumer-groups.sh --bootstrap-server 192.168.0.60:9092 \
  --group edulake_bridge_ai_inference_log --reset-offsets --to-latest --execute
kafka-consumer-groups.sh --bootstrap-server 192.168.0.60:9092 \
  --group edulake_bridge_rag_query_log --reset-offsets --to-latest --execute
# 3) 在 192.168.0.168 启动 bridge
```

> bridge 消费组 offset 保留 7 天；禁止双跑。

---

## 八、常见问题（FAQ）

| 现象 | 原因 | 处理 |
|---|---|---|
| 作业 RESTARTING | TM 缺 connector / 类冲突 | 检查 lib 一致性；移除非 shaded kafka connector |
| 主键重复 | bridge 双写 | 停 bridge（`pkill -f kafka_to_iceberg_bridge`） |
| `ClassNotFoundException: OffsetResetStrategy` | 非 shaded 与 shaded connector 并存 | 移除 `flink-connector-kafka-*.jar` |
| `Cannot load user class: KafkaSource` | TM 无 Kafka connector | 复制到所有 TM |
| dt 错位 | 时区未统一 | Flink/Spark 均设 Asia/Shanghai |
| checkpoint 失败 | HDFS 慢/超时 | 调大 timeout；检查 HDFS |
| 小文件过多 | 流式写入 | 执行 `iceberg-maintenance.sh` |

---

## 九、责任与变更

| 操作 | 责任方 |
|---|---|
| Flink 作业提交/恢复 | 平台 |
| Iceberg 治理 | 平台（低峰/暂停作业） |
| bridge 启停 | 业务方（168 主机） |
| ODS 数据口径/去重 | 业务方 |
| Spark 下游任务 | 业务方 |

任何配置变更需同步更新本文档与 `func/CHANGELOG.md`。
