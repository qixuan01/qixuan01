---
title: "问渠 DataOps-AI"
description: "问渠 DataOps-AI · 教育数据智能闭环平台 — 从课堂到数据，从数据回到课堂，全链路闭环的教育数字化解决方案"
keywords: "问渠,DataOps,AI教育平台,教育数据湖,EduLake,RAG教学,BKT掌握度,教育智能,数据治理,DataOps平台"
---

## 平台定位

问渠 DataOps-AI 不是一个单点工具，而是一套**教育数据智能闭环**：学生在课堂里产生的对话、练习、互动与报告，经过数据平台入湖、治理与建模，再以模型评测、RAG 与 DataOps 数据产品反哺教学。

平台由四层构成：**L4 教学应用**、**L2 DataOps 数据运营**、**L1/L2 数据与模型底座**，以及横向的**模型 / 安全 / 交付**能力。交互地图上的 38 个节点，就是这四层能力的完整空间关系。

### 核心能力

<div class="qs-feature-grid">
  <div class="qs-feature-card">
    <div class="qs-f-icon">🧠</div>
    <h4>教学对话 + RAG</h4>
    <p>教材 RAG、引用溯源、多轮对话、打断与降级；GPU ASR 转写与说话人分离，VRM 口型与字幕同步。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">📈</div>
    <h4>练习 · BKT 掌握度</h4>
    <p>答题落库、BKT 掌握度、薄弱点与复习优先级；练习数据入湖，供报告与 DataOps 消费。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🏫</div>
    <h4>课堂互动与任务</h4>
    <p>签到、投票、抢答、讨论、作业、问卷、审批与直播；教师实时看到参与率与选项分布。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🎬</div>
    <h4>互动视频与 AI 工具台</h4>
    <p>时间点测验、弹幕、视频版本；出题、文档问答、教案/PPT、作文/代码批阅与教学质检。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🔐</div>
    <h4>隐私 · 留存 · 审计</h4>
    <p>本人数据导出、删除申请、匿名化/脱敏、≥180 天留存、SHA-256 哈希链操作审计。</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛡️</div>
    <h4>等保三级技术自检</h4>
    <p>16 项符合 / 7 项部分 / 5 项外部 / 0 项不符合，技术自检 84.8%，正式测评由第三方完成。</p>
  </div>
</div>

## 四层架构

### 四层架构拆解

<div class="qs-arch">
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L4 教学应用</div>
    <div>
      <h4>学生 / 教师 / 管理员入口与教学闭环</h4>
      <p>认证与多校、课程章节知识点、教学对话、练习与 BKT、学习报告、课堂互动、学习支持、互动视频、任务扩展、AI 工具台、系统管理、隐私留存。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L2 DataOps</div>
    <div>
      <h4>资产、质量、血缘、SLO、数据产品与 Copilot</h4>
      <p>资产目录与数据契约、质量门禁、字段级血缘与影响分析、SLO 与事件、数据产品 API、NL2SQL Copilot、PII 治理、巡检恢复、告警值班与价值报表。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L1/L2 底座</div>
    <div>
      <h4>PostgreSQL · Redis · Qdrant · Kafka · Flink · Iceberg · Spark · Ollama</h4>
      <p>105 张业务表、教材向量库、实时事件总线、Kafka → Iceberg 实时入湖、Spark Thrift 查询入口，以及本地 LLM 与 GPU ASR。</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">横向能力</div>
    <div>
      <h4>模型 / 安全 / 交付</h4>
      <p>30×3 模型评测门禁、JWT + 四级角色 + 自定义角色 + 多租户、Prometheus/SLO/Webhook 可观测、LTI/xAPI/SCORM 集成、等保合规与 CI/CD 发布。</p>
    </div>
  </div>
</div>

## 教学闭环：一条学习数据如何入湖

1. **学生在课堂对话**：教材 RAG 回答并给出引用，GPU ASR 完成转写与说话人分离。
2. **练习与掌握度**：答题落库，BKT 更新掌握度，生成薄弱点与复习优先级。
3. **报告与成就**：学习报告五页签、成就/积分、PDF/HTML 导出；无数据时返回 unknown，不编造。
4. **数据入湖**：PostgreSQL → Kafka → Flink → Iceberg，批流同源，ACID 快照可回溯。
5. **DataOps 治理**：质量规则与门禁、字段级血缘、SLO 与事件、PII 路径与脱敏策略。
6. **反哺教学**：报表、数据产品 API 与 Copilot 把数据结论送回教师与管理者的工作台。

## 安全、合规与交付

| 维度 | 当前口径 |
|---|---|
| 测试 | 360 passed / 0 failed |
| 等保三级技术自检 | 84.8%（16 符合 / 7 部分 / 5 外部 / 0 不符合） |
| 隐私 | 导出/删除、匿名化/脱敏、留存 ≥180 天、SHA-256 审计链 |
| 多租户 | 应用层 JWT + 四级角色 + 自定义角色 + 双租户集成测试 |
| 交付 | Qixuan CloudBuild v7，360 tests、SCA/SBOM、RELEASE.json、健康检查与回滚 |
| 外部依赖 | 正式等保测评、Kerberos/TLS、万人在线、原生 APP、650+ 正式课单需合作方完成 |

> 地图中的状态口径：绿色 = 已上线（代码 + 运行证据），黄色 = 部分/边界，靛蓝 = 设计/待接，红色 = 缺口，灰色 = 外部依赖。我们坚持“不把有代码当已上线，不把外部依赖当已完成”。

[返回交互地图 ↑](#interactive-map)　　[获取方案与演示 →](/contact/)
