---
title: "HodoopForge Data Lake"
description: "HodoopForge Data Lake Platform — Container-level HA · Kerberos Data Plane · Real-time Lakehouse · Kafka-Flink-Iceberg Full Stack"
seoTitle: "HodoopForge Data Lake · Container-grade HA Lakehouse"
seoDescription: "HodoopForge Data Lake delivers Kafka to Flink to Iceberg real-time ingestion, a Kerberos data plane, HDFS NameNode HA, Spark/Hive queries, Prometheus monitoring and 77 aligned lake tables."
seoKeywords: "HodoopForge,Data Lake,Lakehouse,Real-time Ingestion,Kafka,Flink,Iceberg,Kerberos,HDFS NameNode HA,Hadoop,Spark,Hive,Data Governance,Container HA"
keywords: "HodoopForge,Data Lake,Iceberg,Kafka,Flink,Hadoop,Kerberos,HDFS,Big Data Platform,Real-time Ingestion,Data Warehouse"
ogImage: "images/hadoopforge-platform.jpg"
schemaType: "SoftwareApplication"
applicationCategory: "BusinessApplication"
operatingSystem: "Linux, Docker"
softwareVersion: "2026-11-26"
featureList:
  - "Container-grade HA and HDFS NameNode HA"
  - "Kafka to Flink to Iceberg real-time ingestion"
  - "Kerberos data plane and guard protection"
  - "77 aligned Iceberg lake tables"
  - "Spark/Hive queries and Prometheus monitoring"
  - "Operations runbooks and automated self-healing"
faq:
  - q: "What is HodoopForge Data Lake?"
    a: "HodoopForge Data Lake is a container-grade, highly available lakehouse foundation with Kafka to Flink to Iceberg real-time ingestion, Spark/Hive queries, a Kerberos data plane, HDFS NameNode HA and Prometheus monitoring."
  - q: "How is it different from CDH or a traditional Ambari cluster?"
    a: "HodoopForge targets the Apache Bigtop 3.5.0 ecosystem and uses Ambari 3.0.0 for management, while a Kerberos guard locks the data-plane configuration. It does not depend on Cloudera commercial editions and supports domestic IT stacks."
  - q: "How does Kerberos protect data?"
    a: "HDFS, HBase, Hive, YARN, Flink, Kafka and Spark have Kerberos enabled. MIT KDC runs primary/standby with service keytabs and client kinit, and the guard detects and restores configuration drift every 30 seconds."
  - q: "How does HDFS NameNode HA work?"
    a: "bigtop-hostname3 is Active and bigtop-hostname0 is Standby, with 3 JournalNodes, 2 ZKFC and 3 DataNodes under nameservice qixuandata, supporting automatic failover and manual rollback."
  - q: "How does Iceberg keep lake tables consistent?"
    a: "All 77 lake table locations are aligned. Flink uses a single writer, exactly-once and 20-second checkpoints, with ACID snapshots for traceability and the old warehouse retained for rollback."
  - q: "What query and monitoring capabilities are included?"
    a: "Spark ThriftServer 10016, HiveServer2 10000 and HMS 9083 are available. Prometheus runs primary/standby with 12/12 targets, 22 alert rules and an Alertmanager cluster."
---

## What It Is

HodoopForge Data Lake is the **container-grade, highly available lakehouse foundation** of the qixuandata cluster. It is not a bundle of isolated components, but one complete chain from business events to a real-time lakehouse, queries and governance:

**Business probes → Kafka → Flink → Iceberg(-ha) → Spark/Hive → Apps/BI**

Around that chain, the platform provides a Kerberos data plane, HDFS NameNode HA, Hive Metastore MySQL primary/replica, Prometheus primary/standby monitoring, and a Kerberos guard that runs every 30 seconds.

### Core Capabilities

<div class="qs-feature-grid">
  <div class="qs-feature-card">
    <div class="qs-f-icon">🌊</div>
    <h4>Real-time Ingestion</h4>
    <p>Kafka with 3 brokers and RF3; Flink with 20-second checkpoints and exactly-once writes to Iceberg; job adb1b6a9879e stays RUNNING.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🔐</div>
    <h4>Kerberos Data Plane</h4>
    <p>HDFS, HBase, Hive HMS/HS2, YARN, Flink, Kafka and Spark are enabled; MIT KDC primary/standby with realm HODOOPFORGE.LOCAL.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛡️</div>
    <h4>HDFS NN HA</h4>
    <p>bigtop-hostname3 Active / bigtop-hostname0 Standby, 3 JournalNodes, 2 ZKFC, 3 DataNodes, nameservice qixuandata.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🧱</div>
    <h4>Iceberg -ha</h4>
    <p>77/77 lake tables with aligned locations; warehouse unified at hdfs://qixuandata/iceberg-warehouse-ha, old warehouse retained for rollback.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛰️</div>
    <h4>Observability & On-call</h4>
    <p>Prometheus primary/standby, 12/12 targets, 22 alert rules and an Alertmanager cluster; guard and healthcheck are part of operations.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🤖</div>
    <h4>Automated Self-healing</h4>
    <p>A user-level kerberos_guard runs every 30 seconds, locks ambari-agent, restores config drift, restarts the data plane and saves keytab snapshots.</p>
  </div>
</div>

## Architecture & Chain

### Architecture Layers

<div class="qs-arch">
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Ingestion</div>
    <div>
      <h4>Business probes · Kafka · NAT / Hairpin</h4>
      <p>Three business links (ai_inference_log / rag_query_log / answer_sample_log); Kafka 3 brokers, RF3 and SASL_PLAINTEXT/GSSAPI; host DNAT and container hairpin.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Compute</div>
    <div>
      <h4>Flink · Spark ThriftServer · YARN · Hive / HMS</h4>
      <p>Flink real-time ingestion; Spark 3.5.6 ThriftServer 10016 query entry; YARN RM + 3 NM; HiveServer2 10000 and HMS 9083.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Storage</div>
    <div>
      <h4>HDFS NN HA · MySQL · Iceberg -ha · HBase · ZooKeeper</h4>
      <p>HDFS nameservice qixuandata; Hive Metastore MySQL primary h0 / async replica h3 with 1s RTO; 77 Iceberg tables; HBase 1 Master / 1 RS; 3-node ZK.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Governance</div>
    <div>
      <h4>edulake_meta · Quality / Lineage / Cost · Freshness</h4>
      <p>376 assets, 391 quality checks, 964 lineage rows, 308 cost records; historical baseline of 41 tables (35 normal / 6 empty / 0 failed); lake-health and freshness probes.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Ops & Security</div>
    <div>
      <h4>Ambari · Automation · Ranger · Monitoring · Kerberos · KDC · Guard</h4>
      <p>Ambari 20609 with security_type=KERBEROS; Ranger policy id 19; Prometheus primary/standby; MIT KDC primary/standby; guard locks the agent every 30 seconds.</p>
    </div>
  </div>
</div>

## Key Metrics

| Metric | Current value |
|---|---|
| Core services | 7/7 UP |
| Kerberos | 7 data-plane services enabled, KDC primary/standby |
| HDFS | h3 Active / h0 Standby / 3 DataNodes / 3 JNs |
| Flink | Job RUNNING, checkpoint 408+ |
| Iceberg | 77/77 table locations aligned |
| MySQL HA | Primary h0 / replica h3, RTO 1s, lag=0 |
| Monitoring | Prometheus 12/12 targets, 22 alert rules |
| Guard | active, ambari-agent locked, config drift 0 |

## Handover & Operations Principles

- **Read-only access to Ambari / Prometheus / Grafana**; do not start or stop HDFS/HBase/Hive/YARN from Ambari.
- Data-plane services are protected by **kerberos_guard**: configuration drift is restored and keytabs are snapshotted.
- Read the runbook before changes; execute rollback scripts under control; never commit passwords or keytabs to the repository.
- The “Docs” links on the map are wired to this site's technical documentation centre, covering architecture, current state, Kerberos, guard, monitoring and rebuild — 15 handover documents in total.

> Status legend: green = normal, amber = attention, indigo = planned, grey = disabled. Map nodes expose endpoints, metrics, commands and docs.

[Back to the lake map ↑](#interactive-map)　　[Request a demo →](/en/contact/)
