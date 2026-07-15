# Batch 15A-1 日文複習中心、生字本與錯題本盤點設計

## 1. 本批範圍
- 本批只做盤點與設計，不新增正式功能、不新增日文首頁入口、不新增按鈕、不新增 localStorage key、不修改答題流程。
- Batch 15A 不納入間隔重複、弱點排行、統計圖表、熟練度、自動排程、每日複習提醒、雲端同步、帳號系統、匯出／匯入；以上留給 Batch 15B 或更後面另做。
- 本批新增檢查與文件：`scripts/audit-japanese-review-center-batch15a.js`、`scripts/check-japanese-review-center-batch15a-plan.js`、本文件。
- 不修改 `script.js`、`style.css`、`japanese/index.html`、`vocabulary.json`、`grammar.json`、`japaneseReadingQuestions.js`、英文網站或正式題庫。

## 2. 現有日文 storage key 與格式
| key | 用途 | 格式 | 清除規則 |
| --- | --- | --- | --- |
| `japanese_vocab_seen_counts` | 單字練習與單字測驗抽題 seen-count | JSON object；`vocabulary.id` 或 fallback word -> 正整數 | 不得被生字本／錯題本清除 |
| `japanese_grammar_seen_counts` | 文法練習、文法意思測驗、文法填空測驗抽題 seen-count | JSON object；`grammar.grammarId ?? grammar.id ?? grammar` -> 正整數 | 不得被生字本／錯題本清除 |
| `japanese_reading_seen_counts` | 閱讀練習與閱讀測驗文章抽題 seen-count | JSON object；`readingSet.id` -> 正整數 | 不得被生字本／錯題本清除 |

現有讀寫工具在 JSON 損壞、private mode 或 localStorage 不可用時會安全回傳 `{}` 或忽略寫入失敗。未來新資料也應沿用此安全降級策略。

## 3. 現有 view 狀態與 isolation
現有日文頂層 view：`home`、`vocabulary`、`grammar`、`reading`、`listening`、`listeningMenu`、`listeningPractice`、`listeningQuiz`。內層 view 包含單字 `menu/practice/quiz`、文法 `menu/practice/quiz`、閱讀 `menu/practice/quiz`、聽力 `menu/practice/quiz`。

Batch 15A-2 建議新增頂層 view：
- `reviewMenu`
- `vocabularyBook`
- `mistakeBook`

需要調整：
- `normalizeJapaneseView`：白名單加入三個 review view；未知值仍回 `home`。
- `getJapaneseViewElement`：新增 review center 專用容器，不共用單字／文法／閱讀／聽力容器。
- `renderJapaneseView`：切換至 review view 時隱藏既有四模組 panel，切回日文首頁或複習中心時清空生字本／錯題本的暫存 render nodes。
- 返回日文首頁：呼叫 review reset helper，移除 review content children，避免殘留。
- 返回複習中心：清空子頁內容，只顯示 review menu。
- 新增 view-isolation 檢查：確認 review content 不在 vocabulary、grammar、reading、listening panel 內；四個既有入口仍存在；切換 view 不留下 review CSS active state。

## 4. 答題流程與穩定 ID 盤點
| 測驗 | 現有處理接點 | 穩定 ID | 可安全記錄數量 | 備註 |
| --- | --- | --- | ---: | --- |
| 日文單字測驗 | `renderQuizQuestion` option click -> `handleQuizAnswer` | `vocabulary.id` | 3241 | `questionType: vocabularyMeaning` |
| 日文文法意思測驗 | `handleQuizAnswer` with grammar quiz meaning | `grammar.id` | 290 | `questionType: grammarMeaning` |
| 日文文法填空測驗 | `handleQuizAnswer` with cloze type | `grammar.id` + `questionType` | 130 | 題目來自 `grammar.quiz`，不需另補 ID |
| 日文閱讀測驗 | `renderReadingQuizSet` inline option click stores `readingQuizAnswers` | `readingSet.id` + `question.id` | 150 | 顯示時用文章與題目 ID 回題庫重建 |
| 日文聽力測驗 | `renderJapaneseListeningQuizQuestion` inline option click | `JAPANESE_LISTENING_QUESTIONS[].id` | 100 | 題庫有 `jl-001`～`jl-100` |

無法安全記錄項目：無。若 Batch 15A-2 實作時發現題目缺 ID，不可動態用題目文字當主鍵；最小安全方案是略過該題並在 console/debug audit 記錄缺漏，另批補穩定 ID。

答對後處理規則可套用至五種測驗：答錯時加入或更新；同題再次答錯只增加 `wrongCount`；後來答對不自動刪除；使用者手動移除；熟練度、連續答對、弱點排行留至 Batch 15B。

## 5. 生字本來源設計
核准來源只有兩個：
1. 日文單字練習卡：在 `createCard(word, index)` 產生「加入生字本」按鈕，使用 `word.id`。
2. 閱讀練習查字卡：在 `showReadingLookupCard(card, lookup)` 查到 vocabulary item 後加入按鈕，保存 `lookup.id`。

暫不從單字測驗選項、閱讀測驗、文法頁面、聽力頁面或英文網站加入。

行為：
- 「加入生字本」按鈕使用安全 DOM API 建立，文字以 `textContent` 設定。
- 已加入時顯示「已加入生字本」或「移出生字本」，並更新 `aria-pressed/disabled` 設計。
- `itemsById` 以 vocabulary id 去重；重複加入只更新 `updatedAt` 與來源，不新增第二筆。
- 移除單筆只刪除該 vocabulary id。
- vocabulary item 已不存在時，列表顯示「此單字已從題庫移除」並保留移除按鈕，不用 localStorage 內容覆蓋正式題庫。
- 閱讀活用形查字加入時保存基本形 vocabulary id；複合詞片段加入時保存實際點擊片段的 vocabulary id。

## 6. 錯題本來源設計
只記錄測驗模式，不記錄練習模式。建議在各測驗「確認答錯」的既有接點後呼叫小型記錄 helper，不改變答題判定順序。

每筆至少保存：`module`、`questionType`、`itemId/questionId`、`relatedId`、`wrongCount`、`lastWrongAt`、`userAnswer`、`correctAnswer`、`createdAt`、`updatedAt`。不得保存完整題庫物件；顯示時以穩定 ID 回 `vocabulary.json`、`grammar.json`、`japaneseReadingQuestions.js` 或聽力題庫取得最新內容。

去重 key 建議：
- 單字：`vocabulary:vocabularyMeaning:<vocabularyId>`
- 文法意思：`grammar:grammarMeaning:<grammarId>`
- 文法填空：`grammar:grammarCloze:<grammarId>`
- 閱讀：`reading:readingQuestion:<readingSetId>:<questionId>`
- 聽力：`listening:listeningMeaning:<listeningId>`

## 7. 建議 storage schema（本批不新增 key）
### `japanese_vocabulary_book_v1`
```json
{
  "schemaVersion": 1,
  "itemsById": {
    "vocab-0001": {
      "vocabularyId": "vocab-0001",
      "source": "vocabulary-card",
      "createdAt": "2026-07-15T00:00:00.000Z",
      "updatedAt": "2026-07-15T00:00:00.000Z"
    }
  }
}
```

### `japanese_mistake_book_v1`
```json
{
  "schemaVersion": 1,
  "itemsById": {
    "vocabulary:vocabularyMeaning:vocab-0001": {
      "module": "vocabulary",
      "questionType": "vocabularyMeaning",
      "itemId": "vocab-0001",
      "relatedId": "vocab-0001",
      "wrongCount": 1,
      "lastWrongAt": "2026-07-15T00:00:00.000Z",
      "userAnswer": "使用者當時答案",
      "correctAnswer": "正確答案",
      "createdAt": "2026-07-15T00:00:00.000Z",
      "updatedAt": "2026-07-15T00:00:00.000Z"
    }
  }
}
```

安全規則：
- `schemaVersion` 必填；未知版本可保留 migration 入口，不能直接拋錯。
- 讀取損壞 JSON、非 object、缺 `schemaVersion`、`itemsById` 非 object 時回空資料並允許重新寫入。
- localStorage 不可用時提供記憶體空資料或停用相關按鈕提示，不讓網站崩潰。
- 單筆刪除：刪除 `itemsById[id]` 後寫回同一 key。
- 全部清除：二次確認後只把該新 key 重設為空 schema 或 removeItem；不得碰 `japanese_*_seen_counts`。
- localStorage 只保存在同一瀏覽器／同一裝置；清除瀏覽器網站資料後會消失；不跨裝置同步；不上傳伺服器；未來跨裝置同步必須另做帳號與後端。

## 8. 複習中心 UI 設計
- 日文首頁新增第五個入口「複習中心」，不破壞單字、閱讀、文法、聽力四入口。
- 複習中心中頁：生字本、錯題本、返回日文首頁。
- 生字本頁：收藏數量；單字、假名、詞性、中文意思、程度；查看例句；單筆移除；清空生字本；空白狀態；返回複習中心。
- 錯題本頁：依單字／文法／閱讀／聽力分組；顯示題目、當時答案、正確答案、錯誤次數；單筆移除；清空錯題本；空白狀態；返回複習中心。
- 手機版：單欄、不橫向捲動、按鈕容易點擊、清除操作二次確認。

## 9. 安全要求
- 題庫與使用者資料顯示使用 `textContent`、`createElement`、`replaceChildren`；不以 `innerHTML` 插入 localStorage 內容。
- 使用者資料不可覆蓋正式題庫。
- 清除生字本／錯題本不影響 seen-count key。
- 不新增外部套件、API、後端、登入功能。
- 不修改英文網站，不做大型 `script.js` 重構。

## 10. Batch 15A-2 建議拆分
1. Batch 15A-2A：儲存工具與生字本。先建立安全 storage helper、兩個加入來源、列表與刪除規則。
2. Batch 15A-2B：錯題記錄。逐一接入五種測驗錯題 helper，確保答題流程不變。
3. Batch 15A-2C：複習中心 UI 與 view isolation。加入首頁入口、中頁、子頁與 responsive CSS。
4. Batch 15A-2D：合併後回歸與網頁實測。跑全部檢查、手動驗證手機與桌面流程。

維持此順序的理由：先完成資料層與生字本最小閉環，再接錯題，最後接 UI/view isolation，可降低同時修改 `script.js` 大範圍區塊的風險。

## 11. vocabulary.json 基準
- vocabulary total = 3241
- N5 = 1021
- N4 = 2220
- duplicate id = 0
- duplicate word = 0
- missing required fields = 0
