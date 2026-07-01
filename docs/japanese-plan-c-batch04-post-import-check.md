# 方案 C Batch 04 匯入後功能檢查報告

## 1. 本次檢查目的

本次檢查定位為「方案 C Batch 04 匯入後功能檢查」，目標是確認 Batch 04 正式匯入後，日文主線功能與資料結構仍穩定。

本次僅進行檢查與記錄，未新增、刪除或修改 `vocabulary.json`，也未調整日文單字頁、日文測驗、日文閱讀或英文頁面功能。

## 2. 主線狀態與 vocabulary.json 筆數確認

| 檢查項目 | 結果 | 備註 |
| --- | --- | --- |
| 目前分支 | 通過 | 目前在 `work` branch，HEAD 為 `95fd9fc`，最近提交為 Batch 04 相關 merge 與日文單字數檢查基準更新。容器內未設定 `origin` remote，且無本機 `main` ref 可比對，因此只能依目前 HEAD 歷史確認已包含最新 Batch 04 merge。 |
| `vocabulary.json` 總筆數 | 通過 | 目前為 3166 筆。 |
| Batch 04 正式匯入結果文件 | 通過 | `docs/reading-vocabulary-import-batch-04.md` 已有 `## 12. 正式匯入結果`，並記錄匯入後 3166 筆。 |
| `auditSiteHealth.js` | 通過 | Japanese vocabulary cards 數量為 3166，整體 site health audit passed。 |
| `audit-reading-vocabulary.js` | 通過 | 讀取 105 篇 reading sets、150 題 questions、362 個 terms，輸出既有 vocabulary audit 統計。 |
| `check-reading-ruby.js` | 通過（含既有 warning） | 檢查 105 篇 reading sets，僅出現既有 5 筆 rubyTerms / vocabulary warning。 |

## 3. Batch 04 匯入詞逐項確認表

以下 10 筆為 `docs/reading-vocabulary-import-batch-04.md` 中 `## 12. 正式匯入結果` 標記為「已匯入」的詞。逐項檢查結果如下：

| id | level | word | kana | meaning | partOfSpeech | example | exampleKana | exampleMeaning | id 不重複 | word 不重複 | 結果 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3157 | N4 | 料理教室 | りょうりきょうしつ | 料理教室、烹飪教室 | 名詞 | 土曜日に料理教室へ行きます。 | どようびにりょうりきょうしつへいきます。 | 星期六去料理教室。 | 是 | 是 | 通過 |
| 3158 | N4 | ヨガ教室 | ヨガきょうしつ | 瑜伽教室 | 名詞 | ヨガ教室で体を動かします。 | ヨガきょうしつでからだをうごかします。 | 在瑜伽教室活動身體。 | 是 | 是 | 通過 |
| 3159 | N4 | 留守番電話 | るすばんでんわ | 留言電話、答錄機 | 名詞 | 留守番電話にメッセージを残しました。 | るすばんでんわにメッセージをのこしました。 | 在答錄機裡留下了訊息。 | 是 | 是 | 通過 |
| 3160 | N4 | 各駅停車 | かくえきていしゃ | 各站停車、慢車 | 名詞 | 各駅停車に乗って学校へ行きます。 | かくえきていしゃにのってがっこうへいきます。 | 搭各站停車去學校。 | 是 | 是 | 通過 |
| 3161 | N4 | 急行 | きゅうこう | 急行、快車 | 名詞 | 急行に乗ると早く着きます。 | きゅうこうにのるとはやくつきます。 | 搭快車的話會比較快到。 | 是 | 是 | 通過 |
| 3162 | N4 | お腹 | おなか | 肚子 | 名詞 | お腹が痛いので、少し休みます。 | おなかがいたいので、すこしやすみます。 | 因為肚子痛，所以休息一下。 | 是 | 是 | 通過 |
| 3163 | N4 | 分別 | ぶんべつ | 分類、分類回收 | 名詞/する動詞 | ごみを正しく分別してください。 | ごみをただしくぶんべつしてください。 | 請正確地分類垃圾。 | 是 | 是 | 通過 |
| 3164 | N4 | 写真部 | しゃしんぶ | 攝影社、攝影社團 | 名詞 | 兄は学校の写真部に入っています。 | あにはがっこうのしゃしんぶにはいっています。 | 哥哥加入了學校的攝影社。 | 是 | 是 | 通過 |
| 3165 | N4 | 数 | かず | 數量、數目 | 名詞 | 参加する人の数を数えます。 | さんかするひとのかずをかぞえます。 | 數參加人數。 | 是 | 是 | 通過 |
| 3166 | N4 | 各自 | かくじ | 各自、每個人 | 名詞/副詞 | 道具は各自で持ってきてください。 | どうぐはかくじでもってきてください。 | 工具請各自帶來。 | 是 | 是 | 通過 |

補充確認：

- 10 筆已匯入詞皆存在於 `vocabulary.json`。
- 10 筆已匯入詞的 `id` 皆符合正式匯入文件記錄，且全庫 id 未重複。
- 10 筆已匯入詞的 `level` 皆為既有格式 `N4`。
- 10 筆已匯入詞皆有中文意思、詞性、例句、例句假名與中文翻譯。
- 10 筆已匯入詞未造成全庫 `word` 重複。

## 4. `温める` 與 `誘い` 排除確認

| word | 預期 | 實際 | 結果 |
| --- | --- | --- | --- |
| 温める | 仍只有既有 1 筆，不重複匯入 | 1 筆，id 2263 | 通過 |
| 誘い | 不匯入，仍為 0 筆 | 0 筆 | 通過 |

## 5. 日文單字功能檢查結果

| 檢查項目 | 結果 | 備註 |
| --- | --- | --- |
| 日文單字頁載入結構 | 通過 | `japanese/index.html` 仍載入 `../vocabulary.json` 與 `../script.js`。 |
| 單字資料載入流程 | 通過 | `loadVocabulary()` 會 fetch vocabulary、render category filters，並套用目前分類。 |
| Batch 04 新增詞搜尋 / 顯示資料 | 通過 | 10 筆新增詞皆存在，且 `word`、`kana`、`meaning`、`partOfSpeech`、`level`、例句欄位完整，可被現有搜尋條件比對。 |
| 單字分類 | 通過 | 新增詞詞性均落在既有分類方式：名詞、名詞/する動詞、名詞/副詞。 |
| 單字卡顯示 | 通過 | 單字卡顯示會使用 `word`、`kana`，答案區使用中文意思、詞性、程度、例句、例句假名與中文翻譯；新增詞必要欄位皆存在。 |
| 假名、中文意思、詞性顯示 | 通過 | 10 筆新增詞相關欄位皆非空白。 |
| 頁面錯誤風險 | 通過 | 資料格式完整，未發現會造成單字頁 JavaScript 錯誤的欄位缺漏。 |
| console 新增錯誤 | 未執行瀏覽器 console | 本環境未執行自動化瀏覽器；改以資料檢查、HTML / JS 結構檢查與 site health audit 確認。 |

## 6. 日文測驗功能檢查結果

| 檢查項目 | 結果 | 備註 |
| --- | --- | --- |
| 日文單字測驗產生題目 | 通過 | 測驗題目使用 `filteredVocabulary` 選出 question word，並以 `meaning` 產生正確選項。 |
| 新增詞題目格式 | 通過 | 10 筆新增詞皆有 `word`、`kana`、`meaning`、`level`、`partOfSpeech`，可供題目與選項使用。 |
| 選項 undefined / 空白風險 | 通過 | 全庫必要欄位檢查為 0 筆缺漏；10 筆新增詞 meaning 皆非空白。 |
| 測驗結果 / 統計顯示 | 通過 | 既有 `updateQuizStats()`、答題流程未修改；本次未調整測驗邏輯。 |
| JavaScript error 風險 | 通過 | 新增詞資料不含缺漏欄位，未發現因 Batch 04 資料造成的錯誤風險。 |
| 既有測驗邏輯 | 通過 | 本次未修改 `script.js` 或測驗邏輯。 |

## 7. 日文閱讀功能檢查結果

| 檢查項目 | 結果 | 備註 |
| --- | --- | --- |
| 日文閱讀練習頁 | 通過 | 閱讀 tab 初始化後會進入 practice mode，並使用 reading set 產生閱讀卡。 |
| 日文閱讀測驗頁 | 通過 | reading quiz 會從 105 篇 reading sets 中組成最多 10 題測驗。 |
| 練習模式 ruby / 假名顯示 | 通過 | practice mode 呼叫閱讀卡時啟用 ruby 顯示，並在答完後顯示文章假名與重要單字。 |
| 測驗模式 ruby / 假名顯示規則 | 需留意既有實作 | 靜態檢查顯示 reading quiz 目前呼叫閱讀卡時仍傳入 `showRuby: true`。本次未修改閱讀功能，且此行為非 Batch 04 匯入造成；如產品規格要求測驗模式不得顯示 ruby，建議另案處理。 |
| 閱讀資料 105 篇讀取 | 通過 | `audit-reading-vocabulary.js` 與 `check-reading-ruby.js` 均檢查 105 篇 reading sets。 |
| readingSet、vocabulary、rubyTerms 結構 | 通過 | audit script 可正常讀取並產出統計；ruby 檢查完成。 |
| Batch 04 新增詞造成閱讀頁錯誤 | 通過 | 新增詞未修改 reading data；ruby 檢查僅出現既有 warning。 |

## 8. 執行過的檢查指令與結果

| 指令 | 結果 | 摘要 |
| --- | --- | --- |
| `git diff --check` | 通過 | 無 whitespace error。 |
| `git status --short` | 通過 | 執行檢查時尚未新增報告檔，工作樹無其他變更；新增本報告後僅本檔變更。 |
| `node scripts/auditSiteHealth.js` | 通過 | HTML pages checked: 19；Japanese vocabulary cards: 3166；Site health audit passed。 |
| `node scripts/audit-reading-vocabulary.js` | 通過 | readingSets: 105；questions: 150；terms: 362；existing: 233；missing / confirm: 129。 |
| `node scripts/check-reading-ruby.js` | 通過（含既有 warning） | Checked 105 reading sets；僅有既有 5 筆 warning。 |
| `python3` 指定筆數與排除檢查 | 通過 | 輸出 3166；確認 `温める` 1 筆、`誘い` 0 筆。 |
| `python3` 日文單字庫資料格式檢查 | 通過 | 總筆數 3166；所有 id 不重複；所有 word 不重複；必要欄位缺漏 0；10 筆新增詞格式正確。 |
| `git remote / branch` 狀態檢查 | 受限 | 容器內未設定 `origin` remote，且未提供本機 `main` ref，無法用 remote/main 做機械式最新 main 比對；目前 HEAD 已包含 Batch 04 merge 與單字數基準更新。 |

## 9. 既有 warning 說明

`node scripts/check-reading-ruby.js` 仍只有以下既有 warning，未發現因 Batch 04 匯入而新增 warning：

1. `jp-reading-set-n4-019 vocabulary[5]`: `一時半` 不在 title 或 passage 中。
2. `jp-reading-set-n4-019 rubyTerms[5]`: `一時半` 不在 title 或 passage 中。
3. `jp-reading-set-n4-076 vocabulary[4]`: `調べる` 不在 title 或 passage 中。
4. `jp-reading-set-n4-076 rubyTerms[4]`: `調べる` 不在 title 或 passage 中。
5. `jp-reading-set-n4-102 rubyTerms[3]`: `十分前` 不在 title 或 passage 中。

本次依限制未處理上述既有 warning。

## 10. 新增問題清單

未發現由 Batch 04 匯入造成的新增問題。

需留意的既有規格差異：靜態檢查顯示 reading quiz 目前仍以 `showRuby: true` 建立閱讀測驗卡；若規格要求閱讀測驗模式不顯示 ruby / 假名，建議另開任務處理，避免在本次 Batch 04 post-import check 擴大修改。

## 11. 下一步建議

1. 本次 Batch 04 post-import check 可建立 PR / 合併。
2. 合併後可進入「方案 C Batch 05 候選清單準備」。
3. 若產品規格確認閱讀測驗模式必須不顯示 ruby / 假名，建議另開獨立修正任務，不要混入 Batch 05 單字候選準備。
