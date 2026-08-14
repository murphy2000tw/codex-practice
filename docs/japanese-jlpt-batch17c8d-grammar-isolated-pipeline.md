# Batch 17C-8D：JLPT grammar isolated identity pipeline

## 定位與 isolated profile

本批建立非 production 的文法測試流程，用來驗證 `adapter → normalize → prepare pools → selection → immutable pre-randomization snapshot → balanced answer positions → option/chunk randomization`。checker 內的 profile 為 `17c8d-isolated-grammar-fixture-v1`、`site-jlpt-style-grammar-fixture`、`test-only-isolated`；N5、N4 各自只在 fixture 選取 `form-selection` 4 題與 `sentence-composition` 4 題（每級 8 題）。這些數字不是 production quota，也未加入 `JAPANESE_JLPT_PROFILE_REGISTRY`。

本站資料是內部 JLPT-style 練習素材；不得解讀為官方 JLPT 題庫或官方認證內容。正式啟用與產品 quota 決策仍只屬於 Batch 17C-10。

## Adapter contract 與 pool capacity

`adaptJapaneseJlptGrammarFormSelectionQuestion(question)` 與 `createJapaneseJlptGrammarFormSelectionCandidates(bank)` 是純函式：只接受已解析的 derived bank，不 fetch、不讀檔、不使用 storage。bank root 必須符合 `1.0.0` schema、`17c8b-v1` derivation／manifest 及 `full-canonical-source-v1` policy，inventory 必須為 N5 12、N4 12、合計 24。每題的 stable/source identity、分類、prompt 三欄、四個互異選項、answer alignment、grammar/review/digest metadata 及四筆逐位置 review 全部 fail closed 驗證；必須恰一筆正解 review，三筆錯項均有具體理由。任何一題無效就拒絕整個 bank，不略過也不 fallback。

Adapter deep clone 所有來源與巢狀資料，不修改或 freeze derived bank，也不共享 mutable reference；相同輸入產生 deterministic stable candidates。與既有 sentence-composition adapter 合併後，實際容量為 N5/N4 form-selection 各 12、sentence-composition 各 30，共 84 題、每級 42 題，canonical identity 全域唯一。

## Immutable snapshot boundary 與平衡位置

selection 完成後才 deep clone、deep freeze pre-randomization snapshot。此動作不修改或 freeze candidates；source、candidate、snapshot 與 randomized question 之間不共享 mutable nested reference。checker 雙向 mutation 驗證 source/candidate 隔離，並逐 byte 確認 option randomization 前後 snapshot 不變。不同 deterministic random providers 可以改變 selection 或排列，但 candidate/source identity 不因位置、文字或時間而改變。

每級 fixture session 恰有 8 題，答案位置只由 `createBalancedJapaneseJlptAnswerPositions()` 建立，四個位置各出現兩次。random provider 回傳範圍外 index、無效 target position 或 identity 無法解析時一律拋錯，不建立 partial session。

## Canonical option／chunk identity 與 permutation metadata

form-selection 的 canonical option ID 由 stable `sourceQuestionId` 加原始 choice index 組成，不使用顯示文字或 shuffle 後位置。隨機化同步排列 `options` 與 `optionReviews`；review 保存目前 `choiceIndex`、`originalChoiceIndex` 與 `canonicalOptionId`，正解 review、`answerIndex`、`answerDisplay` 必須一致。

sentence-composition 直接以 chunk ID 作 canonical option ID。`options`、`optionChunkIds`、`chunks` 使用同一 permutation，任何位置均符合 option text/chunk text 及 option ID/chunk ID；`correctChunkId`、`correctOrder`、`canonicalChunkIds` 不變。缺少、重複、未知或無法唯一解析的 chunk identity 均 fail closed，正解不由重複可能的顯示文字推測。

兩種新題型都保存 `optionPermutation`：

- `version: "17c8d-v1"`
- `randomizedIndexToOriginalIndex` 與其 inverse `originalIndexToRandomizedIndex`
- `preRandomizationCanonicalOptionIds` 與 `randomizedCanonicalOptionIds`
- `correctCanonicalOptionId`
- `correctOriginalIndex` 與 `correctRandomizedIndex`

已帶入 permutation metadata 的 pre-randomization input 會被拒絕，避免重複 randomization 或不可信 mapping 穿越 immutable boundary。

## Shortage fail-closed 與 production isolation

form-selection 要求 13／available 12，以及 sentence-composition 要求 31／available 30 時，pool preparation 在呼叫 random provider 前以 `JLPT_INSUFFICIENT_POOL` 失敗；details 保存 level、section、questionType、required、available、profileVersion。不產生 partial selection/session，也不跨 level、題型、legacy meaning/cloze 或其他 bank fallback。

Production `17c6-compat-v1` 完全不變：N5 20 題、N4 34 題，grammar 仍只有 legacy `meaning`／`cloze`。`buildJapaneseJlptSession()` 不載入或呼叫新 adapter；入口不 fetch/import form-selection bank、sentence-composition bank 或 permutation evidence。本批不增加 profile、UI、設定、storage/cache API，也不改一般句子重組 state。正式 JSON、manifest、derived bank 與 evidence 維持相對 PR #297 merge commit 的 byte identity；HTML 唯一改動是 `script.js` cache token `v=4.0` → `v=4.1`。

Batch 17C-10 才能決定 production activation、固定 quota 與產品設定；本批通過只證明 isolated pipeline 的結構、immutability、平衡與 identity 契約。
