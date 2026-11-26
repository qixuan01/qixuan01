---
title: "运维自动化"
weight: 100
type: "docs"
---


> 交互地图：[`lake-map.html`](/maps/hodoopforge-lake-map.html) · 当前状态：[`CURRENT_STATE.md`](/docs/hodoopforge/current-state/)

> 目标：把“快照后手工巡检 + 修 NAT + 修 Kafka 元数据 + 修 Ambari 向导”固化成集群管理的一部分。

## 0. 当前状态（2026-11-26）

- 旧的 60s `hodoopforge-watchdog.timer` **已停止**；
- 新增用户级 `hodoopforge-kerberos-guard.timer`（30s），负责：
  锁 `ambari-agent`、恢复 Kerberos 配置漂移、补起数据面、保存 keytab 快照；
- `hodoopforge-healthcheck.timer` 仍每 10 分钟只读巡检；
- guard **不调用宿主 `systemctl stop/disable`**，不会触发 polkit 密码弹窗；
- 详见 [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/)。

## 1. 已安装的 systemd 单元

| 单元 | 类型 | 触发 | 动作 |
|---|---|---|---|
| `hodoopforge-postsnapshot.service` | oneshot | 开机（docker 就绪后 45s） | `post_snapshot_recover.sh --all` |
| `hodoopforge-healthcheck.service` | oneshot | 由 timer 调用 | `post_snapshot_recover.sh --check` |
| `hodoopforge-healthcheck.timer` | timer | 开机 5min 后，每 10min | 只巡检，不改动 |
| `hodoopforge-watchdog.service` | oneshot | **已停止** | 旧 simple-auth 自愈，不再使用 |
| `hodoopforge-watchdog.timer` | timer | **已停止** | 由 kerberos_guard 取代 |
| `hodoopforge-kerberos-guard.timer` | 用户 timer | 每 30s | 锁 agent、恢复配置、补起数据面 |
| `hodoopforge-logclean.service` | oneshot | 由 timer 调用 | `cleanup_old_logs.sh 14` |
| `hodoopforge-logclean.timer` | timer | 每日 03:30 | 清理 14 天前轮转日志，防止磁盘再次被审计日志占满 |
| `hodoopforge-nat.service` | oneshot | 开机 | `setup-nat-forward.sh refresh`（已有） |

安装：

```bash
sudo bash scripts/install_ops_automation.sh
```

Ambari 凭据放在 root-only 文件，systemd 通过 `EnvironmentFile` 注入：

```bash
/etc/hodoopforge/ambari.env   # AMBARI_USER=... / AMBARI_PASS=...  (chmod 600)
```

> 该文件仅 root 可读。手工以普通用户执行脚本时，请先 `export AMBARI_PASS=...`，
> 或使用 `sudo -E bash scripts/...`；systemd 单元已通过 `EnvironmentFile` 自动注入。

日志：

```text
/var/log/hodoopforge-postsnapshot.log
/var/log/hodoopforge-healthcheck.log
/var/log/hodoopforge-nat-refresh.log      (按需)
/var/log/hodoopforge-kafka-hairpin.log    (按需)
/var/log/hodoopforge-wizard-reset.log     (按需)
/var/log/hodoopforge-logclean.log         (每日日志清理)
~/.hodoopforge-kerberos/kerberos-guard.log  (30s guard)
```

## 2. `post_snapshot_recover.sh` 能力

```bash
bash scripts/post_snapshot_recover.sh --check    # 只巡检
bash scripts/post_snapshot_recover.sh            # 拉起服务 + Flink TM
bash scripts/post_snapshot_recover.sh --fix-nat  # 额外修宿主机 DNAT + 容器 hairpin
bash scripts/post_snapshot_recover.sh --fix-kafka# 额外修 h2/h3 advertised（会滚动重启）
bash scripts/post_snapshot_recover.sh --reset-wizard
bash scripts/post_snapshot_recover.sh --all      # 以上全部
```

巡检内容：

1. Ambari 服务状态（ZK/HDFS/YARN/MR2/Hive/HBase/Kafka/Spark/Flink/Ranger）
2. Flink TaskManager（以 REST `/taskmanagers` 为准）
3. 宿主机 NAT：9092/9093/9094 共 6 条 DNAT
4. 容器 hairpin：h0 的 3 条 `192.168.0.60` 规则
5. Kafka `advertised.listeners`：h0=9092 / h2=9093 / h3=9094
6. HDFS HA active/standby
7. Flink 作业与 checkpoint
8. Ambari 告警统计
9. Ambari HA 向导 persist（仅 `--reset-wizard`）

## 3. 自动化边界（重要）

| 场景 | 是否自动 | 说明 |
|---|---|---|
| 宿主机重启 | ✅ | `hodoopforge-postsnapshot.service` 自动执行 `--all` |
| 拍快照后**未重启**（挂起/恢复） | ❌ | 不会触发开机服务；建议快照工具恢复后调用一次 `--all` |
| 服务/进程被 SIGTERM | ✅ | 开机服务或手工 `--all` 会拉起 |
| NAT 规则丢失 | ✅ | `--fix-nat` 重建（`--all` 包含） |
| 容器 hairpin 丢失 | ✅ | `--fix-nat` 重建 |
| h2/h3 advertised 漂移 | ✅ | `--fix-kafka` 自动改配置并滚动重启 |
| h0 advertised 漂移 | ⚠️ | Ambari 管理，脚本只报告；需在 Ambari 改 `kafka-broker` 并重启 |
| 容器重建 | ❌ | h2/h3 的 `server.properties` 会丢；需重跑 `--fix-kafka` |
| 数据修复（missing blocks 等） | ❌ | 只做可用性恢复，不碰数据 |

## 4. 建议的日常动作

1. **拍快照/恢复后**：执行一次
   ```bash
   bash scripts/post_snapshot_recover.sh --all
   ```
   或让快照工具在恢复后调用同一命令。
2. **每天看一次**：
   ```bash
   tail -50 /var/log/hodoopforge-healthcheck.log
   systemctl list-timers hodoopforge-healthcheck.timer
   ```
3. **容器重建后**：
   ```bash
   bash scripts/post_snapshot_recover.sh --fix-nat --fix-kafka
   ```

## 5. 卸载

```bash
sudo systemctl disable --now hodoopforge-healthcheck.timer
sudo systemctl disable hodoopforge-postsnapshot.service
sudo rm -f /etc/systemd/system/hodoopforge-postsnapshot.service \
           /etc/systemd/system/hodoopforge-healthcheck.service \
           /etc/systemd/system/hodoopforge-healthcheck.timer
sudo systemctl daemon-reload
```
