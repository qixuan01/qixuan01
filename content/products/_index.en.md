---
title: "Products & Services"
description: "Core products and professional services of Shenzhen Qixuan Software Co., Ltd. — Self-developed · Full-stack Controllable · Domestic Substitution"
---

# Products & Services

## Live Demo

<div class="demo-cards-grid">
  <a href="https://erp.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-erp demo-card-wide">
    <div class="demo-card-icon">🏢</div>
    <div class="demo-card-title">SME ERP Platform</div>
    <div class="demo-card-desc">All-in-one enterprise resource management — inventory, finance, HR</div>
    <img src="/images/erp-platform.jpg" alt="ERP Platform Interface" class="demo-card-preview">
    <div class="demo-card-url">erp.qixuan.vip →</div>
  </a>
  <a href="https://hds.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-hadoop demo-card-with-preview">
    <div class="demo-card-icon">📊</div>
    <div class="demo-card-title">HadoopForge Platform</div>
    <div class="demo-card-desc">Enterprise Hadoop cluster intelligent O&amp;M and automated deployment</div>
    <img src="/images/hadoopforge-platform.jpg" alt="HadoopForge Platform Interface" class="demo-card-preview">
    <div class="demo-card-url">hds.qixuan.vip →</div>
  </a>
  <a href="https://edu.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-edu demo-card-with-preview">
    <div class="demo-card-icon">🎓</div>
    <div class="demo-card-title">Otowyue Learn AI</div>
    <div class="demo-card-desc">FSRS × Digital Human · China First · Fully Offline AI Education</div>
    <img src="/images/ai-edu-platform.jpg" alt="Otowyue Learn AI Platform" class="demo-card-preview">
    <div class="demo-card-url">edu.qixuan.vip →</div>
  </a>
  <a href="https://emsa.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-ems demo-card-with-preview">
    <div class="demo-card-icon">⚡</div>
    <div class="demo-card-title">EMS Admin Platform</div>
    <div class="demo-card-desc">AI-powered solar-storage-charging energy management system (admin)</div>
    <img src="/images/ems-platform.jpg" alt="EMS Admin Platform Interface" class="demo-card-preview">
    <div class="demo-card-url">emsa.qixuan.vip →</div>
  </a>
  <a href="https://emsu.qixuan.vip" target="_blank" rel="noopener" class="demo-card demo-card-ems">
    <div class="demo-card-icon">🔋</div>
    <div class="demo-card-title">EMS User Platform</div>
    <div class="demo-card-desc">User-side smart energy monitoring, peak-valley arbitrage &amp; VPP access</div>
    <div class="demo-card-url">emsu.qixuan.vip →</div>
  </a>
</div>

---

## <span id="hadoopforge">Core Product</span>

### HadoopForge — Enterprise Hadoop Cluster Intelligent O&M Platform

Filling the Apache Ambari official Stack version gap — doing what the open-source community cannot.

HadoopForge is an enterprise-grade Hadoop cluster full lifecycle management platform independently developed by Shenzhen Qixuan Software Co., Ltd. Built on Apache Ambari 3.0.0 + Bigtop 3.5.0 ecosystem, it is the first commercial product in China to complete this adaptation, solving core pain points in enterprise big data infrastructure deployment, operations, and domestic substitution compliance.

#### Core Problems Solved

| Industry Pain Point | HadoopForge Solution |
|---|---|
| Ambari official Stack stuck on old versions, unable to manage Bigtop 3.5.0 components | Complete rewrite of BIGTOP/3.5.0 Stack with 15+ service metainfo.xml |
| Hive 4.0.1 fully incompatible with Ambari 3.x | Rewrote hive_check.py, Beeline replaces deprecated HiveCLI, fixed auth case sensitivity |
| Cloudera discontinued free edition, enterprises in dilemma | Open-source community edition free, enterprise edition 60%+ cost reduction, no vendor lock-in |
| 2027 domestic substitution 100% replacement deadline | Fully based on Apache open-source ecosystem, supports domestic chips and OS |
| Traditional deployment takes 2–3 weeks, 70% success rate | Visual drag-and-drop orchestration, 4–6 hours deployment, 98% success rate |

#### Core Product Features

- **Complete BIGTOP/3.5.0 Stack Definition** — 15+ service metainfo.xml rewritten, ${stack_version} dynamic mapping, Service Advisor logic rewrite, compatible with Hive 4.0.1 / Spark 3.5.0 / Kafka 3.7.0
- **Visual Cluster Orchestration Engine** — Drag-and-drop cluster topology design, auto-generated deployment plans, optimized resource allocation
- **One-Click Automated Deployment** — Dual-engine (Ambari + Bigtop) compatibility, minutes to go live, 98% success rate
- **AI Intelligent O&M Brain** — LSTM + Isolation Forest algorithm, fault prediction accuracy 92%, configuration drift detection and auto-repair
- **Enterprise Security Integration** — Kerberos + Ranger + OpenLDAP complete security stack
- **Hive 4.0.1 Deep Adaptation** — Industry's first complete solution for Hive 4.0.1 compatibility, a problem the community left unsolved for 2 years

#### Supported Ecosystem Components (Bigtop 3.5.0)

- **Storage Engines**: HDFS, HBase, Kudu
- **Computing Engines**: Spark 3.5.0, Hive 4.0.1, Flink, Storm
- **Message Queues**: Kafka 3.7.0, Pulsar
- **Data Warehouse / OLAP**: Doris, ClickHouse, Hudi
- **Security & Governance**: Ambari, Ranger, Atlas, Kerberos
- **Monitoring & Observability**: Grafana, Prometheus

#### Customer Validation

- **City Commercial Bank (80 nodes)** — Deployment time reduced from 3 weeks to 5 hours, zero-downtime migration
- **Telecom Operator (200 nodes)** — 1.2PB daily processing, Hive 4.0.1 stable in production, AI alert accuracy 92%
- **Manufacturing Enterprise (120 nodes)** — Zero configuration drift incidents, O&M headcount reduced 40%, saving ¥1.2M per year

> **500+ nodes · 12 months · 0 production incidents** · Based on Ambari 3.0.0 + Bigtop 3.5.0

---

## Product Editions

### <span id="community">Community Edition (Free)</span>
- Complete BIGTOP/3.5.0 Stack definition, experience the latest features immediately
- Apache open-source ecosystem, rich upstream and downstream community projects
- Open source on GitHub, developer community support
- **Completely free**

### <span id="enterprise">Enterprise Edition</span>
- Professional commercial support team (phone, IM, email, on-site)
- Highest priority 7×24 fault response
- Expert support: planning / implementation / proactive inspection / fault investigation / knowledge transfer / critical period coverage
- AI O&M Brain advanced features (fault prediction + auto-repair)
- Domestic substitution compliance specialist support

### <span id="cloud">Cloud Hosted Edition</span>
- SaaS-style rapid deployment, easily manage cloud Hadoop clusters
- Supports major object storage (AWS S3, Alibaba Cloud OSS, MinIO, etc.)
- Elastic scaling, pay-as-you-go
- Unified permission security enhancement

---

## Professional Services

### Consulting Services
- Big data infrastructure planning and architecture design
- Ambari / Bigtop migration assessment and solution design
- Domestic substitution compliance consulting (2027 replacement target)
- Digital transformation strategy consulting

### Implementation Services
- HadoopForge cluster deployment
- Migration from legacy Ambari / Cloudera environments
- System integration and custom development

### Operations Services
- 7×24 technical support hotline
- Cluster health monitoring and alerting
- AI-driven performance optimization
- Emergency fault response (Critical: within 1 hour)

### Training Services
- Hadoop / Ambari principles and hands-on training
- HadoopForge administrator certification program
- On-site + online dual-mode delivery
- Enterprise customized training programs

---

## Technical Support Response Levels

| Level | Response Time | Scenario |
|---|---|---|
| Critical P0 | ≤ 1 hour | Production cluster completely unavailable |
| High P1 | ≤ 4 hours | Core functionality impaired |
| Medium P2 | ≤ 8 hours | Partial feature anomaly |
| Low P3 | ≤ 24 hours | Inquiry and optimization advice |

---

## Competitive Advantages

- **Fills the Version Gap** — First in China to complete Ambari 3.0.0 + Bigtop 3.5.0 full adaptation
- **Hive 4.0.1 First-Mover** — Industry's only complete solution, fixing what the community left broken for 2 years
- **60%+ Cost Reduction** — vs. Cloudera, with no vendor lock-in
- **Domestic Substitution Native** — Fully Apache open-source, supports domestic chips and operating systems
- **AI-Driven O&M** — LSTM + Isolation Forest, 92% fault prediction accuracy


---

## <span id="edge-ai">Edge AI Inference Acceleration Product Line</span>

### Hongyuan Edge AI Inference Accelerator

The world's first accelerator to deploy BitNet b1.58 quantization on FPGA hardware. BitNet W1.58 ternary quantization constrains weights to {-1, 0, +1}, replacing multiplication entirely with addition/subtraction — enabling every ¥200-class domestic FPGA to run AI Transformer inference.

**2025 Shenzhen RISC-V & HarmonyOS Innovation Competition · Architecture Innovation Award 🏆**

#### Key Metrics

| Metric | Value |
|---|---|
| Storage Compression | 16x |
| Sparse Weight Auto-skip | 33% |
| Matrix Computation Error | 0 (256/256 exact match) |
| Hardware BOM Cost | &lt;¥200 |
| Domestic Component Rate | 100% (Anlogic FPGA + RISC-V + HarmonyOS LiteOS) |
| Full-Chain Validation | 6/6 All PASS, real hardware (no simulation) |
| Total Codebase | 16,487 lines (RTL + OS + inference engine) |

#### Technical Architecture (4-Layer Full-Stack)

- **Application**: Transformer inference engine (QKV / Multi-Head Attention / FFN full pipeline)
- **OS**: HarmonyOS LiteOS (task scheduling / IPC / memory management)
- **Accelerator**: BitNet 16×16 Tile array (ternary matrix multiply → add/subtract, 33% sparse skip)
- **Hardware**: Anlogic EG4X20 FPGA (20K LUT) · PicoRV32 RISC-V @50MHz · 128MB SDRAM

#### Product Roadmap & Pricing

| Phase | Product | Target Customer | Price |
|---|---|---|---|
| Phase 1 (Current) | AI Inference Dev Board | Universities / Makers / R&D | Contact us |
| Phase 2 (6–12 months) | Vision Inference Module (OV2640 + FPGA + SDK) | Industrial inspection / Security / Agriculture | Contact us |
| Phase 3 (12–18 months) | Wi-Fi AI Edge Node | Smart factory / Agricultural IoT | Contact us |
| Phase 4 (18–24 months) | BitNet IP Core License (RTL IP) | FPGA / SoC vendors | Contact us |

#### Target Applications
- University AI hardware labs · FPGA AI course experimental platforms
- Industrial vision inspection · &lt;100ms latency, fully offline
- Smart agriculture IoT · Low power, works in field without internet
- Military / government research institutes · 100% domestic, no export control risk

[Learn More →](/en/edge-ai/hongyuan-accelerator/)

---

### Smart Terminal AI Middleware

Edge AI tiered inference platform for IoT / industrial embedded scenarios. Fills the gap between "can't run models on-device" and "pure cloud is unreliable", letting every MCU device answer device status queries in natural language.

#### Key Metrics

| Metric | Value |
|---|---|
| MCU Clock | 240MHz RISC-V |
| Peak SRAM Usage | 128KB |
| Local Inference Latency | &lt;100ms (Tier 1 keyword) |
| Codebase | 3,500+ lines (MVP all modules) |

#### 3-Tier Progressive Inference Architecture

- **Tier 1 Keyword Match**: &lt;100ms · Stored in Flash · Zero dependency · Offline
- **Tier 2 Rule NLP Engine**: &lt;500ms · 19 intent types · Local execution
- **Tier 3 Cloud LLM**: &lt;3s · Calls cloud LLM when WiFi available

The inference scheduler automatically selects the optimal path based on query complexity + network state, with automatic fallback from Tier 3 to Tier 2.

#### Four Core Components
- **AI Inference Engine Library** — Portable to any RISC-V/ARM MCU + RTOS, unified `ai_engine_query()` API
- **Smart CLI Framework** — Mixed natural language and traditional command input, TAB completion, zero dependency
- **Device Monitoring SDK** — Standardized CPU / memory / temperature / network / sensor collection
- **FPGA Acceleration Module** (optional) — Compresses inference latency to under 200ms, theoretical 50x speedup

#### Business Model
- SDK licensing: tiered by device volume — contact us
- Cloud LLM inference service: per-call billing — contact us
- Custom development: contact us

[Learn More →](/en/edge-ai/smart-terminal/)

---

## <span id="ai-education">AI Education Product Line</span>

### Otowyue Learn AI (悦学智伴)

China's first AI education platform integrating FSRS × VRM digital human deeply. Fully offline deployment with data never leaving the device. Emotion sensing at the core, FSRS scientific memory as the engine, VRM digital humans as the interface — an AI teacher with soul.

#### Key Metrics

| Metric | Value |
|---|---|
| Emotion Recognition Accuracy | 92% |
| FSRS Memory Retention Rate | 93%+ |
| Learning Efficiency Improvement | 3x vs. traditional methods |
| End-to-End Voice Response | &lt;800ms |
| Compatible LLM Models | 11+ |
| Production Code Volume | 60,000+ lines |

#### Five Core Innovations

- **Emotion Sensing Engine** — Text / voice / expression 3-channel multimodal fusion, 92% accuracy, 8 emotion types
- **FSRS × Digital Human (China First)** — MIT open-source FSRS algorithm + VRM digital human deep integration, 42% retention improvement
- **Knowledge Graph Navigation** — Covers all K-12 subjects, prerequisite/dependency mapping, automatic bottleneck detection
- **Four-Role AI Collaboration** — AI Teacher / AI Assistant / AI Advisor / AI Counselor working in concert
- **VRM Digital Human Interaction** — Humanized digital teacher, MFA phoneme-level pronunciation evaluation, 11+ LLM compatible

#### Fully Offline Architecture

Tech stack: **Ollama + Sherpa-ONNX + MeloTTS + VRM + FSRS**

- Video stays on device, only emotion labels transmitted — meets school intranet security requirements
- Works without internet — applicable to rural and remote schools
- Apache 2.0 open source license, freely customizable, no vendor lock-in
- 11+ LLM compatible, LLM-agnostic design

#### Product Editions & Pricing

| Edition | Target Customer | Pricing |
|---|---|---|
| ToB Institutional | K-12 schools / Training institutions / Corporate | Contact us |
| ToC Family | Students / Individual learners | Contact us |
| ToG Government | Education bureaus / Rural revitalization | Contact us |

#### Social Impact
- Covering 200+ rural schools, benefiting 100,000+ students — advancing educational equity
- 92% emotion issue detection rate, early mental health warning system
- Reduces 50% of repetitive teacher workload, 60% teaching efficiency improvement

[Learn More →](/en/ai-education/)


---

## <span id="digital-transformation">Digital Transformation Program</span>

### SME All-in-One ERP Platform

Targeting the core pain points of SME digital transformation, Qixuan Software delivers a ready-to-use integrated ERP solution. Combining **inventory management, financial management, HR, CRM, and procurement** into one platform — built on industry best practices to help businesses shift from "experience-driven" to "data-driven" operations.

![ERP Platform Interface](/images/erp-platform.jpg)

#### Five Core Modules

<div class="erp-modules-grid">
  <div class="erp-module-card">
    <div class="erp-module-icon">📦</div>
    <h4>Inventory Management</h4>
    <p>Full-chain integration of purchasing, sales, and warehouse operations. Real-time inventory visibility, automatic replenishment suggestions, 30%+ improvement in inventory turnover.</p>
    <ul>
      <li>Multi-warehouse / multi-batch management</li>
      <li>Barcode / scan operations</li>
      <li>Stock alerts and auto-replenishment</li>
      <li>Complete in/out traceability</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">💰</div>
    <h4>Financial Management</h4>
    <p>Integrated general ledger, AR/AP, cost accounting, and profit analysis. Real-time sync with business data, automatic financial reports, 60%+ improvement in month-end closing efficiency.</p>
    <ul>
      <li>General ledger management</li>
      <li>Automated AR/AP reconciliation</li>
      <li>Multi-dimensional cost analysis</li>
      <li>Automatic financial statement generation</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">👥</div>
    <h4>Human Resources</h4>
    <p>Digital management of employee records, attendance, payroll, and performance. 50% improvement in HR processing efficiency, employee self-service reduces repetitive work.</p>
    <ul>
      <li>Full employee lifecycle management</li>
      <li>Smart scheduling and attendance</li>
      <li>Automated payroll calculation</li>
      <li>Performance appraisal and OKR</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">🤝</div>
    <h4>CRM</h4>
    <p>Full-cycle management of leads, follow-ups, contracts, and after-sales. Industry best-practice funnel model, average 25%+ improvement in sales conversion rates.</p>
    <ul>
      <li>Lead → Opportunity → Contract funnel</li>
      <li>Customer profiling and segmentation</li>
      <li>Sales forecasting and analytics</li>
      <li>After-sales ticket tracking</li>
    </ul>
  </div>
  <div class="erp-module-card">
    <div class="erp-module-icon">🔗</div>
    <h4>Procurement & Supply Chain</h4>
    <p>Fully digital supplier management, RFQ, purchase orders, and receiving. Supplier rating system, 10-15% procurement cost reduction, improved on-time delivery.</p>
    <ul>
      <li>Supplier profiles and ratings</li>
      <li>Online RFQ management</li>
      <li>PO full-cycle tracking</li>
      <li>Receiving inspection and QC</li>
    </ul>
  </div>
</div>

#### Industry Best Practice Results

| Area | Traditional Approach | Qixuan ERP | Improvement |
|---|---|---|---|
| Inventory | Manual Excel, delayed info | Real-time visibility, auto alerts | 30%+ turnover improvement |
| Month-end Close | Manual 1-2 week process | Real-time sync, close anytime | 60% faster closing |
| Procurement | Offline approvals, opaque | Online approvals, full audit trail | 10-15% cost reduction |
| Sales | Scattered data, hard to track | Visual funnel, real-time dashboard | 25%+ conversion lift |
| HR | Manual attendance/payroll | Automated calculation, self-service | 50% efficiency gain |

#### Editions & Pricing

| Edition | Company Size | Core Features | Price |
|---|---|---|---|
| Startup | 1-20 people | Inventory + Basic Finance | Contact us |
| Growth | 20-100 people | All modules + CRM | Contact us |
| Professional | 100-500 people | All modules + Custom + Private | Contact us |

[Try ERP Platform →](https://erp.qixuan.vip){target="_blank"}　　[Contact Us for a Solution →](/en/contact/)
