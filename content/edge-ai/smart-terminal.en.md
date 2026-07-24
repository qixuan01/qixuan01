---
title: "Smart Terminal AI Middleware"
description: "Edge AI tiered inference platform based on RISC-V + LiteOS · Full AI in 128KB SRAM · 3-tier progressive inference architecture"
weight: 2
---

<div class="edge-page-header">
  <div class="edge-breadcrumb"><a href="/en/edge-ai/">Edge AI</a> › Smart Terminal AI Middleware</div>
  <h1>Smart Terminal AI Middleware</h1>
  <p>智能终端AI中间件</p>
  <p>Edge AI tiered inference platform for IoT / industrial embedded scenarios</p>
</div>

## The Problem

IoT devices face a "last mile" problem after deployment: device state is opaque, O&M costs are high. Engineers need 30+ minutes per visit to connect debuggers, check logs, and build tools.

**Smart Terminal AI** fills the gap between "can't run models on-device" and "pure cloud is unreliable" — letting every MCU device answer "what's your current status?" in natural language.

<div class="edge-product-showcase">
  <div class="edge-product-showcase-label">🟠 Smart Terminal AI Middleware · RISC-V + LiteOS 3-Tier Inference Architecture</div>
  <img src="/images/smart-terminal-ai.jpg" alt="Smart Terminal AI Middleware Architecture" class="edge-product-showcase-img">
</div>

---

## Key Metrics

<div class="edge-highlights-grid">
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">128KB</span>
    <span class="edge-highlight-label">Peak SRAM Usage</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">3,500+</span>
    <span class="edge-highlight-label">Lines Full-Module Code</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">&lt;100ms</span>
    <span class="edge-highlight-label">Local Inference Latency</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">240MHz</span>
    <span class="edge-highlight-label">RISC-V Clock</span>
  </div>
</div>

---

## 3-Tier Progressive Inference Architecture

<div class="edge-arch-stack">
  <div class="edge-arch-layer edge-arch-app">
    <span class="edge-arch-label">Tier 3 · Cloud LLM</span>
    <span class="edge-arch-content">Cloud LLM via WiFi · &lt;3s · Complex semantic queries</span>
  </div>
  <div class="edge-arch-layer edge-arch-accel">
    <span class="edge-arch-label">Tier 2 · Rule NLP</span>
    <span class="edge-arch-content">Local rule engine · &lt;500ms · 19 intent types · Works offline</span>
  </div>
  <div class="edge-arch-layer edge-arch-hw">
    <span class="edge-arch-label">Tier 1 · Keyword Match</span>
    <span class="edge-arch-content">Zero-dependency keyword library · &lt;100ms · Stored in Flash · Only 128KB peak RAM</span>
  </div>
</div>

The inference scheduler automatically selects the optimal path based on **query complexity + network state**. Tier 3 failure auto-degrades to Tier 2, ensuring offline availability.

---

## Four Core Components

<div class="edge-components-grid">
  <div class="edge-component-card">
    <div class="edge-component-icon">🧠</div>
    <h4>AI Inference Engine Library</h4>
    <p>Portable to any RISC-V/ARM MCU + RTOS. Unified <code>ai_engine_query()</code> API with automatic 3-tier scheduling internally.</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">⌨️</div>
    <h4>Smart CLI Framework</h4>
    <p>Intent-aware CLI framework supporting mixed natural language and traditional commands. History + TAB completion. Zero dependency, fully portable.</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">📡</div>
    <h4>Device Monitoring SDK</h4>
    <p>Standardized CPU / memory / temperature / network / sensor collection interfaces, adapted to mainstream embedded platform drivers.</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">⚡</div>
    <h4>FPGA Acceleration Module</h4>
    <p>Lightweight inference acceleration IP for Anlogic EG4X20. Maps matrix multiply to FPGA lookup tables. Theoretical 50x speedup, compressing inference latency to under 200ms.</p>
  </div>
</div>

---

## Live Demo

Plug in USB → Open serial terminal → Ask in natural language:

```
> ai is the device status normal?
→ CPU usage 12%, memory 21% (128KB/606KB), temperature 36.7°C normal,
  WiFi signal good (-58dBm), sensor data collection normal.
  Device is healthy.

> ai any anomalies in recent logs?
→ [AI Tier-3] Analyzing recent 47 log entries...
  Found 2 WARN level logs: ADC channel 2 signal is 0,
  possibly sensor disconnected. All other logs are INFO level,
  system operating normally.
```

**Zero App install · Zero special tools · Serial direct connect · Second-level response**

[Back to Edge AI](/en/edge-ai/) | [Contact Sales](/en/contact/)
