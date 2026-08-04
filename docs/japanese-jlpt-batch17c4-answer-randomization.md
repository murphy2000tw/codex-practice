# Batch 17C-4：JLPT 答案位置平均隨機化

## 目的與範圍

本批次讓每次建立非官方 JLPT 風格模擬測驗 session 時重新排列每題的四個選項，避免正確答案位置形成固定規律。只隨機選項、正確答案位置及各位置出現的題號順序，**不隨機題目**。N5 仍依序為 10 題單字、5 題文法意思及 5 題文法填空；N4 仍先有 20 題單字／文法，再接固定閱讀 manifest 的 10 組／14 題。

## 平均分配與亂數

整個 session 會先建立平均答案位置表，再逐題套用：

- N5 共 20 題，四個位置固定為 **5／5／5／5**。
- N4 共 34 題，各位置出現 **8～9 次**，任兩個位置相差不超過 1；多出來的兩次先隨機分配位置。

正式 runtime 以 `crypto.getRandomValues` 和拒絕取樣產生隨機索引，再用 Fisher–Yates 排列位置表與選項。純 helper 可接受測試用 random-index provider，但測試 provider 不會暴露到 `window` 或操作介面。

## Snapshot 流程與資料保護

啟動測驗時先按原流程建立完整、固定順序的 question snapshots；N4 閱讀也先依固定 manifest 加入。確認 N5 為 20 題或 N4 為 34 題後，才建立平均位置表，並用 `map` 產生隨機化後的新 snapshots 存入記憶體 session。每次返回設定並開始新 session，都會重新產生排列；重新整理也會清除 session。

每個選項先包成帶有 `originalIndex` 的暫存項目。Fisher–Yates 後以原始索引辨認正確選項，再移到預先分配的位置，因此即使選項文字重複也不會誤認。輸出使用新的 options 陣列和新 snapshot；原始題庫物件與原始 options 陣列完全不修改。`answerDisplay`、`explanation`、`passageKana`、`rubyTerms`、`rubyCoverage` 也不會被重建或隨機化，ruby 會隨選項文字正常呈現。

題目、單字／文法區段、閱讀 manifest、閱讀組及組內題目順序全都保持固定。本功能不使用 localStorage、sessionStorage、cookie、IndexedDB、伺服器 API、URL seed 或日期 seed，也不新增計分、計時、生字本或錯題本寫入。
