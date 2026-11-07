# 句子聽力練習：隨機、不重複出題

## 修改

- 從最新 `main` 的 `1c8be68`（PR #316 合併提交）建立分支，保留已合併功能。
- 「日文 → 聽力 → 聽力練習」每次進入時，複製現有 100 題並以練習專用的 Fisher–Yates 洗牌；從洗牌後第一題開始。
- 「下一題 / 換一題」依本輪順序前進，每輪 100 題各出現一次。完成後重新洗牌；若新一輪首題等於上一輪末題，與本輪另一個隨機位置交換。
- 返回聽力選單、日文首頁、切換其他頁面或改進入獨立測驗時，清除練習順序與索引並取消練習播放；重新進入建立新順序。不儲存進度。
- 重播只播放目前句子，不消耗下一題。保留日文、假名、中文、1000ms 準備時間及切題取消播放。
- 不改原始題庫、獨立聽力測驗抽題、正式 JLPT、平假名聽音練習或兩個既有 `shuffleItems` 定義。練習不依賴同名函式覆蓋。
- `japanese/index.html` 的共用腳本快取版本由 `4.10` 更新為 `4.11`。

## 自動驗證

`node scripts/check-japanese-listening-practice-shuffle.js` 使用真實題庫、練習畫面處理函式、按鈕事件與語音控制器：

- LCG 固定種子 `0、1、42、316、20261107`，各 100 輪、每輪 100 題，共 50,000 次出題；確認完整涵蓋題庫、輪內無重複、每輪重新洗牌及交界無相同題。
- 特製可重現亂數強制讓新一輪首題撞上上一輪末題，確認交換修正仍保留完整 100 題；重設後也清除跨輪限制。
- 確認重播與單純重新繪製不換題；999ms 尚未提交語音、1000ms 提交原文 `ja-JP`；連點不重複提交、完成後可重播。
- 確認準備中及已提交語音時切題會取消，過期計時器及語音回呼失效；返回選單、離開及重新進入會重設。
- 每題保留日文、假名與中文顯示；深度凍結題庫並比對操作前後完整 JSON，確認沒有修改原始資料。

相關回歸命令：

```sh
node --check script.js
node scripts/check-japanese-listening-practice-shuffle.js
node scripts/check-japanese-listening-audio-start.js
node scripts/check-hiragana-listening.js
node scripts/check-japanese-listening-menu.js
node scripts/check-japanese-listening-state-isolation.js
node scripts/check-japanese-listening-view-isolation.js
node scripts/check-japanese-listening-sentence-final.js
node scripts/check-japanese-main-entry.js
node scripts/check-japanese-view-isolation.js
node scripts/check-japanese-jlpt-batch18a1-listening-activation-plan.js
node scripts/check-japanese-jlpt-batch18a2-listening-adapter.js
node scripts/check-japanese-jlpt-batch18a3-listening-isolated-pipeline.js
node scripts/check-japanese-jlpt-batch18a4-product-activation.js
git diff --check
```

既有檢查同步改為驗證無條件重設與新的練習輪次流程；18A-4 的過期 `4.7` 快取斷言改為檢查有版本號的腳本引用，保留其題數、能力檢查、播放額度、計分與隔離驗證。

上述命令全部通過。另以 Playwright 操作 Chromium 桌面（1280 × 900）及 iPhone 13 尺寸模擬，各完成連續兩輪共 200 題：確認題庫完整、輪次交界、三種文字顯示、重播不換題、1000ms 準備、切題取消、返回選單／首頁／直接切換頁面的重設與重新進入；題庫完整 JSON 不變，沒有頁面 JavaScript 錯誤。瀏覽器測試同樣使用模擬語音 provider，iPhone 尺寸模擬不等於 iPhone Safari 實機。

## 實機確認與驗證範圍

使用者已確認：原有 1 秒準備時間在電腦與手機實測正常。本次保留該行為。

這項確認不代表所有裝置、瀏覽器或音訊輸出的音質均已驗證。自動測試使用模擬 Speech Synthesis provider，驗證出題、時序、取消與畫面狀態，不作為真實音質或所有裝置語音成功播放的證據。
