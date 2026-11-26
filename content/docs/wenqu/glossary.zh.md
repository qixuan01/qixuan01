---
title: "术语表"
weight: 90
type: "docs"
---


> 用途：读文档/开会时快速对齐。含义以本仓库当前实现为准。

---

## 1. 教学与学习科学

| 术语 | 含义 |
|---|---|
| **BKT** | Bayesian Knowledge Tracing，贝叶斯知识追踪；根据答题更新知识点掌握概率 |
| **掌握度** | BKT 输出的知识点熟练程度；用于讲解深度、复习与报告 |
| **薄弱点** | 掌握度低/错误集中的知识点 |
| **费曼技巧** | 让学生用自己的话复述，系统按完整性/准确性/表达评分 |
| **苏格拉底追问** | 通过连续问题引导学生自己发现答案 |
| **FSRS** | Free Spaced Repetition Scheduler，间隔重复调度算法 |
| **ZPD** | 最近发展区；用于选择难度合适的任务/问题 |
| **学习增益** | 前后测掌握度变化；样本不足时返回 `unknown`/`null` |

## 2. 数据平台

| 术语 | 含义 |
|---|---|
| **ODS** | 贴源层，保留原始/近原始数据 |
| **DWD** | 明细清洗层，去重、标准化、PII 脱敏 |
| **DWS** | 主题汇总层，按日/周/知识点等汇总 |
| **ADS** | 应用集市层，直接服务报表/模型/数据产品 |
| **Iceberg** | 开放表格式，支持 ACID、快照、时间旅行 |
| **HodoopForge** | 本方案的大数据底座（HDFS/YARN/Hive/Spark/Flink/Kafka/Ranger/Ambari） |
| **EduLake** | 教育数据湖综合治理与存算 |
| **DataOps** | 数据运营中台：资产/质量/血缘/SLO/数据产品/Copilot/审计 |
| **血缘** | 表/字段/作业之间的上下游关系 |
| **数据契约** | 对字段、类型、新鲜度、行数等的可执行约定 |
| **SLO** | Service Level Objective，服务目标；错误预算/燃烧率 |
| **DLQ** | Dead Letter Queue，失败消息队列 |
| **Outbox** | 事务内先落库、再异步投递的事件表，防丢事件 |
| **CDC** | Change Data Capture，变更数据捕获 |

## 3. 模型与 RAG

| 术语 | 含义 |
|---|---|
| **RAG** | Retrieval-Augmented Generation，检索增强生成 |
| **Dense/Sparse** | 向量检索/关键词检索；本方案做混合 + RRF |
| **RRF** | Reciprocal Rank Fusion，倒数排名融合 |
| **Rerank** | 对召回结果再排序；本方案有 lexical fallback |
| **Citation** | 回答引用的教材切片/来源 |
| **幻觉预算** | 对无依据回答的比例约束 |
| **QLoRA** | 量化 + LoRA 的低成本微调 |
| **SFT** | Supervised Fine-Tuning，监督微调 |
| **门禁** | 评测/格式/幻觉预算不达标则冻结发布 |
| **ASR** | Automatic Speech Recognition，语音识别（faster-whisper） |
| **TTS** | Text-to-Speech，语音合成（edge-tts） |
| **说话人分离** | Diarization，把音频按说话人切分（sherpa-onnx） |
| **VRM** | 3D 数字人模型格式；当前统一 VRM，Live2D 已退出 |

## 4. 应用与安全

| 术语 | 含义 |
|---|---|
| **LTI 1.3** | 学习工具互操作标准，用于 LMS 课程/成绩互通 |
| **xAPI** | 学习行为标准，语句写入 LRS |
| **SCORM** | 课程包标准（1.2/2004），支持导出 ZIP |
| **OIDC** | OpenID Connect，统一身份 |
| **JWT** | JSON Web Token；本方案访问令牌默认 120 分钟 |
| **token_version** | 用户令牌版本；改密/停用递增，旧令牌立即失效 |
| **tenant_id** | 租户/学校标识；应用层聚合根带此字段 |
| **自定义角色** | 租户级角色，权限 JSON 与内建角色叠加 |
| **PII** | Personally Identifiable Information，个人信息 |
| **脱敏/匿名化** | 脱敏保留可逆映射；匿名化去除可识别性；删除采用后者 + 自由文本脱敏 |
| **等保三级** | GB/T 22239-2019 第三级；本方案做技术自检，正式测评需机构 |
| **SCA** | Software Composition Analysis，软件成分分析 |
| **SBOM** | Software Bill of Materials，软件物料清单 |
| **Trivy** | 容器/镜像漏洞扫描工具（运维补充） |
| **SIEM** | 安全信息与事件管理，集中日志/告警 |

## 5. 项目与交付

| 术语 | 含义 |
|---|---|
| **Qixuan CloudBuild** | 主 CI/CD 平台（`https://as.long.kim:12131`） |
| **staging** | Qixuan 静态发布环境；宿主机 poller 拉取 |
| **RELEASE.json** | 发布包清单：版本、commit、测试、依赖哈希 |
| **poller** | 宿主机每分钟轮询 staging 并部署的 timer |
| **bind mount** | 源码/前端/文档挂载进容器，发布后重启即可生效 |
| **补丁层** | `dockerfile.gpu` 中独立 `RUN` 层，用于安全升级而不重建基础镜像 |
| **外部依赖** | 不在本仓库代码范围、需平台/学校/供应商/机构完成的项 |

---

## 6. 状态口径

| 状态 | 含义 | 证据要求 |
|---|---|---|
| **已上线** | 代码可运行且有运行证据 | 代码 + 接口/表/日志/构建 |
| **部分/边界** | 主链路可用，但有明确缺口 | 代码 + 部分运行证据 + 缺口 |
| **设计/待接** | DDL/接口/设计就绪，未形成闭环 | 设计/DDL/接口 |
| **缺口** | 已知未实现 | 缺口说明 + 计划 |
| **外部依赖** | 本仓库不能单独完成 | 责任方 + 验收标准 |

> 禁止把“有 DDL”写成“已上线”，禁止把“设计文档里有”写成“已实现”，禁止把“外部依赖”写成“已完成”。
