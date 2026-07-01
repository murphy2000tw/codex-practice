# 日文網頁方案 C 前置任務續接檢查報告

## 1. 本次檢查目的

本次任務是「方案 C 前置流程續接檢查」，目的在於確認日文閱讀文章單字匯入方案 C 目前做到哪裡、哪些檔案與紀錄已存在、目前單字庫與閱讀資料的關係，以及下一個 Codex 任務可以安全從哪裡續接。

本次嚴格限制為檢查與記錄：

* 未正式匯入任何新單字。
* 未刪除任何既有單字。
* 未修改閱讀頁、單字頁、測驗頁功能程式碼。
* 未重構資料結構。
* 未把候選詞自動加入正式單字庫。

## 2. 已找到的方案 C 相關檔案

| 檢查項目 | 實際找到的檔案或資料 | 內容確認結果 |
| --- | --- | --- |
| 日文閱讀資料來源 | `japaneseReadingQuestions.js` | 存在 `window.JAPANESE_READING_SETS`，目前可載入 105 篇閱讀資料；每篇含 `passage`、`passageKana`、`questions`、`vocabulary`、`rubyTerms` 等資料。 |
| 日文單字庫資料來源 | `vocabulary.json` | 正式日文單字庫存在，實測 3145 筆。 |
| 方案 C 匯入流程規則文件 | `docs/reading-vocabulary-import-process.md` | 已記錄方案 C 原則、候選整理、人工勾選、正式匯入、匯入後檢查、Batch 03 建議流程。 |
| 方案 C 候選單字清單 | `docs/reading-vocabulary-import-batch-01.md`、`docs/reading-vocabulary-import-batch-02.md`、`docs/reading-vocabulary-import-batch-03.md`、`docs/reading-vocabulary-review-list.md`、`docs/reading-vocabulary-audit.md` | Batch 01 / 02 / 03 候選與閱讀盤點資料皆存在。 |
| 方案 C 人工確認勾選清單 | `docs/reading-vocabulary-import-batch-01.md`、`docs/reading-vocabulary-import-batch-02.md`、`docs/reading-vocabulary-import-batch-03.md`、`docs/reading-vocabulary-review-list.md` | Batch 檔案包含 `[x]` / `[ ]` 勾選欄；`reading-vocabulary-review-list.md` 仍為舊人工確認清單且全為 `[ ]`，需以後續 Batch 檔與匯入紀錄為準。 |
| Batch 01、Batch 02、Batch 03 相關紀錄或資料 | `docs/reading-vocabulary-import-batch-01.md`、`docs/reading-vocabulary-import-batch-02.md`、`docs/reading-vocabulary-import-batch-03.md`、`docs/reading-vocabulary-import-log.md` | Batch 01、Batch 02 已有匯入紀錄；Batch 03 有候選清單但未見匯入紀錄。 |
| 匯入後檢查用 script 或紀錄文件 | `scripts/auditSiteHealth.js`、`scripts/check-reading-ruby.js`、`scripts/audit-reading-vocabulary.js`、`docs/reading-vocabulary-import-log.md`、`docs/reading-vocabulary-audit.md` | 已有網站健康檢查、閱讀 ruby 檢查、閱讀/單字庫差異盤點腳本，以及匯入紀錄與盤點報告。 |

## 3. 日文單字庫目前狀態

以 Node.js 實際讀取 `vocabulary.json` 後確認：

| 檢查項目 | 結果 |
| --- | --- |
| 目前日文單字庫總筆數 | 3145 筆 |
| 最大 `id` | 3145 |
| 每筆資料欄位 | `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning` |
| 欄位一致性 | 3145 筆欄位集合一致，未發現額外或缺少欄位的資料。 |
| 重複單字 | 以 `word` 精確比對，未發現重複單字。 |
| 缺少假名 | 0 筆缺少 `kana`。 |
| 缺少中文意思 | 0 筆缺少 `meaning`。 |
| 缺少詞性 | 0 筆缺少 `partOfSpeech`。 |
| 缺少分類 | 3145 筆皆沒有 `category` 欄位；但目前正式資料格式本來不含 `category`，因此不視為格式異常。 |
| 明顯格式不一致 | 未發現欄位結構不一致；本次未大量檢查語意品質，也未自動修正資料。 |

## 4. 閱讀資料與單字庫關係

以 `japaneseReadingQuestions.js` 的 `vocabulary` 與 `rubyTerms` 去重後，和 `vocabulary.json` 的 `word` 精確比對：

| 項目 | 結果 |
| --- | --- |
| 閱讀文章數 | 105 篇 |
| 去重後閱讀詞彙 / ruby 詞數 | 270 個 |
| 已存在於正式單字庫 | 212 個 |
| 尚未存在於正式單字庫 | 58 個 |
| 是否已有候選清單檔案 | 有，包含 Batch 01、Batch 02、Batch 03 與閱讀盤點 / 人工確認文件。 |
| 候選清單是否已標示人工確認狀態 | 有；Batch 文件含 `[x]` / `[ ]`。Batch 03 已有部分 `[x]`，但未見正式匯入紀錄。 |

### 4.1 閱讀文章中已存在於單字庫的詞（節錄）

已存在詞包含：`郵便局`、`荷物`、`菓子`、`窓口`、`必要`、`普通`、`明日`、`映画`、`時間`、`予定`、`人気`、`店長`、`確認`、`注文`、`誕生日`、`料理`、`電話`、`朝`、`夜`、`燃えるごみ`、`水曜日`、`火曜日`、`来週`、`フロント`、`部屋`、`受付`、`説明`、`番号`、`工事`、`駅`、`土曜日`、`弁当`、`参加`、`教室`、`午前中`、`自転車`、`金曜日`、`留学生`、`図書館`、`飲み物`、`掲示板`、`営業時間`、`日曜日`、`平日`、`家族`、`向こう`、`電車`、`窓`、`傘`、`休み`、`学校`、`準備`、`引っ越し`、`週末` 等。

### 4.2 尚未存在於單字庫、但可能適合加入的候選詞（需後續人工確認）

目前未收錄詞包含生活詞、複合名詞、時間表達、動詞變化形回推項目與人名 / 專名。可能適合後續候選整理或人工確認者包含：`料理教室`、`昼休み`、`整理`、`学生料金`、`お腹`、`鍋`、`別`、`写真部`、`二週間`、`前日`、`宅配会社`、`各駅停車`、`急行`、`中央公園`、`着替え`、`地域清掃`、`分別`、`郵便物`、`各自`、`開店前`、`京都駅`、`ヨガ教室`、`市立図書館`、`道路工事`、`十分前`、`室内用`、`数`、`誘い`、`乗り方`、`クリーニング店`、`留守番電話` 等。

### 4.3 明顯不適合直接加入單字庫的詞

下列類型不建議直接加入正式單字庫，應在 Batch 03 或後續人工確認時排除或標示暫緩：

* 人名 / 姓氏：`中村`、`由美`、`佐藤`、`王`、`田中`、`美香`、`近藤`、`渡辺`、`小林`、`吉田`、`木村`、`伊藤`、`山田`。
* 特定班級、路線或活動名稱：`二年三組`、`五番バス`、`三番バス`、`中央公園`（視作地名時需確認）、`京都駅`（地名 / 站名需確認）。
* 太片段或變化形：`温めて`、`書きました`、`迷っています`。
* 太長標題型片語或不宜整體收錄者：`誕生日の手紙`、`読み聞かせ会`、`公園活動`、完整文章標題類詞組。

## 5. Batch 01 / 02 / 03 狀態表

| 批次 | 任務名稱 | 是否找到相關檔案 | 目前判斷狀態 | 是否需要下一步處理 | 備註 |
| --- | --- | --- | --- | --- | --- |
| Batch 01 | 閱讀文章單字庫匯入候選清單 / 正式匯入 | 是：`docs/reading-vocabulary-import-batch-01.md`、`docs/reading-vocabulary-import-log.md` | 已匯入。流程文件記錄 Batch 01 已正式匯入並完成匯入後單字功能檢查；匯入紀錄列出 19 個已匯入詞。 | 否 | 可視為已完成，不建議在 Batch 03 任務中回頭修改。 |
| Batch 02 | 閱讀文章單字庫匯入候選清單 / 正式匯入 / 匯入後檢查 | 是：`docs/reading-vocabulary-import-batch-02.md`、`docs/reading-vocabulary-import-log.md`、`docs/reading-vocabulary-import-process.md` | 已匯入且完成匯入後單字功能檢查。流程文件記錄 Batch 02 已正式匯入並完成檢查；匯入紀錄列出 26 個已匯入詞。 | 否 | 健康檢查腳本預期日文單字數為 3145，與實際單字庫一致。 |
| Batch 03 | 候選清單整理 | 是：`docs/reading-vocabulary-import-batch-03.md` | 已有候選清單整理。 | 是 | 下一步應確認 Batch 03 勾選是否已完成、是否只保留安全詞 `[x]`，再另開正式匯入任務。 |
| Batch 03 | 人工確認勾選 | 是：`docs/reading-vocabulary-import-batch-03.md` 內有 `[x]` / `[ ]` | 已進入人工確認勾選狀態；但未見 Batch 03 匯入紀錄，故不能判定已正式匯入。 | 是 | 建議下一個任務先做「Batch 03 人工勾選結果核對」，不要直接匯入。 |
| Batch 03 | 正式匯入 | 未找到明確匯入紀錄 | 尚未匯入或狀態不明；以目前證據應視為未匯入。 | 是 | `docs/reading-vocabulary-import-log.md` 目前只記錄 Batch 01、Batch 02。 |
| Batch 03 | 匯入後單字功能檢查 | 未找到明確 Batch 03 檢查紀錄 | 尚未開始。 | 是 | 需等 Batch 03 正式匯入完成後，另做匯入後功能檢查。 |

## 6. 日文網頁目前功能檢查

本次未修改功能程式碼；以下為靜態與既有腳本檢查結果：

| 檢查項目 | 結果 |
| --- | --- |
| 日文閱讀練習頁是否正常 | 靜態檢查 `japanese/index.html` 與 `script.js` 可找到閱讀練習相關標記與渲染邏輯；未進行瀏覽器互動測試。 |
| 日文閱讀測驗頁是否正常 | 靜態檢查可找到測驗模式相關文字 / 邏輯；未進行瀏覽器互動測試。 |
| 練習模式是否仍顯示 ruby / 假名 | `script.js` 仍有 ruby 相關渲染邏輯，`scripts/check-reading-ruby.js` 也可成功檢查 105 篇閱讀資料。 |
| 測驗模式是否仍不顯示 ruby / 假名 | 靜態檢查可找到閱讀測驗 / ruby 相關分支；本次未用瀏覽器逐頁驗證畫面。 |
| 日文單字頁是否正常 | `vocabulary.json` 可正常解析，`scripts/auditSiteHealth.js` 可讀取 3145 筆日文單字；未進行瀏覽器互動測試。 |
| 日文測驗功能是否正常 | 未發現資料格式會阻斷測驗；本次未進行瀏覽器互動測試。 |
| 是否有 console error | 本次未啟動瀏覽器，因此未收集 runtime console。Node 腳本執行未出現日文資料阻斷性錯誤。 |
| build / lint / test error | 專案無 `package.json`，未找到 npm build / lint 指令；執行既有 Node 檢查如下。 |

### 6.1 已執行檢查指令結果

| 指令 | 結果 | 備註 |
| --- | --- | --- |
| `node scripts/auditSiteHealth.js` | 失敗 | 日文資料筆數正確；失敗原因為既有英文頁面缺少首頁連結，與本次方案 C 檢查未修改日文資料無關。 |
| `node scripts/check-reading-ruby.js` | 通過且有 warning | exit code 0；既有 warning 包含部分 vocabulary / rubyTerms 詞未出現在 title 或 passage。 |
| `node` 單字庫 / 閱讀資料自訂檢查 | 通過 | 實測單字庫 3145 筆、閱讀資料 105 篇、閱讀詞彙去重 270 個。 |

## 7. 目前可安全續接的位置

目前最安全的續接點是：

1. 以 `docs/reading-vocabulary-import-batch-03.md` 作為 Batch 03 候選與人工勾選依據。
2. 先執行「Batch 03 人工勾選結果核對任務」：確認 `[x]` 詞是否仍未存在於 `vocabulary.json`，且沒有疑似重複、需確認、暫緩加入、太長片語、人名或專名。
3. 核對通過後，再另開「方案 C 正式匯入任務 Batch 03」。
4. 正式匯入後，另開「Batch 03 匯入後單字功能檢查任務」。

## 8. 尚未完成或狀態不明的地方

* Batch 03 尚未找到正式匯入紀錄。
* Batch 03 尚未找到匯入後單字功能檢查紀錄。
* `docs/reading-vocabulary-review-list.md` 是舊人工確認清單且全為 `[ ]`，與 Batch 01 / 02 已匯入狀態不完全同步；後續應以 Batch 檔、匯入紀錄與實際 `vocabulary.json` 為準。
* `docs/reading-vocabulary-audit.md` 仍包含大量「人工確認」項目，其中有許多標題型片語、人名、專名或變化形，不應直接匯入。
* 網站健康檢查目前因英文頁面首頁連結問題失敗；此問題看起來不是方案 C 日文單字資料造成，但仍會影響整體健康檢查通過狀態。

## 9. 建議下一個 Codex 任務

建議下一個任務名稱：**「方案 C Batch 03 人工勾選結果核對」**。

建議任務內容：

1. 讀取 `docs/reading-vocabulary-import-batch-03.md` 中所有 `[x]` 詞。
2. 對照 `vocabulary.json`，再次確認完全相同 `word` 不存在。
3. 排除人名、專名、太長片語、變化形、需確認詞、疑似重複詞。
4. 只更新 Batch 03 文件中的狀態 / 備註，不匯入 `vocabulary.json`。
5. 完成後再另開正式匯入任務。

## 10. 本次修改紀錄

* 本次有無修改功能程式碼：沒有。
* 本次有無匯入任何新單字：沒有。
* 本次新增 / 更新文件：新增 `docs/japanese-plan-c-continuation-check.md`。
