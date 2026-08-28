# Batch 18A-3：JLPT 聽力隔離 pipeline 與一次播放生命週期

## 範圍與 isolated session contract

本批建立尚未接入正式 UI 的記憶體內 JLPT listening pipeline。輸入只能是 Batch 18A-2 的完整 immutable candidates 與 `N5`／`N4` 之一；pipeline 會在呼叫 random provider 前完整驗證兩級 inventory、欄位、答案 identity 與唯一 `sourceId`。N5 pool 固定 69 題、N4 pool 固定 31 題，每個 session 嚴格從所選 level 抽出不重複的 **10 題**。資料不足、混級、重複或不完整皆 fail closed，不建立部分 session。

建立順序固定為 **level pool validation → 抽取不重複的 10 題 → selected 10 questions 的 immutable pre-randomization snapshot → balanced answer-position allocation → option randomization**。Snapshot 恰好十題，與最終 questions 的 `sourceId` 集合相同，並保留排列前 options 與 canonical answer。每次建立新 session 先隨機選出四個位置中哪兩個取得第三題，再洗牌十個位置；所以排序固定為 `2、2、3、3`，但不會永久由 A、B 取得三題。Session 題目、options 與 snapshot 都是新建且 deep-frozen 的值，不與來源或 adapter candidate 分享可變參照，也不修改或 freeze `JAPANESE_LISTENING_QUESTIONS`。

## Provenance 與 canonical answer identity

每題保留 `sourceId`、`sourceBank`、`sourceVersion`、`adapterVersion` 與 `canonicalCorrectOption`。`optionPermutation` 記錄「排列後位置 → canonical option index」，`canonicalOptionIdentities` 以 source ID 和 canonical index 提供穩定 identity，因此 permutation 可逆；排列後 `options[answerIndex]` 仍嚴格等於 `canonicalCorrectOption`。這些答案資料只存在隔離 pipeline 內部，不屬於作答前公開資料。

## Capability fail-closed gate

控制器在任何抽題及 random provider 呼叫前，透過可注入 provider 驗證：

1. `speechSynthesis` 存在，且提供 `getVoices()`、`speak()`、`cancel()`；
2. `SpeechSynthesisUtterance` 可建立；
3. `getVoices()` 回傳至少一個語言為 `ja` 或 `ja-*` 的語音。

任一條件失敗只回傳通用、無題目內容的 unavailable 狀態，不建立可作答 session、不顯示文字替代音訊，也不 fallback 到其他語言。Capability wrapper 只 shallow-freeze 自有物件，絕不 freeze、clone 或修改瀏覽器擁有的 `SpeechSynthesisVoice` host object；controller 私下保存 session 開始時通過驗證的日文 voice，播放時直接使用該 voice 而不重新驗證或改用其他語言。可注入邊界讓 Node checker 使用 deterministic voice mocks，不依賴瀏覽器語音。

## 一次播放與 utterance 生命週期

JLPT 每題建立時有一次播放額度。第一次 `requestPlayback()` 會在建立 utterance、`speak()`、`onstart` 或 `onend` **之前**立刻把 `sourceId` 放入 played set；公開 view model 立即回報零次。即使 utterance 建立或 `speak()` 失敗也不退還，後續要求直接拒絕且不再呼叫 `speak()`。只有明確建立全新 session 才建立新的 played set。

控制器持有獨立 generation token、active utterance、active question identity、played source set 與 disposed 狀態。切題、建立新 session、reset、dispose 都使 generation 失效；只有 controller 確實持有自己的 active utterance 時才呼叫 `cancel()`，沒有 ownership 時不會取消練習或獨立測驗的語音。`onstart`、`onend`、`onerror` 只有在 token、utterance identity 與題目 identity 全部仍相符時才能更新狀態，因此晚到 callback 不會污染新 session。

## 三種模式完全隔離

* **Dormant JLPT listening**：使用 factory closure 內的 session、generation、utterance、已驗證 voice 和 played set；每題一次。
* **現有獨立聽力測驗**：使用獨立 mode controller 內的 played set、generation 與 active utterance。第一次點擊立即 disabled；回答後重新 render 同題仍 disabled；下一題有自己的額度；只有「重新開始測驗」重建整組額度。計分、錯題本與固定十題流程不變。
* **現有聽力練習**：使用另一個 practice generation 與 active utterance，不使用 quiz/JLPT played set，仍可不限次播放，並維持顯示 japanese、kana 與 zh。

三者沒有共用播放計數、active utterance 或 callback token。Practice callback 只能更新 practice status，quiz callback 只能更新 quiz status，JLPT callback 只能更新 JLPT provider status；離開模式後的晚到 callback 全部因 token/utterance identity 過期而失效。本批未新增 localStorage、sessionStorage、IndexedDB 或 Cache API 狀態。

## 作答前資料揭露

公開 pre-answer view model 僅包含 level、題號、總題數、opaque `sourceId`、題幹、四個中文 options 與剩餘播放狀態。它不包含 `japanese`、`kana`、`zh`、`canonicalCorrectOption`、正確 `answerIndex`、原始正解位置、`optionPermutation` 或 canonical option identity。Controller 沒有公開 internal-session/testing getter 或任何答案測試後門；checker 直接測試純 session builder。播放所需 japanese 僅留在 controller closure 的內部 session；錯誤狀態同樣不含題目或答案內容。

## 尚未正式啟用

本批沒有把 listening 加入 `JAPANESE_JLPT_PROFILE_REGISTRY` quota，N5／N4 正式總數仍為 **20／34**，listening 仍是 `future`。`buildJapaneseJlptSession()` 與正式開始按鈕沒有呼叫此 pipeline，設定畫面仍顯示「聽力：後續批次開放」，沒有新增 JLPT listening DOM、計分、題庫檔、fetch、dynamic import、script tag 或 storage/cache schema。正式產品啟用留待後續批次。

Batch 18A-2 與本批 checker 預設皆為可長期執行的 regression checker；只有明確設定各自 `JLPT_BATCH18A2_HISTORICAL_SCOPE=1` 或 `JLPT_BATCH18A3_HISTORICAL_SCOPE=1` 時，才檢查當時 PR 的檔案範圍及 cache-token diff。
