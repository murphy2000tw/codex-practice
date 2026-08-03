# Batch 17C-2：N4 JLPT 風格衍生閱讀資料

## 定位與基準

Batch 17C-2 是純資料批次，建立站內版本化的 N4 閱讀資料層。本資料只供**站內非官方 JLPT 風格模擬測驗**使用，不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方難度認證。必要基準 commit 是 `d01d2f043cef25462ede56fd3329fe5a65670757`。

來源 `japaneseReadingQuestions.js` 經產生器驗證為 105 組、150 題，全部為 N4；N5 是 0 組、0 題。每組材料與其 1 至 3 題維持綁定，沒有拆成獨立題目池。

## 新增檔案

本批只新增以下五個檔案：

1. `japaneseJlptReadingPolicy.json`：獨立閱讀顯示政策及 N5/N4 可用性。
2. `japaneseJlptReadingQuestions.json`：完整、版本化的 105 組／150 題 N4 衍生 snapshot 與 initial manifest。
3. `scripts/build-japanese-jlpt-batch17c2-reading-data.js`：只用 Node.js 內建模組的 deterministic 產生器。
4. `scripts/check-japanese-jlpt-batch17c2-reading-data.js`：資料、來源追溯、批次範圍及重現性 checker。
5. `docs/japanese-jlpt-batch17c2-reading-data.md`：本資料契約、限制與 17C-3 handoff。

資料版本是 `17c2-n4-reading-v1`，政策版本是 `17c2-reading-internal-v1`；閱讀政策引用既有 `17b1-internal-v1` 漢字政策版本，但不把它宣稱為官方漢字清單。

## 固定 type-to-section 映射

映射是 build-time 明確白名單；產生器遇到未知 type 會列出名稱並失敗，不以關鍵字或 runtime 猜測。固定 section 與 type 順序如下：

| section | 固定 type 順序 |
| --- | --- |
| `short-passage` | 短文理解、文意推論、日記、活動紹介、旅行メモ、朋友訊息 |
| `medium-passage` | 中短文理解 |
| `information-search` | 情報検索、時刻表、分別表、簡單行程表 |
| `notice-and-message` | 社區公告、ホテル案内、交通通知、伝言メモ、学校通知、店家公告、失物招領公告、使用規則、預約確認、店員說明、店家資訊、宅配通知、交通案内、ホテル受付案内、病院案内、店長メモ、図書館公告、映画館公告、活動通知 |

完整 `readingSets` 依 section 順序、該 section 的 type 白名單順序、`sourceSetId` 數字順序排列。

## `ruby-required` 與 coverage 稽核

`ruby-required` 的精確含義是：未來 runtime 只能使用衍生資料明確提供、來自來源 `rubyTerms` 的 `{ text, reading }`；不得猜讀音、自動斷詞、臨時產生 ruby 或使用不可重現方法補值。詞項以長詞優先，再按 Unicode code point 固定排序。這個政策**不表示所有漢字已經完整人工認證**，也沒有進行官方 N4 漢字認證。

每組 `rubyCoverage` 對標題、本文、題目及四個選項的所有顯示文字做 build-time 稽核：

- `coveredTerms` 記錄在上述顯示文字實際出現且可由明確詞項覆蓋的 ruby term。
- `uncoveredHan` 記錄沒有被明確 term 覆蓋的漢字，以 Unicode code point 去重、固定排序；不隱藏未覆蓋值。
- `status` 在沒有未覆蓋漢字時為 `complete`，否則為 `partial`。

目前結果是 `complete: 0`、`partial: 105`，跨題庫共有 370 個不同的 `uncoveredHan`。這個結果包含題目與中文選項中的漢字，因此是保守的顯示文字稽核，不應解讀為來源日文 ruby 的錯誤數量。未覆蓋漢字保留為站內 N4 來源文字並留在 audit snapshot；runtime 不得補讀音，也不得把它宣稱為官方 N4 漢字認證。後續仍需人工確認 ruby 的語意、讀音與覆蓋範圍。

`passageKana` 完整保留來源 snapshot，供後續顯示政策或答後輔助使用；它不授權 runtime 反推 ruby。

## N5 政策

N5 閱讀明確為 `available: false`、0 組、0 題，理由是「題庫尚未準備完成」。禁止把 N4 題目混入 N5；N5 題庫必須由後續獨立批次準備。

## 完整題庫與 initial manifest

`readingSets` 是完整的 105 組／150 題來源 snapshot。`selectionProfiles.N4.initial` 則只是從完整題庫引用 10 組的固定站內工程 manifest，不複製、拆散或捨棄材料所屬題目，也不是官方 JLPT 配題。

配額為短文理解 3 組、中短文理解 2 組、情報検索 2 組、文意推論 2 組、fallback 1 組。fallback 先依日記、交通通知、伝言メモ、学校通知、店家公告、使用規則，再依其餘白名單 type 順序尋找；各 type 都依 `sourceSetId` 數字順序取最前資料。

實際選中 10 組及順序為：

1. `jlpt-reading-set-n4-001`
2. `jlpt-reading-set-n4-002`
3. `jlpt-reading-set-n4-003`
4. `jlpt-reading-set-n4-016`
5. `jlpt-reading-set-n4-017`
6. `jlpt-reading-set-n4-026`
7. `jlpt-reading-set-n4-027`
8. `jlpt-reading-set-n4-031`
9. `jlpt-reading-set-n4-032`
10. `jlpt-reading-set-n4-015`（日記 fallback）

這 10 組實際包含 **14 題**；manifest 的 `questionCount` 由整組 questions 加總，不為湊固定題數而拆題。

## Deterministic 產生與檢查

產生器使用 `vm` sandbox 載入 `window.JAPANESE_READING_SETS`，驗證來源 schema、數量、唯一 ID、選項、答案、解析與 type 白名單後，再輸出固定兩空格縮排及結尾換行的 JSON。它不使用隨機值、時間、網路、AI 內容或 locale-dependent 排序。

重新產生：

```sh
node scripts/build-japanese-jlpt-batch17c2-reading-data.js
```

只在記憶體重建並與 committed JSON 逐位元組比較（不寫檔）：

```sh
node scripts/build-japanese-jlpt-batch17c2-reading-data.js --check
```

完整資料與 repository 範圍檢查：

```sh
node scripts/check-japanese-jlpt-batch17c2-reading-data.js
```

## 安全 DOM 與 Batch 17C-3 契約

Batch 17C-3 應載入 `japaneseJlptReadingQuestions.json`，確認 `dataVersion`／`policyVersion`，以 `availability` 控制等級，依 `selectionProfiles.N4.initial.setIds` 找到完整 set，並保持材料與 questions 綁定。題面只可使用資料內的 `displayTitle`、`displayPassage`、`displayText`、`options` 及明確 `rubyTerms`；不得回到來源檔猜測欄位或讀音。

所有題庫文字必須透過 `textContent`、`createTextNode`、`createElement` 等安全 DOM API 呈現。Ruby 也必須建立安全節點，禁止把題庫文字插入 `innerHTML`。17C-3 仍須另行驗證鍵盤、無障礙、手機顯示與答題狀態。

## 範圍、warning 與後續事項

- 本批沒有修改或接入 runtime、UI、CSS、cache query version、LocalStorage key/schema 或原始 `japaneseReadingQuestions.js`。
- 本批沒有建立 N5 閱讀題，也沒有修改其他題庫或任何既有 Batch 文件/checker。
- `scripts/check-reading-ruby.js` 的既有 warning 必須原樣保留；其成功只表示既有安全詞彙處理檢查通過，不代表完整 ruby 或程度認證。
- `rubyCoverage` 的 105 組 `partial` 是公開的 audit 結果而非 blocker；後續人工複核可以據此規劃專門資料修正批次，但不得由 runtime 靜默修補。
- 來源題意、選項、答案與解析在本批只做 byte-preserving 衍生與結構檢查；語意正確性、官方比例和官方難度均未獲官方驗證。
