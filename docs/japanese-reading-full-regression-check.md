# 日文閱讀頁完整回歸檢查報告

## 1. 本次檢查目的

本次檢查目標是針對日文閱讀頁做完整回歸確認，範圍包含閱讀練習模式、閱讀測驗模式、ruby 顯示規則、題目流程、閱讀資料載入、日文入口導覽，以及日文閱讀頁與其他日文 / 英文功能之間是否互相影響。

本次任務只做檢查與報告，未新增日文單字，未修改 `vocabulary.json`，未進行 Batch 07。

## 2. 目前主線狀態

| 檢查項目 | 結果 |
| --- | --- |
| `vocabulary.json` 筆數 | 通過，仍為 3179 筆 |
| `docs/japanese-plan-c-completion-summary.md` | 通過，文件存在 |
| `node scripts/auditSiteHealth.js` | 通過 |
| `node scripts/audit-reading-vocabulary.js` | 通過 |
| `node scripts/check-reading-ruby.js` | 通過，未輸出 warning |
| `git diff --check` | 通過 |
| 新增 warning / error | 未在三個主要 script 與靜態語法檢查中發現新增 warning 或 error |

## 3. 日文閱讀資料狀態

以 `japaneseReadingQuestions.js` 中的 `window.JAPANESE_READING_SETS` 為資料來源進行檢查，結果如下：

| 檢查項目 | 結果 |
| --- | --- |
| 閱讀資料篇數 | 通過，仍為 105 篇 |
| 題目總數 | 通過，仍為 150 題 |
| `readingSet` 結構 | 通過，未發現空白或異常結構 |
| `title` | 通過，未發現空白 title |
| `titleRuby` | 通過，欄位存在 |
| `passage` | 通過，未發現空白 passage |
| `passageRuby` | 通過，欄位存在 |
| `passageKana` | 通過，未發現空白 passageKana |
| `questions` | 通過，未發現空白 questions |
| `vocabulary` | 通過，可正常讀取且為陣列 |
| `rubyTerms` | 通過，可正常讀取且為陣列 |
| 題目 options / answerIndex / explanation | 通過，未發現資料結構異常 |

補充：`audit-reading-vocabulary.js` 回報閱讀資料為 105 篇、150 題、361 個 terms，其中 234 個已存在於單字資料，127 個列為 confirm；此為既有 audit 結果，指令本身通過。

## 4. 閱讀練習模式檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 日文閱讀練習頁是否可正常開啟 | 通過，`/japanese/` 可由本地靜態伺服器取得，閱讀分頁結構存在 |
| 練習模式是否顯示 ruby / 假名 | 通過，練習模式以 `showRuby: true` 建立閱讀卡片，並在答題完成後顯示假名與重點單字區 |
| 漢字上方假名是否正常顯示 | 通過，ruby rendering 由 `renderRubyText` 與 `.jp-ruby` / `.jp-rt` / `.jp-rb` CSS 組合呈現 |
| ruby 是否造成版面錯位或文字重疊 | 未在靜態 CSS 檢查中發現明顯高風險設定；使用 inline-block、padding-top、nowrap、手機版字級調整降低重疊風險 |
| 題目、選項、解答區是否正常 | 通過，題目、選項、feedback 與 explanation 的產生流程完整 |
| 中文解釋或答案解析是否正常 | 通過，作答後會顯示「解析」內容 |
| 切換下一題 / 下一篇是否正常 | 通過，練習模式提供「換一篇閱讀」按鈕並重新挑選閱讀組 |
| 返回日文首頁或閱讀首頁是否正常 | 通過，日文首頁導覽與日文分頁切換結構存在 |
| 手機版版面 | 通過靜態 CSS 檢查，手機版閱讀卡片、選項欄位與字級有對應 media query |
| console 是否沒有新增錯誤 | 未發現 script 語法錯誤；受環境限制，本次未能以真實瀏覽器擷取 console |

## 5. 閱讀測驗模式檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 日文閱讀測驗頁是否可正常開啟 | 通過，閱讀分頁內存在「閱讀測驗」模式按鈕與初始化流程 |
| 測驗模式是否不顯示 ruby / 假名 | **發現問題：目前測驗模式仍以 `showRuby: true` 建立閱讀卡片，因此測驗中的 title、passage、題目與選項會顯示 ruby。這與本次驗收條件「測驗模式不顯示 ruby / 假名」不一致。** |
| passage 本文是否以測驗狀態呈現 | 部分通過，測驗流程與 status 存在；但 passage 仍顯示 ruby，不符合測驗狀態預期 |
| 題目與選項是否正常顯示 | 通過，題目與選項產生流程完整 |
| 作答後正確 / 錯誤判定是否正常 | 通過，作答後會記錄答案並依 `answerIndex` / `correctAnswer` 判定 |
| 測驗結果是否正常 | 通過，測驗完成後會顯示總分與各題結果 |
| 重新開始測驗是否正常 | 通過，結果頁提供「重新開始閱讀測驗」並呼叫 `startReadingQuiz` |
| 題目流程不會卡住 | 通過靜態流程檢查，完成每篇題目後會顯示下一篇 / 查看結果按鈕 |
| 手機版版面 | 通過靜態 CSS 檢查，手機版閱讀選項改為單欄 |
| console 是否沒有新增錯誤 | 未發現 script 語法錯誤；受環境限制，本次未能以真實瀏覽器擷取 console |

## 6. ruby 顯示規則檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 練習模式可以顯示 ruby | 通過 |
| 測驗模式不顯示 ruby | **未通過；目前測驗模式傳入 `showRuby: true`** |
| `titleRuby` 顯示正常 | 欄位存在；實際 render 目前是以 `title` 搭配 `rubyTerms` 生成 ruby，而不是直接注入 `titleRuby` |
| `passageRuby` 顯示正常 | 欄位存在；實際 render 目前是以 `passage` 搭配 `rubyTerms` 生成 ruby，而不是直接注入 `passageRuby` |
| `rubyTerms` 不會造成不存在詞彙 warning | 通過，`check-reading-ruby.js` 未輸出 warning |
| 已清除的 rubyTerms warning 是否重新出現 | 通過，未重新出現 warning |
| 是否重新加入 warning 詞 | 通過，本次未修改 rubyTerms、未新增 warning 詞 |

## 7. 手機版版面檢查結果

靜態 CSS 檢查結果如下：

- 閱讀卡片在小螢幕下縮小 padding。
- 閱讀選項在小螢幕下改為單欄顯示。
- 閱讀 passage 在小螢幕下調整字級與行高。
- ruby 樣式使用 `inline-block`、上方 padding、`nowrap` 與較小 `rt` 字級，降低漢字與假名重疊風險。

受本次環境限制，未能使用真實瀏覽器或裝置截圖做視覺比對；未在靜態 CSS 中發現明顯破版設定。

## 8. 入口與導覽檢查結果

| 檢查項目 | 結果 |
| --- | --- |
| 日文首頁入口 | 通過，主導覽含日文學習入口 |
| 日文閱讀入口 | 通過，日文頁內有閱讀 tab |
| 日文單字頁入口 | 通過，日文頁內有單字 tab，且預設為單字 |
| 日文測驗入口 | 通過，日文單字 tab 中有單字測驗按鈕，文法 tab 中有文法測驗按鈕 |
| 日文閱讀頁是否影響日文單字頁 | 未發現互相覆蓋；閱讀 panel 與單字 / 文法 main content 透過 tab hidden 狀態切換 |
| 日文閱讀頁是否影響日文測驗頁 | 未發現互相覆蓋；閱讀測驗使用獨立 reading state |
| 英文頁面是否受影響 | `auditSiteHealth.js` 通過，未發現英文頁面連結或題庫健康檢查異常 |

## 9. 三個主要 script 結果

```text
node scripts/auditSiteHealth.js
=> Site health audit passed.
```

```text
node scripts/audit-reading-vocabulary.js
=> readingSets: 105, questions: 150, terms: 361, existing: 234, missing: 127, confirm: 127
```

```text
node scripts/check-reading-ruby.js
=> Checked 105 reading sets. Ruby rendering uses vocabulary plus rubyTerms, skips unsafe vocabulary kana, and does not require full kanji coverage.
```

`check-reading-ruby.js` 未輸出 warning。

## 10. 是否有新增 warning 或 error

- 三個主要 script 未發現新增 warning 或 error。
- `git diff --check` 通過。
- `node --check script.js` 與 `node --check japaneseReadingQuestions.js` 通過。
- 本次未能以真實瀏覽器擷取 console，因此 console error 僅能以靜態語法檢查與本地靜態伺服器可取得頁面作為替代確認。

## 11. 問題與建議處理方式

### 問題 1：閱讀測驗模式仍顯示 ruby

- 現象：`renderReadingQuizQuestion` 建立閱讀卡片時傳入 `showRuby: true`。
- 影響：測驗模式的 title、passage、題目與選項會顯示 ruby，不符合本次要求「測驗模式不顯示 ruby / 假名」。
- 建議：另開一個小型修正任務，將閱讀測驗模式的 `showRuby` 改為 `false`，並再次執行本報告列出的回歸指令。

### 問題 2：本次未進行真實瀏覽器 console 與截圖驗證

- 現象：環境中未發現可直接使用的 Chromium / Firefox / Playwright / jsdom。
- 影響：無法提供實際瀏覽器 console 截圖或手機 viewport 截圖。
- 建議：若合併前需要完整視覺驗證，可在有瀏覽器環境的 CI 或本機補跑 Playwright / Lighthouse / 手機 viewport smoke test。

## 12. 下一步建議任務

1. 建立「日文閱讀測驗模式隱藏 ruby」修正任務，只調整閱讀測驗模式，不修改 `vocabulary.json`。
2. 修正後重跑：`git diff --check`、`node scripts/auditSiteHealth.js`、`node scripts/audit-reading-vocabulary.js`、`node scripts/check-reading-ruby.js`、`node --check script.js`。
3. 若環境允許，補上真實瀏覽器手機版截圖與 console smoke test。
4. 維持 Batch 07 暫不進行，避免與回歸修正混在同一 PR。
