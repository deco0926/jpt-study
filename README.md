# JPT Study Starter

一個手機優先的 JPT 每日學習網站。

## 目錄
- `site/`：GitHub Pages 實際部署內容
- `site/lessons/latest.json`：首頁載入的最新教材
- `scripts/generate_lesson.py`：每天呼叫 OpenAI API 產生教材
- `.github/workflows/daily-lesson.yml`：每天 08:05 JST 自動生成並部署

## 本機預覽
在專案根目錄執行：

```bash
python -m http.server 8000 -d site
```

瀏覽器打開：

```text
http://localhost:8000
```

## GitHub Secret
Repository → Settings → Secrets and variables → Actions → New repository secret

Name:
`OPENAI_API_KEY`

Value:
你的 OpenAI API key

不要把 API key 寫進 HTML、JavaScript 或 commit 到 GitHub。
