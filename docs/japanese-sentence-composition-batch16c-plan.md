# Batch 16C-1：日文句子重組「練習／測驗」雙模式盤點與安全設計

## 1. 本批範圍與不可變更項目

本批只新增盤點、設計文件與 plan checker，不修改正式 UI、runtime、題庫或 storage。禁止修改 `script.js`、`style.css`、`japanese/index.html`、`japaneseSentenceCompositionQuestions.json`、`vocabulary.json`、`grammar.json`、`japaneseReadingQuestions.js`、現有 storage schema、現有 cache query。

目前分支基於已含下列合併紀錄的 main 狀態：PR #263 句子重組初版、PR #264 ★格單選判定、PR #265 JLPT 試卷式連續句子排版。

## 2. 目前入口盤點

### 日文首頁主入口

日文首頁目前維持 5 個主入口：單字、閱讀、文法、聽力、複習中心。正式實作不得新增第 6 個主入口；句子重組仍放在文法選單內。

### 目前文法選單入口

目前文法選單有 3 個入口：

1. 文法練習：`data-japanese-grammar-entry="practice"`
2. 文法測驗：`data-japanese-grammar-entry="quiz"`
3. 句子重組：`data-japanese-grammar-entry="sentence-composition"`

### 下一批文法選單入口設計

下一批正式實作需調整為四個文法選單入口，不新增額外句子重組子選單：

1. 文法練習：`data-japanese-grammar-entry="practice"`
2. 文法測驗：`data-japanese-grammar-entry="quiz"`
3. 句子重組練習：建議 `data-japanese-grammar-entry="sentence-composition-practice"`
4. 句子重組測驗：建議 `data-japanese-grammar-entry="sentence-composition-quiz"`

## 3. 目前句子重組 view 與狀態盤點

目前句子重組使用 `japaneseSentenceCompositionView`，view attribute 為 `data-japanese-grammar-view="sentence-composition"`，內容 root 為 `sentenceCompositionContent`。進入流程由文法選單呼叫 `openJapaneseSentenceCompositionPractice()`，再透過 `renderJapaneseGrammarView("sentence-composition")` 顯示；返回由文法頁既有返回流程與 view 切換負責。當離開 grammar panel 或句子重組 view 隱藏時，會呼叫 `resetJapaneseSentenceCompositionState()` 清空當前題目、選擇與 locked 狀態。

目前狀態變數：

- 題庫載入狀態：`sentenceCompositionQuestions`、`sentenceCompositionHasLoaded`、`sentenceCompositionIsLoading`
- level 篩選：`activeSentenceCompositionLevel`
- 當前題目：`currentSentenceCompositionQuestion`
- 使用者選擇：`currentSentenceCompositionAnswer`
- locked 狀態：`currentSentenceCompositionLocked`
- 上一題 ID：`previousSentenceCompositionQuestionId`

## 4. ★位置、選項號碼與練習回饋盤點

目前 JLPT 排版為連續句子：`before` + 四個括號 + `after`，四格中依 `starSlot` 動態顯示 `（★）`，其他格顯示 `（　）`。題目提示保留：`★ に入るものはどれですか。`

目前正解計算：

- `starSlot` 決定哪一格是 ★。
- ★ 正確 chunk id 為 `correctOrder[starSlot]`。
- `chunks` 原始順序就是畫面四個選項的顯示順序。
- ★ 正確選項號碼為 `chunks.findIndex(chunk.id === correctOrder[starSlot]) + 1`。

目前練習模式作答後立即顯示：答對／答錯、★正確選項、完整正確順序、`completeSentence`、`kana`、`meaning`、`explanation`。

## 5. 題庫基準

目前 `japaneseSentenceCompositionQuestions.json` 基準：

- total=20
- N5=8
- N4=12
- duplicate question ID：0
- missing required fields：0
- starSlot 分布：0/1/2/3 各 5 題
- ★正確選項位置分布：選項 1/2/3/4 各 5 題

## 6. 錯題本盤點

目前錯題本 storage key 為 `japanese_mistake_book_v1`。現有 questionType 實際名稱：

- `vocabularyMeaning`
- `grammarMeaning`
- `grammarCloze`
- `readingQuestion`
- `listeningMeaning`

錯題寫入由 `recordJapaneseMistake()` 負責。dedupe key 由 `createJapaneseMistakeDedupeKey()` 依 questionType 定義的 `keyParts` 組成；目前 grammar 類型實際形式為 `grammar:<questionType>:<itemId>`。現有 schema 保留 `module`、`questionType`、`itemId`、`relatedId`、`wrongCount`、`lastWrongAt`、`userAnswer`、`correctAnswer`、`createdAt`、`updatedAt`。

安全行為：缺少穩定 ID 時 warning once 並略過寫入，不中斷測驗；JSON 損壞、schema 錯誤會 normalize 成空錯題本；localStorage 讀寫例外時使用記憶體 fallback。清空錯題本只寫回空的 `japanese_mistake_book_v1`，不應影響生字本或 `japanese_vocabulary_seen_counts`、`japanese_grammar_seen_counts`、`japanese_listening_seen_counts` 三個 seen-count keys。

錯題本頁目前依 `questionType` 分支顯示題目：單字、文法意思、文法填空、閱讀、聽力各有解析欄位；未知或題庫移除時顯示 fallback 欄位。要讓句子重組可閱讀、可移除，需新增 `sentenceComposition` label、解析分支，以及足以重建題目的欄位保留規則。

## 7. sentenceComposition 錯題本整合設計

建議新增 questionType：`sentenceComposition`。dedupe key：`grammar:sentenceComposition:<questionId>`。不新增新的 localStorage key，沿用 `japanese_mistake_book_v1`。

錯題資料至少需足以重建：`questionId`、`level`、`before`、`after`、`chunks`、`starSlot`、`correctOrder`、`selectedChunkId`、`correctStarChunkId`、`completeSentence`、`kana`、`meaning`、`explanation`、`source`、`wrongCount`、`createdAt`、`updatedAt`、`lastWrongAt`。

規則：

1. 只有測驗模式答錯才記錄。
2. 練習模式不記錄。
3. 同一題再次答錯不新增第二筆，累加 `wrongCount`。
4. 答對不得自動刪除既有錯題。
5. 缺少穩定 `questionId` 時不得中斷測驗，只顯示一次性 warning，安全略過錯題寫入。
6. 不新增 localStorage key。
7. 不影響生字本或 seen-count keys。
8. 錯題本必須能顯示「句子重組」分類並單題移除。
9. 清空錯題本必須包含句子重組錯題，但不清除其他 storage key。

需修改範圍：`JAPANESE_MISTAKE_QUESTION_TYPES`、錯題 normalize 保留句子重組欄位、測驗結果寫入 hook、錯題本 label、錯題本渲染分支、單題移除仍沿用既有 dedupe key。

## 8. 雙模式入口與標題規則

日文首頁維持 5 個主入口。文法選單改成：文法練習、文法測驗、句子重組練習、句子重組測驗。

標題規則：頁面主標題為「句子重組」；練習頁模式標示為「練習模式」；測驗頁模式標示為「測驗模式」；移除主標題 `文の組み立て ★格選擇`；題目提示仍保留 `★ に入るものはどれですか。`。

## 9. 練習模式契約

1. 保留已確認正確的 JLPT 排版：`before（　）（★）（　）（　）after`，且 ★ 依 `starSlot` 動態出現。
2. 提供全部／N5／N4 篩選。
3. 每題可立即確認答案。
4. 作答後立即顯示答對／答錯、★正確選項、完整正確順序、`completeSentence`、`kana`、`meaning`、`explanation`。
5. 不計分。
6. 不寫入錯題本。
7. 不新增 localStorage。
8. 下一題避免立即重複。

## 10. 測驗模式契約

1. 測驗開始前選擇 N5、N4、混合。
2. 每次固定 5 題。
3. 同一次測驗內不得重複題目。
4. 題庫足以支援 N5：8 題中抽 5 題；N4：12 題中抽 5 題；混合：20 題中抽 5 題。
5. 顯示進度，例如 `第 2 題／共 5 題`。
6. 題型與練習相同：連續句子、四個括號、動態 ★、四個編號選項。
7. 作答時不顯示答對／答錯、正確選項、完整順序、kana、中文、explanation。
8. 使用者選擇並確認後，才可進入下一題。
9. 第一版不加入倒數計時。
10. 第一版不加入上一題返回修改答案。
11. 第 5 題完成後顯示結果頁。
12. 結果頁顯示答對題數、答錯題數、百分比、每題使用者答案、★正確答案、完整正確順序、`completeSentence`、`kana`、`meaning`、`explanation`。
13. 測驗完成後可再測一次或返回文法選單。

## 11. 狀態與 view isolation 設計

建議拆分四個狀態區塊：

- sentence composition practice：練習篩選、目前題目、目前選擇、locked、上一題 ID。
- sentence composition quiz setup：測驗 level 選擇與開始狀態。
- sentence composition quiz question：本場 5 題題目順序、目前 index、每題答案、確認狀態。
- sentence composition quiz result：統計與逐題結果。

練習與測驗不得共用選項、locked、題目順序或結果。從測驗返回文法選單後重新進入不得殘留上一場進度；從練習切到測驗不得殘留即時解析；從測驗切到練習不得殘留分數；進入單字、閱讀、聽力或複習中心時句子重組狀態應安全重置。題庫可共用載入快取，但作答狀態必須分離。

## 12. 安全與無障礙規則

題庫內容必須使用 `textContent`／DOM API 插入，禁止用 `innerHTML` 插入題目或答案。四個選項使用真正 `button`，維持 `aria-pressed`、`role=status`／`aria-live`。鍵盤需支援 Tab、Enter、Space，焦點需有 `focus-visible`。手機需自然換行，`（　）`、`（★）` 不得從中間斷行，保留 safe-area bottom padding。不可將完整題目以 `console.log` 輸出。

## 13. 後續拆分

### Batch 16C-2A

文法選單拆成「句子重組練習／句子重組測驗」；主標題改為「句子重組」；增加練習／測驗模式標示；建立測驗設定頁與 view isolation；保留練習功能不變；尚不寫入錯題本。

### Batch 16C-2B

實作 5 題測驗引擎；結果頁；`sentenceComposition` 錯題寫入；錯題本顯示與移除；storage fallback。

### Batch 16C-3

完整回歸；手機網頁測試；練習／測驗／錯題本狀態隔離；最終安全檢查。
