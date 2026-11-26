---
title: "平台技术与用户手册"
weight: 130
type: "docs"
---


> **文档编号**：HODOOPFORGE-MANUAL-001  
> **版本**：v3.1（Kerberos 数据面版）  
> **日期**：2026-11-26  
> **适用平台**：qixuandata 集群（Ambari 3.1.0 / BIGTOP 3.5.0）  
> **读者**：平台运维、数据开发、业务分析、架构评审
>
> **📚 深度文档集**：见 [`docs/manual/`](/docs/hodoopforge/readme/)（架构图/时序图/实测/故障树/价值模型）  
> **🖼️ 操作界面截图集**：见 [`docs/screenshots/`](/docs/hodoopforge/readme/)（67 张实景截图 + 无声/中文解说双版本视频）  
> **🏗️ 生产最小 HA 升级方案**：见 `PRODUCTION_HA_UPGRADE_PLAN.md`（Kafka RF3 / HDFS NN HA / HMS·Thrift HA / Flink JM HA / 安全 / 监控）  
> **✅ HA 与业务联通验收（最新）**：见 `manual/10-ha-and-business-connectivity.md`  
> **✅ HDFS NN HA 完成报告**：见 `HA_PROGRESS_REPORT_2026-11-09_HDFS_HA.md`  
> **🔐 当前架构 / Kerberos / 防呆**：见 [`ARCHITECTURE.md`](/docs/hodoopforge/architecture/)、[`KERBEROS_ENABLEMENT.md`](/docs/hodoopforge/kerberos-enablement/)、[`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/)
> **🧭 HDFS NN HA 评审/手册**：见 `HDFS_NN_HA_PLATFORM_REVIEW.md`、`HDFS_NN_HA_PLATFORM_RUNBOOK.md`

---

## 目录

1. 平台概述
2. 整体架构
3. 功能特性
4. 数据链路与业务运营流程
5. 用户使用指南
6. 运维管理指南
7. 数据治理体系
8. 安全与权限
9. 监控与可观测性
10. 价值呈现
11. 附录

---

# 1. 平台概述

## 1.1 平台定位

HodoopForge 是基于 **Apache Ambari + Bigtop** 构建的一站式大数据平台，面向教育/数据治理场景（EduLake），提供：

- **统一存储**：HDFS + Apache Iceberg 数据湖
- **统一计算**：YARN + MapReduce + Tez + Spark + Flink
- **统一数仓**：Hive 4.0.1（MySQL 元数据库）
- **实时接入**：Kafka + Flink 流式入湖
- **统一安全**：Ranger 策略 + Ranger KMS
- **统一监控**：AMS + Prometheus + Grafana

## 1.2 平台规模

| 项 | 配置 |
|---|---|
| 节点数 | 4（bigtop-hostname0~3） |
| 总内存 | 约 40GB（宿主机共享） |
| 存储 | HDFS 3 副本 |
| 部署方式 | Docker 容器 + Ambari 管理 |
| 运行模式 | **Kerberos（HDFS/HBase/Hive/YARN/Flink/Kafka/Spark）**；Ranger 授权 |

## 1.3 核心价值

| 价值维度 | 体现 |
|---|---|
| **数据融通** | 实时（Flink）+ 离线（Spark/Hive）共享同一 Iceberg warehouse |
| **降本** | 单机 4 节点跑通全栈；JVM 堆精细调优，Swap 100%→43% |
| **提效** | 秒级实时入湖；统一 SQL 入口（Spark ThriftServer/Hive） |
| **可控** | 82 项告警、Prometheus+Grafana、健康检查脚本、cron 告警 |
| **可治理** | Ranger 权限、Iceberg 小文件治理、数据分层（ODS/DWD/DWS/ADS） |

---

# 2. 整体架构

## 2.1 逻辑架构

```
┌──────────────────────────────────────────────────────────────┐
│                        应用 / 业务层                          │
│   EduLake 教学机器人 · BI · NL2SQL · 数据治理平台              │
└───────────────────────────┬──────────────────────────────────┘
                            │ JDBC / REST / Kafka
┌───────────────────────────▼──────────────────────────────────┐
│                        计算与查询层                            │
│  Spark ThriftServer · HiveServer2 · Flink · MapReduce/Tez     │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                        存储与元数据层                          │
│  HDFS（3 副本） · Apache Iceberg（hadoop catalog）             │
│  Hive Metastore（MySQL） · HBase · Kafka                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    资源与协调层                                │
│  YARN（RM/NM） · ZooKeeper（3 节点）                          │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    管理与安全层                                │
│  Ambari · Ranger Admin/Usersync/KMS · AMS · Prometheus/Grafana│
└──────────────────────────────────────────────────────────────┘
```

## 2.2 部署架构（4 节点）

| 节点 | IP | 角色 |
|---|---|---|
| **h0** | 172.19.0.2 | NameNode、ResourceManager、HBase Master、HiveServer2/Metastore、WebHCat、Ranger Admin/Usersync/KMS、Kafka Broker、Spark History、Flink JM/History、TimelineReader、Infra Solr、ZooKeeper、MySQL、Ambari Server、AMS Collector、Grafana |
| **h1** | 172.19.0.5 | DataNode、NodeManager、SecondaryNameNode、AppTimelineServer、Spark ThriftServer、ZooKeeper |
| **h2** | 172.19.0.3 | DataNode、NodeManager、Flink TaskManager、ZooKeeper |
| **h3** | 172.19.0.4 | DataNode、NodeManager、HBase RegionServer、HDFS Router、Ranger Tagsync、Flink TaskManager |

> 设计原则：**h0 承担控制面与管理类服务**，h1-h3 承担数据面与计算。

## 2.3 数据流架构

### 实时链路（当前生产）

```
业务应用(192.168.0.168)
   │ 生产 JSON
   ▼
Kafka: ai_inference_log / rag_query_log (各 3 分区)
   │ Flink Kafka Source (group-offsets, Exactly-Once)
   ▼
Flink 1.20.1（JM@h0 + TM@h2/h3，4 slots，Asia/Shanghai）
   │ hadoop catalog 写
   ▼
Iceberg ODS: edulake_ai.ods_llm_inference_log
             edulake_knowledge.ods_rag_query_log
   │ Spark 批处理（DWD/DWS/ADS）
   ▼
Spark ThriftServer(10016) · Hive(10000) · BI
```

### 离线链路

```
业务库/文件 → HDFS（/apps、/data）→ Hive/Spark ETL → Iceberg DWD/DWS/ADS → 报表/BI
```

## 2.4 技术栈版本

| 组件 | 版本 | 说明 |
|---|---|---|
| Ambari | 3.1.0.0 | 管理平台 |
| Bigtop | 3.5.0 | 栈定义 |
| Hadoop | 3.3.6 | HDFS/YARN/MR |
| Hive | 4.0.1 | 元数据库 MySQL |
| Spark | 3.5.6 | ThriftServer 为查询入口 |
| Flink | 1.20.1 | Standalone，2 TM × 2 slots |
| Kafka | 3.4.1 | 单 broker，3 分区 |
| Iceberg | 1.11.0 | Spark/Flink runtime 对齐 |
| HBase | 2.6.x | Master@h0、RS@h3 |
| Ranger | 2.7.0 | Admin/Usersync/Tagsync/KMS |
| ZooKeeper | 3.8.4 | 3 节点 |
| Infra Solr | 8.x | Ranger 审计 |
| Prometheus | 2.54.1 | 抓取 Flink 9249 |
| Grafana | AMS 版 | Flink Dashboard |

---

# 3. 功能特性

## 3.1 存储层

### HDFS（分布式文件系统）

| 能力 | 说明 |
|---|---|
| 容量 | 3 DataNode，3 副本 |
| 高可用 | 单 NameNode + SecondaryNameNode（非 HA） |
| 联邦 | h3 HDFS Router（Federation，挂载表为空） |
| 访问 | `hdfs dfs`、WebHDFS、REST（50070） |
| 适用 | 原始数据、Iceberg 数据文件、checkpoint |

### Apache Iceberg（数据湖表格式）

| 能力 | 说明 |
|---|---|
| 表格式 | v2，Parquet + zstd |
| 元数据 | hadoop catalog（`/iceberg-warehouse`） |
| 分区 | `dt`（按日期） |
| 特性 | 快照、时间旅行、Schema 演进、隐藏分区 |
| 引擎 | Spark（读写/维护）、Flink（写 ODS） |
| 库 | edulake_ai / knowledge / learning / meta / governance / models / pronunciation / user |

## 3.2 计算层

| 组件 | 能力 | 使用场景 |
|---|---|---|
| **YARN** | 资源调度、队列 | 所有批处理/流处理作业的资源管理 |
| **MapReduce** | 批处理 | 遗留作业、示例 |
| **Tez** | DAG 执行引擎 | Hive 加速 |
| **Spark** | 内存计算、SQL、流 | 数仓 ETL、交互查询（ThriftServer） |
| **Flink** | 流处理、Exactly-Once | 实时入湖 |

## 3.3 数据仓库

| 能力 | 说明 |
|---|---|
| HiveServer2 | JDBC/Beeline（10000），Hive 4.0.1 |
| Metastore | MySQL 后端（9083） |
| 分层 | ODS → DWD → DWS → ADS |
| 表格式 | 内部表/外部表 + Iceberg 表 |
| 引擎切换 | `hive.execution.engine=mr/tez/spark` |

## 3.4 数据库（HBase）

| 能力 | 说明 |
|---|---|
| Master | h0（16000/16010） |
| RegionServer | h3（16020/16030） |
| 访问 | HBase Shell、Java API、REST |
| 适用 | 随机读写、稀疏列、时序点查 |

## 3.5 消息（Kafka）

| 能力 | 说明 |
|---|---|
| Broker | h0（9092） |
| Topic | ai_inference_log、rag_query_log、learning_events、edulake_dlq 等 |
| 分区 | 每 topic 3 分区，RF=1 |
| 压缩 | lz4 |
| 消费 | Flink（生产）、Python bridge（已停）、调试 |

## 3.6 流处理（Flink）

| 能力 | 配置 |
|---|---|
| 模式 | Standalone Session |
| JM | h0（8081/6123），1024m |
| TM | h2/h3，各 2 slots × 2048m |
| Checkpoint | 60s，EXACTLY_ONCE，RocksDB |
| 状态目录 | `hdfs:///flink-checkpoints/edulake` |
| 时区 | Asia/Shanghai |
| 作业 | edulake-realtime-ingest ×2（RUNNING） |
| 指标 | Prometheus reporter（9249） |

## 3.7 协调（ZooKeeper）

3 节点仲裁（h0/h1/h2:2181），为 HBase/Kafka/YARN/HDFS HA 提供协调。

## 3.8 安全（Ranger）

| 组件 | 能力 |
|---|---|
| Ranger Admin | 策略管理（6080） |
| Usersync | 用户/组同步（5151） |
| Tagsync | 标签同步（h3） |
| KMS | 密钥管理（9292） |
| 插件 | HDFS/Hive/HBase/Kafka |

## 3.9 搜索（Infra Solr）

Ranger 审计日志存储（8886）。

## 3.10 监控

| 组件 | 能力 |
|---|---|
| Ambari | 服务/主机/告警管理（20609） |
| AMS | 指标采集（collector 6188 + 4 monitor） |
| Prometheus | Flink 指标抓取（9090） |
| Grafana | Flink Dashboard（3000） |
| cron | 每 10 分钟健康检查告警 |

---

# 4. 数据链路与业务运营流程

## 4.1 实时链路（已上线）

| 环节 | 组件 | 说明 |
|---|---|---|
| 1. 生产 | 业务应用 → Kafka | JSON 消息，lz4 压缩 |
| 2. 消费 | Flink Kafka Source | `group-offsets`，断点续传 |
| 3. 转换 | Flink SQL | 主键 `ai_<p>_<o>`，时区 Asia/Shanghai |
| 4. 写入 | Iceberg Sink | EXACTLY_ONCE，checkpoint 提交 |
| 5. 查询 | Spark ThriftServer | 下游 DWD/DWS/ADS |

**SLA**：新消息 **≤60s**（受 checkpoint 间隔影响）进入 ODS。

## 4.2 离线链路

| 环节 | 组件 |
|---|---|
| 采集 | HDFS / Sqoop / 文件上传 |
| 存储 | HDFS + Iceberg |
| 计算 | Spark SQL / Hive |
| 输出 | ADS 表 → BI/报表 |

## 4.3 业务运营流程

### 4.3.1 新业务接入

```
需求提出 → 资源评估 → 库表设计（分层） → 权限申请（Ranger）
        → 开发（Spark/Hive/Flink） → 测试 → 上线 → 监控
```

### 4.3.2 变更管理

| 变更类型 | 流程 |
|---|---|
| 表结构 | 评审 → Iceberg Schema 演进（兼容变更） → 通知下游 |
| 作业 | 测试环境验证 → 低峰窗口 → 灰度 |
| 配置 | Ambari 配置中心 → 记录 CHANGELOG → 重启验证 |

### 4.3.3 日常巡检

| 频率 | 内容 |
|---|---|
| 每日 | 告警检查、作业状态、Kafka lag、ODS 增长 |
| 每周 | Iceberg 小文件治理、checkpoint 历史、磁盘 |
| 每月 | 容量评估、权限复核、备份校验 |

### 4.3.4 故障处理

见第 6 章。

---

# 5. 用户使用指南

## 5.1 接入方式

| 服务 | 地址 | 凭据 |
|---|---|---|
| Ambari | `http://192.168.0.60:20609` | admin/admin |
| Spark ThriftServer | `jdbc:hive2://192.168.0.60:10016/default;transportMode=binary` | 无认证 |
| HiveServer2 | `jdbc:hive2://192.168.0.60:10000/default` | hive |
| HDFS Web UI | `http://192.168.0.60:50070` | — |
| YARN UI | `http://192.168.0.60:8088` | — |
| HBase UI | `http://192.168.0.60:16010` | — |
| Kafka | `192.168.0.60:9092`（容器内用 FQDN） | — |
| Flink UI | `http://192.168.0.60:8081` | — |
| Grafana | `http://192.168.0.60:3000` | admin/Admin1234! |
| Prometheus | `http://192.168.0.60:9090` | — |
| Ranger Admin | `http://192.168.0.60:6080` | admin/Admin1234! |

## 5.2 开发规范

### 5.2.1 命名规范

| 对象 | 规范 | 示例 |
|---|---|---|
| 数据库 | `edulake_<域>` | edulake_ai、edulake_knowledge |
| 表分层 | `ods_/dwd_/dws_/ads_` 前缀 | ods_llm_inference_log |
| 分区 | `dt`（yyyy-MM-dd） | dt=2026-11-03 |
| Kafka topic | 小写+下划线 | ai_inference_log |
| 主键 | 业务前缀+分区+offset | ai_0_123 |

### 5.2.2 表设计规范

- **ODS**：贴源，保留原始字段，按 `dt` 分区
- **DWD**：清洗、标准化、去重
- **DWS**：轻度汇总（按主题/维度）
- **ADS**：面向应用的结果表
- Iceberg 表：`format-version=2`、`write.parquet.compression-codec=zstd`

### 5.2.3 写入约束

| 层 | 唯一写入方 | 说明 |
|---|---|---|
| ODS | **Flink** | 禁止 Spark/人工写入 |
| DWD/DWS/ADS | **Spark** | 禁止 Flink 写入 |
| 单写者 | 必须 | hadoop catalog 无分布式锁 |

## 5.3 使用示例

### 5.3.1 Spark SQL（推荐入口）

```bash
beeline -u 'jdbc:hive2://192.168.0.60:10016/default;transportMode=binary' -n spark
```

```sql
-- 查询 ODS
SELECT dt, count(*) FROM iceberg.edulake_ai.ods_llm_inference_log GROUP BY dt;

-- 建 DWD 表
CREATE TABLE iceberg.edulake_ai.dwd_llm_inference_clean
USING iceberg PARTITIONED BY (dt)
AS SELECT * FROM iceberg.edulake_ai.ods_llm_inference_log WHERE response_ok;
```

### 5.3.2 Hive

```bash
beeline -u 'jdbc:hive2://192.168.0.60:10000/default' -n hive
```

```sql
SHOW DATABASES;
SELECT * FROM edulake_ai.ods_llm_inference_log LIMIT 10;
```

### 5.3.3 Flink SQL

```bash
/usr/lib/flink/bin/sql-client.sh
```
```sql
CREATE CATALOG iceberg WITH (
  'type'='iceberg','catalog-type'='hadoop',
  'warehouse'='hdfs://bigtop-hostname0.bigtop.apache.org:8020/iceberg-warehouse',
  'hadoop-conf-dir'='/etc/hadoop/conf');
SELECT count(*) FROM iceberg.edulake_ai.ods_llm_inference_log;
```

### 5.3.4 Kafka

```bash
# 生产
kafka-console-producer.sh --bootstrap-server 192.168.0.60:9092 --topic ai_inference_log
# 消费
kafka-console-consumer.sh --bootstrap-server 192.168.0.60:9092 \
  --topic ai_inference_log --from-beginning --max-messages 1
```

### 5.3.5 HDFS

```bash
hdfs dfs -ls /iceberg-warehouse
hdfs dfs -put local.csv /data/
hdfs dfs -cat /data/local.csv
```

### 5.3.6 HBase

```bash
hbase shell
> status
> list
> scan 'table', {LIMIT=>5}
```

## 5.4 权限申请

1. 明确库/表、操作类型（SELECT/INSERT/ALL）
2. 提交 Ranger 策略申请（Admin 6080）
3. 平台审核 → 生效（当前 Ranger 为 allow-all，待收敛）

---

# 6. 运维管理指南

## 6.1 日常巡检

### 6.1.1 一键健康检查

```bash
# 平台整体
bash ambari3/scripts/flink-health-check.sh

# 检查项：作业、TM/slots、checkpoint、Kafka lag、bridge、重复
```

### 6.1.2 关键检查清单

| 项 | 命令/入口 | 期望 |
|---|---|---|
| 服务 | Ambari UI | 12 STARTED |
| 告警 | Ambari | 非 OK = 0 |
| 主机 | Ambari | 4 HEALTHY |
| HBase | 16000/16020 | LISTEN |
| Flink 作业 | 8081 | 2 RUNNING |
| checkpoint | 8081 | 持续成功 |
| Kafka lag | consumer-groups | 0 |
| ODS 重复 | SQL | 0 |
| 内存/Swap | free | avail >8GB, swap <80% |

## 6.2 监控与告警

| 层 | 工具 | 指标 |
|---|---|---|
| 平台 | Ambari | 服务/主机/组件告警（82 项） |
| 指标 | AMS | 主机 CPU/内存/磁盘/网络 |
| 流作业 | Prometheus | Flink numRecordsIn/Out、checkpoint |
| 可视化 | Grafana | Flink Dashboard |
| 兜底 | cron | 每 10 分钟健康检查 → `/tmp/flink-health.log` |

## 6.3 变更管理

- 配置变更：Ambari 配置中心（注意 `content` 硬编码模板）
- 变更记录：`func/CHANGELOG.md`
- 重启策略：低峰窗口，验证端口/告警
- 回滚：保留旧配置版本 / checkpoint / bridge

## 6.4 故障处理

| 故障 | 排查 | 处理 |
|---|---|---|
| 服务 INSTALLED | 进程/端口 | Ambari 重启；检查 PID 文件 |
| HBase Abort | 日志 ZK SessionExpired | 重启 Master/RS（避免单独重启 ZK） |
| 作业 RESTARTING | Flink UI exceptions | 检查 lib 一致性/类冲突 |
| 主键重复 | 检查 bridge | 停 bridge |
| AMS 6188 不通 | PID 僵尸 | 清理 PID → 重启 collector |
| 告警误报 | 内存/Swap | 调优堆、查心跳超时 |

## 6.5 备份与回滚

| 对象 | 方式 |
|---|---|
| Iceberg 数据 | 快照（时间旅行） |
| 配置 | Ambari 配置版本 + `/root/jvm-config-backup-*` |
| Flink 状态 | checkpoint（`/flink-checkpoints/edulake`） |
| bridge 回滚 | 消费组 offset 保留 7 天 |

---

# 7. 数据治理体系

## 7.1 元数据管理

- Hive Metastore（MySQL）管理库表元数据
- Iceberg 表元数据在 HDFS `metadata/`
- 数据分层：ODS/DWD/DWS/ADS
- 表注释、字段注释规范

## 7.2 数据质量

| 维度 | 措施 |
|---|---|
| 完整性 | 主键非空、必填字段校验 |
| 唯一性 | `log_id/query_id` 幂等主键 |
| 一致性 | 时区统一 Asia/Shanghai |
| 及时性 | 实时链路 ≤60s |
| 准确性 | 下游对账（行数/金额） |

## 7.3 安全与权限

- Ranger 策略（HDFS/Hive/HBase/Kafka）
- Ranger KMS 密钥管理
- Kerberos 已启用（数据面）；ZK/Ranger/KMS/TLS 待后续
- 建议：库表级授权、字段掩码（P1）

## 7.4 生命周期与小文件治理

```bash
# 每周执行
bash ambari3/scripts/iceberg-maintenance.sh --dry-run   # 先看
bash ambari3/scripts/iceberg-maintenance.sh             # 合并+过期
```

- `rewrite_data_files`：合并小文件（目标 128MB）
- `expire_snapshots`：保留最近 3 个、清理 7 天前

## 7.5 数据标准

- 时间：统一 Asia/Shanghai，`dt` 分区
- 金额：decimal(18,2)
- 用户标识：哈希（不存原始 ID）
- 编码：UTF-8

---

# 8. 安全与权限

| 层 | 措施 |
|---|---|
| 网络 | NAT 端口转发（V2.6，9092/9083/8020 等） |
| 认证 | Kerberos（KDC h0/h3，服务 keytab + 客户端 kinit） |
| 授权 | Ranger 插件（HDFS/Hive/HBase/Kafka） |
| 加密 | Ranger KMS（HDFS 透明加密可选） |
| 审计 | Ranger 审计 → Infra Solr |
| 主机 | SSH/防火墙（外部访问受控） |

---

# 9. 监控与可观测性

## 9.1 指标来源

| 来源 | 指标 | 端口 |
|---|---|---|
| Ambari | 服务/主机/组件 | 20609 |
| AMS | 主机指标（CPU/内存/磁盘/网络） | 6188 |
| Flink | 作业/算子/checkpoint/JVM | 9249 |
| Kafka | lag/offset | 9092 |
| Prometheus | 聚合 Flink | 9090 |
| Grafana | 可视化 | 3000 |

## 9.2 告警分级

| 级别 | 示例 | 响应 |
|---|---|---|
| P0 | 服务宕机、作业全挂 | 立即 |
| P1 | checkpoint 失败、lag 高 | 30 分钟 |
| P2 | 小文件多、磁盘 70% | 当日 |
| P3 | 配置漂移、文档过期 | 本周 |

## 9.3 关键指标阈值

| 指标 | 阈值 |
|---|---|
| Kafka lag | >10000 或 5 分钟 >1000 |
| checkpoint 失败 | 10 分钟内 >0 |
| 无输入 | 15 分钟 numRecordsIn 无增长 |
| 磁盘 | >80% |
| Swap | >80% |

---

# 10. 价值呈现

## 10.1 业务价值

| 场景 | 价值 |
|---|---|
| 教学机器人实时分析 | LLM/RAG 日志秒级入湖，支撑实时看板 |
| 数据治理 | 统一 ODS/DWD/DWS/ADS，口径一致 |
| 数据融通 | 实时+离线共享 Iceberg，避免孤岛表 |
| 安全合规 | Ranger 权限 + 审计 |

## 10.2 效率提升

| 指标 | 提升 |
|---|---|
| 实时入湖延迟 | 从微批 10s+ 到 **≤60s（Exactly-Once）** |
| 数据一致性 | 主键幂等，重复率 0 |
| 运维效率 | 一键健康检查、自动告警、脚本化治理 |
| 故障恢复 | checkpoint 恢复；bridge 回滚预案 |

## 10.3 成本与资源

| 项 | 现状 |
|---|---|
| 硬件 | 单机 4 容器，40GB 内存 |
| JVM 调优 | h0 used 33.7→28.5GB，Swap 100%→43% |
| 存储 | 3 副本，Iceberg 小文件定期合并 |
| 许可 | 全开源（Apache） |

## 10.4 可扩展性

- 水平扩展：增加 DataNode/NodeManager
- 计算扩展：Flink TM、Spark executor
- 存储扩展：Iceberg 分区/分桶
- 高可用：NN/RM/HBase Master HA（规划）

## 10.5 成熟度评估

| 维度 | 等级 |
|---|---|
| 功能完整性 | ★★★★☆ |
| 实时能力 | ★★★★☆ |
| 数据治理 | ★★★☆☆ |
| 可观测性 | ★★★★☆ |
| 高可用 | ★★☆☆☆（单点） |
| 安全 | ★★★★☆（Kerberos + Ranger；ZK/Ranger/KMS/TLS 待完善） |

---

# 11. 附录

## 11.1 端口清单

| 服务 | 端口 | 节点 |
|---|---|---|
| Ambari | 20609(→8080) | 宿主机/h0 |
| HDFS NN | 8020/50070 | h0 |
| DataNode | 50010/50075 | h1/h2/h3 |
| YARN RM | 8088 | h0 |
| NodeManager | 8042 | h1/h2/h3 |
| HBase Master | 16000/16010 | h0 |
| HBase RS | 16020/16030 | h3 |
| HiveServer2 | 10000 | h0 |
| Hive Metastore | 9083 | h0 |
| Spark Thrift | 10016 | h1 |
| Spark History | 18081 | h0 |
| Flink JM | 8081/6123 | h0 |
| Flink Metrics | 9249 | h0/h2/h3 |
| Kafka | 9092 | h0 |
| ZooKeeper | 2181 | h0/h1/h2 |
| Ranger Admin | 6080 | h0 |
| Ranger KMS | 9292 | h0 |
| Infra Solr | 8886 | h0 |
| AMS Collector | 6188 | h0 |
| Prometheus | 9090 | 宿主机 |
| Grafana | 3000 | h0 |
| TimelineReader | 8198 | h0 |
| MR History | 19888 | h0 |

## 11.2 组件分布

见 2.2 节。

## 11.3 关键配置文件

| 文件 | 说明 |
|---|---|
| `/etc/hadoop/conf/*` | HDFS/YARN/MR |
| `/etc/hive/conf/hive-site.xml` | Hive（MySQL 元数据） |
| `/etc/hbase/conf/hbase-env.sh` | HBase 堆 |
| `/etc/flink/conf/flink-conf.yaml` | Flink（Ambari content 渲染） |
| `/etc/kafka/conf/server.properties` | Kafka |
| `/etc/ranger-admin/conf/` | Ranger |
| `/etc/ambari-metrics-collector/conf/` | AMS |
| `/home/rkam/prometheus/prometheus.yml` | Prometheus |

## 11.4 运维脚本

| 脚本 | 用途 |
|---|---|
| `ambari3/scripts/flink-health-check.sh` | Flink 9 项健康检查 |
| `ambari3/scripts/flink-alert-cron.sh` | cron 告警（每 10 分钟） |
| `ambari3/scripts/iceberg-maintenance.sh` | Iceberg 小文件/快照治理 |
| `ambari3/scripts/setup-nat-forward.sh` | NAT 端口转发（V2.6） |

## 11.5 术语表

| 术语 | 含义 |
|---|---|
| ODS | 操作数据存储（贴源层） |
| DWD | 数据仓库明细层 |
| DWS | 数据仓库汇总层 |
| ADS | 应用数据层 |
| Exactly-Once | 精确一次语义 |
| Checkpoint | Flink 状态快照 |
| Catalog | Iceberg 元数据目录 |
| 逻辑主键 | 业务约定唯一键（Iceberg 无物理主键） |

## 11.6 常见问题

| 问题 | 答案 |
|---|---|
| 为什么用 hadoop catalog 而非 HiveCatalog？ | Hive 4.0.1 HMS 移除 `get_table_objects_by_name`，Iceberg HiveCatalog 不可用 |
| 为什么 ODS 只能 Flink 写？ | hadoop catalog 无分布式锁，多写者会冲突/重复 |
| 实时延迟多少？ | ≤60s（checkpoint 间隔） |
| 如何新增实时链路？ | 建 Kafka topic → Flink SQL → ODS 表（遵循主键/时区规范） |
| 如何查历史版本？ | Iceberg 时间旅行：`SELECT * FROM t VERSION AS OF <snapshot>` |

---

**文档维护**：平台组 / 每季度评审  
**关联文档**：`docs/FLINK_OPS_RUNBOOK.md`、`func/*`、`bugtrace/*`、`uttest/*`
