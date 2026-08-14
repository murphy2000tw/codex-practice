# Batch 17C-9B：N5 reading reviewed source 與 review manifest

## 定位與聲明

本批以 PR #299 merge commit `c2ffbac1e219edf9e9640475f0053fa54f246163` 為固定 baseline，依 17C-9A 契約建立小型、逐組逐題人工審閱的 N5 reading source seed。全部內容只標示為 **site-internal JLPT-style（站內 JLPT 風格）**；不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方認證內容，也未從既有 N4 題目複製、降級或改寫。

本批只有 reviewed source、review manifest、checker 與本文件；不建立 builder 或 derived bank，不接 adapter/runtime，不修改 UI、cache、storage、production profile，也不啟用 N5 reading。

## 精確 inventory 與八組主題

此 inventory 是 `seedCapacity: true`、`productQuota: false` 的編審容量，不是正式測驗 quota。reading quota 的單位是 answerable question。

| section | sets | questions | 主題 |
|---|---:|---:|---|
| `short-passage` | 2 | 2 | 麵包店早餐採買；雨天取消公園行程 |
| `medium-passage` | 2 | 4 | 搭車前的早晨時間安排；全家海邊出遊與分工 |
| `information-search` | 2 | 4 | 圖書館開館時間；水果店價格比較 |
| `notice-and-message` | 2 | 2 | 學校遠足通知；家中咖哩留言 |
| **合計** | **8** | **12** | 八個不同日常情境 |

每組不是只替換人名、日期、數字或地點的近似重複。內容限制在日常生活、家庭、學校、購物、交通、時間與簡單活動，答案都由本文或材料明示資訊推出。

## Passage 長度

長度一律用 `Array.from(canonicalPlainText).length` 計算 Unicode code points。計入可見標點、label 與換行；排除 ruby reading、HTML/DOM markup、metadata、問題及選項。source 的八組實際長度依序為 44、43、80、86、55、46、64、59 code points，分別落在以下 editorial targets：

* `short-passage`：35–80
* `medium-passage`：70–130
* `information-search`：45–110
* `notice-and-message`：35–90

超長內容不得交給 runtime 截斷，必須退回編審。

## Reviewed-source 與 manifest schema

`japaneseJlptReadingN5ReviewedSource.json` 使用 `schemaVersion: "1.0.0"`、`sourceVersion: "17c9b-v1"`、`reviewVersion: "17c9b-review-v1"`。set 記錄 stable identity、canonical section、本文/kana、ruby、語彙/文法/漢字政策、review 狀態/方法/版本、digest、唯一答案摘要、聲明、來源與 questions。set/question/sourceQuestion ID 都是語意 slug，不依賴 array position、排序、時間戳、顯示文字或 shuffle。

每題有四個互異非空選項、`answerIndex`、相符的 `answerDisplay`、解說、四筆按 index 對齊的 `optionReviews`、正解審閱與 evidence。`uniqueAnswerReviewed: true` 表示逐題確認完成。

`japaneseJlptReadingN5ReviewManifest.json` 使用同一 source/review version 與 `manifestVersion: "17c9b-v1"`，記錄精確 inventory。每組 record 保存完整 `sourceSnapshot`、digest、identity、review metadata、question IDs 與 reviewer rationale；snapshot 必須與 source set canonical equality。

## Source digest canonicalization

每個 `sourceDigest` 是 SHA-256，固定規則如下：

1. 複製完整 set。
2. 只移除最上層 `sourceDigest` 欄位。
3. 遞迴按 Unicode key 字串固定排序所有 object keys。
4. 保留所有 array 順序，因 questions、options、evidence 與 material 順序具有語意。
5. 以無額外空白的 canonical JSON 序列化，對其 UTF-8 bytes 計算 SHA-256 小寫十六進位值。

checker 重新計算 digest，並同時核對 manifest digest 與完整 snapshot，以偵測任何漂移。

## 唯一答案與 evidence contract

編審者逐題以 evidence 對照問題條件、正解與每個錯項。正解 review 說明證據為何充分；三個錯項各自指出與本文/材料中不同資訊的衝突或缺漏，不接受「不正確」「不符合題意」等泛用文字、空白或重複理由。中文 explanation 必須和日文正解、引用證據一致，且不得產生第二個合理答案。

一般本文題的 `passageEvidence` 使用 set 內唯一 stable `spanId`、`text`、`startCodePoint`、`endCodePoint`。offset 是半開區間；checker 以 `Array.from(passage).slice(start, end).join("")` 驗證有效整數、界線與逐字相等，每題至少引用一段。

資訊檢索題的 `informationEvidence` 引用實際存在的 stable row/cell ID，不引用「第幾列」、左右、座標或 responsive layout。每題至少引用一筆足以唯一決定答案的 row/cells。

## Information-search projection

資訊材料是 safe-DOM structured data，包含 stable material ID、`type`、headings、columns、rows、stable row/cell ID、label/text 與 kana；不是 HTML 字串、圖片、OCR 或版面座標。canonical `plainTextProjection` 的順序固定為：

1. 第一個 heading label；
2. 一行 column labels，以全形 `｜` 連接；
3. 按 source array 順序逐 row 投影 cell text，每 row 以全形 `｜` 連接；
4. 各行以 `\n` 連接，不加尾端換行。

`passage` 必須逐字等於 projection。將 table 改呈 mobile cards 時，row/cell identity、labels 與理解方式仍不變；未來只能用 `textContent`、`createTextNode` 等安全 DOM API 呈現。

## Ruby、漢字與假名政策

本 seed 的日文顯示欄位採平假名、片假名與標點，因此 `rubyTerms` 可明確為空，runtime 不必也不得猜讀音、自動斷詞或補 ruby。`passageKana` 與 passage 逐內容及標點對齊；questions 也保存 `questionKana`。若後續編審引入漢字，該日文顯示欄位的每個漢字必須由 `{ text, reading }` 明確覆蓋，且 reading 不得含漢字；structured material 的漢字 label/cell 也必須有 kana。ruby audit 只掃日文顯示欄位，不掃中文 explanation、review 或 provenance。

資料禁止 HTML tag、event handler 與可執行字串；runtime 不得靜默改寫內容。

## Production isolation 與 handoff

Production 完全不載入本批 source/manifest。`17c6-compat-v1` 維持 N5 total 20，reading `included: false` / `status: "unavailable"`；N4 total 34（含既有 reading 14）。既有 N4 source、derived bank、compatibility manifest、`script.js`、HTML、CSS、cache token、storage API 與 production profile均不變。

* **17C-9C** 才建立 deterministic builder、committed derived N5 bank、drift detection 與 data checker。
* **17C-9D** 才建立 immutable adapter 與 isolated reading pipeline。
* **Batch 17C-10** 才能決定 production quota 與是否啟用 N5 reading。

專用 checker 以固定 baseline 執行 scope/byte-identity guard，直接讀取 source、manifest、17C-9A plan 與兩份既有 N4 reading data；另外將 44 個 in-memory negative fixtures 真正逐一送入同一 validator 並要求全部被拒絕。fixtures 涵蓋 inventory、identity、長度、答案審閱、digest/snapshot、evidence、structured material、ruby、安全性、N4 重用及 quota 邊界。
