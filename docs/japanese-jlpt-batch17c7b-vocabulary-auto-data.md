# Batch 17C-7B：JLPT 單字自動衍生題型資料

## 定位、聲明與容量

本批建立**隔離、尚未接入 production session** 的單字 seed bank。內容是本站內部 editorial curation 的資料品質審閱，不是日本語能力試驗官方題庫、官方漢字認證或人工專家認證。每個 pool 的 12 題只是目前已審閱的 **data inventory / seed capacity**，不是產品 quota；正式題數須留待 Batch 17C-10 決定。未來 quota 若超過容量，必須增補審閱資料，不可縮減、複製或 fallback。

| Level | kanji-reading | orthography | context | 不重複 target source IDs |
|---|---:|---:|---:|---:|
| N5 | 12 | 12 | 12 | 36 |
| N4 | 12 | 12 | 12 | 36 |
| **總計** | 24 | 24 | 24 | **72** |

## 可重現且可稽核的流程

1. `vocabulary.json` 提供不可變的 source fields。
2. `japaneseJlptVocabularyAutoReviewManifest.json` 保存逐題 target snapshot、四個選項、每個錯項的來源與理由，以及本站內部審閱 provenance。
3. `scripts/build-japanese-jlpt-batch17c7b-vocabulary-auto-data.js` 對 source join、版本、review metadata、唯一答案、level、索引與容量 fail closed，再以明確的 level → 題型 → source ID comparator 產生 JSON。
4. `japaneseJlptVocabularyAutoQuestions.json` 是 committed derived bank；`--check` 比對完整序列化 bytes。
5. 專用 checker 重新 build、連跑兩次、執行負向 fixture，並確認 source 與 manifest 的 SHA-256 未因 build 改變。

Builder 不產生或補齊 distractor、不跨 level/type fallback、不使用亂數或時間戳；輸出採 temporary file 加 rename，驗證失敗不覆寫 committed bank。Manifest 和 source 都只讀。Derived bank 沒有被 HTML 或 `script.js` 載入，因此也不會進入 `japaneseJlptQuestionBank`、candidate pools 或 session snapshot。

## 三種題型審閱政策

### Kanji-reading

- target 必須含漢字，正解逐字等於 source kana；題幹只顯示 tested word，`rubyTerms` 固定為空。
- 每題記錄常見異讀、音便、accepted reading 與歧義結論；有合理第二讀法即換題。
- 三個讀音錯項均在 manifest 明列，逐項保存來源與錯誤理由；不在 build 時拼湊。
- `level-native-record-reviewed` 只表示本 record 實際顯示漢字已核准，不修改全站漢字 allow list。

### Orthography

- source word/kana 必須分別在例句中唯一且以 start/end index 對齊；完整假名句以 `【target kana】` 標示作答位置。
- 正解完全等於 source word。四個表記逐項檢查同音詞、替代表記、送り仮名、新舊字體、文脈唯一性與顯示漢字。
- 所有選項都是真實來源詞，不以隨機換字造錯字。未來 UI 必須用 `textContent` 或 safe text node 顯示。

### Context

- 本批使用未活用、exact-surface 的名詞；word/kana 在兩種例句各恰好一次。
- `blankedPrompt` 與 `blankedPromptKana` 都依保存的 start/end index 切片建立；derived `displayText` 優先採全假名版本。
- 四個選項以假名顯示且同 level、同詞性。每個 substitution review 保存完整替換句，並分別審閱語法形式與語意自然度；不是只比較中文詞義。

## Stable identity

Canonical ID 是 `jlpt-vocab-17c7b-{level}-{questionType}-src-{sourceId}`，`sourceQuestionId` 是 `vocabulary.json#{sourceId}`。兩者都由 source identity 而非陣列位置產生；插入其他 record 不改變既有 ID。同一 level 的三種題型不可重用 target，且所有 canonical tuple（level/type/sourceId）唯一。

## 代表性題目（每個 pool 兩題）

| Pool | 題幹（節錄） | 四選項 | 正解 |
|---|---|---|---|
| N5 reading | 「人」的讀音 | えき／くうこう／ひと／みせ | ひと |
| N5 reading | 「男」的讀音 | きっさてん／しょくどう／こうえん／おとこ | おとこ |
| N5 orthography | `【えきいん】にみちをききます。` | 財布／靴／駅員／服 | 駅員 |
| N5 orthography | `【ともだち】とはなします。` | 上着／帽子／眼鏡／友達 | 友達 |
| N5 context | `＿＿はせがたかいです。` | しんぶん／てがみ／おにいさん／きって | おにいさん |
| N5 context | `＿＿はやさしいです。` | しゃしん／ちず／えんぴつ／おねえさん | おねえさん |
| N4 reading | 「挨拶」的讀音 | あいさつ／けいけん／けしき／げんいん | あいさつ |
| N4 reading | 「赤ちゃん」的讀音 | けんきゅう／あかちゃん／こうじょう／こうちょう | あかちゃん |
| N4 orthography | `きの【えだ】にとりがいます。` | 神社／水道／数学／枝 | 枝 |
| N4 orthography | `【えんりょ】しないでたべてください。` | 遠慮／生活／成績／説明 | 遠慮 |
| N4 context | `このさらはまるい＿＿です。` | しゃかい／しゃちょう／しゅうかん／かたち | かたち |
| N4 context | `＿＿にしょるいをわたしました。` | かちょう／じゅうしょ／じゅうどう／しゅみ | かちょう |

完整題幹、來源 snapshot、繁體中文解釋、option review 與 substitution sentence 以 manifest/derived JSON 為準。

## 排除與換題原則

候選若不含漢字、word 或 kana 在例句出現零次/多次、存在合理異讀或同音表記、需要無法安全證明的活用、無法配置三個同 level 且逐項可排除的錯項，均不納入。本 seed 特別排除複雜動詞及形容詞 context target，改採唯一對齊的未活用名詞；也不把 orthography 的同音風險誤標成 reading ambiguity。

## Compatibility 隔離與後續邊界

`17c6-compat-v1` 仍維持 N5 20 題（單字 meaning 10＋文法 10）及 N4 34 題（單字 meaning 10＋文法 10＋閱讀 14）。本批不修改 profile、runtime、UI、storage schema 或既有題庫；12 題容量也不會被當作 session quota。

尚未處理並明確留待後續：Batch 17C-7C 的 paraphrase 與 N4 usage；Batch 17C-7D 的 runtime adapter 與隔離 profile 整合；以及 profile quota、UI rendering、Batch 17C-8 及以後工作。
