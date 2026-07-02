# 日文測驗頁完整回歸檢查

## 1. 本次檢查目的

本次檢查針對「日文單字測驗頁」在 `vocabulary.json` 維持 3179 筆資料的狀態下進行完整回歸確認，範圍包含資料來源、題目產生、選項顯示、作答流程、結果／統計顯示、分類與程度篩選、Batch 03～06 新增詞抽查、手機版版面與既有日文／英文功能關聯。

本次依任務限制只新增本報告，未修改 `vocabulary.json`，未新增或刪除日文單字，未進行 Batch 07，未修改日文閱讀頁、日文單字頁、日文測驗頁功能或英文頁面。

## 2. 目前主線狀態

| 檢查項目 | 結果 |
| --- | --- |
| `vocabulary.json` 筆數 | 通過，實測為 3179 筆。 |
| `docs/japanese-plan-c-completion-summary.md` | 存在。 |
| `docs/japanese-reading-full-regression-check.md` | 存在。 |
| `docs/japanese-reading-quiz-hide-ruby-fix.md` | 存在。 |
| `docs/japanese-vocabulary-full-regression-check.md` | 存在。 |
| `node scripts/auditSiteHealth.js` | 通過。 |
| `node scripts/audit-reading-vocabulary.js` | 通過，輸出既有 audit 統計。 |
| `node scripts/check-reading-ruby.js` | 通過，未出現 warning。 |
| 新增 warning / error | 未發現新增 warning 或 error。 |

## 3. 日文測驗資料來源與邏輯檢查結果

### 3.1 實際資料來源

日文頁 `japanese/index.html` 會設定：

- `window.JAPANESE_VOCABULARY_URL = "../vocabulary.json"`
- `window.JAPANESE_GRAMMAR_URL = "../grammar.json"`

`script.js` 的 `VOCABULARY_URL` 會優先使用 `window.JAPANESE_VOCABULARY_URL`，因此日文頁實際讀取的是 repo root 的 `vocabulary.json`。

### 3.2 HTML 測驗入口與顯示容器

日文測驗入口位於單字功能區：

- `#quizModeButton`：切換到「單字測驗」。
- `#quizPanel`：測驗面板。
- `#quizContent`：題目與選項渲染容器。
- `#nextQuizQuestion`：下一題。
- `#restartQuiz`：重新開始測驗。
- `#quizAnsweredCount`、`#quizCorrectCount`、`#quizAccuracy`：即時統計已答題數、答對題數與正確率。

### 3.3 程式邏輯追蹤

實際追蹤後，日文單字測驗流程如下：

1. `loadVocabulary()` 使用 `fetch(VOCABULARY_URL)` 讀取 `vocabulary.json`，成功後呼叫 `renderCategoryFilters()` 與 `applyCategory(activeCategoryId)` 初始化資料。
2. `switchMode("quiz")` 進入單字測驗模式，隱藏卡片區，顯示 `quizPanel`，並呼叫 `createQuizQuestion()`。
3. `createQuizQuestion()` 使用目前的 `filteredVocabulary` 產生題目；若篩選後不足 4 筆，會顯示「目前篩選結果不足 4 個單字」。
4. 題目本體由 `pickLeastSeenItem()` 在 `filteredVocabulary` 中選出，並以 `wordQuizRoundSeenKeys` 避免同一輪異常重複。
5. 錯誤選項由 `createWrongQuizOptions()` 產生，候選來源依序為：目前篩選且同詞性群組、全資料同程度同詞性群組、全資料同詞性群組、目前篩選資料、全 vocabulary。
6. 選項以 `shuffleItems()` 洗牌，最後形成 1 個正解加 3 個錯誤選項。
7. `renderQuizQuestion()` 顯示題幹 `word`、`kana` 與 4 個中文意思按鈕。
8. `handleQuizAnswer()` 在點選後只允許計分一次，依 `selectedOption.isCorrect` 判定正確／錯誤，更新回饋文字、選項樣式與統計。
9. `nextQuizQuestionButton` 點擊後呼叫 `createActiveQuizQuestion()`，單字測驗模式會再呼叫 `createQuizQuestion()` 產生下一題。
10. `restartQuiz()` 會重設本輪已出題記錄與統計後重新產生題目。

## 4. `vocabulary.json` 測驗可用性檢查結果

使用指定 Python 檢查腳本確認：

| 項目 | 結果 |
| --- | --- |
| 總筆數 | 3179，通過。 |
| `id` 不重複 | 通過。 |
| `word` 不重複 | 通過。 |
| 必要欄位完整 | 通過。 |
| 空白 `word` | 未發現。 |
| 空白 `kana` | 未發現。 |
| 空白 `meaning` | 未發現。 |
| 空白 `partOfSpeech` | 未發現。 |
| 空白 `example` | 未發現。 |
| 空白 `exampleKana` | 未發現。 |
| 空白 `exampleMeaning` | 未發現。 |

必要欄位檢查範圍為：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。

### 4.1 題目與選項可用性補充統計

- 程度分布：N5 = 1000 筆，N4 = 2179 筆。
- 全資料唯一中文意思數：3028。
- 全資料雖有部分相同中文意思，但測驗錯誤選項邏輯會用 `usedMeanings` 排除重複 meaning，避免同題選項文字重複。
- 各主要詞性／程度篩選後皆有足夠資料產生 4 選 1 題目；僅「N4 + 表達句型」的唯一中文意思為 4，仍符合最低可用門檻。

## 5. 日文測驗頁載入檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 日文測驗頁可正常開啟 | 靜態檢查通過，HTML 結構完整且引用 `script.js`、`japaneseReadingQuestions.js`、`style.css`。 |
| 可讀取 3179 筆資料 | 資料來源追蹤與 `auditSiteHealth.js` 均確認 Japanese vocabulary cards = 3179。 |
| 題目區塊顯示 | `renderQuizQuestion()` 會建立 `.quiz-card`、`.quiz-prompt`、`.quiz-options`。 |
| 選項區塊顯示 | 每題建立 4 個 `.quiz-option` button。 |
| undefined / null / NaN / 空白選項 | 靜態資料檢查未發現空白必要欄位；選項來源使用非空 `meaning`。 |
| 資料量增加是否報錯 | 3179 筆通過現有 audit 與資料檢查。 |
| console error | Codex 環境未安裝 Playwright / Puppeteer / jsdom，無法進行實際瀏覽器 console 實測；以靜態檢查與 Node scripts 為準，未發現 script error。 |
| 手機版 | CSS 有 `@media (max-width: 640px)` 對 `.quiz-options`、`.quiz-panel`、`.quiz-card` 等區塊調整；未執行瀏覽器截圖實測。 |

## 6. 題目產生流程檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 測驗可以正常開始 | `quizModeButton` 綁定 `switchMode("quiz")`，進入後會呼叫 `createQuizQuestion()`。 |
| 題目可以正常產生 | 3179 筆資料與各主要篩選條件皆具足夠可用資料。 |
| 題目不會重複異常 | 使用 `wordQuizRoundSeenKeys` 排除同輪已出題項目，整輪用完後重設。 |
| 每題都有正確答案 | 正解由 `questionWord.meaning` 建立，且資料檢查確認 `meaning` 非空。 |
| 每題都有足夠選項 | `createWrongQuizOptions()` 會補足 3 個錯誤選項；全資料 fallback 可提供足夠候選。 |
| 選項不會空白 / undefined | 必要欄位非空；錯誤選項來源為 `word.meaning`。 |
| 選項不會重複異常 | `usedMeanings` 與 `usedWordIds` 會排除同題重複 meaning 與 id。 |
| 隨機邏輯 | `shuffleItems()` Fisher-Yates 洗牌，`pickLeastSeenItem()` 在最低 seen count 候選中隨機選題。 |
| 題數設定 | 單字測驗目前不是固定題數結果頁，而是連續題模式，統計即時顯示已答題數、答對題數與正確率。 |
| 分類／程度篩選 | 單字測驗沿用單字頁詞性分類與程度篩選；篩選變更時會重建題目。 |

## 7. 作答流程檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 點選選項後判定正確／錯誤 | `handleQuizAnswer()` 依 `selectedOption.isCorrect` 判定。 |
| 正確答案判定不錯位 | 選項資料物件和按鈕建立順序一致，判定使用被點選的 option 物件。 |
| 錯誤答案不誤判正確 | 錯誤選項建立時 `isCorrect: false`，正解 `isCorrect: true`。 |
| 作答後顏色或文字回饋 | 正確顯示「答對了！」；錯誤顯示「答錯了，正確答案是：...」，並套用 `.is-correct` / `.is-wrong`。 |
| 下一題流程 | 作答後顯示 `nextQuizQuestionButton`，點擊後產生下一題。 |
| 最後一題後結果頁 | 單字測驗目前無固定最後一題與獨立結果頁；採連續題與即時統計模式。 |
| 不會卡在某一題 | 同輪 seen key 排除與下一題按鈕流程正常；未發現靜態邏輯卡住點。 |
| 不重複計分 | `quizHasAnsweredCurrentQuestion` 防止同題多次計分。 |
| 不漏計分 | 首次作答會增加已答題數，正解會同步增加答對題數。 |
| console error | 無瀏覽器 console 實測環境；靜態與 Node 檢查未發現 error。 |

## 8. 結果頁檢查結果

目前「日文單字測驗」不是固定題數測驗，因此沒有獨立的最後結果頁，也沒有錯題列表頁。現有設計是在測驗頁 header 即時呈現結果統計。

| 檢查項目 | 結果 |
| --- | --- |
| 總題數顯示 | 以「已答題數」即時顯示，目前不顯示固定總題數。 |
| 正確數顯示 | `quizCorrectCount` 即時顯示。 |
| 錯誤數顯示 | 未獨立顯示錯誤數，可由已答題數 - 答對題數推算。 |
| 分數／正確率顯示 | `quizAccuracy` 以 `Math.round((correct / answered) * 100)` 顯示，0 題時為 `0%`，不會產生 NaN。 |
| 錯題或複習內容 | 單字測驗目前無錯題列表功能。 |
| 重新開始測驗 | `restartQuiz` 會經確認後重設統計並重新產生題目。 |
| 返回日文首頁或入口 | 頁面主選單與單字測驗切換入口存在。 |
| undefined / null / NaN | 統計邏輯對 0 題狀態有保護；資料欄位檢查無空白必填欄位。 |
| 手機版 | CSS 對測驗面板與選項具手機版規則；未做瀏覽器截圖實測。 |

## 9. 分類 / 程度 / 題型篩選檢查結果

### 9.1 單字測驗分類與程度

日文單字測驗有互動式詞性分類與程度篩選，與單字卡共用：

- 程度：全部程度、N5、N4。
- 詞性分類：全部、名詞、動詞、い形容詞、な形容詞、副詞、數字／量詞、表達句型。

篩選後統計如下：

| 篩選 | 全部 | N5 | N4 |
| --- | ---: | ---: | ---: |
| 全部 | 3179 | 1000 | 2179 |
| 名詞 | 1566 | 413 | 1153 |
| 動詞 | 558 | 95 | 463 |
| い形容詞 | 273 | 59 | 214 |
| な形容詞 | 185 | 13 | 172 |
| 副詞 | 174 | 23 | 151 |
| 數字／量詞 | 396 | 379 | 17 |
| 表達句型 | 23 | 18 | 5 |

上述每個非空篩選結果都至少有 4 筆資料，因此可產生單字測驗題目。若使用者再輸入搜尋字造成結果不足 4 筆，頁面會顯示明確提示，要求調整分類或搜尋條件。

### 9.2 題型

日文單字測驗目前只有「選出正確中文意思」一種題型。互動式題型切換只存在於文法測驗，單字測驗沒有題型切換控制。

## 10. Batch 03～06 新增詞抽查結果

抽查指定詞彙皆存在於 `vocabulary.json`，必要欄位完整，且因其為 N4 / 名詞資料，可在「全部」、「N4」、「名詞」、「N4 + 名詞」等篩選條件中被單字測驗使用。

| 詞彙 | id | level | kana | meaning | partOfSpeech | 測驗可用性 |
| --- | ---: | --- | --- | --- | --- | --- |
| `クリーニング店` | 3146 | N4 | クリーニングてん | 洗衣店 | 名詞 | 可作為題目或選項。 |
| `道路工事` | 3154 | N4 | どうろこうじ | 道路施工、道路工程 | 名詞 | 可作為題目或選項。 |
| `宅配会社` | 3151 | N4 | たくはいがいしゃ | 宅配公司 | 名詞 | 可作為題目或選項。 |
| `運動センター` | 3178 | N4 | うんどうセンター | 運動中心 | 名詞 | 可作為題目或選項。 |
| `学生料金` | 3179 | N4 | がくせいりょうきん | 學生票價、學生費用 | 名詞 | 可作為題目或選項。 |

長詞版面方面，`.japanese-word` 與 `.quiz-option` 在 CSS 中有手機版規則；靜態檢查未發現會直接導致破版的固定寬度設定。但本環境無瀏覽器，未能進行實機截圖確認。

## 11. 手機版版面檢查結果

`style.css` 中有針對 `max-width: 640px` 的手機版規則，包含：

- `.quiz-options` 手機版改為單欄顯示。
- `.quiz-panel`、`.quiz-card` 手機版降低 padding。
- 多處整體頁面區塊也有手機版 spacing 與 grid 調整。

本環境未安裝 Playwright / Puppeteer / jsdom，無法執行實際瀏覽器與手機 viewport 截圖；因此手機版結論以 CSS 靜態檢查為準，未發現明顯破版風險。

## 12. 與其他日文功能關聯檢查結果

| 功能 | 檢查結果 |
| --- | --- |
| 日文首頁入口 | `index.html` 與 `japanese/index.html` 導覽存在。 |
| 日文單字頁入口 | 日文頁預設單字 tab，單字練習與單字測驗按鈕存在。 |
| 日文單字頁搜尋 | `applySearch()` 與 `wordMatchesSearch()` 仍使用單字各欄位搜尋。 |
| 日文閱讀入口 | 日文頁有閱讀 tab 與閱讀 panel。 |
| 日文閱讀練習模式 ruby | `check-reading-ruby.js` 通過。 |
| 日文閱讀測驗模式隱藏 ruby | 既有 `docs/japanese-reading-quiz-hide-ruby-fix.md` 存在，且 ruby 檢查通過。 |
| 英文頁面 | `auditSiteHealth.js` 檢查 19 個 HTML pages 通過，未修改英文頁面。 |

## 13. 三個主要 script 結果

### 13.1 `node scripts/auditSiteHealth.js`

通過。重點輸出：

```text
HTML pages checked: 19
Question-bank counts: {"GEPT beginner vocabulary":2000,"article questions":200,"reading articles":50,"reading questions":200,"fill-in-the-blank questions":200,"Japanese vocabulary cards":3179,"Japanese grammar cards":290}
Manifest/icon audit completed.
Mobile touch-target CSS audit completed.
Site health audit passed.
```

### 13.2 `node scripts/audit-reading-vocabulary.js`

通過。輸出：

```json
{
  "readingSets": 105,
  "questions": 150,
  "terms": 361,
  "existing": 234,
  "missing": 127,
  "confirm": 127,
  "report": "docs/reading-vocabulary-audit.md"
}
```

此 script 仍輸出既有 reading vocabulary audit 統計，未出現 failure。

### 13.3 `node scripts/check-reading-ruby.js`

通過且無 warning。輸出：

```text
Checked 105 reading sets. Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.
```

## 14. 是否有新增 warning 或 error

- `git diff --check`：通過。
- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過且無 warning。
- `node --check`：`script.js`、`japaneseReadingQuestions.js` 與三個 scripts 均通過。
- 瀏覽器 console：本環境無可用瀏覽器套件，未能實測；靜態檢查未發現新增 console error 來源。

## 15. 問題與建議處理方式

本次未發現需要立即修正的阻斷問題。觀察事項如下：

1. 日文單字測驗目前為連續題模式，沒有固定題數與獨立結果頁；如未來需要「完整結果頁」、「錯題列表」或「固定 10 題結算」，建議另開功能任務，不應與本次回歸檢查混在一起。
2. 本環境缺少瀏覽器自動化套件，無法做實際點擊、console 與手機 viewport 截圖；若 PR 合併前需要更高信心，建議在具備 Playwright 或瀏覽器的環境補跑 E2E smoke test。
3. `audit-reading-vocabulary.js` 仍輸出 missing / confirm 統計，這是既有閱讀詞彙 audit 報告資訊；本次未新增 warning 或 error。

## 16. 下一步建議任務

1. 若產品需求需要固定題數結果頁，另開「日文單字測驗固定題數與結果頁設計」任務。
2. 若要提升回歸穩定度，新增 Playwright smoke test：載入日文頁、切換單字測驗、作答 3 題、檢查統計與 console error。
3. 若要進一步驗證手機版，可在瀏覽器環境補做 375px / 390px / 430px viewport 截圖檢查。
4. Batch 07 應維持另案處理；本次不建議接續新增單字。
