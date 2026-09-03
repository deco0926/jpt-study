# AGENTS.md

本檔案是給 Codex / AI coding agent 的專案操作規則。

開始任何開發工作前：

1. 先讀 `PROJECT.md`
2. 再讀 `README.md`
3. 檢查本次會修改到的檔案
4. 不要只靠任務描述猜目前程式狀態

## Project summary

這是一個繁體中文的 JPT 日文學習靜態網站。

核心技術：

- HTML
- CSS
- Vanilla JavaScript
- JSON
- GitHub Pages
- GitHub Actions

不要自行引入 React、Vue、Next.js、Vite、Tailwind 或其他大型框架，除非任務明確要求並先說明遷移理由。

## Must preserve

任何修改都不可無意破壞以下功能：

### 今日學習

- `site/index.html`
- `site/app.js`
- `site/lessons/latest.json`
- localStorage 每日進度
- 80% 今日驗收通過判斷

### 學習資料庫

- 五十音總表
- 平 / 片假名切換
- 行別篩選
- 隨機假名
- 單字搜尋
- 文法資料
- 全域搜尋
- 手機 / 桌機 responsive layout

### 自我測驗

- 4 選 1
- 單字 / 文法 / 平假名 / 片假名 / 濁音 / 拗音
- 題數與難度
- 五十音行別選取
- 計時
- 每題時間
- 答對率
- 錯題回顧
- localStorage 歷史
- 學習診斷

### 今日專屬考卷

- 從 `./lessons/latest.json` 讀今日教材
- 每次可重新產生不同題目
- 題目只應建立在今日教材內容上
- 不可偷偷考尚未出現在今日教材的內容
- 載入方式已做 early fetch + browser cache 優化

## Critical quiz rule

當基本五十音測驗選取行別時：

> 題目與錯誤選項都必須限制在使用者選取的行別。

例如只選 `か行`：

- 題目：か / き / く / け / こ（或片假名版本）
- 選項也只能從同一範圍產生

不可因為要湊 4 選 1 而加入其他行。

如果可用項目不足 4 個，應顯示明確提示，而不是放寬範圍。

## Diagnosis rules

不要任意改門檻。

正確率：

- 90–100%：熟練
- 80–89%：基本掌握
- 70–79%：不穩定
- 60–69%：明顯弱項
- 0–59%：優先補強

樣本：

- 分類 >= 10 題才正式診斷
- 五十音行別 >= 5 題才給初步診斷

普通難度速度基準：

- hira: 6s
- kata: 6s
- dakuten: 8s
- yoon: 9s
- vocab: 12s
- grammar: 18s

倍率：

- easy × 0.85
- normal × 1
- hard × 1.25

速度偏慢：

- 平均時間 > 基準 × 1.35

## Data persistence

正式晚間驗收已使用 Google 登入與 Cloud Firestore。

以下資料仍只存在瀏覽器 localStorage：

- 今日學習進度
- 自我測驗歷史
- 學習診斷基礎資料

不要把 localStorage 誤認成全站共享資料。

Firebase / 後端同步規則：

- 必須保留每位使用者資料隔離
- 不可讓公開訪客看到其他人的學習紀錄
- 必須先設計 migration / fallback
- 晚間驗收紀錄固定寫入 `users/{uid}/examAttempts`
- 前端 Firebase 設定不是 secret；服務帳戶金鑰仍不可提交

## Evening exam generation

晚間考卷由：

- `scripts/generate_evening_exam.py`
- `.github/workflows/evening-exam.yml`

負責，台灣時間每日 19:00 產生。題目必須保持四選一且只能使用當日教材範圍。

## Daily lesson generation

每日教材由：

- `scripts/generate_lesson.py`
- `.github/workflows/daily-lesson.yml`

負責。

不要將 `OPENAI_API_KEY` 寫進 repo。

若修改每日教材 schema：

必須同步檢查：

- app.js
- quiz.js 今日專屬考卷
- generate_lesson.py
- 現有 lessons JSON

## UI rules

- 介面使用繁體中文
- 保持初學者友善
- 手機優先
- 桌機版也要合理利用寬度
- 不要把所有卡片硬塞在一欄
- 不要使用過小字體
- 互動按鈕需要可觸控

## Editing rules

進行修改時：

1. 先讀完整相關函式，不要只 patch 片段
2. 優先共用 helper，避免再複製一份相同資料
3. 保留既有 localStorage key，除非有 migration
4. 保留既有 lesson JSON 相容性
5. 不要無故改動 GitHub Actions
6. 不要無故更換依賴或部署方式
7. 不要提交 secret、token、API key
8. 不要刪掉目前已上線功能，除非任務明確要求

## Validation checklist

修改 JavaScript 後至少確認：

- JavaScript syntax valid
- 所有 querySelector 對應元素存在
- 4 選 1 一定有 4 個不同選項
- 正確答案只有 1 個
- 五十音選項沒有超出使用者選取行別
- localStorage 舊資料不會讓頁面 crash
- empty history / empty diagnosis 狀態正常

修改 UI 後至少確認：

- 約 375px 手機寬度
- 約 768px 平板寬度
- >= 1000px 桌機寬度
- 沒有不必要的水平捲軸
- sticky nav 不遮住主要內容

修改教材 schema 後至少確認：

- index 頁能讀
- 今日專屬考卷能讀
- daily workflow 產出的 JSON 能讀

## Preferred workflow for Codex

對較大的功能：

1. 先說明預計修改哪些檔案
2. 簡述實作方式
3. 實作
4. 執行可用的檢查 / 測試
5. 回報：
   - 改了什麼
   - 哪些檔案
   - 如何驗證
   - 尚有哪些限制

如果發現需求會牽涉架構調整，不要直接大改；先提出最小可行方案與較完整方案的差異。
