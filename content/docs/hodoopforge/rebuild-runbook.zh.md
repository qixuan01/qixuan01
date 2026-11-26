---
title: "重建手册"
weight: 90
type: "docs"
---


> 适用：宿主机重装、容器误删、数据目录损坏
> 关联：`MANAGEMENT_MODEL.md`、`MANAGEMENT_IMPROVEMENT_PLAN.md`（M-101/M-103/M-104/M-201）

## 1. 先判断：是否需要重建

| 现象 | 处理 |
|---|---|
| 容器停止，但容器还在 | `docker start` / `hodoopforge-containers.service`，**不要 compose** |
| 容器被删除，数据目录还在 | 需要 committed 节点镜像 + 数据目录；单靠 compose 不够 |
| 容器和数据都丢失 | 先重建节点镜像/重装，再按本手册恢复 |
| 只是服务进程挂了 | 先跑 `kerberos_guard --fix`，不要重建 |

## 1.1 当前镜像限制（重要）

- 运行镜像 `bigtop/puppet:trunk-rockylinux-8` 只有约 0.7GB，**不含**本集群安装的
  Bigtop/Ambari 组件；
- 4 个容器的可写层分别约 24/73/70/75GB，软件、配置、数据都在里面；
- 因此 `docker compose up` 得到的是空容器，不是恢复；
- 重建路径只有两条：
  1. 维护窗口 `docker commit` 当前容器为节点镜像，再用该镜像 + 卷重建；
  2. 用安装脚本/blueprint 重新安装 Bigtop/Ambari。
- 在 M-101 完成前，**不要删除任何现有容器**。

## 2. 重建前必须拿到的东西

```text
ambari3/docker-compose.yml          容器拓扑/内存/端口
ambari3/blueprint.json              Ambari 服务与配置基线（scripts/export_blueprint.sh）
/var/backups/hodoopforge/<ts>/      控制面备份（databases.sql.gz + configs.tar.gz）
/etc/hodoopforge/*.env              凭据（宿主机 root 0600，需单独保管）
```

> 日常变更后执行 `sudo bash scripts/export_blueprint.sh` 更新 blueprint；
> 每日 02:30 备份自动更新。

## 2.1 Kerberos 模式重建（2026-11-26）

1. 恢复 4 节点配置与 keytab（或 `kerberos-snapshot/h<N>/keytabs.tgz`）；
2. 按顺序启动：JN → NN → DN(`/etc/hadoop/conf-dn`) → ZKFC；
3. 启动 HBase/HMS/HS2/YARN/Flink/Kafka/Spark；
4. 恢复 Ambari `security_type=KERBEROS`（DB 备份 + request 2472 记录）；
5. 启用 `kerberos_guard`（用户级 systemd），保持 `ambari-agent` 锁定；
6. 复核 `ARCHITECTURE.md` §8 健康检查。

> 禁止在恢复过程中从 Ambari 启动数据面服务。

## 3. 标准重建步骤

```bash
# 1. 起容器
#    仅当已有 committed 节点镜像时，才允许 compose up；
#    否则基础镜像没有 Bigtop/Ambari，必须先重建镜像或重新安装。
cd /home/rkam/hadoop-ops-course/ambari3
docker compose up -d
# 等待 4 个容器 healthy / Ambari 20609 可达

# 2. 恢复 MySQL 控制面
#    先起 h0 mysqld，再按需恢复 ambari/hive/ranger/oozie
sudo bash scripts/restore_drill.sh --db ambari   # 先演练到临时库
# 确认无误后，用备份中的 databases.sql.gz 恢复到正式库（维护窗口）

# 3. 导入 blueprint / 启动服务
#    Ambari UI -> Add Service / Import Blueprint，或使用
sudo bash scripts/import_blueprint.sh

# 4. 起非 Ambari 组件
sudo bash scripts/install_ops_automation.sh
bash scripts/flink_jm_ha.sh install
sudo bash scripts/kerberos_setup_kdc.sh   # 如需 KDC
sudo bash scripts/mysql_replica_setup.sh  # 重建 h3 副本

# 5. 验收
python3 scripts/watchdog.py --check
python3 scripts/config_drift_check.py
```

## 4. 已演练结果（2026-11-24）

| 演练 | 命令 | 结果 |
|---|---|---|
| 控制面恢复 | `scripts/restore_drill.sh --db ambari` | 113 表 / 约 9253 行，RTO **128s**，临时库已删除 |
| MySQL 提升/回切 | `scripts/mysql_failover_drill.sh` | h3 1s 内可写，2s 内重新成为副本，lag=0 |
| 数据面自愈 | `kerberos_guard.py --fix` | 配置漂移/keytab/服务端口 |
| 配置漂移 | `config_drift_check.py` | no drift |

## 5. 持久化卷迁移（M-101，待维护窗口）

当前数据在容器可写层，重建容器会丢数据。迁移步骤（逐节点、需停机）：

1. 停止该节点上的服务（Ambari 维护模式）；
2. `docker cp <container>:/var/lib/mysql /var/lib/hodoopforge/<node>/mysql`；
3. HDFS DataNode/NameNode、Kafka、ZK 同理复制到宿主机目录；
4. 修改 compose 增加 `volumes:` 挂载；
5. **只重建该节点**，验证数据与服务；
6. 逐节点重复，最后再切 MySQL 主库。

> 在完成 M-101 前，禁止 `docker compose up/down`；这是当前最高风险项。

## 6. 回滚

- 容器：`docker start` 原容器（若未被删除）；
- 配置：`/var/backups/hodoopforge/<ts>/configs.tar.gz`；
- Ambari：配置历史版本回滚；
- MySQL：h0 主库未动时，h3 重新指向 h0 即可；
- 管理面 unit：`systemctl disable --now <unit>`。
