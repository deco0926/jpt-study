# 每日交稿與復原

## 正式入口

每天只建立一份 `pipeline/submissions/YYYY-MM-DD.json`：

```json
{"date":"YYYY-MM-DD","lesson":{},"exam":{}}
```

lesson/exam schema 不變。日期採 Asia/Taipei。交稿檔名、bundle、lesson、exam 的日期必須一致。四個不同選項、答案索引0–3、15題、唯一題目ID、80%門檻及既有教材欄位驗證全部保留。語意正確與題目只考已教內容仍須由作者檢查，schema 驗證不能取代教學審查。

ChatGPT 排程須將原本「覆蓋 incoming」指令改成以下交稿段落（其他 Firebase 分析、教學進度等指令保持）：

> 同時完成 lesson 與15題 exam後，以 GitHub 單檔建立功能建立 deco0926/jpt-study 的 pipeline/submissions/台灣日期.json。建立前先讀取同日檔案；不存在才建立，存在且 JSON 內容相同代表交稿已收到，不要覆寫，內容不同則停止並報告衝突。遇到傳輸逾時或409/422，先讀回同日檔案確認是否已成功，不可盲目重送。若 connector safety check 拒絕，停止寫入並保留完整 bundle JSON 作為可下載交稿附件，回報原始錯誤與尚未發布；不得改用 Git tree、commit object、branch ref 或其他工具繞過安全拒絕。提交成功不代表發布成功，需再確認 Publish JPT daily bundle workflow 結果、lesson/exam latest 日期與同日內容。不要直接寫 site/lessons 或 site/exams。

2026-09-29 已於 ChatGPT「已排程」更新既有「JLPT N4 每日教材」的交稿段落，重新開啟確認新入口已保存；每天10:00、12/5結束與原教學／Firebase隱私規則保持。儲存庫本身不會同步修改 ChatGPT 排程；未來維護需同時檢查兩端。未切換的其他排程仍可使用 incoming 舊入口，但舊入口仍可能被 connector 拒絕，也可能被後一天覆蓋。新入口減少共享檔覆蓋與 SHA 競態，不保證 connector 必定接受任何寫入。

## 自動發布

- main 的 incoming 或日期交稿變更觸發發布；每小時第17分鐘補掃；workflow_dispatch 可手動復原部署。GitHub cron 可能延遲。
- 每次讀取最新 main，依日期排序掃描所有交稿，整批驗證完成後才寫正式 JSON 與學習資料庫。
- 同日已發布且內容一致：不改檔；不一致：失敗並顯示路徑，禁止默默改寫既有考卷。
- 歷史補交允許，未來日期禁止。latest 只往較新日期前進，lesson/exam latest 必須成對且對應歷史檔。
- 所有產物由 Actions 在同一 commit 推送，不 force push。遇到 concurrent main 更新，重新取 main 並重新驗證，最多3次；仍失敗由後續掃描重試。
- 發布與一般 Pages 部署共用不取消進行中工作的序列；刪除早於產稿時間的舊09:10部署檢查。
- 若 GitHub 接收交稿前已拒絕，定期掃描無資料可補。保留附件，待使用者在 GitHub 正常審閱上傳或 connector 問題排除後，再走相同驗證流程；不要把 API 換路當作安全檢查的自動備援。
- 一份無效或衝突交稿會讓整批停止。錯誤會留在 Actions，必須由維護者調查修正未發布交稿；不可刪掉有效歷史來強行通過。

## 本機檢查

```sh
python -m unittest discover -s tests -v
python scripts/publish_daily_bundle.py --queue --check
```

單檔模式預設仍要求台灣今日日期；`JPT_EXPECTED_DATE` 僅供明確指定日期的單檔驗證，不能放行未來日期。queue 模式以可信任 main 上的日期交稿作為補交授權。

## 2026-09-28 / 29 事件調查

- 調查時 main 為 de869526dc969d98ad8d7ba38fdfbfc0cdde5ae8；incoming 與兩份 latest 都是2026-09-27，沒有28/29交稿 commit。
- 9/27 發布 run 36287357915 成功。9/29 run 36533185407 在「Verify today's scheduled lesson」失敗，未進入部署，屬於缺稿的下游現象。
- 原對話「JPT 早晨任務」回報28/29單檔 update_file 被 connector safety check 拒絕，並非409；可取得的對話沒有原始 tool 錯誤、request ID 或判定理由。因此能確認未送達 GitHub，以及對話所述拒絕層級，不能證明是哪條 connector 規則或哪段內容觸發，也不能宣稱平台問題已修復。
- 系統弱點是唯一共享收件檔沒有持久交稿佇列，workflow 只看今日日期且缺少覆蓋／日期倒退保護。這次修正收件保存與復原能力，保留安全檢查。
- 28/29教材按原對話 Day5「と思います」與 Day6「でしょう／かもしれません」轉成既有schema；15題驗收依相同教材範圍重建，並非尋獲原始JSON。未新增或修改 Firebase 學習紀錄，15%複習／85%本日主題沿用原對話安排。

## 本次上線驗證

- 修正 commit：`1aa88c1`；Actions 自動發布 commit：`8c681d7`。
- [發布與部署 run 36577060587](https://github.com/deco0926/jpt-study/actions/runs/36577060587) 成功。
- 11項自動測試通過；正式發布後再次 queue check 為0個檔案需要修改。
- GitHub Pages 上28/29的lesson/exam四份歷史檔皆與repo一致，兩份latest皆為2026-09-29且內容一致。共用學習資料updatedThrough為2026-09-29（139個單字、85筆文法）。
- 比對9/24、9/25、9/27教材與考卷Git blob，均未改動。
- 尚未觀察下一次10:00排程實際執行，因此不宣稱 connector 的未來寫入保證成功。
