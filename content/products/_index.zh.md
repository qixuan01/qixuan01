---
title: "产品与服务"
description: "深圳市启煊软件有限公司核心产品与专业服务 — 自主研发·全栈可控·国产替代"
---

# 产品与服务

## 在线体验

<div class="demo-cards-grid">
  <a href="https://erp.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-erp demo-card-wide">
    <div class="demo-card-icon">🏢</div>
    <div class="demo-card-title">中小企业 ERP 平台</div>
    <div class="demo-card-desc">一体化企业资源管理，进销存、财务、人事全覆盖</div>
    <img src="/images/erp-platform.jpg" alt="ERP平台界面" class="demo-card-preview">
    <div class="demo-card-url">erp.qixuan.vip →</div>
  </a>
  <a href="https://hds.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-hadoop demo-card-with-preview">
    <div class="demo-card-icon">📊</div>
    <div class="demo-card-title">HadoopForge 平台</div>
    <div class="demo-card-desc">企业级 Hadoop 集群智能运维与自动化部署平台</div>
    <img src="/images/hadoopforge-platform.jpg" alt="HadoopForge平台界面" class="demo-card-preview">
    <div class="demo-card-url">hds.qixuan.vip →</div>
  </a>
  <a href="https://edu.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-edu demo-card-with-preview">
    <div class="demo-card-icon">🎓</div>
    <div class="demo-card-title">悦学AI智伴</div>
    <div class="demo-card-desc">FSRS × 数字人 · 国内首创 · 完全离线 AI 教育平台</div>
    <img src="/images/ai-edu-platform.jpg" alt="悦学智伴平台界面" class="demo-card-preview">
    <div class="demo-card-url">edu.qixuan.vip →</div>
  </a>
  <a href="https://emsa.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-ems demo-card-with-preview">
    <div class="demo-card-icon">⚡</div>
    <div class="demo-card-title">EMS 能源管理平台</div>
    <div class="demo-card-desc">AI 驱动光储充一体化能源管理系统（管理端）</div>
    <img src="/images/ems-platform.jpg" alt="EMS能源管理平台界面" class="demo-card-preview">
    <div class="demo-card-url">emsa.qixuan.vip →</div>
  </a>
  <a href="https://emsu.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-ems">
    <div class="demo-card-icon">🔋</div>
    <div class="demo-card-title">EMS 能源用户平台</div>
    <div class="demo-card-desc">用户侧智慧能源监控、峰谷套利与 VPP 接入（用户端）</div>
    <div class="demo-card-url">emsu.qixuan.vip →</div>
  </a>
</div>

---

## <span id="hadoopforge">核心产品</span>

### HadoopForge — 企业级 Hadoop 集群智能运维平台

填补 Apache Ambari 官方 Stack 版本空白，做开源社区做不到的事。

HadoopForge 是深圳市启煊软件有限公司自主研发的企业级 Hadoop 集群全生命周期管理平台，基于 Apache Ambari 3.0.0 + Bigtop 3.5.0 生态构建，国内首个完成适配的商业产品，解决企业大数据基础设施部署、运维与信创合规的核心痛点。

#### 解决的核心问题

| 行业痛点 | HadoopForge 解法 |
|---|---|
| Ambari 官方 Stack 停留旧版，无法管理 Bigtop 3.5.0 组件 | 完整重写 BIGTOP/3.5.0 Stack，15+ 服务 metainfo.xml |
| Hive 4.0.1 与 Ambari 3.x 完全不兼容 | 重写 hive_check.py，Beeline 替代废弃 HiveCLI，修复 auth 大小写问题 |
| Cloudera 停止免费版，企业两难 | 开源社区版免费，企业版成本降低 60%+，无厂商锁定 |
| 2027 年信创 100% 替代 deadline | 完全基于 Apache 开源生态，支持国产芯片与操作系统 |
| 传统部署耗时 2-3 周，成功率仅 70% | 可视化拖拽编排，4-6 小时完成部署，成功率 98% |

#### 产品核心功能

- **BIGTOP/3.5.0 完整 Stack 定义** — 15+ 服务 metainfo.xml 重写，${stack_version} 动态映射，Service Advisor 逻辑重写，兼容 Hive 4.0.1 / Spark 3.5.0 / Kafka 3.7.0
- **可视化集群编排引擎** — 拖拽式集群拓扑设计，自动生成部署计划，优化资源配置
- **一键自动化部署** — 双引擎（Ambari + Bigtop）兼容，分钟级完成上线，成功率 98%
- **AI 智能运维大脑** — LSTM + 孤立森林算法，故障预测准确率 92%，配置漂移检测与自动修复
- **企业安全集成** — Kerberos + Ranger + OpenLDAP 完整安全体系
- **Hive 4.0.1 深度适配** — 业界首个完整解决 Hive 4.0.1 兼容性问题的商业产品

#### 支持的生态组件（Bigtop 3.5.0）

- **存储引擎**: HDFS、HBase、Kudu
- **计算引擎**: Spark 3.5.0、Hive 4.0.1、Flink、Storm
- **消息队列**: Kafka 3.7.0、Pulsar
- **数仓 / OLAP**: Doris、ClickHouse、Hudi
- **安全管控**: Ambari、Ranger、Atlas、Kerberos
- **监控可观测**: Grafana、Prometheus

#### 客户验证数据

- **城商行客户（80 节点）** — 部署周期从 3 周缩短至 5 小时，零停机迁移
- **电信运营商（200 节点）** — 日均处理 1.2PB，Hive 4.0.1 稳定运行，AI 预警准确率 92%
- **制造企业（120 节点）** — 配置漂移零发生，运维人力降低 40%，年节省 120 万

> **500+ 节点 · 12 个月 · 0 生产事故** · 基于 Ambari 3.0.0 + Bigtop 3.5.0

---

## 产品版本

### <span id="community">社区版（免费）</span>
- 完整 BIGTOP/3.5.0 Stack 定义，快速体验最新特性
- Apache 开源生态，上下游社区项目丰富
- GitHub 开源，开发者社区支持
- **完全免费使用**

### <span id="enterprise">企业版</span>
- 专业商业支持团队（电话、IM、邮件、现场）
- 7×24 最高优先级故障响应
- 专家支持：规划 / 实施 / 主动巡检 / 故障协查 / 知识转移 / 重要时期保障
- AI 运维大脑高级功能（故障预测 + 自动修复）
- 信创合规专项支持

### <span id="cloud">云托管版</span>
- SaaS 化快速上线，轻松管理云端 Hadoop 集群
- 支持主流对象存储（AWS S3、阿里云 OSS、MinIO 等）
- 弹性扩缩容，按需付费
- 统一权限安全增强

---

## 专业服务

### 咨询服务
- 大数据基础设施规划与架构设计
- Ambari / Bigtop 迁移评估与方案设计
- 信创合规适配咨询（2027 年替代目标）
- 数字化转型战略咨询

### 实施服务
- HadoopForge 集群部署实施
- 旧版 Ambari / Cloudera 迁移服务
- 系统集成与定制开发

### 运维服务
- 7×24 技术支持热线
- 集群健康监控与告警
- AI 驱动性能优化
- 故障应急响应（紧急：1 小时内）

### 培训服务
- Hadoop / Ambari 原理与实操培训
- HadoopForge 管理员认证课程
- 现场 + 在线双模式
- 企业定制化培训方案

---

## 技术支持响应级别

| 级别 | 响应时间 | 适用场景 |
|---|---|---|
| 紧急 P0 | ≤ 1 小时 | 生产集群完全不可用 |
| 高 P1 | ≤ 4 小时 | 核心功能受损 |
| 中 P2 | ≤ 8 小时 | 部分功能异常 |
| 低 P3 | ≤ 24 小时 | 咨询与优化建议 |

---

## 竞争优势

- **填补版本空白** — 国内首个完成 Ambari 3.0.0 + Bigtop 3.5.0 完整适配
- **Hive 4.0.1 率先兼容** — 业界唯一完整解决方案，社区 2 年未解决的问题
- **成本降低 60%+** — 对比 Cloudera，无厂商锁定
- **信创原生** — 完全基于 Apache 开源生态，支持国产芯片与操作系统
- **AI 运维** — LSTM + 孤立森林，故障预测准确率 92%


---

## <span id="edge-ai">边缘AI推理加速产品线</span>

### 鸿源边缘AI推理加速器

全球首个将 BitNet b1.58 量化算法落地到 FPGA 硬件的加速器。BitNet W1.58 三值量化将权重约束为 {-1, 0, +1}，把乘法完全替换为加减法，让每一块 ¥200 级国产 FPGA 都能运行 AI Transformer 推理。

**2025年深圳RISC-V与鸿蒙创新大赛 · 架构创新奖 🏆**

#### 核心指标

| 指标 | 数值 |
|---|---|
| 存储压缩比 | 16x |
| 稀疏权重自动跳过 | 33% |
| 矩阵计算误差 | 0（256/256 完全一致） |
| 硬件 BOM 成本 | &lt;¥200 |
| 国产化率 | 100%（安路FPGA + RISC-V + 鸿蒙LiteOS） |
| 全链路验证 | 6/6 全部 PASS，实机运行非仿真 |
| 全栈代码量 | 16,487 行（RTL + OS + 推理引擎） |

#### 技术架构（四层全栈自主）

- **应用层**：Transformer 推理引擎（QKV 投影 / 多头注意力 / FFN 全链路）
- **系统层**：HarmonyOS LiteOS（任务调度 / IPC / 内存管理）
- **加速层**：BitNet 16×16 Tile 阵列（三值矩阵乘法 → 加减法，33% 稀疏跳过）
- **硬件层**：安路 EG4X20 FPGA（20K LUT）· PicoRV32 RISC-V @50MHz · 128MB SDRAM

#### 产品规格与定价

| 阶段 | 产品 | 目标客户 | 价格 |
|---|---|---|---|
| Phase 1（当前） | AI推理开发板 | 高校 / 创客 / 研发 | 联系获取 |
| Phase 2（6–12月） | 视觉推理模块（OV2640 + FPGA + SDK） | 工业检测 / 安防 / 农业 | 联系获取 |
| Phase 3（12–18月） | Wi-Fi AI 边缘节点 | 智慧工厂 / 农业IoT | 联系获取 |
| Phase 4（18–24月） | BitNet IP核授权（RTL IP） | FPGA / SoC 厂商 | 联系获取 |

#### 目标应用场景
- 高校 AI 硬件实验室 · FPGA AI 课程实验平台
- 工业视觉检测 · &lt;100ms 延迟，完全离线
- 智慧农业 IoT · 低功耗、田间无网可用
- 军工 / 政府研究院 · 100% 国产化，无出口管制风险

[了解详情 →](/edge-ai/hongyuan-accelerator/)

---

### 智能终端AI中间件（Smart Terminal AI）

面向 IoT / 工业嵌入式场景的边缘 AI 分层推理平台，填补"端侧跑不了模型、纯云端不可靠"之间的产品空白，让每一台 MCU 设备都能用自然语言回答设备状态。

#### 核心数据

| 指标 | 数值 |
|---|---|
| MCU 主频 | 240MHz RISC-V |
| SRAM 峰值占用 | 128KB |
| 本地推理延迟 | &lt;100ms（Tier 1 关键词） |
| 代码行数 | 3,500+（MVP 全模块） |

#### 三层渐进式推理架构

- **Tier 1 关键词匹配**：&lt;100ms · 存于 Flash · 零依赖 · 离线可用
- **Tier 2 规则引擎 NLP**：&lt;500ms · 19 种意图识别 · 本地运行
- **Tier 3 云端 LLM**：&lt;3s · WiFi 可用时调用云端大模型

推理调度器根据查询复杂度 + 网络状态自动选择最优路径，Tier 3 失败自动降级至 Tier 2。

#### 四大核心组件
- **AI 推理引擎库** — 可移植到任意 RISC-V/ARM MCU + RTOS，统一 `ai_engine_query()` API
- **智能 CLI 框架** — 自然语言与传统命令混合输入，TAB 补全，零依赖
- **设备状态监控 SDK** — CPU / 内存 / 温度 / 网络 / 传感器标准化采集接口
- **FPGA 加速模块**（可选）— 推理延迟压缩至 200ms 以内，理论加速比 50x

#### 商业模式
- SDK 授权：按设备量阶梯，联系获取
- 云端 LLM 推理服务：按调用计费，联系获取
- 定制开发：联系获取

[了解详情 →](/edge-ai/smart-terminal/)

---

## <span id="ai-education">AI伴学产品线</span>

### 悦学智伴（Otowyue Learn AI）

国内首创 FSRS × VRM 数字人深度融合的 AI 教育平台，完全离线部署，数据不出设备。以情感感知为核心，FSRS 科学记忆为引擎，VRM 数字人为载体，打造"有温度的AI老师"。

#### 核心数据

| 指标 | 数值 |
|---|---|
| 情绪识别准确率 | 92% |
| FSRS 记忆保留率 | 93%+ |
| 学习效率提升 | 3x（对比传统方法） |
| 端到端语音响应 | &lt;800ms |
| 兼容大模型数量 | 11+ |
| 生产级代码量 | 60,000+ 行 |

#### 五大核心创新

- **情感感知引擎** — 文本 / 语音 / 表情三通道多模态融合，92% 准确率，8 种情绪类型
- **FSRS × 数字人（国内首创）** — MIT 开源 FSRS 科学记忆算法 + VRM 数字人深度融合，记忆保留率提升 42%
- **知识图谱导航** — 覆盖 K-12 全学科，前置/后置依赖映射，自动识别学习瓶颈
- **四角色 AI 协作** — AI 教师 / AI 助教 / AI 顾问 / AI 心理辅导协同，模拟真实教学团队
- **VRM 数字人交互** — 拟人化数字教师，音素级 MFA 发音评测，11+ 大模型兼容

#### 完全离线架构

技术栈：**Ollama + Sherpa-ONNX + MeloTTS + VRM + FSRS**

- 视频不离开设备，仅传输情绪标签，符合学校内网数据安全要求
- 无网络可运行，适用于偏远地区学校
- Apache 2.0 开源协议，自由定制，无供应商锁定
- 11+ 大模型兼容，LLM 无关设计

#### 产品版本与定价

| 版本 | 目标客户 | 定价 |
|---|---|---|
| ToB 机构版 | K12 学校 / 教培机构 / 企业培训 | 联系获取 |
| ToC 家庭版 | 学生家长 / 个人学习者 | 联系获取 |
| ToG 政务版 | 教育局 / 乡村振兴项目 | 联系获取 |

#### 社会价值
- 覆盖乡村学校 200+，惠及学生 10 万+，助力教育公平
- 情绪问题识别率 92%，提供早期心理健康预警
- 减少教师 50% 重复劳动，教师工作效率提升 60%

[了解详情 →](/ai-education/)


---

## <span id="digital-transformation">数字化变革专项</span>

### 中小企业一体化 ERP 平台

面向中小企业数字化转型的核心痛点，启煊软件提供开箱即用的一体化 ERP 解决方案。整合**进销存、财务管理、人力资源、客户关系、采购供应链**五大核心模块，以业界最佳实践为蓝本，帮助企业实现从"经验驱动"到"数据驱动"的根本性转变。

![ERP平台系统界面](/images/erp-platform.jpg)

#### 五大核心模块

<div class="erp-modules-grid">
  <div class="erp-module-card">
    <div class="erp-module-icon">📦</div>
    <h4>进销存管理</h4>
    <p>采购入库、销售出库、库存预警、多仓管理全链路打通。实时库存可视化，自动生成补货建议，库存周转率提升 30%+。</p>
    <ul>
      <li>多仓库 / 多批次管理</li>
      <li>条码 / 扫码作业</li>
      <li>库存预警与自动补货</li>
      <li>出入库流水完整追溯</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">💰</div>
    <h4>财务管理</h4>
    <p>总账、应收应付、成本核算、利润分析一体化。与业务数据实时联动，自动生成财务报表，财务关账效率提升 60%+。</p>
    <ul>
      <li>总账与明细账管理</li>
      <li>应收 / 应付自动对账</li>
      <li>多维度成本分析</li>
      <li>财务报表自动生成</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">👥</div>
    <h4>人力资源</h4>
    <p>员工档案、考勤排班、薪酬计算、绩效考核数字化管理。HR 事务处理效率提升 50%，员工自助服务减少 HR 重复工作。</p>
    <ul>
      <li>员工全生命周期管理</li>
      <li>智能排班与考勤</li>
      <li>薪酬自动核算</li>
      <li>绩效考核与目标管理</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">🤝</div>
    <h4>客户关系（CRM）</h4>
    <p>销售线索、客户跟进、合同管理、售后服务全流程管理。业界最佳实践漏斗模型，销售转化率平均提升 25%+。</p>
    <ul>
      <li>线索 → 商机 → 合同漏斗</li>
      <li>客户画像与分类管理</li>
      <li>销售预测与业绩分析</li>
      <li>售后工单全程追踪</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">🔗</div>
    <h4>采购供应链</h4>
    <p>供应商管理、询报价、采购订单、到货验收全流程数字化。供应商评级体系，采购成本降低 10-15%，交期准时率提升。</p>
    <ul>
      <li>供应商档案与评级</li>
      <li>在线询报价管理</li>
      <li>采购订单全程追踪</li>
      <li>到货验收与质量管控</li>
    </ul>
  </div>
</div>

#### 业界最佳实践落地

| 实践领域 | 传统方式 | 启煊ERP方案 | 效益提升 |
|---|---|---|---|
| 库存管理 | Excel手工记录，信息滞后 | 实时库存可视化，自动预警 | 库存周转提升30%+ |
| 财务关账 | 月末人工汇总，耗时1-2周 | 业务实时联动，随时关账 | 关账效率提升60% |
| 采购流程 | 线下审批，流程不透明 | 线上审批，全程留痕 | 采购成本降低10-15% |
| 销售管理 | 销售数据分散，难以追踪 | 漏斗可视化，实时数据看板 | 转化率提升25%+ |
| HR管理 | 考勤/薪资手工核算 | 自动化计算，员工自助 | HR效率提升50% |

#### 产品特色

- **开箱即用**：标准化行业模板，1周内完成部署上线
- **轻量灵活**：SaaS模式，无需购置服务器，按需付费
- **数据安全**：支持私有化部署，数据完全自主可控
- **移动办公**：全功能移动端App，随时随地处理业务
- **开放接口**：标准 RESTful API，与电商、物流、财税系统无缝对接

#### 适用规模与定价

| 版本 | 适用规模 | 核心功能 | 价格 |
|---|---|---|---|
| 创业版 | 1-20人 | 进销存 + 基础财务 | 联系获取 |
| 成长版 | 20-100人 | 全模块 + CRM | 联系获取 |
| 专业版 | 100-500人 | 全模块 + 定制 + 私有化 | 按需报价 |

[立即体验 ERP 平台 →](https://erp.qixuan.vip){target="_blank"}　　[联系我们获取方案 →](/contact/)
