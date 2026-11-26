---
title: "Data Platform & DataOps"
weight: 30
type: "docs"
---

> **Note:** This technical guide is currently maintained in Chinese. The interactive map and product pages are fully bilingual; the detailed engineering reference below remains in Chinese until an English edition is published.


> 学习目标：理解数据从业务库到湖仓、再到 DataOps 证据链的路径，能独立查一次质量/血缘/SLO。
> 规范文档：[`doc/datalake/README.md`](/docs/wenqu/overview/)、[`doc/data-design/README.md`](/docs/wenqu/overview/)、`doc/function/15`

---

## 1. HodoopForge：底座

| 能力 | 组件 | 当前状态 |
|---|---|---|
| 存储 | HDFS 3.3.6，双 NN + 3 JN | HA 已验收 |
| 资源调度 | YARN CapacityScheduler | 单队列；多租户队列待 |
| 表/元数据 | Hive 4.0.1 / HMS | 运行中 |
| 批计算 | Spark 3.5.6 + Iceberg 1.11 | ThriftServer 10016 |
| 流计算 | Flink 1.20.1 | 实时入湖 RUNNING |
| 消息 | Kafka 3.4.1，3 broker | RF3 / ISR 完整 |
| 权限 | Ranger 2.7.0 | 6 服务启用；字段掩码待验证 |
| 管理 | Ambari 3.1.0 | 运行中 |
| 安全 | Kerberos / TLS / KMS | **未启用/待平台窗口** |

---

## 2. EduLake：分层与资产

```text
ODS  贴源：ods_pg_* / ods_rag_* / ods_llm_* / ods_emotion_*
 ↓
DWD  清洗：dwd_learning_sessions / dwd_conversation_messages / dwd_mastery_states ...
 ↓
DWS  汇总：dws_knowledge_mastery / dws_class_weekly / dws_rag_quality_daily ...
 ↓
ADS  应用：ads_teacher_class_dashboard / ads_student_daily_plan / ads_model_health_report ...
```

当前基线：

- Iceberg **66 张表**；
- 业务库 **105 张表**；
- warehouse：`hdfs://qixuandata/iceberg-warehouse-ha`；
- PII：DWD 全量 `pii_masked=true`；
- 质量/血缘/契约/SLO 由 DataOps 消费。

---

## 3. DataOps：回答五个问题

| 问题 | 页面/能力 | 证据 |
|---|---|---|
| 有哪些资产？谁负责？服务谁？ | 资产目录、字段契约、数据产品 SLA | `/ops/assets`、`datalake/contracts` |
| 数据可信吗？哪张表/分区/规则失败？ | 质量与信任、门禁 | `/ops/quality`、`quality_gate.py` |
| 从哪来、到哪去？变更影响谁？ | 血缘、影响分析 | `/ops/lineage`、`data_lineage` |
| 模型/RAG 能不能发布？ | 模型门禁、RAG 评测、SLO | `/ops/models`、`/ops/rag-trace` |
| 治理带来什么价值？ | 价值总览、学习增益、成本 | `/ops/value`、成本价值 |

### 3.1 质量与门禁

- 规则：空值、重复、范围、行数、契约；
- 结果区分“失败/空表/无新增”，避免“全绿”误导；
- 门禁阻断 DWS/ADS 的坏数据扩散。

### 3.2 血缘与影响

- 作业级 + 字段级血缘；
- 改口径前先看下游影响；
- 支持 API/可视化；
- 外部作业未上报 OpenLineage 的部分要标注覆盖边界。

### 3.3 SLO 与事件

- RAG/质量/模型三条错误预算；
- 预算燃烧触发自动降级/恢复；
- 事件可确认、可追踪 owner；
- 未配置 Webhook 时降级为控制台。

### 3.4 Copilot / NL2SQL

- 先过语义层对齐指标，再生成受控 SQL；
- 只允许白名单表与 SELECT；
- 查询审计记录 SQL、表、字段、PII 命中、行数、耗时。

---

## 4. 数据最小化与隐私

- 用户 ID 入湖前 SHA-256 + salt；
- DWD 再做身份证/邮箱/手机号掩码；
- Kafka 只传长度、耗时、token 数、chunk id，不传正文；
- 答案采样默认关闭，显式开启才采；
- 数据产品合同明确字段与消费者。

> 应用侧个人信息导出/删除、留存销毁、审计哈希链见 [`06-security-compliance.md`](/docs/wenqu/security-compliance/)。

---

## 5. 动手练习

### 5.1 查质量

1. 打开 DataOps → 质量与信任；
2. 找一张失败表（如果有），下钻到规则/分区；
3. 记录：表、规则、失败行数、owner、下一步。

### 5.2 查血缘

1. 打开 DataOps → 血缘与影响；
2. 搜索 `dwd_conversation_messages`；
3. 说出它影响哪些 DWS/ADS 表。

### 5.3 查 SLO

1. 打开 SLO 预算；
2. 看 RAG/质量/模型三条预算；
3. 解释“燃烧率”与“自动降级”的关系。

---

## 6. 自测题

1. ODS/DWD/DWS/ADS 各解决什么问题？
2. 质量门禁在哪个环节阻断？为什么不能只在报表层检查？
3. 血缘覆盖不到 100% 时，如何对外表达？
4. Kafka 只传元数据，那对话正文从哪里入湖？
5. 数据平台多租户还缺什么？责任方是谁？
