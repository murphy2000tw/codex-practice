# Batch 18A-4：JLPT N5／N4 聽力正式啟用

## 正式配額

`17c10-product-v1` 現在正式包含聽力。N5 為單字 8、文法 4、閱讀 8、聽力 10，合計 30 題；N4 為單字 10、文法 8、閱讀 16、聽力 10，合計 44 題。`17c6-compat-v1` 的既有配額與資料流程不變，但正式題庫載入失敗時不再靜默降級成相容 profile。

## 題庫與 session 契約

正式載入直接呼叫 Batch 18A-2 immutable adapter，並在開始測驗時以 Batch 18A-3 isolated pipeline 完整驗證 100 題 inventory、provenance、不可變參照、N5／N4 分流、每輪不重複抽取 10 題及答案位置排列。能力檢查在建立任何正式 session 前執行；缺少 Speech Synthesis、utterance constructor 或日文 voice 時，完整測驗 fail closed，不留下部分 session。

## UI、播放與生命週期

聽力題作答前只顯示通用題幹、四個中文選項和原生播放按鈕，不把日文、假名、翻譯、正解或 permutation metadata 寫入題目 DOM。第一次點擊立即消耗唯一播放額度並停用按鈕；constructor 或 `speak()` 失敗也不退款。作答後才顯示日文與中文正解。

JLPT 使用獨立的 played set、generation token、voice 與 active utterance。切題、返回設定、重設、換級別或離開面板只會在 JLPT controller 確實持有 utterance 時取消語音；晚到 callback 以 generation、utterance 與當前題目 identity 三重檢查隔離。練習模式仍可重播，獨立聽力測驗仍保有自己的額度與狀態。

## 結果與後續

完成頁顯示正確題數／總題數，並可返回設定頁建立全新 session。此批沒有修改原始聽力題庫，也沒有新增 localStorage、sessionStorage、IndexedDB 或 Cache API schema。

桌機、手機、鍵盤操作與實際日文語音裝置驗收不屬於本批，留待 Batch 18A-5。

## 自動回歸

`scripts/check-japanese-jlpt-batch18a4-product-activation.js` 使用 Node VM、mock Speech Synthesis provider 與可觸發事件的 DOM fixture 實際執行正式 profile 驗證、兩級抽題、開始能力 gate、播放、作答、完成計分、切題、返回與重設流程。測試亦注入 utterance constructor／`speak()` 失敗與晚到 callback，確認播放額度不退款、owned cancellation、重新開始及模式隔離，而非只比對原始碼字串。

歷史 `scripts/check-japanese-jlpt-batch17c10b-product-activation.js` 會先執行目前 A4 整合 checker，接著繼續執行原有 17C-10B 的完整 adapter、pipeline、UI、loader 與 negative fixtures；不再於委派後提前結束。

A4 checker 也會使用六份實際 JSON 題庫與原始 100 題聽力常數，直接執行最新版 `buildJapaneseJlptProductCandidates()`、`loadJapaneseJlptProductBanks()` 和 `buildJapaneseJlptSession()`。N5／N4 各以五個 deterministic seeds 驗證完整區段配額、聽力唯一性與分級、canonical/permutation identity，以及全卷正解位置分布；正式總分布固定為 N5 `7/7/8/8`、N4 `11/11/11/11`，聽力區段維持 `2/2/3/3`。
