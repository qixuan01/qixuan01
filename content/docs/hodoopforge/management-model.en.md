---
title: "Management Model"
weight: 110
type: "docs"
---

> **Note:** This technical guide is currently maintained in Chinese. The interactive map and product pages are fully bilingual; the detailed engineering reference below remains in Chinese until an English edition is published.


> 生效日期：2026-11-26（手工 Kerberos 模式）
> 关联计划：`MANAGEMENT_IMPROVEMENT_PLAN.md`
> 灾难重建：[`REBUILD_RUNBOOK.md`](/docs/hodoopforge/rebuild-runbook/)
> 适用范围：h0–h3 四个容器、宿主机 systemd、Ambari、监控与备份

## 0. 2026-11-26 手工 Kerberos 模式（覆盖本文旧描述）

- **Ambari `security_type=KERBEROS`**，但 `ambari-agent` 由
  `kerberos_guard` 锁定（用户级 systemd，30s）；
- 数据面 HDFS/HBase/Hive/YARN/Flink/Kafka/Spark 以**容器内手工配置**为权威，
  不再以 Ambari desired config 为准；
- 旧 60s `hodoopforge-watchdog.timer` 已停止；`kerberos_guard` 负责探活/补起；
- 禁止从 Ambari 启动/重启数据面服务；禁止手工 `systemctl start` 这些服务；
- 详细架构见 [`ARCHITECTURE.md`](/docs/hodoopforge/architecture/)，防呆见
  [`KERBEROS_GUARD.md`](/docs/hodoopforge/kerberos-guard/)。

## 1. 原则

1. **一个组件只有一个“启动责任人”**；其他机制只能探活/兜底，不能重复启动。
2. **配置只有一个“权威来源”**：Ambari 管理的服务以 Ambari desired config 为准；
   非 Ambari 组件以仓库脚本/unit 文件为准；磁盘手工修改必须回写。
3. **容器是“可变运行单元”**：软件、配置和数据都在容器可写层；
   `docker compose up` 会用基础镜像创建空容器。禁止在运行集群执行；
   真正重建需要已提交的节点镜像或重新安装。
4. **先管理面、后数据面**：MySQL → Ambari Server → Ambari Agent → 各服务。
5. **所有兜底必须可观测**：watchdog 的每次动作写日志并暴露指标。

## 2. 归属矩阵

| 组件 | 启动责任人 | 配置权威来源 | 探活/兜底 | 备注 |
|---|---|---|---|---|
| 4 个容器 | 宿主机 `hodoopforge-containers.service` | `ambari3/docker-compose.yml`（仅拓扑定义） | `hodoopforge-watchdog` | `docker start`，不跑 compose；重建需 committed image |
| MySQL h0（主） | 容器内 `mysqld.service` | `/etc/my.cnf.d/*` + Ambari | watchdog `probe_mysql` | 必须 enabled |
| MySQL h3（副本） | 容器内 `mysqld.service` | `/etc/my.cnf.d/replica.cnf` | watchdog + mgmt exporter | 异步复制，提升脚本 |
| Ambari Server | h0 `ambari-server.service` | Ambari DB / `ambari.properties` | watchdog `probe_ambari` | 必须 enabled |
| Ambari Agent | 各容器 `ambari-agent.service` | `/etc/ambari-agent/conf` | **guard 锁定** | 手工 Kerberos 模式保持 inactive |
| HDFS / YARN / HBase / Hive / Kafka(h0) / ZK / Ranger / Spark / AMS | 手工/容器内 | `/etc/...` + guard snapshot | `kerberos_guard` | Ambari 不再下发；禁止 Ambari 启停 |
| Kafka h2/h3 | 容器内 `kafka-broker.service` | `/etc/kafka/conf` + unit | watchdog `probe_kafka` | 与 h0 管理方式不同，见 M-102 |
| Flink JM1 | 手工/容器内 | `/etc/flink/conf` + keytab | guard | h0 |
| Flink JM2 | h1 `flink-jobmanager-2.service` | `/etc/flink/conf-jm2`（由 `flink_jm_ha.sh` 生成） | watchdog `probe_flink_jm2` | 与 JM1 组成 HA |
| Flink TM | 手工/容器内 | `/etc/flink/conf` + keytab | guard | 每节点最多 1 个 |
| Prometheus / Alertmanager | h1/h2 systemd | `scripts/monitoring/*.yml` | watchdog `probe_monitoring` | 主备 + 集群去重 |
| Grafana | h0 `ambari-metrics-grafana.service` | `install_grafana_dashboard.sh` | watchdog | 文件 provisioning |
| prom_proxy | h2 `prom_proxy.service` | `scripts/monitoring/prom_proxy.py` | watchdog | 统一查询入口 |
| 管理面 exporter | 宿主机 `hodoopforge-mgmt-exporter.service` | `scripts/monitoring/management_exporter.py` | watchdog / Prometheus | 新增，:9404 |
| KDC | h0/h3 `krb5kdc.service` | `scripts/kerberos_setup_kdc.sh` | guard/healthcheck | `security_type=KERBEROS` |
| 备份 | 宿主机 `hodoopforge-backup.timer` | `scripts/backup_with_throttle.sh` | mgmt exporter | 每日 02:30 |
| 巡检/自愈 | 用户级 `hodoopforge-kerberos-guard.timer` | `scripts/kerberos_guard.py` | 自身 | 30s；旧 watchdog 停止 |
| NAT | 宿主机 `hodoopforge-nat.service` | `ambari3/scripts/setup-nat-forward.sh` | watchdog / post-snapshot | 开机 refresh |

> 说明：`restart: unless-stopped` 已通过 `docker update` 应用到运行中的容器；
> compose 里的 `healthcheck` 只在下一次容器重建时生效。当前运行期的探活由
> `kerberos_guard`（30s）和宿主机 `management_exporter`（15s 抓取）负责；旧 watchdog 已停。

## 3. 启动顺序（宿主机重启）

```text
docker.service
  └─ hodoopforge-containers.service   (docker start h0..h3)
       └─ h0 mysqld
            └─ h0 ambari-server
                 └─ ambari-agent (4 节点)
                      └─ Ambari 服务（HDFS/YARN/HBase/Hive/Kafka/ZK/Ranger...）
                           └─ hodoopforge-postsnapshot.service (--all)
                                └─ hodoopforge-watchdog.timer (60s)
```

- `hodoopforge-containers.service` 只 `docker start` 已存在容器，不重建；
- 容器内 sysv 单元的启动顺序由 drop-in 保证：`mysqld` 先于 `ambari-server`；
- `post_snapshot_recover.sh --all` 负责服务级恢复；
- watchdog 负责运行期兜底。

## 4. 变更规则

| 变更类型 | 必须更新 |
|---|---|
| Ambari 服务配置 | Ambari desired config + `docs/CURRENT_STATE.md`；重启对应服务 |
| 非 Ambari 组件配置 | 仓库脚本/unit 文件 + 对应安装脚本 + 文档 |
| 容器资源/端口 | `ambari3/docker-compose.yml` + `docker update`（不重建）+ 文档 |
| 新增 systemd unit | `scripts/install_ops_automation.sh` 或对应安装脚本 + 测试 |
| 新增告警规则 | `scripts/monitoring/rules.yml` + `docs/MONITORING_PROMETHEUS.md` |
| 任何手工修改 | 当天回写仓库；`config_drift_check.py` 必须为 0 |

## 5. 禁止事项

- 禁止在运行集群执行 `docker compose up/down/restart`：基础镜像不含软件，
  会创建空容器；同时容器内数据不在卷上，会丢失。
- 禁止直接 `systemctl start` Ambari 管理的服务（应走 Ambari API，避免状态不一致）。
- 禁止把密码写入仓库；统一放 `/etc/hodoopforge/*.env`（root 0600）。
- 禁止在同一节点启动第二个 Flink TaskManager/JM（除非明确演练）。
- 禁止在未备份的情况下做 Kerberos/持久化卷等破坏性变更。

## 6. 验证入口

```bash
python3 scripts/watchdog.py --check
python3 scripts/config_drift_check.py
curl -s http://192.168.0.60:9404/metrics | head
bash scripts/kerberos_status.sh
bash scripts/mysql_replica_setup.sh status
```
