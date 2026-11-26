/* HodoopForge Data Lake map — English overlay.
   The Chinese source data stays inline in hodoopforge-lake-map.html.
   This file only overrides display strings when ?lang=en is present. */
window.HODOOPFORGE_EN = {
  title: 'HodoopForge Data Lake Map · Kerberos Edition',
  subtitle: 'Container-level HA · Kerberos data plane · Guard protection · Real-time ingestion',
  summary: [
    { label: 'Core services', value: '7/7 UP' },
    { label: 'Kerberos', value: 'KERBEROS · 7 services' },
    { label: 'HDFS', value: 'bigtop-hostname3 Active · bigtop-hostname0 Standby · 3 DN' },
    { label: 'Flink', value: 'RUNNING · checkpoint 408' },
    { label: 'Guard', value: 'active · ambari-agent locked' }
  ],
  flow: {
    kdc: { name: 'Kerberos / KDC', sub: 'Authentication front door' },
    probes: { name: 'Business / Probes', sub: 'LLM · RAG · Answer' },
    kafka: { name: 'Kafka', sub: '3 brokers · RF3' },
    flink: { name: 'Flink', sub: '3 sinks · checkpoint 20s' },
    iceberg: { name: 'Iceberg -ha', sub: '77/77 · nameservice' },
    spark: { name: 'Spark / Hive', sub: 'ThriftServer · HS2' },
    apps: { name: 'Apps / BI', sub: 'Query · dashboards · export' }
  },
  layers: {
    ingest: {
      name: 'Ingestion', desc: 'Business events, probes and external clients',
      nodes: {
        probes: {
          name: 'Business Probes', sub: 'LLM / RAG / Answer · Flink RUNNING',
          desc: 'Three business links: ai_inference_log, rag_query_log and answer_sample_log. Kafka clients need Kerberos/JAAS; ODS freshness is verified by table queries.',
          metrics: ['3 links', 'Kafka SASL/GSSAPI', 'ODS verified by table query']
        },
        kafka: {
          name: 'Kafka', sub: '3 brokers · SASL_PLAINTEXT/GSSAPI',
          desc: 'h0/h2/h3 brokers; SASL_PLAINTEXT/GSSAPI; shared kafka/192.168.0.60 principal; advertised 192.168.0.60:9092/9093/9094.',
          metrics: ['RF3 · minISR=2', 'shared kafka/192.168.0.60 principal', 'managed by systemd kafka-broker', 'advertised 192.168.0.60:9092/9093/9094']
        },
        nat: {
          name: 'NAT / Hairpin', sub: '50 mappings · 6 Kafka',
          desc: 'Host DNAT plus container hairpin; Kafka external ports switched to SASL_PLAINTEXT.',
          metrics: ['PREROUTING+OUTPUT 100 rules', '9093/9094 added', 'container hairpin 3/3']
        }
      }
    },
    compute: {
      name: 'Compute', desc: 'Streaming and batch compute',
      nodes: {
        flink: {
          name: 'Flink', sub: 'JM1 h0 / JM2 h1 · Kerberos',
          desc: 'Real-time lake ingestion with 20s checkpoints and exactly-once writes to Iceberg; JM/TM use keytabs and Kafka SASL.',
          metrics: ['job adb1b6a9879e RUNNING', 'checkpoint completed=408', 'Kafka SASL_PLAINTEXT/GSSAPI', 'zookeeper.sasl.disable=true']
        },
        spark: {
          name: 'Spark ThriftServer', sub: 'Spark 3.5.6 · 10016 · Kerberos',
          desc: 'Business query entry; ThriftServer 10016 switched to Kerberos; catalog warehouse = hdfs://qixuandata/iceberg-warehouse-ha.',
          metrics: ['ThriftServer --principal spark/...', 'spark.yarn.keytab=spark.service.keytab', 'YARN usercache/spark fixed', 'beeline select 1 passed']
        },
        yarn: {
          name: 'YARN', sub: 'RM h0 · 3 NM',
          desc: 'Resource scheduler for Spark/Flink/Hive; RM/NM run Kerberos with LinuxContainerExecutor.',
          metrics: ['3 NodeManagers RUNNING', 'RM 8088']
        },
        hive: {
          name: 'Hive / HMS', sub: 'HS2 10000 · HMS 9083',
          desc: 'HiveServer2 + Metastore; HMS/HS2 use Kerberos; HS2 ZK dynamic discovery is temporarily disabled.',
          metrics: ['HS2 SELECT 1 OK', 'HMS 9083']
        }
      }
    },
    storage: {
      name: 'Storage', desc: 'HA filesystem and Iceberg warehouse',
      nodes: {
        hdfs: {
          name: 'HDFS NN HA', sub: 'bigtop-hostname3 Active · bigtop-hostname0 Standby · 3 DataNodes',
          desc: 'NameNode HA (h3 Active / h0 Standby); DNs use explicit FQDN principals from /etc/hadoop/conf-dn; RPC Kerberos, web simple.',
          metrics: ['3 JN · 2 ZKFC · 3 DN', 'Kerberos RPC · DN explicit FQDN', 'DN uses /etc/hadoop/conf-dn', 'nameservice qixuandata']
        },
        mysql: {
          name: 'MySQL Metadata DB', sub: 'Hive Metastore primary / replica',
          desc: 'Hive Metastore MySQL primary on h0 with asynchronous replica on h3; failover script mysql_failover.sh.',
          metrics: ['primary h0 / replica h3', 'RTO 1s / switch-back 2s', 'lag=0']
        },
        iceberg: {
          name: 'Iceberg -ha', sub: '77/77 tables · locations aligned',
          desc: 'Business reads and Flink writes unified at hdfs://qixuandata/iceberg-warehouse-ha; the old /iceberg-warehouse is retained.',
          metrics: ['tables=77 aligned=77', 'Spark catalog → -ha', 'Flink warehouse → -ha', 'old warehouse kept for rollback']
        },
        hbase: {
          name: 'HBase', sub: '1 Master · 1 RS',
          desc: 'HBase Master h0 / RegionServer h3; Kerberos enabled, znode parent=/hbase; Ranger authorisation is not yet Kerberos-enabled.',
          metrics: ['active master 1', 'regionserver 1', '0 dead']
        },
        zk: {
          name: 'ZooKeeper', sub: '3 nodes',
          desc: 'Coordinates HDFS ZKFC/Kafka/HBase; still simple ZK, clients connect with zookeeper.sasl.client=false; can be Kerberos-enabled separately later.',
          metrics: ['h0/h1/h2', '2181']
        }
      }
    },
    governance: {
      name: 'Governance', desc: 'Metadata, quality, lineage, cost and freshness',
      nodes: {
        meta: {
          name: 'edulake_meta', sub: 'edulake_meta · 6 governance tables',
          desc: 'Migrated governance metadata; business ETL has run 11-18 quality and governance jobs.',
          metrics: ['asset_registry 376', 'data_quality_check 391', 'data_lineage 964', 'cost_daily 308', 'governance_action_log 12', 'rag_answer_samples 21']
        },
        quality: {
          name: 'Quality / Lineage / Cost', sub: 'edulake_meta governance tables · historical baseline 41 tables',
          desc: 'Business quality checks, lineage, cost and SLO probes; historical baseline covers 41 tables (35 normal / 6 empty / 0 failed), current status follows business reruns.',
          metrics: ['41 tables / 35 normal / 6 empty / 0 failed', 'dt=11-18', 'lineage 964 rows']
        },
        freshness: {
          name: 'Freshness / Data Products', sub: 'Flink real-time job RUNNING · ODS freshness by table query',
          desc: 'Business lake-health / freshness probes; Flink job adb1b6a9 is RUNNING and ODS freshness is verified through Iceberg table queries.',
          metrics: ['Flink job RUNNING', 'ODS freshness by table query', 'lake-health availability by business probes']
        }
      }
    },
    ops: {
      name: 'Operations & Security', desc: 'Management, automation, security and monitoring',
      nodes: {
        ambari: {
          name: 'Ambari', sub: '20609 · security_type=KERBEROS',
          desc: 'Cluster management entry; security_type=KERBEROS; kerberos_guard locks ambari-agent to prevent old configuration from overwriting.',
          metrics: ['security_type=KERBEROS', 'guard locks ambari-agent', 'cluster-env/security_enabled=true', 'request 2472 COMPLETED']
        },
        automation: {
          name: 'Automated Self-healing', sub: 'guard 30s · healthcheck 10min · old watchdog stopped',
          desc: 'User-level kerberos_guard runs every 30s; health inspection every 10 minutes; old 60s watchdog stopped; NAT/container autostart retained.',
          metrics: ['kerberos_guard.timer active', 'healthcheck.timer active', 'watchdog.timer stopped', 'Ambari agent locked by guard']
        },
        ranger: {
          name: 'Ranger', sub: 'policy id 19 · -ha authorisation',
          desc: 'HDFS/Hive/HBase permissions and audit; Ranger Admin/KMS are not yet Kerberos-enabled, logs show 401/404, superuser paths work.',
          metrics: ['iceberg-warehouse-ha rwx', 'hdfs/flink/spark/ambari-qa']
        },
        monitor: {
          name: 'Monitoring', sub: 'Prometheus primary/standby · 12/12',
          desc: 'Prometheus primary/standby plus a unified query proxy; 12/12 targets and 23 rules; guard and healthcheck are included in operations.',
          metrics: ['12/12 targets UP', 'primary/standby instances', 'Alertmanager cluster', '22 alert rules', 'management exporter :9404']
        },
        security: {
          name: 'Kerberos Security Overview', sub: 'MIT KDC h0/h3 · HDFS/HBase/Hive/YARN/Flink/Kafka/Spark',
          desc: 'MIT KDC on h0/h3; HDFS/HBase/Hive/YARN/Flink/Kafka/Spark use Kerberos; guard locks the agent and restores config/keytab snapshots.',
          metrics: ['security_type=KERBEROS', 'guard 30s · locks ambari-agent', 'keytab snapshot + config drift recovery', 'Ranger/KMS not yet Kerberos']
        },
        kdc: {
          name: 'MIT KDC Primary/Standby', sub: 'h0/h3 · HODOOPFORGE.LOCAL',
          desc: 'krb5kdc primary/standby, realm, krb5.conf on 4 nodes, dual principals/keytabs.',
          metrics: ['realm HODOOPFORGE.LOCAL', 'KDC h0 + h3', 'chronyd offset <1ms', 'dual-principal keytab']
        },
        guard: {
          name: 'Kerberos Guard', sub: '30s · locks ambari-agent',
          desc: 'User-level systemd timer; locks the agent, restores config drift, restarts the data plane and saves keytab snapshots; never calls host systemctl stop, avoiding password prompts.',
          metrics: ['sentinel ON', 'config drift 0', 'ambari-agent inactive', 'keytabs.tgz snapshot']
        }
      }
    }
  },
  ui: {
    search: 'Search services, ports, commands, docs…',
    all: 'All', clear: 'Clear highlight', flow: 'FLOW',
    entry: 'Endpoint', metrics: 'Metrics', commands: 'Commands', docs: 'Docs', copy: 'Copy', copied: 'Copied',
    tours: { realtime: 'Real-time chain', query: 'Query chain', security: 'Kerberos auth', ops: 'On-call checks' },
    panelTitle: 'Click any node', panelSub: 'Inspect status, endpoints, metrics, commands and docs.',
    panelDesc: 'All data is embedded in this page, so it opens directly over <b>file://</b> or any static server without fetching lake-map-data.json.',
    panelSec: 'Quick paths',
    panelList: '<li>Real-time: Kafka → Flink → Iceberg</li><li>Query: Spark/Hive → Iceberg/HDFS</li><li>Auth & guard: KDC → service keytab → guard</li>',
    footer: 'Data snapshot: <code>lake-map-data.json</code> · Generated by <code>scripts/gen_lake_map_data.py</code> · Version: 2026-11-26 Kerberos',
    footerLinks: '<a href="/docs/hodoopforge/architecture/">Architecture</a> · <a href="/docs/hodoopforge/current-state/">Current State</a> · <a href="/docs/hodoopforge/kerberos-guard/">Guard</a>',
    back: '← Back to product', site: '🏠 Qixuan Website', themeTitle: 'Toggle light / dark theme'
  }
};
