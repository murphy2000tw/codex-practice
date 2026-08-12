# Batch 17C-6：JLPT 固定題數抽題引擎

## Compatibility profile

本批在 `script.js` 建立並深度凍結 `17c6-compat-v1`／`site-jlpt-style-compatibility` registry。它是 transitional compatibility profile，不是最終產品 quota：N5 為單字 10、文法 10，共 20 題；N4 為單字 10、文法 10、legacy fixed manifest 閱讀 14，共 34 題。N5 reading 與兩級 listening 都明確 `included: false`，因此不建立 pool、不驗證題庫充足性，也不計入總題數。

Validator 不從 `status` 或 `total` 推測 `included`，也不把 `null` 轉成零。included section 必須 available，section total 與每個 question-type quota 都必須是非負安全整數，且 type、section、level 三層加總必須一致。只接受 registry 中明確存在的 profile version/id 與 N5/N4。

## Atomic session pipeline

實際建立順序固定為：

1. Prepare 階段先正規化本次收到的所有候選，拒絕缺欄位或未註冊分類，再依 `(level, section, questionType)` 建立 included pool registry。
2. Prepare 階段以 canonical identity 去重並驗證**所有** pool 的有效題數；不足時拋出 `JLPT_INSUFFICIENT_POOL` 與 `{ level, section, questionType, required, available, profileVersion }`。此階段不呼叫 random provider、不抽題也不建立部分結果。
3. 所有 pool 通過後才進入 Select 階段，用既有 crypto rejection sampling 與 Fisher–Yates 作場內無放回 selection；legacy reading manifest 則維持既有 set、question ID 與組內題序。
4. 深度複製並凍結完整 pre-randomization snapshot。一般題 identity 包含來源題 ID；reading identity 是 `(setId, questionId)`，quota 以實際 question 數計。
5. 依 profile 的實際總題數建立 balanced answer positions，再複製 options、排列並更新 `answerIndex`。
6. 所有步驟成功後才一次發布 memory-only session。

Reading snapshot 保留 passage、kana、ruby coverage、來源 set、題目 ID與 `sourceSetQuestionCount`；`selectedSessionQuestionCount` 在 selection 完成後依本場實際入選結果計算。Snapshot 的所有巢狀資料會先 deep clone 再 deep freeze，來源 bank、candidate、randomized question 與 frozen pre-randomization snapshot 不共享可變巢狀狀態。本批沒有新增題型、題目、Listening、儲存狀態或 LocalStorage schema。

## 後續批次

Batch 17C-7 才新增 vocabulary 題型與 derived adapters；17C-8 處理 grammar；17C-9 擴充 reading 與 N5 reading data；17C-10 才定案產品 quota。Listening 仍留給 Batch 17D。
