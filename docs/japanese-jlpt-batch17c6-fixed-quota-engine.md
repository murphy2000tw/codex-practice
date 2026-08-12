# Batch 17C-6：JLPT 固定題數抽題引擎

## Compatibility profile

本批在 `script.js` 建立並深度凍結 `17c6-compat-v1`／`site-jlpt-style-compatibility` registry。它是 transitional compatibility profile，不是最終產品 quota：N5 為單字 10、文法 10，共 20 題；N4 為單字 10、文法 10、legacy fixed manifest 閱讀 14，共 34 題。N5 reading 與兩級 listening 都明確 `included: false`，因此不建立 pool、不驗證題庫充足性，也不計入總題數。

Validator 不從 `status` 或 `total` 推測 `included`，也不把 `null` 轉成零。included section 必須 available，section total 與每個 question-type quota 都必須是非負安全整數，且 type、section、level 三層加總必須一致。只接受 registry 中明確存在的 profile version/id 與 N5/N4。

## Atomic session pipeline

實際建立順序固定為：

1. 依 `(level, section, questionType)` 正規化候選並只建立 included pools。
2. 在抽題前以 canonical identity 去重並驗證每個 pool 的有效題數；不足時拋出 `JLPT_INSUFFICIENT_POOL` 與 `{ level, section, questionType, required, available, profileVersion }`，不發布 session。
3. 用既有 crypto rejection sampling 與 Fisher–Yates 作場內無放回 selection；legacy reading manifest 則維持既有 set 與組內題序。
4. 深度複製並凍結完整 pre-randomization snapshot。一般題 identity 包含來源題 ID；reading identity 是 `(setId, questionId)`，quota 以實際 question 數計。
5. 依 profile 的實際總題數建立 balanced answer positions，再複製 options、排列並更新 `answerIndex`。
6. 所有步驟成功後才一次發布 memory-only session。

Reading snapshot 保留 passage、kana、ruby coverage、來源 set、題目 ID、原 set 題數與本場同 set 入選題數。來源 bank、來源 options 與 frozen pre-randomization snapshot 都不會被 option randomization 修改。本批沒有新增題型、題目、Listening、儲存狀態或 LocalStorage schema。

## 後續批次

Batch 17C-7 才新增 vocabulary 題型與 derived adapters；17C-8 處理 grammar；17C-9 擴充 reading 與 N5 reading data；17C-10 才定案產品 quota。Listening 仍留給 Batch 17D。
