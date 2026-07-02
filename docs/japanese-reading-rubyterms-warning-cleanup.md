# 日文閱讀 rubyTerms warning 清理報告

## 1. 本次清理目的

本次任務目標是清理 `node scripts/check-reading-ruby.js` 回報的既有 reading rubyTerms warning。修正範圍僅限閱讀資料中與 warning 直接相關的 `vocabulary` / `rubyTerms` 項目，並新增本清理報告。

本次未進行 Batch 07，未新增日文單字，且未修改 `vocabulary.json`。

## 2. 原始 warning 清單

執行 `node scripts/check-reading-ruby.js` 後，原始 warning 共 5 筆：

| # | reading set id | 位置 | warning 詞彙 | 是否出現在 title | 是否出現在 passage | 是否只出現在問題、選項、答案或解說中 | 建議處理方式 |
|---|---|---|---|---|---|---|---|
| 1 | `jp-reading-set-n4-019` | `vocabulary[5]` | `一時半` | 否 | 否 | 是，出現在選項 `土曜日の午後一時半` | 從該閱讀資料的 `vocabulary` 移除 |
| 2 | `jp-reading-set-n4-019` | `rubyTerms[5]` | `一時半` | 否 | 否 | 是，出現在選項 `土曜日の午後一時半` | 從該閱讀資料的 `rubyTerms` 移除 |
| 3 | `jp-reading-set-n4-076` | `vocabulary[4]` | `調べる` | 否 | 否；本文為活用形 `調べて` | 是，出現在選項 `電車の乗り方を調べるため` | 以最小文字對齊方式改為本文可匹配的 `調べ` |
| 4 | `jp-reading-set-n4-076` | `rubyTerms[4]` | `調べる` | 否 | 否；本文為活用形 `調べて` | 是，出現在選項 `電車の乗り方を調べるため` | 以最小文字對齊方式改為本文可匹配的 `調べ` |
| 5 | `jp-reading-set-n4-102` | `rubyTerms[3]` | `十分前` | 否 | 否；本文為 `午前八時十分` | 否；問題與選項也未使用 `十分前` | 從該閱讀資料的 `rubyTerms` 移除，保留既有 `vocabulary` 的 `十分` |

## 3. 每筆 warning 原因判斷

### `jp-reading-set-n4-019`：`一時半`

- `title` 為 `図書館イベント`，不含 `一時半`。
- `passage` 說明活動「午後二時」開始，且「三十分前」可入場，不含 `一時半`。
- `一時半` 只出現在錯誤選項 `土曜日の午後一時半`。
- 判斷原因：詞彙只出現在選項，不適合列在 passage 專用的 `vocabulary` / `rubyTerms`。

### `jp-reading-set-n4-076`：`調べる`

- `title` 為 `図書館の本`，不含 `調べる`。
- `passage` 使用活用形 `調べておきたい`，不含辭書形 `調べる`。
- `調べる` 只以辭書形出現在正確選項 `電車の乗り方を調べるため`。
- 判斷原因：詞彙寫法與本文不同；本文應加 ruby 的實際字面是 `調べ`。

### `jp-reading-set-n4-102`：`十分前`

- `title` 為 `バス時刻の変更`，不含 `十分前`。
- `passage` 使用 `午前八時十分`，不含 `十分前`。
- 問題、選項與解說也未使用 `十分前`。
- 判斷原因：`rubyTerms` 誤列不在本閱讀題文本中的詞彙；本文已有 `十分`，且該詞也已列在本閱讀題 `vocabulary`。

## 4. 每筆 warning 的處理方式

| reading set id | warning 詞彙 | 處理方式 |
|---|---|---|
| `jp-reading-set-n4-019` | `一時半` | 從該閱讀資料的 `vocabulary` 移除 |
| `jp-reading-set-n4-019` | `一時半` | 從該閱讀資料的 `rubyTerms` 移除 |
| `jp-reading-set-n4-076` | `調べる` | 將該閱讀資料的 `vocabulary` 項目由 `調べる / しらべる` 最小改為 `調べ / しらべ`，對齊 passage 的 `調べておきたい` |
| `jp-reading-set-n4-076` | `調べる` | 將該閱讀資料的 `rubyTerms` 項目由 `調べる / しらべる` 最小改為 `調べ / しらべ`，對齊 passage 的 `調べておきたい` |
| `jp-reading-set-n4-102` | `十分前` | 從該閱讀資料的 `rubyTerms` 移除；未改動本閱讀題既有 `vocabulary` 的 `十分` |

## 5. 修改了哪些閱讀資料

本次僅修改以下閱讀資料：

- `jp-reading-set-n4-019`
- `jp-reading-set-n4-076`
- `jp-reading-set-n4-102`

## 6. 是否仍有殘留 warning

清理後再次執行 `node scripts/check-reading-ruby.js`，未再顯示 reading rubyTerms warning。

## 7. 若仍有殘留 warning，原因是什麼

本次清理後沒有殘留 warning。

## 8. 下一步建議

- 後續若新增或調整閱讀題的 `vocabulary` / `rubyTerms`，應確認詞彙字面實際出現在該閱讀題的 `title` 或 `passage`。
- 若詞彙只出現在問題、選項或解說，不建議加入 passage rubyTerms。
- 若本文使用活用形，應讓 `rubyTerms.text` 對齊本文實際可匹配的字面，而不是一律使用辭書形。
