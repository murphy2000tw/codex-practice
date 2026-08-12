# Batch 17C-5：JLPT 題型擴充與固定題數抽題架構規劃

## 1. 定位、基準與範圍

本文件規劃的是本站的**非官方「站內 JLPT 風格模擬測驗」**，不宣稱覆蓋或符合官方完整 JLPT 規格。盤點基準為已合併 PR #288 的 commit `270a4946b49adadb7245e9ee751a6cbd08891a15`。Batch 17C-5 只新增本文件與專用 checker；不修改 runtime、UI、cache token、LocalStorage schema 或任何題庫，也不實作抽題。

## 2. Repository 實際盤點

以下數字由 checker 直接解析目前資料檔與 `script.js`，不是以文件數字作為唯一真相來源。

<!-- INVENTORY_JSON_START
{"jlptVocabularyGrammar":{"total":40,"N5":20,"N4":20,"N5_vocabulary_meaning":10,"N5_grammar_meaning":5,"N5_grammar_cloze":5,"N4_vocabulary_meaning":10,"N4_grammar_meaning":5,"N4_grammar_cloze":5},"jlptReading":{"N5_sets":0,"N5_questions":0,"N4_sets":105,"N4_questions":150,"short-passage_sets":39,"short-passage_questions":41,"medium-passage_sets":15,"medium-passage_questions":35,"information-search_sets":17,"information-search_questions":33,"notice-and-message_sets":34,"notice-and-message_questions":41,"active_N4_sets":10,"active_N4_questions":14},"sentenceComposition":{"total":60,"N5":30,"N4":30},"listening":{"total":100,"N5":69,"N4":31},"sourceBanks":{"vocabulary_total":3241,"vocabulary_N5":1021,"vocabulary_N4":2220,"grammar_total":290,"grammar_N5":80,"grammar_N4":210}}
INVENTORY_JSON_END -->

### 2.1 現行 JLPT session

* 衍生單字／文法 bank 共 40 題；N5、N4 各 20 題。每級都是 vocabulary `meaning` 10、grammar `meaning` 5、grammar `cloze` 5。來源候選母庫為 `vocabulary.json` 3,241 筆（N5 1,021、N4 2,220）及 `grammar.json` 290 筆（N5 80、N4 210），但母庫筆數不等同可直接作答的 JLPT 題數。
* N5 現行 session 為 20 題（10 單字、10 文法），reading 明確 unavailable（0 組／0 題），listening 尚未接入。
* N4 現行 session 為 34 題：上述 20 題加固定 manifest 的 reading 10 組／14 題。完整 N4 derived reading bank 是 105 組／150 題。
* reading 的 canonical 分類為：`short-passage` 39 組／41 題、`medium-passage` 15 組／35 題、`information-search` 17 組／33 題、`notice-and-message` 34 組／41 題。原始 `japaneseReadingQuestions.js` 亦為 N4 105 組／150 題；derived bank 保留來源關係。細分類共有 30 種，應由 `typeToSection` 正規化，不應直接把各中文／日文標籤當永久 contract。
* sentence composition 共 60 題，N5 30、N4 30，全部帶 `uniqueAnswerReviewed: true`。
* `JAPANESE_LISTENING_QUESTIONS` 共 100 題，N5 69、N4 31。category 是內容情境而不是正式聽力題型：N5 分布為日常 7、交通 8、餐廳 5、學校 5、時間 5、家庭 4、購物 6、天氣 3、日常生活 2、旅行 2、工作 2、醫院／藥局 3、便利商店 4、電話／約定 2、方向／地點 4、請求／許可 1、郵局／銀行 1、圖書館 2、飯店／住宿 1、休假／週末 1、身體狀況 1；N4 為工作 5、天氣 3、日常 1、旅行 4、請求／許可 3、日常生活 2、餐廳 2、家庭 1、電話／約定 2、學校 1、交通 1、時間 1、醫院／藥局 1、郵局／銀行 1、飯店／住宿 1、休假／週末 1、身體狀況 1。

### 2.2 PR #288 後的建立順序

目前 `startJapaneseJlptMock` 先依 level 取出全部 20 題單字／文法 snapshot，N4 再附加固定 reading manifest，驗證總數 N5=20／N4=34，才依實際總數產生 balanced answer positions，最後複製並排列 options、更新 `answerIndex`，存入記憶體 session。`crypto.getRandomValues` 配合 rejection sampling 與 Fisher–Yates；N5 答案位置 5/5/5/5，N4 每格 8 或 9。新測驗會重建選項排列，原始 bank 不被修改；題目選取目前仍是全取／固定 manifest，尚未隨機。

## 3. Question Type Matrix

「支援」只表示目前資料能否供本站題型 adapter 使用，不代表官方規格認證。數量是目前可用或可衍生候選量；正式可用量仍須由後續 batch 的 validator 決定。

| section | questionType（contract key） | N5 support | N4 support | current source | current available count | reusable directly? | requires derived data? | requires new data? | kanji / kana / ruby policy | future Batch | blocking issue |
|---|---|---|---|---:|---:|---|---|---|---|---|---|
| vocabulary | `kanji-reading` | 候選 1,021 | 候選 2,220 | `vocabulary.json` word/kana | 母庫 N5 1,021；N4 2,220 | 否 | 是：題幹、干擾項、ID | 視 audit | 依 level kanji policy；答案 kana | 17C-7 | 尚無此型 derived validator |
| vocabulary | `orthography` | 候選 | 候選 | `vocabulary.json` kana/word | 同上（非全數必然適格） | 否 | 是 | 視 audit | 題幹 kana、選項須過 level policy | 17C-7 | 同音／唯一答案需稽核 |
| vocabulary | `context` | 候選 | 候選 | vocabulary examples | 上限同上，實際待 audit | 否 | 是 | 可能 | prompt/exampleKana 對齊 | 17C-7 | 例句不一定適合作四選一 |
| vocabulary | `paraphrase` | 未支援 | 未支援 | 無專用語義關係資料 | 0 | 否 | 否 | 是 | 顯示與選項均須 level audit | 17C-7 | 需人工唯一答案與近義關係 |
| vocabulary | `usage` | **not planned／不納入目前 target** | **planned target** | examples 可作 N4 候選 | 0 個已驗證題 | 否 | 是（僅 N4） | N4 可能 | 句中漢字及 kana fallback | N4：17C-7；N5：不納入 | N4 干擾項與唯一答案待 audit；不得配置 N5 quota |
| vocabulary | `meaning`（legacy） | 是 | 是 | JLPT vocabulary/grammar bank | 各 10 | 是 | 已衍生 | 否 | 現行 `kana-replacement` | 17C-7 遷移 | 類型命名需相容映射 |
| grammar | `form-selection` | 可衍生 | 可衍生 | `grammar.json` quiz | N5 80；N4 210 母項 | 否 | 是 | 視 audit | prompt/kana 成對，遵循 level policy | 17C-8 | 不是每筆都能產生唯一題 |
| grammar | `cloze`（legacy） | 是 | 是 | JLPT bank ← grammar quiz | 各 5 | 是 | 已衍生 | 否 | 現行 `kana-replacement` | 17C-8 遷移 | 與 form-selection 邊界需定義 |
| grammar | `meaning`（legacy） | 是 | 是 | JLPT bank ← `grammar.json` | 各 5 | 是 | 已衍生 | 否 | 現行 `kana-replacement` | 17C-8 遷移 | 不是目標完整題型 |
| grammar | `sentence-composition` | 可衍生 30 | 可衍生 30 | sentence composition bank | N5 30；N4 30 | 否 | 是：immutable adapter | 否（若 audit 通過） | JLPT adapter 獨立套 level policy；保留 kana | 17C-8 | 四塊／★語意及 JLPT 呈現需驗證 |
| grammar | `text-grammar` | 未支援 | 未支援 | 無跨句專用 bank | 0 | 否 | 否 | 是 | passage ruby/kana 規則需新增 | 17C-8 | 需文章與跨句選項資料 |
| reading | `short-passage` | 否 | 是 | derived reading bank | N5 0；N4 39 組／41 題 | 是（N4） | 已衍生 | N5 是 | rubyTerms + coverage，safe DOM | 17C-9 | N5 完全缺資料 |
| reading | `medium-passage` | 否 | 是 | derived reading bank | N5 0；N4 15／35 | 是（N4） | 已衍生 | N5 是 | 同上 | 17C-9 | N5 完全缺資料 |
| reading | `information-search` | 否 | 是 | derived reading bank | N5 0；N4 17／33 | 是（N4） | 已衍生 | N5 是 | 圖表文字亦須 ruby/kana audit | 17C-9 | N5 完全缺資料 |
| reading | `notice-and-message` | 否 | 是（補充類） | derived reading bank | N5 0；N4 34／41 | 是（N4） | 已衍生 | N5 是 | rubyTerms + coverage，safe DOM | 17C-9 | 是否併入前三型須由產品定案 |
| listening | `meaning-response`（暫名） | 候選 69 | 候選 31 | `JAPANESE_LISTENING_QUESTIONS` | N5 69；N4 31 | 否 | 是：正式 schema/audio contract | 視 audit | audio/speech 文本保留 japanese/kana | 17D-1、17D-2 | 現有 category 不是 questionType；尚未接 JLPT |

本站目前確認的 vocabulary 產品 target（仍是本站規劃，不是官方完整規格或官方認證）為：**N5** 納入 `kanji-reading`、`orthography`、`context`、`paraphrase`，明確不納入 `usage`；**N4** 納入上述四型及 `usage`。17C-7 必須依此範圍建置與驗證，不得再把 N5 usage 當待定項目。

## 4. 建議的集中式 Profile / Quota Contract

最終產品 X/Y/Z/W **本 Batch 不決定**。17C-6 應新增單一、經 schema 驗證且深度凍結的 profile registry。**資料能力 `status` 與某 profile 是否選用 section 的 `included` 是兩個正交欄位**：status 描述 bank 能力，included 描述這個 profile 的測驗組成。下例的 `null` 是待後續盤點定案，不可在 runtime 當成 0。

```js
{
  schemaVersion: 1,
  profileVersion: "17c10-product-draft-v1",
  profileId: "site-jlpt-style-product-draft",
  levels: {
    N5: {
      status: "pending-quota",
      total: null,
      sections: {
        vocabulary: { included: true, status: "pending-quota", total: null, questionTypes: { "kanji-reading": null, orthography: null, context: null, paraphrase: null } },
        grammar: { included: true, status: "pending-quota", total: null, questionTypes: { "form-selection": null, cloze: null, "sentence-composition": null, "text-grammar": null } },
        reading: { included: false, status: "unavailable", total: null, questionTypes: {} },
        listening: { included: false, status: "future", total: null, questionTypes: {} }
      }
    },
    N4: { status: "pending-quota", total: null, sections: { /* 同一 shape；各值集中定案 */ } }
  }
}
```

Contract rules：

1. `profileVersion`、level total、section total、questionType quota 只在 registry 管理；render/start 不得另寫題數。`included` 必須是 boolean，不能由 total 或 status 推測。
2. `included: false` 的 section **不計入 level total、不要求 quota、不建立或驗證 candidate pool，也不阻止 profile 啟動**；它仍可保留 `status: "unavailable"` 或 `status: "future"` 作能力資訊。`null` 絕不自動轉 0。
3. 只有 `included: true` 的 section 才必須 `status: "available"`、具有非負安全整數 section total 與完整 questionType quota，並參與 pool sufficiency validation。included type 加總必須等於 section total；included section 加總必須等於 level total。
4. pool key 為 `(level, section, questionType)`；嚴禁跨 level、跨 type silent fallback。舊 `meaning` 類型須顯式 adapter/migration，不可模糊歸類。
5. listening 現在保留 shape、`included: false`、`status: "future"`；N5 reading 保留 `included: false`、`status: "unavailable"`。它們不得假裝已完成，但也不得破壞已就緒 section 的啟動。

### 4.1 Batch 17C-6 transitional / compatibility profile

17C-6 必須先提供下列 **migration/test contract**，保持目前功能可啟動；這些 baseline 數字只重現既有行為，**不是最終產品 X/Y/Z/W quota**：

```js
{
  profileVersion: "17c6-compat-v1",
  profileKind: "transitional-compatibility",
  levels: {
    N5: { total: 20, sections: {
      vocabulary: { included: true, status: "available", total: 10, questionTypes: { meaning: 10 } },
      grammar: { included: true, status: "available", total: 10, questionTypes: { meaning: 5, cloze: 5 } },
      reading: { included: false, status: "unavailable", total: null, questionTypes: {} },
      listening: { included: false, status: "future", total: null, questionTypes: {} }
    } },
    N4: { total: 34, sections: {
      vocabulary: { included: true, status: "available", total: 10, questionTypes: { meaning: 10 } },
      grammar: { included: true, status: "available", total: 10, questionTypes: { meaning: 5, cloze: 5 } },
      reading: { included: true, status: "available", total: 14, selectionMode: "legacy-fixed-manifest", questionTypes: { "legacy-reading-question": 14 } },
      listening: { included: false, status: "future", total: null, questionTypes: {} }
    } }
  }
}
```

因此 N5 可繼續啟動既有 vocabulary + grammar；N4 可繼續啟動既有 vocabulary + grammar + reading。future listening 與 unavailable N5 reading 只因 `included: false` 留在 schema 中，不得阻止 compatibility profile。Batch 17C-10 才依擴充後 inventory 切換／調整正式固定 quota；Batch 17D-2 才把 listening 改為 `included: true`、`status: "available"` 並配置正式 quota。selection engine 永遠按 included contract 運作，新增 section 不需重寫核心。

### 4.2 Reading quota 的正式單位與 identity

reading section 的 `total` 與各 questionType quota 一律代表**使用者實際回答的 answerable question 數**，不是 passage/set 數。canonical reading question identity 是 `(setId, questionId)`；同 session 不可重複該 pair，但可由同一 set 選中一題以上。

抽到每個 reading question 時必須深度複製完整 context：`displayTitle`、`displayPassage`、`passageKana`、`rubyTerms`、`rubyCoverage`、`sourceSetId`、`setId`、`questionId`、`explanation`、`options` 與 correct answer/index。即使多題 set 只抽中部分 questions，每一題仍攜帶完整 passage metadata；不可只抽 question text。

同一 set 抽到多題時，session 必須保持其原始組內順序。抽題以 question quota 截止，`reading questionSnapshots.length === reading section quota` 必須精確成立；不得因 set 原始題數不同造成總題數漂移。snapshot 另存 `sourceSetQuestionCount`（原 set 題數）和 `selectedSessionQuestionCount`（本場從該 set 選中題數），UI 不得把兩者混用。17C-6 checker 必須直接驗證 reading quota 等於實際 reading questionSnapshots 數量。

## 5. Batch 17C-6 抽題與 snapshot 演算法

必須以 transaction-like 方式全成或全敗：

1. 載入、schema 驗證並正規化所有 bank；拒絕缺 ID、level、section、questionType 或無效四選項的候選。
2. 僅接受明確選定的 N5/N4，讀取同 level、指定 version/profile；只對 `included: true` section 驗證 `status: "available"` 與 quota 加總。`included: false` section 跳過且不得使啟動失敗。
3. 僅為 included section 依 section、questionType 建立 candidate pools。reading pool 以 `(setId, questionId)` 為唯一單位並連結完整 set metadata；不得改寫來源陣列。
4. 在抽取前驗證每一 pool 的 unique eligible count `>= quota`，並全域檢查 source identity 衝突。任何不足即回傳結構化錯誤 `{ level, section, questionType, required, available, profileVersion }`，阻止開始且不建立半個 session。
5. 使用現有 rejection-sampled `crypto.getRandomValues` 與 Fisher–Yates，對每個 pool 無放回抽樣；同 session 的 canonical question identity 不得重複。不得以 `Math.random` 作正式 JLPT 抽題來源。
6. 合併所選題目並按 profile 定義的 section/type ordering 形成 deep-copied、deep-frozen（或等價不可變）**pre-randomization session snapshot**。來源 bank 之後即使變動也不能影響此場。
7. snapshot 每題至少保留 `sourceQuestionId`、`level`、`section`、`questionType`、`sourceBank`、原始 correct answer/index、`options`、`explanation`、kana/kanji/ruby metadata。reading 必須保留完整 passage metadata、`sourceSetId`、`setId`、`questionId`、`sourceSetQuestionCount`、`selectedSessionQuestionCount`，並在同 set 內維持來源順序。adapter 不共享 mutable runtime state。
8. 在發布前驗證每個 included section 的 snapshot 數量等於其 section total；reading 必須另外明確驗證 `reading questionSnapshots.length === reading quota`，計數單位只能是 answerable questions。
9. 僅在 selection 與 snapshot 完整成功後，按**本次實際總題數**產生 balanced answer-position table，再複製 options、排列並同步更新 correct `answerIndex`。其他 metadata 必須原封保留。
10. 最後一次性發布完整 memory-only session；錯誤路徑不發布。原始題庫、原始 options 與 pre-randomization snapshot 均不得被修改。

### Architecture invariant（PR #288 相容性）

> **QUESTION SELECTION → SESSION SNAPSHOT → BALANCED ANSWER POSITION GENERATION → OPTION RANDOMIZATION**

絕不可先對整個 bank 配置答案位置再抽子集，否則固定題數 session 可能失去每格差至多 1 的平衡。正確答案必須以原 index/identity 追蹤，不能只靠可能重複的選項文字。

### 新測驗行為

同 level 再開始時使用同 profile version，因此總數、section quota、questionType quota 相同；重新無放回抽取本場題目，並重新排列選項。兩場之間允許自然重複，不建立跨 session 排除表，也不新增 LocalStorage；離開／重整仍是 memory/session based。

### Insufficient-pool policy

例如 quota 需要 N5 reading 6 題而有效 pool 只有 4 題，必須阻止 profile 啟動、顯示含 level/section/questionType/required/available 的可理解錯誤，且不發布 session。禁止自動縮減成 4 題、借 N4、複製題、略過 section、改總數或任何 silent fallback。17C-6 checker 必須用不足 fixture 驗證原子失敗，並驗證沒有 session、沒有 bank mutation。

## 6. 資料重用與擴充策略

### 6.1 Sentence composition（17C-8）

優先由 60 題 source bank 建立只讀 derived adapter，不重抄人工題庫。adapter 以 source ID 產生穩定 `sourceQuestionId`，複製 chunks/correctOrder/starSlot/completeSentence/kana/explanation/grammarIds，且只納入 `uniqueAnswerReviewed === true` 並重跑 permutation/unique-answer audit。JLPT 的題幹、四選項、★顯示和 kanji/kana policy 在 adapter 層獨立處理；一般句子重組功能繼續讀原資料與自己的 mutable state。不得共享 state、改原 bank、改既有 LocalStorage key/schema。

### 6.2 Reading（17C-9）

N4 已能由 canonical mapping 覆蓋 short、medium、information-search，notice/message 可作補充類；quota 應依 canonical key 並以 answerable questions 計數，而非 30 個來源 type label或 set 數。現行 fixed manifest 10 組／14 題只是 compatibility baseline，不是未來最終 quota。N5 是真正 0 組／0 題，17C-9 應先制定 N5 passage 長度、詞彙／漢字／ruby、唯一答案與資訊檢索素材規範，再新增經人工審閱的 source sets，透過現有 build/derived 模式產生 bank；不可降級借用 N4，也不可在本 Batch 大量造題。

### 6.3 Listening（17D-1、17D-2）

17D-1 先盤點並正規化現有 100 題至穩定 data layer，明確分離情境 `category` 與真正 `questionType`，驗證 N5/N4、音訊或 speech fallback、逐字稿/kana、四選項及唯一答案。暫以 `section="listening"`、`questionType="meaning-response"` 表示現有能力，實際 taxonomy 由 17D-1 定案。17D-2 只需註冊新 bank adapter 與 profile quota，沿用相同 pool validation、selection、snapshot 和答案位置流程，不重寫 session architecture；17D-3 完整驗收。

## 7. Checker 與 regression contract

本 Batch checker 必須：以 baseline commit 確認 PR #288 helper、crypto/Fisher–Yates、20/34 及 snapshot-before-balance 順序仍在；從 JSON/JS 動態計算上述 inventory 並比對本文件 machine-readable inventory；驗證 matrix/contract/不足 policy/immutable snapshot/new-session/listening/N5 gap/handoff 關鍵語意；只允許新增本文件與 checker。它也拒絕新檔中的 storage/cache 寫入語意，並以 git diff 保護 runtime、HTML/CSS、全部題庫和歷史 checker。歷史 checker不修改、不弱化。

## 8. 已確認的 handoff 順序

1. **Batch 17C-5**：題型擴充＋固定題數總設計（本文件）
2. **Batch 17C-6**：固定題數抽題引擎
3. **Batch 17C-7**：N5/N4 單字題型擴充
4. **Batch 17C-8**：N5/N4 文法題型擴充
5. **Batch 17C-9**：N5/N4 閱讀題型擴充＋N5 閱讀資料
6. **Batch 17C-10**：固定題數＋新題型整合驗收
7. **Batch 17D-1**：Listening data layer / inventory
8. **Batch 17D-2**：Listening 題型＋固定題數整合
9. **Batch 17D-3**：Listening 完整驗收
10. **Batch 17E-1**：JLPT 結果／成績頁
11. **Batch 17E-2**：JLPT 錯題本／生字本整合
12. **Batch 17E-3**：Batch 17 最終完整回歸

17C-5 到此停止：不開始 17C-6、不新增題目、不修改 UI 或 runtime。
