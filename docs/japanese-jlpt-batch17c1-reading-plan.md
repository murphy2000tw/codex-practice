# Batch 17C-1：JLPT 閱讀題庫盤點與後續實作規格

> 本站功能只定位為「站內非官方 JLPT 風格模擬測驗」；不是官方 JLPT 題庫，以下數量、分類與選題建議也不是官方配題比例。

## 1. 定位與範圍

Batch 17C-1 只盤點既有閱讀資料、記錄品質狀態，並草擬後續衍生資料與流程規格。本批不修改 runtime、UI、CSS、正式題庫或資料儲存；也不建立正式 JLPT 衍生閱讀題庫。

## 2. 基準與來源

- 必要基準 commit：`41bf7b29e272ad24eed31709192e0cde97a2964a`。
- 唯一盤點來源：`japaneseReadingQuestions.js` 的 `window.JAPANESE_READING_SETS`。
- 該來源仍由既有閱讀功能使用；Batch 17C-1 不得改動它。盤點數字由 checker 直接載入來源計算，而不是手工推測。

## 3. 題庫數量盤點

目前共有 **105 組、150 題**；N4 為 **105 組、150 題**，N5 為 **0 組、0 題**，因此資料是 **N4-only（全部為 N4）**。

### 依 `type` 分布

下表的「組／題」由目前資料實算，名稱保留來源字面值，不將站內分類對應或宣稱為官方 JLPT 題型。

| type | 組數 | 題數 |
| --- | ---: | ---: |
| 短文理解 | 22 | 22 |
| 社區公告 | 2 | 2 |
| ホテル案内 | 1 | 1 |
| 交通通知 | 3 | 4 |
| 活動紹介 | 1 | 1 |
| 伝言メモ | 5 | 5 |
| 学校通知 | 2 | 3 |
| 店家公告 | 2 | 3 |
| 失物招領公告 | 2 | 2 |
| 日記 | 5 | 7 |
| 中短文理解 | 15 | 35 |
| 情報検索 | 14 | 29 |
| 文意推論 | 9 | 9 |
| 使用規則 | 3 | 4 |
| 預約確認 | 1 | 1 |
| 店員說明 | 2 | 2 |
| 店家資訊 | 1 | 1 |
| 宅配通知 | 2 | 2 |
| 交通案内 | 1 | 1 |
| ホテル受付案内 | 1 | 1 |
| 旅行メモ | 1 | 1 |
| 時刻表 | 1 | 1 |
| 分別表 | 1 | 1 |
| 病院案内 | 1 | 1 |
| 店長メモ | 2 | 3 |
| 簡單行程表 | 1 | 2 |
| 図書館公告 | 1 | 2 |
| 映画館公告 | 1 | 2 |
| 活動通知 | 1 | 1 |
| 朋友訊息 | 1 | 1 |

### 每組題數分布

| 每組題數 | 組數 |
| ---: | ---: |
| 1 | 70 |
| 2 | 25 |
| 3 | 10 |

## 4. Schema 與完整性稽核

### 必要欄位與硬性驗證（blocker）

- 閱讀組必要欄位為 `id`、`level`、`type`、`title`、`passage`、`passageKana`、`questions`；題目必要欄位為 `id`、`question`、`options`、`answerIndex`、`explanation`。
- 實算結果中，閱讀組 ID 與跨題庫題目 ID 均唯一；必要文字皆非空，每組有非空 `questions`。
- 每題恰有四個非空且題內不重複的選項；`answerIndex` 是 0 至 3 的整數；`explanation` 皆非空。
- 缺必要欄位、重複 ID、無題組、錯誤選項數、重複選項、答案超界或空解析，均是後續衍生工作的 blocker。此次 checker 未發現 blocker。

### 輔助欄位現況

- `vocabulary`：105/105 組均為非空陣列，供既有閱讀練習的詞彙提示與 ruby 詞源使用。
- `grammarPoints`：105/105 組均為非空陣列，供既有閱讀練習的文法說明使用。
- `rubyTerms`：105/105 組均為非空陣列，明確補充 ruby 對應。
- `titleRuby`、`passageRuby`：105/105 組均為非空字串，是標題與本文的 ruby／假名輔助快照。
- 這些是既有閱讀練習的資料，不代表未來 JLPT 模擬題面應全部顯示 ruby；衍生資料必須另行明定題面政策。

### Warning 與非阻擋性品質觀察

- **Warning：**現有 `type` 有中、日文命名混用，而且分類粒度不一；本批保留原值，17C-2 需以固定映射／白名單建立可稽核 section，不可由 runtime 猜測。
- **Warning：**既有 ruby checker 明確只檢查安全詞彙處理，並不要求完整漢字覆蓋；因此通過不等於 ruby 或程度已由人工逐字認證。
- **品質觀察（非 blocker）：**各組題數為 1 至 3 題且分布不均，後續抽組應以「材料＋所屬問題」為單位，而非硬湊題數。
- **品質觀察（非 blocker）：**本批做結構與可衍生性稽核，不把語意正確性、官方難度或官方比例宣稱為已驗證。

## 5. N4 可用性評估

結論為 **可有條件進入 Batch 17C-2 的版本化衍生題庫工作**：105 組／150 題通過上述結構 blocker，數量足以設計一個站內 N4 初版池；但這不表示題型數量、難度或比例符合官方 JLPT。

目前沒有結構 blocker 的受影響 ID。需後續處理的 warning 適用於全部 reading set：`type` 命名／粒度需固定映射，ruby 與漢字政策需在產生階段驗證。若 17C-2 的人工語意或漢字審查發現特定資料問題，必須列出 reading-set ID、question ID、問題種類與排除／修正策略，另開資料修正批次；不可在 17C-1 直接修題。

## 6. N5 缺口政策

- 現況沒有 N5 閱讀題庫（0 組、0 題）。
- 禁止把 N4 閱讀題混入 N5 閱讀區或冒充 N5。
- 後續 JLPT 閱讀設定中，N5 閱讀必須顯示「題庫尚未準備完成」或保持不可選。
- Batch 17B-2 已完成的 N5 單字／文法測驗仍可使用；不得因閱讀缺口而整體停用 N5。
- N5 閱讀題庫必須另開專門批次建立，不在 Batch 17C-1 製作。

## 7. JLPT 閱讀衍生資料契約草案

下一批資料頂層至少帶 `schemaVersion`、`policyVersion`、`sourceCommit`，另含非官方聲明與 `readingSets`。每個衍生閱讀組至少包含：

- `id`、`level`、`section`、`type`
- `displayTitle`、`displayPassage`、`passageKana`
- `rubyTerms`、`kanjiPolicy`、`sourceSetId`
- `questions`

每題至少包含 `id`、`displayText`、`options`、`answerIndex`、`answerDisplay`、`explanation`、`sourceQuestionId`。ID 與 source ID 必須穩定且可回溯，產生器輸出須可重現。

題面不得由 runtime 猜測漢字難度；產生／審查階段須依 `policyVersion` 固定 `displayTitle`、`displayPassage`、題目和選項。Ruby 必須由資料明確指定，runtime 僅以 `document.createElement`、`textContent` 等安全 DOM 節點組裝；禁止將任何題庫字串直接插入 `innerHTML`。

## 8. 後續測驗流程草案

### 可實作、可稽核的初版選題

N4 閱讀材料與其 `questions` 必須作為不可拆散的單位。根據實際分布，初版可固定取 10 組：`短文理解` 3 組、`中短文理解` 2 組、`情報検索` 2 組、`文意推論` 2 組，再從其餘有資料的 type 取 1 組。這只是站內涵蓋不同來源 type 的工程方案，不是官方 JLPT 配題。

17C-2 應產出依 `type`、`sourceSetId` 排序的 manifest；17C-3 可採 manifest 固定順序，或使用明確 seed 加上版本化 deterministic shuffle。後備 type 的輪替也須由 seed 與排序決定，使相同題庫版本和 seed 可重現，禁止 runtime 使用不可稽核的 `Math.random()` 結果。因各組有 1 至 3 題，畫面應顯示實際組數與題數，不以拆題湊固定題數。

### 狀態轉換

1. 答題前：顯示材料、題目與四個可操作選項；尚未作答時不顯示答案／解析。
2. 答題後：鎖定該題選項、標示選擇與正解、顯示 `answerDisplay` 和解析，並把 focus 移至回饋摘要。
3. 下一題：同材料尚有題目時前進到下一題；材料題目完成後才前進到下一組。
4. 完成：顯示本次閱讀區已完成及返回設定頁按鈕，不在本批規劃成績結果。
5. 返回設定頁：明確清除記憶體中的未完成 session，必要時先確認；本規格不寫入持久儲存。

本批不實作計分、計時、結果頁、錯題本、生字本或 LocalStorage。

## 9. 顯示與無障礙規格

- 長文維持易讀行高與合理行寬；題目置於所屬材料內，四個選項完整顯示；作答後才顯示正解與解析，不能只靠顏色傳達對錯。
- 手機版材料、長字串與選項必須換行，頁面不得出現橫向捲動。
- 四個選項必須使用原生 `button`，具可見鍵盤 focus；Tab 順序依材料內題目與選項順序，Enter／Space 可作答，鎖定後不得重複提交。
- 作答回饋使用適當 `aria-live`（建議 `polite`）；下一題後 focus 回到新題標題，完成後移至完成標題。狀態與控制需有可理解的 accessible name。
- 既有閱讀**練習**可依 `vocabulary`、`rubyTerms`、`titleRuby`、`passageRuby` 提供學習輔助；JLPT 模擬**題面**則只能依版本化衍生資料的 `display*`、`rubyTerms` 與 `kanjiPolicy` 顯示，不能沿用「全部加 ruby」或 runtime 猜測規則。

## 10. 後續批次拆分

### Batch 17C-2

建立版本化 N4 JLPT 衍生閱讀題庫、deterministic 產生器與資料 checker；完成 type-to-section 映射、漢字／ruby 政策與來源追溯，但不接 runtime。

### Batch 17C-3

把 N4 閱讀區接入 JLPT 測驗流程，落實綁組、可重現選題、安全 DOM 與無障礙狀態；N5 閱讀維持不可用並顯示缺口，不影響 N5 單字／文法。

若人工或資料 checker 發現必須修正 `japaneseReadingQuestions.js`，需另列資料修正批次，列明受影響 ID 與回歸範圍，不可偷偷併入 17C-1 或衍生批次。

## 11. 明確不做事項

- 不修改現有閱讀題目或其他正式題庫，不新增 N5 閱讀題。
- 不修改 UI、runtime、CSS、聽力或句子重組。
- 不變更任何 cache token。
- 不新增或變更 LocalStorage key／schema。
- 不加入計時、計分、結果頁、錯題本或生字本。
- 不修改、刪除或弱化歷史 checker。
