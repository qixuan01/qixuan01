---
title: "智能终端AI中间件"
description: "基于RISC-V + LiteOS的边缘AI分层推理平台 · 128KB SRAM运行完整AI · 三层渐进式推理架构"
weight: 2
---

<div class="edge-page-header">
  <div class="edge-breadcrumb"><a href="/edge-ai/">边缘AI推理加速</a> › 智能终端AI中间件</div>
  <h1>智能终端AI中间件</h1>
  <p>Smart Terminal AI Middleware</p>
  <p>面向 IoT / 工业嵌入式场景的边缘 AI 分层推理平台</p>
</div>

## 解决的问题

IoT设备部署后面临"最后一公里"困境：设备状态不透明，运维成本高。工程师到达现场需接调试器、查日志、开发上位机，单次响应30分钟起。

**Smart Terminal AI** 填补"端侧跑不了模型、纯云端不可靠"之间的产品空白，让每一台MCU设备都能用自然语言回答"你现在状态怎么样？"。

<div class="edge-product-showcase">
  <div class="edge-product-showcase-label">🟠 智能终端AI中间件 · RISC-V + LiteOS 三层推理架构</div>
  <img src="/images/smart-terminal-ai.jpg" alt="智能终端AI中间件系统架构" class="edge-product-showcase-img">
</div>

---

## 核心数据

<div class="edge-highlights-grid">
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">128KB</span>
    <span class="edge-highlight-label">SRAM峰值占用</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">3,500+</span>
    <span class="edge-highlight-label">行全模块代码</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">&lt;100ms</span>
    <span class="edge-highlight-label">本地推理延迟</span>
  </div>
  <div class="edge-highlight-card">
    <span class="edge-highlight-num">240MHz</span>
    <span class="edge-highlight-label">RISC-V主频</span>
  </div>
</div>

---

## 三层渐进式推理架构

<div class="edge-arch-stack">
  <div class="edge-arch-layer edge-arch-app">
    <span class="edge-arch-label">Tier 3 · 云端LLM</span>
    <span class="edge-arch-content">WiFi可用时调用云端大模型 · &lt;3s响应 · 处理复杂语义查询</span>
  </div>
  <div class="edge-arch-layer edge-arch-accel">
    <span class="edge-arch-label">Tier 2 · 规则引擎NLP</span>
    <span class="edge-arch-content">本地规则引擎 · &lt;500ms · 19种意图识别 · 无网络可用</span>
  </div>
  <div class="edge-arch-layer edge-arch-hw">
    <span class="edge-arch-label">Tier 1 · 关键词匹配</span>
    <span class="edge-arch-content">零依赖关键词库 · &lt;100ms · 存于Flash · 内存峰值仅128KB</span>
  </div>
</div>

推理调度器根据**查询复杂度 + 网络状态**自动选择最优路径，Tier 3失败时自动降级至Tier 2，确保离线可用。

---

## 四大核心组件

<div class="edge-components-grid">
  <div class="edge-component-card">
    <div class="edge-component-icon">🧠</div>
    <h4>AI推理引擎库</h4>
    <p>可移植到任意 RISC-V/ARM MCU + RTOS 组合，提供统一的 <code>ai_engine_query()</code> API，内部自动调度三层推理路径</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">⌨️</div>
    <h4>智能CLI框架</h4>
    <p>带意图识别的命令行框架，支持自然语言与传统CLI命令混合输入，历史记录 + TAB补全，零依赖可移植</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">📡</div>
    <h4>设备状态监控SDK</h4>
    <p>标准化的CPU / 内存 / 温度 / 网络 / 传感器采集接口，适配主流嵌入式平台驱动</p>
  </div>
  <div class="edge-component-card">
    <div class="edge-component-icon">⚡</div>
    <h4>FPGA加速模块</h4>
    <p>针对安路EG4X20的轻量化推理加速IP，轻量化矩阵乘法映射FPGA查找表，理论加速比50x，推理延迟压缩至200ms以内</p>
  </div>
</div>

---

## 实际使用演示

串口直连，无需安装任何App或专用工具：

```
> ai 设备现在状态正常吗
→ CPU使用率 12%，内存使用 21%（128KB/606KB），温度 36.7°C 正常，
  WiFi信号良好(-58dBm)，传感器数据采集正常。设备运行健康。

> ai 最近有没有异常日志
→ [AI Tier-3] 分析最近47条日志...
  发现 2条WARN 级别日志：ADC通道2信号为0，可能传感器未连接。
  其余日志均为INFO级别，系统运行正常。
```

**零App安装 · 零专用工具 · 串口直连 · 秒级响应**

---

## 已验证功能清单

| 功能模块 | 状态 |
|---|---|
| CLI完整命令集（10条命令） | ✅ 已验证 |
| Tier 1 关键词匹配（30+双语） | ✅ 已验证 |
| Tier 2 规则引擎NLP（19种意图） | ✅ 已验证 |
| Tier 3 云端LLM HTTP POST | ✅ 已验证 |
| 真实ADC/GPIO/温度/CPU/WiFi采集 | ✅ 已验证 |
| LittleFS日志和配置持久化 | ✅ 已验证 |
| LiteOS三任务并发+线程安全 | ✅ 已验证 |
| FPGA Tier 4加速模块 | 🔄 开发中 |
| FreeRTOS移植 | 📋 计划中 |

---

## 技术壁垒

- **极限内存约束**：606KB SRAM内运行网络栈(60KB)、文件系统(32KB)、AI推理(25KB)、CLI(8KB)、传感器采集(4KB)的完整系统
- **无标准库全栈实现**：LiteOS无Linux glibc，手写HTTP/1.1 POST、轻量JSON解析器（节省~8KB SRAM）
- **跨平台可移植设计**：全模块通过OSAL与LiteOS解耦，可移植至FreeRTOS、RT-Thread等任意RTOS
- **FPGA加速路线**：轻量化矩阵乘法映射FPGA查找表，理论加速比50x

[返回边缘AI产品线](/edge-ai/) | [联系销售](/contact/)
