# Batch 17A-1：獨立 JLPT 測驗專區與漢字顯示政策規劃

> 本文件只做現況盤點與後續規劃；本 repository 目前沒有官方 JLPT 規格來源，因此以下一律定位為「站內 JLPT 風格模擬測驗」，不得宣稱已完整符合官方 JLPT。

## 1. 現況盤點

### 入口與頁面
- `japanese/index.html` 目前只有日文主入口、單字、閱讀、文法、聽力與複習中心，主入口卡片使用 `data-japanese-entry="vocabulary|reading|grammar|listening"`。
- 單字子選單有單字練習與單字測驗；文法子選單有文法練習、文法測驗、句子重組練習、句子重組測驗。
- 閱讀頁明文標示「閱讀練習保留 ruby 輔助；閱讀測驗模式維持不顯示 ruby」。聽力頁有聽力練習與聽力測驗。
- 快取版本：`style.css?v=2.9`、`script.js?v=3.3`、`japaneseSentenceCompositionQuestions.json?v=16d3b`。

### 資料數量與欄位
- `vocabulary.json`：共 3241 筆，N5 1021、N4 2220。主要欄位為 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- `grammar.json`：共 290 筆，N5 80、N4 210。主要欄位為 `id`、`level`、`category`、`grammar`、`kana`、`meaning`、`structure`、`usage`、`example`、`exampleKana`、`exampleMeaning`、`note`、`similar`、`quiz`。
- `japaneseReadingQuestions.js`：`window.JAPANESE_READING_SETS` 共 105 組，全部為 N4；合計 150 題。閱讀組欄位包含 `id`、`level`、`type`、`title`、`passage`、`passageKana`、`questions`、`vocabulary`、`grammarPoints`、`rubyTerms`、`titleRuby`、`passageRuby`；題目欄位包含 `id`、`question`、`options`、`answerIndex`、`explanation`。
- 聽力題庫目前內嵌於 `script.js` 的 `JAPANESE_LISTENING_QUESTIONS`，共 100 題，N5 69、N4 31。欄位為 `id`、`level`、`category`、`japanese`、`kana`、`zh`、`question`、`options`、`answerIndex`。
- `japaneseSentenceCompositionQuestions.json`：共 60 題，N5 30、N4 30。欄位為 `id`、`level`、`before`、`after`、`slots`、`chunks`、`correctOrder`、`starSlot`、`completeSentence`、`kana`、`meaning`、`explanation`、`grammarIds`、`uniqueAnswerReviewed`、`reviewNote`。

### 主要流程與函式
- 日文主視圖由 `normalizeJapaneseView()`、`renderJapaneseView()` 切換，入口按鈕在主頁以 dataset 驅動。
- 單字練習／測驗使用 `loadVocabulary()` 載入資料，練習卡由 `createWordCard()` / `renderWordCards()` 類流程呈現，測驗由 `createQuizQuestion()`、`checkAnswer()`、`updateQuizScore()` 類流程處理。
- 文法練習／測驗使用 `loadGrammar()`、`renderGrammarCards()`、`createGrammarMeaningQuizQuestion()`、`createGrammarClozeQuizQuestion()`、`checkGrammarAnswer()` 等流程。
- 閱讀流程由 `renderJapaneseReadingMenu()`、`renderJapaneseReadingPractice()`、`renderJapaneseReadingQuiz()`、`renderJapaneseReadingView()` 管理；ruby 相關函式包含 `normalizeRubyTerms()`、`getReadingRubyTerms()`、`createRubyPartsFromTerms()`、`renderTextWithRuby()`。
- 聽力流程由 `renderJapaneseListeningMenu()`、`renderJapaneseListeningPractice()`、`startJapaneseListeningQuiz()`、`renderJapaneseListeningQuizQuestion()`、`renderJapaneseListeningQuizResults()` 管理，語音播放由 Web Speech API 相關流程處理。
- 句子重組流程由 `ensureSentenceCompositionLoaded()`、`getFilteredSentenceCompositionQuestions()`、`renderJapaneseSentenceCompositionPractice()`、`renderJapaneseSentenceCompositionQuizSetup()`、`renderJapaneseSentenceCompositionQuizQuestion()`、`renderJapaneseSentenceCompositionQuizComplete()` 管理。

### 生字本、錯題本與 LocalStorage
- 生字本 key 為 `japanese_vocabulary_book_v1`，schema version 1，來源目前限定 `vocabulary-card`、`reading-lookup`。
- 錯題本 key 為 `japanese_mistake_book_v1`，schema version 1，模組包含 vocabulary、grammar、reading、listening，題型包含 vocabularyMeaning、grammarMeaning、grammarCloze、readingQuestion、listeningMeaning、sentenceComposition。
- 單字與文法看過次數 key 為 `japanese_vocab_seen_counts`、`japanese_grammar_seen_counts`；閱讀另有 seen key 產生函式。
- 本批次不新增 LocalStorage key，不改 schema，也不遷移既有資料。

### 目前文字顯示規則
- 單字資料有漢字 `word` 與假名 `kana`，練習卡會同時顯示；測驗主要以 `word` 或中文意思出題並在回饋中顯示解析資訊。
- 文法資料有 `grammar`、`kana`、例句與例句假名；文法填空測驗目前可能以例句／選項組合呈現。
- 閱讀練習模式使用 `rubyTerms`、`titleRuby`、`passageRuby` 與 CSS `.jp-ruby/.jp-rb/.jp-rt` 產生 ruby；閱讀測驗不顯示 ruby／假名。
- 聽力練習顯示日文、假名與中文；聽力測驗先聽音並以中文選項作答，答後顯示日文、假名、中文。
- 句子重組題目與選項目前以題庫字面文字呈現，答後顯示完整句、假名、中文與解析，沒有 rubyTerms 欄位。

## 2. 使用者需求
- 避免 N5 題目無限制出現超出程度的漢字，並建立漢字、假名、ruby 顯示政策。
- 評估一般學習測驗與 JLPT 風格模擬測驗是否分離，並規劃獨立 JLPT 測驗入口或子頁面。
- 需要能重用現有單字、文法、閱讀、聽力與句子重組資料，但不能把現有學習測驗直接包裝成官方 JLPT。

## 3. 一般學習測驗與 JLPT 模擬測驗的定位差異
- 練習模式：以學習與理解為主，可顯示較多輔助，例如假名、中文、ruby、例句與解析。
- 一般學習測驗：以站內學習成效確認為主，可在答題或答後保留程度相符的提示，題型可延續現有單字／文法／閱讀／聽力測驗。
- JLPT 模擬測驗：定位為站內 JLPT 風格模擬測驗，採分級、分區塊、結果頁與重測流程；題面顯示應由題庫欄位明確控制，不應由 runtime 臨時猜測漢字難度。

## 4. JLPT 專區入口與頁面層級建議
- 建議在日文主入口新增「JLPT 模擬測驗」卡片，進入後顯示 JLPT 專區首頁。
- 頁面層級建議：日文首頁 → JLPT 專區 → 等級選擇（N5/N4）→ 測驗設定 → 測驗流程 → 結果與複習。
- 可先使用同一 `japanese/index.html` 內的 view 架構新增子 view，待需求穩定後再評估獨立 `japanese/jlpt.html`。

## 5. N5／N4 等級選擇方式
- 預設先支援 N5、N4，因現有資料只盤點到 N5/N4 或 N4。
- 等級選擇必須影響題庫池、漢字顯示規則、結果統計與錯題標記。
- 若某模組缺少該等級資料，設定頁應明確顯示「暫無足夠題庫」，不可靜默混入其他等級。

## 6. 單字、文法、閱讀、聽力四部分的納入方式
- 單字：可重用 `vocabulary.json` 的 N5/N4 題庫，但 JLPT 題面需要新增或衍生 `displayText`、`kana`、`kanjiPolicy`、`explanation` 等欄位後再納入。
- 文法：可重用 `grammar.json` 的 `quiz` 欄位做意義題與填空題，但需補足 JLPT 題型分類、題幹顯示策略與解析一致性。
- 閱讀：目前 105 組全為 N4，適合先作 N4 閱讀池；N5 閱讀題庫不足，需另行建立。
- 聽力：目前 100 題含 N5 69、N4 31，可先做短句理解型聽力；正式分區需確認音訊來源、播放次數與答後顯示政策。

## 7. 句子重組是否納入及其定位
- 句子重組可列為「文法應用加強」或「站內加分練習」，不建議放入核心 JLPT 模擬分數，避免暗示官方題型一致。
- 若納入 JLPT 專區，應放在「考前文法應用練習」區塊，與單字、文法、閱讀、聽力正式模擬區分。
- 現有 60 題 N5/N4 題庫可重用於練習或獨立小測，但需另行規劃漢字／假名欄位。

## 8. 漢字、假名與 ruby 顯示政策
- 練習模式：可同時顯示漢字、假名、中文、ruby 與解析；閱讀練習保留 ruby；聽力練習可答前顯示日文與假名；句子重組答後顯示完整假名。
- 一般學習測驗：題目答題時顯示程度相符漢字；若題庫標記為超級漢字，應以 ruby 或括號假名提示；答後解析可顯示完整假名、中文與補充說明。
- JLPT 模擬測驗：題面不得由程式自動「全部加假名」或「全部移除 ruby」；每題應明確指定 `displayText`、`kana`、`rubyTerms` 或 `kanjiLevel`／`kanjiPolicy`。N5 題只允許 N5 程度內漢字無提示呈現，超出程度者需改用假名、ruby 或換題；N4 題可呈現 N4 內漢字，超出者需題庫明確標記輔助方式。
- 選項與解析差異：答題選項應遵守模擬測驗的 `displayText`；解析頁可額外顯示 `kana`、中文、文法點與原始漢字，協助學習但不回寫題面。
- 需要新增資料欄位：建議各 JLPT 題目至少有 `level`、`section`、`displayText`、`kana`、`rubyTerms`、`kanjiPolicy`、`sourceIds`、`explanation`、`answerDisplay`。

## 9. 題庫重用範圍
- 可直接盤點與抽樣使用：N5/N4 單字 3241 筆、N5/N4 文法 290 筆、N4 閱讀 105 組／150 題、N5/N4 聽力 100 題、句子重組 60 題。
- 不可直接當成 JLPT 題庫宣告完成：閱讀缺 N5；聽力在 `script.js` runtime 內；單字／文法缺 JLPT 題型與漢字政策欄位；句子重組不是核心 JLPT 模擬區。

## 10. 缺少的題庫與資料欄位
- 缺少 N5 閱讀題庫。
- 缺少獨立聽力題庫檔案與音訊／語音播放策略欄位。
- 缺少每題 `displayText`、`kana`、`rubyTerms`、`kanjiPolicy`、`kanjiLevel`、`sourceIds`、`section`、`timeLimit`、`scoreWeight`、`reviewTags`。
- 缺少 JLPT 模擬結果 schema、錯題回放 snapshot schema 與快取版本策略。

## 11. 測驗狀態、結果頁與重新測驗流程
- 狀態應包含 selectedLevel、sections、currentSection、currentIndex、answers、startedAt、finishedAt、scoreBySection、questionSnapshots。
- 結果頁應顯示總分、各部分答對率、錯題列表、可加入生字本的詞彙、重新測驗與回到 JLPT 專區。
- 重新測驗應重新抽題並重置本次狀態，不清除生字本／錯題本歷史。

## 12. 生字本／錯題本整合方式
- 生字本：JLPT 解析頁可沿用現有生字本資料結構，但新增來源前需另批修改 allow-list；本批次不新增來源。
- 錯題本：JLPT 錯題應先設計 snapshot，避免題庫改版後錯題消失；可在後續批次新增 `jlptVocabulary`、`jlptGrammar`、`jlptReading`、`jlptListening` 題型。
- 需保留現有錯題本 vocabulary、grammar、reading、listening、sentenceComposition 顯示相容。

## 13. LocalStorage 相容與版本策略
- 新功能應使用新 namespace，例如 `japanese_jlpt_mock_state_v1`，但只在實作批次新增。
- schema 必須帶 version，讀取時允許缺欄位 fallback，寫入時不覆蓋既有生字本與錯題本。
- 本批次不新增 LocalStorage key、不改 `japanese_vocabulary_book_v1`、不改 `japanese_mistake_book_v1`。

## 14. 手機版、鍵盤操作與無障礙要求
- JLPT 專區卡片需可用鍵盤 focus 與 Enter/Space 操作。
- 測驗選項需使用 button，提供清楚 `aria-live` 狀態與結果訊息。
- 手機版應避免橫向捲動，閱讀長文需保持行高與 ruby 可讀性。
- 聽力播放按鈕需有可理解文字，並在不支援語音時顯示 fallback 訊息。

## 15. 安全 DOM 要求
- 題庫文字預設使用 `textContent` 或安全節點組裝。
- 若需要 ruby，應以 `document.createElement('ruby')`、`rb`、`rt` 組裝，不直接把題庫字串插入 `innerHTML`。
- 新增 checker 應禁止本批次修改 runtime，後續實作批次需針對 JLPT 新函式檢查危險 `innerHTML`。

## 16. 快取版本管理方式
- 規劃批次不修改任何快取版本。
- 後續只要改 `script.js`、`style.css` 或新增 JLPT 題庫檔案，必須同步更新對應 query version，並在 checker 驗證。
- `japaneseSentenceCompositionQuestions.json` 在本批次仍必須維持 `v=16d3b`。

## 17. 自動測試與人工測試計畫
- 自動測試：新增 `scripts/check-japanese-jlpt-batch17a-plan.js` 驗證本批次只改規劃文件與 checker、PR #279 merge commit、句子重組題數、快取版本與章節完整性。
- 既有回歸：執行日文主入口、生字本、錯題本、單字、文法、閱讀、聽力、句子重組相關 checker，以及 JSON 格式與 `git diff --check`。
- 人工測試：後續 UI 批次需在桌機與手機寬度逐頁確認入口、等級設定、答題、結果、重測、錯題本回放與鍵盤操作。

## 18. 後續分批實作順序

### Batch 17A-2：JLPT 專區入口與等級設定頁
- 目的：建立站內 JLPT 風格模擬測驗入口、專區首頁、N5/N4 等級設定頁。
- 允許修改的檔案：`japanese/index.html`、`script.js`、`style.css`、新 checker、必要文件。
- 禁止修改的檔案：正式題庫 JSON/JS、既有 LocalStorage schema、PR #279 稽核證據。
- 驗收條件：入口可切換但不啟動正式測驗；N5/N4 缺資料提示清楚；無 runtime 題庫變更。
- 測試方式：主入口 checker、view isolation checker、auditSiteHealth、手動鍵盤導覽。
- 前置依賴：Batch 17A-1。

### Batch 17B：單字／文法測驗引擎
- 目的：建立 JLPT 單字與文法題型抽題、答題、解析資料 snapshot。
- 允許修改的檔案：`script.js`、JLPT 衍生題庫或 manifest、checker、文件。
- 禁止修改的檔案：原始 `vocabulary.json`、`grammar.json` 除非另批專門補欄位；閱讀／聽力題庫。
- 驗收條件：N5/N4 單字與文法可依等級抽題；題面遵守 `displayText`／`kana`／`kanjiPolicy`。
- 測試方式：資料欄位 checker、安全 DOM checker、單字文法回歸。
- 前置依賴：Batch 17A-2。

### Batch 17C：閱讀測驗
- 目的：納入 N4 閱讀並規劃或補足 N5 閱讀池。
- 允許修改的檔案：閱讀題庫、JLPT manifest、`script.js`、checker、文件。
- 禁止修改的檔案：單字／文法原始資料與聽力題庫，除非 checker 明確允許。
- 驗收條件：N4 閱讀可作為 JLPT 風格閱讀區；N5 若不足需禁用或顯示不足訊息。
- 測試方式：閱讀 ruby checker、閱讀資料 validator、JLPT 閱讀流程手測。
- 前置依賴：Batch 17B。

### Batch 17D：聽力測驗
- 目的：整理聽力題庫來源、播放策略與 JLPT 聽力區流程。
- 允許修改的檔案：聽力題庫或抽離檔、`script.js`、checker、文件。
- 禁止修改的檔案：單字／文法／閱讀題庫與 LocalStorage schema。
- 驗收條件：N5/N4 聽力依等級抽題；不支援語音時有 fallback；答後顯示假名與中文。
- 測試方式：聽力 state isolation checker、聽力 menu checker、手動播放測試。
- 前置依賴：Batch 17C。

### Batch 17E：結果頁、錯題本與完整回歸
- 目的：完成總結果、分區結果、重測、錯題本／生字本整合與完整回歸。
- 允許修改的檔案：`script.js`、`style.css`、必要 schema 文件、checker。
- 禁止修改的檔案：未列入本批目的的正式題庫內容、舊 PR 稽核證據。
- 驗收條件：結果頁準確；錯題 snapshot 可回放；重新測驗不污染既有 LocalStorage。
- 測試方式：完整日文 checker、auditSiteHealth、LocalStorage migration 手測、手機與鍵盤手測。
- 前置依賴：Batch 17D。

## 19. 明確列出本批次不做的內容
- 不實作 JLPT 測驗 UI。
- 不修改 `japanese/index.html`、`script.js`、`style.css` 的 runtime 行為。
- 不修改 `vocabulary.json`、`grammar.json`、`japaneseReadingQuestions.js`、聽力題庫、`japaneseSentenceCompositionQuestions.json`。
- 不新增 LocalStorage key，不改生字本／錯題本 schema。
- 不修改現有頁面名稱，不合併 PR，不刪除或弱化既有檢查器。
