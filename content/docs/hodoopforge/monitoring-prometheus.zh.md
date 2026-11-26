---
title: "Prometheus 监控"
weight: 80
type: "docs"
---


> 部署日期：2026-11-20
> 状态：**主备双实例**（h1 主 / h2 备），各 12/12 targets UP，23 条规则，Alertmanager 集群去重；已合并宿主机旧实例并通过 NAT 暴露
> 安装脚本：`../scripts/monitoring/install_prometheus.sh`


> **2026-11-26 注意**：手工 Kerberos 模式下 `ambari-agent` 由
> `kerberos_guard` 锁定，Ambari 告警计数可能滞后；服务健康以
> Prometheus 探针 + 直接端口/Kerberos 检查为准。旧 60s watchdog 已停止，
> 由 `kerberos_guard`（30s）接管数据面自愈。


## 1. 为什么这样部署

- Bigtop/Ambari 栈里没有 Prometheus 服务定义，无法像 HDFS 一样被 Ambari 管理；
- Docker Hub 在本环境不可达，但 GitHub Releases 可达，因此直接使用官方二进制；
- 不重启任何 Hadoop/Kafka/Flink 服务，全部通过 sidecar exporter 采集；
- h1/h2 双实例 + Alertmanager 集群，避免单点；h2 余量足够，无需停业务组件。

## 2. 组件与端口

| 组件 | 位置 | 端口 | 说明 |
|---|---|---|---|
| Prometheus 主 | h1（172.19.0.5） | 9090 | 15s 抓取，15 天本地保留 |
| Prometheus 备 | h2（172.19.0.3） | 9090 | 同一套规则，独立抓取 |
| Alertmanager 主 | h1 | 9093 | 与 h2 组成 gossip 集群 |
| Alertmanager 备 | h2 | 9093 | 与 h1 组成 gossip 集群 |
| alert_webhook | h1/h2 | 9500 | 告警落盘 + 可选转发 |
| prom_proxy | h2 | 9099 | 只读故障切换查询入口（先 h1，失败自动转 h2） |
| node_exporter | h0–h3 | 9100 | CPU/内存/磁盘/网络 |
| kafka_exporter | h1 | 9308 | broker 数、topic 分区、消费组 lag |
| hdfs_jmx_exporter | h1 | 9401 | 两个 NameNode 的 JMX（容量、缺块、checkpoint） |
| ambari_exporter | h1 | 9402 | Ambari 告警计数与服务状态 |
| flink_exporter | h1 | 9403 | 作业状态、TM 数、checkpoint 计数 |
| management_exporter | 宿主机 | 9404 | Ambari/Agent/容器/MySQL 复制/Hive/KDC/备份/配置漂移 |

访问：

```text
Prometheus   http://192.168.0.60:9090   (standby: http://192.168.0.60:19090)
Alertmanager http://192.168.0.60:19093  (standby: http://192.168.0.60:29093)
统一查询     http://192.168.0.60:19099  (自动在主/备 Prometheus 间切换)
```

> 9090/19093/19090/29093/19099 已加入 `setup-nat-forward.sh`（V2.8），由 `hodoopforge-nat.service` 开机恢复。
> 9093 保持给 Kafka 外部 broker 1002，不能复用。
> 原先宿主机上的 Prometheus 2.54.1（仅抓 Flink 9249）已停止，统一由本实例接管。

## 3. 抓取目标

`scripts/monitoring/prometheus.yml`：

```text
prometheus  127.0.0.1:9090
node        172.19.0.2/5/3/4:9100
kafka       127.0.0.1:9308
hdfs        127.0.0.1:9401
ambari      127.0.0.1:9402
flink       127.0.0.1:9403
flink_metrics 172.19.0.2:9249 / 172.19.0.5:9249  (JM1/JM2 自带 Prometheus 端点)
management   172.19.0.1:9404   (宿主机管理面 exporter)

> kafka job 单独设置 `scrape_interval=30s / scrape_timeout=25s`，
> 避免 broker 慢时消费组 offset 采集超过 10s。
```

验证：

```bash
curl -s http://172.19.0.5:9090/api/v1/targets | \
  python3 -c "import json,sys; [print(t['labels']['job'], t['health']) for t in json.load(sys.stdin)['data']['activeTargets']]"
```

## 4. 告警规则

`scripts/monitoring/rules.yml` 共 23 条（13 条业务 + 10 条管理面）：

**可用性**

| 告警 | 条件 | 级别 |
|---|---|---|
| AmbariCriticalAlert | `sum(ambari_alerts{state="CRITICAL"}) > 0` | critical |
| AmbariUnreachable | `ambari_up == 0` | critical |
| HdfsNoActiveNameNode | `sum(hdfs_namenode_active) != 1` | critical |
| HdfsMissingBlocks | `max(hdfs_missing_blocks) > 0` | critical |
| HdfsDatanodeDown | `max(hdfs_live_datanodes) < 3` | critical |
| HdfsCheckpointStale | 距上次 checkpoint > 24h | warning |
| KafkaBrokerDown | `kafka_brokers < 3` | critical |
| KafkaConsumerLagHigh | 单消费组 lag > 10000 | warning |
| FlinkJobNotRunning | `flink_job_running == 0` | critical |
| FlinkUnreachable | `flink_up == 0` | warning |

**容量**

| 告警 | 条件 | 级别 |
|---|---|---|
| NodeDiskLow | 根分区可用 < 25% | warning |
| NodeMemoryLow | 可用内存 < 8% | warning |
| NodeLoadHigh | load1 > 8 持续 15m | warning |

查看：

```bash
curl -s http://172.19.0.5:9090/api/v1/rules | python3 -m json.tool | head -40
curl -s http://172.19.0.5:9090/api/v1/alerts | python3 -m json.tool
```

## 5. 运维操作

```bash
# 状态
docker exec bigtop_hostname1 systemctl status prometheus alertmanager kafka_exporter \
  hdfs_jmx_exporter ambari_exporter flink_exporter

# 重启单个组件
docker exec bigtop_hostname1 systemctl restart prometheus

# 校验配置
docker exec bigtop_hostname1 /usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml --dry-run

# 查看 exporter
curl -s http://172.19.0.5:9402/metrics | head
curl -s http://172.19.0.5:9401/metrics | grep hdfs_
curl -s http://172.19.0.5:9308/metrics | grep kafka_brokers
```

`kerberos_guard` 在修复数据面时也会检查监控；Prometheus/Alertmanager 自身仍由 systemd 自启，旧 watchdog 的 60s 监控探活已停止。

### 5.1 故障切换

```bash
bash scripts/monitoring/failover.sh status   # 查看当前指向与两端健康
bash scripts/monitoring/failover.sh h2       # 9090/19093 切到 h2
bash scripts/monitoring/failover.sh h1       # 切回 h1
```

- 只切换 9090（Prometheus）和 19093（Alertmanager）；
- **9093 不动**，它属于 Kafka 外部 broker 1002；
- 切换后 `curl http://192.168.0.60:9090/-/ready` 与 `:19093/-/ready` 复核；
- 也可直接访问备用端点：`:19090`（Prometheus）、`:29093`（Alertmanager）；
- 只读查询建议用 `:19099`，代理会自动跳过不可用的 Prometheus。

### 5.2 告警落盘

Alertmanager 的 receiver 指向本机 `http://127.0.0.1:9500/alerts`：

```bash
tail -f /var/log/hodoopforge-alerts.jsonl
```

如需转发到 IM/电话网关，在 `alert_webhook` 的 systemd 环境里设置
`ALERT_WEBHOOK_URL`，原始 payload 会继续 POST 到该地址。

## 6. 资源占用

| 组件 | 约内存 |
|---|---|
| Prometheus | 150–300 MB |
| Alertmanager | 30–60 MB |
| kafka_exporter | 30–50 MB |
| 3 个 Python exporter | 各 20–40 MB |
| prom_proxy | 20–40 MB |
| management_exporter | 30–50 MB（宿主机） |
| node_exporter ×4 | 各 15–25 MB |

主实例在 h1（10 GB），备实例在 h2（9 GB，当前约 74%）；合计新增约 0.7 GB，未影响业务。

## 7. 接入 Grafana

现有 Grafana 是 Ambari Metrics Grafana（:3000），已由 systemd 单元
`ambari-metrics-grafana.service` 托管（开机自启）。数据源：

```text
name: Prometheus-Flink
url : http://172.19.0.5:9090
默认: 是
```

> 备用数据源可手工添加 `http://172.19.0.3:9090`。

仪表盘已通过文件 provisioning 自动加载：

```text
HodoopForge / HodoopForge 数据湖总览
```

包含 HDFS 容量/缺块、Active NN、Kafka broker 与消费 lag、Flink 作业与
checkpoint、各节点内存/磁盘、Ambari CRITICAL 告警。文件位置：

```text
scripts/monitoring/grafana/dashboard-hodoopforge.json
scripts/monitoring/grafana/provider.yml
```

重新安装：`bash scripts/monitoring/install_grafana_dashboard.sh`。

建议面板：

- HDFS：capacity used/free、missing blocks、live datanodes、checkpoint age
- Kafka：brokers、topic partitions、consumer lag
- Flink：job running、checkpoints completed/failed
- Ambari：alerts by state、service states
- Node：CPU/内存/磁盘/load

### 4.1 管理面指标

`management_exporter`（宿主机 `:9404`）暴露：

```text
mgmt_ambari_up
mgmt_yarn_rm_up
mgmt_mysql_primary_up
mgmt_mysql_replica_io_running / _sql_running / _lag_seconds
mgmt_container_up{name} / mgmt_container_restart_policy{name,policy}
mgmt_agent_up{host}
mgmt_hive_hms_up{host} / mgmt_hive_hs2_up{host}
mgmt_kdc_up{host}
mgmt_backup_last_success_timestamp / mgmt_backup_age_seconds
mgmt_flink_tm_count{host}
mgmt_config_drift
```

对应告警：`MgmtAmbariDown`、`MgmtAgentDown`、`MgmtContainerDown`、
`MgmtMysqlReplicaStopped`、`MgmtMysqlReplicaLagHigh`、`MgmtHiveComponentDown`、
`MgmtKdcDown`、`MgmtBackupStale`、`MgmtConfigDrift`。

## 8. 已知限制

- Prometheus 主备是**双写不聚合**：查询端一次只指向一个实例，切换用 `failover.sh`；如需统一查询/长期存储，再上 Thanos 或远程写；
- 数据只保留 15 天，无远程存储；
- 未采集 HBase/Hive/Spark 的细粒度 JMX（可后续按同样方式加 exporter）；
- 告警默认只落盘 `/var/log/hodoopforge-alerts.jsonl`；电话/IM 需设置 `ALERT_WEBHOOK_URL`。
