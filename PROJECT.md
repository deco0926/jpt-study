# JPT Study — Project Guide

這份文件是本專案的長期開發規格與現況說明。  
任何新的 ChatGPT / Codex 任務開始前，請先閱讀本文件與 `AGENTS.md`。

## 1. 專案目標

JPT Study 是一個以繁體中文為介面的日文初學者學習網站。

目前主要目標：

- 準備 2026-09-13 的 JPT
- 程度約以 JLPT N5 基礎範圍為主
- 每日教材、複習、自我測驗與學習診斷整合在同一網站
- 手機優先，但桌機版也必須有良好排版
- 盡量讓功能能在 GitHub Pages 靜態網站上直接運作

## 2. 技術架構

目前是純靜態網站：

- HTML
- CSS
- Vanilla JavaScript
- JSON 教材
- GitHub Pages
- GitHub Actions
- OpenAI API（用於每日教材與晚間考卷自動產生）
- Firebase Authentication（Google 登入）
- Cloud Firestore（私人晚間驗收紀錄）

目前沒有前端框架。正式晚間驗收使用 Firebase 作為帳號與雲端紀錄後端；其他學習進度與自我測驗仍保留 localStorage。

## 3. 主要檔案

```
site/
├─ index.html          # 今日學習
├─ app.js              # 今日學習邏輯
├─ database.html       # 學習資料庫
├─ database.js         # 五十音、單字、文法資料庫
├─ quiz.html           # 自我測驗
├─ quiz.js             # 自訂測驗、今日專屬考卷、學習診斷
├─ evening.html        # 需登入的正式晚間驗收
├─ evening.js          # 晚間驗收、計時、交卷與私人歷史
├─ firebase.js         # Firebase Authentication / Firestore 連線
├─ style.css           # 全站樣式
└─ lessons/
   ├─ latest.json      # 今日教材入口
   └─ YYYY-MM-DD.json  # 每日教材歷史

scripts/
├─ generate_lesson.py       # 使用 OpenAI API 產生每日教材
└─ generate_evening_exam.py # 使用今日教材產生正式晚間考卷

.github/workflows/
├─ daily-lesson.yml    # 每日自動產教材並部署
├─ evening-exam.yml    # 台灣時間 19:00 自動產生晚間考卷
└─ deploy-pages.yml    # main push 後部署 GitHub Pages
```

## 4. 目前主要功能

### 今日學習

`site/index.html` + `site/app.js`

包含：

- 今日教材
- 學習目標
- 五十音 / 片假名內容
- 單字
- 文法
- 快速練習
- 今日收尾 checklist
- 今日進度百分比

學習進度使用瀏覽器 `localStorage`：

```
jpt-progress-YYYY-MM-DD
```

因此：

- 每台裝置各自保存
- 不會與其他訪客共用
- 尚未跨裝置同步

### 學習資料庫

`site/database.html` + `site/database.js`

包含：

- 五十音總表
- 平假名 / 片假名切換
- 五十音行別快速篩選
- 隨機假名練習
- 單字庫
- 文法庫
- 全域搜尋
- 手機與桌機響應式排版

目前資料庫資料仍有部分直接寫在 `database.js` 中。

### 自我測驗

`site/quiz.html` + `site/quiz.js`

包含：

- 單字
- 文法
- 平假名
- 片假名
- 濁音 / 半濁音
- 拗音
- 題數選擇
- 簡單 / 普通 / 困難
- 全部為 4 選 1
- 總計時
- 每題作答時間
- 答對率
- 錯題回顧
- 練習紀錄
- 長期學習診斷

基本五十音可再選：

- あ行
- か行
- さ行
- た行
- な行
- は行
- ま行
- や行
- ら行
- わ行・ん

重要規則：

> 如果只選某些五十音行，題目與四個選項都必須限制在使用者選擇的範圍內。

例如只考「か行」時：

- 題目只能來自 かきくけこ / カキクケコ
- 四個選項也只能來自該範圍
- 不可混入其他行當作容易排除的干擾項

因固定為四選一，若選取範圍不足 4 個不同假名，介面必須提示使用者增加範圍。

### 今日專屬考卷

自我測驗頁會讀取：

```
site/lessons/latest.json
```

並根據今日教材動態產生隨機考卷。

目前：

- 可選 5 / 10 / 15 / 20 題
- 可選難度
- 每次重新產生不同題目 / 選項順序
- 只從今日教材中的五十音、單字、文法、快速練習延伸
- 成績也會進入測驗歷史與診斷

為降低體感延遲：

- `quiz.html` 會提早開始抓 `latest.json`
- 使用正常瀏覽器 cache
- `quiz.js` 沿用已開始的 Promise
- 不要重新改回 `cache: "no-store"`，除非有明確理由

## 5. 學習診斷規格

### 正確率

| 正確率 | 判定 |
|---|---|
| 90–100% | 熟練 |
| 80–89% | 基本掌握 |
| 70–79% | 不穩定 |
| 60–69% | 明顯弱項 |
| 0–59% | 優先補強 |

正式分類診斷至少要有 10 題樣本。  
五十音行別至少 5 題才給初步判斷。

### 普通難度答題速度基準

| 類型 | 基準 |
|---|---:|
| 平假名 | 6 秒 |
| 片假名 | 6 秒 |
| 濁音 / 半濁音 | 8 秒 |
| 拗音 | 9 秒 |
| 單字 | 12 秒 |
| 文法 | 18 秒 |

難度倍率：

- 簡單：× 0.85
- 普通：× 1.00
- 困難：× 1.25

若平均答題時間超過基準的 135%，標示為「速度偏慢」。

### 診斷資料

目前自我測驗紀錄存在：

```
jpt-selftest-history-v1
```

也是 localStorage，因此：

- 每台裝置分開
- 最多保留近期紀錄
- 尚未跨裝置同步

## 6. 每日教材系統

`scripts/generate_lesson.py`：

- 使用 OpenAI API
- 讀上一份 `latest.json` 作為前文
- 產生當天 JSON
- 寫入 `site/lessons/YYYY-MM-DD.json`
- 同步覆蓋 `site/lessons/latest.json`

`daily-lesson.yml` 會每日自動執行並部署。

OpenAI API Key 必須只存在 GitHub Secrets：

```
OPENAI_API_KEY
```

不可寫入：

- README
- JavaScript
- JSON
- commit
- issue
- log

## 7. UI / UX 原則

### 語言

- 使用繁體中文（zh-Hant）
- 日文內容保留日文
- 初學者導向
- 不要假設使用者已經知道尚未教過的內容

### 手機

手機是主要使用情境：

- 按鈕要容易點
- 字不能太小
- 單欄為主
- 避免橫向溢出
- 五十音表可在必要時橫向捲動

### 桌機

桌機不可只是把手機版拉寬：

- 合理利用寬螢幕
- 單字卡可多欄
- 文法區可多欄
- 保持閱讀寬度
- 不要讓內容散得太開

## 8. 目前已知技術債

### 重複資料

目前：

- `database.js`
- `quiz.js`
- 每日 lesson JSON

之間存在五十音 / 單字 / 文法資料重複。

未來建議重構成共用資料，例如：

```
site/data/
├─ kana.json
├─ vocabulary.json
└─ grammar.json
```

或共用 JS data module。

重構前務必確保：

- 學習資料庫不壞
- 自我測驗不壞
- 今日專屬考卷不壞

### 今日學習仍使用 no-store

`app.js` 的今日學習目前仍以：

```js
fetch("./lessons/latest.json", { cache: "no-store" })
```

讀取教材。

這和 quiz 頁的優化不同。若要改，必須先確認每日更新後仍能可靠取得最新教材。

## 9. 建議下一步

目前較值得做的項目：

1. 將共用學習資料抽離，減少 database.js / quiz.js 重複
2. 過去教材日期切換
3. 錯題本
4. 根據診斷結果一鍵產生「弱點複習測驗」
5. Firebase 登入與跨裝置同步
6. 更完整的長期趨勢統計
7. 將今日教材 / 今日測驗資料的載入與 cache 策略統一

## 10. 開發決策原則

如果需求有兩種實作方式，優先順序：

1. 不破壞現有功能
2. 對初學者清楚
3. 手機可用
4. 桌機也好用
5. 靜態 GitHub Pages 可運作
6. 盡量少增加不必要依賴
7. 維護性優於短期 patch
