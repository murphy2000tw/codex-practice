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
