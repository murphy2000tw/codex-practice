# 五母音錄音試接入後的 iOS TTS 修正

## 回報與調查範圍

使用者在 iPhone 13 Pro Max 回報：五母音 WAV 有聲，其餘平假名及聽音練習的 TTS 無聲，畫面停留在「正在播放」；裝置日文語音設定中的測試有聲。iOS 版本尚未取得。本修正從 PR #318 合併後的 main `cfb1b07` 建立。

使用者再次確認：同一支手機在 PR #318 前皆可正常使用；合併後反覆測試，五母音點擊約 1 秒後有聲，其他假名與聽音練習等再久仍無聲、卡在播放中。這是合併前後的實機回歸證據，不能因為解鎖缺口早已存在，就否定此次整合造成回歸的可能性。約 1 秒是使用者觀察到的 WAV 發聲時間，並非 WAV 路徑另有 1 秒計時排程。

目前尚未確認 PR #318 造成該裝置回歸的完整因果鏈；原有解鎖缺口與取消競態只能作為本 PR 已修正、可由模型重現的缺陷，不能單獨當成實機根因定論。尤其仍須在目標裝置比較「全新頁面直接播放 TTS」及「先播 WAV 再播 TTS」，釐清混合音訊路徑的影響。尚未取得這兩種順序的分開結果或修正版實機驗收結果。

無法在此環境直接操作該實體 iPhone，因此以下區分可確認的程式問題、模型重現結果與尚待實機確認的因果關係。

## 路徑比較與原因

| 路徑 | PR #318 合併後行為 | 發現 |
| --- | --- | --- |
| あ／い／う／え／お | 點擊當下呼叫 HTML `Audio.play()`，使用原五份 WAV | 不經 SpeechSynthesis，因此錄音有聲不能證明 TTS 已解鎖 |
| 發音頁其他 41 字 | wrapper 轉交共用 speech controller，1 秒後才 `speak()` | 發音頁未傳入 iOS `unlockOnGesture`，首次 TTS 可能在手勢範圍外被拒絕 |
| 聽音練習其他 41 字 | 點擊同步 `speak(空白解鎖)`，1 秒後清理解鎖再送出正式語句 | 若空白語句未回報完成，會在同一個延遲回呼中 `cancel()` 接著 `speak(正式語句)`，有原生非同步取消清理與新請求競態 |
| 播放完成檢查 | 正式語句 `onstart` 清除啟動計時器；之後僅等 `onend/onerror` | 原生先送出 start、卻沒有完成事件時，畫面可能無限停在播放中 |

共用 TTS 的解鎖／取消時序並不是 PR #318 新增的程式碼；發音頁缺少解鎖也已存在於之前版本。再次逐項比對 #318 的 wrapper、兩頁事件處理與資源版本，未找到「wrapper 一定會取消剛轉交的新 TTS」的同步呼叫錯誤：原有 speech controller 有 ownership 與 generation 檢查，沒有送出的語句不會觸發全域 cancel，錄音舊事件也有 token 隔離。這項程式比對結果不能排除 #318 的 HTML Audio／TTS 整合觸發實機問題；也不足以解釋為什麼使用者在合併前正常、合併後失敗。完整實機回歸原因仍待確認。

WebKit 本身有相同類型的原生取消競態紀錄：[WebKit 3dc3ba3](https://github.com/WebKit/WebKit/commit/3dc3ba3a4d52cd8f24e6c7d491b90b2830f5bcd8) 修正非同步取消事件清掉後續語句的情形；[SpeechSynthesis.cpp](https://github.com/WebKit/WebKit/blob/3dc3ba3a4d52cd8f24e6c7d491b90b2830f5bcd8/Source/WebCore/Modules/speech/SpeechSynthesis.cpp) 亦顯示 iOS 在 `speak()` 同步處理使用者手勢限制。這支持測試模型與避開時序的修正，**不證明使用者所裝 Safari 的版本一定包含該原生缺陷**。

新增測試在合併後原碼上重現：1 秒時先 cancel 空白解鎖、緊接著送出正式語句；模型送出 start 後，舊取消清理清掉新語句，沒有模擬音訊輸出與 end，狀態保持「正在播放日文發音…」。模型可證明應用程式容易受此事件順序影響，但不是實機採樣或原生診斷紀錄。

## 修正

1. 兩個平假名頁面共用 `getHiraganaSpeechOptions()`：iPhone／iPad／iPod 及觸控 Mac（iPad 桌面模式）啟用同步手勢解鎖；一般桌面維持不解鎖。
2. 解鎖仍是點擊當下送出獨立、空文字、volume 0 的語句。若未同步完成，立即在點擊堆疊清理解鎖，**先於既有 1 秒準備時間**；1 秒後只提交正式語句，不再在該回呼先取消解鎖。這讓原生取消清理有準備期間可完成，避免取消與新答案同一 task 連續送出。Web Speech API 沒有可等待的原生 cancel Promise，因此無法保證任意延遲的系統回呼時限。
3. 正式語句明確設定 volume 1、ja-JP、日文 voice、原 rate 與 pitch；不添加或變更發音文字。
4. wrapper 的錄音完成／錯誤／逾時只清理持有的 HTML Audio，不呼叫 speech cancel。換字／重播／換題／離頁仍取消該 controller 持有的播放，保留 generation 隔離。
5. 平假名 TTS 保留 5 秒啟動期限，另增加可選的 10 秒完成期限，防止 start 後遺失 end/error 時永久卡住；完成／錯誤／取消都清除計時器。這是缺事件的保護，不是無聲的修復依據；正常回歸必須產生模擬音訊輸出並由 end 完成，不能靠逾時通過。
6. 共用 controller 的完成期限預設仍為 0，未套用至一般句子聽力、獨立測驗或 JLPT；一般聽力維持原 1 秒準備、重播／一次播放額度及 ownership 規則。
7. 資源版本更新：`script.js` 4.12、`hiraganaAudio.js` 1.1、`hiragana.js` 1.2、`hiraganaListening.js` 1.5。五份 WAV、對應及 WAV URL 版本皆未變，未擴充假名。

## 自動驗證

新增 `node scripts/check-hiragana-ios-tts.js`，執行實際頁面事件處理函式、wrapper 與共用 speech controller，搭配可控制時間的原生事件順序模型：

- 41 個 TTS 假名逐字確認同步解鎖、999 ms 不送出正式語句、1000 ms 正式送出、volume 1、模擬音訊輸出與正常 end，沒有殘留計時器。
- 非同步及同步取消、空白解鎖缺少事件、WAV／TTS 切換、重播、過期錄音／speech 事件、準備中或播放中取消、換題、返回／重入、pagehide。
- 原生 error、沒有 start、start 後沒有 end 的 UI 及計時器收尾。
- 一般句子模式仍無同步解鎖與完成期限，也不取消其他 controller 的語音。

`node scripts/check-hiragana-ios-tts.js --baseline` 會讀取 `origin/main` 的產品原碼作對照；在本次起點 `cfb1b07` 上預期失敗，能看到上述播放中卡住的模型結果。該模式用於修正前後比較，不是應加入綠燈 CI 的指令。

以下 15 項腳本皆通過：

```sh
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

`node --check`（四份變更中的產品 JavaScript）與 `git diff --check` 通過。五母音 WAV 的既有雜湊檢查通過。

Playwright／Chromium 154.0.8037.57 的瀏覽器流程也通過：

- 428×926 手機尺寸、iPhone 使用者代理：五份真實 WAV 均播完；41 個發音頁 TTS 逐字檢查同步解鎖、約 1 秒準備、模型音訊輸出與正常 end。
- 平假名聽音練習完成 46 題並進入下一輪，播放五母音與抽查 か／き／を；另檢查舊錄音完成事件不能取消新 TTS，以及準備中返回首頁後不會晚到播放。
- 桌面模式：發音頁不送空白解鎖；一般日文聽力練習可重播、換題與返回取消準備中的播放，獨立聽力測驗保留每題一次播放。
- 正常流程沒有未捕捉的頁面 JavaScript 錯誤。

瀏覽器的 TTS 使用非同步取消模型，未連接 iOS 原生語音引擎；WAV 使用實際 HTML Audio 解碼播放。測試使用的 iPhone user agent 版本字串只為模擬條件，不代表使用者裝置的 iOS 版本。

## iPhone 13 Pro Max 待驗證

請使用新版本頁面，記錄 iOS 版本，在 Safari 分別驗證：

1. 新開頁面，尚未播放 WAV 時直接點「か」「き」「ん」；約 1 秒後有聲，播放完成狀態正常。
2. 依序播放「あ → か → い → き」，以及快速點同字重播；沒有舊音晚到、疊音或靜音。
3. 聽音練習的母音題與 TTS 題皆有聲；準備中換題、播放中換題、返回首頁、重入後仍能播放。
4. 一般日文聽力練習可重播、獨立測驗每題一次，並保留約 1 秒準備。

Chromium 模擬與 Node 測試無法驗證 iOS AVSpeechSynthesizer、硬體輸出、Safari 音訊 session、裝置語音或實際音量；本 PR 不宣稱已在實體 iPhone 修復驗收。使用者回報的無聲是否完全由上述缺陷造成，仍以該裝置重測為準。
