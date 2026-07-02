# 日文主線整合回歸檢查報告

檢查日期：2026-07-02

## 1. 本次檢查目的

本次檢查定位為「日文主線整合回歸檢查」，目標是在不修改功能、不新增單字、不進行 Batch 07 的前提下，確認首頁入口、日文閱讀、日文單字、日文測驗三個主要功能彼此不互相影響，且目前 3179 筆日文單字資料可穩定運作。

## 2. 目前日文主線狀態

- `vocabulary.json` 總筆數確認為 3179 筆。
- `node scripts/auditSiteHealth.js` 通過，日文單字卡數量為 3179，日文文法卡數量為 290。
- `node scripts/audit-reading-vocabulary.js` 通過，閱讀資料為 105 篇、閱讀題目為 150 題。
- `node scripts/check-reading-ruby.js` 通過，未輸出 warning。
- 本次檢查未發現新增 warning 或 error。
- 近期完成報告文件確認存在：
  - `docs/japanese-plan-c-completion-summary.md`
  - `docs/japanese-reading-full-regression-check.md`
  - `docs/japanese-reading-quiz-hide-ruby-fix.md`
  - `docs/japanese-vocabulary-full-regression-check.md`
  - `docs/japanese-quiz-full-regression-check.md`

## 3. 日文入口與導覽檢查結果

- 首頁 `index.html` 仍提供「日文學習」入口，連結目標為 `japanese/`。
- 日文首頁 `japanese/index.html` 仍提供主導覽，可返回首頁 `../`，並可前往英文學習 `../english/`。
- 日文首頁以分頁按鈕提供「單字」、「文法」、「閱讀」、「聽力」切換，其中單字、閱讀與測驗入口仍位於同一日文主頁流程內。
- 日文單字功能可由「單字」分頁進入，並可在「單字練習」與「單字測驗」間切換。
- 日文閱讀功能可由「閱讀」分頁進入，並可在「閱讀練習」與「閱讀測驗」間切換。
- 導覽與入口文字經靜態檢查，未發現可見的 `undefined`、`null`、`NaN` 或空白錯誤文字。
- 英文首頁入口仍保留在首頁與日文頁導覽中，未被本次檢查變更。

## 4. 日文閱讀功能整合檢查結果

- 閱讀資料確認為 105 篇。
- 閱讀題目確認為 150 題。
- 閱讀題組結構檢查通過，題目、選項、答案索引與解釋欄位皆可正常解析。
- 閱讀練習模式仍使用 ruby 顯示流程；`check-reading-ruby.js` 確認 ruby rendering 使用 vocabulary 與 rubyTerms，並略過不安全的 vocabulary kana。
- 閱讀測驗模式依前次修正結果不顯示 ruby / 假名；本次未修改該功能。
- 題目選項檢查未發現 `undefined`、`null`、`NaN` 或空白選項。
- 閱讀資料檢查與單字資料檢查可獨立通過，未發現閱讀頁影響日文單字頁或測驗頁的跡象。
- 手機版實際瀏覽器檢查受環境限制未執行，詳見第 8 節。

## 5. 日文單字功能整合檢查結果

- `vocabulary.json` 確認為 3179 筆。
- 日文頁設定 `window.JAPANESE_VOCABULARY_URL = "../vocabulary.json"`，單字頁仍指向目前主線單字資料。
- 單字資料必要欄位完整性檢查通過，包含 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- `id` 與 `word` 不重複。
- 未發現空白 `word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana` 或 `exampleMeaning`。
- 單字、假名、中文意思、詞性、例句、例句假名、例句中文皆有資料來源欄位可供顯示。
- 分類與程度篩選設定仍存在，包含全部、名詞、動詞、い形容詞、な形容詞、副詞、數字／量詞、表達句型，以及 N5 / N4 程度篩選。
- 搜尋欄位仍支援搜尋日文、假名、中文、詞性、程度或例句。
- Batch 03～06 匯入後的總筆數 3179 筆可由資料完整性檢查與 site health 檢查穩定載入。
- 未發現單字資料造成閱讀頁或測驗頁檢查失敗。

## 6. 日文測驗功能整合檢查結果

- 日文測驗功能仍使用 `vocabulary.json` 載入的單字資料產生題目。
- 單字測驗模式入口仍存在於日文單字分頁的「單字測驗」按鈕。
- 測驗狀態區仍包含已答題數、答對題數與正確率。
- 下一題與重新開始測驗控制仍存在。
- 單字資料結構檢查通過，因此題目生成所需的單字、中文意思與分類欄位均完整。
- 資料檢查未發現會導致選項顯示為 `undefined`、`null`、`NaN` 或空白的缺漏欄位。
- N5 / N4、詞性分類篩選設定仍存在；本次未修改切換邏輯。
- Batch 03～06 新增詞未造成 audit script 或資料完整性檢查失敗。
- 未發現測驗頁影響閱讀頁或單字頁的跡象。

## 7. `vocabulary.json` 資料完整性檢查結果

使用指定 Python 檢查腳本確認：

- 總筆數：3179。
- `id` 不重複。
- `word` 不重複。
- 必要欄位完整：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 沒有空白 `word`。
- 沒有空白 `kana`。
- 沒有空白 `meaning`。
- 沒有空白 `partOfSpeech`。
- 沒有空白 `example`。
- 沒有空白 `exampleKana`。
- 沒有空白 `exampleMeaning`。

檢查輸出：

```text
3179
vocabulary structure ok
```

## 8. 手機版與瀏覽器檢查結果

本環境無法執行實際瀏覽器 smoke test：

- 專案沒有既有 `node_modules` 或 Playwright 安裝。
- 嘗試以 `npx --yes playwright --version` 檢查可用性時，npm registry 回傳 403 Forbidden。
- 依任務限制，未勉強安裝大型工具。

因此本次以靜態檢查與 script 結果為準：

- HTML viewport 設定存在於首頁與日文頁。
- 日文主要入口、分頁按鈕、模式切換按鈕、搜尋欄位、測驗控制按鈕均可由靜態檔案確認存在。
- `auditSiteHealth.js` 的 Mobile touch-target CSS audit 通過。
- 未能實際驗證 375px、390px、430px viewport 下的 console error、互動流程與視覺破版狀態。

## 9. 三個主要 script 結果

### `node scripts/auditSiteHealth.js`

```text
HTML pages checked: 19
Question-bank counts: {"GEPT beginner vocabulary":2000,"article questions":200,"reading articles":50,"reading questions":200,"fill-in-the-blank questions":200,"Japanese vocabulary cards":3179,"Japanese grammar cards":290}
Manifest/icon audit completed.
Mobile touch-target CSS audit completed.
Site health audit passed.
```

### `node scripts/audit-reading-vocabulary.js`

```text
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

### `node scripts/check-reading-ruby.js`

```text
Checked 105 reading sets. Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.
```

## 10. 是否有新增 warning 或 error

- `git diff --check` 通過，未發現 whitespace error。
- `node scripts/auditSiteHealth.js` 通過，未輸出 warning 或 error。
- `node scripts/audit-reading-vocabulary.js` 通過；其 `missing` / `confirm` 為既有閱讀詞彙稽核統計輸出，本次未判定為新增 warning。
- `node scripts/check-reading-ruby.js` 通過，未輸出 warning。
- 指定 Python 資料完整性檢查通過。
- 額外閱讀題組結構檢查通過。
- 額外導覽 / 靜態可見錯誤字串檢查通過。
- 瀏覽器 console error 未能實測，原因為本環境無可用 Playwright / Chromium。

## 11. 是否建議進入 Batch 07

可以在建立 PR、完成 review 並合併本次整合回歸報告後，再規劃進入 Batch 07。

本次檢查未發現阻擋 Batch 07 的資料完整性、日文閱讀、日文單字或日文測驗主線問題。但 Batch 07 應另開任務處理，避免與本次回歸檢查混在同一變更中。

## 12. 下一步建議任務

1. 建立並合併本次「日文主線整合回歸檢查」報告 PR。
2. 若後續環境具備 Playwright / Chromium，補做 375px、390px、430px 手機 viewport 實際瀏覽器 smoke test。
3. 另開 Batch 07 任務，延續既有批次匯入流程，不在本次 PR 中加入新單字。
4. Batch 07 前再次執行 `auditSiteHealth.js`、`audit-reading-vocabulary.js`、`check-reading-ruby.js` 與 `vocabulary.json` 完整性檢查，確認基準仍穩定。
