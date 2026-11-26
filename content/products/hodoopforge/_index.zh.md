---
title: "HodoopForge 数据湖"
description: "HodoopForge 数据湖平台 — 容器级高可用 · Kerberos 数据面 · 实时入湖 · Kafka-Flink-Iceberg 全链路"
keywords: "HodoopForge,数据湖,Iceberg,Kafka,Flink,Hadoop,Kerberos,HDFS,大数据平台,实时入湖,数据仓库"
---

## 平台定位

HodoopForge 数据湖是 qixuandata 集群的**容器级高可用数据湖底座**。它不是一组孤立组件的拼装，而是一条从业务事件到实时湖仓、再到查询与治理的完整链路：

**业务探针 → Kafka → Flink → Iceberg(-ha) → Spark/Hive → 应用/BI**

在这条链路之外，平台还提供 Kerberos 数据面、HDFS NameNode HA、Hive Metastore MySQL 主备、Prometheus 主备监控，以及每 30 秒运行的 Kerberos 防呆守护。

### 核心能力

<div class="qs-feature-grid">
  <div class="qs-feature-card">
    <div class="qs-f-icon">🌊</div>
    <h4>实时入湖</h4>
    <p>Kafka 3 broker、RF3；Flink 20 秒 checkpoint，Exactly-Once 写 Iceberg，作业 adb1b6a9879e 持续 RUNNING。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🔐</div>
    <h4>Kerberos 数据面</h4>
    <p>HDFS、HBase、Hive HMS/HS2、YARN、Flink、Kafka、Spark 已启用；MIT KDC 主备，realm HODOOPFORGE.LOCAL。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛡️</div>
    <h4>HDFS NN HA</h4>
    <p>bigtop-hostname3 Active / bigtop-hostname0 Standby，3 JournalNode、2 ZKFC、3 DataNode，nameservice qixuandata。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🧱</div>
    <h4>Iceberg -ha</h4>
    <p>77/77 湖表 Location 对齐，warehouse 统一到 hdfs://qixuandata/iceberg-warehouse-ha，旧仓库保留回滚。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛰️</div>
    <h4>可观测与值班</h4>
    <p>Prometheus 主备、12/12 targets、22 条告警规则、Alertmanager 集群；guard 与 healthcheck 纳入运维。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🤖</div>
    <h4>自动化自愈</h4>
    <p>用户级 kerberos_guard 每 30 秒运行，锁 ambari-agent、恢复配置漂移、补起数据面、保存 keytab 快照。</p>
  </div>
</div>

## 架构与链路

### 架构分层

<div class="qs-arch">
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">接入层</div>
    <div>
      <h4>业务探针 · Kafka · NAT / Hairpin</h4>
      <p>3 条业务链路（ai_inference_log / rag_query_log / answer_sample_log）；Kafka 3 broker、RF3、SASL_PLAINTEXT/GSSAPI；宿主机 DNAT 与容器 hairpin。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">计算层</div>
    <div>
      <h4>Flink · Spark ThriftServer · YARN · Hive / HMS</h4>
      <p>Flink 实时入湖；Spark 3.5.6 ThriftServer 10016 查询入口；YARN RM + 3 NM；HiveServer2 10000 与 HMS 9083。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">存储层</div>
    <div>
      <h4>HDFS NN HA · MySQL · Iceberg -ha · HBase · ZooKeeper</h4>
      <p>HDFS nameservice qixuandata；Hive Metastore MySQL 主 h0 / 异步副本 h3，RTO 1s；Iceberg 77 表；HBase 1 Master / 1 RS；ZK 3 节点。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">治理层</div>
    <div>
      <h4>edulake_meta · 质量 / 血缘 / 成本 · Freshness</h4>
      <p>资产登记 376、质量检查 391、血缘 964 行、成本 308；历史基线 41 表（35 正常 / 6 空 / 0 失败）；lake-health 与 freshness 探针。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">运维安全</div>
    <div>
      <h4>Ambari · 自动化 · Ranger · 监控 · Kerberos · KDC · Guard</h4>
      <p>Ambari 20609 security_type=KERBEROS；Ranger 策略 id 19；Prometheus 主备；MIT KDC 主备；guard 30s 锁定 agent。</p>
    </div>
  </div>
</div>

## 关键指标

| 指标 | 当前值 |
|---|---|
| 核心服务 | 7/7 UP |
| Kerberos | 7 个数据面服务已启用，KDC 主备 |
| HDFS | h3 Active / h0 Standby / 3 DataNode / 3 JN |
| Flink | 作业 RUNNING，checkpoint 408+ |
| Iceberg | 77/77 表 Location 对齐 |
| MySQL HA | 主 h0 / 副本 h3，RTO 1s，lag=0 |
| 监控 | Prometheus 12/12 targets，22 条告警规则 |
| 防呆守护 | active，ambari-agent locked，config drift 0 |

## 交接与运维原则

- **只读查看 Ambari / Prometheus / Grafana**，不从 Ambari 启停 HDFS/HBase/Hive/YARN。
- 数据面服务由 **kerberos_guard** 守护，配置漂移会恢复，keytab 有快照。
- 变更前先看 Runbook，受控执行回滚脚本，不要把密码/keytab 提交到仓库。
- 地图中的“文档”链接已接入本站技术文档中心，包含架构、当前状态、Kerberos、守护、监控、重建等 15 份交接材料。

> 状态口径：绿色 = 正常，黄色 = 注意，紫色 = 规划，灰色 = 未启用。地图节点可查看入口、指标、命令与文档。

[返回数据湖地图 ↑](#interactive-map)　　[获取方案与演示 →](/contact/)
