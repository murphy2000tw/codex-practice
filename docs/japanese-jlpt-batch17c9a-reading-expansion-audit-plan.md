# Batch 17C-9A：JLPT N5／N4 閱讀擴充盤點與 N5 reviewed-source 契約

## 1. 定位、基準與非官方聲明

本批以 PR #298 merge commit `d312db8aa5273d94796237c445d2da6ee53f060e` 為 baseline，只盤點資料並定義後續契約。本站內容僅是 **site-internal JLPT-style（站內 JLPT 風格）練習素材**，不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方認證內容。

本批只新增本文件與專用 checker；不新增 N5 題目、不修改正式題庫、builder、runtime、UI、CSS、cache token，不啟用 N5 reading，不改 N4 現行 14 題，不決定 Batch 17C-10 production quota，也不把 N4 降級、複製成 N5 或大量自動造題。

## 2. 動態 inventory

下列 machine-readable block 由 checker 對正式 source 與 derived bank 重新計算並核對；文件不得反向覆蓋 repository inventory。長度是 `Array.from(displayPassage).length` 的 Unicode code-point 數（包含標點、空白與換行）。偶數筆中位數取中間兩值平均。

<!-- READING_INVENTORY_JSON_START
{"availability":{"N5":{"sets":0,"questions":0},"N4":{"sets":105,"questions":150}},"sourceTypeCount":30,"questionsPerSet":{"minimum":1,"maximum":3},"sections":{"short-passage":{"sets":39,"questions":41,"passageCodePoints":{"minimum":48,"median":59,"maximum":98}},"medium-passage":{"sets":15,"questions":35,"passageCodePoints":{"minimum":64,"median":98,"maximum":118}},"information-search":{"sets":17,"questions":33,"passageCodePoints":{"minimum":49,"median":65,"maximum":87}},"notice-and-message":{"sets":34,"questions":41,"passageCodePoints":{"minimum":56,"median":68.5,"maximum":91}}},"initialManifest":{"sets":10,"questions":14}}
READING_INVENTORY_JSON_END -->

盤點結論是 N5 **0 組／0 題**、N4 **105 組／150 題**、30 種原始 source type。canonical inventory 為 `short-passage` 39 組／41 題、`medium-passage` 15／35、`information-search` 17／33、`notice-and-message` 34／41。每組 1～3 題；set ID 與 question ID 各自全域唯一。每題須有四個非空且互異選項、0～3 的 `answerIndex`、與正解對齊的 `answerDisplay` 及非空 explanation。

`typeToSection` 必須與 builder 固定 `SECTION_TYPES` 白名單完全一致，不能有 unknown source type。N4 initial manifest 是 10 組／14 題；它只是 `17c6-compat-v1` compatibility baseline，不是未來產品 quota。reading quota 的單位是 **answerable questions**，不是 passage／set；canonical identity 是 `(setId, questionId)`。

## 3. Canonical reading taxonomy

資料層只接受四個 canonical section：

* `short-passage`：單一短篇本文理解。
* `medium-passage`：較長、可含多個資訊關係的本文理解。
* `information-search`：由具名結構化材料搜尋、交叉比對資訊。
* `notice-and-message`：公告、通知、留言與訊息；資料層維持獨立 section。

`notice-and-message` 是否納入正式產品 profile／quota 留待 Batch 17C-10；17C-9A 不合併到其他類別，也不啟用它。authoring/source type 可細分內容，但永遠必須明確映射至一個 canonical section。

## 4. 版本化 N5 reviewed-source authoring contract（供 17C-9B）

### 4.1 Set schema

每個人工審閱 set 至少包含：

```text
id, level: "N5", section, sourceType, title, passage, passageKana,
rubyTerms, vocabularyReview, grammarReview, kanjiKanaPolicy,
reviewStatus, reviewVersion, reviewMethod, sourceDigest,
uniqueAnswerReviewSummary, disclaimer, provenance, questions
```

`id` 穩定且全域唯一；`section` 是上述 canonical key，`sourceType` 是 authoring/source type。`reviewStatus` 必須表示逐題人工審閱已完成；`reviewVersion` 版本化；`reviewMethod` 記錄審閱方式。`sourceDigest` 對 canonical source payload 計算，供 drift detection；`vocabularyReview`／`grammarReview` 與 `kanjiKanaPolicy` 記錄 N5 站內 editorial review，而非官方等級認證。`uniqueAnswerReviewSummary` 概述全組唯一答案檢查。`disclaimer`／`provenance` 必須明示站內、非官方來源及作者／審閱來源。

### 4.2 Question schema 與唯一答案證據

每題至少包含：

```text
id, sourceQuestionId, question, questionKana?, options[4], answerIndex,
answerDisplay, explanation, uniqueAnswerReviewed: true, optionReviews[4],
correctAnswerReview, passageEvidence[] | informationEvidence[]
```

四個 options 必須非空、互異並依 index 與四筆 `optionReviews` 對齊；`answerIndex` 為 0～3，`answerDisplay === options[answerIndex]`。`correctAnswerReview` 說明為何指定證據充分支持正解；正解的 option review 標記 supported，另外三筆必須各自提供**具體且不同、可對照本文／材料**的錯誤理由，不能只寫「不正確」。本文題用 passage evidence 與可稽核 evidence span（例如 stable span ID 及 code-point start/end）；資訊檢索題用 stable information-cell／row identity。證據必須讓正解唯一推出，題目不能只靠常識作答。

set/question/sourceQuestion ID 不得依賴 array position、排序、時間、顯示文字或 shuffle 結果；shuffle 只能改 session 顯示位置，不能改 canonical identity。

## 5. N5 passage editorial targets

以下是供站內小型 seed 編審的**非官方 editorial target**，不是官方 JLPT 長度標準。長度一律取 material 的 canonical plain-text projection，以 Unicode code points 計算；包含可見標點、label、換行，排除 ruby reading、HTML／DOM markup、metadata 及題目／選項。structured material 必須以固定 row/column/label 順序投影，digest 與長度使用同一 projection。

| canonical section | 建議 code points | 每組建議題數 | 理由／理解要求 |
|---|---:|---:|---|
| `short-passage` | 35–80 | 1 | 找出本文明示的理由、行動或關係；不可只靠常識 |
| `medium-passage` | 70–130 | 2–3 | 至少有兩項可區分資訊，問題均須引用本文證據 |
| `information-search` | 45–110 | 2–3 | 計入 heading/rows/columns/labels 的 plain-text projection；答案由具名 cells/rows 唯一推出 |
| `notice-and-message` | 35–90 | 1–2 | 辨認對象、時間、條件或後續行動；不可只靠情境常識 |

這些範圍參考現有 N4 動態分布以利工程驗證，但不是把 N4 題目降級或複製。超出 target 的候選不應由 runtime 截斷；應退回 authoring review 並記錄理由。

## 6. 漢字、假名與 ruby 契約

1. 日文顯示文字與 kana snapshot 在 authoring/review 階段逐欄對齊。
2. ruby 只能來自明確 `rubyTerms[{ text, reading }]`；reading 不得包含漢字。
3. runtime 不得猜讀音、自動斷詞或補 ruby。
4. N5 題面漢字必須有明確 ruby term，否則在 authoring 階段改用假名。
5. runtime 不得靜默改寫任何正式文字。
6. ruby coverage 分開稽核日文顯示欄位與中文 explanation／review 欄位；不得把中文漢字當成日文 ruby 缺漏。
7. 所有題庫文字未來只能由 `textContent`、`createTextNode` 等安全 DOM API 顯示，禁止將題庫字串插入 `innerHTML`。

## 7. `information-search` source contract

未來 source 使用 safe-DOM structured material，而不是 HTML 字串或圖片：material 有 stable ID，並提供可稽核 `headings`、`columns`、`rows`、`labels` 或 `blocks` identity；每個 row/cell 具有不因排序或畫面位置改變的 stable ID。每題 `informationEvidence` 明列 evidence cell／row references，正解必須由這些 material evidence 唯一推出。

禁止依靠版面位置、HTML 字串、圖片 OCR 或常識猜測。圖表、時刻表、行程表的所有日文文字同樣接受 kana／ruby audit。responsive/mobile 呈現可由 table 改為 cards，但 labels 與 identity 不變，理解不得依賴固定寬度、左右座標或橫向畫面。本批只定義 contract，不建立正式 information-search 題目。

## 8. Seed capacity 與 product quota 分離

17C-9B 建議的 `seed capacity`（明確 `productQuota: false`）如下：每個 canonical section 至少 2 個 reviewed sets；`short-passage` 至少 2 題、`medium-passage` 至少 4 題、`information-search` 至少 4 題、`notice-and-message` 至少 2 題，合計至少 8 sets／12 answerable questions。

兩組可驗證跨 set identity、section pool 與 deterministic ordering；medium/information 各四題可驗證同 set 多題順序、部分選取、`sourceSetQuestionCount` 與 `selectedSessionQuestionCount`；兩個單題型 section 可驗證一題 set 邊界。這只是 isolated pipeline 的最小 reviewed candidates，不寫入 production profile、不代表正式測驗題數，也不鼓勵大量自動生成。正式固定題數與 product quota 只能由 Batch 17C-10 決定。

## 9. Production isolation 與後續 handoff

`17c6-compat-v1` 必須完全不變：N5 total 20 且 reading `included:false/status:"unavailable"`；N4 total 34 且 reading 14；兩級 listening 都是 `status:"future"/included:false`。policy、derived/source reading、`script.js`、HTML、CSS、歷史 checker、cache token 均不變；不得新增 fetch、import、script tag、storage key、cache API 或 production profile。

* **Batch 17C-9B**：建立小型、逐題人工審閱的 N5 source sets 與 review manifest；不接 runtime。
* **Batch 17C-9C**：建立 deterministic builder、committed derived bank、drift detection 與 data checker；保留既有 N4 source 與 compatibility manifest。
* **Batch 17C-9D**：建立 N5／N4 immutable adapter 與 isolated test profile，驗證 `adapter → normalize → pools → selection → immutable snapshot → balanced answer positions → randomization`；同時驗證同 set 題序、完整 passage metadata、`sourceSetQuestionCount`、`selectedSessionQuestionCount`。
* **Batch 17C-10**：最後才決定 production profile、新題型固定 quota、N5 reading activation 與完整網頁驗收。

17C-9A 到此停止，不自行合併或提前實作後續批次。
