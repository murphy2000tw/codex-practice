# 日文閱讀 rubyTerms warning 清理報告

## 1. 本次清理目的

本次任務目標是針對 `node scripts/check-reading-ruby.js` 曾回報的既有 reading `vocabulary` / `rubyTerms` warning 進行確認與清理紀錄，避免把未出現在閱讀 `title` 或 `passage` 的詞彙繼續列在 passage ruby 標註來源中。

本次遵守限制：不新增日文單字、不修改 `vocabulary.json`、不進行 Batch 07、不修改日文單字頁 / 測驗頁 / 英文頁面，也不大幅改寫閱讀文章。

## 2. 原始 warning 清單

本次先執行 `node scripts/check-reading-ruby.js`。目前實際輸出已無 warning：

```text
Checked 105 reading sets. Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.
```

依 Batch 03～06 既有檢查文件記錄，清理前的既有 warning 共 5 筆，如下：

| # | reading set id | warning 詞彙 | 位置 | 是否出現在 title | 是否出現在 passage | 是否只出現在問題 / 選項 / 答案 / 解說 | 建議處理方式 |
|---|---|---|---|---|---|---|---|
| 1 | `jp-reading-set-n4-019` | `一時半` | `vocabulary[5]` | 否 | 否 | 是，只出現在選項「土曜日の午後一時半」 | 從該閱讀資料的 `vocabulary` 移除，不為了檢查而加進本文。 |
| 2 | `jp-reading-set-n4-019` | `一時半` | `rubyTerms[5]` | 否 | 否 | 是，只出現在選項「土曜日の午後一時半」 | 從該閱讀資料的 `rubyTerms` 移除，不為選項詞建立 passage rubyTerm。 |
| 3 | `jp-reading-set-n4-076` | `調べる` | `vocabulary[4]` | 否 | 否；本文為活用形 `調べて` | 是，辭書形 `調べる` 只出現在選項「電車の乗り方を調べるため」 | 做最小文字對齊；閱讀資料中保留可對應本文的 `調べ`，不要新增本文句子。 |
| 4 | `jp-reading-set-n4-076` | `調べる` | `rubyTerms[4]` | 否 | 否；本文為活用形 `調べて` | 是，辭書形 `調べる` 只出現在選項「電車の乗り方を調べるため」 | 做最小文字對齊；`rubyTerms` 使用本文實際出現的 `調べ`。 |
| 5 | `jp-reading-set-n4-102` | `十分前` | `rubyTerms[3]` | 否 | 否；本文為 `午前八時十分` | 否；本 set 的問題、選項、答案、解說也未出現 `十分前` | 從該閱讀資料的 `rubyTerms` 移除；保留本文實際出現且 vocabulary 已列出的 `十分`。 |

## 3. 每筆 warning 原因判斷

### `jp-reading-set-n4-019`：`一時半`

* 原因類型：詞彙列在閱讀資料 `vocabulary` / `rubyTerms`，但沒有出現在 `title` 或 `passage`。
* 實際位置：`一時半` 只屬於干擾選項「土曜日の午後一時半」，不是文章本文資訊。
* 判斷：不適合列為 passage rubyTerms，也不應為了通過檢查硬加到文章本文。

### `jp-reading-set-n4-076`：`調べる`

* 原因類型：詞彙寫法不同；文章中是活用片段 `調べて`，warning 詞是辭書形 `調べる`。
* 實際位置：辭書形 `調べる` 只出現在選項，本文出現的是 `調べておきたい`。
* 判斷：此處最小修正是讓閱讀資料的 `vocabulary` / `rubyTerms` 對齊本文可標註的 `調べ`，避免新增句子或更動題意。

### `jp-reading-set-n4-102`：`十分前`

* 原因類型：詞彙列在 `rubyTerms`，但沒有出現在 `title` 或 `passage`。
* 實際位置：本文是 `午前八時十分ではなく、八時二十五分に出ます`，不是 `十分前`。
* 判斷：`十分前` 不是該篇本文詞，應移除該閱讀資料的 `rubyTerms` 項目；`十分` 已保留在 `vocabulary` 中並符合本文。

## 4. 每筆 warning 的處理方式

| warning 詞彙 | 處理方式 | 結果 |
|---|---|---|
| `一時半` | 已不在 `jp-reading-set-n4-019` 的 `vocabulary` / `rubyTerms` 中；該篇保留本文實際出現的 `三十分`、`午後`、`十分` 等項目。 | warning 已清零。 |
| `調べる` | `jp-reading-set-n4-076` 的 `vocabulary` / `rubyTerms` 已對齊為本文實際可匹配的 `調べ`。 | warning 已清零。 |
| `十分前` | 已不在 `jp-reading-set-n4-102` 的 `rubyTerms` 中；該篇保留本文實際出現的 `十分`。 | warning 已清零。 |

## 5. 修改了哪些閱讀資料

本次工作區開始檢查時，`japaneseReadingQuestions.js` 中相關閱讀資料已呈現 warning 清理後狀態：

* `jp-reading-set-n4-019`：沒有殘留 `一時半` 的 `vocabulary` 或 `rubyTerms` 項目。
* `jp-reading-set-n4-076`：使用 `調べ` 對齊本文 `調べておきたい`。
* `jp-reading-set-n4-102`：沒有殘留 `十分前` 的 `rubyTerms` 項目，並保留 `十分`。

因此本次實際新增的是本清理報告文件，未再修改閱讀資料本文或結構。

## 6. 是否仍有殘留 warning

沒有。`node scripts/check-reading-ruby.js` 目前通過且未輸出 `Reading rubyTerms warnings:` 區塊。

## 7. 若仍有殘留 warning，原因是什麼

不適用。目前沒有殘留 warning。

## 8. 下一步建議

1. 後續若新增或調整閱讀題，請確認 `vocabulary` / `rubyTerms` 的 `word` / `text` 必須實際出現在 `title` 或 `passage`，不要只因問題、選項或解說出現就加入 passage rubyTerms。
2. 對於動詞活用形，若 ruby 標註只能匹配本文片段，應明確使用本文實際可匹配的文字，或另行調整檢查與渲染策略；不要以大範圍自動修正替代人工判斷。
3. 時間片語如 `一時半`、`十分前` 是否要進正式單字庫，應另開單字匯入策略任務處理，不要混入 rubyTerms warning 清理任務。
