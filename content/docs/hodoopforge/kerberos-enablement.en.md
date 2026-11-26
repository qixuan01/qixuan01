---
title: "Kerberos Data Plane Enablement"
weight: 30
type: "docs"
---

> **Note:** This technical guide is currently maintained in Chinese. The interactive map and product pages are fully bilingual; the detailed engineering reference below remains in Chinese until an English edition is published.


> 状态：**HDFS/HBase/Hive/YARN/Flink/Kafka/Spark 已启用 Kerberos；Ambari `security_type=KERBEROS`；`ambari-agent` 由 guard 锁定**
> 关联：T-066 / KRB-PREP-001
> 最后更新：2026-11-26

## 1. 当前已完成

| 项 | 状态 |
|---|---|
| MIT KDC 主 | h0 `172.19.0.2`，`krb5kdc` active，端口 88 |
| MIT KDC 备 | h3 `172.19.0.4`，`krb5kdc` active，端口 88（初始 DB 同步） |
| Realm | `HODOOPFORGE.LOCAL` |
| `krb5.conf` | h0–h3 已配置 default_realm、双 KDC、admin_server、domain_realm |
| 管理员 | `admin/admin@HODOOPFORGE.LOCAL`，`kinit` 在 h0/h3 均成功 |
| 凭据 | `/etc/hodoopforge/kerberos.env`（root 0600，仓库不保存） |
| 时间同步 | 4 节点 chronyd，偏移 <1ms |
| Ambari KERBEROS 服务 | `INSTALLED`；`KERBEROS_CLIENT` 4/4 `INSTALLED` |
| kerberos-env / krb5-conf | 已写入 realm、双 KDC、admin principal/password、krb5.conf 模板 |
| 集群安全 | `security_type=KERBEROS`（2026-11-26 收口）；`ambari-agent` 由 guard 锁定 |

验证：

```bash
bash scripts/kerberos_status.sh
```

## 1.1 2026-11-24 进展

- 通过 Ambari API 创建 `KERBEROS` 服务与 `KERBEROS_CLIENT` 组件；
- 4 个节点 `KERBEROS_CLIENT` 安装成功，`/etc/krb5.conf` 已按模板生成；
- `kerberos-env` 已写入：realm `HODOOPFORGE.LOCAL`、KDC h0/h3、
  admin principal `admin/admin@HODOOPFORGE.LOCAL`、加密类型、`manage_identities=true`；
- 未执行最后一步 `security_type=KERBEROS`：该操作会停止除 ZK 外所有服务、
  重建全部 keytab 并重启；业务 Kafka/Spark JDBC 客户端必须先具备
  SASL/JAAS 或 keytab，否则会出现**超出窗口的业务中断**。

切换前确认清单：

1. 业务 Kafka 生产者/消费者已准备 `SASL_PLAINTEXT` + JAAS；
2. 业务 Spark JDBC/ThriftServer 客户端已准备 principal/keytab；
3. Flink 作业已配置 `security.kerberos.login.keytab/principal` 与 Kafka JAAS；
4. 维护窗口 ≥ 1–2 小时，且可接受全栈重启。

满足后执行：

```bash
curl -u admin:*** -H 'X-Requested-By: ops' -H 'Content-Type: application/json' \
  -X PUT http://localhost:20609/api/v1/clusters/qixuandata \
  -d '{"Clusters":{"security_type":"KERBEROS"}}'
```

然后按本文第 3 节验证。

## 2. 早期未直接切 security_type 的原因（历史）

> 说明：本节为 2026-11-24 的历史判断。2026-11-26 已通过 Ambari API
> `request 2472` 将 `security_type` 置为 `KERBEROS`，并保留 guard 锁 agent。

Ambari 的 Kerberos 启用不是“改一个开关”：

1. 需要先通过 **Add Service / Kerberos Wizard** 安装 `KERBEROS_CLIENT` 并生成
   `kerberos-env`、`krb5-conf` 配置；
2. 启用时 Ambari 会 **停止除 ZK 外的所有服务**，创建每个服务的 principal/keytab，
   改写 core-site/hdfs-site/hive-site/kafka/zk 等配置，再逐个重启；
3. 任何一步失败都会让集群处于半 Kerberos 状态，恢复需要逐服务回滚；
4. 业务侧 Flink/Spark/Kafka 客户端必须同时带上 keytab/JAAS 配置，否则实时作业会中断。

本环境没有维护窗口，且 Ambari API 单独添加 `KERBEROS_CLIENT` 会因服务未通过
wizard 初始化而返回 `Service not found`。因此只落地了 **KDC + realm + 客户端
krb5.conf**，集群仍保持 simple 安全模式，避免把生产作业置于半配置状态。

## 3. 维护窗口执行步骤（1–2 小时）

### 3.1 前置检查

```bash
bash scripts/kerberos_status.sh
# 期望：两个 KDC active、kinit OK、security_type=KERBEROS
```

### 3.2 Ambari 向导

1. 打开 `http://192.168.0.60:20609` → Admin → Kerberos → **Enable Kerberos**；
2. KDC type：`MIT KDC`；
3. Realm：`HODOOPFORGE.LOCAL`；
4. KDC hosts：`bigtop-hostname0.bigtop.apache.org,bigtop-hostname3.bigtop.apache.org`；
5. Admin server：`bigtop-hostname0.bigtop.apache.org`；
6. Admin principal：`admin/admin@HODOOPFORGE.LOCAL`；
7. Admin password：读取 h0 上 `/etc/hodoopforge/kerberos.env` 的
   `KRB_ADMIN_PASSWORD`；
8. 保持 `Manage Kerberos Identities = true`，让 Ambari 生成 keytab；
9. 按向导执行；期间所有服务会重启。

### 3.3 启用后验证

```bash
kinit admin/admin
klist
hdfs dfs -ls /
kafka-topics.sh --bootstrap-server bigtop-hostname0:9092 --list
curl -s http://172.19.0.2:8081/jobs/overview
```

Flink 作业需要重新提交并带上：

```yaml
security.kerberos.login.keytab: /etc/security/keytabs/flink.headless.keytab
security.kerberos.login.principal: flink@HODOOPFORGE.LOCAL
```

Kafka 客户端需要 JAAS（`KafkaClient` section）和 `security.protocol=SASL_PLAINTEXT`。
Spark ThriftServer / JDBC 需要 `principal` + `keytab` 连接串参数。

### 3.4 回滚

优先使用 Ambari：Admin → Kerberos → **Disable Kerberos**（等价于
`PUT /api/v1/clusters/qixuandata {"Clusters":{"security_type":"NONE"}}`），
然后重启服务。配置回滚可用：

```bash
sudo bash scripts/backup_with_throttle.sh --force
# 备份在 /var/backups/hodoopforge/<timestamp>/
```

KDC 本身不影响集群；如需彻底移除，停止 `krb5kdc` 并删除
`/var/kerberos/krb5kdc/principal*`。

## 4. 已知限制

- h3 KDC 是初始 DB 副本，尚未配置 `kpropd` 增量同步；主 KDC 新增 principal 后
  需要重新 `kdb5_util dump` + 复制，或在维护窗口配置 `kprop`。
- `default_ccache_name` 已改为 `FILE:/tmp/krb5cc_%{uid}`，避免容器内 keyring 不可用。
- Kerberos 启用后 Prometheus exporter 的 HTTP 端点不受影响（它们不访问 Hadoop
  RPC），但 Ambari API 调用需要继续使用 admin 凭据。

## 6. Kerberos 本身的修正（2026-11-25）

前三次失败不在 KDC，而在 **GSS 主机名规范化**：

- 容器同时有 `bigtop-hostnameX.bigtop.apache.org`（Ambari）和
  `bigtop_hostnameX.ambari3_hodoopforge`（Docker DNS canonical name）；
- MIT Kerberos 默认会把 service host 规范化到 Docker DNS 名，导致
  DataNode 请求的 `nn/...` 与 keytab 不一致，出现 `EOFException/SASL`。

已修改 Kerberos 侧，而不是继续改 Hadoop：

1. `/etc/krb5.conf` 增加 `dns_canonicalize_hostname = false`；
2. `scripts/kerberos_align_hosts.sh` 为 nn/dn/jn/HTTP 同时创建
   FQDN 与 Docker DNS 两种 principal，并把两者写入同一个 keytab；
3. keytab 权限统一为服务用户 0400；
4. Ambari 重写 keytab 后重新执行该脚本即可。

当前脚本已在 4 节点执行，simple 模式业务不受影响。下一步只需在维护窗口
重启 HDFS 验证 DN 注册，再逐服务切换。

## 7. 是否“必须”用 Kerberos？

Kerberos 解决的是 **强用户认证/SSO**；如果目标只是“传输加密 + 服务认证 +
细粒度授权”，容器化环境里可以选择更轻的基线：

| 目标 | Kerberos | TLS + SASL/SCRAM + Ranger |
|---|---|---|
| 传输加密 | 需要额外配置 | 原生支持 |
| 用户 SSO | 强 | 弱/需 LDAP |
| 运维复杂度 | 高（KDC/keytab/时钟/主机名） | 中 |
| 容器/动态主机适配 | 差 | 好 |
| 合规“必须 Kerberos” | 唯一选择 | 不满足 |

建议：
- 若合规要求 Kerberos：用上面的 dual-principal + 关闭 canonicalization 方案；
- 若只是安全加固：优先 TLS + Kafka SASL/SCRAM + Hive LDAP/SSL + Ranger，
  不引入 KDC，业务中断面更小。

## 8. 2026-11-25/26 数据面实测与 Ambari 收口

> 结论：**HDFS、HBase、Hive（HMS/HS2）、YARN、Flink、Kafka、Spark 均已跑通 Kerberos**。
> Ambari `security_type` 已置为 `KERBEROS`；`ambari-agent` 仍由 `kerberos_guard` 锁定，避免 Ambari 用旧配置覆盖手工 Kerberos。

### 8.1 已跑通

| 服务 | 关键配置 | 验证 |
|---|---|---|
| HDFS | NN/JN 用 `_HOST`；DN 用显式 FQDN principal；web 保持 simple；删除残留 `dfs.*ns-fed` | h0 Active / h3 Standby，3 DataNode；`kinit` + `dfs -ls` + `put/cat/rm` 成功 |
| HBase | `hbase.security.authentication=kerberos`、`authorization=true`、`zookeeper.znode.parent=/hbase`、`zookeeper.sasl.client=false` | HMaster 16000 + RS 16020；`status`、`create/put/get/disable/drop` 成功 |
| Hive | HMS `hive.metastore.sasl.enabled=true`；HS2 `hive.server2.authentication=KERBEROS`；均用 `hive.service.keytab` | beeline 以 `hive/bigtop-hostname0@REALM` 连接；`show databases`、`select 1` 成功 |
| YARN | RM `rm/...`、NM `nm/...`；`LinuxContainerExecutor`；`container-executor` 6050 | `yarn node -list` 显示 3 个 RUNNING NodeManager |
| Flink | `flink.headless.keytab`；`zookeeper.sasl.disable=true`；Kafka SASL JAR | 作业 `adb1b6a9…` RUNNING，checkpoint 20s，从 savepoint 恢复 |
| Kafka | 3 broker `SASL_PLAINTEXT/GSSAPI`，共享 `kafka/192.168.0.60` principal + keytab | `kafka-topics`/producer/consumer 全部成功 |
| Spark | ThriftServer h1:10016，`--principal spark/... --keytab spark.service.keytab`；`spark.yarn.*` | beeline 以 `spark/bigtop-hostname1@REALM` 连接，`select 1` 成功 |

### 8.2 关键修复（踩坑记录）

1. **HDFS 残留 federation 配置**
   h3 的 `hdfs-site.xml` 有 `dfs.namenode.rpc-address.ns-fed.r1` 和
   `dfs.nameservices=qixuandata,ns-fed`，导致
   `Configuration has multiple addresses that match local node's address`。
   删除所有 `ns-fed` 属性并把 `dfs.nameservices` 固定为 `qixuandata`。
2. **DN 的 `_HOST` 与 NN 期望不一致**
   secure DataNode（jsvc/root→hdfs）可能把 `_HOST` 解析成 Docker DNS
   `bigtop_hostnameX.ambari3_hodoopforge`，而 NN 要求 FQDN
   `dn/bigtop-hostnameX...`；因此 DN 使用**显式 FQDN principal**，
   NN/JN 继续用 `_HOST`（NN 会为每个 JN/对端 NN 生成正确 principal）。
3. **YARN NM 未注册**
   RM 侧 `yarn.nodemanager.principal` 若写成单台 `nm/h0`，会只允许 h0；
   改为 `nm/_HOST@REALM` 后 NM 按连接主机展开，3 台全部注册。
4. **container-executor 权限**
   h2/h3 的 `container-executor` 是 2050，必须 `6050 root:hadoop`；
   并补 `/usr/lib/hadoop-yarn/etc/hadoop/container-executor.cfg` 软链。
5. **Hive/HBase 的 ZK ACL**
   ZooKeeper 仍是 simple，Hadoop 认为 security=true 时会用 SASL ACL 创建
   `/killQueries`、`/hiveserver2` 等节点，报 `InvalidACL`。
   处理：`-Dzookeeper.sasl.client=false`；Hive 关闭
   `hive.zookeeper.killquery.enable`，并临时关闭 HS2 的 ZK 动态发现
   （`hive.server2.support.dynamic.service.discovery=false`）。
6. **h1 RPM 数据库损坏**
   `rpmdb: BDB0113 / DB_RUNRECOVERY` 会导致 Ambari HDFS START 失败；
   `rm -f /var/lib/rpm/__db.*; rpm --rebuilddb` 修复。

### 8.3 未完成与阻塞

| 项 | 状态 | 说明 |
|---|---|---|
| Flink | ✅ RUNNING | KMS provider 已移除；Hive connector 已移出 Flink lib；ZK SASL 关闭；Kafka JAR 使用 SASL |
| Kafka | ✅ SASL/GSSAPI | 共享 `kafka/192.168.0.60` principal；broker 由 systemd `kafka-broker` 管理 |
| Spark | ✅ ThriftServer 10016 | YARN `usercache/spark` 权限修复；`spark.yarn.timeline-service.enabled=false` 绕过 ATS 委托令牌 |
| Ambari | ✅ flag 已收口 / agent 锁定 | `security_type=KERBEROS`、`cluster-env/security_enabled=true`；`kerberos_guard` 仍锁 agent，**不要从 Ambari 启动/重启数据面服务** |

### 8.4 运维注意

- 手工切换期间 `hodoopforge-watchdog.timer` 已停止；恢复前必须先让
  watchdog 支持 Kerberos（HDFS 检查需 `kinit`，不能再用 simple 重启）。
- 所有服务配置均有 `.simple.bak`（HDFS/HBase/Hive/YARN）；
  KMS 属性另有 `.kms.bak`。
- HDFS 回滚：`bash scripts/kerberos_hdfs_enable.sh rollback`。
- HBase/Hive/YARN 回滚：恢复对应 `*.simple.bak`，重启 HMaster/RS、
  HMS/HS2、RM/NM，最后通过 Ambari 将服务置为 `STARTED`。
- 业务客户端连接方式已变化：
  - Hive JDBC 必须 kinit + `principal=hive/<host>@HODOOPFORGE.LOCAL`；
  - HBase 客户端必须 kinit（或使用 keytab），并配置
    `hbase.security.authentication=kerberos`；
  - HDFS 客户端必须 kinit / 使用 keytab，不能再匿名访问。
