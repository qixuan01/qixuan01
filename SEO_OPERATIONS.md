# SEO 运营与搜索引擎接入说明

> 适用站点：https://www.qixuan.vip/  
> 技术实现：Hugo + GitHub Pages  
> 更新日期：2026-11-26

本文档说明站点已经做好的 SEO 能力，以及需要在百度、Google、Bing 等站长平台手工完成的验证与提交步骤。

---

## 1. 已实现的技术 SEO

- 每页独立 `title`、`description`、`keywords`、`canonical`
- 中英文 `hreflang`（含 `x-default`）
- Open Graph / Twitter Card
- Organization、WebSite、WebPage、BreadcrumbList JSON-LD
- 产品页 SoftwareApplication + FAQPage 结构化数据
- 文档页 TechArticle 结构化数据
- 解决方案页 Service 结构化数据
- 自动生成多语言 `sitemap.xml` / `zh/sitemap.xml` / `en/sitemap.xml`
- `robots.txt` 放行 sitemap，声明百度 `Clean-param`
- 地图 iframe 页面设置 `noindex, follow`，避免重复内容
- 图片懒加载、`decoding=async`、CDN preconnect
- 移动端响应式、`applicable-device=pc,mobile`
- 百度 `no-transform` / `no-siteapp`，避免移动转码
- 百度自动推送脚本（`params.seo.baiduPush = true`）
- Google Analytics / 百度统计接入位（填入 ID 即启用）

---

## 2. 百度搜索资源平台

1. 打开 https://ziyuan.baidu.com/ ，添加站点 `https://www.qixuan.vip/`。
2. 选择「HTML 标签验证」，复制 `content` 值。
3. 填入 `hugo.toml`：

```toml
[params.seo]
  baiduVerification = "这里填百度验证码"
```

4. 重新构建并部署。
5. 在「普通收录 → sitemap」提交：

```text
https://www.qixuan.vip/sitemap.xml
https://www.qixuan.vip/zh/sitemap.xml
https://www.qixuan.vip/en/sitemap.xml
```

6. 「普通收录 → 推送」建议开启 API 推送或手动提交重点 URL。
7. 站点已开启百度自动推送；`robots.txt` 已配置：

```text
Clean-param: lang&embed /maps/
```

8. 重点提交页面：
   - `https://www.qixuan.vip/`
   - `https://www.qixuan.vip/products/wenqu-dataops-ai/`
   - `https://www.qixuan.vip/products/hodoopforge/`
   - `https://www.qixuan.vip/solutions/`
   - `https://www.qixuan.vip/energy-solutions/`
   - `https://www.qixuan.vip/edge-ai/`
   - `https://www.qixuan.vip/ai-education/`

### 百度 API 自动推送

站点已接入每日自动推送任务：

- 脚本：`scripts/baidu_push.py`
- 优先 URL 列表：`scripts/baidu_priority_urls.txt`
- 工作流：`.github/workflows/baidu-push.yml`
- 每天北京时间 09:30 运行，也可在 GitHub Actions 页面手动触发
- 百度新站配额通常只有 **6 条/天**，脚本按列表顺序逐条推送，配额用完自动停止
- Token 只从环境变量 `BAIDU_PUSH_TOKEN` 读取，不写入仓库

**一次性配置（必须）：**

GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret：

```text
Name:  BAIDU_PUSH_TOKEN
Value: 百度搜索资源平台提供的准入密钥
```

配置后可在 Actions → **Baidu URL Push** → Run workflow 手动测试一次。

新增重点页面时，把 URL 加到 `scripts/baidu_priority_urls.txt` 顶部，次日自动推送；也可以手动运行脚本：

```bash
BAIDU_PUSH_TOKEN=xxxx python3 scripts/baidu_push.py \
  --file scripts/baidu_priority_urls.txt --max 6
```

> 注意：Token 属于账号凭证，不要提交到 Git、不要写进公开文档或前端代码。

---

## 3. Google Search Console

1. 打开 https://search.google.com/search-console 。
2. 添加「网域」或「网址前缀」资源。
3. 选择「HTML 标记」验证，把验证码填入：

```toml
[params.seo]
  googleVerification = "这里填 Google 验证码"
```

4. 部署后在「站点地图」提交：

```text
https://www.qixuan.vip/sitemap.xml
```

5. 使用「网址检查」对两个旗舰产品页请求编入索引。
6. 在「增强功能」检查：
   - 面包屑
   - 软件应用（SoftwareApplication）
   - FAQ
   - 技术文章（TechArticle）

---

## 4. Bing / 360 / 搜狗 / 头条搜索

在对应站长平台获取验证码后填入：

```toml
[params.seo]
  bingVerification = ""
  qihooVerification = ""
  sogouVerification = ""
  bytedanceVerification = ""
```

Bing 站点地图同样提交：

```text
https://www.qixuan.vip/sitemap.xml
```

---

## 5. 统计代码

在 `hugo.toml` 填入 ID 后自动启用：

```toml
googleAnalytics = "G-XXXXXXXXXX"
baiduAnalytics = "xxxxxxxxxxxxxxxx"
```

建议同时配置百度统计的「转化目标」：联系我们、产品演示、文档阅读。

---

## 6. 关键词布局

| 页面 | 核心词 | 长尾词 |
|---|---|---|
| 首页 | 问渠DataOps-AI、HodoopForge数据湖 | 教育数据智能、实时湖仓、Kerberos、国产替代 |
| 问渠产品页 | 教育数据智能、DataOps平台 | 教育数据湖、RAG教学、BKT掌握度、等保三级 |
| HodoopForge 产品页 | 数据湖、湖仓一体 | 实时入湖、Kafka、Flink、Iceberg、HDFS NameNode HA |
| 大数据方案 | HadoopForge、Hadoop集群管理 | Ambari、Bigtop、Hive 4.0.1、信创大数据 |
| 智慧能源 | 智慧能源EMS、光储充一体化 | VPP虚拟电厂、储能逆变器、峰谷套利、零碳园区 |
| 边缘AI | 边缘AI、FPGA加速器 | RISC-V、端侧AI、离线推理、智能终端中间件 |
| AI伴学 | AI伴学、AI教育平台 | 悦学智伴、FSRS、数字人教学、离线AI教育 |
| 技术文档 | DataOps文档、Kerberos | HDFS HA、Flink Runbook、Iceberg、数据治理 |

### 写作建议

- 每页只保留一个 H1，H2/H3 按层级递进。
- 标题 25–35 个汉字或 50–60 个英文字符。
- 描述 80–120 个汉字或 140–160 个英文字符。
- 首段自然出现核心词，不堆砌。
- 产品页持续补充：客户问题、实施步骤、对比表、FAQ。
- 文档页保持更新，长尾流量通常来自技术文档。

### 品牌词

品牌词 **启煊软件 / 启煊 / Qixuan Software / Qixuan** 会自动加入：

- 所有页面 `<title>` 后缀（首页标题直接以“启煊软件”开头）
- 所有页面 `meta keywords`
- Organization 结构化数据 `name` / `alternateName` / `legalName`
- SoftwareApplication 结构化数据 `brand`
- 首页描述、关于页、页脚

英文页面会同时包含 `Qixuan Software`、`Qixuan`、`启煊软件`、`启煊`，便于中英文品牌实体关联。品牌别名可在 `hugo.toml` 的 `params.seo.brandAliases` 中维护。

---

## 7. 上线后检查清单

- [ ] `https://www.qixuan.vip/robots.txt` 可访问，包含 sitemap
- [ ] `https://www.qixuan.vip/sitemap.xml` 可访问
- [ ] `https://www.qixuan.vip/zh/sitemap.xml` 可访问
- [ ] `https://www.qixuan.vip/en/sitemap.xml` 可访问
- [ ] 百度验证通过
- [ ] `BAIDU_PUSH_TOKEN` 已加入 GitHub Actions Secrets
- [ ] Google 验证通过
- [ ] 两个旗舰产品页已请求收录
- [ ] Rich Results Test 通过 FAQ / SoftwareApplication
- [ ] 移动端友好性测试通过
- [ ] 统计代码有数据
- [ ] 地图页为 `noindex`，产品页为 `index`

---

## 8. 相关文件

- SEO 模板：`layouts/partials/seo.html`
- 站点地图：`layouts/sitemap.xml`
- robots：`layouts/robots.txt`
- 全局配置：`hugo.toml` 的 `[params.seo]`
- 产品 FAQ：`content/products/*/_index.*.md` 的 `faq`
- 展示样式：`static/css/map-showcase.css`
