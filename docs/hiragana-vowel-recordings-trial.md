# 平假名五母音錄音試接入

完成範圍：平假名發音頁與平假名聽音練習共用「あ、い、う、え、お」五段錄音，其餘 41 字繼續使用既有語音合成。沒有新增濁音、半濁音、拗音或片假名。

## 錄音檢查與切分

附件為 48 kHz 單聲道 AAC，容器長度 89.322667 秒；在 −35 dB、最短停頓 250 ms 的設定下，整份錄音約有 46 段發聲，並非只有五段。本次只取開頭五段，依使用者明示的「あ、い、う、え、お」順序，另以波形及母音共振峰特徵核對；後續發聲不推定對應字元，也未接入。

前五段主要發聲約在 1.164–1.435、3.147–3.430、5.415–5.669、7.348–7.629、9.417–9.615 秒（−35 dB 偵測範圍）。發聲間停頓約 1.68–1.98 秒，可可靠分隔。另檢查 −45 dB 訊號及波形，保留低音量起音與衰減尾音後，採用以下範圍：

| 字元 | 專案音檔 | 來源起訖（秒） | 長度（秒） |
| --- | --- | --- | --- |
| あ | `japanese/audio/hiragana/a.wav` | 0.950–1.750 | 0.800 |
| い | `japanese/audio/hiragana/i.wav` | 2.950–3.850 | 0.900 |
| う | `japanese/audio/hiragana/u.wav` | 5.200–6.100 | 0.900 |
| え | `japanese/audio/hiragana/e.wav` | 7.150–7.950 | 0.800 |
| お | `japanese/audio/hiragana/o.wav` | 9.200–9.850 | 0.650 |

時間基準為解碼後第一個音訊樣本設為零；原 AAC 串流起始時間為 0.044 秒。輸出為 48 kHz 單聲道 PCM16 WAV，直接從解碼樣本切取，未加減增益、降噪、淡入淡出或改變速度。五段皆通過與完整來源解碼樣本逐位元比對。每段首尾 50 ms 的 RMS 皆低於 0.005（滿刻度 1.0），切點位於低音量區。

`japanese/audio/hiragana/manifest.json` 記錄來源雜湊、各段切點、長度、輸出雜湊及處理方式。重製單一片段可執行：

```sh
ffmpeg -i INPUT.m4a -map 0:a:0 \
  -af 'asetpts=PTS-STARTPTS,atrim=start=0.95:end=1.75,asetpts=PTS-STARTPTS' \
  -c:a pcm_s16le -ar 48000 -ac 1 -map_metadata -1 a.wav
```

## 接入與版本

- 新增共用 `japanese/hiraganaAudio.js?v=1.0`，五個 WAV URL 均帶 `?v=1.0`。
- 發音頁資源更新為 `hiragana.js?v=1.1`，聽音練習為 `hiraganaListening.js?v=1.4`。
- 錄音在點擊處理當下直接呼叫 `Audio.play()`，不依賴裝置是否有日文合成語音。其他字保留既有 TTS 與聽音練習 iOS 解鎖設定。
- 重播、換字、換題、離頁會停止該頁持有的播放；舊播放事件及 Promise 錯誤不會覆蓋新狀態。啟動逾時或載入失敗會顯示可重試提示，不改播合成母音。

## 驗證結果

以下檢查全部通過：

```sh
node scripts/check-hiragana-audio.js
node scripts/check-hiragana-listening.js
node scripts/check-japanese-main-entry.js
node scripts/check-japanese-view-isolation.js
node scripts/check-japanese-listening-audio-start.js
git diff --check
```

新增音訊檢查涵蓋五份 WAV 的格式、雜湊、長度、首尾低音量區、僅五母音對應錄音、其餘 41 字轉交原 TTS、點擊同步啟動、重播與取消、過期事件、播放失敗及啟動逾時。既有題目檢查涵蓋 33,000 題、100 完整輪、46 字題池、四個選項位置及 お／を 干擾選項排除。

另以本機 HTTP 伺服器及 Playwright／Chromium 實際載入頁面：

- 桌面模式、無日文 TTS 語音：兩個頁面的五段真實 WAV 皆觸發播放完成事件，URL 完全相同，未呼叫 TTS；快速換字及切回首頁會停止前段錄音。
- 手機尺寸與 iPhone 使用者代理：五段在兩頁可播放，完成 46 題並進入第 47 題，每題四選項；抽查 か／を 仍走 TTS，聽音練習保有既有手勢解鎖路徑。
- 模擬錄音 HTTP 404：顯示錯誤並清除播放樣式；恢復資源後再次點擊可播放完成。
- 正常流程無瀏覽器 JavaScript 未捕捉錯誤。

手機驗證使用 Chromium 模擬，未在實體 iPhone Safari 執行。變更已在本機專案完成，尚未部署。
