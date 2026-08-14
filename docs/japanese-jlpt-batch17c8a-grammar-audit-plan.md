# Batch 17C-8A：JLPT N5／N4 文法題型盤點與整合契約

## 範圍、基準與結論

本文件以 PR #294 merge commit `b9af0d27750e0b374b3a32ea31b3c6ef49b712ec` 為基準，只盤點 source inventory、候選容量與後續契約；**不啟用題型、不建立 derived bank、不改 quota**。candidate pool 容量不是正式測驗題數，正式 quota 一律留待 Batch 17C-10。

現行 `17c6-compat-v1` 完全不變：N5 共 20 題（vocabulary meaning 10、grammar meaning 5、grammar cloze 5）；N4 共 34 題（上述三池各 10／5／5，加 reading 14）。legacy `meaning` 只記錄 compatibility，不改名，也不映射成任何新題型。

## Machine-readable dynamic inventory

下列 JSON 是 checker 直接解析 repository 資料所得的精確快照；文件不是唯一真相來源，checker 會重新計算並逐值比對。

Checker 會解析 `script.js` 中 `JAPANESE_JLPT_PROFILE_REGISTRY` 的實際物件，而非以字串搜尋或在 inventory 中重寫 quota；它也另有固定 expected-inventory assertions。因此 production profile、來源資料與文件即使一起漂移，仍會 fail closed。profile 驗證包含 section quota 加總、N5 reading 未啟用、N4 reading 14、兩級 listening 未啟用、grammar 僅有 legacy `meaning`／`cloze`，且明確拒絕 `form-selection` 或 `sentence-composition`。

<!-- INVENTORY_JSON_START -->
```json
{
  "schemaVersion": 1,
  "baseline": "b9af0d27750e0b374b3a32ea31b3c6ef49b712ec",
  "compatibilityProfile": {
    "version": "17c6-compat-v1",
    "N5": { "total": 20, "vocabularyMeaning": 10, "grammarMeaning": 5, "grammarCloze": 5, "reading": 0 },
    "N4": { "total": 34, "vocabularyMeaning": 10, "grammarMeaning": 5, "grammarCloze": 5, "reading": 14 }
  },
  "legacy": {
    "total": 40,
    "byPool": {
      "N4/grammar/cloze": 5,
      "N4/grammar/meaning": 5,
      "N4/vocabulary/meaning": 10,
      "N5/grammar/cloze": 5,
      "N5/grammar/meaning": 5,
      "N5/vocabulary/meaning": 10
    }
  },
  "grammar": {
    "total": 290,
    "byLevel": { "N5": 80, "N4": 210 },
    "requiredFieldsComplete": 290,
    "quizPresent": 130,
    "structurallyEligible": 130,
    "humanReviewed": 0,
    "blockers": {
      "missing-required-field": 0,
      "duplicate-id": 0,
      "level-mismatch": 0,
      "missing-quiz": 160,
      "invalid-option-count": 0,
      "empty-option": 0,
      "duplicate-option": 0,
      "invalid-answer-index": 0,
      "answer-not-in-options": 0,
      "prompt-kana-mismatch": 0,
      "unsafe-distractor": 130,
      "unique-answer-unreviewed": 130
    }
  },
  "sentenceComposition": {
    "total": 60,
    "byLevel": { "N5": 30, "N4": 30 },
    "humanReviewed": 60,
    "permutationRows": 1440,
    "validExpected": 60,
    "validAlternate": 0,
    "blockers": {
      "missing-required-field": 0,
      "duplicate-id": 0,
      "level-mismatch": 0,
      "invalid-chunk-count": 0,
      "duplicate-chunk-id": 0,
      "invalid-correct-order": 0,
      "invalid-star-slot": 0,
      "complete-sentence-mismatch": 0,
      "missing-permutation-evidence": 0,
      "alternate-valid-order": 0
    }
  },
  "textGrammar": { "available": 0, "blocker": "missing-text-grammar-source" }
}
```
<!-- INVENTORY_JSON_END -->

### Inventory 解讀

* `grammar.json` 有 290 筆（N5 80、N4 210），必填欄位皆完整；130 筆有四選一 quiz（N5 80、N4 50）且通過機械結構檢查，因此只是 `form-selection` **結構候選**。repository 沒有 versioned 人工 review manifest，故 human-reviewed 為 0；130 筆全部仍標記 `unsafe-distractor` 與 `unique-answer-unreviewed`，另外 160 筆 `missing-quiz`。有 quiz 絕不等於可正式使用。
* legacy bank 共 40 筆，其中每級 vocabulary meaning 10、grammar meaning 5、grammar cloze 5。這是 compatibility inventory，不是新題型來源配額。
* sentence-composition source 共 60 筆（N5／N4 各 30），ID 全域唯一。每題恰有四個非空、文字及 ID 互異的 chunk；`correctOrder` 是完整 permutation；`starSlot` 是 0～3 整數，且 `correctOrder[starSlot]` 唯一定位 ★ chunk。`before + correctOrder chunks + after` 完全等於 `completeSentence`，`kana`、`meaning`、`explanation`、`grammarIds` 完整，且 60 筆 `uniqueAnswerReviewed === true`。
* Batch 16D-3 final evidence 有 60 × 24 = 1440 筆排列；每題恰一個 `VALID_EXPECTED`，合計 60，`VALID_ALTERNATE` 為 0。程式只能驗證結構和已提交稽核證據的一致性，**不能宣稱自動理解日文或自行證明文法唯一性**；唯一答案以既有人工稽核證據為準。本批 checker 會獨立完整驗證資料／evidence，不依賴可能因 PR #278 歷史 scope 規則而 exit 1 的 final checker。
* repository 沒有專用跨句文法文章及選項 bank，故 `text-grammar` unavailable／available=0；reading、一般 grammar 或句子重組不得冒充它，也不得在本批大量自動造題。

### Checker self-tests 與 evidence fail-closed boundary

Checker 自行驗證 evidence root 恰有 60 個唯一 ID，逐題 metadata 與 source 完全一致，並生成四個 chunk ID 的全部 24 種排列作集合比較。每筆 order 必須是無未知／重複 ID 的完整 permutation，sentence 必須可由 `before + ordered chunk text + after` 精確重建，verdict 必須來自允許集合且 reason 必須非空且具體。每題必須恰有一個、且 order 等於 `correctOrder` 的 `VALID_EXPECTED`，以及零個 `VALID_ALTERNATE`；總數必須精確為 1440，所有 composition blockers 為零。

為避免 validator 本身產生假陽性，checker 以 deep clone 執行七個 in-memory negative fixtures，並確認全部遭拒：`uniqueAnswerReviewed=false`、重複 permutation、缺少 permutation、錯誤的 `VALID_EXPECTED` order、無法重建的 sentence、出現 `VALID_ALTERNATE`，以及 compatibility quota／未核准題型漂移。這些 fixtures 不修改正式資料檔。

## Question Type Matrix

| section | questionType | N5 support | N4 support | source | source count | structurally eligible count | human-reviewed count | reusable directly | requires derived adapter | requires reviewed derived data | kanji／kana policy | blocker | future batch |
|---|---|---|---|---|---:|---:|---:|---|---|---|---|---|---|
| grammar | `form-selection` | candidate 80 | candidate 50 | `grammar.json` quiz | 290（quiz 130） | 130 | 0 | no | yes | yes | 保留 source prompt／kana；builder 依既有 JLPT kanji policy 驗證，不自行改字 | 160 missing quiz；130 distractor／unique-answer 未審 | reviewed manifest、deterministic builder、checker（17C-8 後續） |
| grammar | `cloze` | legacy 5 | legacy 5 | legacy JLPT bank | 10 grammar cloze | 10 | legacy compatibility only | 僅現行 profile | 未來新池需要 | 新資料需要 | 原樣遵守 legacy 顯示欄位；derived 必須明訂 policy | derived contract 尚未建立 | 後續 derived batch；quota 17C-10 |
| grammar | `sentence-composition` | reviewed 30 | reviewed 30 | sentence-composition bank + final evidence | 60 | 60 | 60 | source 可重用、不可直接共享 state | yes | no（現有 60 已審；adapter 仍須驗證） | deep clone 保留 kana／原文；不得無聲改寫 | immutable adapter 尚未實作 | adapter；isolated profile；quota 17C-10 |
| grammar | `text-grammar` | unavailable | unavailable | 無專用 source | 0 | 0 | 0 | no | no source to adapt | yes | 未定；有正式 source 後版本化 | `missing-text-grammar-source` | 未來另批建 reviewed source |
| grammar | `meaning` | legacy 5 | legacy 5 | legacy JLPT bank | 10 grammar meaning | 10 | legacy compatibility only | 僅現行 profile | no | no（不擴充） | 沿用 compatibility | 不是新題型目標 | 僅 compatibility；不得改名／映射 |

## 題型邊界

### `form-selection`

來源限 `grammar.json` quiz。130 僅是可進 review 的 candidate pool；本批不輸出正式 derived bank。後續必須有 versioned review manifest（逐 source ID 記錄分類、干擾項與唯一答案審閱）、deterministic builder、committed output 及 fail-closed checker，才能進 runtime candidate layer。

### `cloze` 與 legacy `meaning`

legacy cloze／meaning 的 ID、section、questionType、options 與 answer identity 保持原樣，且只服務 `17c6-compat-v1`。未來 cloze derived contract 是獨立、版本化的新資料路徑；不得把 form-selection、meaning、reading 或 sentence-composition 靜默 fallback／映射成 cloze，亦不得改 production quota。

### `sentence-composition`

後續 adapter 優先引用原始 60 題，以原始 ID 形成穩定 `sourceQuestionId`，不重抄題庫。每個 candidate 必須 deep clone 並保留 `before`、`after`、`chunks`、`correctOrder`、`starSlot`、`completeSentence`、`kana`、`meaning`、`explanation`、`grammarIds`、`uniqueAnswerReviewed`。JLPT adapter 與一般句子重組功能不得共享 mutable runtime state；不得修改或 freeze 原始 source bank。本批不實作 adapter、不接 session。規劃 pool key 是 `(level, "grammar", "sentence-composition")`，但不得加入 `JAPANESE_JLPT_PROFILE_REGISTRY`。

## Blocker taxonomy

checker 和後續 manifest 使用穩定、可統計的 key，不使用模糊 `invalid`：

* 通用：`missing-required-field`、`duplicate-id`、`level-mismatch`。
* quiz：`missing-quiz`、`invalid-option-count`、`empty-option`、`duplicate-option`、`invalid-answer-index`、`answer-not-in-options`、`prompt-kana-mismatch`、`unsafe-distractor`、`unique-answer-unreviewed`。
* composition：`invalid-chunk-count`、`duplicate-chunk-id`、`invalid-correct-order`、`invalid-star-slot`、`complete-sentence-mismatch`、`missing-permutation-evidence`、`alternate-valid-order`。
* source availability：`missing-text-grammar-source`。

`unsafe-distractor` 表示尚無逐題人工證據，不表示已判定內容錯誤；`unique-answer-unreviewed` 禁止候選越過 review boundary。

## Schema 與後續整合契約

1. **source layer**：既有 JSON 是 canonical content；只讀、不就地補 runtime 欄位。
2. **audit／review manifest layer**：以 schema／review version、canonical source ID、level、questionType、reviewer verdict、blocker keys 與內容 digest 鎖定審閱。source digest 漂移即失效。
3. **committed derived bank layer**：deterministic builder 只接受 manifest 明確核准項；輸出固定排序、derivation version、source digest、`sourceQuestionId`、stable derived ID 與完整 inventory，並提交供 diff review。
4. **runtime candidate layer**：adapter 驗證 section／level／questionType 和 schema 後 deep clone；任何缺漏、額外映射或 pool collision 都 fail-closed。
5. **immutable snapshot boundary**：selection 完成後建立與 source／其他功能隔離的 deep immutable snapshot；不得 mutate 或 freeze source bank。正式流程維持 `selection → immutable pre-randomization snapshot → balanced answer positions → option randomization`。
6. **option／chunk randomization metadata contract**：保存 pre-randomization option/chunk canonical IDs、原始 index、randomized index、permutation seed／version、correct canonical ID。若把 ★ 答案轉四選一，重排必須同步追蹤正確 chunk identity，不能只比文字。
7. **canonical identity／stable ID**：source ID 是 canonical identity；`sourceQuestionId` 等於原始 ID。derived ID 由 versioned namespace + level + questionType + source ID 決定，不依陣列位置、顯示文字或 shuffle 結果。
8. **fail-closed validation**：未知 schema/version/blocker、digest 漂移、重複 ID、答案 identity 無法解析、inventory 不符或未 review 均拒絕整個 bank，不略過壞題後繼續。
9. **不跨 level／questionType fallback**：pool 不足就明確 unavailable/error；不得借用其他 level、meaning、cloze、reading 或 composition 填數。
10. **production activation boundary**：derived bank、adapter 及 isolated tests 通過仍不代表上線。只有 Batch 17C-10 可修改 production profile 並設定固定 quota；本批維持 `17c6-compat-v1`、runtime、UI、cache 與 storage schema 不變。

## Handoff：Batch 17C-8 安全拆分

1. **reviewed grammar/form-selection derived data**：先做 versioned manifest、人工唯一答案／干擾項 review、deterministic builder、committed bank 與 fail-closed checker。
2. **sentence-composition immutable adapter**：獨立實作 deep-clone adapter、stable identity、metadata 與 mutation-isolation tests，不動原始 bank。
3. **isolated test profile／pipeline validation**：用非 production profile 驗證 selection、snapshot、平衡答案位置與 randomization identity，明確測 pool shortage 無 fallback。
4. **Batch 17C-10 production profile 與固定 quota 啟用**：最後另行決定各題型正式 quota、activation 與 UI；candidate 數不得直接轉為 quota。

上述四步是 handoff，不是本批實作清單；本批到契約與動態 checker 為止。
