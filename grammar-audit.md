# Grammar Data Audit

## 本次新增內容

- 新增檔案：`grammar.json`
- 新增等級：JLPT N5
- 新增文法數量：50 筆
- 預留資料結構可後續擴充 N4 文法。

## 欄位檢查

每筆文法資料皆包含以下欄位：

- `id`
- `level`
- `category`
- `grammar`
- `kana`
- `meaning`
- `structure`
- `usage`
- `example`
- `exampleKana`
- `exampleMeaning`
- `note`
- `similar`

## 內容檢查結果

- `grammar.json` 已確認為合法 JSON。
- 已確認共有 50 筆資料。
- 已確認 50 筆資料的 `level` 皆為 `N5`。
- 已確認每筆資料皆包含必要欄位。
- 已確認 `exampleKana` 未包含漢字。
- 已確認 `exampleMeaning` 使用繁體中文，未混入日文假名。
- 已確認未修改 `vocabulary.json`。
- 已確認未修改 `index.html`、`style.css`、`script.js`。

## 備註

本次文法說明以 N5 初學者可理解的簡短句型、用途與例句為主，並透過 `similar` 欄位記錄容易混淆或可延伸比較的文法。

## 文法卡模式新增紀錄

- 新增第三個練習模式「文法卡模式」，預設模式仍維持「單字卡模式」。
- 文法卡模式切換後會讀取 `grammar.json`，每組顯示 5 條文法，並提供「換一組文法」按鈕。
- 文法卡正面顯示 `grammar`、`kana`、`level`、`category`。
- 按下「顯示答案」後顯示 `meaning`、`structure`、`usage`、`example`、`exampleKana`、`exampleMeaning`、`note`、`similar`；其中 `note` 與 `similar` 若無內容則不顯示。
- 文法卡模式已支援程度篩選：全部程度、N5、N4。
- 文法卡模式已支援分類篩選：全部分類、助詞、動詞變化、希望、義務・許可、經驗、條件、授受、推量・樣態、並列・例示、目的・理由、其他。
- 文法卡模式搜尋會同時查詢 `grammar`、`kana`、`meaning`、`structure`、`usage`、`example`、`exampleKana`、`exampleMeaning`、`note`、`similar`、`category`、`level`。
- 文法卡模式的搜尋、程度篩選與分類篩選可一起使用；若篩選結果不足 1 筆，會顯示「找不到符合的文法，請調整分類或搜尋條件。」
- 已更新 `index.html` 中 `style.css` 與 `script.js` 的版本參數為 `v=1.4`。

## 文法卡模式檢查結果

- JavaScript 已通過 `node --check script.js` 語法檢查。
- 已使用 Node mock DOM 檢查單字卡、單字測驗、文法卡切換與文法卡顯示／篩選／搜尋互動。
- 已確認單字卡模式仍使用 `vocabulary.json`、每組 10 個單字與原本顯示答案流程。
- 已確認單字測驗模式仍使用目前單字篩選結果產生選擇題，且不會切換到文法資料。
- 已確認文法卡模式會讀取 `grammar.json`，並以每組 5 條文法顯示。
- 已確認文法卡模式的顯示答案／隱藏答案、換一組文法、程度篩選、分類篩選、搜尋功能皆已實作。
- 已確認本次未修改 `vocabulary.json` 與 `grammar.json` 內容。
