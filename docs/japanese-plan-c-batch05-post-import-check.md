# 方案 C Batch 05 匯入後功能檢查報告

## 1. 檢查目的

本次檢查定位為「Batch 05 匯入後功能檢查」，目標是在不新增、不刪除、不修改 `vocabulary.json`，且不修改日文單字頁、日文測驗、日文閱讀功能邏輯的前提下，確認 Batch 05 正式匯入後日文主線功能與資料結構維持穩定。

## 2. 主線狀態與筆數確認

| 項目 | 結果 | 備註 |
| -- | -- | -- |
| 目前 branch | `work` | 本地目前位於 `work` branch。 |
| 最新 main 確認 | 未能透過 remote 確認 | 執行 `git fetch origin main` 時，環境中的 git remote 未設定 `origin`，因此無法線上比對最新 main；本次以目前工作樹與提交歷史為檢查基準。 |
| `vocabulary.json` 總筆數 | 通過，3177 筆 | Python JSON 檢查與 `auditSiteHealth.js` 均確認日文單字卡為 3177 筆。 |
| Batch 05 正式匯入紀錄 | 通過 | `docs/reading-vocabulary-import-batch-05.md` 已包含「## 12. 正式匯入結果」，記錄匯入前 3166 筆、匯入後 3177 筆。 |
| `auditSiteHealth.js` | 通過 | 網站健康檢查通過，日文單字卡數量為 3177。 |
| `audit-reading-vocabulary.js` | 通過 | 閱讀資料 105 篇、題目 150 題；指令結束碼為 0。 |
| `check-reading-ruby.js` | 通過但有既有 warning | 指令結束碼為 0，僅列出既有 reading rubyTerms warning。 |
| 新增 warning | 未發現 | 本次未發現 Batch 05 匯入造成新增 warning。 |

## 3. Batch 05 匯入詞逐項確認表

以下 11 筆皆於 `vocabulary.json` 中各出現 1 次，`id` 不重複，`word` 不重複，必要欄位 `level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning` 均存在且非空。

| ID | Word | Kana | Meaning | 詞性 | Level | 例句欄位 | 重複檢查 | 結果 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- |
| 3167 | 利用 | りよう | 利用、使用 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3168 | 地域 | ちいき | 地區、區域 | 名詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3169 | 清掃 | せいそう | 清掃、打掃 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3170 | 室内 | しつない | 室內 | 名詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3171 | 通知 | つうち | 通知 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3172 | 活動 | かつどう | 活動 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3173 | 会員 | かいいん | 會員 | 名詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3174 | 登録 | とうろく | 登錄、註冊 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3175 | 募集 | ぼしゅう | 招募、募集 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3176 | 集合 | しゅうごう | 集合 | 名詞/する動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |
| 3177 | 着く | つく | 到達 | 動詞 | N4 | 三個例句欄位皆存在 | `id` 及 `word` 各 1 筆 | 通過 |

## 4. 排除詞確認

| 詞彙 | `vocabulary.json` 筆數 | 結果 |
| -- | -- | -- |
| 變更 | 0 | 通過，未匯入 |
| 見学 | 0 | 通過，未匯入 |
| 整理 | 0 | 通過，未匯入 |
| 二週間 | 0 | 通過，未匯入 |

補充：Batch 05 文件中排除詞使用日文漢字 `変更`；本次亦額外檢查 `変更`，結果為 0 筆。

## 5. 日文單字功能檢查結果

| 檢查項目 | 結果 | 說明 |
| -- | -- | -- |
| 日文單字頁載入結構 | 通過 | `japanese/index.html` 仍載入 `vocabulary.json`、`grammar.json`、`japaneseReadingQuestions.js` 與 `script.js`。 |
| 新增 11 詞搜尋或顯示資料來源 | 通過 | 11 詞均存在於 `vocabulary.json`，且 `word`、`kana`、`meaning`、`partOfSpeech` 欄位完整，可供既有搜尋與卡片渲染邏輯使用。 |
| 單字分類 | 通過 | 新增詞詞性為既有分類可識別的 `名詞`、`名詞/する動詞`、`動詞`。 |
| 單字卡顯示資料 | 通過 | 新增詞必要顯示欄位與例句欄位均非空。 |
| 假名、中文意思、詞性顯示 | 通過 | 新增詞 `kana`、`meaning`、`partOfSpeech` 均存在且非空。 |
| 頁面錯誤風險 | 未發現新增問題 | 靜態資料檢查、網站健康檢查均通過；本環境未執行自動化瀏覽器。 |
| console 新增錯誤 | 未執行瀏覽器 console 檢查 | 專案未提供自動化瀏覽器測試；本次以資料與檔案結構檢查替代。 |

## 6. 日文測驗功能檢查結果

| 檢查項目 | 結果 | 說明 |
| -- | -- | -- |
| 單字測驗題目資料來源 | 通過 | `vocabulary.json` 3177 筆皆具備測驗所需 `word` 與 `meaning` 欄位。 |
| 新增詞題目格式 | 通過 | 11 筆新增詞 `word`、`kana`、`meaning`、`partOfSpeech` 均完整，不會產生空白題幹或空白答案。 |
| 選項 undefined / 空白檢查 | 通過 | 全庫必要欄位檢查未發現空值；新增詞 meaning 均非空。 |
| 測驗結果頁 | 未發現新增問題 | 本次未修改既有測驗結果邏輯；靜態結構維持。 |
| JavaScript error 風險 | 未發現新增問題 | 網站健康檢查通過；本次未改動測驗邏輯。 |
| 既有測驗邏輯 | 通過 | 本次未修改 `script.js` 或其他測驗功能檔案。 |

## 7. 日文閱讀功能檢查結果

| 檢查項目 | 結果 | 說明 |
| -- | -- | -- |
| 日文閱讀練習頁結構 | 通過 | `japanese/index.html` 保留閱讀 tab、練習/測驗切換與 `readingContent` 容器。 |
| 日文閱讀測驗頁結構 | 通過 | `japaneseReadingQuestions.js` 載入路徑與 `script.js` 閱讀測驗渲染邏輯未修改。 |
| 練習模式 ruby / 假名規則 | 通過 | `check-reading-ruby.js` 通過，確認 ruby 渲染會使用 vocabulary 與 rubyTerms，且跳過不安全假名。 |
| 測驗模式不顯示 ruby / 假名規則 | 未發現新增問題 | 本次未修改閱讀測驗顯示邏輯。 |
| 閱讀資料數量 | 通過 | `audit-reading-vocabulary.js` 與 `check-reading-ruby.js` 均確認 105 篇 reading sets。 |
| `readingSet`、`vocabulary`、`rubyTerms` 結構 | 通過 | `check-reading-ruby.js` 檢查通過，無 error。 |
| Batch 05 新增詞造成閱讀頁錯誤 | 未發現 | 三個主要檢查指令均通過。 |

## 8. 執行過的檢查指令與結果

| 指令 | 結果摘要 |
| -- | -- |
| `git diff --check` | 通過，結束碼 0。 |
| `git status --short` | 建立報告前無既有工作樹變更；建立本報告後僅新增本文件。 |
| `git fetch origin main` | 未通過，環境未設定 `origin` remote，無法確認遠端 main。 |
| `node scripts/auditSiteHealth.js` | 通過；Japanese vocabulary cards = 3177。 |
| `node scripts/audit-reading-vocabulary.js` | 通過；readingSets = 105，questions = 150，terms = 362，existing = 233，missing = 129，confirm = 129。 |
| `node scripts/check-reading-ruby.js` | 通過；Checked 105 reading sets，僅有既有 warning。 |
| 使用者指定 Python 檢查 | 通過；總筆數 3177，`變更`、`見学`、`整理`、`二週間` 均為 0。 |
| 日文單字庫資料格式 Python 檢查 | 通過；全庫 `id` 不重複、`word` 不重複、必要欄位完整，Batch 05 11 詞格式正確。 |

## 9. 既有 warning 說明

`check-reading-ruby.js` 通過但輸出以下既有 reading rubyTerms warning；本次依限制未處理、未修正：

1. `jp-reading-set-n4-019 vocabulary[5]`: `一時半` 未出現在 title 或 passage。
2. `jp-reading-set-n4-019 rubyTerms[5]`: `一時半` 未出現在 title 或 passage。
3. `jp-reading-set-n4-076 vocabulary[4]`: `調べる` 未出現在 title 或 passage。
4. `jp-reading-set-n4-076 rubyTerms[4]`: `調べる` 未出現在 title 或 passage。
5. `jp-reading-set-n4-102 rubyTerms[3]`: `十分前` 未出現在 title 或 passage。

## 10. 新增問題清單

未發現新增問題。

## 11. 下一步建議

1. 可建立 PR / 合併本次檢查報告。
2. 合併後可進入「方案 C Batch 06 候選清單準備」。
3. 進入 Batch 06 前仍建議沿用小批次流程：先建立候選清單、排除重複與需人工確認詞，再另行正式匯入。
