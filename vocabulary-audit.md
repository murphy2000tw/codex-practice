# vocabulary.json 資料品質檢查報告

## 檢查範圍

- 檢查檔案：`vocabulary.json`。
- 總筆數：2200。
- 必要欄位：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 本報告記錄發現的可疑或需修正項目；本次已依「已修正項目」區塊更新 `vocabulary.json`。

## 整體檢查結果

- 缺少欄位：未發現。
- `level` 欄位：既有 1000 筆單字維持 `"level": "N5"`，目前共新增 1200 筆 `"level": "N4"` 單字。
- 空白欄位：未發現。
- `word` 重複：未發現。
- `id` 重複：未發現。
- `id` 不連續：未發現，id 由 1 到 2200 連續。
- `meaning` 混入日文假名：未發現明顯案例。
- 原主要問題集中在 id 662–921 的數量詞例句：多筆 `exampleKana` 含漢字，且 `exampleMeaning` 混入日文假名、日文漢字或日文助詞；本次已修正這些高信心問題。
- 另有部分例句雖有使用到 `word` 或同讀音 `kana`，但語義搭配不自然；本次已修正問題清單中列出的高信心項目。

## 已修正項目

- 已修正 id 218「取る」與 id 219「撮る」語義重疊的高信心問題：`取る` 保留「拿取；取得」語義，例句改為「資料を取ります。」。
- 已修正 id 662–681 人數量詞例句：移除重複的「人」，將 `exampleKana` 改為完整假名，並將 `exampleMeaning` 改為自然繁體中文。
- 已修正 id 682–921 主要數量詞例句：補齊 `exampleKana` 中的漢字讀音，移除 `exampleMeaning` 中混入的日文假名、日文助詞或日文句子，並改為自然繁體中文。
- 已修正 id 922–935 的不自然時間、季節與順序相關例句，使 `example` 使用該單字且符合 N5 程度。
- 已修正 id 946–949、951–952、954–955、958–961、964、966–968、970 的不自然例句或翻譯，使例句與中文意思對應。
- 已新增 `level` 欄位，全部 1000 筆現有單字皆標記為 `N5`，以便未來加入 N4 單字時可共用資料結構。
- 已更新網站篩選功能，新增「程度篩選」按鈕（全部程度／N5／N4），並讓搜尋可比對 `level` 欄位；N4 目前無資料時會顯示「這個分類目前沒有單字」。
- 修正後已確認 `vocabulary.json` 仍為合法 JSON，總筆數仍為 1000 筆，id 仍為 1–1000 連續，`word` 沒有重複，必要欄位皆存在且沒有空白欄位。
- N4 第 1 批新增後已再次確認 `vocabulary.json` 為合法 JSON，總筆數為 1300 筆，id 為 1–1300 連續且不重複，`word` 沒有重複，必要欄位皆存在且沒有空白欄位，所有 `exampleKana` 皆不含漢字。
- N4 第 2 批新增後已再次確認 `vocabulary.json` 為合法 JSON，總筆數為 1600 筆，id 為 1–1600 連續且不重複，`word` 沒有重複，必要欄位皆存在且沒有空白欄位，所有新增單字皆標記為 `"level": "N4"`，且新增資料的 `exampleKana` 皆不含漢字。
- N4 第 3 批新增後已再次確認 `vocabulary.json` 為合法 JSON，總筆數為 1900 筆，id 為 1–1900 連續且不重複，`word` 沒有重複，必要欄位皆存在且沒有空白欄位，所有新增單字皆標記為 `"level": "N4"`，且新增資料的 `exampleKana` 皆不含漢字。
- N4 第 4 批新增後已再次確認 `vocabulary.json` 為合法 JSON，總筆數為 2200 筆，id 為 1–2200 連續且不重複，`word` 沒有重複，必要欄位皆存在且沒有空白欄位，所有新增單字皆標記為 `"level": "N4"`，且新增資料的 `exampleKana` 皆不含漢字。

## N4 第 2 批 300 個單字新增紀錄

- 新增範圍：id 1301–1600，共 300 筆 `N4` 單字，接續既有最後一個 id 1300 編號。
- 本批新增內容未變更既有 N5（id 1–1000）與 N4 第 1 批（id 1001–1300）單字內容。
- 欄位沿用上一批資料結構：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 品詞分布：動詞 73 筆、い形容詞 27 筆、な形容詞 11 筆、名詞 189 筆。
- 新增後檢查結果：總筆數 1600 筆，id 1–1600 連續且不重複，`word` 無重複，必要欄位皆存在且無空白欄位，新增資料的 `exampleKana` 未發現漢字。

## N4 第 3 批 300 個單字新增紀錄

- 新增範圍：id 1601–1900，共 300 筆 `N4` 單字，接續既有最後一個 id 1600 編號。
- 本批新增內容未變更既有 N5（id 1–1000）、N4 第 1 批（id 1001–1300）與 N4 第 2 批（id 1301–1600）單字內容。
- 欄位沿用上一批資料結構：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 品詞分布：名詞 300 筆。
- 新增後檢查結果：總筆數 1900 筆，id 1–1900 連續且不重複，`word` 無重複，必要欄位皆存在且無空白欄位，新增資料的 `exampleKana` 未發現漢字。

## N4 第 4 批 300 個單字新增紀錄

- 新增範圍：id 1901–2200，共 300 筆 `N4` 單字，接續既有最後一個 id 1900 編號。
- 本批新增內容未變更既有 N5（id 1–1000）、N4 第 1 批（id 1001–1300）、N4 第 2 批（id 1301–1600）與 N4 第 3 批（id 1601–1900）單字內容。
- 欄位沿用上一批資料結構：`id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 品詞分布：名詞 300 筆。
- 新增內容主題涵蓋行政手續、醫療健康、購物服務、住家生活、學校工作、交通旅行與防災等 N4 生活情境相關詞彙。
- 新增後檢查結果：總筆數 2200 筆，id 1–2200 連續且不重複，`word` 無重複，必要欄位皆存在且無空白欄位，新增資料的 `exampleKana` 未發現漢字。

## 數量詞例句自然度修正紀錄

- 本次專門檢視 `partOfSpeech` 為「數量詞」的 id 662–921，共 260 筆；未發現「數量詞相關」資料。
- 修正人數類例句：改為「學生が五人います。」這類自然位置，避免單獨數量詞接 `が` 的突兀句型。
- 修正物品計數類例句：涵蓋 `個`、`枚`、`冊`、`回`、`杯`，改為「りんごを三個買います。」「本を二冊読みます。」「水を一杯飲みます。」等「名詞 + 助詞 + 數量詞 + 動詞」句型。
- 修正存在句類例句：涵蓋 `本`、`台`、`匹`，改為「鉛筆が一本あります。」「車が二台あります。」「犬が三匹います。」等自然句型。
- 修正場所、順序與狀態類例句：涵蓋 `階`、`番`、`歳`，補足「教室」「私の番号」等簡單語境，使句子更自然。
- `円` 類維持簡單付款句型，並確認 `exampleKana` 為完整假名、`exampleMeaning` 為繁體中文。

## 仍需人工確認項目

- id 662–921 的數量詞 `meaning` 欄位仍沿用原資料；其中部分中文量詞或說明（例如「本（書籍）」與「日圓」的表述）可能可再依教材風格人工微調。
- 本次僅處理本報告列出的高信心錯誤；未對全部 1000 筆資料進行逐句風格重寫，其他未列入問題清單的例句仍可另行抽樣校對。

## 問題清單

| id | word | kana | 問題類型 | 目前內容 | 建議修正 |
|---:|---|---|---|---|---|
| 218 | 取る | とる | meaning / example 與 id 219「撮る」重疊 | meaning: 拿取；拍攝 / example: 写真を取ります。 | 若要保留「取る」，meaning 建議為「拿取；取得」，example 改為「資料を取ります。」/「しりょうをとります。」/「取得資料。」；拍照語義留給「撮る」。 |
| 662 | 一人 | ひとり | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 一人人がいます。 / exampleKana: ひとり人がいます。 / exampleMeaning: 一個人人が。 | example: 一人がいます。 / exampleKana: ひとりがいます。 / exampleMeaning: 有一個人。 |
| 663 | 二人 | ふたり | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 二人人がいます。 / exampleKana: ふたり人がいます。 / exampleMeaning: 兩個人人が。 | example: 二人がいます。 / exampleKana: ふたりがいます。 / exampleMeaning: 有兩個人。 |
| 664 | 三人 | さんにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 三人人がいます。 / exampleKana: さんにん人がいます。 / exampleMeaning: 三個人人が。 | example: 三人がいます。 / exampleKana: さんにんがいます。 / exampleMeaning: 有三個人。 |
| 665 | 四人 | よにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 四人人がいます。 / exampleKana: よにん人がいます。 / exampleMeaning: 四個人人が。 | example: 四人がいます。 / exampleKana: よにんがいます。 / exampleMeaning: 有四個人。 |
| 666 | 五人 | ごにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 五人人がいます。 / exampleKana: ごにん人がいます。 / exampleMeaning: 五個人人が。 | example: 五人がいます。 / exampleKana: ごにんがいます。 / exampleMeaning: 有五個人。 |
| 667 | 六人 | ろくにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 六人人がいます。 / exampleKana: ろくにん人がいます。 / exampleMeaning: 六個人人が。 | example: 六人がいます。 / exampleKana: ろくにんがいます。 / exampleMeaning: 有六個人。 |
| 668 | 七人 | ななにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 七人人がいます。 / exampleKana: ななにん人がいます。 / exampleMeaning: 七個人人が。 | example: 七人がいます。 / exampleKana: ななにんがいます。 / exampleMeaning: 有七個人。 |
| 669 | 八人 | はちにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 八人人がいます。 / exampleKana: はちにん人がいます。 / exampleMeaning: 八個人人が。 | example: 八人がいます。 / exampleKana: はちにんがいます。 / exampleMeaning: 有八個人。 |
| 670 | 九人 | きゅうにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 九人人がいます。 / exampleKana: きゅうにん人がいます。 / exampleMeaning: 九個人人が。 | example: 九人がいます。 / exampleKana: きゅうにんがいます。 / exampleMeaning: 有九個人。 |
| 671 | 十人 | じゅうにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十人人がいます。 / exampleKana: じゅうにん人がいます。 / exampleMeaning: 十個人人が。 | example: 十人がいます。 / exampleKana: じゅうにんがいます。 / exampleMeaning: 有十個人。 |
| 672 | 十一人 | じゅういちにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十一人人がいます。 / exampleKana: じゅういちにん人がいます。 / exampleMeaning: 十一個人人が。 | example: 十一人がいます。 / exampleKana: じゅういちにんがいます。 / exampleMeaning: 有十一個人。 |
| 673 | 十二人 | じゅうににん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十二人人がいます。 / exampleKana: じゅうににん人がいます。 / exampleMeaning: 十二個人人が。 | example: 十二人がいます。 / exampleKana: じゅうににんがいます。 / exampleMeaning: 有十二個人。 |
| 674 | 十三人 | じゅうさんにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十三人人がいます。 / exampleKana: じゅうさんにん人がいます。 / exampleMeaning: 十三個人人が。 | example: 十三人がいます。 / exampleKana: じゅうさんにんがいます。 / exampleMeaning: 有十三個人。 |
| 675 | 十四人 | じゅうよんにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十四人人がいます。 / exampleKana: じゅうよんにん人がいます。 / exampleMeaning: 十四個人人が。 | example: 十四人がいます。 / exampleKana: じゅうよんにんがいます。 / exampleMeaning: 有十四個人。 |
| 676 | 十五人 | じゅうごにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十五人人がいます。 / exampleKana: じゅうごにん人がいます。 / exampleMeaning: 十五個人人が。 | example: 十五人がいます。 / exampleKana: じゅうごにんがいます。 / exampleMeaning: 有十五個人。 |
| 677 | 十六人 | じゅうろくにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十六人人がいます。 / exampleKana: じゅうろくにん人がいます。 / exampleMeaning: 十六個人人が。 | example: 十六人がいます。 / exampleKana: じゅうろくにんがいます。 / exampleMeaning: 有十六個人。 |
| 678 | 十七人 | じゅうななにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十七人人がいます。 / exampleKana: じゅうななにん人がいます。 / exampleMeaning: 十七個人人が。 | example: 十七人がいます。 / exampleKana: じゅうななにんがいます。 / exampleMeaning: 有十七個人。 |
| 679 | 十八人 | じゅうはちにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十八人人がいます。 / exampleKana: じゅうはちにん人がいます。 / exampleMeaning: 十八個人人が。 | example: 十八人がいます。 / exampleKana: じゅうはちにんがいます。 / exampleMeaning: 有十八個人。 |
| 680 | 十九人 | じゅうきゅうにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 十九人人がいます。 / exampleKana: じゅうきゅうにん人がいます。 / exampleMeaning: 十九個人人が。 | example: 十九人がいます。 / exampleKana: じゅうきゅうにんがいます。 / exampleMeaning: 有十九個人。 |
| 681 | 二十人 | にじゅうにん | example 重複「人」且不自然；exampleKana 含漢字；exampleMeaning 混入日文並翻譯錯誤 | example: 二十人人がいます。 / exampleKana: にじゅうにん人がいます。 / exampleMeaning: 二十個人人が。 | example: 二十人がいます。 / exampleKana: にじゅうにんがいます。 / exampleMeaning: 有二十個人。 |
| 682 | 一個 | いちこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 一個りんごを買います。 / exampleKana: いちこりんごを買います。 / exampleMeaning: 一個りんごを買。 | example: りんごを一個買います。 / exampleKana: りんごをいちこかいます。 / exampleMeaning: 買一個蘋果。 |
| 683 | 二個 | にこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 二個りんごを買います。 / exampleKana: にこりんごを買います。 / exampleMeaning: 二個りんごを買。 | example: りんごを二個買います。 / exampleKana: りんごをにこかいます。 / exampleMeaning: 買兩個蘋果。 |
| 684 | 三個 | さんこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 三個りんごを買います。 / exampleKana: さんこりんごを買います。 / exampleMeaning: 三個りんごを買。 | example: りんごを三個買います。 / exampleKana: りんごをさんこかいます。 / exampleMeaning: 買三個蘋果。 |
| 685 | 四個 | よんこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 四個りんごを買います。 / exampleKana: よんこりんごを買います。 / exampleMeaning: 四個りんごを買。 | example: りんごを四個買います。 / exampleKana: りんごをよんこかいます。 / exampleMeaning: 買四個蘋果。 |
| 686 | 五個 | ごこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 五個りんごを買います。 / exampleKana: ごこりんごを買います。 / exampleMeaning: 五個りんごを買。 | example: りんごを五個買います。 / exampleKana: りんごをごこかいます。 / exampleMeaning: 買五個蘋果。 |
| 687 | 六個 | ろくこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 六個りんごを買います。 / exampleKana: ろくこりんごを買います。 / exampleMeaning: 六個りんごを買。 | example: りんごを六個買います。 / exampleKana: りんごをろくこかいます。 / exampleMeaning: 買六個蘋果。 |
| 688 | 七個 | ななこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 七個りんごを買います。 / exampleKana: ななこりんごを買います。 / exampleMeaning: 七個りんごを買。 | example: りんごを七個買います。 / exampleKana: りんごをななこかいます。 / exampleMeaning: 買七個蘋果。 |
| 689 | 八個 | はちこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 八個りんごを買います。 / exampleKana: はちこりんごを買います。 / exampleMeaning: 八個りんごを買。 | example: りんごを八個買います。 / exampleKana: りんごをはちこかいます。 / exampleMeaning: 買八個蘋果。 |
| 690 | 九個 | きゅうこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 九個りんごを買います。 / exampleKana: きゅうこりんごを買います。 / exampleMeaning: 九個りんごを買。 | example: りんごを九個買います。 / exampleKana: りんごをきゅうこかいます。 / exampleMeaning: 買九個蘋果。 |
| 691 | 十個 | じゅうこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十個りんごを買います。 / exampleKana: じゅうこりんごを買います。 / exampleMeaning: 十個りんごを買。 | example: りんごを十個買います。 / exampleKana: りんごをじゅうこかいます。 / exampleMeaning: 買十個蘋果。 |
| 692 | 十一個 | じゅういちこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十一個りんごを買います。 / exampleKana: じゅういちこりんごを買います。 / exampleMeaning: 十一個りんごを買。 | example: りんごを十一個買います。 / exampleKana: りんごをじゅういちこかいます。 / exampleMeaning: 買十一個蘋果。 |
| 693 | 十二個 | じゅうにこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十二個りんごを買います。 / exampleKana: じゅうにこりんごを買います。 / exampleMeaning: 十二個りんごを買。 | example: りんごを十二個買います。 / exampleKana: りんごをじゅうにこかいます。 / exampleMeaning: 買十二個蘋果。 |
| 694 | 十三個 | じゅうさんこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十三個りんごを買います。 / exampleKana: じゅうさんこりんごを買います。 / exampleMeaning: 十三個りんごを買。 | example: りんごを十三個買います。 / exampleKana: りんごをじゅうさんこかいます。 / exampleMeaning: 買十三個蘋果。 |
| 695 | 十四個 | じゅうよんこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十四個りんごを買います。 / exampleKana: じゅうよんこりんごを買います。 / exampleMeaning: 十四個りんごを買。 | example: りんごを十四個買います。 / exampleKana: りんごをじゅうよんこかいます。 / exampleMeaning: 買十四個蘋果。 |
| 696 | 十五個 | じゅうごこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十五個りんごを買います。 / exampleKana: じゅうごこりんごを買います。 / exampleMeaning: 十五個りんごを買。 | example: りんごを十五個買います。 / exampleKana: りんごをじゅうごこかいます。 / exampleMeaning: 買十五個蘋果。 |
| 697 | 十六個 | じゅうろくこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十六個りんごを買います。 / exampleKana: じゅうろくこりんごを買います。 / exampleMeaning: 十六個りんごを買。 | example: りんごを十六個買います。 / exampleKana: りんごをじゅうろくこかいます。 / exampleMeaning: 買十六個蘋果。 |
| 698 | 十七個 | じゅうななこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十七個りんごを買います。 / exampleKana: じゅうななこりんごを買います。 / exampleMeaning: 十七個りんごを買。 | example: りんごを十七個買います。 / exampleKana: りんごをじゅうななこかいます。 / exampleMeaning: 買十七個蘋果。 |
| 699 | 十八個 | じゅうはちこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十八個りんごを買います。 / exampleKana: じゅうはちこりんごを買います。 / exampleMeaning: 十八個りんごを買。 | example: りんごを十八個買います。 / exampleKana: りんごをじゅうはちこかいます。 / exampleMeaning: 買十八個蘋果。 |
| 700 | 十九個 | じゅうきゅうこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 十九個りんごを買います。 / exampleKana: じゅうきゅうこりんごを買います。 / exampleMeaning: 十九個りんごを買。 | example: りんごを十九個買います。 / exampleKana: りんごをじゅうきゅうこかいます。 / exampleMeaning: 買十九個蘋果。 |
| 701 | 二十個 | にじゅうこ | exampleKana 含漢字；exampleMeaning 混入日文假名且句子未完整翻譯 | example: 二十個りんごを買います。 / exampleKana: にじゅうこりんごを買います。 / exampleMeaning: 二十個りんごを買。 | example: りんごを二十個買います。 / exampleKana: りんごをにじゅうこかいます。 / exampleMeaning: 買二十個蘋果。 |
| 702 | 一本 | いっぽん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 一本鉛筆があります。 / exampleKana: いっぽん鉛筆があります。 / exampleMeaning: 一支鉛筆が。 | example: 鉛筆が一本あります。 / exampleKana: えんぴつがいっぽんあります。 / exampleMeaning: 有一支鉛筆。 |
| 703 | 二本 | にほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 二本鉛筆があります。 / exampleKana: にほん鉛筆があります。 / exampleMeaning: 二支；條；瓶鉛筆が。 | example: 鉛筆が二本あります。 / exampleKana: えんぴつがにほんあります。 / exampleMeaning: 有兩支鉛筆。 |
| 704 | 三本 | さんぼん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 三本鉛筆があります。 / exampleKana: さんぼん鉛筆があります。 / exampleMeaning: 三支鉛筆が。 | example: 鉛筆が三本あります。 / exampleKana: えんぴつがさんぼんあります。 / exampleMeaning: 有三支鉛筆。 |
| 705 | 四本 | よんほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 四本鉛筆があります。 / exampleKana: よんほん鉛筆があります。 / exampleMeaning: 四支；條；瓶鉛筆が。 | example: 鉛筆が四本あります。 / exampleKana: えんぴつがよんほんあります。 / exampleMeaning: 有四支鉛筆。 |
| 706 | 五本 | ごほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 五本鉛筆があります。 / exampleKana: ごほん鉛筆があります。 / exampleMeaning: 五支；條；瓶鉛筆が。 | example: 鉛筆が五本あります。 / exampleKana: えんぴつがごほんあります。 / exampleMeaning: 有五支鉛筆。 |
| 707 | 六本 | ろっぽん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 六本鉛筆があります。 / exampleKana: ろっぽん鉛筆があります。 / exampleMeaning: 六支鉛筆が。 | example: 鉛筆が六本あります。 / exampleKana: えんぴつがろっぽんあります。 / exampleMeaning: 有六支鉛筆。 |
| 708 | 七本 | ななほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 七本鉛筆があります。 / exampleKana: ななほん鉛筆があります。 / exampleMeaning: 七支；條；瓶鉛筆が。 | example: 鉛筆が七本あります。 / exampleKana: えんぴつがななほんあります。 / exampleMeaning: 有七支鉛筆。 |
| 709 | 八本 | はっぽん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 八本鉛筆があります。 / exampleKana: はっぽん鉛筆があります。 / exampleMeaning: 八支鉛筆が。 | example: 鉛筆が八本あります。 / exampleKana: えんぴつがはっぽんあります。 / exampleMeaning: 有八支鉛筆。 |
| 710 | 九本 | きゅうほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 九本鉛筆があります。 / exampleKana: きゅうほん鉛筆があります。 / exampleMeaning: 九支；條；瓶鉛筆が。 | example: 鉛筆が九本あります。 / exampleKana: えんぴつがきゅうほんあります。 / exampleMeaning: 有九支鉛筆。 |
| 711 | 十本 | じゅっぽん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十本鉛筆があります。 / exampleKana: じゅっぽん鉛筆があります。 / exampleMeaning: 十支鉛筆が。 | example: 鉛筆が十本あります。 / exampleKana: えんぴつがじゅっぽんあります。 / exampleMeaning: 有十支鉛筆。 |
| 712 | 十一本 | じゅういちほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十一本鉛筆があります。 / exampleKana: じゅういちほん鉛筆があります。 / exampleMeaning: 十一支；條；瓶鉛筆が。 | example: 鉛筆が十一本あります。 / exampleKana: えんぴつがじゅういちほんあります。 / exampleMeaning: 有十一支鉛筆。 |
| 713 | 十二本 | じゅうにほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十二本鉛筆があります。 / exampleKana: じゅうにほん鉛筆があります。 / exampleMeaning: 十二支；條；瓶鉛筆が。 | example: 鉛筆が十二本あります。 / exampleKana: えんぴつがじゅうにほんあります。 / exampleMeaning: 有十二支鉛筆。 |
| 714 | 十三本 | じゅうさんほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十三本鉛筆があります。 / exampleKana: じゅうさんほん鉛筆があります。 / exampleMeaning: 十三支；條；瓶鉛筆が。 | example: 鉛筆が十三本あります。 / exampleKana: えんぴつがじゅうさんほんあります。 / exampleMeaning: 有十三支鉛筆。 |
| 715 | 十四本 | じゅうよんほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十四本鉛筆があります。 / exampleKana: じゅうよんほん鉛筆があります。 / exampleMeaning: 十四支；條；瓶鉛筆が。 | example: 鉛筆が十四本あります。 / exampleKana: えんぴつがじゅうよんほんあります。 / exampleMeaning: 有十四支鉛筆。 |
| 716 | 十五本 | じゅうごほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十五本鉛筆があります。 / exampleKana: じゅうごほん鉛筆があります。 / exampleMeaning: 十五支；條；瓶鉛筆が。 | example: 鉛筆が十五本あります。 / exampleKana: えんぴつがじゅうごほんあります。 / exampleMeaning: 有十五支鉛筆。 |
| 717 | 十六本 | じゅうろくほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十六本鉛筆があります。 / exampleKana: じゅうろくほん鉛筆があります。 / exampleMeaning: 十六支；條；瓶鉛筆が。 | example: 鉛筆が十六本あります。 / exampleKana: えんぴつがじゅうろくほんあります。 / exampleMeaning: 有十六支鉛筆。 |
| 718 | 十七本 | じゅうななほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十七本鉛筆があります。 / exampleKana: じゅうななほん鉛筆があります。 / exampleMeaning: 十七支；條；瓶鉛筆が。 | example: 鉛筆が十七本あります。 / exampleKana: えんぴつがじゅうななほんあります。 / exampleMeaning: 有十七支鉛筆。 |
| 719 | 十八本 | じゅうはちほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十八本鉛筆があります。 / exampleKana: じゅうはちほん鉛筆があります。 / exampleMeaning: 十八支；條；瓶鉛筆が。 | example: 鉛筆が十八本あります。 / exampleKana: えんぴつがじゅうはちほんあります。 / exampleMeaning: 有十八支鉛筆。 |
| 720 | 十九本 | じゅうきゅうほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 十九本鉛筆があります。 / exampleKana: じゅうきゅうほん鉛筆があります。 / exampleMeaning: 十九支；條；瓶鉛筆が。 | example: 鉛筆が十九本あります。 / exampleKana: えんぴつがじゅうきゅうほんあります。 / exampleMeaning: 有十九支鉛筆。 |
| 721 | 二十本 | にじゅうほん | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞/漢字且未完整翻譯 | example: 二十本鉛筆があります。 / exampleKana: にじゅうほん鉛筆があります。 / exampleMeaning: 二十支；條；瓶鉛筆が。 | example: 鉛筆が二十本あります。 / exampleKana: えんぴつがにじゅうほんあります。 / exampleMeaning: 有二十支鉛筆。 |
| 722 | 一枚 | いちまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 一枚切手を買います。 / exampleKana: いちまい切手を買います。 / exampleMeaning: 一張切手を買。 | example: 切手を一枚買います。 / exampleKana: きってをいちまいかいます。 / exampleMeaning: 買一張郵票。 |
| 723 | 二枚 | にまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 二枚切手を買います。 / exampleKana: にまい切手を買います。 / exampleMeaning: 二張切手を買。 | example: 切手を二枚買います。 / exampleKana: きってをにまいかいます。 / exampleMeaning: 買兩張郵票。 |
| 724 | 三枚 | さんまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 三枚切手を買います。 / exampleKana: さんまい切手を買います。 / exampleMeaning: 三張切手を買。 | example: 切手を三枚買います。 / exampleKana: きってをさんまいかいます。 / exampleMeaning: 買三張郵票。 |
| 725 | 四枚 | よんまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 四枚切手を買います。 / exampleKana: よんまい切手を買います。 / exampleMeaning: 四張切手を買。 | example: 切手を四枚買います。 / exampleKana: きってをよんまいかいます。 / exampleMeaning: 買四張郵票。 |
| 726 | 五枚 | ごまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 五枚切手を買います。 / exampleKana: ごまい切手を買います。 / exampleMeaning: 五張切手を買。 | example: 切手を五枚買います。 / exampleKana: きってをごまいかいます。 / exampleMeaning: 買五張郵票。 |
| 727 | 六枚 | ろくまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 六枚切手を買います。 / exampleKana: ろくまい切手を買います。 / exampleMeaning: 六張切手を買。 | example: 切手を六枚買います。 / exampleKana: きってをろくまいかいます。 / exampleMeaning: 買六張郵票。 |
| 728 | 七枚 | ななまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 七枚切手を買います。 / exampleKana: ななまい切手を買います。 / exampleMeaning: 七張切手を買。 | example: 切手を七枚買います。 / exampleKana: きってをななまいかいます。 / exampleMeaning: 買七張郵票。 |
| 729 | 八枚 | はちまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 八枚切手を買います。 / exampleKana: はちまい切手を買います。 / exampleMeaning: 八張切手を買。 | example: 切手を八枚買います。 / exampleKana: きってをはちまいかいます。 / exampleMeaning: 買八張郵票。 |
| 730 | 九枚 | きゅうまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 九枚切手を買います。 / exampleKana: きゅうまい切手を買います。 / exampleMeaning: 九張切手を買。 | example: 切手を九枚買います。 / exampleKana: きってをきゅうまいかいます。 / exampleMeaning: 買九張郵票。 |
| 731 | 十枚 | じゅうまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十枚切手を買います。 / exampleKana: じゅうまい切手を買います。 / exampleMeaning: 十張切手を買。 | example: 切手を十枚買います。 / exampleKana: きってをじゅうまいかいます。 / exampleMeaning: 買十張郵票。 |
| 732 | 十一枚 | じゅういちまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十一枚切手を買います。 / exampleKana: じゅういちまい切手を買います。 / exampleMeaning: 十一張切手を買。 | example: 切手を十一枚買います。 / exampleKana: きってをじゅういちまいかいます。 / exampleMeaning: 買十一張郵票。 |
| 733 | 十二枚 | じゅうにまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十二枚切手を買います。 / exampleKana: じゅうにまい切手を買います。 / exampleMeaning: 十二張切手を買。 | example: 切手を十二枚買います。 / exampleKana: きってをじゅうにまいかいます。 / exampleMeaning: 買十二張郵票。 |
| 734 | 十三枚 | じゅうさんまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十三枚切手を買います。 / exampleKana: じゅうさんまい切手を買います。 / exampleMeaning: 十三張切手を買。 | example: 切手を十三枚買います。 / exampleKana: きってをじゅうさんまいかいます。 / exampleMeaning: 買十三張郵票。 |
| 735 | 十四枚 | じゅうよんまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十四枚切手を買います。 / exampleKana: じゅうよんまい切手を買います。 / exampleMeaning: 十四張切手を買。 | example: 切手を十四枚買います。 / exampleKana: きってをじゅうよんまいかいます。 / exampleMeaning: 買十四張郵票。 |
| 736 | 十五枚 | じゅうごまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十五枚切手を買います。 / exampleKana: じゅうごまい切手を買います。 / exampleMeaning: 十五張切手を買。 | example: 切手を十五枚買います。 / exampleKana: きってをじゅうごまいかいます。 / exampleMeaning: 買十五張郵票。 |
| 737 | 十六枚 | じゅうろくまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十六枚切手を買います。 / exampleKana: じゅうろくまい切手を買います。 / exampleMeaning: 十六張切手を買。 | example: 切手を十六枚買います。 / exampleKana: きってをじゅうろくまいかいます。 / exampleMeaning: 買十六張郵票。 |
| 738 | 十七枚 | じゅうななまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十七枚切手を買います。 / exampleKana: じゅうななまい切手を買います。 / exampleMeaning: 十七張切手を買。 | example: 切手を十七枚買います。 / exampleKana: きってをじゅうななまいかいます。 / exampleMeaning: 買十七張郵票。 |
| 739 | 十八枚 | じゅうはちまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十八枚切手を買います。 / exampleKana: じゅうはちまい切手を買います。 / exampleMeaning: 十八張切手を買。 | example: 切手を十八枚買います。 / exampleKana: きってをじゅうはちまいかいます。 / exampleMeaning: 買十八張郵票。 |
| 740 | 十九枚 | じゅうきゅうまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 十九枚切手を買います。 / exampleKana: じゅうきゅうまい切手を買います。 / exampleMeaning: 十九張切手を買。 | example: 切手を十九枚買います。 / exampleKana: きってをじゅうきゅうまいかいます。 / exampleMeaning: 買十九張郵票。 |
| 741 | 二十枚 | にじゅうまい | exampleKana 含漢字；exampleMeaning 混入日文假名且未完整翻譯 | example: 二十枚切手を買います。 / exampleKana: にじゅうまい切手を買います。 / exampleMeaning: 二十張切手を買。 | example: 切手を二十枚買います。 / exampleKana: きってをにじゅうまいかいます。 / exampleMeaning: 買二十張郵票。 |
| 742 | 一冊 | いちさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 一冊本を読みます。 / exampleKana: いちさつ本を読みます。 / exampleMeaning: 一本（書籍）本を読みます。 | example: 本を一冊読みます。 / exampleKana: ほんをいちさつよみます。 / exampleMeaning: 讀一本書。 |
| 743 | 二冊 | にさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 二冊本を読みます。 / exampleKana: にさつ本を読みます。 / exampleMeaning: 二本（書籍）本を読みます。 | example: 本を二冊読みます。 / exampleKana: ほんをにさつよみます。 / exampleMeaning: 讀兩本書。 |
| 744 | 三冊 | さんさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 三冊本を読みます。 / exampleKana: さんさつ本を読みます。 / exampleMeaning: 三本（書籍）本を読みます。 | example: 本を三冊読みます。 / exampleKana: ほんをさんさつよみます。 / exampleMeaning: 讀三本書。 |
| 745 | 四冊 | よんさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 四冊本を読みます。 / exampleKana: よんさつ本を読みます。 / exampleMeaning: 四本（書籍）本を読みます。 | example: 本を四冊読みます。 / exampleKana: ほんをよんさつよみます。 / exampleMeaning: 讀四本書。 |
| 746 | 五冊 | ごさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 五冊本を読みます。 / exampleKana: ごさつ本を読みます。 / exampleMeaning: 五本（書籍）本を読みます。 | example: 本を五冊読みます。 / exampleKana: ほんをごさつよみます。 / exampleMeaning: 讀五本書。 |
| 747 | 六冊 | ろくさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 六冊本を読みます。 / exampleKana: ろくさつ本を読みます。 / exampleMeaning: 六本（書籍）本を読みます。 | example: 本を六冊読みます。 / exampleKana: ほんをろくさつよみます。 / exampleMeaning: 讀六本書。 |
| 748 | 七冊 | ななさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 七冊本を読みます。 / exampleKana: ななさつ本を読みます。 / exampleMeaning: 七本（書籍）本を読みます。 | example: 本を七冊読みます。 / exampleKana: ほんをななさつよみます。 / exampleMeaning: 讀七本書。 |
| 749 | 八冊 | はちさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 八冊本を読みます。 / exampleKana: はちさつ本を読みます。 / exampleMeaning: 八本（書籍）本を読みます。 | example: 本を八冊読みます。 / exampleKana: ほんをはちさつよみます。 / exampleMeaning: 讀八本書。 |
| 750 | 九冊 | きゅうさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 九冊本を読みます。 / exampleKana: きゅうさつ本を読みます。 / exampleMeaning: 九本（書籍）本を読みます。 | example: 本を九冊読みます。 / exampleKana: ほんをきゅうさつよみます。 / exampleMeaning: 讀九本書。 |
| 751 | 十冊 | じゅうさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十冊本を読みます。 / exampleKana: じゅうさつ本を読みます。 / exampleMeaning: 十本（書籍）本を読みます。 | example: 本を十冊読みます。 / exampleKana: ほんをじゅうさつよみます。 / exampleMeaning: 讀十本書。 |
| 752 | 十一冊 | じゅういちさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十一冊本を読みます。 / exampleKana: じゅういちさつ本を読みます。 / exampleMeaning: 十一本（書籍）本を読みます。 | example: 本を十一冊読みます。 / exampleKana: ほんをじゅういちさつよみます。 / exampleMeaning: 讀十一本書。 |
| 753 | 十二冊 | じゅうにさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十二冊本を読みます。 / exampleKana: じゅうにさつ本を読みます。 / exampleMeaning: 十二本（書籍）本を読みます。 | example: 本を十二冊読みます。 / exampleKana: ほんをじゅうにさつよみます。 / exampleMeaning: 讀十二本書。 |
| 754 | 十三冊 | じゅうさんさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十三冊本を読みます。 / exampleKana: じゅうさんさつ本を読みます。 / exampleMeaning: 十三本（書籍）本を読みます。 | example: 本を十三冊読みます。 / exampleKana: ほんをじゅうさんさつよみます。 / exampleMeaning: 讀十三本書。 |
| 755 | 十四冊 | じゅうよんさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十四冊本を読みます。 / exampleKana: じゅうよんさつ本を読みます。 / exampleMeaning: 十四本（書籍）本を読みます。 | example: 本を十四冊読みます。 / exampleKana: ほんをじゅうよんさつよみます。 / exampleMeaning: 讀十四本書。 |
| 756 | 十五冊 | じゅうごさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十五冊本を読みます。 / exampleKana: じゅうごさつ本を読みます。 / exampleMeaning: 十五本（書籍）本を読みます。 | example: 本を十五冊読みます。 / exampleKana: ほんをじゅうごさつよみます。 / exampleMeaning: 讀十五本書。 |
| 757 | 十六冊 | じゅうろくさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十六冊本を読みます。 / exampleKana: じゅうろくさつ本を読みます。 / exampleMeaning: 十六本（書籍）本を読みます。 | example: 本を十六冊読みます。 / exampleKana: ほんをじゅうろくさつよみます。 / exampleMeaning: 讀十六本書。 |
| 758 | 十七冊 | じゅうななさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十七冊本を読みます。 / exampleKana: じゅうななさつ本を読みます。 / exampleMeaning: 十七本（書籍）本を読みます。 | example: 本を十七冊読みます。 / exampleKana: ほんをじゅうななさつよみます。 / exampleMeaning: 讀十七本書。 |
| 759 | 十八冊 | じゅうはちさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十八冊本を読みます。 / exampleKana: じゅうはちさつ本を読みます。 / exampleMeaning: 十八本（書籍）本を読みます。 | example: 本を十八冊読みます。 / exampleKana: ほんをじゅうはちさつよみます。 / exampleMeaning: 讀十八本書。 |
| 760 | 十九冊 | じゅうきゅうさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 十九冊本を読みます。 / exampleKana: じゅうきゅうさつ本を読みます。 / exampleMeaning: 十九本（書籍）本を読みます。 | example: 本を十九冊読みます。 / exampleKana: ほんをじゅうきゅうさつよみます。 / exampleMeaning: 讀十九本書。 |
| 761 | 二十冊 | にじゅうさつ | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文且翻譯不自然 | example: 二十冊本を読みます。 / exampleKana: にじゅうさつ本を読みます。 / exampleMeaning: 二十本（書籍）本を読みます。 | example: 本を二十冊読みます。 / exampleKana: ほんをにじゅうさつよみます。 / exampleMeaning: 讀二十本書。 |
| 762 | 一台 | いちだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 一台車があります。 / exampleKana: いちだい車があります。 / exampleMeaning: 一台車が。 | example: 車が一台あります。 / exampleKana: くるまがいちだいあります。 / exampleMeaning: 有一台車。 |
| 763 | 二台 | にだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 二台車があります。 / exampleKana: にだい車があります。 / exampleMeaning: 二台車が。 | example: 車が二台あります。 / exampleKana: くるまがにだいあります。 / exampleMeaning: 有兩台車。 |
| 764 | 三台 | さんだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 三台車があります。 / exampleKana: さんだい車があります。 / exampleMeaning: 三台車が。 | example: 車が三台あります。 / exampleKana: くるまがさんだいあります。 / exampleMeaning: 有三台車。 |
| 765 | 四台 | よんだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 四台車があります。 / exampleKana: よんだい車があります。 / exampleMeaning: 四台車が。 | example: 車が四台あります。 / exampleKana: くるまがよんだいあります。 / exampleMeaning: 有四台車。 |
| 766 | 五台 | ごだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 五台車があります。 / exampleKana: ごだい車があります。 / exampleMeaning: 五台車が。 | example: 車が五台あります。 / exampleKana: くるまがごだいあります。 / exampleMeaning: 有五台車。 |
| 767 | 六台 | ろくだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 六台車があります。 / exampleKana: ろくだい車があります。 / exampleMeaning: 六台車が。 | example: 車が六台あります。 / exampleKana: くるまがろくだいあります。 / exampleMeaning: 有六台車。 |
| 768 | 七台 | ななだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 七台車があります。 / exampleKana: ななだい車があります。 / exampleMeaning: 七台車が。 | example: 車が七台あります。 / exampleKana: くるまがななだいあります。 / exampleMeaning: 有七台車。 |
| 769 | 八台 | はちだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 八台車があります。 / exampleKana: はちだい車があります。 / exampleMeaning: 八台車が。 | example: 車が八台あります。 / exampleKana: くるまがはちだいあります。 / exampleMeaning: 有八台車。 |
| 770 | 九台 | きゅうだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 九台車があります。 / exampleKana: きゅうだい車があります。 / exampleMeaning: 九台車が。 | example: 車が九台あります。 / exampleKana: くるまがきゅうだいあります。 / exampleMeaning: 有九台車。 |
| 771 | 十台 | じゅうだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十台車があります。 / exampleKana: じゅうだい車があります。 / exampleMeaning: 十台車が。 | example: 車が十台あります。 / exampleKana: くるまがじゅうだいあります。 / exampleMeaning: 有十台車。 |
| 772 | 十一台 | じゅういちだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十一台車があります。 / exampleKana: じゅういちだい車があります。 / exampleMeaning: 十一台車が。 | example: 車が十一台あります。 / exampleKana: くるまがじゅういちだいあります。 / exampleMeaning: 有十一台車。 |
| 773 | 十二台 | じゅうにだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十二台車があります。 / exampleKana: じゅうにだい車があります。 / exampleMeaning: 十二台車が。 | example: 車が十二台あります。 / exampleKana: くるまがじゅうにだいあります。 / exampleMeaning: 有十二台車。 |
| 774 | 十三台 | じゅうさんだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十三台車があります。 / exampleKana: じゅうさんだい車があります。 / exampleMeaning: 十三台車が。 | example: 車が十三台あります。 / exampleKana: くるまがじゅうさんだいあります。 / exampleMeaning: 有十三台車。 |
| 775 | 十四台 | じゅうよんだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十四台車があります。 / exampleKana: じゅうよんだい車があります。 / exampleMeaning: 十四台車が。 | example: 車が十四台あります。 / exampleKana: くるまがじゅうよんだいあります。 / exampleMeaning: 有十四台車。 |
| 776 | 十五台 | じゅうごだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十五台車があります。 / exampleKana: じゅうごだい車があります。 / exampleMeaning: 十五台車が。 | example: 車が十五台あります。 / exampleKana: くるまがじゅうごだいあります。 / exampleMeaning: 有十五台車。 |
| 777 | 十六台 | じゅうろくだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十六台車があります。 / exampleKana: じゅうろくだい車があります。 / exampleMeaning: 十六台車が。 | example: 車が十六台あります。 / exampleKana: くるまがじゅうろくだいあります。 / exampleMeaning: 有十六台車。 |
| 778 | 十七台 | じゅうななだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十七台車があります。 / exampleKana: じゅうななだい車があります。 / exampleMeaning: 十七台車が。 | example: 車が十七台あります。 / exampleKana: くるまがじゅうななだいあります。 / exampleMeaning: 有十七台車。 |
| 779 | 十八台 | じゅうはちだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十八台車があります。 / exampleKana: じゅうはちだい車があります。 / exampleMeaning: 十八台車が。 | example: 車が十八台あります。 / exampleKana: くるまがじゅうはちだいあります。 / exampleMeaning: 有十八台車。 |
| 780 | 十九台 | じゅうきゅうだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十九台車があります。 / exampleKana: じゅうきゅうだい車があります。 / exampleMeaning: 十九台車が。 | example: 車が十九台あります。 / exampleKana: くるまがじゅうきゅうだいあります。 / exampleMeaning: 有十九台車。 |
| 781 | 二十台 | にじゅうだい | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 二十台車があります。 / exampleKana: にじゅうだい車があります。 / exampleMeaning: 二十台車が。 | example: 車が二十台あります。 / exampleKana: くるまがにじゅうだいあります。 / exampleMeaning: 有二十台車。 |
| 782 | 一匹 | いっぴき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 一匹犬がいます。 / exampleKana: いっぴき犬がいます。 / exampleMeaning: 一隻犬が。 | example: 犬が一匹います。 / exampleKana: いぬがいっぴきいます。 / exampleMeaning: 有一隻狗。 |
| 783 | 二匹 | にひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 二匹犬がいます。 / exampleKana: にひき犬がいます。 / exampleMeaning: 二隻（小動物）犬が。 | example: 犬が二匹います。 / exampleKana: いぬがにひきいます。 / exampleMeaning: 有兩隻狗。 |
| 784 | 三匹 | さんびき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 三匹犬がいます。 / exampleKana: さんびき犬がいます。 / exampleMeaning: 三隻犬が。 | example: 犬が三匹います。 / exampleKana: いぬがさんびきいます。 / exampleMeaning: 有三隻狗。 |
| 785 | 四匹 | よんひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 四匹犬がいます。 / exampleKana: よんひき犬がいます。 / exampleMeaning: 四隻（小動物）犬が。 | example: 犬が四匹います。 / exampleKana: いぬがよんひきいます。 / exampleMeaning: 有四隻狗。 |
| 786 | 五匹 | ごひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 五匹犬がいます。 / exampleKana: ごひき犬がいます。 / exampleMeaning: 五隻（小動物）犬が。 | example: 犬が五匹います。 / exampleKana: いぬがごひきいます。 / exampleMeaning: 有五隻狗。 |
| 787 | 六匹 | ろっぴき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 六匹犬がいます。 / exampleKana: ろっぴき犬がいます。 / exampleMeaning: 六隻犬が。 | example: 犬が六匹います。 / exampleKana: いぬがろっぴきいます。 / exampleMeaning: 有六隻狗。 |
| 788 | 七匹 | ななひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 七匹犬がいます。 / exampleKana: ななひき犬がいます。 / exampleMeaning: 七隻（小動物）犬が。 | example: 犬が七匹います。 / exampleKana: いぬがななひきいます。 / exampleMeaning: 有七隻狗。 |
| 789 | 八匹 | はっぴき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 八匹犬がいます。 / exampleKana: はっぴき犬がいます。 / exampleMeaning: 八隻犬が。 | example: 犬が八匹います。 / exampleKana: いぬがはっぴきいます。 / exampleMeaning: 有八隻狗。 |
| 790 | 九匹 | きゅうひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 九匹犬がいます。 / exampleKana: きゅうひき犬がいます。 / exampleMeaning: 九隻（小動物）犬が。 | example: 犬が九匹います。 / exampleKana: いぬがきゅうひきいます。 / exampleMeaning: 有九隻狗。 |
| 791 | 十匹 | じゅっぴき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十匹犬がいます。 / exampleKana: じゅっぴき犬がいます。 / exampleMeaning: 十隻犬が。 | example: 犬が十匹います。 / exampleKana: いぬがじゅっぴきいます。 / exampleMeaning: 有十隻狗。 |
| 792 | 十一匹 | じゅういちひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十一匹犬がいます。 / exampleKana: じゅういちひき犬がいます。 / exampleMeaning: 十一隻（小動物）犬が。 | example: 犬が十一匹います。 / exampleKana: いぬがじゅういちひきいます。 / exampleMeaning: 有十一隻狗。 |
| 793 | 十二匹 | じゅうにひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十二匹犬がいます。 / exampleKana: じゅうにひき犬がいます。 / exampleMeaning: 十二隻（小動物）犬が。 | example: 犬が十二匹います。 / exampleKana: いぬがじゅうにひきいます。 / exampleMeaning: 有十二隻狗。 |
| 794 | 十三匹 | じゅうさんひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十三匹犬がいます。 / exampleKana: じゅうさんひき犬がいます。 / exampleMeaning: 十三隻（小動物）犬が。 | example: 犬が十三匹います。 / exampleKana: いぬがじゅうさんひきいます。 / exampleMeaning: 有十三隻狗。 |
| 795 | 十四匹 | じゅうよんひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十四匹犬がいます。 / exampleKana: じゅうよんひき犬がいます。 / exampleMeaning: 十四隻（小動物）犬が。 | example: 犬が十四匹います。 / exampleKana: いぬがじゅうよんひきいます。 / exampleMeaning: 有十四隻狗。 |
| 796 | 十五匹 | じゅうごひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十五匹犬がいます。 / exampleKana: じゅうごひき犬がいます。 / exampleMeaning: 十五隻（小動物）犬が。 | example: 犬が十五匹います。 / exampleKana: いぬがじゅうごひきいます。 / exampleMeaning: 有十五隻狗。 |
| 797 | 十六匹 | じゅうろくひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十六匹犬がいます。 / exampleKana: じゅうろくひき犬がいます。 / exampleMeaning: 十六隻（小動物）犬が。 | example: 犬が十六匹います。 / exampleKana: いぬがじゅうろくひきいます。 / exampleMeaning: 有十六隻狗。 |
| 798 | 十七匹 | じゅうななひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十七匹犬がいます。 / exampleKana: じゅうななひき犬がいます。 / exampleMeaning: 十七隻（小動物）犬が。 | example: 犬が十七匹います。 / exampleKana: いぬがじゅうななひきいます。 / exampleMeaning: 有十七隻狗。 |
| 799 | 十八匹 | じゅうはちひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十八匹犬がいます。 / exampleKana: じゅうはちひき犬がいます。 / exampleMeaning: 十八隻（小動物）犬が。 | example: 犬が十八匹います。 / exampleKana: いぬがじゅうはちひきいます。 / exampleMeaning: 有十八隻狗。 |
| 800 | 十九匹 | じゅうきゅうひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 十九匹犬がいます。 / exampleKana: じゅうきゅうひき犬がいます。 / exampleMeaning: 十九隻（小動物）犬が。 | example: 犬が十九匹います。 / exampleKana: いぬがじゅうきゅうひきいます。 / exampleMeaning: 有十九隻狗。 |
| 801 | 二十匹 | にじゅうひき | example 語序不自然；exampleKana 含漢字；exampleMeaning 混入日文助詞且未完整翻譯 | example: 二十匹犬がいます。 / exampleKana: にじゅうひき犬がいます。 / exampleMeaning: 二十隻（小動物）犬が。 | example: 犬が二十匹います。 / exampleKana: いぬがにじゅうひきいます。 / exampleMeaning: 有二十隻狗。 |
| 802 | 一回 | いちかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 一回練習します。 / exampleKana: いちかい練習します。 / exampleMeaning: 一次練習します。 | example: 練習を一回します。 / exampleKana: れんしゅうをいちかいします。 / exampleMeaning: 練習一次。 |
| 803 | 二回 | にかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 二回練習します。 / exampleKana: にかい練習します。 / exampleMeaning: 二次練習します。 | example: 練習を二回します。 / exampleKana: れんしゅうをにかいします。 / exampleMeaning: 練習兩次。 |
| 804 | 三回 | さんかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 三回練習します。 / exampleKana: さんかい練習します。 / exampleMeaning: 三次練習します。 | example: 練習を三回します。 / exampleKana: れんしゅうをさんかいします。 / exampleMeaning: 練習三次。 |
| 805 | 四回 | よんかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 四回練習します。 / exampleKana: よんかい練習します。 / exampleMeaning: 四次練習します。 | example: 練習を四回します。 / exampleKana: れんしゅうをよんかいします。 / exampleMeaning: 練習四次。 |
| 806 | 五回 | ごかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 五回練習します。 / exampleKana: ごかい練習します。 / exampleMeaning: 五次練習します。 | example: 練習を五回します。 / exampleKana: れんしゅうをごかいします。 / exampleMeaning: 練習五次。 |
| 807 | 六回 | ろくかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 六回練習します。 / exampleKana: ろくかい練習します。 / exampleMeaning: 六次練習します。 | example: 練習を六回します。 / exampleKana: れんしゅうをろくかいします。 / exampleMeaning: 練習六次。 |
| 808 | 七回 | ななかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 七回練習します。 / exampleKana: ななかい練習します。 / exampleMeaning: 七次練習します。 | example: 練習を七回します。 / exampleKana: れんしゅうをななかいします。 / exampleMeaning: 練習七次。 |
| 809 | 八回 | はちかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 八回練習します。 / exampleKana: はちかい練習します。 / exampleMeaning: 八次練習します。 | example: 練習を八回します。 / exampleKana: れんしゅうをはちかいします。 / exampleMeaning: 練習八次。 |
| 810 | 九回 | きゅうかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 九回練習します。 / exampleKana: きゅうかい練習します。 / exampleMeaning: 九次練習します。 | example: 練習を九回します。 / exampleKana: れんしゅうをきゅうかいします。 / exampleMeaning: 練習九次。 |
| 811 | 十回 | じゅうかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十回練習します。 / exampleKana: じゅうかい練習します。 / exampleMeaning: 十次練習します。 | example: 練習を十回します。 / exampleKana: れんしゅうをじゅうかいします。 / exampleMeaning: 練習十次。 |
| 812 | 十一回 | じゅういちかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十一回練習します。 / exampleKana: じゅういちかい練習します。 / exampleMeaning: 十一次練習します。 | example: 練習を十一回します。 / exampleKana: れんしゅうをじゅういちかいします。 / exampleMeaning: 練習十一次。 |
| 813 | 十二回 | じゅうにかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十二回練習します。 / exampleKana: じゅうにかい練習します。 / exampleMeaning: 十二次練習します。 | example: 練習を十二回します。 / exampleKana: れんしゅうをじゅうにかいします。 / exampleMeaning: 練習十二次。 |
| 814 | 十三回 | じゅうさんかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十三回練習します。 / exampleKana: じゅうさんかい練習します。 / exampleMeaning: 十三次練習します。 | example: 練習を十三回します。 / exampleKana: れんしゅうをじゅうさんかいします。 / exampleMeaning: 練習十三次。 |
| 815 | 十四回 | じゅうよんかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十四回練習します。 / exampleKana: じゅうよんかい練習します。 / exampleMeaning: 十四次練習します。 | example: 練習を十四回します。 / exampleKana: れんしゅうをじゅうよんかいします。 / exampleMeaning: 練習十四次。 |
| 816 | 十五回 | じゅうごかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十五回練習します。 / exampleKana: じゅうごかい練習します。 / exampleMeaning: 十五次練習します。 | example: 練習を十五回します。 / exampleKana: れんしゅうをじゅうごかいします。 / exampleMeaning: 練習十五次。 |
| 817 | 十六回 | じゅうろくかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十六回練習します。 / exampleKana: じゅうろくかい練習します。 / exampleMeaning: 十六次練習します。 | example: 練習を十六回します。 / exampleKana: れんしゅうをじゅうろくかいします。 / exampleMeaning: 練習十六次。 |
| 818 | 十七回 | じゅうななかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十七回練習します。 / exampleKana: じゅうななかい練習します。 / exampleMeaning: 十七次練習します。 | example: 練習を十七回します。 / exampleKana: れんしゅうをじゅうななかいします。 / exampleMeaning: 練習十七次。 |
| 819 | 十八回 | じゅうはちかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十八回練習します。 / exampleKana: じゅうはちかい練習します。 / exampleMeaning: 十八次練習します。 | example: 練習を十八回します。 / exampleKana: れんしゅうをじゅうはちかいします。 / exampleMeaning: 練習十八次。 |
| 820 | 十九回 | じゅうきゅうかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 十九回練習します。 / exampleKana: じゅうきゅうかい練習します。 / exampleMeaning: 十九次練習します。 | example: 練習を十九回します。 / exampleKana: れんしゅうをじゅうきゅうかいします。 / exampleMeaning: 練習十九次。 |
| 821 | 二十回 | にじゅうかい | exampleKana 含漢字；exampleMeaning 混入日文「します」且未完整翻譯 | example: 二十回練習します。 / exampleKana: にじゅうかい練習します。 / exampleMeaning: 二十次練習します。 | example: 練習を二十回します。 / exampleKana: れんしゅうをにじゅうかいします。 / exampleMeaning: 練習二十次。 |
| 822 | 一円 | いちえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 一円払います。 / exampleKana: いちえん払います。 / exampleMeaning: 一日圓払。 | example: 一円払います。 / exampleKana: いちえんはらいます。 / exampleMeaning: 付一日圓。 |
| 823 | 二円 | にえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 二円払います。 / exampleKana: にえん払います。 / exampleMeaning: 二日圓払。 | example: 二円払います。 / exampleKana: にえんはらいます。 / exampleMeaning: 付兩日圓。 |
| 824 | 三円 | さんえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 三円払います。 / exampleKana: さんえん払います。 / exampleMeaning: 三日圓払。 | example: 三円払います。 / exampleKana: さんえんはらいます。 / exampleMeaning: 付三日圓。 |
| 825 | 四円 | よんえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 四円払います。 / exampleKana: よんえん払います。 / exampleMeaning: 四日圓払。 | example: 四円払います。 / exampleKana: よんえんはらいます。 / exampleMeaning: 付四日圓。 |
| 826 | 五円 | ごえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 五円払います。 / exampleKana: ごえん払います。 / exampleMeaning: 五日圓払。 | example: 五円払います。 / exampleKana: ごえんはらいます。 / exampleMeaning: 付五日圓。 |
| 827 | 六円 | ろくえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 六円払います。 / exampleKana: ろくえん払います。 / exampleMeaning: 六日圓払。 | example: 六円払います。 / exampleKana: ろくえんはらいます。 / exampleMeaning: 付六日圓。 |
| 828 | 七円 | ななえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 七円払います。 / exampleKana: ななえん払います。 / exampleMeaning: 七日圓払。 | example: 七円払います。 / exampleKana: ななえんはらいます。 / exampleMeaning: 付七日圓。 |
| 829 | 八円 | はちえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 八円払います。 / exampleKana: はちえん払います。 / exampleMeaning: 八日圓払。 | example: 八円払います。 / exampleKana: はちえんはらいます。 / exampleMeaning: 付八日圓。 |
| 830 | 九円 | きゅうえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 九円払います。 / exampleKana: きゅうえん払います。 / exampleMeaning: 九日圓払。 | example: 九円払います。 / exampleKana: きゅうえんはらいます。 / exampleMeaning: 付九日圓。 |
| 831 | 十円 | じゅうえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十円払います。 / exampleKana: じゅうえん払います。 / exampleMeaning: 十日圓払。 | example: 十円払います。 / exampleKana: じゅうえんはらいます。 / exampleMeaning: 付十日圓。 |
| 832 | 十一円 | じゅういちえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十一円払います。 / exampleKana: じゅういちえん払います。 / exampleMeaning: 十一日圓払。 | example: 十一円払います。 / exampleKana: じゅういちえんはらいます。 / exampleMeaning: 付十一日圓。 |
| 833 | 十二円 | じゅうにえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十二円払います。 / exampleKana: じゅうにえん払います。 / exampleMeaning: 十二日圓払。 | example: 十二円払います。 / exampleKana: じゅうにえんはらいます。 / exampleMeaning: 付十二日圓。 |
| 834 | 十三円 | じゅうさんえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十三円払います。 / exampleKana: じゅうさんえん払います。 / exampleMeaning: 十三日圓払。 | example: 十三円払います。 / exampleKana: じゅうさんえんはらいます。 / exampleMeaning: 付十三日圓。 |
| 835 | 十四円 | じゅうよんえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十四円払います。 / exampleKana: じゅうよんえん払います。 / exampleMeaning: 十四日圓払。 | example: 十四円払います。 / exampleKana: じゅうよんえんはらいます。 / exampleMeaning: 付十四日圓。 |
| 836 | 十五円 | じゅうごえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十五円払います。 / exampleKana: じゅうごえん払います。 / exampleMeaning: 十五日圓払。 | example: 十五円払います。 / exampleKana: じゅうごえんはらいます。 / exampleMeaning: 付十五日圓。 |
| 837 | 十六円 | じゅうろくえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十六円払います。 / exampleKana: じゅうろくえん払います。 / exampleMeaning: 十六日圓払。 | example: 十六円払います。 / exampleKana: じゅうろくえんはらいます。 / exampleMeaning: 付十六日圓。 |
| 838 | 十七円 | じゅうななえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十七円払います。 / exampleKana: じゅうななえん払います。 / exampleMeaning: 十七日圓払。 | example: 十七円払います。 / exampleKana: じゅうななえんはらいます。 / exampleMeaning: 付十七日圓。 |
| 839 | 十八円 | じゅうはちえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十八円払います。 / exampleKana: じゅうはちえん払います。 / exampleMeaning: 十八日圓払。 | example: 十八円払います。 / exampleKana: じゅうはちえんはらいます。 / exampleMeaning: 付十八日圓。 |
| 840 | 十九円 | じゅうきゅうえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 十九円払います。 / exampleKana: じゅうきゅうえん払います。 / exampleMeaning: 十九日圓払。 | example: 十九円払います。 / exampleKana: じゅうきゅうえんはらいます。 / exampleMeaning: 付十九日圓。 |
| 841 | 二十円 | にじゅうえん | exampleKana 含漢字；exampleMeaning 使用日文漢字「払」且句子不完整 | example: 二十円払います。 / exampleKana: にじゅうえん払います。 / exampleMeaning: 二十日圓払。 | example: 二十円払います。 / exampleKana: にじゅうえんはらいます。 / exampleMeaning: 付二十日圓。 |
| 842 | 一歳 | いっさい | exampleMeaning 混入日文「です」 | example: 一歳です。 / exampleKana: いっさいです。 / exampleMeaning: 一歲です。 | exampleMeaning: 一歲。 |
| 843 | 二歳 | にさい | exampleMeaning 混入日文「です」 | example: 二歳です。 / exampleKana: にさいです。 / exampleMeaning: 二歲です。 | exampleMeaning: 兩歲。 |
| 844 | 三歳 | さんさい | exampleMeaning 混入日文「です」 | example: 三歳です。 / exampleKana: さんさいです。 / exampleMeaning: 三歲です。 | exampleMeaning: 三歲。 |
| 845 | 四歳 | よんさい | exampleMeaning 混入日文「です」 | example: 四歳です。 / exampleKana: よんさいです。 / exampleMeaning: 四歲です。 | exampleMeaning: 四歲。 |
| 846 | 五歳 | ごさい | exampleMeaning 混入日文「です」 | example: 五歳です。 / exampleKana: ごさいです。 / exampleMeaning: 五歲です。 | exampleMeaning: 五歲。 |
| 847 | 六歳 | ろくさい | exampleMeaning 混入日文「です」 | example: 六歳です。 / exampleKana: ろくさいです。 / exampleMeaning: 六歲です。 | exampleMeaning: 六歲。 |
| 848 | 七歳 | ななさい | exampleMeaning 混入日文「です」 | example: 七歳です。 / exampleKana: ななさいです。 / exampleMeaning: 七歲です。 | exampleMeaning: 七歲。 |
| 849 | 八歳 | はっさい | exampleMeaning 混入日文「です」 | example: 八歳です。 / exampleKana: はっさいです。 / exampleMeaning: 八歲です。 | exampleMeaning: 八歲。 |
| 850 | 九歳 | きゅうさい | exampleMeaning 混入日文「です」 | example: 九歳です。 / exampleKana: きゅうさいです。 / exampleMeaning: 九歲です。 | exampleMeaning: 九歲。 |
| 851 | 十歳 | じゅっさい | exampleMeaning 混入日文「です」 | example: 十歳です。 / exampleKana: じゅっさいです。 / exampleMeaning: 十歲です。 | exampleMeaning: 十歲。 |
| 852 | 十一歳 | じゅういちさい | exampleMeaning 混入日文「です」 | example: 十一歳です。 / exampleKana: じゅういちさいです。 / exampleMeaning: 十一歲です。 | exampleMeaning: 十一歲。 |
| 853 | 十二歳 | じゅうにさい | exampleMeaning 混入日文「です」 | example: 十二歳です。 / exampleKana: じゅうにさいです。 / exampleMeaning: 十二歲です。 | exampleMeaning: 十兩歲。 |
| 854 | 十三歳 | じゅうさんさい | exampleMeaning 混入日文「です」 | example: 十三歳です。 / exampleKana: じゅうさんさいです。 / exampleMeaning: 十三歲です。 | exampleMeaning: 十三歲。 |
| 855 | 十四歳 | じゅうよんさい | exampleMeaning 混入日文「です」 | example: 十四歳です。 / exampleKana: じゅうよんさいです。 / exampleMeaning: 十四歲です。 | exampleMeaning: 十四歲。 |
| 856 | 十五歳 | じゅうごさい | exampleMeaning 混入日文「です」 | example: 十五歳です。 / exampleKana: じゅうごさいです。 / exampleMeaning: 十五歲です。 | exampleMeaning: 十五歲。 |
| 857 | 十六歳 | じゅうろくさい | exampleMeaning 混入日文「です」 | example: 十六歳です。 / exampleKana: じゅうろくさいです。 / exampleMeaning: 十六歲です。 | exampleMeaning: 十六歲。 |
| 858 | 十七歳 | じゅうななさい | exampleMeaning 混入日文「です」 | example: 十七歳です。 / exampleKana: じゅうななさいです。 / exampleMeaning: 十七歲です。 | exampleMeaning: 十七歲。 |
| 859 | 十八歳 | じゅうはちさい | exampleMeaning 混入日文「です」 | example: 十八歳です。 / exampleKana: じゅうはちさいです。 / exampleMeaning: 十八歲です。 | exampleMeaning: 十八歲。 |
| 860 | 十九歳 | じゅうきゅうさい | exampleMeaning 混入日文「です」 | example: 十九歳です。 / exampleKana: じゅうきゅうさいです。 / exampleMeaning: 十九歲です。 | exampleMeaning: 十九歲。 |
| 861 | 二十歳 | はたち | exampleMeaning 混入日文「です」 | example: 二十歳です。 / exampleKana: はたちです。 / exampleMeaning: 二十歲です。 | exampleMeaning: 二十歲。 |
| 862 | 一階 | いっかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 一階にあります。 / exampleKana: いっかいにあります。 / exampleMeaning: 一樓に。 | exampleMeaning: 在一樓。 |
| 863 | 二階 | にかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 二階にあります。 / exampleKana: にかいにあります。 / exampleMeaning: 二樓に。 | exampleMeaning: 在二樓。 |
| 864 | 三階 | さんがい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 三階にあります。 / exampleKana: さんがいにあります。 / exampleMeaning: 三樓に。 | exampleMeaning: 在三樓。 |
| 865 | 四階 | よんかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 四階にあります。 / exampleKana: よんかいにあります。 / exampleMeaning: 四樓に。 | exampleMeaning: 在四樓。 |
| 866 | 五階 | ごかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 五階にあります。 / exampleKana: ごかいにあります。 / exampleMeaning: 五樓に。 | exampleMeaning: 在五樓。 |
| 867 | 六階 | ろっかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 六階にあります。 / exampleKana: ろっかいにあります。 / exampleMeaning: 六樓に。 | exampleMeaning: 在六樓。 |
| 868 | 七階 | ななかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 七階にあります。 / exampleKana: ななかいにあります。 / exampleMeaning: 七樓に。 | exampleMeaning: 在七樓。 |
| 869 | 八階 | はっかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 八階にあります。 / exampleKana: はっかいにあります。 / exampleMeaning: 八樓に。 | exampleMeaning: 在八樓。 |
| 870 | 九階 | きゅうかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 九階にあります。 / exampleKana: きゅうかいにあります。 / exampleMeaning: 九樓に。 | exampleMeaning: 在九樓。 |
| 871 | 十階 | じゅっかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十階にあります。 / exampleKana: じゅっかいにあります。 / exampleMeaning: 十樓に。 | exampleMeaning: 在十樓。 |
| 872 | 十一階 | じゅういちかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十一階にあります。 / exampleKana: じゅういちかいにあります。 / exampleMeaning: 十一樓に。 | exampleMeaning: 在十一樓。 |
| 873 | 十二階 | じゅうにかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十二階にあります。 / exampleKana: じゅうにかいにあります。 / exampleMeaning: 十二樓に。 | exampleMeaning: 在十二樓。 |
| 874 | 十三階 | じゅうさんかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十三階にあります。 / exampleKana: じゅうさんかいにあります。 / exampleMeaning: 十三樓に。 | exampleMeaning: 在十三樓。 |
| 875 | 十四階 | じゅうよんかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十四階にあります。 / exampleKana: じゅうよんかいにあります。 / exampleMeaning: 十四樓に。 | exampleMeaning: 在十四樓。 |
| 876 | 十五階 | じゅうごかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十五階にあります。 / exampleKana: じゅうごかいにあります。 / exampleMeaning: 十五樓に。 | exampleMeaning: 在十五樓。 |
| 877 | 十六階 | じゅうろくかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十六階にあります。 / exampleKana: じゅうろくかいにあります。 / exampleMeaning: 十六樓に。 | exampleMeaning: 在十六樓。 |
| 878 | 十七階 | じゅうななかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十七階にあります。 / exampleKana: じゅうななかいにあります。 / exampleMeaning: 十七樓に。 | exampleMeaning: 在十七樓。 |
| 879 | 十八階 | じゅうはちかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十八階にあります。 / exampleKana: じゅうはちかいにあります。 / exampleMeaning: 十八樓に。 | exampleMeaning: 在十八樓。 |
| 880 | 十九階 | じゅうきゅうかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 十九階にあります。 / exampleKana: じゅうきゅうかいにあります。 / exampleMeaning: 十九樓に。 | exampleMeaning: 在十九樓。 |
| 881 | 二十階 | にじゅうかい | exampleMeaning 混入日文助詞「に」且句子不完整 | example: 二十階にあります。 / exampleKana: にじゅうかいにあります。 / exampleMeaning: 二十樓に。 | exampleMeaning: 在二十樓。 |
| 882 | 一番 | いちばん | exampleMeaning 混入日文「です」 | example: 一番です。 / exampleKana: いちばんです。 / exampleMeaning: 一號です。 | exampleMeaning: 是一號。 |
| 883 | 二番 | にばん | exampleMeaning 混入日文「です」 | example: 二番です。 / exampleKana: にばんです。 / exampleMeaning: 二號です。 | exampleMeaning: 是二號。 |
| 884 | 三番 | さんばん | exampleMeaning 混入日文「です」 | example: 三番です。 / exampleKana: さんばんです。 / exampleMeaning: 三號です。 | exampleMeaning: 是三號。 |
| 885 | 四番 | よんばん | exampleMeaning 混入日文「です」 | example: 四番です。 / exampleKana: よんばんです。 / exampleMeaning: 四號です。 | exampleMeaning: 是四號。 |
| 886 | 五番 | ごばん | exampleMeaning 混入日文「です」 | example: 五番です。 / exampleKana: ごばんです。 / exampleMeaning: 五號です。 | exampleMeaning: 是五號。 |
| 887 | 六番 | ろくばん | exampleMeaning 混入日文「です」 | example: 六番です。 / exampleKana: ろくばんです。 / exampleMeaning: 六號です。 | exampleMeaning: 是六號。 |
| 888 | 七番 | ななばん | exampleMeaning 混入日文「です」 | example: 七番です。 / exampleKana: ななばんです。 / exampleMeaning: 七號です。 | exampleMeaning: 是七號。 |
| 889 | 八番 | はちばん | exampleMeaning 混入日文「です」 | example: 八番です。 / exampleKana: はちばんです。 / exampleMeaning: 八號です。 | exampleMeaning: 是八號。 |
| 890 | 九番 | きゅうばん | exampleMeaning 混入日文「です」 | example: 九番です。 / exampleKana: きゅうばんです。 / exampleMeaning: 九號です。 | exampleMeaning: 是九號。 |
| 891 | 十番 | じゅうばん | exampleMeaning 混入日文「です」 | example: 十番です。 / exampleKana: じゅうばんです。 / exampleMeaning: 十號です。 | exampleMeaning: 是十號。 |
| 892 | 十一番 | じゅういちばん | exampleMeaning 混入日文「です」 | example: 十一番です。 / exampleKana: じゅういちばんです。 / exampleMeaning: 十一號です。 | exampleMeaning: 是十一號。 |
| 893 | 十二番 | じゅうにばん | exampleMeaning 混入日文「です」 | example: 十二番です。 / exampleKana: じゅうにばんです。 / exampleMeaning: 十二號です。 | exampleMeaning: 是十二號。 |
| 894 | 十三番 | じゅうさんばん | exampleMeaning 混入日文「です」 | example: 十三番です。 / exampleKana: じゅうさんばんです。 / exampleMeaning: 十三號です。 | exampleMeaning: 是十三號。 |
| 895 | 十四番 | じゅうよんばん | exampleMeaning 混入日文「です」 | example: 十四番です。 / exampleKana: じゅうよんばんです。 / exampleMeaning: 十四號です。 | exampleMeaning: 是十四號。 |
| 896 | 十五番 | じゅうごばん | exampleMeaning 混入日文「です」 | example: 十五番です。 / exampleKana: じゅうごばんです。 / exampleMeaning: 十五號です。 | exampleMeaning: 是十五號。 |
| 897 | 十六番 | じゅうろくばん | exampleMeaning 混入日文「です」 | example: 十六番です。 / exampleKana: じゅうろくばんです。 / exampleMeaning: 十六號です。 | exampleMeaning: 是十六號。 |
| 898 | 十七番 | じゅうななばん | exampleMeaning 混入日文「です」 | example: 十七番です。 / exampleKana: じゅうななばんです。 / exampleMeaning: 十七號です。 | exampleMeaning: 是十七號。 |
| 899 | 十八番 | じゅうはちばん | exampleMeaning 混入日文「です」 | example: 十八番です。 / exampleKana: じゅうはちばんです。 / exampleMeaning: 十八號です。 | exampleMeaning: 是十八號。 |
| 900 | 十九番 | じゅうきゅうばん | exampleMeaning 混入日文「です」 | example: 十九番です。 / exampleKana: じゅうきゅうばんです。 / exampleMeaning: 十九號です。 | exampleMeaning: 是十九號。 |
| 901 | 二十番 | にじゅうばん | exampleMeaning 混入日文「です」 | example: 二十番です。 / exampleKana: にじゅうばんです。 / exampleMeaning: 二十號です。 | exampleMeaning: 是二十號。 |
| 902 | 一杯 | いっぱい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 一杯水を飲みます。 / exampleKana: いっぱい水を飲みます。 / exampleMeaning: 一杯水を飲みます。 | example: 水を一杯飲みます。 / exampleKana: みずをいっぱいのみます。 / exampleMeaning: 喝一杯水。 |
| 903 | 二杯 | にはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 二杯水を飲みます。 / exampleKana: にはい水を飲みます。 / exampleMeaning: 二杯水を飲みます。 | example: 水を二杯飲みます。 / exampleKana: みずをにはいのみます。 / exampleMeaning: 喝兩杯水。 |
| 904 | 三杯 | さんばい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 三杯水を飲みます。 / exampleKana: さんばい水を飲みます。 / exampleMeaning: 三杯水を飲みます。 | example: 水を三杯飲みます。 / exampleKana: みずをさんばいのみます。 / exampleMeaning: 喝三杯水。 |
| 905 | 四杯 | よんはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 四杯水を飲みます。 / exampleKana: よんはい水を飲みます。 / exampleMeaning: 四杯水を飲みます。 | example: 水を四杯飲みます。 / exampleKana: みずをよんはいのみます。 / exampleMeaning: 喝四杯水。 |
| 906 | 五杯 | ごはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 五杯水を飲みます。 / exampleKana: ごはい水を飲みます。 / exampleMeaning: 五杯水を飲みます。 | example: 水を五杯飲みます。 / exampleKana: みずをごはいのみます。 / exampleMeaning: 喝五杯水。 |
| 907 | 六杯 | ろっぱい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 六杯水を飲みます。 / exampleKana: ろっぱい水を飲みます。 / exampleMeaning: 六杯水を飲みます。 | example: 水を六杯飲みます。 / exampleKana: みずをろっぱいのみます。 / exampleMeaning: 喝六杯水。 |
| 908 | 七杯 | ななはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 七杯水を飲みます。 / exampleKana: ななはい水を飲みます。 / exampleMeaning: 七杯水を飲みます。 | example: 水を七杯飲みます。 / exampleKana: みずをななはいのみます。 / exampleMeaning: 喝七杯水。 |
| 909 | 八杯 | はっぱい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 八杯水を飲みます。 / exampleKana: はっぱい水を飲みます。 / exampleMeaning: 八杯水を飲みます。 | example: 水を八杯飲みます。 / exampleKana: みずをはっぱいのみます。 / exampleMeaning: 喝八杯水。 |
| 910 | 九杯 | きゅうはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 九杯水を飲みます。 / exampleKana: きゅうはい水を飲みます。 / exampleMeaning: 九杯水を飲みます。 | example: 水を九杯飲みます。 / exampleKana: みずをきゅうはいのみます。 / exampleMeaning: 喝九杯水。 |
| 911 | 十杯 | じゅっぱい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十杯水を飲みます。 / exampleKana: じゅっぱい水を飲みます。 / exampleMeaning: 十杯水を飲みます。 | example: 水を十杯飲みます。 / exampleKana: みずをじゅっぱいのみます。 / exampleMeaning: 喝十杯水。 |
| 912 | 十一杯 | じゅういちはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十一杯水を飲みます。 / exampleKana: じゅういちはい水を飲みます。 / exampleMeaning: 十一杯水を飲みます。 | example: 水を十一杯飲みます。 / exampleKana: みずをじゅういちはいのみます。 / exampleMeaning: 喝十一杯水。 |
| 913 | 十二杯 | じゅうにはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十二杯水を飲みます。 / exampleKana: じゅうにはい水を飲みます。 / exampleMeaning: 十二杯水を飲みます。 | example: 水を十二杯飲みます。 / exampleKana: みずをじゅうにはいのみます。 / exampleMeaning: 喝十二杯水。 |
| 914 | 十三杯 | じゅうさんはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十三杯水を飲みます。 / exampleKana: じゅうさんはい水を飲みます。 / exampleMeaning: 十三杯水を飲みます。 | example: 水を十三杯飲みます。 / exampleKana: みずをじゅうさんはいのみます。 / exampleMeaning: 喝十三杯水。 |
| 915 | 十四杯 | じゅうよんはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十四杯水を飲みます。 / exampleKana: じゅうよんはい水を飲みます。 / exampleMeaning: 十四杯水を飲みます。 | example: 水を十四杯飲みます。 / exampleKana: みずをじゅうよんはいのみます。 / exampleMeaning: 喝十四杯水。 |
| 916 | 十五杯 | じゅうごはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十五杯水を飲みます。 / exampleKana: じゅうごはい水を飲みます。 / exampleMeaning: 十五杯水を飲みます。 | example: 水を十五杯飲みます。 / exampleKana: みずをじゅうごはいのみます。 / exampleMeaning: 喝十五杯水。 |
| 917 | 十六杯 | じゅうろくはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十六杯水を飲みます。 / exampleKana: じゅうろくはい水を飲みます。 / exampleMeaning: 十六杯水を飲みます。 | example: 水を十六杯飲みます。 / exampleKana: みずをじゅうろくはいのみます。 / exampleMeaning: 喝十六杯水。 |
| 918 | 十七杯 | じゅうななはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十七杯水を飲みます。 / exampleKana: じゅうななはい水を飲みます。 / exampleMeaning: 十七杯水を飲みます。 | example: 水を十七杯飲みます。 / exampleKana: みずをじゅうななはいのみます。 / exampleMeaning: 喝十七杯水。 |
| 919 | 十八杯 | じゅうはちはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十八杯水を飲みます。 / exampleKana: じゅうはちはい水を飲みます。 / exampleMeaning: 十八杯水を飲みます。 | example: 水を十八杯飲みます。 / exampleKana: みずをじゅうはちはいのみます。 / exampleMeaning: 喝十八杯水。 |
| 920 | 十九杯 | じゅうきゅうはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 十九杯水を飲みます。 / exampleKana: じゅうきゅうはい水を飲みます。 / exampleMeaning: 十九杯水を飲みます。 | example: 水を十九杯飲みます。 / exampleKana: みずをじゅうきゅうはいのみます。 / exampleMeaning: 喝十九杯水。 |
| 921 | 二十杯 | にじゅうはい | exampleKana 含漢字；exampleMeaning 混入日文漢字/假名且未完整翻譯 | example: 二十杯水を飲みます。 / exampleKana: にじゅうはい水を飲みます。 / exampleMeaning: 二十杯水を飲みます。 | example: 水を二十杯飲みます。 / exampleKana: みずをにじゅうはいのみます。 / exampleMeaning: 喝二十杯水。 |
| 922 | 春 | はる | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 春があります。 / exampleKana: はるがあります。 / exampleMeaning: 有春天。 | example: 春に花が咲きます。 / exampleMeaning: 春天花會開。 |
| 923 | 夏 | なつ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 夏があります。 / exampleKana: なつがあります。 / exampleMeaning: 有夏天。 | example: 夏は暑いです。 / exampleMeaning: 夏天很熱。 |
| 924 | 秋 | あき | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 秋があります。 / exampleKana: あきがあります。 / exampleMeaning: 有秋天。 | example: 秋は涼しいです。 / exampleMeaning: 秋天很涼爽。 |
| 925 | 冬 | ふゆ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 冬があります。 / exampleKana: ふゆがあります。 / exampleMeaning: 有冬天。 | example: 冬は寒いです。 / exampleMeaning: 冬天很冷。 |
| 926 | 誕生日 | たんじょうび | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 誕生日があります。 / exampleKana: たんじょうびがあります。 / exampleMeaning: 有生日。 | example: 今日は誕生日です。 / exampleMeaning: 今天是生日。 |
| 927 | 時間 | じかん | exampleMeaning 與 example 不完全對應 | example: 時間があります。 / exampleKana: じかんがあります。 / exampleMeaning: 有時間。 | example: 時間があります。 / exampleMeaning: 有時間。 |
| 928 | 半 | はん | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 半があります。 / exampleKana: はんがあります。 / exampleMeaning: 有半。 | example: 七時半です。 / exampleMeaning: 七點半。 |
| 929 | 今 | いま | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 今があります。 / exampleKana: いまがあります。 / exampleMeaning: 有現在。 | example: 今、勉強しています。 / exampleMeaning: 現在正在讀書。 |
| 930 | 先 | さき | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 先があります。 / exampleKana: さきがあります。 / exampleMeaning: 有前方。 | example: この先に駅があります。 / exampleMeaning: 前方有車站。 |
| 931 | 次 | つぎ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 次があります。 / exampleKana: つぎがあります。 / exampleMeaning: 有下一個。 | example: 次は誰ですか。 / exampleMeaning: 下一位是誰？ |
| 932 | 最後 | さいご | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 最後があります。 / exampleKana: さいごがあります。 / exampleMeaning: 有最後。 | example: これが最後です。 / exampleMeaning: 這是最後。 |
| 933 | 最初 | さいしょ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 最初があります。 / exampleKana: さいしょがあります。 / exampleMeaning: 有最初。 | example: 最初に名前を書きます。 / exampleMeaning: 一開始先寫名字。 |
| 934 | 全部 | ぜんぶ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 全部があります。 / exampleKana: ぜんぶがあります。 / exampleMeaning: 有全部。 | example: 全部食べました。 / exampleMeaning: 全部吃完了。 |
| 935 | 半分 | はんぶん | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 半分があります。 / exampleKana: はんぶんがあります。 / exampleMeaning: 有一半。 | example: 半分食べました。 / exampleMeaning: 吃了一半。 |
| 946 | 大勢 | おおぜい | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 大勢があります。 / exampleKana: おおぜいがあります。 / exampleMeaning: 有許多人。 | example: 大勢の人がいます。 / exampleMeaning: 有很多人。 |
| 947 | 皆 | みんな | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 皆があります。 / exampleKana: みんながあります。 / exampleMeaning: 有大家。 | example: 皆で行きましょう。 / exampleMeaning: 大家一起去吧。 |
| 948 | 自分 | じぶん | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 自分があります。 / exampleKana: じぶんがあります。 / exampleMeaning: 有自己。 | example: 自分で作りました。 / exampleMeaning: 自己做的。 |
| 949 | 同じ | おなじ | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは同じです。 / exampleKana: これはおなじです。 / exampleMeaning: 這個很相同。 | example: これはあれと同じです。 / exampleMeaning: 這個和那個一樣。 |
| 951 | 本当 | ほんとう | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは本当です。 / exampleKana: これはほんとうです。 / exampleMeaning: 這個很真的。 | example: これは本当です。 / exampleMeaning: 這是真的。 |
| 952 | 嘘 | うそ | example 使用「あります」不自然或不合語義；exampleMeaning 也偏直譯 | example: 嘘があります。 / exampleKana: うそがあります。 / exampleMeaning: 有謊言。 | example: 嘘をつきました。 / exampleMeaning: 說了謊。 |
| 954 | 痛い | いたい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは痛いです。 / exampleKana: これはいたいです。 / exampleMeaning: 這個很痛。 | example: 頭が痛いです。 / exampleMeaning: 頭痛。 |
| 955 | 眠い | ねむい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは眠いです。 / exampleKana: これはねむいです。 / exampleMeaning: 這個很想睡。 | example: 私は眠いです。 / exampleMeaning: 我想睡。 |
| 958 | 強い | つよい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは強いです。 / exampleKana: これはつよいです。 / exampleMeaning: 這個很強。 | example: 風が強いです。 / exampleMeaning: 風很強。 |
| 959 | 弱い | よわい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは弱いです。 / exampleKana: これはよわいです。 / exampleMeaning: 這個很弱。 | example: 体が弱いです。 / exampleMeaning: 身體虛弱。 |
| 960 | 広い | ひろい | exampleMeaning 與 example 不完全對應 | example: 広い部屋です。 / exampleKana: ひろいへやです。 / exampleMeaning: 這個很寬廣。 | exampleMeaning: 房間很寬敞。 |
| 961 | 狭い | せまい | exampleMeaning 與 example 不完全對應 | example: 狭い部屋です。 / exampleKana: せまいへやです。 / exampleMeaning: 這個很狹窄。 | exampleMeaning: 房間很狹窄。 |
| 964 | 早い | はやい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは早いです。 / exampleKana: これははやいです。 / exampleMeaning: 這個很早的；快。 | example: 朝が早いです。 / exampleMeaning: 早上很早。 |
| 966 | 遅い | おそい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは遅いです。 / exampleKana: これはおそいです。 / exampleMeaning: 這個很慢的；晚。 | example: バスが遅いです。 / exampleMeaning: 公車很慢。 |
| 967 | 多い | おおい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは多いです。 / exampleKana: これはおおいです。 / exampleMeaning: 這個很多。 | example: 人が多いです。 / exampleMeaning: 人很多。 |
| 968 | 少ない | すくない | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは少ないです。 / exampleKana: これはすくないです。 / exampleMeaning: 這個很少。 | example: 人が少ないです。 / exampleMeaning: 人很少。 |
| 970 | 悪い | わるい | example 主語/搭配不自然；exampleMeaning 不夠自然或不精確 | example: これは悪いです。 / exampleKana: これはわるいです。 / exampleMeaning: 這個很壞。 | example: 天気が悪いです。 / exampleMeaning: 天氣不好。 |


## N4 第 1 批 300 個單字新增紀錄

- 新增範圍：id 1001–1300，共 300 筆 JLPT N4 常見單字。
- `level` 欄位：新增資料皆設定為 `"N4"`，既有 id 1–1000 的 N5 資料內容未修改。
- 欄位完整性：每筆新增資料皆包含 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 詞性分類：新增資料使用網站既有分類為主，包含「名詞」「動詞」「い形容詞」「な形容詞」「副詞」「數量詞」。
- 例句規則：新增例句以自然、簡單、適合 N4 程度的日文為主；`exampleKana` 已確認為完整假名且不含漢字；`exampleMeaning` 使用繁體中文。
- 重複檢查：已確認新增單字未與既有 `vocabulary.json` 的 `word` 重複，新增後全檔 `word` 也沒有重複。
- 結構檢查：已確認新增後 `vocabulary.json` 是合法 JSON，總筆數為 1300 筆，id 由 1 到 1300 連續且不重複，所有必要欄位皆存在且無空白欄位。

## 重複例句模板改善紀錄

- 改善日期：2026-06-03。
- 本次僅修改 `vocabulary.json` 中的 `example`、`exampleKana`、`exampleMeaning` 三個欄位；未修改 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`，也未修改 `index.html`、`style.css`、`script.js`。
- 優先改善 `partOfSpeech` 為「數詞」與「數量詞」的 380 筆例句，將大量重複的「數字を書きます。」、「学生が○人います。」、「りんごを○個買います。」、「水を○杯飲みます。」等模板，改成較自然且多樣的 N5/N4 生活情境。
- 數詞類改善範圍包含 id 421–539：加入電話號碼、數數、答案、號碼、公車號碼、考試分數、座位號碼、筆記、選項與題號等情境，避免 0–99 幾乎全部使用「書きます」模板；百、千、萬等數詞則加入價格、郵票、距離、存錢筒與人數等情境。
- 數量詞類改善範圍包含 id 662–921、1075：
  - 人數：電影、教室、旅行、家庭人數、訂位。
  - 個數：蘋果、雞蛋、橘子、點心、球。
  - 本數：鉛筆、雨傘、瓶裝水、樹、電線桿，並修正例句假名中的促音與濁音讀法。
  - 枚數：郵票、照片、紙、盤子、票券。
  - 冊數：書、筆記本、字典、漫畫、課本。
  - 台數：車、電腦、電視、腳踏車、機器。
  - 匹數：狗、貓、魚、蟲、兔子，並修正例句假名中的促音與濁音讀法。
  - 次數：寫漢字、聽歌、去醫院、考試、去日本，並修正「一回、六回、八回、十回、二十回」等例句假名讀法。
  - 日圓：錢包、郵票、點心價格、盒子、找零。
  - 年齡：弟弟、妹妹、孩子、自己過去經驗、鄰居小孩。
  - 樓層：教室、餐廳、電梯、辦公室、約見朋友，並修正例句假名中的樓層讀法。
  - 順序／號碼：個人號碼、公車、座位、朗讀順序、櫃台叫號。
  - 杯數：水、咖啡、茶、果汁、牛奶，並修正例句假名中的促音與濁音讀法。
- 已檢查其他品詞的完全相同例句：目前未發現像數詞與數量詞這樣集中且大量的同模板問題；少量常見 N5 句型重複暫未硬改，避免在低信心下破壞既有語義對應。
- 仍需人工確認項目：本次未新增低信心改寫項目；若後續要進一步提升品質，可再針對非數量詞中少量重複句型進行人工語境化潤飾。
- 本次修正後已重新檢查：`vocabulary.json` 為合法 JSON，總筆數維持 2200 筆，id 仍由 1 到 2200 連續且不重複，`word` 未重複，所有資料皆具備必要欄位且無空白欄位，所有 `exampleKana` 皆不含漢字，`exampleMeaning` 未發現混入日文假名或片假名。

## N4 動詞・形容詞・副詞加強批次紀錄

- 新增範圍：`vocabulary.json` id 2201–2500，共新增 300 筆 JLPT N4 常見單字。
- 詞性分配：
  - 動詞：150 筆
  - い形容詞：60 筆
  - な形容詞：40 筆
  - 副詞：50 筆
- 本次新增資料的 `level` 全部為 `N4`，且未修改既有 N5 或既有 N4 單字內容。
- 本次未修改 `index.html`、`style.css`、`script.js`。

### 檢查結果

- `vocabulary.json` 已確認為合法 JSON。
- 總筆數由 2200 筆增加為 2500 筆，正確增加 300 筆。
- `id` 已確認由 1 到 2500 連續且不重複。
- `word` 已確認全檔不重複。
- 所有資料皆包含 `id`、`level`、`word`、`kana`、`meaning`、`partOfSpeech`、`example`、`exampleKana`、`exampleMeaning`。
- 已確認必要欄位沒有空白值。
- 已確認所有 `exampleKana` 不含漢字。
- 已確認本次新增 300 筆的 `exampleMeaning` 不含日文假名或片假名，避免中文釋義混入日文助詞或奇怪混合句。
- 本次新增 300 筆詞性統計已確認如下：動詞 150 筆、い形容詞 60 筆、な形容詞 40 筆、副詞 50 筆。
