# Batch 17C-7D：JLPT N5／N4 單字 immutable adapters

## 範圍與契約

本批新增的純函式 adapter 接受**已解析**的 auto 與 semantic bank 物件；它不讀檔、不 fetch，也不進入 production session。`adaptJapaneseJlptVocabularyDerivedQuestion` 驗證單題，`createJapaneseJlptVocabularyDerivedCandidates` 驗證 bank schema、derivation version、inventory、全域 ID，並產生 Batch 17C-6 引擎可用的 runtime candidates。

契約採 fail closed：只接受 N5／N4 的 `kanji-reading`、`orthography`、`context`、`paraphrase`，以及僅 N4 的 `usage`。缺欄位、分類不一致、`meaning`、未知題型、N5 usage、重複或空白 identity、非 vocabulary、選項／答案錯誤、review 或 derivation 缺漏，以及題型 metadata 未對齊都直接拋錯；不跨 level 或 questionType fallback。

## Inventory 與 pool

| Level | 題型 | candidates |
| --- | --- | ---: |
| N5 | kanji-reading | 12 |
| N5 | orthography | 12 |
| N5 | context | 12 |
| N5 | paraphrase | 12 |
| N4 | kanji-reading | 12 |
| N4 | orthography | 12 |
| N4 | context | 12 |
| N4 | paraphrase | 12 |
| N4 | usage | 12 |

N5 共 48 題、N4 共 60 題，合計 108 題。pool key 固定為 `(level, "vocabulary", questionType)`。每 pool 12 題是資料容量，**不是產品 quota**。

## 隔離 checker profile

新 checker 內部建立 `17c7d-isolated-vocabulary-fixture-v1`／`site-jlpt-style-vocabulary-fixture`，其 `profileKind` 是 `test-only-isolated`。它每型選 1 題，依序驗證 adapter → normalize → prepare pools → select → immutable pre-randomization snapshot → balanced answer positions → option randomization，並另外驗證每個實際 pool 都是 12 題。這個 fixture 不在 production `JAPANESE_JLPT_PROFILE_REGISTRY`，其 quota 只供測試，不能解讀為產品決策。

## immutable 邊界與選項 metadata

Adapter 對每題及所有巢狀資料 deep clone，不修改、不 freeze derived bank，也不共用其 mutable references。pre-randomization snapshot 再 deep clone 並 deep freeze；建立 snapshot 不會 freeze candidate。隨機化從 frozen snapshot deep clone，既不修改 snapshot，也不與 snapshot 共用 mutable nested references。

隨選項 permutation 同步排列：orthography 的 `optionReviews`；context 的 `optionSourceIds`、`substitutionReviews`；paraphrase 的 `optionReviews`；usage 的 `usageSentences`。usage 同時更新 `correctUsageIndex` 與 `incorrectUsageReasons[].usageIndex`，確保正解旗標、句子與四個位置一致。legacy 題型沒有這些欄位，維持既有行為。

## Production compatibility

正式 `17c6-compat-v1`、quota 與 production registry 均未改變。`buildJapaneseJlptSession()` 仍只取得 legacy vocabulary／grammar bank 與既有 reading bank，production 不呼叫 adapter。HTML 與 runtime 不載入兩個 derived JSON；沒有新增 fetch、dynamic import、script tag、UI、啟動時資料讀取或 storage/cache schema 整合。頁面只更新既有 `script.js` cache token 至 `v=3.9`。

本批沒有正式啟用新題型，也沒有產品 quota 決策；正式 quota 與啟用留待 Batch 17C-10。
