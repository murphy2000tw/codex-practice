# Batch 17C-9C：N5 reading deterministic derived bank

## 定位與聲明

本批以 PR #300 merge commit `fec97bb7c301da796479b0c0efa6741c1b4f7f86` 為固定 baseline，只建立隔離的資料層 seed capacity。本站資料僅為 site-internal JLPT-style（站內 JLPT 風格）練習素材；不是官方 JLPT 題庫、官方題型比例、官方漢字表或官方認證內容。

本批只新增下列四個檔案：

1. `japaneseJlptReadingN5Questions.json`
2. `scripts/build-japanese-jlpt-batch17c9c-reading-data.js`
3. `scripts/check-japanese-jlpt-batch17c9c-reading-data.js`
4. `docs/japanese-jlpt-batch17c9c-reading-data.md`

## Inventory

Derived bank 固定為 N5 **8 sets／12 questions**，代表 seed capacity，而不是 product quota；`seedCapacity` 為 `true`，`productQuota` 為 `false`。

| Section | Sets | Questions |
| --- | ---: | ---: |
| `short-passage` | 2 | 2 |
| `medium-passage` | 2 | 4 |
| `information-search` | 2 | 4 |
| `notice-and-message` | 2 | 2 |

## Data flow、join 與 schema

Builder 同時讀取 `japaneseJlptReadingN5ReviewedSource.json` 與 `japaneseJlptReadingN5ReviewManifest.json`，以精確 `setId` 建立一對一 join，再產生 committed `japaneseJlptReadingN5Questions.json`。它不以 array position join，也沒有其他 level、section 或來源的 fallback。

Top level 保存 schema/data/derivation/source/manifest/review versions、非官方聲明、`generatedFrom`、inventory 與 `readingSets`。每個 set 保存 stable `id`/`sourceSetId`、原始與顯示 title/passage、kana/ruby policy、review metadata、digest、provenance、material（僅 information search）及 questions。每題保存 stable `id`/`sourceQuestionId`、原始與顯示題文、canonical options/answer、review 結果與 passage 或 information evidence。Original 與 display 欄位逐字相同，builder 不會改寫、正規化或補寫已審閱文字。

## Stable identity 與 deterministic ordering

Set/question identity 原樣保留 17C-9B stable canonical ID，不依賴 array position、顯示文字、時間或 shuffle。Set 依 `short-passage`、`medium-passage`、`information-search`、`notice-and-message` 排序；同 section 以明確 Unicode code-point comparator 排 source set ID。Question、options、evidence、material rows/cells 維持來源的 canonical array order，不自行排序。輸出固定使用 2-space JSON indentation 與恰好一個結尾 newline，且不含 timestamp、hostname、環境或隨機值。

## Snapshot、SHA-256 與 evidence preservation

每筆 manifest record 的 `sourceSnapshot` 必須與完整 source set canonical equality，question IDs 與 review status/version/method 也必須一致。Digest canonicalization 先複製完整 source set，只移除最上層 `sourceDigest`，遞迴排序 object keys、保留所有 array order，再以 canonical UTF-8 JSON 計算 SHA-256。Derived bank 保存 builder 重新計算並驗證過的 digest，不盲信 manifest 字串。

Passage evidence 的 code-point offsets/text 原樣深層複製並以 passage 驗證。Information-search 的 structured material、plain-text projection、row/cell identity、evidence scope 與 references 原樣深層複製；checker 驗證 row/cell ownership、完整比較列及 duplicate references。

## Atomic build、check 與 drift detection

執行 `node scripts/build-japanese-jlpt-batch17c9c-reading-data.js` 時，builder 先在 output 同目錄寫 temporary file，再 atomic rename，並以 `try/finally` 清除 temporary file。`--check` 只進行 expected/committed byte comparison，完全不寫檔；相同時 exit 0，drift 時非零退出。

Checker 會連續 pure build 兩次、反轉 source sets 與 manifest records、比較 committed bytes、確認所有 semantic arrays 未重排，並呼叫 builder `--check`。Drift fixture 會暫時竄改 committed output、要求 `--check` 失敗，再於 `finally` byte-for-byte 還原 source、manifest 與 output。Checker 實際建立並送入 `buildData` 或同一 derived validator 的 **56** 個 in-memory negative fixtures，且要求 56/56 全數拒絕；fixtures 涵蓋 version、join、identity、inventory、review、digest/snapshot、答案、evidence/material、kana/ruby、安全字串、N4 reuse 與 production quota 等 drift。

## Production isolation 與後續批次

Scope guard 要求 baseline 是 HEAD ancestor、baseline 既有檔案保持 byte identity，而且只有上述四個新增檔案。Production 不載入 derived bank；本批沒有 adapter、runtime fetch/import/script tag、session selection、答案 randomization、production profile 或 N5 reading activation。N5 reading 仍為 unavailable/included false，production totals 仍為 N5 20 與 N4 34。

17C-9D 才建立 N5／N4 immutable adapter 與 isolated reading pipeline；Batch 17C-10 才決定 product quota 與是否啟用 N5 reading。
