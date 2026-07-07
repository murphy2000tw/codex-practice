# 日文單字 3179 筆現況確認報告

## 1. 任務目的

本報告重新確認目前 `main` 分支上的日文單字主線狀態，重點是確認 `vocabulary.json` 仍維持 3179 筆、資料結構可由前端穩定讀取，並靜態檢查日文單字載入、分類、搜尋、練習、測驗與單字中頁隔離流程是否仍無明顯異常。本次任務為只讀型現況確認，未修改 `vocabulary.json`、功能程式、HTML、CSS、閱讀、文法、聽力或英文頁面。

## 2. 檢查日期

- 2026-07-07

## 3. 檢查範圍

- `vocabulary.json`
- 日文單字載入流程
- 日文單字分類與搜尋流程
- 日文單字練習流程
- 日文單字測驗流程
- 日文單字中頁架構
- 日文首頁與單字頁之間的導覽隔離
- 既有檢查腳本
- 日文閱讀、文法、聽力與英文頁面是否受影響

## 4. `vocabulary.json` 總筆數

- JSON parse：通過。
- 資料型別：最外層為陣列。
- 總筆數：3179。
- 結論：目前仍維持先前確認的 3179 筆基準。

## 5. N5 / N4 分布

| level | 筆數 |
| --- | ---: |
| N5 | 1000 |
| N4 | 2179 |
| 總計 | 3179 |

- 非 N5 / N4 的 level：0 筆。
- 空白或異常 level：0 筆。
- 結論：N5 / N4 分布仍為 N5 1000 筆、N4 2179 筆，總計 3179 筆。

## 6. 必要欄位完整性檢查結果

逐筆確認以下必要欄位皆存在且非空：

- `id`
- `level`
- `word`
- `kana`
- `meaning`
- `partOfSpeech`
- `example`
- `exampleKana`
- `exampleMeaning`

檢查結果：

| 項目 | 結果 |
| --- | --- |
| 缺漏必要欄位 | 0 筆 |
| `null` 必要欄位 | 0 筆 |
| 空字串必要欄位 | 0 筆 |
| 前端必要欄位完整性 | 通過 |

## 7. `id` 重複檢查結果

- 重複 `id`：0 組。
- 結論：未發現 `id` 重複。

## 8. `word` 重複檢查結果

- 重複 `word`：0 組。
- 結論：未發現 `word` 重複。

## 9. `undefined` / `null` / 空字串檢查結果

- JSON 本身不會保存 JavaScript 的 `undefined` 值；本次以 JSON parse 結果確認必要欄位未缺漏，且未出現 `null` 或空字串。
- 必要欄位缺漏：0 筆。
- 必要欄位為 `null`：0 筆。
- 必要欄位為空字串：0 筆。
- 結論：未發現會導致前端卡片出現 `undefined`、`null`、`NaN` 或空白必要內容的資料結構問題。

## 10. 詞性分類統計

| partOfSpeech | 筆數 |
| --- | ---: |
| 名詞 | 1504 |
| 動詞 | 558 |
| 數量詞 | 277 |
| い形容詞 | 273 |
| な形容詞 | 184 |
| 副詞 | 169 |
| 數詞 | 119 |
| 感嘆詞 | 23 |
| 代名詞 | 18 |
| 連體詞 | 15 |
| 名詞/する動詞 | 15 |
| 接続詞 | 10 |
| 疑問詞 | 8 |
| 名詞/副詞 | 4 |
| 名詞/な形容詞 | 1 |
| 副詞/名詞 | 1 |

## 11. 複合詞性相容性檢查結果

靜態檢查 `script.js` 後確認，目前詞性拆分邏輯使用正規表示式 `/[／/・、,]+/`，可拆分全形斜線、半形斜線、中點、頓號與半形逗號，並會 trim 與排除空片段。因此現有分類流程可處理下列格式：

- `名詞/する動詞`
- `名詞／副詞`
- `名詞・な形容詞`
- `名詞、数量詞`
- `名詞,副詞`

本次資料中實際出現的複合詞性包含 `名詞/する動詞`、`名詞/副詞`、`名詞/な形容詞`、`副詞/名詞`。雖然本次資料未實際出現全形斜線、中點、頓號或半形逗號格式的樣本，但現有 `getPartOfSpeechValues()` 拆分邏輯仍支援這些分隔符。

相關流程檢查結果：

| 函式 | 檢查結果 |
| --- | --- |
| `getPartOfSpeechValues()` | 支援複合詞性拆分，並排除空片段。 |
| `wordMatchesPartOfSpeech()` | 使用拆分後的詞性值比對分類 matches。 |
| `getPartOfSpeechGroup()` | 使用拆分後的詞性值歸入測驗選項詞性群組。 |
| `getWordsForCategory()` | 對同一份 `vocabulary` 依分類 matches 篩選。 |

結論：詞性分類格式目前仍可被既有分類與測驗選項群組邏輯處理。

## 12. 單字頁載入流程確認

靜態檢查結果：

1. `loadVocabulary()` 仍透過 `VOCABULARY_URL` 載入資料，預設來源為 `vocabulary.json`。
2. 日文頁面會設定 `window.JAPANESE_VOCABULARY_URL = "../vocabulary.json"`，因此日文子目錄頁面會指向根目錄單字資料。
3. 載入成功後會設定 `vocabulary = await response.json()`。
4. 載入成功後會設定 `filteredVocabulary = getFilteredVocabulary()`。
5. 分類篩選透過 `getWordsForCategory()` 使用同一份 `vocabulary`。
6. 程度篩選透過 `getWordsForLevel()` 接續使用同一份資料。
7. 搜尋透過 `getFilteredVocabulary()` 基於分類、程度與搜尋文字產生 `filteredVocabulary`。
8. 載入失敗時仍有 `catch`，會顯示單字資料載入失敗訊息並停用相關操作按鈕。

結論：單字資料載入、成功設定、篩選與錯誤 fallback 流程未發現明顯異常。

## 13. 單字練習流程確認

- 單字練習仍透過 `showNewWordSet()` 產生與顯示單字卡。
- `showNewWordSet()` 在 `filteredVocabulary.length === 0` 時會顯示「找不到符合的單字」或「這個分類目前沒有單字」等提示，不會建立空白卡片。
- 單字卡內容由 `createCard()` 建立，使用 `word`、`kana`、`meaning`、`partOfSpeech`、`level`、`example`、`exampleKana`、`exampleMeaning` 等欄位；本次資料檢查確認這些欄位皆存在且非空。
- 練習頁有「返回單字選單」按鈕。

結論：單字練習流程維持穩定，未發現因資料格式造成空白卡片或 `undefined` 顯示的明顯風險。

## 14. 單字測驗流程確認

- 單字測驗仍從目前 `filteredVocabulary` 產生題目。
- `createQuizQuestion()` 在篩選結果少於 4 筆時會顯示「目前篩選結果不足 4 個單字，請調整分類或搜尋條件。」
- 若可用選項不足 4 個，會顯示「目前可用的選項不足 4 個，請調整分類或搜尋條件。」
- 錯誤選項會優先從相同詞性群組、同程度、同篩選結果與全體 vocabulary 中補足。
- 測驗頁有「返回單字選單」按鈕。

結論：單字測驗流程維持使用目前篩選後單字產題，且篩選不足時仍有合理提示文字。

## 15. 單字中頁隔離確認

目前日文單字三層架構仍為：

日文首頁 → 單字中頁 → 單字練習 / 單字測驗

檢查結果：

| 項目 | 結果 |
| --- | --- |
| 單字中頁只顯示「單字練習 / 單字測驗」入口 | 通過 |
| 單字中頁不顯示單字卡片 | 通過 |
| 單字中頁不顯示測驗題目 | 通過 |
| 單字練習頁不顯示單字測驗題目 | 通過 |
| 單字測驗頁不顯示單字練習卡片 | 通過 |
| 單字練習頁有返回單字選單功能 | 通過 |
| 單字測驗頁有返回單字選單功能 | 通過 |
| 未重新加入已移除的「單字功能」重複方塊 | 通過 |
| 未重新加入練習 / 測驗混在同一頁的舊流程 | 通過 |

結論：單字中頁、單字練習與單字測驗仍維持隔離。

## 16. 日文首頁隔離確認

- 日文首頁仍作為日文學習主入口。
- 日文首頁不直接顯示單字題目。
- 日文首頁不直接顯示單字練習卡片。
- 日文首頁不直接顯示單字測驗題目。
- 日文首頁與單字功能頁之間仍透過 top-level Japanese view renderer 切換。

結論：日文首頁與單字頁導覽隔離仍維持穩定。

## 17. 日文閱讀 / 文法 / 聽力是否受影響

本任務未修改日文閱讀、文法或聽力檔案。既有檢查結果如下：

- 日文閱讀選單檢查通過。
- 日文閱讀 ruby 檢查通過，練習模式 ruby 支援仍存在，測驗模式不顯示 ruby 的隔離檢查未發現異常。
- 日文文法選單檢查通過。
- 日文聽力選單檢查通過。
- 日文整合 view isolation 檢查通過，未發現閱讀、文法、聽力與單字主線互相污染。

結論：未發現日文閱讀、文法、聽力受到本次檢查影響。

## 18. 英文頁面是否受影響

本任務未修改任何 `english/` 目錄檔案。`node scripts/auditSiteHealth.js` 檢查涵蓋站台 HTML 頁面與英文題庫數量，結果通過，未發現英文頁面或英文功能受到影響。

## 19. 執行過的指令與結果

| 指令 | 結果 |
| --- | --- |
| `node --check script.js` | 通過，exit 0。 |
| `node scripts/auditSiteHealth.js` | 通過，確認 HTML pages checked: 19，Japanese vocabulary cards: 3179，並顯示 Site health audit passed。 |
| `node scripts/check-japanese-vocabulary-menu.js` | 通過，Japanese vocabulary view split audit passed。 |
| `node scripts/check-japanese-vocabulary-view-split.js` | 通過，Japanese vocabulary view split audit passed。 |
| `node scripts/check-japanese-view-isolation.js` | 通過，Japanese view isolation audit passed。 |
| `node scripts/check-japanese-main-entry.js` | 通過，Japanese main entry audit passed。 |
| `node scripts/check-japanese-reading-menu.js` | 通過，Japanese reading menu audit passed。 |
| `node scripts/check-japanese-grammar-menu.js` | 通過，Japanese grammar menu audit passed。 |
| `node scripts/check-japanese-listening-menu.js` | 通過，Japanese listening menu audit passed。 |
| `node scripts/check-reading-ruby.js` | 通過，Checked 105 reading sets，ruby rendering 檢查通過。 |
| `python3` JSON 統計檢查 | 通過，確認 JSON parse、3179 筆、N5 1000 筆、N4 2179 筆、必要欄位、重複 id / word 與詞性分布。 |

## 20. 是否發現 warning / error

- 自動檢查指令：未發現 warning / error。
- `vocabulary.json`：未發現 JSON parse、筆數、必要欄位、重複值、空值或 level 分布異常。
- 靜態流程檢查：未發現單字載入、分類、搜尋、練習、測驗或中頁隔離的明顯異常。

## 21. 後續建議

建議可以進入下一階段「日文單字內容品質分批檢查」。

理由：

1. `vocabulary.json` 仍維持 3179 筆。
2. N5 / N4 分布仍為 N5 1000 筆、N4 2179 筆。
3. 必要欄位完整，未發現缺漏、`null` 或空字串。
4. `id` 與 `word` 未重複。
5. 詞性分類與複合詞性拆分邏輯相容。
6. 單字中頁、練習、測驗與日文首頁隔離檢查通過。
7. 既有站台與日文閱讀、文法、聽力相關檢查通過。
8. 未修改單字資料、功能程式、HTML、CSS、日文閱讀 / 文法 / 聽力資料或英文頁面。
