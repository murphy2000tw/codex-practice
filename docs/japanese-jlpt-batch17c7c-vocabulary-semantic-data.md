# Batch 17C-7C：N5／N4 paraphrase 與 N4 usage 語義 seed data

## 定位與邊界

本批是 **site-internal editorial-reviewed** 的站內編輯整理資料，不代表日本語能力試驗主辦單位提供的內容，也不代表外部語言專家背書。三個 pool 各 12 題只是 data inventory／seed capacity，**不是**正式測驗 quota；正式 quota 留到 Batch 17C-10 決定。

本批固定包含 N5 paraphrase 12、N4 paraphrase 12、N4 usage 12，共 36 題。N5 usage 明確不在產品規劃內，inventory 必須維持 0。資料沒有接入 production session；`script.js`、HTML、CSS、compatibility profile、runtime、UI 與 storage 均不變。Batch 17C-7D 才處理 adapter 與隔離 profile，且不得藉由 level 或 questionType fallback 補題。

## 編輯方法與 provenance

兩份 manifest 逐題保存 `vocabulary.json` 的 canonical `sourceId`、完整 `sourceSnapshot`、版本化審閱 ID、四項判定與個別錯因。paraphrase 的正解若不是母庫詞，`equivalentSource.kind` 明列為 `authored-expression`，且 `sourceId` 為 `null`，避免捏造來源。全部 Kana 欄位均為不含 Han 字的完整假名。usage 的每句都保存完整 `sentence`／`sentenceKana`，並分別以明確的 `[start, end)` 與 `[kanaStart, kanaEnd)` 對齊唯一一次 target 表面形式及讀音。

paraphrase 不能由中文 `meaning` 自動推導：相同翻譯可能忽略及物性、語域、搭配、程度或多義分支。每題因此提供完整句境與 `interchangeabilityScope`，只核准該範圍內的等義改述。usage 錯句也不是機械改助詞、活用或錯字；三個錯句保留可解析的句法外框，錯誤集中在可信的詞義角色、搭配或使用範圍，並逐句記錄原因。

## Stable ID 與 deterministic build

derived `id` 對下列 identity 做 SHA-256 並取固定長度摘要：

```text
jlpt-vocab-17c7c-v1 | level | questionType | canonical sourceId | authoringId
```

因此 ID 不依陣列位置；在 manifest 插入其他 record 不會改變既有題目的 ID。`sourceQuestionId` 同時保留母庫、canonical source ID、題型與 authoring ID。builder 使用明確 comparator，不使用亂數、時間戳或環境排序；驗證全部 records 後才以暫存檔 rename 寫入，任何 record 失敗均不覆寫 derived bank。

```bash
node scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js
node scripts/build-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js --check
node scripts/check-japanese-jlpt-batch17c7c-vocabulary-semantic-data.js
```

`--check` 將記憶體重建 bytes 與真正 committed output 比較。checker 動態重讀 source、兩份 manifest 與 derived bank，確認連續 build bytes 相同，並用 `finally` 還原 output drift fixture。負向 fixtures 涵蓋 missing source、snapshot drift、level/type mismatch、record 放錯 manifest、N5 usage、review metadata／review ID 缺漏或重複、選項／句子重複、多重正解、review status、完整假名、錯因索引集合、雙側 occurrence 錯位、兩種 fallback、array-position ID 與 committed drift。scope base 依序解析環境指定 ref、`origin/main`、`main` 與固定 base commit，再以實際 merge-base 到 HEAD 執行 scope guard；checker 另建立只有 `origin/main`、無本地 branch 的 detached checkout 執行自身，並只允許本批六個檔案。

## 完整代表例題

以下例題文字與 manifest 一致；完整逐項錯因及 provenance 仍以 manifest 為準。

### N5 paraphrase（2 題）

1. 題幹：「駅に着いたら、**すぐ**電話してください。」最接近的改述是「ただちに電話してください」。scope 只涵蓋抵達車站後立即打電話；「あとで」「ゆっくり」與「手紙を書いて」分別改變時間、方式或行為。
2. 題幹：「掃除したので、部屋は**きれい**です。」最接近的改述是「清潔です」。scope 鎖定打掃後的清潔狀態；「にぎやか」「狭い」「古い」描述聲音、空間或年代，均不等義。

### N4 paraphrase（2 題）

1. 題幹：「旅行にはパスポートが**必要**です。」最接近的改述是「パスポートが要ります」。scope 是旅行文件需求；「余ります」「捨てます」「壊れます」分別表示剩餘、丟棄或損壞。
2. 題幹：「雨でも練習を**続けます**。」最接近的改述是「練習をやめずに行います」。scope 是下雨仍不中止練習；中止、只看一次或不開始都改變事件。

### N4 usage（2 題）

1. target `経験`：正解「海外で働いた経験があります。」三個可解析的錯句分別把「経験」誤作行き方、每日練習活動及對初次見面者所做的動作；各句有針對語意角色的獨立理由與雙側 occurrence index。
2. target `利用`：正解「図書館のパソコンを利用できます。」三個可解析的錯句分別混淆修理、把使用資源與查詢對象的角色倒置，以及用「利用」代替詢問；答案不依賴錯字、助詞亂改或破碎活用。

## 隔離結論

derived bank 只由兩份 manifest 產生，尚未被任何 production JavaScript 或 HTML 載入。`17c6-compat-v1` 仍維持 N5 20 題、N4 34 題，compatibility vocabulary 仍只使用 `meaning`；本批沒有新增 storage API 或 schema。所有審閱來源標示一律為 **site-internal editorial-reviewed**。
