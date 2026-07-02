# 日文單字頁完整回歸檢查

檢查日期：2026-07-02  
檢查範圍：日文單字頁、`vocabulary.json`、日文閱讀／測驗關聯入口，以及既有站台健康檢查腳本。

## 1. 本次檢查目的

本次任務定位為「日文單字頁完整回歸檢查」，目標是在日文方案 C Batch 03～06 已完成、`vocabulary.json` 維持 3179 筆資料的狀態下，確認日文單字頁的資料載入、搜尋、分類、顯示欄位、例句、手機版版面與其他日文功能關聯都保持穩定。

本次未新增日文單字、未修改 `vocabulary.json`、未進行 Batch 07，也未修改日文閱讀頁、日文單字頁、日文測驗頁或英文頁面功能。

## 2. 目前主線狀態

| 項目 | 結果 | 備註 |
| --- | --- | --- |
| `vocabulary.json` 筆數 | 通過 | 目前為 3179 筆。 |
| `docs/japanese-plan-c-completion-summary.md` | 通過 | 文件存在。 |
| `docs/japanese-reading-full-regression-check.md` | 通過 | 文件存在。 |
| `docs/japanese-reading-quiz-hide-ruby-fix.md` | 通過 | 文件存在。 |
| `node scripts/auditSiteHealth.js` | 通過 | 站台健康檢查通過，日文單字卡數為 3179。 |
| `node scripts/audit-reading-vocabulary.js` | 通過 | 閱讀詞彙稽核通過，輸出既有稽核統計。 |
| `node scripts/check-reading-ruby.js` | 通過 | 通過且未輸出 warning。 |
| 新增 warning / error | 未發現 | 本次執行檢查未發現新增 warning 或 error。 |

## 3. `vocabulary.json` 資料狀態

已針對 `vocabulary.json` 執行結構檢查，必要欄位包含：

- `id`
- `level`
- `word`
- `kana`
- `meaning`
- `partOfSpeech`
- `example`
- `exampleKana`
- `exampleMeaning`

檢查結果如下：

| 檢查項目 | 結果 |
| --- | --- |
| 總筆數為 3179 | 通過 |
| `id` 不重複 | 通過 |
| `word` 不重複 | 通過 |
| `kana` 不為空 | 通過 |
| `meaning` 不為空 | 通過 |
| `partOfSpeech` 不為空 | 通過 |
| `example` 不為空 | 通過 |
| `exampleKana` 不為空 | 通過 |
| `exampleMeaning` 不為空 | 通過 |
| 無 `undefined` / `null` / 空字串 | 通過 |
| Batch 03～06 新增詞格式與既有資料一致 | 通過 |

程度分布：

- N5：1000 筆
- N4：2179 筆

詞性資料可被現有分類邏輯解析。抽查到的詞性包含 `名詞`、`動詞`、`い形容詞`、`な形容詞`、`副詞`、`數詞`、`數量詞`、`感嘆詞`、`代名詞`、`連體詞`、`名詞/する動詞` 等，與既有 `getPartOfSpeechValues()` 使用 `/`、`／`、`・`、`、`、`,` 分割詞性的設計相容。

## 4. 日文單字頁載入檢查結果

日文單字頁 HTML 具備單字頁主要容器、分類篩選、程度篩選、搜尋欄、單字功能切換、單字卡區塊與日文閱讀／聽力分頁入口。

程式載入流程檢查結果：

1. 頁面透過 `loadVocabulary()` 使用 `fetch(VOCABULARY_URL)` 讀取 `vocabulary.json`。
2. 成功載入後會設定 `vocabulary = await response.json()`，接著呼叫 `renderCategoryFilters()` 與 `applyCategory(activeCategoryId)`。
3. `applyCategory()` 會刷新 `filteredVocabulary`、分類按鈕狀態、總數顯示，並在單字卡模式呼叫 `showNewWordSet()`。
4. `updateCategoryCount()` 會顯示目前分類／程度下的單字總數；全部分類與全部程度下應顯示 3179 個單字。
5. 空結果時有合理狀態文字，例如「沒有符合搜尋條件的單字。」與「找不到符合的單字，請試試其他關鍵字。」。
6. 載入失敗時有 `catch` 處理，會顯示單字資料載入失敗訊息並停用互動按鈕。

本次環境未啟動真實瀏覽器做視覺點擊實測；檢查以靜態程式流程、資料結構檢查與現有 Node 腳本結果為準。依目前程式碼與資料檢查結果，未發現 3179 筆資料會導致載入流程錯誤、`undefined`、`null`、`NaN` 或空白卡片的跡象。

## 5. 單字卡顯示檢查結果

單字卡由 `createCard(word, index)` 產生，會顯示：

- 日文詞彙：`word.word`
- 假名：`word.kana`
- 中文意思：`word.meaning`
- 詞性：`word.partOfSpeech`
- 程度：`word.level`
- 例句：`word.example`
- 例句假名：`word.exampleKana`
- 中文翻譯：`word.exampleMeaning`

資料檢查已確認上述欄位在 3179 筆資料中皆存在且非空。單字卡 CSS 使用 grid 與 flex 版面，卡片最小寬度為 `minmax(220px, 1fr)`，答案區以 `answer-row` 顯示欄位和值。長詞與長例句未進行瀏覽器截圖實測，但靜態檢查未發現會因資料筆數增加產生空白卡片或欄位缺漏的程式路徑。

## 6. 搜尋功能檢查結果

搜尋功能由 `wordMatchesSearch()` 比對下列欄位：

- `word`
- `kana`
- `meaning`
- `partOfSpeech`
- `level`
- `example`
- `exampleKana`
- `exampleMeaning`

抽查結果：

| 搜尋類型 | 搜尋詞 | 結果 |
| --- | --- | --- |
| 日文詞彙 | `学生料金` | 找到 1 筆，為 `学生料金`。 |
| 假名 | `がくせいりょうきん` | 找到 1 筆，為 `学生料金`。 |
| 中文意思 | `學生` | 找到 18 筆，包含 `学生料金` 及其他中文意思／例句中文含「學生」的項目。 |
| 詞性關鍵字 | `名詞` | 找到 1553 筆。 |
| 不存在詞 | `zz-not-found` | 找到 0 筆，頁面邏輯會顯示合理空狀態。 |

清除搜尋按鈕會將輸入值重設為空字串並呼叫 `applySearch("")`，列表會依目前分類／程度重新刷新。搜尋使用同一筆 `filteredVocabulary` 結果來源，未發現會產生重複結果或錯誤資料的邏輯。

## 7. 分類 / 篩選功能檢查結果

目前日文單字頁支援互動式分類與程度篩選。

詞性分類按鈕：

- 全部
- 名詞
- 動詞
- い形容詞
- な形容詞
- 副詞
- 數字／量詞
- 表達句型

程度篩選按鈕：

- 全部程度
- N5
- N4

依現有分類邏輯計算的分類筆數如下：

| 分類 | 筆數 |
| --- | ---: |
| 全部 | 3179 |
| 名詞 | 1566 |
| 動詞 | 558 |
| い形容詞 | 273 |
| な形容詞 | 185 |
| 副詞 | 174 |
| 數字／量詞 | 396 |
| 表達句型 | 23 |

切換分類會透過 `applyCategory()` 重設牌組並刷新顯示；切換程度會透過 `applyLevel()` 套用 N5 / N4 篩選。未發現空白分類、`undefined` 分類或重複分類按鈕異常。Batch 03～06 抽查詞多為 N4 名詞，可正確歸入 N4 與名詞分類。

## 8. Batch 03～06 新增詞抽查結果

| 詞彙 | id | level | kana | meaning | partOfSpeech | 顯示 / 搜尋檢查 |
| --- | ---: | --- | --- | --- | --- | --- |
| `クリーニング店` | 3146 | N4 | `クリーニングてん` | 洗衣店 | 名詞 | 欄位完整，可由日文詞彙搜尋。 |
| `道路工事` | 3154 | N4 | `どうろこうじ` | 道路施工、道路工程 | 名詞 | 欄位完整，可歸入 N4 / 名詞。 |
| `宅配会社` | 3151 | N4 | `たくはいがいしゃ` | 宅配公司 | 名詞 | 欄位完整，可歸入 N4 / 名詞。 |
| `運動センター` | 3178 | N4 | `うんどうセンター` | 運動中心 | 名詞 | 欄位完整，可由日文詞彙搜尋。 |
| `学生料金` | 3179 | N4 | `がくせいりょうきん` | 學生票價、學生費用 | 名詞 | 欄位完整，可由日文、假名與中文搜尋。 |

上述抽查詞均存在且各必要欄位完整，未發現格式與既有資料不一致的問題。

## 9. 手機版版面檢查結果

CSS 靜態檢查結果：

1. `.page-shell` 在 `max-width: 640px` 下改用較小左右邊距與安全區 padding。
2. `.category-header` 在手機寬度下改為直向排列。
3. `.category-filters` 在手機寬度下改為單欄 grid。
4. 篩選按鈕、清除搜尋、答案按鈕、次要按鈕在手機寬度下寬度為 100%。
5. `.search-row` 在手機寬度下改為單欄排列。
6. `.cards-grid` 使用 `repeat(auto-fit, minmax(220px, 1fr))`，可依容器寬度自動換行。

本次未執行真實手機瀏覽器截圖，因此無法宣稱完成實機視覺驗證；依 CSS 靜態檢查，未發現明顯手機版破版風險。

## 10. 與其他日文功能關聯檢查結果

| 功能 | 檢查結果 |
| --- | --- |
| 日文首頁入口 | 正常，根目錄首頁有日文學習入口，日文頁有單字／文法／閱讀／聽力分頁。 |
| 日文閱讀入口 | 正常，日文頁包含閱讀分頁與閱讀模式切換。 |
| 日文閱讀練習模式 | 靜態流程存在，站台健康檢查與 ruby 檢查通過。 |
| 日文閱讀測驗模式 | `check-reading-ruby.js` 通過且無 warning；閱讀測驗隱藏 ruby 的修正文件存在。 |
| 日文測驗入口 | 正常，單字測驗與文法測驗按鈕存在。 |
| 英文頁面 | `auditSiteHealth.js` 檢查 19 個 HTML 頁面通過，英文題庫統計正常。 |

本次未修改其他日文功能與英文頁面。

## 11. 三個主要 script 結果

### `node scripts/auditSiteHealth.js`

結果：通過。

重點輸出：

- HTML pages checked: 19
- Japanese vocabulary cards: 3179
- Japanese grammar cards: 290
- Manifest/icon audit completed.
- Mobile touch-target CSS audit completed.
- Site health audit passed.

### `node scripts/audit-reading-vocabulary.js`

結果：通過。

重點輸出：

- readingSets: 105
- questions: 150
- terms: 361
- existing: 234
- missing: 127
- confirm: 127
- report: `docs/reading-vocabulary-audit.md`

### `node scripts/check-reading-ruby.js`

結果：通過且無 warning。

重點輸出：

- Checked 105 reading sets.
- Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.

## 12. 是否有新增 warning 或 error

本次執行的檢查未發現新增 warning 或 error。

- `git diff --check`：通過。
- `auditSiteHealth.js`：通過。
- `audit-reading-vocabulary.js`：通過。
- `check-reading-ruby.js`：通過且無 warning。
- `vocabulary.json` 結構檢查：通過。

未執行真實瀏覽器 console 檢查；因此 console error 部分以靜態程式檢查與 Node 腳本結果為準。

## 13. 問題與建議處理方式

本次未發現需要立即修正的阻斷問題。

建議記錄事項：

1. 若後續要宣稱「手機版實測通過」或「console 無錯誤」，建議使用 Playwright / Chromium 進行實際瀏覽器載入、搜尋、分類切換與手機 viewport 截圖。
2. 單字卡答案列目前採左右 flex 排版，長例句在窄螢幕上可能仍可讀但未經截圖確認；若未來新增更長例句，可考慮對單字卡答案列加入更明確的手機直向排版規則。
3. `audit-reading-vocabulary.js` 仍輸出既有 missing / confirm 統計，這不是本次新增 warning，也未造成腳本失敗；後續可依閱讀詞彙匯入計畫獨立處理。

## 14. 下一步建議任務

1. 建立瀏覽器自動化 smoke test：載入日文單字頁、等待 3179 筆資料狀態文字、搜尋 `学生料金`、清除搜尋、切換 N4 / 名詞分類並檢查 console error。
2. 補一份手機 viewport 截圖檢查流程，確認 375px / 390px / 430px 寬度下搜尋列、分類按鈕與單字卡答案區不破版。
3. 若要繼續日文方案 C，下一個獨立任務才進行 Batch 07；本次回歸檢查不包含 Batch 07。
4. 持續維持 `vocabulary.json` 的唯一 id、唯一 word 與必要欄位完整檢查，避免未來批次匯入時引入空欄位或重複詞。
