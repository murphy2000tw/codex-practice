# 日文方案 C 完成後總整理與後續路線確認

## 1. 本次整理目的

本次任務定位為「日文方案 C 完成後總整理」，目標是在不新增日文單字、不修改 `vocabulary.json`、不調整日文閱讀頁、日文單字頁、日文測驗頁或英文頁面的前提下，固定目前主線品質，確認 Batch 03～06 與 rubyTerms warning 清理後的狀態，並提出下一階段建議。

本文件只整理既有成果與本次檢查結果；本次未進行 Batch 07，未新增功能，也未修改任何資料檔或頁面程式。

## 2. 方案 C 完成狀態

| 項目 | 狀態 | 說明 |
|---|---|---|
| Batch 03～06 候選整理 | 完成 | 四批皆已建立閱讀單字候選清單。 |
| 人工確認 | 完成 | 四批文件中皆保留人工確認勾選與後續處理紀錄。 |
| 匯入前確認 | 完成 | 四批皆有匯入前數量與正式匯入範圍確認。 |
| 正式匯入 | 完成 | Batch 03～06 合計正式匯入 34 筆。 |
| 匯入後功能檢查 | 完成 | 四批皆有 post-import check 文件。 |
| 階段性收尾檢查 | 完成 | 已有 `docs/japanese-plan-c-phase-summary-check.md`。 |
| reading rubyTerms warning 清理 | 完成 | 已有 `docs/japanese-reading-rubyterms-warning-cleanup.md`，目前 `check-reading-ruby.js` 無 warning。 |
| 目前主線品質 | 穩定 | 三個主要 script 均可完成且未輸出 error；rubyTerms warning 已清為 0。 |

## 3. Batch 03～06 匯入成果總表

| 批次 | 匯入前筆數 | 實際匯入 | 匯入後筆數 | 狀態 |
|---|---:|---:|---:|---|
| Batch 03 | 3145 | 11 | 3156 | 已完成候選整理、人工確認、正式匯入與匯入後功能檢查。 |
| Batch 04 | 3156 | 10 | 3166 | 已完成候選整理、人工確認、正式匯入與匯入後功能檢查。 |
| Batch 05 | 3166 | 11 | 3177 | 已完成候選整理、人工確認、正式匯入與匯入後功能檢查。 |
| Batch 06 | 3177 | 2 | 3179 | 已完成候選整理、人工確認、正式匯入與匯入後功能檢查。 |

Batch 03～06 合計正式匯入 **34 筆**，`vocabulary.json` 從 3145 筆增加到 3179 筆。

## 4. 目前 `vocabulary.json` 狀態

本次以 Python 讀取 `vocabulary.json` 並檢查資料品質，結果如下：

| 檢查項目 | 結果 |
|---|---|
| 總筆數 | 通過，3179 筆。 |
| `id` 不重複 | 通過，未發現重複 `id`。 |
| `word` 不重複 | 通過，未發現重複 `word`。 |
| 必要欄位完整 | 通過，未發現缺漏必要欄位。 |
| 空白假名 | 通過，0 筆。 |
| 空白中文意思 | 通過，0 筆。 |
| 空白詞性 | 通過，0 筆。 |
| Batch 03～06 新增詞格式 | 通過，延續既有單字資料格式。 |
| 本次是否修改 `vocabulary.json` | 否。 |

## 5. reading rubyTerms warning 清理結果

`docs/japanese-reading-rubyterms-warning-cleanup.md` 已記錄先前 warning 的原因與處理方式。依本次重新執行結果，`node scripts/check-reading-ruby.js` 已通過且沒有輸出 warning 區塊。

目前狀態：

| 檢查項目 | 結果 |
|---|---|
| reading sets 數量 | 105 |
| ruby rendering 檢查 | 通過 |
| unsafe vocabulary kana 處理 | 通過，script 確認會略過不安全 vocabulary kana。 |
| warning 數量 | 0 |
| error 數量 | 0 |

## 6. 目前三個主要 script 狀態

| 指令 | 狀態 | 本次輸出摘要 |
|---|---|---|
| `node scripts/auditSiteHealth.js` | 通過 | HTML pages checked: 19；Japanese vocabulary cards: 3179；Site health audit passed. |
| `node scripts/audit-reading-vocabulary.js` | 通過 | readingSets: 105；questions: 150；terms: 361；existing: 234；missing: 127；confirm: 127。 |
| `node scripts/check-reading-ruby.js` | 通過且無 warning | Checked 105 reading sets；未輸出 warning。 |

補充：`audit-reading-vocabulary.js` 的 missing / confirm 是既有閱讀詞彙盤點狀態，不是本次新增 error；本次未發現新增 warning 或 error。

## 7. 文件完整性檢查

| 文件 | 狀態 |
|---|---|
| `docs/reading-vocabulary-import-batch-03.md` | 存在 |
| `docs/reading-vocabulary-import-batch-04.md` | 存在 |
| `docs/reading-vocabulary-import-batch-05.md` | 存在 |
| `docs/reading-vocabulary-import-batch-06.md` | 存在 |
| `docs/japanese-plan-c-batch03-post-import-check.md` | 存在 |
| `docs/japanese-plan-c-batch04-post-import-check.md` | 存在 |
| `docs/japanese-plan-c-batch05-post-import-check.md` | 存在 |
| `docs/japanese-plan-c-batch06-post-import-check.md` | 存在 |
| `docs/japanese-plan-c-phase-summary-check.md` | 存在 |
| `docs/japanese-reading-rubyterms-warning-cleanup.md` | 存在 |

結論：方案 C Batch 03～06 與 rubyTerms warning cleanup 的指定文件皆已存在，文件鏈完整。

## 8. 是否建議繼續 Batch 07

目前**不建議立即繼續 Batch 07**。

原因如下：

1. Batch 03～06 已經完成一輪從閱讀資料回補正式單字庫的主線整理，且總筆數已穩定在 3179 筆。
2. Batch 06 最終只匯入 2 筆，代表剩餘可直接、安全匯入的閱讀候選詞已明顯減少。
3. 剩餘 missing / confirm 項目多半可能涉及人名、地名、專有名詞、標題型片語、長複合詞、時間片語、數量詞、活用形或需要另訂收錄策略的詞。
4. 目前 rubyTerms warning 已清為 0，主線品質穩定，較適合先做功能回歸與使用者體驗檢查，而不是立刻再開新批次增加資料風險。

建議暫停方案 C，不繼續 Batch 07；若未來要重啟，應先建立「剩餘 missing / confirm 詞的收錄策略」，再決定是否以 Batch 07 形式處理。

## 9. 下一步建議任務

建議順位如下：

| 順位 | 建議任務 | 原因 |
|---:|---|---|
| 1 | 日文閱讀頁完整回歸檢查 | 方案 C 的核心來源是閱讀資料，且 rubyTerms warning 剛清為 0；最適合先確認練習模式、測驗模式、ruby 顯示、題目流程與閱讀資料載入是否完整穩定。 |
| 2 | 日文單字頁功能檢查 | `vocabulary.json` 已累積到 3179 筆，應確認搜尋、分類、顯示、假名、中文意思、詞性與例句在大量資料下仍穩定。 |
| 3 | 日文單字測驗功能檢查 | 正式單字庫已擴充，應確認題目產生、選項、答案判定與結果頁不會因新增詞量造成問題。 |
| 4 | 暫停方案 C，不繼續 Batch 07 | 目前資料品質已穩定，且剩餘候選詞需要策略決策；短期內不宜繼續批次匯入。 |
| 5 | 進入其他日文功能，例如文法、動詞變化、N4 題庫 | 在主線回歸檢查穩定後，可投入更能提升學習效果的功能或題庫擴充。 |
| 6 | 日文測驗題型擴充 | 題型擴充屬功能開發，建議排在資料與現有功能回歸穩定之後。 |

整體建議：下一個任務優先做「日文閱讀頁完整回歸檢查」，再依序檢查單字頁與單字測驗。Batch 07 建議先暫停。
