# 一般日文聽力練習／測驗的 iOS 播放修正

## 起點與調查

本次從最新 main `dd66b8c` 建立，已包含 #319、#320。使用者回報 iPhone Safari 的一般聽力練習與測驗，點擊後一直顯示「準備播放，請稍候…」，沒有聲音、沒有 onstart；換題相同，裝置日文語音設定正常，平假名錄音正常。

實際路徑為 `createListeningPlayButton` → 練習／測驗各自 controller → `createJapaneseListeningModeSpeechController` → 1 秒後 `speechSynthesis.speak()`。問題在呼叫端設定與語音準備流程：

1. 一般聽力兩個 controller 沿用預設 `unlockOnGesture: false`。#319 只在平假名路徑啟用解鎖，#320 將發音頁改為 HTML Audio，兩者都沒有修正一般句子聽力的手勢設定。iOS 需要使用者手勢時，1 秒後的正式 speak 不在點擊堆疊內，可能被拒絕且不發 start/error。
2. 一般聽力的 `startTimeoutMs` 原本也是 0。被拒絕的語句沒有事件可更新 UI，因此一直留在準備中。
3. 原 controller 在點擊時只讀一次 voice，1 秒後沿用該結果；日文清單尚未載入時，會以 null voice 送出，沒有等清單更新或確認日文 voice 已就緒。
4. 頁面返回首頁的既有操作會 reset，但直接導航離開聽力測驗缺少額外取消 guard；整份頁面的 pagehide 也未取消這兩個 controller。

新增測試以合併後 main 原碼和新開頁的 iOS 手勢模型重現：點擊後 1 秒才送出第一個正式語句，語音被模型拒絕，沒有輸出或 onstart，UI 即使再等 10 秒也維持「準備播放」。這確認應用程式路徑缺少必要的手勢處理，並非只改錯誤文字就能解決。模型重現不等同於使用者實機診斷；Safari 的原生引擎與實際聲音仍需實機驗收。

WebKit 的手勢機制可參考 [SpeechSynthesis.cpp](https://github.com/WebKit/WebKit/blob/3dc3ba3a4d52cd8f24e6c7d491b90b2830f5bcd8/Source/WebCore/Modules/speech/SpeechSynthesis.cpp)。這項參考不表示已確認使用者安裝的 Safari／iOS 版本。

## 修正後流程

| 階段 | 處理 |
| --- | --- |
| 點擊當下 | 一般聽力透過專用 factory 啟用 iOS 解鎖。同步送出獨立空文字、volume 0 的解鎖語句，未完成時立即清理；不等待語音清單才解鎖，也不提前讀出答案。 |
| 0–1000 ms | 保留完整 1 秒準備時間，按鈕停用，顯示既有準備提示。正式語句不會提早送出。 |
| 準備結束 | 重新讀取目前的日文 voice，而非沿用點擊時的 null／舊物件；日文 voice 就緒即送出原文，保留 ja-JP、rate 0.86、pitch 1、volume 1。 |
| 語音清單未就緒 | 顯示等待日文語音載入；註冊本請求專用 voiceschanged 及每 100 ms 的限時輪詢，任一路發現 voice 即接續原請求，只送出一次。取消或完成準備後移除監聽與計時器。 |
| 正式語句 onstart | 才顯示「正在播放日文音訊…」。onend 後練習允許重播，測驗保持已用額度。 |
| 失敗 | 區分 API 不支援、尚未取得日文語音、瀏覽器拒絕、voice／language 不可用、原生播放失敗與啟動／完成逾時。提供中文訊息；練習可重試，測驗維持已用額度。 |

voice 等待期限為準備結束後 5 秒；正式語句啟動期限為送出後 5 秒；onstart 後另有 60 秒完成保護。這些期限只處理事件遺失或失敗，**成功測試必須透過正式語句的 onstart／onend 完成，不能靠逾時通過**。語音清單晚到或瀏覽器忙碌時，實際發聲可能晚於 1 秒。

解鎖與清理沿用 #319 的點擊堆疊流程，讓原生取消清理先於準備延遲執行；1 秒後不再先 cancel 空白語句才立刻送答案。Web Speech API 沒有可等待的原生 cancel Promise，無法保證任意延遲的系統清理時限。

## 取消、額度與範圍

- 保留 generation 與 utterance ownership。換題、返回選單、重播前的既有取消、直接離開測驗及 pagehide 都使舊請求失效；聲音清單事件與輪詢也會清除。
- 另外檢查等待與啟動計時器的階段狀態，避免已清除但晚到的回呼取消同一請求已開始的語句。
- 瀏覽器從 bfcache 返回時重建當前題目的控制項，保留題目、分數及測驗已用額度。練習可重新播放；測驗不因重建、錯誤、逾時或取消而退還同題額度。
- 未改測驗抽題、選項、判題或計分。新開始測驗／返回選單的 session reset 保留原行為。
- 新的 voice 等待與一般聽力時限只由 `createJapaneseGeneralListeningSpeechController` 啟用。共用 controller 的新增 voice 等待預設為 0，平假名聽音練習與正式 JLPT 沿用各自設定。
- 平假名發音頁、兩個平假名音訊 helper、平假名聽音練習檔及 46 份 WAV／manifest 全部未修改；未擴充假名。
- `japanese/index.html` 的共用 script 資源由 4.12 升為 4.13。

## 修改檔案

- `script.js`：一般聽力 factory 與 iOS 偵測、可選 voice 等待流程、錯誤分類、直接離開測驗及 pagehide／pageshow 收尾。
- `japanese/index.html`：共用 script 版本。
- `scripts/check-japanese-general-listening-ios.js`：新增一般練習／測驗的實際按鈕、renderer 與 controller 測試。
- `scripts/check-japanese-listening-menu.js`：用分類後的錯誤訊息更新舊固定文案斷言。
- 本文件：調查、範圍、檢查與實機限制。

## 實際檢查結果

新增一般聽力測試 26 組全部通過，包括兩種模式的新開 iOS 手勢解鎖、999／1000 ms、開始／不開始、準備期間與準備後才載入語音、voiceschanged／輪詢、getVoices 暫時拋錯、語音未就緒、原生錯誤／拋錯、啟動／完成逾時、快速連點、準備／等 voice／播放中取消、換題／返回／pagehide、bfcache 額度保留、晚到事件、voice 更換及完整 10 題判分。

修正前對照：`node scripts/check-japanese-general-listening-ios.js --baseline` 固定使用 `dd66b8c` 原碼，預期失敗；能看到一般練習與測驗在手勢模型中持續準備、沒有正常播放的結果。此選項只供修正前後比較。

以下 17 項 Node 檢查皆通過：

```sh
node scripts/check-japanese-general-listening-ios.js
node scripts/check-hiragana-chart-audio.js
node scripts/check-hiragana-ios-tts.js
node scripts/check-hiragana-audio.js
node scripts/check-hiragana-listening.js
node scripts/check-japanese-main-entry.js
node scripts/check-japanese-view-isolation.js
node scripts/check-japanese-listening-audio-start.js
node scripts/check-japanese-listening-menu.js
node scripts/check-japanese-listening-state-isolation.js
node scripts/check-japanese-listening-view-isolation.js
node scripts/check-japanese-listening-sentence-final.js
node scripts/check-japanese-listening-practice-shuffle.js
node scripts/check-japanese-jlpt-batch18a1-listening-activation-plan.js
node scripts/check-japanese-jlpt-batch18a2-listening-adapter.js
node scripts/check-japanese-jlpt-batch18a3-listening-isolated-pipeline.js
node scripts/check-japanese-jlpt-batch18a4-product-activation.js
```

`node --check script.js`、`git diff --check` 及平假名各檔／46 份音檔對 main 無差異檢查通過。

Playwright／Chromium 154 桌面與 428×926 手機尺寸（iPhone 使用者代理）已通過：兩種模式的點擊解鎖／1 秒準備／onstart／onend、voice 晚到與未載入、啟動逾時、原生錯誤、返回與 bfcache 額度、換題及過期回呼、直接導航離開測驗、完整 10 題答對與一次播放額度。兩種尺寸均無未捕捉 JavaScript 錯誤。另以原 `ka.wav` 作真實 HTML Audio 冒煙檢查，確認發音頁未受影響。

## 自動化不能證明的部分

本次**沒有在實體 iPhone Safari 完成測試**。Node 與 Chromium 的一般 TTS 使用模擬的手勢／原生事件 provider，能驗證呼叫時序、voice 就緒、UI 與額度，不能證明 iOS AVSpeechSynthesizer 的實際音訊輸出、裝置音量／路由、Siri 或下載中語音的可用性、音色、網路語音服務及特定 iOS 版本的系統競態。手機使用者代理字串不是使用者的 iOS 版本。

實機仍需以 Safari 新頁面、尚未播平假名錄音前，分別進入一般聽力練習與測驗：確認約 1 秒後實際有聲、開始／完成提示正確；再測練習重播、換題、播放中返回、瀏覽器上一頁／下一頁及測驗每題一次。裝置設定中有聲，不能替代網頁的手勢解鎖與 voice 清單驗證。
