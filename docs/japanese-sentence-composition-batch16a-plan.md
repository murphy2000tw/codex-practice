# Batch 16A-1：日文句子重組題型盤點與安全設計

## 範圍結論

Batch 16A-1 僅做架構盤點、資料契約設計與檢查程式。句子重組定位在日文文法模組；本批不新增日文首頁第六個入口，未新增正式 UI，未新增正式題庫，未新增 JLPT 完整模擬測驗，未做全站漢字／ruby 調整，也不修改既有 storage schema 或 cache query/version。

## 現況盤點

- `japanese/index.html` 的日文首頁維持單字、閱讀、文法、聽力、複習中心五個入口；文法入口進入 `japaneseGrammarMenuView`。
- 現有文法選單只有兩個入口：`data-japanese-grammar-entry="practice"` 的「文法練習」與 `data-japanese-grammar-entry="quiz"` 的「文法測驗」。未來第三個入口「句子重組」應加入文法選單，不應加入日文首頁。
- `script.js` 以 `renderJapaneseView` / `switchJapaneseTab` 隔離 home、vocabulary、grammar、reading、listening、reviewMenu、vocabularyBook、mistakeBook 等 view；離開 review panel 時會清空複習中心 DOM。
- 文法練習使用 `grammarItems`、分類/級數/搜尋 state、seen counts 與 `createGrammarCard` 顯示文法、假名、意思、接續、用法、例句與解析；返回流程應回文法選單。
- 文法意思測驗以 `activeMode === "grammar-quiz"`、`activeGrammarQuizType === "meaning"`、`activeQuestion`、答題統計與本輪 seen key 選題；答錯會以 `grammarMeaning` 寫入 `japanese_mistake_book_v1`。
- 文法填空測驗以 `activeGrammarQuizType === "cloze"` 使用 `grammar.quiz.clozePrompt`、`choices`、`answer`、`explanation`；答錯會以 `grammarCloze` 寫入 `japanese_mistake_book_v1`。
- `grammar.json` 目前基準為 290 筆，其中 130 筆具有 cloze quiz。這些資料可提供文法關聯與部分句型來源，但不適合直接自動產生 JLPT 句子重組題，因為現有欄位沒有四片段唯一排列、★位置、完整排列答案或「唯一自然答案」審核結果。
- `japanese_mistake_book_v1` 目前支援 `grammarMeaning` 與 `grammarCloze`。未來新增 `sentenceComposition` 時應沿用同一 localStorage key，只新增 questionType 與 resolver/render 分支，不新增新的 localStorage key。
- 現有 DOM 多數動態 review 欄位以 `createElement`、`textContent`、`replaceChildren` 組合；未來句子重組題目與答案資料不得使用 innerHTML 插入題目或答案資料。
- `japanese/index.html` 與 `script.js` 已有 `aria-live="polite"` / role status 慣例。手機版應使用可換行的片段按鈕、足夠觸控尺寸；鍵盤操作應保留 button 語意、focus 可見與 Enter/Space 作答。

## 建議資料 schema

```json
{
  "id": "sc-n5-001",
  "level": "N5",
  "before": "わたしは",
  "after": "。",
  "slots": ["", "", "★", ""],
  "chunks": [
    { "id": "a", "text": "日本語を" },
    { "id": "b", "text": "勉強して" },
    { "id": "c", "text": "います" },
    { "id": "d", "text": "毎日" }
  ],
  "correctOrder": ["d", "a", "b", "c"],
  "starSlot": 2,
  "completeSentence": "わたしは毎日日本語を勉強しています。",
  "kana": "わたしはまいにちにほんごをべんきょうしています。",
  "meaning": "我每天在學日文。",
  "explanation": "時間副詞與受詞放在動詞片語前，形成自然語順。",
  "grammarIds": ["n5-teimasu"]
}
```

欄位規範：

- `id`：穩定且不可重複，排序採檔案順序或字典序並固定。
- `level`：只能是 `N5` 或 `N4`。
- `before` / `after`：★四格外的句型框架文字；若未來需要更彈性可改為等價 `frameParts`，但仍需能重建完整句。
- `chunks`：正好四個物件，每個含穩定 `id` 與顯示 `text`，文字不得重複。
- `correctOrder`：四個 chunk ID 的完整排列。
- `starSlot`：0–3 的整數，代表 `correctOrder` 中對應 ★格的位置。
- `completeSentence`、`kana`、`meaning`、`explanation`：作答後回饋必備，不得空白。
- `grammarIds`：可選；若提供，必須能對應 `grammar.json` 的 `id`。

## checker 規則

1. 每題正好四個片段。
2. chunk ID 與文字均不可重複。
3. correctOrder 必須完整包含四個 chunk ID，且不得多、少或重複。
4. starSlot 必須合法：必須是 0、1、2、3。
5. 正確答案必須可由 `correctOrder[starSlot]` 唯一推導。
6. 依 `before + correctOrder 對應文字 + after` 重組後，重組結果必須與 completeSentence 一致；若採 `frameParts`，也必須由 checker 以同一規則重建。
7. 每題只能有一個合理答案；此點需要人工審題欄位或審核紀錄輔助，checker 至少要求 `uniqueAnswerReviewed === true` 或等價審核標記。
8. `id` 不重複且排序穩定。
9. `level` 只能是 `N5` 或 `N4`。
10. `kana`、`meaning`、`explanation` 不得空白。
11. 若有 `grammarIds`，每個 ID 必須存在於 `grammar.json`。
12. 實作檢查不得使用 `innerHTML` 插入題目或答案資料；應用 `textContent`、`createElement`、`replaceChildren`。

## 練習模式與測驗模式

### 練習模式

- 學習者排列全部四個片段。
- 作答前可顯示題目框架與片段，但不直接透露正確排列。
- 作答後顯示正確完整句子、完整假名、中文意思及解析。
- 可以重新排列或前往下一題。
- 可用拖放以外的按鈕式上移/下移設計，確保手機版與鍵盤可用。

### 測驗模式

- 呈現四個空格及 ★，只回答 ★位置應填入哪個片段。
- 作答前不得顯示正確順序、中文提示或解析。
- 作答後才顯示結果、正確完整句子、假名、中文意思與解析。
- 未來答錯時寫入既有 `japanese_mistake_book_v1`。
- 建議 `questionType`：`sentenceComposition`。
- 建議 dedupe key：`grammar:sentenceComposition:<questionId>`。
- 不新增新的 localStorage key。

## view isolation 與安全規則

- 句子重組應是文法模組的獨立子頁/子 view，不混入單字、閱讀、聽力或複習中心 DOM。
- 新 view 應在離開時清理作答狀態與回饋 DOM，避免回到文法選單或其他模組時殘留。
- 不處理 JLPT 完整模擬頁面；此題型只模擬 JLPT 常見「★位置作答」格式。
- 題目、片段、解析、假名、中文意思一律走 safe DOM，不以 `innerHTML` 組合使用者可見資料。
- aria-live 僅用於狀態與作答結果，不應在每次片段 focus 移動時過度播報。

## 後續拆批建議

- Batch 16A-1：架構盤點與資料契約設計（本批）。
- Batch 16A-2：建立資料來源、checker 與第一批人工可審查題目。
- Batch 16B：句子重組練習頁。
- Batch 16C：JLPT 星號測驗與錯題本整合。
- Batch 16D：完整回歸與實際網頁測試。

## regression 結論

本批盤點未發現需要立即修正的 regression。題庫基準維持 `grammar.json` 290 筆、cloze 130 筆；storage 基準維持 `japanese_mistake_book_v1`，且未新增正式 UI、正式題庫、JLPT 模擬或漢字／ruby 調整。
