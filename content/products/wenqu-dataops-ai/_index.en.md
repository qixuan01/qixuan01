---
title: "Wenqu DataOps-AI"
description: "Wenqu DataOps-AI · Education Data Intelligence Platform — A full-loop education digitalization solution from classroom to data and back"
seoTitle: "Wenqu DataOps-AI · Education Data Intelligence Platform"
seoDescription: "Wenqu DataOps-AI connects teaching application, DataOps, data and model foundation, and secure delivery — covering RAG teaching, BKT mastery, lakehouse governance, model evaluation and Dengbao compliance."
seoKeywords: "Wenqu DataOps-AI,Education Data Intelligence,Education Data Lake,DataOps,DataOps Platform,Education Big Data,RAG Teaching,BKT Mastery,Data Governance,Lakehouse,Dengbao Level 3,Multi-tenant,AI Education Platform"
keywords: "Wenqu,DataOps,AI Education Platform,EduLake,RAG Teaching,BKT Mastery,Education Intelligence,Data Governance"
ogImage: "images/ai-edu-platform.jpg"
schemaType: "SoftwareApplication"
applicationCategory: "BusinessApplication"
operatingSystem: "Linux, Docker, Kubernetes"
softwareVersion: "2026-11-26"
featureList:
  - "Education data intelligence loop"
  - "RAG teaching chat with citations"
  - "BKT mastery and weak points"
  - "DataOps assets, quality, lineage and SLO"
  - "Lakehouse and real-time ingestion"
  - "Dengbao Level 3 self-check and privacy loop"
faq:
  - q: "What is Wenqu DataOps-AI?"
    a: "Wenqu DataOps-AI is an education data intelligence loop that connects four layers: teaching application, DataOps, data and model foundation, and secure delivery. It covers classroom chat, practice, reports, lakehouse governance and model evaluation."
  - q: "How is it different from a traditional education BI tool?"
    a: "Traditional BI mainly displays reports. Wenqu connects data assets, quality gates, field-level lineage, SLO, data products, NL2SQL Copilot and teaching operations into one loop, so insights return to teachers and students."
  - q: "How is student privacy protected?"
    a: "The platform supports personal data export and deletion, anonymisation and masking, a 180-day-plus retention policy and a SHA-256 hash-chain audit. Application-level multi-tenancy and four role levels isolate schools."
  - q: "Does it support private deployment and domestic IT stacks?"
    a: "Yes. It supports private deployment on the Apache open-source ecosystem and can run on domestic chips and operating systems. Kerberos, TLS and tenant isolation can be enabled as needed."
  - q: "Can it integrate with existing academic and course systems?"
    a: "It provides LTI 1.3, xAPI, SCORM, academic and logistics webhooks, and S3/MinIO integration. Courses, chapters, knowledge points and practice data can be imported to standards."
  - q: "How is delivery validated?"
    a: "Delivery is phased by school or institution size, with 360 automated tests, SCA/SBOM, backup and recovery drills, and Qixuan CloudBuild release and rollback."
---

## What It Is

Wenqu DataOps-AI is not a point tool. It is an **education data intelligence loop**: classroom conversations, practice, interactions and reports enter the data platform, are governed and modelled, and then return to teaching through model evaluation, RAG and DataOps data products.

The platform has four layers: **L4 Teaching Application**, **L2 DataOps**, the **L1/L2 Data & Model Foundation**, and cross-cutting **Model / Security / Delivery** capabilities. The 38 nodes on the interactive map are the complete spatial relationship of these capabilities.

### Core Capabilities

<div class="qs-feature-grid">
  <div class="qs-feature-card">
    <div class="qs-f-icon">🧠</div>
    <h4>Teaching Chat + RAG</h4>
    <p>Textbook RAG with citations, multi-turn dialogue, interruption and graceful degradation; GPU ASR with speaker diarization; VRM lip-sync and subtitles.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">📈</div>
    <h4>Practice · BKT Mastery</h4>
    <p>Answers are persisted, BKT mastery is updated, and weak points plus review priority are produced. Practice data enters the lake for reports and DataOps.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🏫</div>
    <h4>Classroom & Tasks</h4>
    <p>Check-in, polls, quick response, discussion, assignments, surveys, approvals and live sessions; teachers see participation and option distribution in real time.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🎬</div>
    <h4>Interactive Video & AI Toolbox</h4>
    <p>Timed quizzes, danmaku and video versions; question generation, document Q&A, lesson plans/PPT, essay/code review and teaching QA.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🔐</div>
    <h4>Privacy · Retention · Audit</h4>
    <p>Personal data export, deletion requests, anonymisation/masking, ≥180-day retention and a SHA-256 hash-chain operation audit.</p>
  </div>
  <div class="qs-feature-card">
    <div class="qs-f-icon">🛡️</div>
    <h4>Dengbao Level 3 Self-check</h4>
    <p>16 compliant / 7 partial / 5 external / 0 non-compliant, 84.8% technical self-check; the formal assessment is delivered by a third party.</p>
  </div>
</div>

## Four-Layer Architecture

### Layer by Layer

<div class="qs-arch">
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L4 Teaching</div>
    <div>
      <h4>Student / teacher / admin entry and teaching loop</h4>
      <p>Auth and multi-school, courses/chapters/KPs, teaching chat, practice and BKT, learning reports, classroom interaction, learning support, interactive video, task extension, AI toolbox, system admin and privacy/retention.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L2 DataOps</div>
    <div>
      <h4>Assets, quality, lineage, SLO, data products and Copilot</h4>
      <p>Asset catalog and data contracts, quality gates, field-level lineage and impact analysis, SLO and incidents, data product APIs, NL2SQL Copilot, PII governance, inspection/recovery, alerting/on-call and value reporting.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">L1/L2 Foundation</div>
    <div>
      <h4>PostgreSQL · Redis · Qdrant · Kafka · Flink · Iceberg · Spark · Ollama</h4>
      <p>105 business tables, textbook vector store, real-time event bus, Kafka → Iceberg ingestion, Spark Thrift query entry, plus local LLM and GPU ASR.</p>
    </div>
  </div>
  <div class="qs-arch-layer">
    <div class="qs-arch-tag">Cross-cutting</div>
    <div>
      <h4>Model / Security / Delivery</h4>
      <p>30×3 model evaluation gate, JWT + four role levels + custom roles + multi-tenancy, Prometheus/SLO/Webhook observability, LTI/xAPI/SCORM integration, Dengbao compliance and CI/CD release.</p>
    </div>
  </div>
</div>

## Teaching Loop: How Learning Data Enters the Lake

1. **A student talks to the AI teacher**: textbook RAG answers with citations; GPU ASR transcribes and separates speakers.
2. **Practice and mastery**: answers are persisted, BKT updates mastery, weak points and review priority are generated.
3. **Reports and achievements**: five-tab learning report, achievements/points, PDF/HTML export; unknown is returned when data is missing, never fabricated.
4. **Data enters the lake**: PostgreSQL → Kafka → Flink → Iceberg; batch and stream share one source, ACID snapshots are traceable.
5. **DataOps governance**: quality rules and gates, field-level lineage, SLO and incidents, PII paths and masking policies.
6. **Feedback to teaching**: reports, data product APIs and Copilot bring conclusions back to teachers and administrators.

## Security, Compliance & Delivery

| Dimension | Current baseline |
|---|---|
| Tests | 360 passed / 0 failed |
| Dengbao Level 3 technical self-check | 84.8% (16 compliant / 7 partial / 5 external / 0 non-compliant) |
| Privacy | Export/delete, anonymisation/masking, ≥180-day retention, SHA-256 audit chain |
| Multi-tenancy | Application JWT + four role levels + custom roles + two-tenant integration tests |
| Delivery | Qixuan CloudBuild v7: 360 tests, SCA/SBOM, RELEASE.json, health checks and rollback |
| External dependencies | Formal Dengbao assessment, Kerberos/TLS, 10k concurrency, native APP, 650+ formal course list need partners |

> Status legend on the map: green = live (code + runtime evidence), amber = partial/boundary, indigo = design/pending, red = gap, grey = external. We do not treat “has code” as “live”, nor “external dependency” as “done”.

[Back to the interactive map ↑](#interactive-map)　　[Request a demo →](/en/contact/)
