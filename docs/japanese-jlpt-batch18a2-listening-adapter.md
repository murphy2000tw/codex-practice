# Batch 18A-2：JLPT N5／N4 聽力 immutable adapter 與 provenance

## 範圍

本批只建立 dormant 的純函式題庫轉接邊界。`createJapaneseJlptListeningCandidates(sourceQuestions)` 接受已解析的 `JAPANESE_LISTENING_QUESTIONS` 陣列，先對**整庫**做 fail-closed 驗證，再逐題呼叫 `adaptJapaneseJlptListeningQuestion(question)`。兩個函式都不 fetch、不讀檔、不操作 DOM 或 storage，也不讀取或建立正式 session。

## Adapter contract 與 inventory

來源必須恰有 100 題，其中 N5 69 題、N4 31 題；ID 集合必須恰為唯一的 `jl-001`～`jl-100`。每題的 `id`、`level`、`category`、`japanese`、`kana`、`zh`、`question` 必須是非空字串，`level` 僅能為 N5 或 N4。`options` 必須恰有四個非空字串，`answerIndex` 必須是 0～3 的整數，且 `options[answerIndex] === zh`。

任何題數、級別數量、ID、欄位或答案契約錯誤都會丟出錯誤；adapter 不會略過、修補或提供 fallback。

## Candidate schema

每個唯讀 candidate 包含：

* `id`：`japanese-jlpt-listening:<sourceId>`，是穩定且唯一的 canonical identity。
* `sourceId`、`sourceBank`、`sourceVersion`、`adapterVersion`：完整來源追溯資訊。
* `level`、固定為 `listening` 的 `section`、固定為 `listeningMeaning` 的 `questionType`。
* `category`、`japanese`、`kana`、`zh`、`question`、複製後的四個 `options`、`answerIndex`。
* `canonicalCorrectOption`：建立時同時由 `zh` 與 `options[answerIndex]` 嚴格相等的契約確認，值固定為原始 `zh`；未來即使選項重新排列也不需依賴排列後的 index 追蹤正解。

目前 provenance 常數為：

* source bank：`JAPANESE_LISTENING_QUESTIONS`
* source version：`18a2-listening-source-v1`
* adapter version：`18a2-listening-adapter-v1`

版本字串只在來源內容契約或 adapter 映射契約變更時遞增；candidate identity 由固定 namespace 與穩定 source ID 組成，不把可變排列位置納入 identity。

## Immutable 與 reference isolation

Adapter 僅讀取來源，另建 `options` 陣列及 candidate 物件，最後 deep-freeze 每題、其巢狀值及整個候選陣列。它不修改也不 freeze 來源陣列、來源題目或來源 `options`，且不原地排列選項。因此建立後修改來源不影響 candidate；嘗試修改 candidate 也不會影響來源。

## 未啟用聲明

本批沒有讓 `buildJapaneseJlptSession()` 呼叫 adapter，沒有修改 production profile、JLPT 設定、計分、播放、既有聽力練習／獨立測驗或 localStorage/cache schema。Listening 仍是 `future` 且未納入 quota；N5 正式總數仍為 20，N4 仍為 34。播放一次限制與正式 JLPT 聽力啟用留待後續批次。
