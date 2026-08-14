# Batch 17C-8B：JLPT N5／N4 grammar form-selection seed data

## 定位與聲明

本批建立本站內部的 **JLPT-style** 文法選形資料容量。它不是官方 JLPT 題庫、沒有官方認證，也未經專業日語檢定機構審核；其狀態為 `site-internal-editorial-reviewed`。資料僅供後續產品批次評估，沒有 runtime／UI 啟用、沒有正式 quota，也不改變 production profile 或測驗題數。

## Inventory 與 review 方法

`grammar.json` 的固定盤點是 290 筆（N5 80、N4 210），其中帶有 `quiz` 的候選是 130 筆（N5 80、N4 50）。本批從候選中刻意選擇不同 source ID 與多種 category／grammar target，建立 N5 12 題、N4 12 題、合計 24 題的 **seed capacity**；它不是 Batch 17C-10 的產品 quota。

每筆由站內 editorial review 逐項確認：prompt 自然度、prompt 與 kana 各恰有一個 `＿＿`、中文語意對齊、四選項非空且互異、答案只出現一次、三個錯項在句中的具體文法不成立原因、explanation 與答案一致、level／target 一致，以及顯示漢字與假名對應。可能有第二合理答案或助詞、活用、語意有疑義的候選不採用，且不改寫來源。

## Manifest 與 derived schema

`japaneseJlptGrammarFormSelectionReviewManifest.json` 使用 `17c8b-v1` manifest、`17c8b-review-v1` review 與 `full-canonical-source-v1` source policy。每筆保存完整 canonical grammar entry（不是挑欄位的摘要）、SHA-256 `sourceDigest`、review routing／tags、五種 alignment／uniqueness／display review、reviewer rationale，以及四個依 index 對齊的 `optionReviews`。正解的 `incorrectReason` 為 `null`；三個錯項均保存非空的文法理由。

Derived bank 的版本為 `17c8b-v1`，保留 source prompt／kana／meaning／choices、由來源答案計算的 `answerIndex`、grammar metadata、review metadata、digest 與 option reviews。Canonical source identity 是 `grammar.json#{sourceId}`；stable ID 是 `jlpt-grammar-17c8b-{level}-form-selection-{sourceId}`，不使用 array index、排序位置、shuffle 或時間。

## Drift、determinism 與 fail-closed policy

Builder 只讀 `grammar.json` 與 review manifest。它以精確 `sourceId` join，將完整 snapshot 與完整 source entry 做 canonical equality，並重算 SHA-256 digest；任一內容漂移、缺漏、跨 level/type、review 不完整、答案不唯一或 option review 不對齊都使整批失敗。輸出先寫暫存檔再 atomic rename，固定以 code-unit comparisons 排序，JSON 格式亦固定；`--check` 只比較 committed bytes，不寫檔。

Checker 比對動態 build、兩次純 build 與 committed bytes，實際建立 drift 後要求 `--check` 失敗並在 `finally` 還原。它也執行 23 組 negative fixtures：缺少／重複 source、level mismatch、snapshot／digest drift、review version／unique review 缺失、choice 數量／空白／重複、answer 缺少／重複、derived answer metadata 不一致、option review 數量／順序／正解數／錯因（包括字數夠長但仍是泛用模板的錯因）、prompt／kana 空格、alignment review、未知 type、跨 level，以及 array-position identity。

## Production isolation 與 compatibility

Scope guard 預設直接使用 PR #295 merge commit `b5c5745e6050df102908f6c434431c2c61a06360`，並確認它是 HEAD ancestor；若指定 `JLPT_17C8B_BASE_REF`，仍另外直接比較該 merge commit。只有本批五個新增檔案可出現，其他既有檔案 byte identity 必須維持。

Checker 確認 HTML／`script.js` 不載入新 bank，production 沒有新 fetch、dynamic import、script tag 或 session call；既有檔案完全未變，因此 cache token、storage API inventory、一般 grammar、sentence-composition、vocabulary、reading 功能均不變。`17c6-compat-v1` 仍是 N5 20、N4 34，production grammar 仍僅有 legacy `meaning`／`cloze`，不含 `form-selection`。

## 代表性 reviewed examples

### N5：`n5-grammar-024`

- Prompt：`この靴は＿＿です。`
- Kana：`このくつは＿＿です。`
- Options：`高くない`／`高い`／`高かった`／`高くなかった`
- Answer：`高くない`
- 錯項：`高い` 是現在肯定，與「不貴」的極性相反；`高かった` 是過去肯定，既少了否定也改變時態；`高くなかった` 是過去否定，與題目要求的現在否定不一致。

### N5：`n5-grammar-039`

- Prompt：`朝ご飯を＿＿、学校へ行きます。`
- Kana：`あさごはんを＿＿、がっこうへいきます。`
- Options：`食べて`／`食べます`／`食べた`／`食べない`
- Answer：`食べて`
- 錯項：`食べます` 是終止形，不能直接用逗號串接下一動作；`食べた` 需另有接續形式，裸た形不能在此表示先後；`食べない` 會變成「不吃」，既不完成て形接續也違反中文「吃早餐後」。

### N4：`n4-grammar-248`

- Prompt：`来年、日本へ留学する＿＿です。`
- Kana：`らいねん、にほんへりゅうがくする＿＿です。`
- Options：`つもり`／`ため`／`ところ`／`はず`
- Answer：`つもり`
- 錯項：`ため` 會表目的／原因而非說話者打算；`ところ` 表動作階段，不能表明年留學的意向；`はず` 表依據推斷的「應該」，不是自己的計畫。

### N4：`n4-grammar-275`

- Prompt：`環境問題＿＿話しましょう。`
- Kana：`かんきょうもんだい＿＿はなしましょう。`
- Options：`について`／`にとって`／`として`／`によって`
- Answer：`について`
- 錯項：`にとって` 需要觀點持有者並表示「對……而言」；`として` 表身分／資格；`によって` 表手段、原因或施事者；三者都不能標示「談論環境問題」的主題。

## 後續

下一步是 sentence-composition immutable adapter。本題型的正式 runtime 啟用與產品 quota 均留待 Batch 17C-10；在此之前這 24 題只代表經審閱的資料容量。
