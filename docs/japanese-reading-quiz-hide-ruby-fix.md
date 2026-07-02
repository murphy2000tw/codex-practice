# 日文閱讀測驗模式隱藏 ruby 修正紀錄

## 1. 修正目的

本次修正目的為限定處理「日文閱讀測驗模式不應顯示 ruby / 假名」的問題。閱讀練習模式仍應保留 ruby 輔助閱讀；閱讀測驗模式則應只顯示不含 ruby 的題目文字，避免測驗時直接提供讀音提示。

## 2. 問題原因

目前日文閱讀頁的閱讀內容由 `script.js` 的 `createReadingSetCard` 統一渲染。該函式會依照傳入的 `showRuby` 參數決定是否呼叫 `renderRubyText`：

- `showRuby: true` 時，標題、文章、選項與題目會用 `title` / `passage` 搭配 `rubyTerms` 產生 ruby 顯示。
- `showRuby: false` 時，標題、文章、選項與題目會直接使用純文字 `title` / `passage` / question / options。

練習模式的 `showReadingPracticeQuestion` 傳入 `showRuby: true`，符合需求。問題在於測驗模式的 `renderReadingQuizQuestion` 也傳入 `showRuby: true`，因此測驗模式仍會顯示 ruby / 假名。

## 3. 修改檔案

- `script.js`
  - 將 `renderReadingQuizQuestion` 呼叫 `createReadingSetCard` 時的 `showRuby` 從 `true` 改為 `false`。
  - 未修改 `rubyTerms`、閱讀資料、題庫資料或 `vocabulary.json`。
- `docs/japanese-reading-quiz-hide-ruby-fix.md`
  - 新增本修正紀錄。

## 4. 練習模式確認結果

練習模式仍由 `showReadingPracticeQuestion` 建立閱讀卡片，並保留 `showRuby: true`。因此練習模式仍會透過 `renderRubyText` 顯示 ruby / 假名。

## 5. 測驗模式確認結果

測驗模式改由 `renderReadingQuizQuestion` 傳入 `showRuby: false`。因此閱讀測驗卡片會直接使用不含 ruby 的 `title`、`passage`、題目與選項純文字，不再顯示 ruby / 假名。

## 6. 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過；確認閱讀資料仍為 105 篇、題目仍為 150 題。
- `node scripts/check-reading-ruby.js`：通過；無 warning。

## 7. vocabulary.json 筆數確認

`vocabulary.json` 維持 3179 筆。本次未修改 `vocabulary.json`，也未新增、刪除或調整日文單字。

## 8. 是否仍有 warning

`check-reading-ruby.js` 執行結果無 warning。

## 9. 是否有殘留問題

本次修正只針對閱讀測驗模式的 ruby 顯示開關。未發現與本修正目標相關的殘留問題。

## 10. 下一步建議

建議合併前以瀏覽器再做一次人工確認：

1. 日文閱讀練習模式仍可看到 ruby / 假名。
2. 日文閱讀測驗模式不顯示 ruby / 假名。
3. 測驗作答、下一篇閱讀與結果頁流程正常。
