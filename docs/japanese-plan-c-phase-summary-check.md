# 方案 C 階段性收尾檢查報告

## 1. 本次檢查目的

本次檢查定位為「方案 C 階段性收尾檢查」。目標是在不新增單字、不修改 `vocabulary.json`、不調整閱讀頁、單字頁、測驗頁與英文頁面的前提下，彙整 Batch 03～Batch 06 的閱讀文章反向整理單字庫流程狀態，確認目前主線檢查是否穩定，並評估是否需要繼續進入 Batch 07。

本次僅新增本報告，既有 Batch 03～Batch 06 文件與 `vocabulary.json` 均不在本次修改範圍內。

## 2. 目前主線狀態確認

| 檢查項目 | 結果 | 備註 |
| -- | -- | -- |
| `vocabulary.json` 筆數 | 通過，3179 筆 | Python JSON 檢查與 `auditSiteHealth.js` 均確認目前日文單字卡為 3179 筆。 |
| `node scripts/auditSiteHealth.js` | 通過 | HTML、題庫計數、manifest/icon、mobile touch-target CSS audit 均通過。 |
| `node scripts/audit-reading-vocabulary.js` | 通過 | 檢查 105 組 reading sets、150 題、362 個閱讀詞項；輸出仍顯示 235 existing、127 missing、127 confirm。 |
| `node scripts/check-reading-ruby.js` | 通過但有既有 warning | 指令 exit code 為 0；仍只有既有 5 筆 reading rubyTerms / vocabulary warning。 |
| 是否只有既有 warning | 通過 | warning 仍集中在 `一時半`、`調べる`、`十分前`，未發現新增 warning。 |
| 是否有新增 error | 通過 | 未發現新增 error。 |

## 3. Batch 03～06 匯入成果總表

| 批次 | 匯入前筆數 | 預計匯入 | 實際匯入 | 匯入後筆數 | 排除詞或保留詞 | 狀態 |
| -- | ----: | ---: | ---: | ----: | ------- | -- |
| Batch 03 | 3145 | 11 | 11 | 3156 | 排除 / 暫緩 `整理`；未勾選詞、人名、地名、專有名詞、太長片語與疑似重複詞未匯入。 | 已完成正式匯入與匯入後功能檢查。 |
| Batch 04 | 3156 | 10 | 10 | 3166 | 排除 / 保留 `温める`、`誘い` 等已存在、近義、需人工確認或不適合本批匯入詞。 | 已完成正式匯入與匯入後功能檢查。 |
| Batch 05 | 3166 | 11 | 11 | 3177 | 排除 / 保留 `變更`、`見学`、`整理`、`二週間` 等不建議或需另行策略確認詞。 | 已完成正式匯入與匯入後功能檢查。 |
| Batch 06 | 3177 | 2 | 2 | 3179 | 排除 / 保留 `地域清掃`；`読み聞かせ会`、`一時半`、`十分前`、`二週間` 等仍不在本批正式匯入範圍。 | 已完成正式匯入與匯入後功能檢查。 |

Batch 03～Batch 06 合計實際匯入 **34 筆**，`vocabulary.json` 從 3145 筆增加到目前 3179 筆。

## 4. Batch 03～06 文件完整性檢查

| 批次 | 候選清單 | 人工確認勾選 | 人工勾選結果核對 | 匯入前最終確認 | 正式匯入結果 | 匯入後功能檢查報告 | 結論 |
| -- | -- | -- | -- | -- | -- | -- | -- |
| Batch 03 | 有，`docs/reading-vocabulary-import-batch-03.md` | 有 | 有 | 有 | 有 | 有，`docs/japanese-plan-c-batch03-post-import-check.md` | 完整 |
| Batch 04 | 有，`docs/reading-vocabulary-import-batch-04.md` | 有 | 有 | 有 | 有 | 有，`docs/japanese-plan-c-batch04-post-import-check.md` | 完整 |
| Batch 05 | 有，`docs/reading-vocabulary-import-batch-05.md` | 有 | 有 | 有 | 有 | 有，`docs/japanese-plan-c-batch05-post-import-check.md` | 完整 |
| Batch 06 | 有，`docs/reading-vocabulary-import-batch-06.md` | 有 | 有 | 有 | 有 | 有，`docs/japanese-plan-c-batch06-post-import-check.md` | 完整 |

本次確認指定的 8 個文件均存在，且 Batch 03～Batch 06 每批皆已保留候選整理、人工確認、核對、匯入前確認、正式匯入與匯入後檢查紀錄。未修改上述既有文件內容。

## 5. 日文單字庫資料品質檢查

本次以 `vocabulary.json` 實際格式檢查正式單字庫，檢查欄位包含：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。

| 檢查項目 | 結果 | 備註 |
| -- | -- | -- |
| 總筆數 | 通過 | 目前為 3179 筆。 |
| `id` 是否不重複 | 通過 | 未發現重複 `id`。 |
| `word` 是否不重複 | 通過 | 未發現重複 `word`。 |
| 必要欄位是否存在 | 通過 | 3179 筆皆有必要欄位。 |
| 是否有空白假名 | 通過 | 未發現空白 `kana`。 |
| 是否有空白中文意思 | 通過 | 未發現空白 `meaning`。 |
| 是否有空白詞性 | 通過 | 未發現空白 `partOfSpeech`。 |
| Batch 03～06 新增詞格式 | 通過 | 新增詞均延續既有 N4 詞彙資料格式，且例句、假名例句、中文例句欄位皆存在。 |
| 是否有新增詞造成格式不一致 | 通過 | 未發現格式不一致問題。 |

本次沒有修改 `vocabulary.json`；正式單字庫維持 3179 筆。

## 6. 日文閱讀資料檢查摘要

`node scripts/audit-reading-vocabulary.js` 可正常讀取日文閱讀資料並完成盤點，結果顯示：

- reading sets：105 組。
- reading questions：150 題。
- reading vocabulary / terms：362 個。
- 已存在於正式單字庫或可由既有資料覆蓋：235 個。
- 仍列為 missing / confirm：127 個。

從 Batch 03～Batch 06 文件與本次 audit 結果觀察，流程本身穩定；但可直接安全匯入的詞數明顯下降。Batch 06 最終只匯入 2 筆，剩餘項目多為以下類型：

1. 人名、地名、專有名詞或標題型詞組。
2. 活動名稱、設施名稱或長複合詞，需先統一是否收錄策略。
3. 時間片語或數量詞，例如 `一時半`、`十分前`、`二週間`，需先決定是否批量收錄。
4. 已存在詞、可由既有辭書形覆蓋的變化形，或與既有詞義高度重疊的詞。
5. 需要人工確認讀音、詞性、測驗混淆風險或是否應改為閱讀輔助資料的詞。

## 7. 既有 warning 清單

`node scripts/check-reading-ruby.js` 目前通過，但仍列出以下既有 warning。本次僅記錄，不修正：

1. `jp-reading-set-n4-019 vocabulary[5]`: `一時半` 未出現在 title 或 passage。
2. `jp-reading-set-n4-019 rubyTerms[5]`: `一時半` 未出現在 title 或 passage。
3. `jp-reading-set-n4-076 vocabulary[4]`: `調べる` 未出現在 title 或 passage。
4. `jp-reading-set-n4-076 rubyTerms[4]`: `調べる` 未出現在 title 或 passage。
5. `jp-reading-set-n4-102 rubyTerms[3]`: `十分前` 未出現在 title 或 passage。

上述 warning 已在 Batch 03～Batch 06 相關檢查中多次記錄，並非本次新增問題。

## 8. 是否有新增問題

未發現新增問題。

- 未發現 `vocabulary.json` 筆數偏差。
- 未發現新增 `id` 或 `word` 重複。
- 未發現必要欄位缺漏或空白欄位。
- 未發現 Batch 03～Batch 06 文件缺漏。
- 未發現 `auditSiteHealth.js`、`audit-reading-vocabulary.js` 或 `check-reading-ruby.js` 新增 error。
- `check-reading-ruby.js` 仍只有既有 5 筆 warning。

## 9. 是否建議進入 Batch 07

本次建議：**暫停方案 C，不建議立刻進入 Batch 07。**

理由如下：

1. Batch 03～Batch 06 的可匯入數量已從 11、10、11 下降到 Batch 06 的 2 筆，代表直接安全匯入詞明顯減少。
2. 目前剩餘閱讀詞中仍有 127 個 missing / confirm，但並不等於 127 個都適合加入正式單字庫；其中相當多需要人工判斷是否屬於專有名詞、長片語、活動名稱、時間表達或已存在詞的變化形。
3. 若繼續 Batch 07，預期可能只產生很少可匯入詞，且人工確認成本會高於新增效益。
4. 現階段更值得先清理既有 rubyTerms warning，或改做日文單字頁 / 測驗頁功能檢查，確保使用者端學習與測驗流程穩定。

## 10. 下一步建議任務

建議優先順序如下：

1. **方案 C 階段性收尾**：先合併本次收尾檢查報告，將 Batch 03～Batch 06 視為一個已完成且穩定的小階段。
2. **rubyTerms warning 清理**：另開獨立任務處理 `一時半`、`調べる`、`十分前` 相關 warning，避免混入單字匯入流程。
3. **日文單字頁 / 測驗頁功能檢查**：另開任務檢查 3179 筆單字在單字頁、篩選、搜尋、測驗選項與例句顯示上的穩定性。
4. **剩餘候選策略整理**：若未來仍要 Batch 07，建議先制定專有名詞、活動名稱、時間片語、長複合詞與既有詞變化形的收錄策略，再開始候選整理。
5. **暫不建議立即 Batch 07**：除非先完成上述策略與 warning 清理，否則 Batch 07 預期新增效益偏低。
