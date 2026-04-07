# 智析 · 企业运营分析与决策支持多智能体平台

## 在线预览

https://multi-agent-web.pages.dev/

## 技术栈

- **前端：** 原生 HTML / CSS / JavaScript（零框架依赖，单文件架构）
- **AI 接口：** Coze API v2（流式 SSE 响应）
- **数据可视化：** ECharts 5.5
- **文件解析：** PDF.js（PDF）、XLSX.js（Excel/CSV）
- **报告导出：** html2pdf.js
- **图标：** Remix Icon 4.1
- **字体：** Inter + JetBrains Mono（Google Fonts）
- **部署：** Cloudflare Pages（Edge Function 代理 Coze API）

## 功能模块

### 三大智能体
| 智能体 | 功能 | Bot ID |
|--------|------|--------|
| 投资者智能体 | 财报解析、情景推演、同业对标、投研报告 | `7615579319687577615` |
| 企业管理智能体 | 运营诊断、政策影响评估、战略优化建议 | `7617827782458179647` |
| 风险监测智能体 | 财务异常识别、风险传播网络、合规核查 | `7619342160248504335` |

### 核心功能
- **文件上传与解析：** 支持 PDF / Excel / CSV / TXT / MD / JSON，客户端解析后拼接到 AI 对话
- **流式对话：** Coze SSE 流式响应，逐字输出
- **数据可视化：** AI 回复中嵌入 ECharts 图表（柱状图、折线图、雷达图、饼图等）
- **报告导出：** 右侧面板一键导出 PDF 报告
- **对话历史：** 左侧边栏管理多轮对话

## 项目结构

```
├── index.html          # 主文件（前端全部代码）
├── api/coze.js         # Vercel Edge Function（Coze API 代理）
├── functions/api/coze.js  # Cloudflare Pages Function（同上）
├── package.json
└── README.md
```

## 部署说明

### Cloudflare Pages（推荐）
```bash
npx wrangler pages deploy . --project-name 项目名 --commit-dirty=true
```
访问地址：`https://项目名.pages.dev`

### Vercel
```bash
vercel --prod
```

## API 配置

Coze API 代理在 `api/coze.js` 中，需要配置：
- `COZE_PAT`：Coze 平台的 Personal Access Token
- Bot ID 在 `index.html` 的 `BOT_CONFIG` 对象中配置

## 文件上传限制

- 单文件最大 10MB
- 解析内容超过 30000 字符会自动截断
- 支持格式：`.pdf` `.xlsx` `.xls` `.csv` `.txt` `.md` `.json`
