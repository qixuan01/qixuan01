---
title: "Handover Pack README"
weight: 140
type: "docs"
---

> **Note:** This technical guide is currently maintained in Chinese. The interactive map and product pages are fully bilingual; the detailed engineering reference below remains in Chinese until an English edition is published.


> 面向：接手的运维 / 平台 / 数据开发同事  
> 范围：qixuandata 集群当前架构、Kerberos 数据面、防呆守护、端口、Runbook  
> 原则：**本包只读参考；不要从 Ambari 启停数据面服务。**

---

## 1. 先看什么

| 顺序 | 文件 | 用途 |
|---|---|---|
| 1 | [`ARCHITECTURE.md`](/docs/hodoopforge/architecture/) | 当前架构总览：拓扑、认证链路、HA、端口、回滚 |
| 2 | [`CURRENT_STATE.md`](/docs/hodoopforge/current-state/) | 当前状态单一事实源 |
| 3 | [`KERBEROS_ENABLEMENT.md`](/docs/hodoopforge/kerberos-enablement/) | Kerberos 数据面配置与踩坑 |
| 4 | [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/) | 防呆守护、agent 锁定、keytab 快照 |
| 5 | [`LAN_ACCESS_GUIDE.md`](/docs/hodoopforge/lan-access-guide/) | 局域网端口与客户端连接 |
| 6 | [`lake-map.html`](/maps/hodoopforge-lake-map.html) | 交互地图；**单文件自包含**，双击/file:// 可直接打开 |

---

## 2. 当前拓扑（4 容器 / 单宿主机）

| 容器 | IP | 主要角色 |
|---|---|---|
| `bigtop_hostname0` | 172.19.0.2 | NN(Standby)、RM、HBase Master、HMS/HS2、Ranger、Flink JM1、Kafka 1001、ZK、Ambari、KDC、MySQL 主 |
| `bigtop_hostname1` | 172.19.0.5 | Spark ThriftServer、HMS、DataNode、NodeManager、ZK、JN、Flink JM2、监控主、ATS |
| `bigtop_hostname2` | 172.19.0.3 | Kafka 1002、DataNode、NodeManager、ZK、Flink TM |
| `bigtop_hostname3` | 172.19.0.4 | NN(Active)、HBase RegionServer、HS2、MySQL 副本、DataNode、NodeManager、JN、ZKFC、Kafka 1003、Flink TM、KDC 备 |

宿主机：`192.168.0.60`；Ambari：`http://192.168.0.60:20609`。

---

## 3. 认证现状（2026-11-26）

- Realm：`HODOOPFORGE.LOCAL`；KDC 主备 h0/h3；
- 已 Kerberos：HDFS、HBase、Hive HMS/HS2、YARN、Flink、Kafka、Spark；
- 未 Kerberos：ZooKeeper、Ranger Admin/KMS、TLS；
- Ambari：`security_type=KERBEROS`，但 **`ambari-agent` 由 guard 锁定**；
- 客户端必须 `kinit` 或使用 keytab，不能匿名。

常用客户端命令见 [`LAN_ACCESS_GUIDE.md`](/docs/hodoopforge/lan-access-guide/) §5。

---

## 4. 防呆守护（最重要）

当前不是“Ambari 全托管”模式，而是 **手工 Kerberos + guard**：

- 用户级 `hodoopforge-kerberos-guard.timer` 每 30s 运行；
- 锁住 4 个容器的 `ambari-agent`；
- 检测配置漂移并恢复；
- 补起 HDFS/HBase/Hive/YARN/Flink/Kafka；
- 保存 `/etc/security/keytabs` 快照；
- **不调用宿主 `systemctl stop/disable`**，不会触发 polkit 密码弹窗。

查看状态：

```bash
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py status
```

> 禁止从 Ambari 启动/重启 HDFS/HBase/Hive/YARN。  
> Ambari UI 的服务/Agent 状态会滞后，这是设计而非故障。  
> 详见 [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/)。

---

## 5. 健康检查（复制即用）

```bash
# 1) guard + 端口
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py status

# 2) HDFS
docker exec bigtop_hostname0 bash -c "su -s /bin/bash hdfs -c 'export HADOOP_CONF_DIR=/etc/hadoop/conf; \
  kinit -kt /etc/security/keytabs/hdfs.headless.keytab hdfs-qixuandata@HODOOPFORGE.LOCAL; \
  hdfs haadmin -getAllServiceState; hdfs dfsadmin -report | grep -E \"Live datanodes|Missing blocks\"; kdestroy'"

# 3) Flink
curl -s http://172.19.0.2:8081/jobs/overview

# 4) 关键端口
for spec in "172.19.0.2 8020" "172.19.0.2 16000" "172.19.0.2 10000" "172.19.0.2 8050" \
            "172.19.0.2 9092" "172.19.0.3 9092" "172.19.0.4 9092" "172.19.0.5 10016"; do
  set -- $spec; timeout 2 bash -c "</dev/tcp/$1/$2" && echo "$1:$2 ok"
done
```

---

## 6. 变更规则

| 允许 | 禁止 |
|---|---|
| 只读查看 Ambari/Prometheus/Grafana | 从 Ambari 启动/重启 HDFS/HBase/Hive/YARN |
| `kerberos_guard --fix` | 手工 `systemctl start` 数据面服务 |
| 受控执行 `scripts/kerberos_hdfs_enable.sh rollback` | 未备份直接改 Kerberos/keytab/持久化卷 |
| 读取/复制本手册 | 把密码/keytab 提交到仓库 |

---

## 7. 已知限制

1. Ambari `ServiceInfo/kerberos_enabled` 仍显示 false；集群级 `security_type=KERBEROS` 已生效。
2. Ambari `cluster-env/kerberos_domain` 仍是 `EXAMPLE.COM`（DB 元数据，未下发）。
3. ZK/Ranger/KMS/TLS 未 Kerberos 化。
4. Flink 作业不会自动重新提交；丢失时从 savepoint 恢复。
5. 旧 60s watchdog 已停止；不要直接启动它，使用 guard。

---

## 8. 包内文件

见 [`MANIFEST.md`](/docs/hodoopforge/manifest/)。脚本在 `scripts/`，文档为当前版本副本；如与主仓库冲突，以主仓库
`docs/ARCHITECTURE.md` / `docs/CURRENT_STATE.md` 为准。
