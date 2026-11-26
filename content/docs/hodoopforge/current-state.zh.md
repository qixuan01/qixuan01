---
title: "当前状态"
weight: 20
type: "docs"
---


> 最后更新：2026-11-25
> 交互地图：[`lake-map.html`](/maps/hodoopforge-lake-map.html) · 数据：[`lake-map-data.json`](/maps/lake-map-data.json)
> 测试与 CI：`TEST_STRATEGY.md` · `CI_CD.md`

## 1. 拓扑

| 容器 | IP | 主要角色 |
|---|---|---|
| bigtop_hostname0 | 172.19.0.2 | NameNode(Standby)、RM、HBase Master、Hive HS2/HMS、Ranger、Flink JM1、Kafka 1001、ZK、Ambari、KDC、MySQL 主 |
| bigtop_hostname1 | 172.19.0.5 | Spark ThriftServer、HMS、DataNode、NodeManager、ZK、JN、Flink JM2、监控主 |
| bigtop_hostname2 | 172.19.0.3 | Kafka 1002、DataNode、NodeManager、ZK、Flink TM |
| bigtop_hostname3 | 172.19.0.4 | NameNode(Active)、HBase RS、HS2、MySQL 副本、DataNode、NodeManager、JN、ZKFC、Kafka 1003、Flink TM、KDC 备 |

## 2. 高可用

| 项 | 当前状态 |
|---|---|
| HDFS | **h3 Active / h0 Standby**，3 JN、2 ZKFC、3 DataNode、0 missing blocks；DN 用 `/etc/hadoop/conf-dn` |
| Kafka | 3 broker（1001/1002/1003），**SASL_PLAINTEXT/GSSAPI 已启用**；RF3、`min.insync.replicas=2` 不变 |
| HBase | HMaster 16000 / RegionServer 16020；**手工 Kerberos 认证**（`hbase/_HOST` + keytab），`zookeeper.znode.parent=/hbase`；Ranger 授权未 Kerberos 化 |
| Hive | **HMS h0/h1**、**HS2 h0/h3**；LMS/HS2 已切 Kerberos（`hive.service.keytab`）；HS2 ZK 动态发现临时关闭，客户端需 kinit 并指定 principal |
| MySQL | h0 主 / h3 异步副本（`read_only`，延迟 0）；提升脚本 `mysql_failover.sh` |
| Spark | ThriftServer h1:10016 **Kerberos**（`spark.service.keytab`）；beeline `select 1` 成功；YARN `usercache/spark` 权限已修复 |
| Flink | **JM1/JM2 Kerberos**（`flink.headless.keytab` + `zookeeper.sasl.disable=true`）；作业 `adb1b6a9…` RUNNING，Kafka SASL JAR，checkpoint 20s；从 savepoint `savepoint-9fca7e-f2470dcefd23` 恢复 |
| 外部 Kafka | `192.168.0.60:9092/9093/9094`，advertised 已统一 |
| 监控 | Prometheus 主 `192.168.0.60:9090` / 备 `:19090`（各 12/12 targets）、Alertmanager 主 `:19093` / 备 `:29093`（集群去重）、统一查询代理 `:19099`、23 条规则 |

> 快照/挂起会导致 ZK 会话过期，ZKFC 可能重新选主；需要 h0 Active 时执行
> `hdfs haadmin -failover nn2 nn1`，并用 `hdfs haadmin -getAllServiceState` 复核。

## 3. 存储与仓库

| 项 | 当前状态 |
|---|---|
| nameservice | `hdfs://qixuandata` |
| 业务 catalog | Spark `iceberg` → `hdfs://qixuandata/iceberg-warehouse-ha` |
| Flink warehouse | `hdfs://qixuandata/iceberg-warehouse-ha` |
| 表对齐 | **77/77 Location = `-ha`，0 misaligned** |
| 旧仓库 | `/iceberg-warehouse` 保留，作为回滚副本 |
| 对齐检查 | `python3 datalake/tools/check_lake_alignment.py` |

## 4. 数据与治理

| 表 | 行数 |
|---|---|
| `edulake_meta.asset_registry` | 376 |
| `edulake_meta.data_quality_check` | 391 |
| `edulake_meta.data_lineage` | 964 |
| `edulake_meta.cost_daily` | 308 |
| `edulake_meta.governance_action_log` | 12 |
| `edulake_meta.rag_answer_samples` | 21 |

- 业务验收：`lake-health.available=true`、`freshness.status=ok`（0.1h）
- 质量检查：41 表，35 正常 / 6 空 / 0 失败（dt=11-18）
- 流式 ODS 最新事件：2026-11-19 00:35
- **待业务侧执行**：在 `-ha` catalog 上重跑 `run_daily_etl.sh 2026-11-18` 与 11-09 补跑，补齐批处理差异（`dwd_conversation_messages` 旧 2564 / 新 2231）

## 5. 运维与自动化

| 单元 | 状态 |
|---|---|
| `hodoopforge-postsnapshot.service` | enabled（开机执行 `--all`） |
| `hodoopforge-healthcheck.timer` | active（每 10 分钟 `--check`） |
| `hodoopforge-watchdog.timer` | **已停止**（手工 Kerberos 模式） |
| `hodoopforge-kerberos-guard.timer` | **用户级 systemd，active**；锁 ambari-agent、恢复 Kerberos 配置、补起数据面；详见 [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/) |
| `hodoopforge-logclean.timer` | active（每日 03:30，清理 14 天前轮转日志） |
| `hodoopforge-nat.service` | enabled（开机 refresh NAT） |
| `hodoopforge-containers.service` | enabled（开机 `docker start` 现有容器，**禁止 compose up**） |
| `hodoopforge-mgmt-exporter.service` | active（宿主机 `:9404`，管理面指标） |
| 容器 restart policy | 4 个容器均为 `unless-stopped` |
| `mysqld` / `ambari-server` / `ambari-agent` | h0 已 enabled；4 节点 agent 已 enabled |
| `hodoopforge-backup.timer` | active（每日 02:30，ionice/nice 限流备份控制面） |
| `flink-jobmanager-2.service` | h1 上 enabled（Flink JM2，ZK 选主） |
| `ambari-metrics-grafana.service` | h0 上 enabled（Grafana + HodoopForge 面板） |

- 管理模型：`docs/MANAGEMENT_MODEL.md`；优化计划：`docs/MANAGEMENT_IMPROVEMENT_PLAN.md`
- 配置漂移：`python3 scripts/config_drift_check.py`
- 快照后手动：`bash scripts/post_snapshot_recover.sh --all`
- 30 秒守护：`KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos python3 scripts/kerberos_guard.py status`
- 只巡检：`bash scripts/post_snapshot_recover.sh --check`
- 日志：`/var/log/hodoopforge-healthcheck.log`、`/var/log/hodoopforge-postsnapshot.log`、`/var/log/hodoopforge-logclean.log`

## 6. 告警与已知风险

| 项 | 状态 |
|---|---|
| Ambari 告警 | Agent 被 guard 锁定，Ambari 告警计数可能滞后；以直接端口/Kerberos 探针为准 |
| 快照/重启风险 | 快照仍会发 SIGTERM，由 `kerberos_guard`（30s）兜底；宿主机重启由 `hodoopforge-containers.service` + 管理面自启 + post-snapshot 恢复 |
| Ambari 凭据 | `admin` 密码已于 2026-11-20 轮换；脚本统一读 `/etc/hodoopforge/ambari.env`（root 600），仓库不保存密码 |
| Prometheus | 主备双实例 + 统一查询代理；各 **12/12 targets**、23 条规则（含管理面），详见 [`MONITORING_PROMETHEUS.md`](/docs/hodoopforge/monitoring-prometheus/) |
| 时间同步 | 4 节点真实 chronyd（`hodoopforge-chronyd`），偏移 <1ms |
| Kerberos | **HDFS/HBase/Hive/YARN/Flink/Kafka/Spark 已 Kerberos**；Ambari `security_type=KERBEROS`（2026-11-26）；`ambari-agent` 由 guard 锁定以防覆盖手工配置；详见 [`KERBEROS_ENABLEMENT.md`](/docs/hodoopforge/kerberos-enablement/) / [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/) |
| Hive/MySQL HA | 详见 [`HIVE_MYSQL_HA.md`](/docs/hodoopforge/hive-mysql-ha/)；MySQL 提升后需手工改 JDBC URL |
| 管理面演练 | 2026-11-24：控制面恢复 RTO **128s**；MySQL 提升 **1s**、回切 **2s**；备份已含 ZK 快照 + HDFS fsimage；详见 [`REBUILD_RUNBOOK.md`](/docs/hodoopforge/rebuild-runbook/) |
| 持久化卷（M-101） | 🔴 h2 试点 70GB commit 过慢（29min/8GB），已回滚；改为软件-only 镜像 + 小状态卷，详见 `M-101_PILOT_REPORT.md` |
| Ambari 收口 | `security_type=KERBEROS`；`cluster-env/security_enabled=true`；`kerberos-env/realm=HODOOPFORGE.LOCAL`。`ambari-agent` 仍由 guard 锁定，未做 agent 管理式重启；`cluster-env/kerberos_domain` 仍是 `EXAMPLE.COM`（仅 DB 元数据，未下发到磁盘） |
| 磁盘 | 约 69%（287G/421G，135G 可用）；WARNING 70%，CRITICAL 85% |
| HDFS 审计日志 | 已设置 `MaxBackupIndex=14`（重启后生效）+ 每日 03:30 自动清理 |
| NVMe I/O timeout（BUG-043） | OPEN，硬件侧排查 |
| Kerberos / TLS | Kerberos 已启用（HDFS/HBase/Hive/YARN/Flink/Kafka/Spark）；TLS 未启用 |


## 7. 手工 Kerberos 模式硬约束（2026-11-26）

- **不要通过 Ambari 启动 HDFS/HBase/Hive/YARN**：Ambari DB 里仍是 simple
  配置，启动会用 simple 覆盖手工 Kerberos 配置。当前服务是手工启动的。
- `hodoopforge-watchdog.timer` 已停止；恢复前必须先改探活逻辑（kinit）。
- HDFS DN 使用显式 FQDN principal；NN/JN 用 `_HOST`；web 仍是 simple。
- Hive HS2 的 ZK 动态发现已关闭，客户端需连接
  `jdbc:hive2://<host>:10000/;principal=hive/<host>@HODOOPFORGE.LOCAL`。
- HBase/Hive/YARN 的 Ranger 授权/KMS 尚未 Kerberos 化，日志会有 401/404，
  但超级用户路径可用。
- 回滚：HDFS 用 `scripts/kerberos_hdfs_enable.sh rollback`；其余恢复
  `*.simple.bak` 后重启并用 Ambari `STARTED` 收口。
- 防呆守护：`scripts/kerberos_guard.py`，见 [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/)；
  守护只读检查宿主 watchdog，**不调用宿主 systemctl stop/disable**，不会触发 polkit 密码弹窗。


## 8. 常用检查

```bash
hdfs haadmin -getAllServiceState
hdfs dfsadmin -report | grep -E 'Live datanodes|Missing blocks'
python3 datalake/tools/check_lake_alignment.py
curl -s http://172.19.0.2:8081/jobs/overview
bash scripts/post_snapshot_recover.sh --check
```
