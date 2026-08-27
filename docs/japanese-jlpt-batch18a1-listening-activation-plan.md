# Batch 18A-1：JLPT N5／N4 聽力整合盤點與固定配額規格

## 範圍與非目標

本批次是**盤點、規格與自動檢查**批次。正式 JLPT 的聽力區段仍維持「後續批次開放」；本批次不啟用 listening、不把下列建議寫入正式 quota，也不改動 `script.js`、`style.css`、`japanese/index.html`、正式題庫 JSON、localStorage schema 或任何既有網站行為。以下所有「未來」條款都是後續批次的驗收契約，而非本批次的實作。

## 一、現有題庫盤點

### 數量、等級與 category

`JAPANESE_LISTENING_QUESTIONS` 共 **100 題**：**N5 69 題、N4 31 題**。

| category | N5 | N4 | 合計 |
|---|---:|---:|---:|
| 日常 | 7 | 1 | 8 |
| 交通 | 8 | 1 | 9 |
| 餐廳 | 5 | 2 | 7 |
| 學校 | 5 | 1 | 6 |
| 工作 | 2 | 5 | 7 |
| 時間 | 5 | 1 | 6 |
| 家庭 | 4 | 1 | 5 |
| 購物 | 6 | 0 | 6 |
| 天氣 | 3 | 3 | 6 |
| 旅行 | 2 | 4 | 6 |
| 日常生活 | 2 | 2 | 4 |
| 醫院 / 藥局 | 3 | 1 | 4 |
| 便利商店 | 4 | 0 | 4 |
| 電話 / 約定 | 2 | 2 | 4 |
| 方向 / 地點 | 4 | 0 | 4 |
| 請求 / 許可 | 1 | 3 | 4 |
| 郵局 / 銀行 | 1 | 1 | 2 |
| 圖書館 | 2 | 0 | 2 |
| 飯店 / 住宿 | 1 | 1 | 2 |
| 休假 / 週末 | 1 | 1 | 2 |
| 身體狀況 | 1 | 1 | 2 |
| **合計** | **69** | **31** | **100** |

### ID、欄位與答案契約

* ID 恰為 `jl-001`～`jl-100`，每號各出現一次，沒有重複、缺號或範圍外 ID。
* 每題必須自有且完整提供 `id`、`level`、`category`、`japanese`、`kana`、`zh`、`question`、`options`、`answerIndex`；前八個文字欄位均須為非空字串，`level` 只能是 `N5` 或 `N4`。
* `options` 必須恰有四個非空字串；`answerIndex` 必須是整數 `0`～`3`；而且 `options[answerIndex] === zh`，確保正確中文選項與中文釋義完全一致。

### 正解位置分布

| 範圍 | A（0） | B（1） | C（2） | D（3） | 合計 |
|---|---:|---:|---:|---:|---:|
| 全題庫 | 25 | 25 | 25 | 25 | 100 |
| N5 | 21 | 12 | 22 | 14 | 69 |
| N4 | 4 | 13 | 3 | 11 | 31 |

全庫剛好均衡不代表各等級均衡；未來 session 因此不得沿用原始正解位置，須在衍生層重新排列選項。

## 二、既有功能契約

這些是必須保持不變的回歸基線：

1. 聽力練習的播放按鈕可重複播放同一句日文語音。
2. 練習模式可顯示 `japanese`、`kana` 與 `zh`。
3. 現有獨立聽力測驗固定抽取 **10 題**，仍直接使用現有題庫與既有流程。
4. 返回聽力中頁時，必須清空測驗題目陣列、題號、成績、作答狀態與畫面內容，並取消 `speechSynthesis`；不得殘留上一輪題目或語音。
5. 錯題本繼續以 `module: "listening"`、`questionType: "listeningMeaning"` 及原始 item ID 相容地記錄與查找。
6. Batch 18A-1 不修改既有聽力練習或獨立聽力測驗的抽題、顯示、計分、播放及導覽行為。

## 三、JLPT 聽力未來產品契約

### 唯一固定配額建議

<!-- JLPT_18A1_LISTENING_QUOTA_RECOMMENDATION_START -->
```json
{
  "status": "recommendation-only-not-production",
  "N5": { "listeningQuota": 10, "currentTotal": 20, "futureTotal": 30 },
  "N4": { "listeningQuota": 10, "currentTotal": 34, "futureTotal": 44 }
}
```
<!-- JLPT_18A1_LISTENING_QUOTA_RECOMMENDATION_END -->

唯一建議是 **N5 每次 10 題、N4 每次 10 題**；加入後總題數分別為 **N5 30 題、N4 44 題**。10 題與使用者已熟悉的獨立聽力測驗長度一致，足以形成有意義的聽辨區段，又不會把語音播放造成的整體作答時間無限制拉長。N5 的 69 題庫存可提供約 6.9 個配額量、N4 的 31 題可提供約 3.1 個配額量；每次不重複抽 10 題並在新測驗重抽，可在庫存較小的 N4 仍保有輪替空間。N4 的完整測驗雖增至 44 題，但聽力限制播放次數可使時間上界可預期。

此數字**只能作為後續啟用決策的單一建議**；本批次不得修改正式 JLPT profile、registry、quota、總題數或 UI 狀態。

### 未來抽題、揭露與不可變來源

1. 題目必須按所選 `N5`／`N4` 嚴格分流，session 內不得混入另一級。
2. 作答前不得在 DOM、提示、替代內容或錯誤訊息顯示 `japanese`、`kana`、`zh`、正確答案或可推知正解的 metadata；只能播放 `japanese` 的日文語音，選項維持中文四選一。
3. 正式 JLPT 模式規定**每題最多播放 2 次**，切題後不得回補次數；練習模式仍可不限次重播並顯示日文、假名與中文。兩種模式的播放計數與揭露規則不得共用。
4. 每個新測驗必須重新按級別抽題且 session 內不重複，並重新隨機排列每題四個選項及正解位置。不得原地修改或 freeze 原始 `JAPANESE_LISTENING_QUESTIONS`。
5. 衍生題必須保留不可混淆的 `sourceId`（對應 `jl-NNN`）與來源版本／adapter provenance；隨機排列後仍能追溯原題與原始正確選項。
6. 若瀏覽器不支援 `speechSynthesis`，或無法取得／使用日文語音，JLPT 聽力必須 **fail closed**：停止開始或作答該區段並提供不含題目內容的錯誤訊息；絕不可用顯示 `japanese`、`kana`、`zh` 或答案來替代語音。

### 未來狀態、生命週期與可用性

1. JLPT 與獨立聽力測驗必須使用不同的 session、進度、分數、作答狀態、播放中 utterance 與每題播放計數，不得互相污染，也不得新增不相容的 localStorage schema。
2. 每次「新測驗」都要清掉舊 session、停止舊語音、重新抽題並重新排列答案；不得復用上一輪的題目順序或 option permutation。
3. 返回 JLPT 設定畫面、離開 JLPT、重設或切換級別時，必須立即 `speechSynthesis.cancel()`，清除 utterance 參照與播放計數，且任何晚到的語音 callback 不得改寫新畫面。
4. 播放及四個答案按鈕都必須是可聚焦的原生按鈕，維持鍵盤 Tab／Enter／Space 操作、清楚焦點與 disabled 狀態；手機版須保持可點擊尺寸、無橫向溢出，且不能依賴 hover。

## 四、後續批次拆分

* **Batch 18A-2：題庫來源／immutable adapter 與 provenance** — 從既有常數建立不共享參照的唯讀衍生候選，保留 `sourceId`、來源版本與 canonical correct option；驗證不修改／不 freeze 原題庫。
* **Batch 18A-3：JLPT 聽力隔離 pipeline** — 實作按級別抽題、每輪重抽、答案重排、兩次播放限制、fail-closed capability gate，以及與獨立聽力完全隔離的記憶體狀態與語音生命週期；仍不啟用產品 UI。
* **Batch 18A-4：正式配額及 UI 啟用** — 經審核後才把 N5 10 題、N4 10 題及新總數寫入正式 profile，接上 JLPT UI、計分與設定頁返回流程；此批次才可移除「後續批次開放」。
* **Batch 18A-5：桌機、手機與語音實測驗收** — 在具日文語音與缺少日文語音的瀏覽器驗證桌機／手機、鍵盤、播放上限、切頁取消、重開測驗、揭露時機、狀態隔離及 fail-closed 行為。

## Batch 18A-1 完成門檻

自動檢查必須重新解析實際常數，而不是相信本文件的數字；同時限制本 PR 只能包含本文件與其 checker。通過只表示盤點和未來契約一致，**不表示 JLPT listening 已啟用**。
