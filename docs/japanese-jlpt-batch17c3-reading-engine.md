# Batch 17C-3：N4 JLPT 閱讀引擎

## 定位與修改範圍

Batch 17C-3 將 Batch 17C-2 產生的 N4 閱讀衍生題庫接入既有的站內 JLPT 風格模擬測驗。修改範圍限於 `japanese/index.html`、`script.js`、本文件與本批次 checker；不修改來源題庫、builder、歷史 checker或聽力資料。本功能是依站內授權學習資料衍生的**非官方**模擬測驗，不是官方 JLPT 題庫、官方分數或正式能力認證。

## 題庫契約與測驗組成

單字／文法題庫維持 `schemaVersion: 1`、`policyVersion: 17b1-internal-v1` 與 `?v=17b1` 契約，每級各有單字 10 題及文法 10 題。閱讀題庫使用 `?v=17c2`，runtime 驗證 `schemaVersion: 1`、`dataVersion: 17c2-n4-reading-v1`、`policyVersion: 17c2-reading-internal-v1`，以及 N5 不可用（0 組／0 題）和 N4 可用（105 組／150 題）的統計。

* N5：20 題（單字 10 題、文法 10 題）；閱讀尚未準備完成。
* N4：34 題（單字 10 題、文法 10 題、閱讀固定 10 組／14 題）。
* 聽力在本批次仍未開放。

N4 閱讀採 `17c2-initial-fixed-v1`／`fixed-manifest`，固定依序使用：

1. `jlpt-reading-set-n4-001`
2. `jlpt-reading-set-n4-002`
3. `jlpt-reading-set-n4-003`
4. `jlpt-reading-set-n4-016`
5. `jlpt-reading-set-n4-017`
6. `jlpt-reading-set-n4-026`
7. `jlpt-reading-set-n4-027`
8. `jlpt-reading-set-n4-031`
9. `jlpt-reading-set-n4-032`
10. `jlpt-reading-set-n4-015`

不抽樣、不隨機、不重排；各組問題沿用資料原始順序。開始 session 時會深複製測驗所需的本文、題目、選項、答案、解析、ruby 與進度 metadata，形成僅存於記憶體的 snapshot，進行中不再重新抽取、排序或推導資料。

## Ruby 與作答揭露

JLPT 閱讀的 `rubyTerms` 是本文、問題與選項唯一允許的注音來源。runtime 不使用通用 ruby、單字庫、既有閱讀來源或讀音推測作 fallback；沒有匹配 `rubyTerms` 的漢字保持原始純文字。題庫文字透過 `textContent`、文字節點及安全的 `ruby`／`rb`／`rt` DOM 節點呈現，不以 `innerHTML` 插入。

作答前只呈現原始本文、問題和四個按鈕，不揭露正確答案、`answerDisplay`、解析或 `passageKana`。作答後鎖定選項，才顯示結果、正確答案、`answerDisplay`、解析及作為學習輔助的 `passageKana`；假名不會替換原始本文。

## 載入失敗隔離與非目標

單字／文法和閱讀題庫分別 fetch、分別驗證。單字／文法失敗時 N5、N4 都停用；閱讀失敗時只停用 N4並顯示明確錯誤，N5 的既有 20 題仍可開始。兩者皆不回退到 `vocabulary.json`、`grammar.json` 或 `japaneseReadingQuestions.js`。

本批次不計分、不顯示百分比或成績頁、不計時、不寫入複習簿，也不使用 `localStorage`、`sessionStorage`、IndexedDB 或 cookie。離開 JLPT、返回首頁、完成後返回設定或重新整理都只留下乾淨的記憶體狀態。
