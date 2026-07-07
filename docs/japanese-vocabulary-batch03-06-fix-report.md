# Japanese Vocabulary Batch 03～06 Fix Report

## 1. 任務目的

依據前階段品質檢查報告，針對 Batch 03～06 中列為 Review / FixLater 且本次指定優先處理的日文單字資料，進行小範圍、可控的 `vocabulary.json` 修正。目標是降低測驗選項同義重疊風險、改善台灣繁體中文自然度，並維持資料筆數、id 順序與網站功能穩定。

## 2. 檢查日期

- 2026-07-07

## 3. 依據來源

- `docs/japanese-vocabulary-batch03-06-quality-check.md`
- 特別依據該報告「17. 下一階段修正建議」列出的 id 3159、3162、3167、3177、3174、3178。

## 4. 本次修正範圍

本次僅檢查並處理以下 `vocabulary.json` 詞條：

1. id 3159：`留守番電話`
2. id 3162：`お腹`
3. id 3167：`利用`
4. id 3177：`着く`
5. id 3174：`登録`
6. id 3178：`運動センター`

本次未新增單字、未刪除單字、未重排 id，且未修改英文頁面或日文功能程式。

## 5. 修正前問題摘要

| id | word | 修正前問題 |
|---:|---|---|
| 3159 | 留守番電話 | 與既有 id 1843 `留守電` 高度同義，測驗中可能與「電話留言」類選項混淆。 |
| 3162 | お腹 | 與既有 id 1558 `腹` meaning 同為「肚子」，測驗唯一正解風險較高。 |
| 3167 | 利用 | 與既有 id 2303 `利用する` 形成名詞 / 動詞重複；原詞性標示為 `名詞/する動詞`，與動詞詞條界線不夠清楚。 |
| 3177 | 着く | 與既有 id 2319 `到着する` meaning 同為「到達」，測驗唯一正解風險較高。 |
| 3174 | 登録 | exampleMeaning「使用前請登錄姓名。」語意可理解，但台灣自然用語中「登記姓名」更符合填資料 / 登記名冊語境。 |
| 3178 | 運動センター | kana / exampleKana 保留 `センター` 片假名，需確認是否符合既有資料規格。 |

## 6. 逐 id 確認與修改結果

### id 3159：留守番電話

- 既有相近詞：id 1843 `留守電`，meaning 為「電話留言」。
- 判斷：`留守番電話` 是完整說法，可偏向答錄機或語音留言服務；`留守電` 是常見縮略語，可保留為電話留言概念。
- 是否修改：有。
- 修改前：
  - meaning：`留言電話、答錄機`
  - example：`留守番電話にメッセージを残しました。`
  - exampleKana：`るすばんでんわにメッセージをのこしました。`
  - exampleMeaning：`在答錄機裡留下了訊息。`
- 修改後：
  - meaning：`答錄機、語音留言服務`
  - example：未修改
  - exampleKana：未修改
  - exampleMeaning：未修改
- 調整欄位：meaning。
- 理由：將完整詞 `留守番電話` 聚焦為設備 / 服務名稱，避免與 `留守電` 的「電話留言」完全同義。

### id 3162：お腹

- 既有相近詞：id 1558 `腹`，meaning 為「肚子」。
- 判斷：`お腹` 是較常用、較柔和的「肚子」說法；`腹` 可保留為較直接或較書面的基本詞。
- 是否修改：有。
- 修改前：
  - meaning：`肚子`
  - example：`お腹が痛いので、少し休みます。`
  - exampleKana：`おなかがいたいので、すこしやすみます。`
  - exampleMeaning：`因為肚子痛，所以休息一下。`
- 修改後：
  - meaning：`肚子、腹部`
  - example：未修改
  - exampleKana：未修改
  - exampleMeaning：未修改
- 調整欄位：meaning。
- 理由：保留「肚子」核心意思，同時補入「腹部」讓單字卡與 `腹` 不完全相同；例句已自然呈現日常口語用法，因此不改例句。

### id 3167：利用

- 既有相近詞：id 2303 `利用する`，partOfSpeech 為 `動詞`，meaning 為「利用」。
- 判斷：本詞條可保留為名詞 `利用`，但不宜再標成 `名詞/する動詞`，否則與既有動詞詞條 `利用する` 重複程度過高。
- 是否修改：有。
- 修改前：
  - meaning：`利用、使用`
  - partOfSpeech：`名詞/する動詞`
  - example：`図書館を利用するにはカードが必要です。`
  - exampleKana：`としょかんをりようするにはカードがひつようです。`
  - exampleMeaning：`要使用圖書館需要卡片。`
- 修改後：
  - meaning：`使用、利用`
  - partOfSpeech：`名詞`
  - example：`施設の利用は午後九時までです。`
  - exampleKana：`しせつのりようはごごくじまでです。`
  - exampleMeaning：`設施的使用到晚上九點為止。`
- 調整欄位：meaning、partOfSpeech、example、exampleKana、exampleMeaning。
- 理由：將 id 3167 明確定位為名詞用法，並以 `施設の利用` 呈現名詞性例句，降低與動詞 `利用する` 的測驗重複風險。

### id 3177：着く

- 既有相近詞：id 2319 `到着する`，meaning 為「到達」。
- 判斷：`着く` 是基礎動詞，適合譯為較簡潔的「到、抵達」；`到着する` 可保留為較正式的「到達」。
- 是否修改：有。
- 修改前：
  - meaning：`到達`
  - example：`荷物は明日の午後に着く予定です。`
  - exampleKana：`にもつはあしたのごごにつくよていです。`
  - exampleMeaning：`包裹預計明天下午到達。`
- 修改後：
  - meaning：`到、抵達`
  - example：未修改
  - exampleKana：未修改
  - exampleMeaning：`包裹預計明天下午送到。`
- 調整欄位：meaning、exampleMeaning。
- 理由：meaning 不再與 `到着する` 完全相同；例句中文改為更符合包裹情境的「送到」。

### id 3174：登録

- 判斷：日文例句 `利用する前に名前を登録してください。` 是使用前填資料 / 登記姓名的語境，不是帳號「登入」。台灣自然用語以「登記姓名」較適合。
- 是否修改：有。
- 修改前：
  - exampleMeaning：`使用前請登錄姓名。`
- 修改後：
  - exampleMeaning：`使用前請登記姓名。`
- 調整欄位：exampleMeaning。
- 理由：避免只因 `登録` 固定翻成「登錄」，改採更符合例句語境的台灣繁體中文。

### id 3178：運動センター

- 既有資料規格確認：`vocabulary.json` 中已存在多筆 kana / exampleKana 保留片假名或混合平假名與片假名的資料，例如 `カード払い`、`忘れ物センター`、`クリーニング店`、`ヨガ教室` 等。
- 判斷：`センター` 為外來語片假名，word、kana、example、exampleKana 中保留片假名符合目前資料實務；不應為了形式統一盲目改成平假名。
- 是否修改：否。
- 不修改理由：現有資料允許 kana 欄位混用平假名與片假名；`うんどうセンター` 與 `しゅうまつにうんどうセンターでおよぎます。` 可清楚呈現讀音與外來語原形。
- 調整欄位：無。

## 7. 欄位調整總覽

| id | meaning | partOfSpeech | example | exampleKana | exampleMeaning | kana |
|---:|---|---|---|---|---|---|
| 3159 | 有 | 無 | 無 | 無 | 無 | 無 |
| 3162 | 有 | 無 | 無 | 無 | 無 | 無 |
| 3167 | 有 | 有 | 有 | 有 | 有 | 無 |
| 3177 | 有 | 無 | 無 | 無 | 有 | 無 |
| 3174 | 無 | 無 | 無 | 無 | 有 | 無 |
| 3178 | 無 | 無 | 無 | 無 | 無 | 無 |

## 8. 資料完整性確認

- 已確認 `vocabulary.json` 可正常 JSON parse。
- 已確認 `vocabulary.json` 仍為 3179 筆。
- 已確認 id 不重複。
- 已確認 word 不重複。
- 已確認 id 3146～3179 全部仍存在。
- 已確認 id 3146～3179 仍共 34 筆。
- 已確認必要欄位皆存在且非空：`id`, `level`, `word`, `kana`, `meaning`, `partOfSpeech`, `example`, `exampleKana`, `exampleMeaning`。
- 已確認 N5 / N4 筆數仍為 N5：1000、N4：2179。
- 已確認本次沒有新增或刪除單字。
- 已確認本次沒有重排 id。
- 已確認沒有修改英文頁面。
- 已確認沒有修改日文功能程式。

## 9. 執行過的檢查指令與結果

| 指令 | 結果 | 備註 |
|---|---|---|
| `python3 -m json.tool vocabulary.json >/dev/null` | Pass | JSON 可正常解析。 |
| `node --check script.js` | Pass | JavaScript 語法檢查通過。 |
| `node scripts/auditSiteHealth.js` | Pass | Site health audit passed，Japanese vocabulary cards 為 3179。 |
| `node scripts/check-japanese-vocabulary-menu.js` | Pass | Japanese vocabulary menu audit passed。 |
| `node scripts/check-japanese-vocabulary-view-split.js` | Pass | Japanese vocabulary view split audit passed。 |
| `node scripts/check-japanese-main-entry.js` | Pass | Japanese main entry audit passed。 |
| `node scripts/check-japanese-view-isolation.js` | Pass | Japanese view isolation audit passed。 |
| 一次性 Python 檢查 | Pass | 確認總數 3179、id 3146～3179 全部存在且共 34 筆、指定 id 仍存在、必要欄位完整、無重複 id、無重複 word、N5/N4 數量維持 1000/2179、id 順序未重排。 |

## 10. 仍需人工確認的項目

- id 3178 `運動センター` 本次已依現有資料實務判定不修改；若未來制定更嚴格的 kana 全平假名政策，才需要全庫一致性規格討論。
- 其他未納入本次指定範圍的 Review 項目，例如複合詞是否適合作為獨立 N4 單字卡，仍可於後續批次整體整理時再評估。

## 11. 後續建議

1. 若測驗選項產生邏輯未來可調整，建議避免同題出現高度相近詞，例如 `留守番電話` / `留守電`、`お腹` / `腹`、`着く` / `到着する`。
2. 若要統一外來語 kana 政策，建議先制定全庫規格，再批次處理，不要單點修改 `センター`。
3. 後續若繼續處理 Batch 03～06 的其他 Review 項目，仍應維持小範圍、可回溯、不中斷功能的修正方式。
