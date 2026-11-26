/* Wenqu DataOps-AI interactive map — English overlay
   The Chinese source data stays inline in wenqu-interactive-map.html.
   This file only overrides display strings when ?lang=en is present. */
window.WENQU_EN = {
  status: {
    ok: { t: 'Live' },
    partial: { t: 'Partial / boundary' },
    design: { t: 'Design / pending' },
    gap: { t: 'Gap' },
    external: { t: 'External' }
  },
  groups: {
    learn: { label: 'L4 Wenqu AI · Teaching Application', sub: 'Student / teacher / admin entry and the teaching loop', axis: 'Student / teacher → course / chat / practice → report → data lake → feed teaching' },
    ops: { label: 'L2 DataOps · Data Operations', sub: 'Assets, quality, lineage, SLO, data products, Copilot', axis: 'PG → Kafka → Flink → Iceberg → Spark → quality / lineage / SLO / data products' },
    plat: { label: 'L1/L2 Data & Model Foundation', sub: 'PostgreSQL · Redis · Qdrant · Kafka · Flink · Iceberg(-ha) · Spark · Ollama/GPU ASR' },
    rail: { label: 'Cross-cutting: Model / Security / Delivery', sub: 'Evaluation gate · Identity tenant · Observability · Integration · Compliance · Release' }
  },
  nodes: {
    'l-entry': {
      label: 'Entry · Auth · Multi-school', en: 'ENTRY · AUTH · TENANT',
      what: 'Sign in to the AI teacher workspace. JWT lasts 120 minutes with token_version revocation; platform admins can switch schools while school admins, teachers and students stay in their tenant; unauthenticated requests return 302.',
      chips: ['JWT 120min', 'token_version', 'X-Tenant-Id'],
      gaps: ['Native APP / HarmonyOS is not packaged or signed', 'Desktop Electron and Web share one frontend']
    },
    'l-course': {
      label: 'Course · Chapter · KP', en: 'COURSE / CHAPTER / KP',
      what: '16 textbook courses, 637 chapters and 635 knowledge points. Course portal, teams, mappings, rich text, import/export and SCORM; knowledge points link to practice, BKT and reports.',
      chips: ['16 courses', '637 chapters', 'SCORM'],
      gaps: ['650+ formal course list still needs vendor import', 'Real academic class integration pending']
    },
    'l-chat': {
      label: 'Teaching Chat + RAG', en: 'AGENT · RAG · ASR/TTS',
      what: 'Textbook RAG with citations, multi-turn, interruption and graceful degradation; faster-whisper GPU transcription plus sherpa-onnx speaker diarization; VRM lip-sync and subtitles.',
      chips: ['RAG citations', 'GPU ASR', 'degraded fallback'],
      gaps: ['Textbook image OCR not fully backfilled', 'First model download and GPU capacity boundaries']
    },
    'l-practice': {
      label: 'Practice · BKT Mastery', en: 'PRACTICE · BKT',
      what: 'Answers are persisted, BKT mastery is updated, and weak points plus review priority are produced. Practice records enter the lake for reports and DataOps.',
      chips: ['BKT', '226 answers', 'mastery / weak points'],
      gaps: ['LLM question generation falls back to extraction on failure', 'Real class samples need continuous accumulation']
    },
    'l-report': {
      label: 'Learning Report · Achievement', en: 'REPORT · ACHIEVEMENT',
      what: 'Five-tab learning report, achievements and points, PDF/HTML export. When learning gain has no data it returns unknown instead of fabricating a value.',
      chips: ['5 tabs', 'achievements', 'null = not measured'],
      gaps: ['Parent email / SMTP not connected', 'Cohort learning-gain samples still small']
    },
    'l-classroom': {
      label: 'Classroom Interaction', en: 'CLASSROOM',
      what: 'Teachers publish check-in, polls, quick-response and discussion activities; students respond; teachers see participation, option distribution and answers, then close the activity while keeping statistics.',
      chips: ['check-in / poll / quick response', 'statistics', 'discussion'],
      gaps: ['Real-time push and large-screen enhancement', 'Currently polling refresh']
    },
    'l-engagement': {
      label: 'Learning Support', en: 'ENGAGEMENT',
      what: 'Wrong-answer book aggregated from practice; knowledge cards, micro-lessons and discussion area; no redundant wrong-answer table — organised by knowledge point.',
      chips: ['wrong-answer book', 'cards / micro-lessons', 'discussion'],
      gaps: ['Personalised recommendation', 'Content operations tooling']
    },
    'l-video': {
      label: 'Interactive Video', en: 'INTERACTIVE VIDEO',
      what: 'Timed quizzes, annotations, knowledge points and polls; attempts bind to interaction points, so replacing a video does not lose scores; danmaku, virtual editing and video versions are retained.',
      chips: ['interaction points', 'danmaku', 'video versions'],
      gaps: ['Transcoding pipeline linkage', 'Transcoding cluster is external infrastructure']
    },
    'l-task': {
      label: 'Task Extension', en: 'TASK ENGINE',
      what: 'Tasks, groups, task points, completion and certificates; co-builders, enrolment, assignments, surveys, approvals, live sessions, submission review and task cloning.',
      chips: ['assignment / survey / approval / live', 'review', 'clone'],
      gaps: ['Tencent / Zoom auto meeting creation needs enterprise accounts', 'External academic and logistics integration pending']
    },
    'l-tools': {
      label: 'AI Toolbox · Teaching QA', en: 'AI TOOLBOX',
      what: 'Question generation, document Q&A, lesson plans / PPT, drawing, essay and code review, video timestamping, teaching quality inspection and media transcoding; offline deterministic algorithms come first.',
      chips: ['proofreading / rewriting / plagiarism', 'formula normalisation', 'exam quality'],
      gaps: ['Formula image OCR needs an extra model', 'LLM semantic scoring can be improved further']
    },
    'l-system': {
      label: 'System Admin · Roles', en: 'SYSTEM ADMIN',
      what: 'Schools, organisations, users, custom roles, course handover, quotas, audit, privacy and retention; all 15 system-management write APIs are bound to permissions.',
      chips: ['4 levels + custom roles', '15/15 permissions', 'CSV import'],
      gaps: ['Three-admin separation needs organisational rollout', 'Lake table tenant isolation awaits the platform']
    },
    'l-privacy': {
      label: 'Privacy · Retention · Audit', en: 'PRIVACY · RETENTION',
      what: 'Personal data export, deletion requests, admin approval, anonymisation and masking; daily retention jobs; SHA-256 hash-chain operation audit; conversation bodies bind to user_id.',
      chips: ['export / delete', '≥180 days', 'hash chain'],
      gaps: ['Conversations before 2026-11-25 only have history_uid', 'Formal assessment / SIEM are external']
    },

    'd-assets': {
      label: 'Asset Catalog · Data Contracts', en: 'ASSETS · CONTRACTS',
      what: 'Asset registration, domain/layer/sensitivity search, field contracts and data-element registration; answers "what is this table and who may use it".',
      chips: ['asset catalog', 'field contracts', 'sensitivity'],
      gaps: ['Asset owners are still mostly system accounts']
    },
    'd-quality': {
      label: 'Quality · Gates', en: 'QUALITY · GATE',
      what: 'Quality rules check nulls, duplicates, ranges and row counts; gates block DWS/ADS; quality findings drill down to table, partition and rule.',
      chips: ['rule checks', 'gate blocking', 'drill-down'],
      gaps: ['Empty table / no-new-data still needs human interpretation']
    },
    'd-lineage': {
      label: 'Lineage · Impact Analysis', en: 'LINEAGE · IMPACT',
      what: 'Job-level and field-level lineage; see downstream impact before changing a metric; impact API and visualisation are available.',
      chips: ['field level', 'impact surface', 'visualisation'],
      gaps: ['Some external jobs do not report OpenLineage']
    },
    'd-slo': {
      label: 'SLO · Incidents · Degradation', en: 'SLO · INCIDENTS',
      what: 'Error budgets for RAG, quality and models; automatic degradation and recovery; incidents can be acknowledged and assigned an owner.',
      chips: ['error budget', 'auto degradation', 'incident acknowledgement'],
      gaps: ['Historical RAG P95 baseline is high', 'Incidents are not connected to IM notifications']
    },
    'd-products': {
      label: 'Data Products · APIs', en: 'DATA PRODUCTS',
      what: 'Teaching analytics API, NL2SQL and reporting APIs delivered externally with SLA and availability probes.',
      chips: ['SLA', 'availability probes', 'quota'],
      gaps: ['Quota tables exist but billing is not connected', 'Formal SLA needs contract and operations']
    },
    'd-copilot': {
      label: 'Copilot · NL2SQL', en: 'COPILOT',
      what: 'Natural-language analytics: align metrics through the semantic layer, then generate controlled SQL; only whitelisted tables and SELECT are allowed.',
      chips: ['semantic layer', 'read-only SQL', 'whitelist'],
      gaps: ['Raw-table row limits need continuous tightening']
    },
    'd-govern': {
      label: 'Governance · PII · Masking', en: 'GOVERNANCE · PII',
      what: 'PII paths, masking policies, privacy graph and classification; DWD has pii_masked=true across the board.',
      chips: ['PII paths', 'masking policies', 'privacy graph'],
      gaps: ['Data-platform tenant isolation is not live', 'Kerberos / TLS / KMS are not enabled']
    },
    'd-audit': {
      label: 'Inspection · Recovery · lake-health', en: 'AUDIT · RECOVERY',
      what: 'DataOps control-plane audit, query audit, four lake signals plus per-table dt; DLQ inspection/replay, backfill and idempotency audit.',
      chips: ['control-plane audit', 'lake-health', 'replay'],
      gaps: ['DLQ replay is not in routine drills', 'A few historical time-based IDs remain']
    },
    'd-obs': {
      label: 'Events · Alerts · On-call', en: 'ALERTS · ON-CALL',
      what: 'Quality, SLO and freshness anomalies generate events; webhook notifications fall back to the console when not configured.',
      chips: ['webhook', 'event routing', 'fallback'],
      gaps: ['Without a webhook only the console is written', 'On-call process needs organisational rollout']
    },
    'd-report': {
      label: 'Reports · Weekly · Value', en: 'REPORTS · VALUE',
      what: 'DataOps weekly/monthly reports, value overview, learning gain and cost value; printable PDF output.',
      chips: ['weekly / PDF', 'value overview', 'cost estimate'],
      gaps: ['Cost is still estimated, not connected to real billing']
    },

    'p-pg': {
      label: 'PostgreSQL', en: 'OLTP · 105 TABLES',
      what: 'Primary business database for users, courses, chapters, practice, sessions, tasks, resources, general education and privacy requests; daily batch/CDC sync into the lake.',
      chips: ['105 tables', 'business primary DB', 'daily batch / CDC'],
      gaps: ['Database passwords must be rotated at delivery', 'Backup/restore drills done; off-site backup pending']
    },
    'p-redis': {
      label: 'Redis', en: 'CACHE · RATE LIMIT',
      what: 'Session cache, leaderboards and rate-limit counters; cache invalidation and write-through invalidation are wired into key APIs.',
      chips: ['cache', 'leaderboard', 'rate limit'],
      gaps: ['Some rate limits are still in-process; horizontal scaling needs Redis']
    },
    'p-qdrant': {
      label: 'Qdrant', en: 'VECTOR DB',
      what: 'Textbook chunk vector store; one path of dense + sparse hybrid retrieval and rerank; chunk counts are compared with Iceberg for consistency.',
      chips: ['textbook vectors', 'hybrid retrieval', 'drift monitoring'],
      gaps: ['Image vectors are zero (OCR not fully backfilled)']
    },
    'p-kafka': {
      label: 'Kafka', en: 'EVENT BUS',
      what: 'Behaviour, inference, RAG and answer-sample buffering and replay; 3 brokers, RF3, complete ISR; application supports SASL/GSSAPI.',
      chips: ['RF3', 'outbox fallback', 'SASL ready'],
      gaps: ['Production Kerberos is not enabled', 'Some external topics are maintained by the data platform']
    },
    'p-flink': {
      label: 'Flink', en: 'STREAMING',
      what: 'Kafka → Iceberg real-time ingestion; checkpoints keep completing and recover from failures; single-writer and idempotency constraints.',
      chips: ['real-time ingestion', 'checkpoint', 'single writer'],
      gaps: ['Checkpoint failures during incidents need review', 'Exactly-once depends on platform configuration']
    },
    'p-iceberg': {
      label: 'Iceberg · -ha', en: 'LAKEHOUSE · 66 TABLES',
      what: '66 lake tables; warehouse switched to hdfs://qixuandata/iceberg-warehouse-ha; batch and stream share one source, ACID snapshots are traceable.',
      chips: ['66 tables', 'ACID', '-ha'],
      gaps: ['Old warehouse kept for rollback and not yet deleted']
    },
    'p-spark': {
      label: 'Spark Thrift', en: 'QUERY ENGINE',
      what: 'Query entry for DataOps/ETL; SASL PLAIN with timeout; application clients can switch to GSSAPI.',
      chips: ['SASL', '20s timeout', 'GSSAPI ready'],
      gaps: ['Current auth=NONE semantics (SASL PLAIN)', 'Kerberos needs a platform window']
    },
    'p-ollama': {
      label: 'Ollama · GPU ASR', en: 'LLM · SPEECH',
      what: 'Local eduteacher model handles teaching dialogue and reports; the GPU image runs faster-whisper, ctranslate2, sherpa-onnx and speaker diarization.',
      chips: ['eduteacher', 'faster-whisper', '4-speaker diarization'],
      gaps: ['Single GPU, P95 is high at 12 concurrent requests', 'First model download and large-model capacity boundaries']
    },

    'r-eval': {
      label: 'Evaluation · Benchmark', en: 'EVAL',
      what: 'Model gate with 30 questions × 3 runs median, RAGAS and offline sets; results are written to evaluation tables and consumed by the release gate.',
      chips: ['30×3', 'daily eval', 'RAGAS'],
      gaps: ['English and Chinese question types remain weak', 'Evaluation timeouts can block the gate']
    },
    'r-gate': {
      label: 'Model Release Gate', en: 'MODEL GATE',
      what: 'Freeze release when composite score, format or hallucination budget fails; only completed training jobs enter the candidate pool.',
      chips: ['freeze release', 'rollback advice', 'completed'],
      gaps: ['Depends on evaluation freshness', 'Production model training uses external GPU/data']
    },
    'r-auth': {
      label: 'Identity · Tenant', en: 'IDENTITY · TENANT',
      what: 'Application-layer JWT + four role levels + custom roles + tenant isolation; platform admins can switch schools while business pages follow a single-school mainline.',
      chips: ['app-layer multi-tenancy', 'custom roles', 'two-tenant tests'],
      gaps: ['Data-platform tenant_registry is still empty', 'Three-admin separation needs organisational rollout']
    },
    'r-obs': {
      label: 'Observability · Alerting', en: 'OBSERVABILITY',
      what: 'Slow-request buffer, X-Response-Time, Prometheus metrics, SLO and webhook alerts; operation audit uses a hash chain.',
      chips: ['slow requests', 'SLO', 'audit chain'],
      gaps: ['Prometheus/Grafana and central SIEM are not connected', 'Alert channels need configuration']
    },
    'r-ext': {
      label: 'External Integrations', en: 'EXTERNAL INTEGRATIONS',
      what: 'LTI 1.3, xAPI, SCORM, Tencent/Zoom meeting links, academic/logistics webhooks, S3/MinIO; APIs are connected, some await counterpart configuration.',
      chips: ['LTI/xAPI/SCORM', 'meeting links', 'academic / logistics'],
      gaps: ['LMS issuer/JWKS, meeting enterprise accounts and academic/logistics protocols need joint testing']
    },
    'r-compliance': {
      label: 'Compliance · Dengbao', en: 'COMPLIANCE',
      what: 'Dengbao Level 3 technical self-check 84.8% (16 compliant / 7 partial / 5 external / 0 non-compliant); SCA/SBOM, backup recovery and privacy/retention/audit closed loop.',
      chips: ['84.8%', 'SCA/SBOM', 'recovery drill'],
      gaps: ['Formal assessment, SIEM, penetration/code audit and KMS/disk-encryption evidence are external']
    },
    'r-release': {
      label: 'CI/CD · Release', en: 'CI/CD',
      what: 'Qixuan CloudBuild v7: backend/frontend/package/staging; 360 tests, SCA/SBOM, RELEASE.json, host poller health checks and rollback.',
      chips: ['360 tests', 'Qixuan v7', '2b397e05'],
      gaps: ['Image-layer Trivy scanning is supplied by operations']
    },
    'r-docs': {
      label: 'Docs · Learning Pack', en: 'DOCS · LEARNING',
      what: 'Design, user, third-party and compliance docs aligned to 2026-11-26; a new learning pack and document-consistency check were added.',
      chips: ['learning pack', 'consistency check', 'archive'],
      gaps: ['Historical review and competition material is archived and no longer represents the current design']
    }
  },
  tours: [
    { label: "A student's day: login to report", steps: ['l-entry', 'l-course', 'l-chat', 'l-practice', 'l-report', 'l-privacy'] },
    { label: 'Teacher course building & classroom operations', steps: ['l-system', 'l-course', 'l-task', 'l-classroom', 'l-engagement', 'l-video', 'l-tools'] },
    { label: 'How learning data enters the lake', steps: ['l-chat', 'p-pg', 'p-kafka', 'p-flink', 'p-iceberg', 'p-spark', 'd-quality', 'd-lineage', 'd-report'] },
    { label: 'Data governance & model release', steps: ['d-assets', 'd-quality', 'd-slo', 'r-eval', 'r-gate', 'r-release'] },
    { label: 'Security, compliance & privacy', steps: ['l-entry', 'r-auth', 'l-privacy', 'd-audit', 'r-compliance', 'r-obs'] }
  ],
  ui: {
    title: 'Wenqu · Interactive Solution Map',
    sub: 'HodoopForge × EduLake × Edumind × Wenqu AI · 2026-11-26 production baseline',
    back: '← Back to product',
    search: 'Search: RAG, BKT, multi-tenant, privacy, Iceberg, SLO, compliance…',
    statusbar: '<span class="chip ok"><span class="live"></span>Release <b>2b397e05</b></span>' +
      '<span class="chip ok">Tests <b>360 passed</b></span>' +
      '<span class="chip ok">Dengbao self-check <b>84.8%</b></span>' +
      '<span class="chip">Data assets <b>105 PG · 66 Iceberg</b></span>' +
      '<span class="chip ok">Privacy / retention / audit <b>closed loop</b></span>' +
      '<span class="chip ok">Image <b>GPU + 6 security patches</b></span>' +
      '<span class="chip ext">External <b>Dengbao assessment · Kerberos · 10k concurrent</b></span>' +
      '<a class="chip ext-link" href="/en/products/wenqu-dataops-ai/">Product details →</a>',
    legend: [{ t: 'Live', c: 'var(--ok)' }, { t: 'Partial / boundary', c: 'var(--warn)' }, { t: 'Design / pending', c: 'var(--accent2)' }, { t: 'Gap', c: 'var(--bad)' }, { t: 'External', c: 'var(--ext)' }],
    layerLabel: 'Layers', layerAll: 'All', layerLearn: 'Teaching', layerOps: 'DataOps', layerPlat: 'Data platform', layerRail: 'Cross-cutting / security',
    readTitle: 'How to read', toursTitle: 'Tours', currentTitle: 'Current baseline',
    howto: 'Click a node to see <b>what it does, where the evidence is and where the boundary lies</b>; hover to preview, click to pin.<br>Green = live, amber = partial/boundary, indigo = design/pending, red = gap, grey = external. Moving dots on data flows indicate real-time or batch links.',
    currentText: 'Release <b>2b397e05</b>; image <b>open-llm-vtuber-app:gpu</b> (with aiohttp/cryptography/python-multipart/urllib3/pyjwt/pillow patches); Dengbao Level 3 <b>technical self-check 84.8%</b> — formal assessment still needs a third party; data-platform Kerberos/TLS/tenant isolation still awaits a platform window.',
    startKicker: 'Start here', startH3: 'Pick a node',
    startP1: 'The left is <b>teaching application</b>, the middle is <b>DataOps</b>, the bottom is <b>data and model foundation</b>, and the right is <b>model / security / delivery</b>.',
    startP2: 'Node colour shows current status; moving dots show real or planned data flows. Open a node to see evidence, docs and boundaries.',
    startP3: 'Shortcuts: <b>/</b> search, <b>Esc</b> clear selection. Tour buttons play a role-based walkthrough.',
    keyMetrics: 'Key metrics', evidence: 'Evidence / entry point', boundaries: 'Boundaries / not done yet', readMore: 'Read more',
    focusTitle: 'Focus mode: hide the side panel', themeTitle: 'Toggle light / dark theme', searchAria: 'Search the map',
    tourStep: function (label, i, n) { return '<b>' + label + '</b> · Step ' + i + '/' + n; },
    prev: '← Previous', next: 'Next →', auto: '▶ Auto', pause: '⏸ Pause', stop: 'End'
  }
};
