# Batch 17C-7A：JLPT N5／N4 單字新題型資料適格性稽核與 schema 規劃

## 1. 定位、基準與不可變邊界

本文件以含 PR #290 的 merge commit `b47997a` 為基準，規劃 **site-internal、非官方**的 JLPT 風格練習資料；不把本站內容描述成官方 JLPT 題庫、漢字表或完整規格。Batch 17C-7A 只稽核與定義契約，不產題、不啟用題型、不修改 runtime。

產品 target 固定如下：`N5` 是 `kanji-reading`、`orthography`、`context`、`paraphrase`，**N5 usage: not planned**；`N4` 是上述四型加 `usage`，即 **N4 usage: planned**。legacy `meaning` 仍由 compatibility profile 使用。本規劃禁止跨 level、跨 questionType fallback，尤其不得把 N4 usage 借給 N5。

目前 `17c6-compat-v1` 精確維持 N5 單字 10＋文法 10＝20，N4 單字 10＋文法 10＋閱讀 14＝34；vocabulary 只註冊 `meaning`。這是遷移相容行為，不是最終產品 quota；Batch 17C-10 才能決定產品 quota。本批也不新增 storage/cache 寫入或 LocalStorage schema。

## 2. 動態 source inventory

計數定義：required field 是存在且轉成字串、trim 後非空；漢字由 Unicode Han script 判斷；unique 是原字串精確相等。同音群組是同 level、完全相同 `kana` 且至少兩筆。meaning 風險是去除空白及 `，,、；;。.!！？?` 後完全相同的群組；這只是重複／近似翻譯的**風險旗標**，不證明日文詞同義或可互換。

| level | source | 含漢字／不含漢字 | unique word／kana／meaning | 同音群組／涉及筆數／最大 | meaning 風險群組／筆數／最大 |
|---|---:|---:|---:|---:|---:|
| N5 | 1,021 | 928／93 | 1,021／992／1,002 | 28／57／3 | 17／36／3 |
| N4 | 2,220 | 1,931／289 | 2,220／2,192／2,123 | 27／55／3 | 91／189／4 |

九個必要欄位 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning` 在 N5 都是 1,021/1,021 完整，在 N4 都是 2,220/2,220 完整。

| level | word 在 example：找到／唯一／多次 | kana 在 exampleKana：找到／唯一／多次 | 兩邊皆唯一的同 blank 結構候選 |
|---|---:|---:|---:|
| N5 | 925／924／1 | 896／895／1 | 895 |
| N4 | 2,084／2,082／2 | 2,083／2,082／1 | 2,080 |

「同 blank 結構候選」只表示兩個 source 字串各恰好出現一次；它不證明兩句的語言學 token 邊界、活用、選項可替換性或答案唯一。source key inventory 動態掃描後，N5/N4 都只有上述九欄。語義關係偵測接受 paraphrase/synonym 欄位 `synonyms`、`synonym`、`paraphrases`、`paraphrase`、`equivalentExpression`，usage contrast 欄位 `usageSentences`、`correctUsageIndex`、`incorrectUsageReasons`、`usageReviewId`；目前兩類 populated entry 與 populated field count 都是 0。這些 0 是逐 entry 動態計算，不是常數。

### Machine-readable inventory

checker 會重讀 repository 資料、重算完整物件，並與下列 JSON 做深度精確比對；母庫筆數不等於 eligible，`structuralCandidates` 也不等於已審閱 available 或產品題數。blocker 統計可重疊，不應相加成 total。 checker 另以 synthetic fixtures 驗證「会う／合う」同音只形成 context-free orthography 多表記風險、不形成 confirmed kanji-reading ambiguity；也驗證加入 synonym 或 usage data 後動態 semantic count 會上升。

<!-- INVENTORY_JSON_START
{
  "N5": {
    "sourceCount": 1021,
    "requiredFieldComplete": {
      "id": 1021,
      "level": 1021,
      "word": 1021,
      "kana": 1021,
      "meaning": 1021,
      "partOfSpeech": 1021,
      "example": 1021,
      "exampleKana": 1021,
      "exampleMeaning": 1021
    },
    "withKanji": 928,
    "withoutKanji": 93,
    "unique": {
      "word": 1021,
      "kana": 992,
      "meaning": 1002
    },
    "homophoneKana": {
      "groups": 28,
      "items": 57,
      "maxGroupSize": 3
    },
    "normalizedMeaningRisk": {
      "groups": 17,
      "items": 36,
      "maxGroupSize": 3
    },
    "exampleWordAlignment": {
      "found": 925,
      "uniqueOccurrence": 924,
      "multipleOccurrences": 1
    },
    "exampleKanaAlignment": {
      "found": 896,
      "uniqueOccurrence": 895,
      "multipleOccurrences": 1
    },
    "sameBlankStructuralCandidates": 895,
    "sourceKeys": [
      "example",
      "exampleKana",
      "exampleMeaning",
      "id",
      "kana",
      "level",
      "meaning",
      "partOfSpeech",
      "word"
    ],
    "sourceSemanticRelations": {
      "recognizedParaphraseOrSynonymFields": [
        "synonyms",
        "synonym",
        "paraphrases",
        "paraphrase",
        "equivalentExpression"
      ],
      "recognizedUsageContrastFields": [
        "usageSentences",
        "correctUsageIndex",
        "incorrectUsageReasons",
        "usageReviewId"
      ],
      "entriesWithParaphraseOrSynonymData": 0,
      "entriesWithUsageContrastData": 0,
      "paraphraseOrSynonymPopulatedFields": 0,
      "usageContrastPopulatedFields": 0
    },
    "eligibility": {
      "kanji-reading": {
        "available": 0,
        "structuralCandidates": 928,
        "requiresHumanReview": 928,
        "excluded": 93,
        "blockers": {
          "no-testable-kanji": 93,
          "unreviewed-kanji": 928,
          "unsafe-generated-distractor": 928
        },
        "readingAmbiguityAssessment": {
          "sourceDetectable": false,
          "recognizedAlternateReadingFields": [
            "alternateReadings",
            "acceptedReadings",
            "readings"
          ],
          "confirmedCount": null,
          "requiresHumanReview": 928
        }
      },
      "orthography": {
        "available": 0,
        "structuralCandidates": 928,
        "requiresHumanReview": 928,
        "excluded": 93,
        "blockers": {
          "no-testable-kanji": 93,
          "unreviewed-kanji": 928,
          "duplicate-kana": 54,
          "multiple-valid-orthographies": 54,
          "unsafe-generated-distractor": 928
        }
      },
      "context": {
        "available": 0,
        "structuralCandidates": 895,
        "requiresHumanReview": 895,
        "excluded": 126,
        "blockers": {
          "example-target-not-found": 97,
          "example-kana-misaligned": 126,
          "inflected-target-not-aligned": 126,
          "ambiguous-context-answer": 895,
          "unsafe-generated-distractor": 895
        }
      },
      "paraphrase": {
        "available": 0,
        "structuralCandidates": 0,
        "requiresAuthoredSemanticData": 1021,
        "excluded": 0,
        "blockers": {
          "missing-paraphrase-relationship": 1021
        }
      },
      "usage": {
        "available": 0,
        "structuralCandidates": 0,
        "requiresAuthoredSemanticData": 0,
        "excluded": 1021,
        "blockers": {
          "n5-usage-not-planned": 1021
        }
      }
    }
  },
  "N4": {
    "sourceCount": 2220,
    "requiredFieldComplete": {
      "id": 2220,
      "level": 2220,
      "word": 2220,
      "kana": 2220,
      "meaning": 2220,
      "partOfSpeech": 2220,
      "example": 2220,
      "exampleKana": 2220,
      "exampleMeaning": 2220
    },
    "withKanji": 1931,
    "withoutKanji": 289,
    "unique": {
      "word": 2220,
      "kana": 2192,
      "meaning": 2123
    },
    "homophoneKana": {
      "groups": 27,
      "items": 55,
      "maxGroupSize": 3
    },
    "normalizedMeaningRisk": {
      "groups": 91,
      "items": 189,
      "maxGroupSize": 4
    },
    "exampleWordAlignment": {
      "found": 2084,
      "uniqueOccurrence": 2082,
      "multipleOccurrences": 2
    },
    "exampleKanaAlignment": {
      "found": 2083,
      "uniqueOccurrence": 2082,
      "multipleOccurrences": 1
    },
    "sameBlankStructuralCandidates": 2080,
    "sourceKeys": [
      "example",
      "exampleKana",
      "exampleMeaning",
      "id",
      "kana",
      "level",
      "meaning",
      "partOfSpeech",
      "word"
    ],
    "sourceSemanticRelations": {
      "recognizedParaphraseOrSynonymFields": [
        "synonyms",
        "synonym",
        "paraphrases",
        "paraphrase",
        "equivalentExpression"
      ],
      "recognizedUsageContrastFields": [
        "usageSentences",
        "correctUsageIndex",
        "incorrectUsageReasons",
        "usageReviewId"
      ],
      "entriesWithParaphraseOrSynonymData": 0,
      "entriesWithUsageContrastData": 0,
      "paraphraseOrSynonymPopulatedFields": 0,
      "usageContrastPopulatedFields": 0
    },
    "eligibility": {
      "kanji-reading": {
        "available": 0,
        "structuralCandidates": 1931,
        "requiresHumanReview": 1931,
        "excluded": 289,
        "blockers": {
          "no-testable-kanji": 289,
          "unreviewed-kanji": 1931,
          "unsafe-generated-distractor": 1931
        },
        "readingAmbiguityAssessment": {
          "sourceDetectable": false,
          "recognizedAlternateReadingFields": [
            "alternateReadings",
            "acceptedReadings",
            "readings"
          ],
          "confirmedCount": null,
          "requiresHumanReview": 1931
        }
      },
      "orthography": {
        "available": 0,
        "structuralCandidates": 1931,
        "requiresHumanReview": 1931,
        "excluded": 289,
        "blockers": {
          "no-testable-kanji": 289,
          "unreviewed-kanji": 1931,
          "duplicate-kana": 48,
          "multiple-valid-orthographies": 48,
          "unsafe-generated-distractor": 1931
        }
      },
      "context": {
        "available": 0,
        "structuralCandidates": 2080,
        "requiresHumanReview": 2080,
        "excluded": 140,
        "blockers": {
          "example-target-not-found": 138,
          "example-kana-misaligned": 138,
          "inflected-target-not-aligned": 140,
          "ambiguous-context-answer": 2080,
          "unsafe-generated-distractor": 2080
        }
      },
      "paraphrase": {
        "available": 0,
        "structuralCandidates": 0,
        "requiresAuthoredSemanticData": 2220,
        "excluded": 0,
        "blockers": {
          "missing-paraphrase-relationship": 2220
        }
      },
      "usage": {
        "available": 0,
        "structuralCandidates": 0,
        "requiresAuthoredSemanticData": 2220,
        "excluded": 0,
        "blockers": {
          "missing-usage-contrast-data": 2220
        }
      }
    }
  }
}
INVENTORY_JSON_END -->

## 3. Eligibility 狀態與 blocker taxonomy

每個 `(sourceId, level, questionType)` audit record 必須使用其中一個穩定狀態：

* `eligible-for-automatic-adapter`：所有自動條件與既有人工審閱均通過，才可進 derived build。
* `eligible-after-kanji-review`：結構合格，但只缺可信的 level/kanji 顯示審閱；不能當作現在 available。
* `requires-human-distractor-review`：需要人工確認四選項的自然性、可比性及唯一答案。
* `requires-authored-semantic-data`：source 無法推得所需語義對比，必須獨立撰寫。
* `excluded`：不屬 target 或硬性結構條件失敗。

穩定 blocker keys（同一筆可有多個）如下：

| key | 意義 |
|---|---|
| `missing-required-field` | 九個必要 source 欄位之一缺失或空白 |
| `no-testable-kanji` | reading/orthography 沒有可測 Han 字 |
| `unreviewed-kanji` | level allow-list 尚未可信審閱 |
| `duplicate-kana` | orthography／distractor pool 的同 kana collision 風險；不證明 kanji-reading 題幹多解 |
| `ambiguous-reading` | 人工或 accepted/alternate-reading 證據確認同一 tested word 題幹可能有多個合理讀音；跨 entry 同音不能確認此 blocker |
| `multiple-valid-orthographies` | 同音、多表記或送假名使答案可能不唯一 |
| `unsafe-generated-distractor` | 無人工證據支持機械產生的干擾項 |
| `example-target-not-found` | `word` 未在 `example` 恰好出現一次 |
| `example-kana-misaligned` | `kana` 未在 `exampleKana` 恰好出現一次 |
| `inflected-target-not-aligned` | dictionary form 與例句活用／位置不能安全對齊 |
| `ambiguous-context-answer` | 未證明其他選項在句中皆不成立 |
| `missing-paraphrase-relationship` | 缺正式、經審閱的近義關係 |
| `missing-usage-contrast-data` | 缺四句用法與錯誤理由 |
| `level-mismatch` | source、manifest 或 candidate level 不一致 |
| `n5-usage-not-planned` | N5 usage 明確不在產品 target |

不得以模糊 `invalid` 取代原因；build/checker 應拒絕未知 status、未知 blocker，並保留所有原因。

## 4. 逐題型 audit contract

### A. `kanji-reading`

**自動結構條件：** 九欄完整；`word` 有可測漢字；正解為非空 `kana`；題幹只顯示待測漢字表記，不能含 ruby、`kana`、`testedReading` 或其他答案洩漏；四個 kana options 必須非空且互異；source/manifest level 一致。`testedWord`、`testedReading`、`testedKanji` 要明示。

**人工審閱：** 逐漢字 level policy；同一 tested word 的異讀、音便與 accepted reading；三個 reading distractors 是否自然且只有一解。跨 entry 的相同 kana 只可能影響未來 distractor pool 去重，不會使「看不同漢字詞選讀音」自動成為多解。source 沒有 `alternateReadings`、`acceptedReadings` 或 `readings` metadata，因此 ambiguity 為 `sourceDetectable: false`、`confirmedCount: null`，N5 928／N4 1,931 漢字候選全數 `requiresHumanReview`；unknown/unassessed 絕不轉為 confirmed 0 或捏造 54／48。當前全部漢字候選仍有 `unreviewed-kanji` 與 `unsafe-generated-distractor`，故 available=0；純假名是 `no-testable-kanji`／`excluded`。

**不得推測：** 不可因另一個不同 `word` 恰有相同 kana 就記 `ambiguous-reading`；不可由其他詞的 kana 自動認定是假讀音，也不可由 source level 推論個別漢字已過 level review。只有針對同一題幹的人工／正式 reading metadata 證據才能產生 confirmed blocker count。

### B. `orthography`

**自動結構條件：** prompt 是 kana；正確 `correctOrthography` 含可測漢字；四個 options 是不同且非空的日文表記；level 一致；保存 `orthographyRiskTags`。DOM 必須用 `textContent`/等價安全 text node，不插入未信任 HTML 或 ruby。

**人工審閱：** 正確表記唯一；逐項確認同音、多表記、送假名及漢字 policy。不能簡單替換漢字製造不存在、不自然或其實也正確的選項。當前所有漢字結構候選仍是 `unreviewed-kanji`、`unsafe-generated-distractor`，context-free kana prompt 的同音候選另標 `duplicate-kana` pool risk、`multiple-valid-orthographies` risk，所以 available=0；這兩個 risk 不回寫成 kanji-reading 的 confirmed ambiguity。

**不得推測：** 不可把字典以外的組字當錯項，也不可把相同讀音的不同詞直接當作錯誤表記。

### C. `context`

**自動結構條件：** `word` 在 `example`、`kana` 在 `exampleKana` 各恰好一次；以保存的 `targetOccurrence`（字元 start/end 與 occurrence index）分別建立 `blankedPrompt`、`blankedPromptKana`，而非全域 replace；兩者要保留同一 target 的對應，並保存 `sourceExampleMeaning`。prompt、promptKana、翻譯不得跨 source 拼接。

**人工審閱：** token/活用真正對齊；四選項詞性、活用與語意可比較；每個替換後句子自然性及唯一答案。動詞／形容詞已活用時須由 `inflectionMetadata` 描述 surface/dictionary form，不可用 dictionary form 硬換。即使三個選項意思不同，也不能視為品質合格。因此 895/2,080 僅是 N5/N4 structural candidates，全部仍需 distractor/unique-answer review、available=0。

**不得推測：** 不能把 substring 當 token、不能誤替換其他相同字串、不能由 partOfSpeech 或中文 meaning 自動宣告語法／語意可替換。

### D. `paraphrase`

`vocabulary.json` 沒有正式 synonym/paraphrase relationship。相同或相似中文 `meaning` 不代表兩個日文詞是近義詞，也不代表在特定語境可互換。因此不能自動推測來源詞、近義答案或干擾項，`available` 必須維持 **0**。

必須建立獨立、人工 authoring/review manifest，保存 source expression、`equivalentExpression`、`interchangeabilityScope`（適用語境與限制）、三個干擾項、每項判斷及 `semanticReviewId`；只有 `uniqueAnswerReviewed: true` 且審閱版本有效才可 build。

### E. `usage`（僅 N4）

N5 不建立候選、不註冊 quota，所有 N5 source 以 `n5-usage-not-planned`／`excluded` 表示；不得借 N4 或 fallback。N4 source 只有一個正向 example，沒有三個已驗證的錯誤／不自然用法。因此不可機械替詞、自動改助詞或亂改活用產生錯句，`available` 必須維持 **0**。

N4 必須用獨立人工 manifest 保存 `targetWord`、四個完整 `usageSentences`（各自句子假名）、`correctUsageIndex`、逐錯項 `incorrectUsageReasons`、每句 `targetOccurrence`、`usageReviewId` 與唯一答案審閱。缺資料就是 `missing-usage-contrast-data`，不是可衍生候選。

## 5. 資料分層與 schema

### Source layer

`vocabulary.json` 保持 canonical identity；不改 source entry、ID 或順序。所有後續資料以 `(level, String(id))` 引用，遇 `level-mismatch` 立即失敗。

### Audit／review manifest

自動三型共用 audit manifest，逐 `(sourceId, level, questionType)` 保存 `eligibilityStatus`、`blockerReasons[]`、`reviewStatus`、`reviewVersion`、reviewer/日期與 policy version。paraphrase 與僅 N4 usage 分別使用獨立人工 authored manifest；人工語義不得硬寫在 `script.js`。

### Authoring schema

共同欄位：`authoringId`、`sourceIds`、`level`、`questionType`、`reviewStatus`、`reviewVersion`、`reviewTags`、`uniqueAnswerReviewed`、review provenance。三個自動型另存人工核准的 distractors 及每項理由；paraphrase 存 `targetExpression`、`equivalentExpression`、`interchangeabilityScope`、`semanticReviewId`；usage 存 `targetWord`、四個 `usageSentences`（含 sentence/kana/`targetOccurrence`）、`correctUsageIndex`、`incorrectUsageReasons`、`usageReviewId`。作者備註、reviewer identity、審閱時間與 rejected drafts 不必送 runtime，但必須留在 manifest/derived provenance。

### Committed derived schema

build script 決定性產生 committed bank，`--check` 必須 byte-for-byte 驗證。共同欄位：

`id`, `sourceQuestionId`, `level`, `section`, `questionType`, `sourceBank`, `sourceIds`, `originalText`, `displayText`/`prompt`, `kana`/`promptKana`, `options`, `answerIndex`, `answerDisplay`, `explanation`, `kanjiPolicy`, `rubyTerms`, `reviewStatus`, `reviewVersion`, `reviewTags`, `uniqueAnswerReviewed`, `derivationVersion`。

型別欄位：kanji-reading 題存 `testedWord`、`testedReading`、`testedKanji`；orthography 存 `promptKana`、`correctOrthography`、`orthographyRiskTags`；context 存 `sourceExample`、`sourceExampleKana`、`sourceExampleMeaning`、`blankedPrompt`、`blankedPromptKana`、`targetOccurrence`、`inflectionMetadata`；paraphrase 存 `targetExpression`、`equivalentExpression`、`interchangeabilityScope`、`semanticReviewId`；usage 存 `targetWord`、`usageSentences`、`correctUsageIndex`、`incorrectUsageReasons`、`usageReviewId`。

stable ID 用版本化 namespace＋level＋type＋canonical source ID（人工語義題再加 manifest authoring ID）的確定性編碼／hash；stable ID 不得依陣列位置產生，插入 source 不應使其他 ID 重編。`sourceQuestionId` 是 derived canonical ID，`sourceIds` 保留所有 source IDs；另保留 manifest ID、review version/status/tags、semantic/usage review ID 與 `derivationVersion`，使 provenance 可追溯。

### Runtime candidate schema

adapter 產生 Batch 17C-6 可接受的 `id`/`sourceQuestionId`、`level`, `section: "vocabulary"`, `questionType`, `sourceBank`, `sourceIds`, prompt/display/kana, 四個 `options`, `answerIndex`, `answerDisplay`, `explanation` 與顯示／review metadata；pool key 是 **(level, vocabulary, questionType)**。每次 adapter 都 deep clone options、answerDisplay、rubyTerms、review metadata 及型別解析資料，不修改 derived/source bank、不共享 mutable reference。

runtime 可省略 reviewer identity、時間、rejected drafts、authoring rationale，但不得遺失回答後解析所需的 answerDisplay/explanation、source IDs、display/ruby/kanji policy、unique-answer review、review/derivation version，context 的 blank/inflection，或 semantic/usage review ID。candidate 必須能依序進入 selection → immutable snapshot → balance → option randomization pipeline。

## 6. 漢字、假名、ruby 與安全 DOM

現行 policy `17b1-internal-v1` 的 `allowedPolicies` 是 `level-native`, `ruby-required`, `kana-replacement`, `excluded`；`fallbackOrder` 是 `kana-replacement` → `ruby-required` → `excluded`。但 N5/N4 `kanjiAllowList` 都是空 allow list，`reviewStatus` 都是 `pending`；這**不是**已完成漢字等級審閱。

1. kanji-reading 必須顯示審閱後的 tested orthography 純文字；測試範圍不可加 ruby，也不可在相鄰 prompt 暴露 kana。無可信 level/kanji review 時 excluded（或留在非 available manifest），因 kana-replacement/ruby-required 都會洩答。
2. orthography 的四個漢字 options 只有逐項通過 level 與唯一表記 review 才能以安全 text node 顯示；不得注入 HTML。
3. context 優先依題目審閱結果使用漢字 prompt；非 target 漢字可按 policy 使用明示 ruby 或成對 kana prompt。若 fallback 改變 target/blank 對齊，則用完整 kana prompt；兩者仍須同一 `targetOccurrence` 語義。不能安全對齊就 excluded。
4. 缺欄、level 不一致、target/ruby 洩答、無可測漢字、未審閱卻需要漢字、空或重複 options、blank 無法唯一對齊、答案不唯一者均 excluded，不得放寬驗證。
5. 17C-7B 應新增**獨立 vocabulary review manifest 與其 review schema/version**。只有 policy 的全域語意真的改變時才升新 policyVersion；不可為了宣稱審閱完成而填充或改寫目前 policy。

## 7. Compatibility 整合定案

比較方案：直接把新 types 混進現載 bank 會讓 `prepareJapaneseJlptCandidatePools()` 因 compatibility profile 未註冊分類而正確拒絕；靜默忽略會掩蓋 typo/data drift；把 type 映射成 meaning 會破壞 pool identity；偷加 quota=0、正式 quota或放寬 normalize 都會改變 contract。

**定案：17C-7B 產物使用獨立 derived bank，且不餵入 compatibility session。** 17C-7D 才加「非啟用狀態」adapter/check fixture：在隔離測試 profile 顯式註冊新 types 以驗證 normalization、pool、snapshot 與 mutation safety，但 production `17c6-compat-v1` 載入路徑仍只收到 legacy bank。禁止靜默過濾、跨 type/level fallback、映射成 meaning、compatibility profile quota=0 或提前切產品 profile。

這使 17C-7B 能獨立反覆 build/review，17C-7C 能加入人工語義 bank 而不影響頁面，17C-7D 能驗證 adapter，最後 Batch 17C-10 在 inventory 與產品 quota 獨立定案後以新 profile 顯式啟用。候選池大小只是容量證據，不是最終產品 quota；文件沒有宣稱所有 source 都可上線。

## 8. Handoff 與尚未處理

* **Batch 17C-7B**：建立 kanji-reading、orthography、context 的 versioned audit/review manifest、deterministic build、獨立 derived bank、schema/content checker；逐項完成 kanji、distractor、unique-answer review。不要接 production session。
* **Batch 17C-7C**：人工撰寫/審閱 N5/N4 paraphrase 與僅 N4 usage 的兩份 manifest，驗證 scope、限制、四選項、句子 kana、錯項理由與唯一答案；在資料存在前 available=0。
* **Batch 17C-7D**：實作 immutable vocabulary adapters 與隔離 profile fixture 的非啟用整合驗證，確認 pool key、provenance、deep clone、snapshot pipeline；保持 compatibility profile 與網頁行為不變。

最低 pool 規模應在 17C-10 quota 定案後，以每個 `(level, vocabulary, questionType)` quota 加明示 review buffer 計算；本批不臆定數字。尚未完成：任何人工漢字/干擾項/唯一答案審閱、paraphrase/usage authoring、derived bank、adapter、runtime/UI 啟用及產品 quota；這些不是本批 PASS 的含義。
