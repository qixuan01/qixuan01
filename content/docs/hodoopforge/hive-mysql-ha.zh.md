---
title: "Hive Metastore MySQL 高可用"
weight: 60
type: "docs"
---


> 状态：2026-11-22 上线并演练；2026-11-26 已切 Kerberos（手工模式）  
> 关联：T-064 / KRB-INC-006  
> 当前架构与认证以 [`ARCHITECTURE.md`](/docs/hodoopforge/architecture/) 为准。

## 1. 拓扑

| 组件 | 实例 | 端口 | 说明 |
|---|---|---|---|
| Hive Metastore (HMS) | h0 `172.19.0.2` | 9083 | Ambari 管理 |
| Hive Metastore (HMS) | h1 `172.19.0.5` | 9083 | Ambari 管理，与 h0 反亲和 |
| HiveServer2 (HS2) | h0 `172.19.0.2` | 10000 | Ambari 管理 |
| HiveServer2 (HS2) | h3 `172.19.0.4` | 10000 | Ambari 管理，与 h0 反亲和 |
| MySQL primary | h0 | 3306 | `ambari/hive/ranger/rangerkms/oozie` |
| MySQL replica | h3 | 3306 | `read_only`，异步复制，server-id=2 |

- HMS 客户端 URI：`thrift://bigtop-hostname0.bigtop.apache.org:9083,thrift://bigtop-hostname1.bigtop.apache.org:9083`
  （Hive 客户端按顺序重试，单台 HMS 故障自动切换）
- **Kerberos 后 HS2 ZK 动态发现已临时关闭**（simple ZK + SASL ACL 冲突），
  `hive.server2.support.dynamic.service.discovery=false`；客户端请直连 h0/h3：

```text
jdbc:hive2://192.168.0.60:10000/default;principal=hive/bigtop-hostname0.bigtop.apache.org@HODOOPFORGE.LOCAL
```

- HMS/HS2 均使用 `hive.service.keytab`；HMS `hive.metastore.sasl.enabled=true`，
  HS2 `hive.server2.authentication=KERBEROS`。
- 客户端必须先 `kinit`（或 keytab），不能再匿名连接。

## 2. 关键配置

| 配置 | 值 |
|---|---|
| `hive.metastore.uris` | 两个 HMS URI，逗号分隔 |
| `hive.server2.support.dynamic.service.discovery` | **`false`**（Kerberos 后临时关闭） |
| `hive.metastore.event.db.notification.api.auth` | `false`（由 Bigtop 脚本根据 core-site 自动生成） |
| `hive.server2.enable.doAs` | `false` |
| `hive.metastore.sasl.enabled` | `true` |
| `hive.server2.authentication` | `KERBEROS` |
| `hive.server2.authentication.kerberos.principal` | `hive/_HOST@HODOOPFORGE.LOCAL` |

> Bigtop 的 `params.py` 会根据 `hadoop.proxyuser.hive.*` 是否存在于 core-site
> 强制覆盖 notification API 开关。为了让第二个 HS2 能启动，已从 core-site
> 移除 `hadoop.proxyuser.hive.hosts/groups`，因此该开关生成 `false`。
> 如果后续重新加回 proxyuser，需要同时把 `hive.users.in.admin.role` 配好或
> 接受第二个 HS2 启动失败。

## 3. 验证

```bash
# HMS 两实例
for h in bigtop-hostname0 bigtop-hostname1; do
  timeout 3 bash -c "</dev/tcp/$h/9083" && echo "$h HMS ok"
done

# HS2 直连
beeline -u "jdbc:hive2://bigtop-hostname3.bigtop.apache.org:10000/default" -e "select 1"

# HS2 ZK 服务发现
beeline -u "jdbc:hive2://bigtop-hostname0.bigtop.apache.org:2181,bigtop-hostname1.bigtop.apache.org:2181,bigtop-hostname2.bigtop.apache.org:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2" -e "select 42"

# MySQL 复制
bash scripts/mysql_replica_setup.sh status
```

已演练：

- 停 h0 HS2 → ZK 发现自动路由到 h3，`select 42` 成功；
- 停 h0 HMS → h3 HS2 通过 h1 HMS 继续服务；
- MySQL `Replica_IO_Running=Yes`、`Replica_SQL_Running=Yes`、延迟 0。

## 4. MySQL 故障切换

复制与提升脚本：

```bash
bash scripts/mysql_replica_setup.sh status
CONFIRM=yes bash scripts/mysql_failover.sh promote
```

提升只把 h3 变成可写主库；应用侧 JDBC URL 的切换仍需维护窗口：

1. `/etc/ambari-server/conf/ambari.properties` 的 `server.jdbc.url` 指向 h3；
2. Ambari 配置中心把 Hive `javax.jdo.option.ConnectionURL`、Ranger
   `ranger.jpa.jdbc.url` 指向 h3；
3. 重启 Ambari / HIVE / RANGER；
4. h0 恢复后重建为 h3 的副本，禁止双主。

## 5. 资源与限制

- h1 同时运行 HMS、Spark ThriftServer、Prometheus/Alertmanager、JM2；
  第二个 HS2 曾尝试部署在 h1，因内存 93% 回退，最终放在 h3。
- h3 内存约 77%，MySQL 副本约 400 MB。
- MySQL 复制是异步的；主库突然宕机时可能丢失最后少量事务（RPO 秒级）。
- 提升后需要手工改应用连接串，当前未做自动 VIP/代理切换。
