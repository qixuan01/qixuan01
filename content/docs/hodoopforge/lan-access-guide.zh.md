---
title: "局域网访问指南"
weight: 50
type: "docs"
---


> 适用环境：4 容器（`bigtop_hostname0~3`）+ Ambari 3.1.0 + Bigtop 3.5.0
> 手册基线：2026-10-26 实测端口/进程/配置
> 配套脚本：setup-nat-forward.sh

---

## 1. 结论摘要（先看这里）

| 问题 | 答案 |
|---|---|
| 局域网怎么访问 | 通过宿主机 IP + 端口；端口由 `setup-nat-forward.sh` 用 iptables DNAT 转发进容器 |
| 当前宿主机 LAN IP | **192.168.0.60**（DHCP，可能变化，见 §7.3） |
| 现在能用吗 | **全部可用**（V2.6，47 条规则双链生效，PREROUTING+OUTPUT 各 47 条 DNAT） |
| 怎么启用 | 执行 §3.1 的两条命令（需要宿主机 root） |
| 能跑外部 HDFS 客户端吗 | **不能**，设计上不转发 `50010` 数据面端口（见 §6） |
| 能跑外部 HBase 客户端吗 | **不能**，RegionServer 注册的是容器内网 IP（见 §6） |
| 推荐对外使用方式 | Web UI 浏览 + Hive/Spark JDBC（beeline）+ Kafka（需 hosts）+ 通用 ZooKeeper |

---

## 2. 访问架构

```
局域网机器 (192.168.0.x)
      │  访问 http://192.168.0.60:<端口>
      ▼
宿主机 (ens160 192.168.0.60)
      │  iptables -t nat PREROUTING
      │  -p tcp --dport <端口> -m addrtype --dst-type LOCAL
      │  -j DNAT --to-destination 172.19.0.x:<容器端口>
      ▼
Docker bridge br-6f4c8baa4305 (172.19.0.0/24)
      ├─ bigtop_hostname0  172.19.0.2
      ├─ bigtop_hostname1  172.19.0.5
      ├─ bigtop_hostname2  172.19.0.3
      └─ bigtop_hostname3  172.19.0.4
```

三个关键设计（不要破坏）：

1. **`-m addrtype --dst-type LOCAL` 守卫**：只转发“发往宿主机本机地址”的流量，
   不会劫持容器之间的互访。缺了它会重演 HBase `_gateway` / HDFS 写管线故障。
2. **禁止无差别 MASQUERADE**：只允许 `-s 172.19.0.0/24 ! -d 172.19.0.0/24`，
   否则容器互访源地址被改写成 172.19.0.1。
3. **数据面/仲裁端口不转发**：`50010`（DataNode 传输）、`2888/3888`（ZK 仲裁）
   一律不映射。

> 注意：`docker-compose.yml` 只发布了 `20609:8080`（Ambari），其余端口全部依赖本脚本。

---

## 3. 启用与校验

### 3.1 启用（宿主机 root）

```bash
cd /home/rkam/hadoop-ops-course/ambari3/scripts

# 1) 按实际容器 IP 重建规则（容器重启/IP 变化后也执行这条）
sudo ./setup-nat-forward.sh refresh

# 2) 安装 systemd 服务，宿主机重启后自动恢复（推荐）
sudo ./setup-nat-forward.sh persist

# 3) 查看每条规则是否生效
sudo ./setup-nat-forward.sh status
```

`refresh` 等价于 `remove` + `apply`；`remove` 只清 `PREROUTING` 中的 DNAT，
不会影响 Docker 自带的 `DOCKER` 链（即 20609 映射始终可用）。

### 3.2 客户端 `/etc/hosts`（推荐，很多组件会返回 FQDN）

在**局域网访问端**（不是宿主机）添加：

```text
192.168.0.60  bigtop-hostname0.bigtop.apache.org bigtop-hostname0
192.168.0.60  bigtop-hostname1.bigtop.apache.org bigtop-hostname1
192.168.0.60  bigtop-hostname2.bigtop.apache.org bigtop-hostname2
192.168.0.60  bigtop-hostname3.bigtop.apache.org bigtop-hostname3
```

作用：
- Kafka 元数据里通告的是 `bigtop-hostname0...:9092`；
- Hive 表位置是 `hdfs://bigtop-hostname0...:8020/...`；
- 不加 hosts，`kafka-console-consumer` 会在拉元数据后连不上 broker。

### 3.3 连通性自检（局域网机器）

```bash
# HTTP 类
for p in 20609 8088 50070 16010 6080 18081 8081 3000; do
  printf '%-6s ' "$p"; curl -s -m 3 -o /dev/null -w '%{http_code}\n' "http://192.168.0.60:$p/"
done

# TCP 类（无 nc 时用 bash 内建）
for p in 8020 10000 9083 9092 10016 21810 12181 22181 16000 16020; do
  (echo > /dev/tcp/192.168.0.60/$p) >/dev/null 2>&1 \
    && echo "$p OK" || echo "$p FAIL"
done
```

---

## 4. 访问矩阵（按实测监听端口整理）

> **宿主机端口 = 容器内端口**，除非表中特别标注“偏移”。
> 基址：`http://192.168.0.60:<端口>`（HTTPS/RPC 见各条说明）

### 4.1 管理门户

| 服务 | 宿主机端口 | 实际节点 | 访问地址 | 说明 |
|---|---|---|---|---|
| Ambari Server | **20609**（Docker 映射）<br>8080（DNAT 可选） | h0 | http://192.168.0.60:20609 | admin / admin |
| Ambari Agent | 8440 / 8441 | h0 | — | 仅集群内部注册/心跳，**不建议对外** |
| Ambari Infra Solr | 8886 | h0 | http://192.168.0.60:8886/solr/ | 日志/指标索引 |
| Ranger Admin | 6080 | h0 | http://192.168.0.60:6080/ | 默认 admin/ranger 类账户 |
| Ranger Usersync | 5151 | h0 | — | 用户同步，通常无需浏览器访问 |
| Ranger KMS | 9292 | h0 | JMX: http://192.168.0.60:9292/kms/jmx<br>REST: http://192.168.0.60:9292/kms/kms/keys | Tomcat context path 为 `/kms`，Jersey Servlet 映射 `/kms/*`，故完整路径为 `/kms/kms/`；REST 端点需 Ranger 认证（HTTP 401 属正常） |
| Grafana（AMS） | **3000** | h0 | http://192.168.0.60:3000/ | **脚本未收录，需按 §9.4 补充** |
| 本地 YUM 仓库 | **80** | h0 | http://192.168.0.60/ | `python3 -m http.server`，目录含 ambari/bigtoprpm |

### 4.2 HDFS

| 服务 | 宿主机端口 | 节点 | 地址 | 说明 |
|---|---|---|---|---|
| NameNode Web UI | 50070 | h0 | http://192.168.0.60:50070/ | |
| NameNode RPC | 8020 | h0 | `hdfs://192.168.0.60:8020` | 仅元数据 RPC，**数据面不通**（§6） |
| SecondaryNameNode UI | 50090 | h1 | http://192.168.0.60:50090/ | |
| DataNode UI（h3） | 50075 | h3 | http://192.168.0.60:50075/ | |
| DataNode UI（h1） | **50076 → 50075** | h1 | http://192.168.0.60:50076/ | 宿主端口偏移 |
| DataNode UI（h2） | **50077 → 50075** | h2 | http://192.168.0.60:50077/ | 宿主端口偏移 |
| HDFS Router UI | 50071 | h3 | http://192.168.0.60:50071/ | Federation |
| HDFS Router RPC | 20010 | h3 | — | **不是 8888** |
| HDFS Router Admin | 8111 | h3 | — | |

### 4.3 YARN / MapReduce

| 服务 | 宿主机端口 | 节点 | 地址 |
|---|---|---|---|
| ResourceManager UI | 8088 | h0 | http://192.168.0.60:8088/ |
| RM RPC / Scheduler / Tracker / Admin | 8050 / 8030 / 8025 / 8141 | h0 | — |
| Timeline Reader V2 UI | 8198 | h0 | http://192.168.0.60:8198/ | 根路径返回 404 属正常（仅 REST/特定路径） |
| App Timeline Server V1 UI | 8188 | h1 | http://192.168.0.60:8188/ |
| ATS V1 RPC | 10200 | h1 | — |
| MR History Server UI | 19888 | h0 | http://192.168.0.60:19888/ |
| MR History IPC | 10020 | h0 | — |
| NodeManager UI（h3） | 8042 | h3 | http://192.168.0.60:8042/ |
| NodeManager UI（h1） | **8043 → 8042** | h1 | http://192.168.0.60:8043/ |
| NodeManager UI（h2） | **8044 → 8042** | h2 | http://192.168.0.60:8044/ |

### 4.4 Hive / WebHCat

| 服务 | 宿主机端口 | 节点 | 地址 |
|---|---|---|---|
| HiveServer2 JDBC/Thrift | 10000 | **h0** | `jdbc:hive2://192.168.0.60:10000/default` |
| HiveServer2 Web UI | 10002 | **h0** | http://192.168.0.60:10002/ |
| Hive Metastore Thrift | 9083 | **h0** | `thrift://192.168.0.60:9083` |
| WebHCat (Templeton) | 50111 | **h0** | http://192.168.0.60:50111/templeton/v1/ |

> `10001`（HS2 HTTP 模式）当前**未监听**，不要使用。

### 4.5 HBase

| 服务 | 宿主机端口 | 节点 | 地址 |
|---|---|---|---|
| HBase Master UI | 16010 | h0 | http://192.168.0.60:16010/ |
| HBase Master RPC | 16000 | h0 | — |
| RegionServer UI | 16030 | h3 | http://192.168.0.60:16030/ |
| RegionServer RPC | 16020 | h3 | — |

### 4.6 Spark / Flink

| 服务 | 宿主机端口 | 节点 | 地址 |
|---|---|---|---|
| Spark History Server | 18081 | h0 | http://192.168.0.60:18081/ |
| Spark ThriftServer JDBC | 10016 | h1 | Kerberos：`jdbc:hive2://192.168.0.60:10016/default;principal=spark/bigtop-hostname1.bigtop.apache.org@HODOOPFORGE.LOCAL` |
| Spark ThriftServer App UI | 4040 | **h1（固定）** | http://192.168.0.60:4040/ — ThriftServer 常驻 h1，App Web UI 端口稳定为 4040，可固定映射；SQL 查询进度与 Executor 状态实时可见 |
| Flink JobManager UI | 8081 | h0 | http://192.168.0.60:8081/ |
| Flink JobManager RPC | 6123 | h0 | — |
| Flink HistoryServer UI | 8082 | h0 | http://192.168.0.60:8082/ |

> `18080`、`4041` 当前**未监听**；`4040` 已在 V2.6 中修正归属到 h1（ThriftServer 常驻，端口稳定，可固定映射）。

### 4.7 Kafka / ZooKeeper / MySQL

| 服务 | 宿主机端口 | 节点 | 说明 |
|---|---|---|---|
| Kafka h0 (SASL_PLAINTEXT) | **9092 → h0:9092** | h0 | advertised `192.168.0.60:9092`；需 Kerberos/JAAS |
| Kafka h2 (SASL_PLAINTEXT) | **9093 → h2:9092** | h2 | advertised `192.168.0.60:9093` |
| Kafka h3 (SASL_PLAINTEXT) | **9094 → h3:9092** | h3 | advertised `192.168.0.60:9094` |
| ZooKeeper（h0） | **21810 → 2181** | h0 | 外部必须用 21810 |
| ZooKeeper（h1） | **12181 → 2181** | h1 | |
| ZooKeeper（h2） | **22181 → 2181** | h2 | |
| ZK 仲裁 2888/3888 | — | h2 | **绝不转发** |
| MySQL | **13306 → 3306** | **h0** | 宿主端口为 **13306**（宿主机自身 MySQL 已占 3306，避免冲突）；见 §7.2 安全警示 |

> h3 上没有 ZooKeeper；`2181` 在宿主机不映射（避免劫持 ZK 客户端流量）。
> 宿主机本机访问 `192.168.0.60:<端口>` 同样有效（V2.5 起 PREROUTING+OUTPUT 双链 DNAT）。

---

## 5. 客户端连接示例

### 5.0 Kerberos 客户端前置（Hive/Spark/HBase/Kafka 必须）

```bash
# 示例：使用 keystore 中的 spark headless keytab
kinit -kt /path/to/spark.headless.keytab spark-qixuandata@HODOOPFORGE.LOCAL
klist
```

> HDFS/HBase/Hive/Spark/Kafka 已启 Kerberos，不能再匿名。  
> 客户端时间必须与 KDC 同步（chronyd，偏移 <1ms）。

### 5.1 Hive / Spark Thrift（beeline，Kerberos）

```bash
# HiveServer2（h0 或 h3）
kinit -kt /path/to/hive.headless.keytab hive-qixuandata@HODOOPFORGE.LOCAL
beeline -u "jdbc:hive2://192.168.0.60:10000/default;principal=hive/bigtop-hostname0.bigtop.apache.org@HODOOPFORGE.LOCAL"

# Spark ThriftServer（h1）
kinit -kt /path/to/spark.headless.keytab spark-qixuandata@HODOOPFORGE.LOCAL
beeline -u "jdbc:hive2://192.168.0.60:10016/default;principal=spark/bigtop-hostname1.bigtop.apache.org@HODOOPFORGE.LOCAL"
```

JDBC URL（Java / DBeaver / DataGrip）：

```text
jdbc:hive2://192.168.0.60:10000/default;principal=hive/bigtop-hostname0.bigtop.apache.org@HODOOPFORGE.LOCAL
jdbc:hive2://192.168.0.60:10016/default;principal=spark/bigtop-hostname1.bigtop.apache.org@HODOOPFORGE.LOCAL
```

> HS2 的 ZK 动态发现已临时关闭；请直连 h0/h3。  
> 表数据由服务端读取，客户端不需要访问 DataNode。

### 5.2 Kafka（SASL_PLAINTEXT + GSSAPI）

客户端配置 `client.properties`：

```properties
security.protocol=SASL_PLAINTEXT
sasl.mechanism=GSSAPI
sasl.kerberos.service.name=kafka
```

JAAS（`kafka-client-jaas.conf`）：

```text
KafkaClient {
  com.sun.security.auth.module.Krb5LoginModule required
  useKeyTab=true storeKey=true
  keyTab="/path/to/flink.headless.keytab"
  principal="flink-qixuandata@HODOOPFORGE.LOCAL"
  serviceName="kafka";
};
```

```bash
export KAFKA_OPTS=-Djava.security.auth.login.config=/path/to/kafka-client-jaas.conf
kafka-console-producer --bootstrap-server 192.168.0.60:9092 \
  --producer.config client.properties --topic demo
kafka-console-consumer --bootstrap-server 192.168.0.60:9092 \
  --consumer.config client.properties --topic demo --from-beginning
```

> broker 使用共享 `kafka/192.168.0.60` principal；advertised 为 192.168.0.60:9092/9093/9094。  
> 外部客户端必须能访问 9092/9093/9094，并完成 §3.2 hosts 配置。

### 5.3 ZooKeeper

```bash
zkCli.sh -server 192.168.0.60:21810    # h0
zkCli.sh -server 192.168.0.60:12181    # h1
zkCli.sh -server 192.168.0.60:22181    # h2
```

### 5.4 MySQL（仅运维排障，不建议长期开放）

```bash
mysql -h 192.168.0.60 -P 13306 -u root -p
```

> 注意端口是 **13306** 不是 3306：宿主机自身装有 MySQL 占用 3306，
> 若 DNAT 劫持 3306 会导致宿主机本地 MySQL 客户端无法连接，故对外偏移为 13306。

### 5.5 HBase（只能在容器内）

```bash
docker exec -it bigtop_hostname0 bash -c "su -s /bin/bash hbase -c '
  kinit -kt /etc/security/keytabs/hbase.headless.keytab hbase-qixuandata@HODOOPFORGE.LOCAL;
  hbase shell'"
# status / list / scan 'table'
# 客户端需 hbase.security.authentication=kerberos + kinit
```

---

## 6. 能力边界（重要，避免踩坑）

| 想做 | 是否支持 | 原因 |
|---|---|---|
| 浏览器打开各 Web UI | ✅ | DNAT 正常 |
| Hive/Spark JDBC 查询 | ✅ | 数据由服务端读取 |
| Kafka 生产/消费 | ✅（需 hosts） | broker 通告 FQDN |
| 通用 ZooKeeper 客户端 | ✅ | 客户端端口已映射 |
| 外部 `hdfs dfs -put/-get` | ❌ | `50010` 不转发，数据面不通 |
| 外部 WebHDFS | ❌ | 重定向到 `bigtop-hostnameX:50075`，三节点共用宿主 IP 会串台 |
| 外部 HBase Client | ❌ | RegionServer 在 ZK 注册的是 `172.19.0.x:16020`，局域网不可达 |
| 外部 `spark-submit` / `yarn` 客户端 | ❌ | RM/NM 内部地址不可达，且缺数据面 |
| 外部 Flink 提交作业 | ❌ | TaskManager 动态端口，未映射 |

> 需要这些能力时，正确做法是**在容器内执行**（`docker exec`），或改为在局域网部署独立客户端集群并打通
> 172.19.0.0/24 路由（不要在现网随意转发 50010）。

---

## 7. 运维与安全

### 7.1 容器/IP 变化后

```bash
sudo ./setup-nat-forward.sh refresh    # 重探 IP 并重建
sudo ./setup-nat-forward.sh status     # 核对
```

容器 `docker compose restart` 不改变 IP；`up -d` 重建容器可能改变 IP，必须 refresh。

### 7.2 安全警示

1. **MySQL 3306 默认映射到局域网**：数据库无 TLS、账户口令较弱，建议从脚本中移除该条，
   或仅允许运维网段访问。
2. **ZooKeeper 无认证**：21810/12181/22181 暴露后可被任意客户端读写 znode，
   建议加源地址限制（见下）。
3. **8440/8441（Ambari Agent）对外无意义**，建议移除。
4. **`2888/3888/50010` 永远不要转发**。
5. 建议把 DNAT 源限制到可信网段，例如在脚本的 DNAT 规则前加：
   `-s 192.168.0.0/24`。

### 7.3 宿主机 IP 变化

宿主机 `ens160` 为 DHCP（当前 192.168.0.60）。IP 变化后：
- NAT 规则仍有效（规则不绑定宿主 IP）；
- 但所有客户端 `/etc/hosts` 需同步更新；
- 建议在路由器上为该网卡配置 DHCP 保留地址。

### 7.4 宿主机重启

`persist` 安装的 `hodoopforge-nat.service` 会在 Docker 就绪 15s 后自动 `refresh`。
未执行 `persist` 时，重启后规则全部丢失，需手工 `refresh`。

---

## 8. 故障排查

| 现象 | 排查 |
|---|---|
| 只有 20609 能访问 | NAT 未应用 → `sudo ./setup-nat-forward.sh status`，规则全 NO 就 `refresh` |
| 某端口 refused | 先确认容器内服务在听：`docker exec <c> ss -tln \| grep :<端口>` |
| 页面 302 跳登录 | 正常（Grafana/Ranger/Ambari 均需登录） |
| Kafka 拉不到消息 | 未配 hosts，broker 元数据 FQDN 解析失败 |
| Hive JDBC 能连、查询报 HDFS 错 | 正常边界：请确认没有在 SQL 里直接访问外部 HDFS 路径 |
| 容器互访异常 / HBase 启动报 `_gateway` | 检查是否出现无差别 MASQUERADE：`sudo iptables -t nat -S POSTROUTING` |
| HDFS 写入超时 / `Excluding datanode` | 检查是否误加了 50010 DNAT |

---

## 9. 附录：脚本审计与修订记录（2026-10-26）

`setup-nat-forward.sh` 已修订至 **V2.6**（47 条规则，全部经实测端口验证，零黑洞）。

### 9.1 机制（保留不变）

- `addrtype --dst-type LOCAL` 守卫、限定 MASQUERADE、FORWARD 放行容器网段；
- 未转发 `50010` / `2888` / `3888`；
- ZK 使用 21810/12181/22181 错峰端口；
- DataNode/NM UI 使用 50075/76/77、8042/43/44 错峰端口。

### 9.2 V2.5 已删除的黑洞规则（实测无监听）

`9000、14000、8199、10001、6182、9393、9093、18080、4041、8190、50072、7085、8998、9995、19999、19998、29999、30000`

### 9.3 V2.5 归置修正

| 规则 | 处理 | 原因 |
|---|---|---|
| `8440/8441` Ambari Agent | 删除 | 集群内部端口，不应对外 |
| `4040` Spark App UI | V2.5 删除 → V2.6 恢复 | 原判断有误：ThriftServer 常驻 h1 时 4040 稳定不漂移，可固定映射 |
| `4041` Spark App UI（第二应用） | 删除 | 动态端口不固定 |
| `3306` MySQL | 保留+警示注释 | 仅排障用，长期开放需加源网段限制 |
| `8080` Ambari | 保留 | 与 Docker 20609 并存，习惯直访 |

### 9.4 V2.5 新增

| 端口 | 服务 |
|---|---|
| 3000 | Grafana（AMS Web UI，实测 h0 监听） |

### 9.5 V2.6 修订

| 变更 | 内容 |
|---|---|
| Spark 4040 归属修正 | V2.5 误判为"动态端口不固定"而删除；V2.6 恢复并归到 h1（ThriftServer 常驻 → 4040 稳定监听） |
| 新增 4040→h1:4040 | Spark ThriftServer App Web UI，SQL 查询进度/Executor 状态实时可见 |
| KMS 路径更正 | Tomcat context path 为 `/kms`，Jersey 映射 `/kms/*` → 完整 REST 路径 `/kms/kms/`；根路径 `/` 返回 404 属正常 |
| Bug 修复 | `refresh` 模式内部先设 `ACTION=remove` 后跳过 case 的 apply 分支 → 改为保留 ACTION，让 case 的 refresh 自行处理 remove → apply |

### 9.6 关键发现（之前误判的澄清）

1. **Ranger KMS 并非空壳**：`hadoop-kms-3.3.6.jar` 有完整服务端类（`KMSWebApp`、`KMS`、`KMSWebServer`、`KMSAuthenticationFilter` 等 10 个 .class 文件）；之前只看了 `unzip -l` 前 20 行目录结构就判定为空壳，是误判。
2. **hadop-kms 有完整实现**：web.xml 正确配置 Jersey Servlet 扫描 `org.apache.hadoop.crypto.key.kms.server` 包，KMS 功能正常，REST 端点返回 401（认证）属正常安全机制。
3. **Spark 4040 不是动态端口**：ThriftServer 常驻 h1，其 App Web UI 端口稳定为 4040（只有独立 Spark 应用才会漂移到 4041+）。

### 9.7 文档一致性问题

- `OPERATIONS-GUIDE.md` 的“宿主机端口映射概览”把 **HiveServer2/Metastore/Ranger/MR History/MySQL
  归到 hostname1**，实测均在 **hostname0**；`10002`、`19888`、`10020` 同样应指向 h0。
- `doc/ENTERPRISE_DATA_PLATFORM_REFERENCE.md` §2.5 仍存在 `8190`、`50010`、`8888`、`6085`、
  `10002→h1`、`19888→h1` 等错误或危险映射，建议以本手册为准修正。

---

## 10. 一页速查（打印版）

```text
宿主机 192.168.0.60

Ambari      http://192.168.0.60:20609     (admin/admin)
Grafana     http://192.168.0.60:3000      (*需补规则)
YUM Repo    http://192.168.0.60/          (*需补规则)

HDFS UI     http://192.168.0.60:50070
YARN UI     http://192.168.0.60:8088
HBase UI    http://192.168.0.60:16010
MR History  http://192.168.0.60:19888
Spark HS    http://192.168.0.60:18081
Spark App UI http://192.168.0.60:4040
Flink UI    http://192.168.0.60:8081
Ranger      http://192.168.0.60:6080
Ranger KMS  JMX http://192.168.0.60:9292/kms/jmx  REST http://192.168.0.60:9292/kms/kms/keys
Solr        http://192.168.0.60:8886/solr/
Timeline V2 http://192.168.0.60:8198
ATS V1      http://192.168.0.60:8188

Hive JDBC   jdbc:hive2://192.168.0.60:10000/default
Spark JDBC  jdbc:hive2://192.168.0.60:10016/default
Metastore   thrift://192.168.0.60:9083
Kafka       192.168.0.60:9092            (需 hosts)
ZK         192.168.0.60:21810 / :12181 / :22181
MySQL       192.168.0.60:13306            (容器库；宿主 3306 是宿主自身 MySQL)

DN 50075/50076/50077   NM 8042/8043/8044   2NN 50090
HBase RS 16020/16030   Router 50071/20010/8111
```
