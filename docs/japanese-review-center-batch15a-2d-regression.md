# Japanese Review Center Batch 15A-2D Regression Report

## A. 使用者已確認

- 原四入口可用。
- 複習中心位於第五入口並排列在最後。
- 生字本與錯題本數量即時更新。
- 單字練習可加入及移出生字本。
- 生字本清單可單筆移除。
- 錯題本清單可單筆移除。

## B. Codex 自動化確認

### 新增 2D checker 覆蓋範圍

- PASS：串接既有 Batch 15A-2A、2B、2C checker。
- PASS：生字本完整生命週期：空 schema、`vocabulary-card`、`reading-lookup`、canonical ID、重複加入 dedupe、createdAt 保留、updatedAt/source 更新、reload、resolve、單筆移除、清空、missing ID、fallback、損壞 JSON／錯誤 schema。
- PASS：錯題本五種題型生命週期：`vocabularyMeaning`、`grammarMeaning`、`grammarCloze`、`readingQuestion`、`listeningMeaning`；首次錯題、重複累加、createdAt 保留、latest fields 更新、答對不寫入、reload、dedupe key、單筆移除、fallback、損壞 JSON／錯誤 schema。
- PASS：五個 storage keys 隔離：`japanese_vocab_seen_counts`、`japanese_grammar_seen_counts`、`japanese_reading_seen_counts`、`japanese_vocabulary_book_v1`、`japanese_mistake_book_v1`。
- PASS：首頁五入口、review views、view isolation、安全 DOM、狀態訊息、手機 CSS 靜態規則。
- PASS：題庫基準：vocabulary total 3241、N5 1021、N4 2220、duplicate id 0、duplicate word 0、missing required fields 0、grammar 290、grammar cloze 130、reading questions 150、listening questions 100、unsegmented ruby span 0。
- PASS：禁止功能未出現：sentenceComposition、句子重組、JLPT 模擬測驗、第六個 Batch 15A storage key、熟練度、弱點排行、間隔複習、統計圖表、每日提醒、雲端同步、帳號系統、匯出／匯入。

### 完整測試矩陣

| Result | Command | Notes |
| --- | --- | --- |
| PASS | `node --check script.js` | Syntax check |
| PASS | `node --check japaneseReadingQuestions.js` | Syntax check |
| PASS | `node --check scripts/check-japanese-review-center-batch15a-2d-regression.js` | Syntax check |
| PASS | `node --check scripts/check-japanese-review-center-batch15a-2c.js` | Syntax check |
| PASS | `node --check scripts/check-japanese-mistake-book-batch15a-2b.js` | Syntax check |
| PASS | `node --check scripts/check-japanese-vocabulary-book-batch15a-2a.js` | Syntax check |
| PASS | `node --check scripts/check-japanese-review-center-batch15a-plan.js` | Syntax check |
| PASS | `node scripts/check-japanese-review-center-batch15a-2d-regression.js` | 2D full regression |
| PASS | `node scripts/check-japanese-review-center-batch15a-2c.js` | Review center UI |
| PASS | `node scripts/check-japanese-mistake-book-batch15a-2b.js` | Mistake book |
| PASS | `node scripts/check-japanese-vocabulary-book-batch15a-2a.js` | Vocabulary book |
| PASS | `node scripts/check-japanese-review-center-batch15a-plan.js` | Batch 15A plan guard |
| PASS | `node scripts/check-japanese-main-entry.js` | Main entry |
| PASS | `node scripts/check-japanese-view-isolation.js` | View isolation |
| PASS | `node scripts/check-japanese-vocabulary-menu.js` | Vocabulary menu |
| PASS | `node scripts/check-japanese-vocabulary-view-split.js` | Vocabulary split |
| PASS | `node scripts/check-japanese-grammar-menu.js` | Grammar menu |
| PASS | `node scripts/check-japanese-reading-menu.js` | Reading menu |
| PASS | `node scripts/check-japanese-reading-click-lookup.js` | Reading click lookup |
| PASS | `node scripts/check-reading-ruby.js` | Ruby audit |
| PASS | `node scripts/check-japanese-reading-lookup-batch14b-implementation.js` | Batch 14B implementation |
| PASS | `node scripts/check-japanese-reading-lookup-batch14b-plan.js` | Batch 14B plan |
| PASS | `node scripts/check-japanese-listening-menu.js` | Listening menu |
| PASS | `node scripts/check-japanese-listening-state-isolation.js` | Listening state |
| PASS | `node scripts/check-japanese-listening-view-isolation.js` | Listening view |
| PASS | `node scripts/auditSiteHealth.js` | Site health |
| PASS | `python3 -m json.tool vocabulary.json >/dev/null` | JSON validation |
| PASS | `python3 -m json.tool grammar.json >/dev/null` | JSON validation |
| PASS | `git diff --check` | Whitespace check |
| PASS | `node scripts/check-japanese-listening-sentence-final.js` | Additional existing Japanese checker |
| N/A | `node scripts/check-japanese-vocabulary-batch12-import-manifest.js` | Historical import-manifest checker still expects 3179 vocabulary entries and reports current 3241 baseline as failure; not updated or replaced. |
| PASS | `node scripts/check-japanese-vocabulary-batch13b-audit-rules.js` | Additional existing Japanese checker |

## C. Codex 瀏覽器實測

- 環境限制：本容器未安裝 Playwright／可用瀏覽器自動化套件，因此 Codex 未宣稱完成真實瀏覽器操作。

## D. 待使用者補充實測

請優先使用無痕／私人瀏覽視窗建立測試資料，或只加入可捨棄的測試項目；清空測試請先測「取消確認」，最後才測「確認清空」。不要清除整個瀏覽器網站資料。

- 四個原入口進入及返回。
- 複習中心進入及返回。
- 閱讀查字卡加入、移出生字本。
- 重新整理後收藏仍保留。
- 生字本例句展開／收合。
- 五種測驗各製造一筆錯題。
- 錯題本四組分類與五種題型顯示。
- 清空取消及確認。
- 頁面切換無內容殘留。
- 手機寬度無水平捲動。
- 桌面寬度排版正常。
- 使用 Tab、Enter、Space 操作主要按鈕。

## E. 最終結論

- Batch 15A 可結案：是，自動化封版回歸通過，剩餘真實瀏覽器項目列為待使用者補測。
- 是否發現 regression：否。
- 是否修改 runtime：否；未修改 `script.js`、`style.css`、HTML、題庫或 cache query。
- 是否可以建立 PR：是。
- 本批只新增 regression checker 與 regression report。
