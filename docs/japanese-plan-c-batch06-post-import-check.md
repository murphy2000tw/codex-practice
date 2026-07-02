# 方案 C Batch 06 匯入後功能檢查

## 1. 本次檢查目的

本次檢查定位為「Batch 06 匯入後功能檢查」，目標是確認 Batch 06 已正式匯入的 2 個日文單字沒有影響日文主線功能，包含日文單字頁、日文單字測驗、日文閱讀練習與日文閱讀測驗。本次沒有新增、刪除或修改 `vocabulary.json`，也沒有調整日文單字頁、日文測驗或日文閱讀頁邏輯。

## 2. 主線狀態與 `vocabulary.json` 筆數確認

| 項目 | 結果 | 說明 |
| --- | --- | --- |
| 目前分支 | 已確認 | 本機目前位於 `work` 分支。容器內未設定 `origin` remote，且未存在本機 `main` ref，因此無法在本環境用 `git fetch origin main` 或 `git merge-base main` 重新驗證是否基於最新 main；但目前 commit history 顯示已包含 Batch 06 與基準更新合併紀錄。 |
| `vocabulary.json` 總筆數 | 通過 | Python 檢查結果為 3179 筆，符合 Batch 06 匯入後基準。 |
| Batch 06 正式匯入結果文件 | 通過 | `docs/reading-vocabulary-import-batch-06.md` 已有 `## 12. 正式匯入結果`，並記錄 `運動センター`、`学生料金` 為已匯入。 |
| `auditSiteHealth.js` | 通過 | HTML、題庫、manifest/icon 與 mobile touch-target CSS audit 均通過；日文單字卡數為 3179。 |
| `audit-reading-vocabulary.js` | 通過 | 讀取 105 篇 reading sets、150 題、362 個 terms；輸出與既有 audit report 一致。 |
| `check-reading-ruby.js` | 通過但有既有 warning | 指令完成並確認 105 篇 reading sets；僅列出既有 5 筆 reading rubyTerms warning，未新增 warning。 |

## 3. Batch 06 匯入詞逐項確認表

| 檢查項目 | `運動センター` | `学生料金` |
| --- | --- | --- |
| 是否存在於 `vocabulary.json` | 通過，存在 1 筆 | 通過，存在 1 筆 |
| `id` 是否正確且不重複 | 通過，`id: 3178`；全庫 id 無重複 | 通過，`id: 3179`；全庫 id 無重複 |
| `level` 是否符合既有格式 | 通過，`N4` | 通過，`N4` |
| `word` 是否正確 | 通過，`運動センター` | 通過，`学生料金` |
| `kana` 是否正確 | 通過，`うんどうセンター` | 通過，`がくせいりょうきん` |
| `meaning` 是否有中文意思 | 通過，`運動中心` | 通過，`學生票價、學生費用` |
| `partOfSpeech` 是否符合既有分類方式 | 通過，`名詞` | 通過，`名詞` |
| `example` 是否存在 | 通過，`週末に運動センターで泳ぎます。` | 通過，`この映画館には学生料金があります。` |
| `exampleKana` 是否存在 | 通過，`しゅうまつにうんどうセンターでおよぎます。` | 通過，`このえいがかんにはがくせいりょうきんがあります。` |
| `exampleMeaning` 是否存在 | 通過，`週末在運動中心游泳。` | 通過，`這間電影院有學生票價。` |
| 是否造成重複單字 | 通過，全庫 word 無重複 | 通過，全庫 word 無重複 |

## 4. 匯入確認與非本批詞排除確認

| 詞彙 | 檢查結果 |
| --- | --- |
| `運動センター` | 已確認在 `vocabulary.json` 中只有 1 筆，且為 Batch 06 正式匯入結果記錄的 `id: 3178`。 |
| `学生料金` | 已確認在 `vocabulary.json` 中只有 1 筆，且為 Batch 06 正式匯入結果記錄的 `id: 3179`。 |
| `地域清掃` | 已確認在 `vocabulary.json` 中為 0 筆，符合 Batch 06 正式匯入結果文件中「仍維持不匯入」的結論。 |
| 其他非「可進入正式匯入」詞 | 本次未修改 `vocabulary.json`，且全庫 word 無重複；未發現本批排除詞被新增。 |

## 5. 日文單字功能檢查結果

| 檢查項目 | 結果 | 說明 |
| --- | --- | --- |
| 日文單字頁可載入 | 通過 | `auditSiteHealth.js` 已檢查 19 個 HTML 頁面，且日文單字卡資料可讀取為 3179 筆。 |
| Batch 06 新增 2 詞可搜尋或顯示 | 通過 | 兩詞均具備 `word`、`kana`、`meaning`、`partOfSpeech`、例句與例句翻譯；符合現有單字卡搜尋與顯示所需欄位。 |
| 單字分類正常 | 通過 | 兩詞 `partOfSpeech` 均為既有分類 `名詞`，可納入現有分類。 |
| 單字卡顯示正常 | 通過 | 兩詞必要顯示欄位完整，未發現 undefined 或空白必要欄位。 |
| 假名、中文意思、詞性顯示正常 | 通過 | 兩詞 `kana`、`meaning`、`partOfSpeech` 均存在且非空字串。 |
| 不會因新增詞造成頁面錯誤 | 通過 | `auditSiteHealth.js` 通過，資料格式檢查通過。 |
| console 是否無新增錯誤 | 未執行瀏覽器 console 實測 | 本環境未進行自動化瀏覽器測試；以資料檢查、HTML audit 與檔案結構檢查替代，未發現新增錯誤跡象。 |

## 6. 日文測驗功能檢查結果

| 檢查項目 | 結果 | 說明 |
| --- | --- | --- |
| 日文單字測驗可產生題目 | 通過 | 測驗邏輯未修改；兩詞具備測驗所需的 `word`、`meaning`、`level`、`partOfSpeech` 欄位。 |
| 新增詞不造成題目格式錯誤 | 通過 | 兩詞欄位完整，必要欄位無空值。 |
| 選項不會出現 undefined、空白或錯誤欄位 | 通過 | 全庫必要欄位檢查結果為 0 筆缺漏；新增詞 `meaning` 非空。 |
| 測驗結果頁正常 | 通過 | 本次未修改測驗結果邏輯，資料檢查未發現會破壞結果統計的格式問題。 |
| 不會因新增詞造成 JavaScript error | 通過 | `auditSiteHealth.js` 通過；新增詞欄位符合現有測驗資料格式。 |
| 既有測驗邏輯沒有被修改 | 通過 | 本次只新增檢查報告文件，未修改測驗程式。 |

## 7. 日文閱讀功能檢查結果

| 檢查項目 | 結果 | 說明 |
| --- | --- | --- |
| 日文閱讀練習頁正常 | 通過 | `auditSiteHealth.js` 通過，閱讀資料可被 audit scripts 讀取。 |
| 日文閱讀測驗頁正常 | 通過 | `audit-reading-vocabulary.js` 讀取 105 篇 reading sets 與 150 題，未失敗。 |
| 練習模式 ruby / 假名顯示規則正常 | 通過 | `check-reading-ruby.js` 完成檢查，確認 ruby rendering 使用 vocabulary plus rubyTerms，並略過不安全 vocabulary kana。 |
| 測驗模式不顯示 ruby / 假名規則正常 | 通過 | 本次未修改閱讀頁邏輯；資料結構檢查未發現新增詞造成題目或閱讀資料錯誤。 |
| 閱讀資料 105 篇可讀取 | 通過 | `audit-reading-vocabulary.js` 與 `check-reading-ruby.js` 均回報 checked / readingSets 為 105。 |
| `readingSet`、`vocabulary`、`rubyTerms` 資料結構正常 | 通過 | audit scripts 成功讀取閱讀資料；`rubyTerms` 既有 warning 未擴大。 |
| Batch 06 新增詞未造成閱讀頁錯誤 | 通過 | 新增詞僅存在於正式單字庫；閱讀 audit 與 ruby check 均完成。 |

## 8. 執行過的檢查指令與結果

| 指令 | 結果摘要 |
| --- | --- |
| `git status --short` | 無輸出，工作區在新增本報告前為乾淨狀態。 |
| `git fetch origin main` | 失敗；本容器未設定 `origin` remote，無法用 remote 重新驗證最新 main。 |
| `git merge-base --is-ancestor main HEAD` | 失敗；本容器沒有本機 `main` ref。 |
| `git diff --check` | 通過，無 whitespace error。 |
| `node scripts/auditSiteHealth.js` | 通過；Japanese vocabulary cards 為 3179。 |
| `node scripts/audit-reading-vocabulary.js` | 通過；readingSets 105、questions 150、terms 362、existing 235、missing 127、confirm 127。 |
| `node scripts/check-reading-ruby.js` | 通過但列出既有 5 筆 warning。 |
| 指定 Python 筆數與兩詞唯一性檢查 | 通過；總筆數 3179，`運動センター` 1 筆，`学生料金` 1 筆。 |
| 日文單字庫資料格式檢查 Python script | 通過；全庫 id 無重複、word 無重複、必要欄位缺漏 0 筆，兩個新增詞格式正確。 |

## 9. 既有 warning 說明

`node scripts/check-reading-ruby.js` 仍列出以下既有 reading rubyTerms warning，均非本次 Batch 06 匯入造成，本次依限制未處理：

1. `jp-reading-set-n4-019 vocabulary[5]`: `一時半` 不在 title 或 passage 中。
2. `jp-reading-set-n4-019 rubyTerms[5]`: `一時半` 不在 title 或 passage 中。
3. `jp-reading-set-n4-076 vocabulary[4]`: `調べる` 不在 title 或 passage 中。
4. `jp-reading-set-n4-076 rubyTerms[4]`: `調べる` 不在 title 或 passage 中。
5. `jp-reading-set-n4-102 rubyTerms[3]`: `十分前` 不在 title 或 passage 中。

## 10. 新增問題清單

未發現新增問題。

## 11. 下一步建議

1. 可將本檢查報告建立 PR 並合併。
2. 合併後可進入「方案 C 收尾檢查」。
3. 若要繼續擴充閱讀衍生詞，下一步也可另開「方案 C Batch 07 候選清單準備」，但本次檢查未進行 Batch 07。
