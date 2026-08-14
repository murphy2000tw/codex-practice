# Batch 17C-8C：JLPT sentence-composition immutable adapter

本批以既有 `japaneseSentenceCompositionQuestions.json` 為唯一來源，共 60 題（N5 30 題、N4 30 題），並以 Batch 16D-3 final-v2 證據逐題驗證 24 個排列，共 1,440 個排列。來源題庫與排列證據均不修改，也不複製或重新產生另一份題庫。

Checker 另執行 23 個真正送入 adapter 或 evidence validator 並被拒絕的 negative fixtures；mutation isolation 則維持獨立的正向 invariant，不計入拒絕數。

## Adapter contract

`createJapaneseJlptSentenceCompositionCandidates(sourceBank)` 接受已解析陣列；它不 fetch、不讀檔，也不接觸 storage。它會 fail closed 驗證完整 inventory、欄位、四個 chunk、完整 `correctOrder` permutation、star slot、句子重建及唯一答案審核；任一題失敗即拒絕整個 bank，沒有跨 level、question type 或其他 bank fallback。

每個 candidate 保留來源文字、假名、中文、說明、slots、chunks、grammar IDs 與審核資料，並加入 `section: "grammar"`、`questionType: "sentence-composition"`、`sourceBank`、`adapterVersion: "17c8c-v1"`、review/chunk identity versions、kanji policy 及獨立的空 `rubyTerms`。`displayText` 只顯示 before、四個作答格與 after，不顯示完整答案。

Stable ID 使用 level 與來源 ID：`jlpt-grammar-17c8c-{level}-sentence-composition-{sourceId}`，不使用 array position。`canonicalChunkIds` 是來源 `correctOrder`；`correctChunkId` 僅由 `correctOrder[starSlot]` 決定，再以 chunk ID 對到 `optionChunkIds`、`options`、`answerIndex` 與 `answerDisplay`，不依文字、shuffle、時間或位置推測 identity。

## Immutability 與隔離

Adapter 對每題及所有巢狀陣列／物件 deep clone。candidate 不與 source bank 共用 mutable reference；任一方向後續 mutation 都不影響另一方。Adapter 不修改也不 freeze 呼叫者的 source bank，且相同輸入 deterministic 產生相同內容。

本批沒有 production activation、正式 profile 或 quota 變更，也不建立 isolated test profile。`17c6-compat-v1` 維持 N5 20 題與 N4 34 題，一般句子重組仍使用既有 `sentenceCompositionQuestions` state。

Batch 17C-8D 才會處理 isolated profile、selection、immutable pre-randomization snapshot、balanced answer positions，以及 chunk randomization metadata/identity 對齊驗證；17C-8C 不呼叫該完整 pipeline。
