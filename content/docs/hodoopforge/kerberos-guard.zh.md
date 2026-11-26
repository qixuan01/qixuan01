---
title: "Kerberos 防呆守护"
weight: 40
type: "docs"
---


> 状态：2026-11-26 启用；当前集群处于“手工 Kerberos”模式，Ambari
> `security_type` 仍是 `NONE`。

## 为什么需要它

Ambari 数据库里保存的仍是 simple 配置。只要有人从 Ambari UI/API 对
HDFS/HBase/Hive/YARN 点一次 Start/Restart，Ambari 就会用 simple 配置
覆盖 `/etc/hadoop/conf`、`/etc/hbase/conf`、`/etc/hive/conf`、
`/etc/hadoop/conf-dn`，Kerberos 会**静默失效**。

`kerberos_guard` 的目标就是让这件事在手工模式下不可能发生：

1. **停止并锁住 `ambari-agent`**（4 个容器内），Ambari 无法下发任何
   START/STOP/RESTART 命令；
2. **停止旧的 simple-auth watchdog**；
3. 每 30 秒检查配置漂移（auth 变成 simple、Flink/Kafka 的 Kerberos
   配置丢失等），发现后从快照恢复；
4. 按 Kerberos 启动顺序补起缺失的 HDFS/HBase/Hive/YARN/Flink/Kafka；
5. 所有动作写 `/home/rkam/.hodoopforge-kerberos/kerberos-guard.log`
   （root 安装时为 `/etc/hodoopforge/kerberos-guard.log`）。

## 不需要密码

guard 通过 **用户级 systemd timer** 运行（`systemctl --user`），
`loginctl enable-linger rkam` 已打开，所以退出登录后仍会执行。
它只使用 `docker exec` 和用户级 systemd，**不需要 sudo，也不需要
Ambari 密码**。

> 本机宿主机 `sudo` 位于 nosuid 文件系统，无法提权；因此不要再尝试
> `sudo`。需要 root 的容器内操作统一用 `docker exec -u root`。

## 常用命令

```bash
# 状态（含 Ambari Agent 是否被锁）
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py status

# 手动跑一次修复
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py --fix

# 刷新配置快照（修改了 Kerberos 配置后必须执行）
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py snapshot

# 退出“手工 Kerberos”模式（最终 Ambari 收口后）
KERBEROS_GUARD_HOME=$HOME/.hodoopforge-kerberos \
  python3 scripts/kerberos_guard.py disable

# 查看用户 timer
systemctl --user status hodoopforge-kerberos-guard.timer
```

## 手工模式下的硬约束

- **不要启动 ambari-agent**；guard 会在 30 秒内再次停掉它，并记录日志。
- **不要通过 Ambari 启动/重启 HDFS/HBase/Hive/YARN**。
- 修改任何 Kerberos 配置后，执行一次 `snapshot`，否则 guard 会用旧快照
  覆盖新配置。
- HDFS DataNode 必须用 `/etc/hadoop/conf-dn`（显式 FQDN principal）启动，
  NameNode/JournalNode 用 `/etc/hadoop/conf`（`_HOST`）。
- 最终切换 Ambari `security_type=KERBEROS` 前，先执行 `disable`，
  让 agent 恢复；切换完成后再评估是否重新启用 guard。

## 当前保护范围

| 服务 | 配置漂移检查 | 缺失时自动启动 |
|---|---|---|
| HDFS | `hadoop.security.authentication=kerberos` + NN principal | JN → NN → DN → ZKFC |
| HBase | `hbase.security.authentication=kerberos` | HMaster → RegionServer |
| Hive | `hive.server2.authentication=KERBEROS` | HMS → HS2 |
| YARN | `yarn.resourcemanager.principal` 存在 | RM → NM |
| Flink | `security.kerberos.login.keytab` + `zookeeper.sasl.disable=true` | JM1/JM2/TM |
| Kafka | `listeners=SASL_PLAINTEXT` | `kafka-broker` systemd |

> Flink 作业本身不会自动重新提交；作业丢失时需从 savepoint 手工恢复。

## Ambari 收口后的状态（2026-11-26）

- Ambari `security_type=KERBEROS`，`cluster-env/security_enabled=true`；
- **ambari-agent 仍被 guard 锁定**，不做 agent 管理式重启；
- 收口请求曾覆盖 h0 的 `nn/jn/kafka` keytab，已从备份恢复并重启 h0 NN/JN/Kafka；
  因此 guard 现在每次 `snapshot` 还会保存 `/etc/security/keytabs` 的 tarball；
- `cluster-env/kerberos_domain` 仍是 `EXAMPLE.COM`（Ambari DB 元数据），
  但 `kerberos-env/realm` 与磁盘配置均为 `HODOOPFORGE.LOCAL`；agent 锁定时不下发；
- 任何 keytab 异常，可从 `kerberos-snapshot/h<N>/keytabs.tgz` 解包恢复。
