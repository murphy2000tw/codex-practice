# Batch 17B-2：JLPT 單字與文法作答引擎

## 定位與修改範圍

本功能是站內依既有學習資料衍生的**非官方 JLPT 風格模擬測驗**，不是官方題庫、官方分數或正式難度認證。Batch 17B-2 只修改 `japanese/index.html` 與 `script.js`，並新增本文件及 `scripts/check-japanese-jlpt-batch17b2-engine.js`；Batch 17B-1 資料、來源題庫與其他日文模組均不修改。

## 載入、版本與題型

進入 JLPT 專區後，runtime 載入 `japaneseJlptVocabularyGrammarQuestions.json?v=17b1`。開始按鈕只會在驗證 `schemaVersion === 1`、`policyVersion === "17b1-internal-v1"`、總數 40，以及 N5、N4 各 20 題後啟用。載入或驗證失敗會顯示錯誤並維持 disabled，不回退至 `vocabulary.json` 或 `grammar.json`。

每個等級按題庫順序使用全部題目，不抽選：單字意思 10 題、文法意思 5 題、文法填空 5 題。設定頁上的單字及文法題數也由已驗證題庫即時計算。

## 題面政策與作答

主要題幹只顯示資料中的 `displayText`，不以 `originalText` 取代，也不在 runtime 猜測漢字等級。本批 40 題都必須通過 `kanjiPolicy === "kana-replacement"` 驗證。作答前僅呈現題幹及四個選項；選擇後鎖定全部選項，才顯示答對／答錯文字、正確答案、`answerDisplay` 與 `explanation`，並啟用下一題。

所有題庫文字均以 `textContent`、`createTextNode` 及安全 DOM 節點建立，不插入 `innerHTML`。選項、下一題和返回操作均為原生 `button`，可由鍵盤操作；disabled 同時使用原生屬性及既有視覺樣式。題目以 heading 標示進度和等級，回饋區使用 `aria-live="polite"`，答對／答錯亦有文字而非只靠顏色。既有 responsive quiz 樣式讓選項及長解析換行，避免手機橫向捲動。

## 記憶體 session 與隔離

按下開始時，所選等級的 20 題會複製為 `questionSnapshots`，另以 `selectedLevel`、`currentIndex`、`answers` 組成獨立記憶體 session。作答不修改原始題庫物件，也不共用單字、文法、閱讀、聽力、複習中心或句子重組的 quiz state。

返回 JLPT 設定會清除 snapshots、索引、答案、回饋與鎖定 DOM；返回日文首頁或切換至其他日文 view 會再清除 session 及等級選擇。題庫本身僅可在頁面記憶體快取。本引擎不讀寫 LocalStorage，尤其不碰生字本、錯題本或 seen-count keys，也不建立 `japanese_jlpt_*` key。

## 明確未實作項目

本批沒有總分、答對率、分區成績或結果頁；沒有 timer、倒數、重新測驗流程、隨機抽題、錯題本、生字本、閱讀、聽力及句子重組。完成畫面僅告知本輪作答完成，並提供返回 JLPT 設定。

## 稽核與下一批交接

新 checker 以 `8aa6dee7dad5b0be19737d09f918c58e53dc54bd` 為固定基準，確認變更範圍、受保護檔案、資料分布、cache token、安全 DOM、答題 gating、session 清除及 Batch 17B-1 generator。

舊 `check-japanese-jlpt-batch17a2-entry.js` 與 `check-japanese-jlpt-batch17b1-data.js` 是當時批次的固定稽核證據：前者刻意要求尚未提供正式作答入口，後者刻意要求 runtime 與舊 cache 版本未修改。Batch 17B-2 正是要改變這些狀態，因此兩者不適合作為新 HEAD 的直接回歸測試，也不得為了通過而修改或弱化。

下一批可在現有載入驗證及 session 邊界上新增結果設計、正式重測策略或其他題型；加入前仍須另定計分、持久化、閱讀與聽力政策，不應由本批行為推定。
