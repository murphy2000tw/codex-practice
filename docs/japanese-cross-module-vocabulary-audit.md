# Batch 11：日文跨模組單字覆蓋率盤點（精簡報告）

## Summary
本報告由 `scripts/audit-japanese-cross-module-vocabulary.js` 產生；僅盤點文法、閱讀、聽力中日文內容詞與 `vocabulary.json` 的覆蓋狀態，未修改正式資料。

## 檢查檔案
- vocabulary.json
- grammar.json
- japaneseReadingQuestions.js
- script.js（JAPANESE_LISTENING_QUESTIONS）

## 方法與限制
採用題庫既有欄位、`vocabulary.json` 最長字串比對、保守動詞／形容詞基本形還原與簡易排除助詞助動詞。未使用外部 API 或大型形態分析器；無法可靠切分者列為 manual-review，因此結果不是百分之百形態分析。

## 各模組資料數量
- 文法項目數：290
- 文法題目數：130
- 閱讀文章數：105
- 閱讀問題數：150
- 聽力題目數：100

## 各模組獨立基本形數量
- 文法：3919
- 閱讀：2257
- 聽力：850

## 跨模組去重後基本形總數
6687

## Exact／Normalized／Review-adjusted coverage
| 模組 | Exact | Normalized | Review-adjusted |
|---|---:|---:|---:|
| grammar | 1162/7697 (15.1%) | 1222/7697 (15.9%) | 1470/7157 (20.5%) |
| reading | 3244/8367 (38.8%) | 3247/8367 (38.8%) | 4487/8229 (54.5%) |
| listening | 192/1327 (14.5%) | 195/1327 (14.7%) | 227/1307 (17.4%) |
| overall | 4598/17391 (26.4%) | 4664/17391 (26.8%) | 6184/16693 (37.0%) |

## Missing candidates
去重後 missing-candidate 基本形數量：857；下表列前 120 項。

| 建議基本形 | 假名 | 詞性 | 中文意思 | JLPT 程度 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 信心 | 備註 |
|---|---|---|---|---|---|---:|---|---|---|---|
| 重點詞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 535 | jp-reading-set-n4-001, jp-reading-set-n4-002, jp-reading-set-n4-003 | 重點詞 | 低 | 保守斷詞候選 |
| 名詞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 97 | n5-grammar-001, n5-grammar-002, n5-grammar-003 | 名詞 + は + 說明 | 低 | 保守斷詞候選 |
| 文章に | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 30 | jp-reading-set-n4-096, jp-reading-set-n4-097, jp-reading-set-n4-098 | 文章に「来週」にあたる内容があります。 | 低 | 保守斷詞候選 |
| ですか | ですか | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 27 | n5-grammar-217, n5-grammar-218, n5-grammar-219 | どこ + 助詞／ですか | 低 | 保守斷詞候選 |
| 助詞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 24 | n5-grammar-001, n5-grammar-002, n5-grammar-003 | 助詞 | 低 | 保守斷詞候選 |
| ながら | ながら | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 23 | n4-grammar-055, n4-grammar-110, n4-grammar-198 | 〜ながら | 低 | 保守斷詞候選 |
| ので | ので | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading, listening | 23 | n5-grammar-045, n4-grammar-106, n4-grammar-107 | ので | 低 | 保守斷詞候選 |
| 其他 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 23 | n4-grammar-128, n4-grammar-129, n4-grammar-130 | 其他 | 低 | 保守斷詞候選 |
| ほど | ほど | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 19 | n4-grammar-089, n4-grammar-117, n4-grammar-118 | 〜ば〜ほど | 低 | 保守斷詞候選 |
| 表現 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 19 | n4-grammar-110, n4-grammar-111, n4-grammar-112 | 時間表現 | 低 | 保守斷詞候選 |
| 樣態 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 19 | n4-grammar-075, n4-grammar-076, n4-grammar-077 | 推量・樣態 | 低 | 保守斷詞候選 |
| 許可 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 18 | n4-grammar-059, n4-grammar-060, n4-grammar-061 | 義務・許可 | 低 | 保守斷詞候選 |
| 授受 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 17 | n4-grammar-091, n4-grammar-092, n4-grammar-093 | 授受 | 低 | 保守斷詞候選 |
| 推量 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 17 | n4-grammar-075, n4-grammar-076, n4-grammar-077 | 推量・樣態 | 低 | 保守斷詞候選 |
| 程度 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 17 | n4-grammar-116, n4-grammar-117, n4-grammar-118 | 比較・程度 | 低 | 保守斷詞候選 |
| 動詞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 17 | n5-grammar-002, n5-grammar-004, n5-grammar-008 | 名詞 + が + 動詞／形容詞 | 低 | 保守斷詞候選 |
| 比較 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 17 | n5-grammar-047, n5-grammar-048, n4-grammar-116 | 比較 | 低 | 保守斷詞候選 |
| ない形 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 16 | n5-grammar-032, n4-grammar-068, n4-grammar-086 | ない形 | 低 | 保守斷詞候選 |
| 條件 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 16 | n4-grammar-083, n4-grammar-084, n4-grammar-085 | 條件 | 低 | 保守斷詞候選 |
| 希望 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 15 | n4-grammar-070, n4-grammar-071, n4-grammar-072 | 希望 | 低 | 保守斷詞候選 |
| そうだ | そうだ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 14 | n4-grammar-075, n4-grammar-076, n4-grammar-077 | 〜そうだ（樣態） | 低 | 保守斷詞候選 |
| ため | ため | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 14 | n4-grammar-106, n4-grammar-248, n4-grammar-249 | 〜ため（原因） | 低 | 保守斷詞候選 |
| 検索 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 14 | jp-reading-set-n4-026, jp-reading-set-n4-027, jp-reading-set-n4-028 | 情報検索 | 低 | 保守斷詞候選 |
| ために | ために | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 13 | n4-grammar-104, n4-grammar-105, n4-grammar-106 | 〜ために | 低 | 保守斷詞候選 |
| ように | ように | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 13 | n4-grammar-104, n4-grammar-105, n4-grammar-181 | 〜ように：常用於能力、狀態或前後主語不同的目的。 | 低 | 保守斷詞候選 |
| 地點 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 13 | n5-grammar-005, n5-grammar-006, n5-grammar-007 | 地點 + に + 行きます／来ます／帰ります | 低 | 保守斷詞候選 |
| 並列 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 13 | n5-grammar-009, n4-grammar-098, n4-grammar-099 | と（並列） | 低 | 保守斷詞候選 |
| の朝 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 12 | jp-reading-set-n4-023, jp-reading-set-n4-039, jp-reading-set-n4-058 | 日曜日の朝、町内で公園の掃除があります。参加する人は軍手を持って、八時五十分までに公園の入口に集まります。雨が強いときは中止ですが、小雨なら行います。終わったあ | 低 | 保守斷詞候選 |
| メモ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 12 | jp-reading-set-n4-010, jp-reading-set-n4-013, jp-reading-set-n4-024 | 伝言メモ | 低 | 保守斷詞候選 |
| 形容詞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 12 | n5-grammar-002, n5-grammar-023, n5-grammar-024 | 名詞 + が + 動詞／形容詞 | 低 | 保守斷詞候選 |
| 前に | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 12 | n4-grammar-111, n4-grammar-188, jp-reading-set-n4-007 | 〜前に | 低 | 保守斷詞候選 |
| 例示 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 12 | n4-grammar-098, n4-grammar-099, n4-grammar-100 | 並列・例示 | 低 | 保守斷詞候選 |
| 傳聞 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 12 | n4-grammar-076, n4-grammar-079, n4-grammar-201 | 〜そうだ（傳聞） | 低 | 保守斷詞候選 |
| 經驗 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 12 | n5-grammar-043, n5-grammar-044, n4-grammar-066 | 經驗／完成 | 低 | 保守斷詞候選 |
| ごろ | ごろ | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 11 | n5-grammar-228, n5-grammar-229, jp-reading-set-n4-059 | 〜ごろ | 低 | 保守斷詞候選 |
| では | では | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 11 | n4-grammar-141, jp-reading-set-n4-028, jp-reading-set-n4-060 | 「では」口語常變成「じゃ」。 | 低 | 保守斷詞候選 |
| 能力 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 11 | n4-grammar-121, n4-grammar-122, n4-grammar-123 | 可能・能力 | 低 | 保守斷詞候選 |
| ばかり | ばかり | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 10 | n4-grammar-069, n4-grammar-252, n4-grammar-255 | 動詞た形 + ばかり | 低 | 保守斷詞候選 |
| 禁止 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 10 | n4-grammar-065, n4-grammar-125, n4-grammar-126 | 不可以……；禁止……。 | 低 | 保守斷詞候選 |
| 表示 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 10 | n5-grammar-005, n5-grammar-009, n5-grammar-011 | 移動的目的地或到達點可用「に」表示。 | 低 | 保守斷詞候選 |
| ている | ている | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n4-grammar-052, n4-grammar-057, n4-grammar-244 | 〜ている：只表示狀態；〜てある強調有人事先做了。 | 低 | 保守斷詞候選 |
| として | として | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n4-grammar-275, n4-grammar-277, n4-grammar-278 | として | 低 | 保守斷詞候選 |
| はずだ | はずだ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n4-grammar-082, n4-grammar-161, n4-grammar-164 | 〜はずだ | 低 | 保守斷詞候選 |
| 何時 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n5-grammar-219, n5-grammar-224, n5-grammar-225 | 「何時」問幾點；「いつ」問較廣的時間。 | 低 | 保守斷詞候選 |
| 較口語 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n4-grammar-077, n4-grammar-140, n4-grammar-149 | 〜みたいだ：意思相近，較口語。 | 低 | 保守斷詞候選 |
| 常和 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n5-grammar-013, n4-grammar-067, n4-grammar-076 | 常和「まで」一起使用。 | 低 | 保守斷詞候選 |
| 但是 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 9 | n5-grammar-046, n4-grammar-196, n4-grammar-197 | が（但是） | 低 | 保守斷詞候選 |
| こと | こと | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 8 | n4-grammar-144, n4-grammar-210, jp-reading-set-n4-067 | 〜こと | 低 | 保守斷詞候選 |
| たら | たら | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-083, n4-grammar-084, n4-grammar-085 | 〜たら | 低 | 保守斷詞候選 |
| ても | ても | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-087, n4-grammar-167, n4-grammar-199 | 〜ても | 低 | 保守斷詞候選 |
| とか | とか | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-101, n4-grammar-176 | 〜とか〜とか | 低 | 保守斷詞候選 |
| ようだ | ようだ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-075, n4-grammar-077, n4-grammar-078 | 〜ようだ：多根據資訊推測；〜そうだ強調外觀。 | 低 | 保守斷詞候選 |
| 引用 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-201, n4-grammar-202, n4-grammar-203 | 傳聞・引用 | 低 | 保守斷詞候選 |
| 何曜日 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n5-grammar-225, n5-grammar-226 | 何曜日 | 低 | 保守斷詞候選 |
| 較正式 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n5-grammar-026, n4-grammar-060, n4-grammar-078 | 也可說「難しくありませんでした」，較正式。 | 低 | 保守斷詞候選 |
| 逆接 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-196, n4-grammar-197, n4-grammar-198 | 逆接・讓步 | 低 | 保守斷詞候選 |
| 日常 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 8 | jl-001, jl-006, jl-007 | 日常 | 低 | 保守斷詞候選 |
| 命令 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 8 | n4-grammar-125, n4-grammar-126, n4-grammar-127 | 禁止・命令 | 低 | 保守斷詞候選 |
| ずに | ずに | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 7 | n4-grammar-246, n4-grammar-247 | 〜ずに | 低 | 保守斷詞候選 |
| たなか | たなか | 待人工確認 | 待人工確認 | 待人工確認 | reading | 7 | jp-reading-set-n4-018, jp-reading-set-n4-031, jp-reading-set-n4-036 | たなか | 低 | 保守斷詞候選 |
| といい | といい | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 7 | n4-grammar-074, n4-grammar-157, n4-grammar-285 | 〜といい | 低 | 保守斷詞候選 |
| なら | なら | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 7 | n4-grammar-085, n4-grammar-090, n4-grammar-170 | 〜なら | 低 | 保守斷詞候選 |
| 工作 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 7 | jl-008, jl-027, jl-030 | 工作 | 低 | 保守斷詞候選 |
| 餐廳 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 7 | jl-003, jl-020, jl-022 | 餐廳 | 低 | 保守斷詞候選 |
| 請求 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 7 | n5-grammar-040, n5-grammar-041, n4-grammar-073 | 請求 | 低 | 保守斷詞候選 |
| 天氣 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 7 | n5-grammar-025, jl-023, jl-025 | 描述過去的感受、天氣、狀態等。 | 低 | 保守斷詞候選 |
| 必須 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 7 | n4-grammar-059, n4-grammar-060, n4-grammar-061 | 必須……；不得不……。 | 低 | 保守斷詞候選 |
| 讓步 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 7 | n4-grammar-196, n4-grammar-197, n4-grammar-198 | 逆接・讓步 | 低 | 保守斷詞候選 |
| くなる | くなる | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-281, n4-grammar-282, n4-grammar-283 | 〜くなる | 低 | 保守斷詞候選 |
| けど | けど | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-108, n4-grammar-196, n4-grammar-197 | 〜けど：單純轉折；〜のに有不滿或意外。 | 低 | 保守斷詞候選 |
| ていく | ていく | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-242, n4-grammar-243 | 〜ていく | 低 | 保守斷詞候選 |
| という | という | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-201, n4-grammar-205, n4-grammar-274 | という | 低 | 保守斷詞候選 |
| とき | とき | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-110, n4-grammar-169, jp-reading-set-n4-068 | 〜とき | 低 | 保守斷詞候選 |
| ところ | ところ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-131, n4-grammar-132, n4-grammar-133 | 動詞辞書形 + ところ | 低 | 保守斷詞候選 |
| ないで | ないで | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-246, n4-grammar-247 | 「〜ないで」較口語；「〜ずに」較書面。 | 低 | 保守斷詞候選 |
| にくい | にくい | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-123, n4-grammar-124, n4-grammar-280 | 〜にくい：表示難以……，意思相反。 | 低 | 保守斷詞候選 |
| になる | になる | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-282, n4-grammar-284, jp-reading-set-n4-068 | 〜になる | 低 | 保守斷詞候選 |
| のに | のに | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-108, n4-grammar-271 | 〜のに | 低 | 保守斷詞候選 |
| の案内 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-066, jp-reading-set-n4-093, jp-reading-set-n4-104 | 運動センターの案内 | 低 | 保守斷詞候選 |
| の荷物 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-001, jp-reading-set-n4-049, jp-reading-set-n4-078 | 郵便局の荷物 | 低 | 保守斷詞候選 |
| の教室 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-011, jp-reading-set-n4-065, jp-reading-set-n4-097 | 学校の教室 | 低 | 保守斷詞候選 |
| の計画 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-018, jp-reading-set-n4-037, jp-reading-set-n4-096 | 旅行の計画 | 低 | 保守斷詞候選 |
| の午後 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-068, jp-reading-set-n4-071, jp-reading-set-n4-081 | 土曜日の午後 | 低 | 保守斷詞候選 |
| の本 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-040, jp-reading-set-n4-076, jp-reading-set-n4-085 | 図書館の本 | 低 | 保守斷詞候選 |
| の夜 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-022, jp-reading-set-n4-058, jp-reading-set-n4-068 | 金曜日の夜 | 低 | 保守斷詞候選 |
| ほしい | ほしい | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-072, n4-grammar-073, n5-grammar-237 | 〜ほしい | 低 | 保守斷詞候選 |
| ました | ました | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n5-grammar-033, n4-grammar-243 | ました | 低 | 保守斷詞候選 |
| までに | までに | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-189, jp-reading-set-n4-006, jp-reading-set-n4-009 | 〜までに | 低 | 保守斷詞候選 |
| らしい | らしい | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-076, n4-grammar-079, n4-grammar-204 | 〜らしい：也可表示聽說，但常帶有推測語感。 | 低 | 保守斷詞候選 |
| られる | られる | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n4-grammar-122, n4-grammar-146, n4-grammar-147 | 五段動詞變え段 + る／一段動詞去掉る + られる／する→できる／来る→来られる | 低 | 保守斷詞候選 |
| 因為 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 6 | n5-grammar-045, n4-grammar-106, n4-grammar-107 | 放在理由句後面，表示「因為……」。 | 低 | 保守斷詞候選 |
| 購物 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 6 | jl-019, jl-021, jl-035 | 購物 | 低 | 保守斷詞候選 |
| 中村 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-001, jp-reading-set-n4-020, jp-reading-set-n4-100 | 中村 | 低 | 保守斷詞候選 |
| 學校 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 6 | jl-004, jl-013, jl-032 | 學校 | 低 | 保守斷詞候選 |
| すぎる | すぎる | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 5 | n4-grammar-120, jp-reading-set-n4-063, jp-reading-set-n4-064 | 〜すぎる | 低 | 保守斷詞候選 |
| つもり | つもり | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 5 | n4-grammar-248, n4-grammar-249, jp-reading-set-n4-017 | つもり | 低 | 保守斷詞候選 |
| てから | てから | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 5 | n4-grammar-112, n4-grammar-113, n4-grammar-256 | 〜てから：也表示之後，更強調順序。 | 低 | 保守斷詞候選 |
| ないと | ないと | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 5 | n4-grammar-136, n4-grammar-168, n4-grammar-246 | 口語常省略成「〜ないと」。 | 低 | 保守斷詞候選 |
| の予定 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-021, jp-reading-set-n4-068, jp-reading-set-n4-097 | 週末の予定 | 低 | 保守斷詞候選 |
| を書く | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-064, jp-reading-set-n4-086, jp-reading-set-n4-103 | 宿題を書く | 低 | 保守斷詞候選 |
| んです | んです | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 5 | n4-grammar-206, n4-grammar-207 | 〜んです | 低 | 保守斷詞候選 |
| 家庭 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 5 | jl-012, jl-038, jl-053 | 家庭 | 低 | 保守斷詞候選 |
| 句子 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 5 | n5-grammar-018, n5-grammar-045, n5-grammar-046 | 句子 + か | 低 | 保守斷詞候選 |
| 就好了 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 5 | n4-grammar-074, n4-grammar-157, n4-grammar-266 | ……就好了；希望……。 | 低 | 保守斷詞候選 |
| 存在句 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 5 | n5-grammar-002, n5-grammar-019, n5-grammar-020 | 常用在第一次提到的人事物、存在句，或回答「誰、什麼」的問題。 | 低 | 保守斷詞候選 |
| 日記 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-015, jp-reading-set-n4-054, jp-reading-set-n4-058 | 日記 | 低 | 保守斷詞候選 |
| 說明 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 5 | n5-grammar-001, n5-grammar-011, n5-grammar-047 | 名詞 + は + 說明 | 低 | 保守斷詞候選 |
| おう | おう | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-017, jp-reading-set-n4-038, jp-reading-set-n4-078 | おう | 低 | 保守斷詞候選 |
| かける | かける | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-135 | 〜かける | 低 | 保守斷詞候選 |
| きます | きます | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 4 | n4-grammar-099, jl-010, jl-053 | このみせはやすいし、おいしいし、よくきます。 | 低 | 保守斷詞候選 |
| くする | くする | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-283 | 〜くする | 低 | 保守斷詞候選 |
| しゃ | しゃ | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-071, jp-reading-set-n4-081 | はいしゃ | 低 | 保守斷詞候選 |
| せいで | せいで | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-182, n4-grammar-183 | 〜せいで：表示壞結果的原因。 | 低 | 保守斷詞候選 |
| そうに | そうに | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-279, n4-grammar-280, n4-grammar-289 | そうに | 低 | 保守斷詞候選 |
| だろう | だろう | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-081, n4-grammar-162 | 口語普通形常用「だろう」。 | 低 | 保守斷詞候選 |
| てある | てある | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-052, n4-grammar-053, n4-grammar-242 | 〜てある | 低 | 保守斷詞候選 |
| てくる | てくる | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-242, n4-grammar-243 | 「〜てくる」表示朝現在或說話者方向變化。 | 低 | 保守斷詞候選 |
| ですね | ですね | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-274, n4-grammar-285 | つまり、今日は行かなくてもいい＿＿ですね。 | 低 | 保守斷詞候選 |
| と言う | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-201, n4-grammar-205, n4-grammar-289 | 〜と言う | 低 | 保守斷詞候選 |
| と思う | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 4 | n4-grammar-070, n4-grammar-202, n4-grammar-272 | 動詞意向形 + と思う | 低 | 保守斷詞候選 |

## Manual review
manual-review 去重項目數：86；下表最多列 200 項。

| 表面形式 | 可能基本形 | 假名 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 需要確認原因 |
|---|---|---|---|---:|---|---|---|
| 比 | 比 | 待人工確認 | grammar | 20 | n5-grammar-017, n5-grammar-047, n5-grammar-050 | 「ではありません」比「じゃありません」正式。 | 需人工確認斷詞或基本形 |
| 在 | 在 | 待人工確認 | grammar | 10 | n5-grammar-044, n4-grammar-111, n4-grammar-112 | 在 N5 常用來表示某動作尚未完成。 | 需人工確認斷詞或基本形 |
| し | し | し | grammar, reading | 9 | n4-grammar-099, n4-grammar-178, jp-reading-set-n4-043 | 〜し〜し | 需人工確認斷詞或基本形 |
| 是 | 是 | 待人工確認 | grammar | 9 | n5-grammar-029, n5-grammar-034, n5-grammar-039 | 「でした」是「です」的過去形。 | 需人工確認斷詞或基本形 |
| 不 | 不 | 待人工確認 | grammar | 9 | n5-grammar-024, n5-grammar-028, n4-grammar-061 | 用來禮貌地說「不……」。 | 需人工確認斷詞或基本形 |
| 也 | 也 | 待人工確認 | grammar | 9 | n5-grammar-011, n4-grammar-087, n4-grammar-088 | 表示「也」。 | 需人工確認斷詞或基本形 |
| く | く | く | grammar, reading | 8 | n4-grammar-281, n4-grammar-282, n4-grammar-283 | く | 需人工確認斷詞或基本形 |
| ば | ば | ば | grammar | 8 | n4-grammar-083, n4-grammar-084, n4-grammar-089 | 〜ば：較強調條件本身；〜たら用途較廣。 | 需人工確認斷詞或基本形 |
| 越 | 越 | 待人工確認 | grammar | 7 | n4-grammar-089, n4-grammar-119, n4-grammar-191 | 越……越……。 | 需人工確認斷詞或基本形 |
| 間 | 間 | 待人工確認 | grammar, reading | 6 | n4-grammar-114, n4-grammar-115, n5-grammar-229 | 〜間 | 需人工確認斷詞或基本形 |
| 和 | 和 | 待人工確認 | grammar | 6 | n5-grammar-002, n5-grammar-009, n5-grammar-015 | 和「は」相比，「が」更容易聚焦在前面的名詞。 | 需人工確認斷詞或基本形 |
| 就 | 就 | 待人工確認 | grammar | 5 | n4-grammar-086, n4-grammar-168, n4-grammar-190 | 一……就……；如果……就必然……。 | 需人工確認斷詞或基本形 |
| い | い | い | grammar | 4 | n5-grammar-023, n5-grammar-024, n5-grammar-025 | い形容詞本身以「い」結尾。 | 需人工確認斷詞或基本形 |
| 王 | 王 | 待人工確認 | reading | 4 | jp-reading-set-n4-017, jp-reading-set-n4-038, jp-reading-set-n4-078 | 王 | 需人工確認斷詞或基本形 |
| 做 | 做 | 待人工確認 | grammar | 4 | n4-grammar-063, n4-grammar-098, n4-grammar-127 | 可以……；做……也沒關係。 | 需人工確認斷詞或基本形 |
| る | る | る | grammar | 3 | n4-grammar-122, n4-grammar-146, n4-grammar-147 | 五段動詞變え段 + る／一段動詞去掉る + られる／する→できる／来る→来られる | 需人工確認斷詞或基本形 |
| ろ | ろ | ろ | grammar, reading | 3 | n4-grammar-126, jp-reading-set-n4-047, jp-reading-set-n4-069 | 五段動詞變え段／一段動詞去掉る + ろ／する→しろ／来る→来い | 需人工確認斷詞或基本形 |
| 或 | 或 | 待人工確認 | grammar | 3 | n5-grammar-019, n5-grammar-020, n5-grammar-043 | 用於說「有某物」或「某物在某處」。 | 需人工確認斷詞或基本形 |
| 時 | 時 | 待人工確認 | grammar | 3 | n5-grammar-222, n4-grammar-254, n4-grammar-276 | 後面接名詞「映画」時，要用「どんな」。 | 需人工確認斷詞或基本形 |
| 乗 | 乗 | 待人工確認 | reading | 3 | jp-reading-set-n4-087 | <ruby>駅<rt>えき</rt></ruby>の<ruby>乗<rt>の</rt></ruby>り<ruby>換<rt>か</rt></ruby>え | 需人工確認斷詞或基本形 |
| 到 | 到 | 待人工確認 | grammar | 3 | n4-grammar-119, n4-grammar-191, n5-grammar-227 | 到……程度；越……越……。 | 需人工確認斷詞或基本形 |
| 能 | 能 | 待人工確認 | grammar | 3 | n4-grammar-122, n4-grammar-146, n4-grammar-147 | 能……；會……。 | 需人工確認斷詞或基本形 |
| 別 | 別 | 待人工確認 | reading | 3 | jp-reading-set-n4-035, jp-reading-set-n4-052 | 別 | 需人工確認斷詞或基本形 |
| 要 | 要 | 待人工確認 | grammar | 3 | n4-grammar-144, n4-grammar-289, n4-grammar-290 | 要……；必須……。 | 需人工確認斷詞或基本形 |
| 會 | 會 | 待人工確認 | grammar | 3 | n4-grammar-122, n4-grammar-146, n4-grammar-147 | 能……；會……。 | 需人工確認斷詞或基本形 |
| 卻 | 卻 | 待人工確認 | grammar | 3 | n4-grammar-108, n4-grammar-198, n4-grammar-271 | 明明……卻……。 | 需人工確認斷詞或基本形 |
| 吧 | 吧 | 待人工確認 | grammar | 3 | n5-grammar-035, n4-grammar-081, n4-grammar-162 | 常譯為「一起……吧」。 | 需人工確認斷詞或基本形 |
| 說 | 說 | 待人工確認 | grammar | 3 | n4-grammar-201, n4-grammar-204, n4-grammar-272 | 說……。 | 需人工確認斷詞或基本形 |
| こ | こ | こ | grammar, reading | 2 | n4-grammar-287, jp-reading-set-n4-043 | こ＿＿、れんらくしてください。 | 需人工確認斷詞或基本形 |
| り | り | り | grammar, reading | 2 | n4-grammar-098, jp-reading-set-n4-087 | 動詞た形 + り、動詞た形 + りする | 需人工確認斷詞或基本形 |
| わ | わ | わ | grammar, reading | 2 | n5-grammar-001, jp-reading-set-n4-043 | 用來提出句子的主題，常譯為「至於……」。讀音為「わ」。 | 需人工確認斷詞或基本形 |
| 過 | 過 | 待人工確認 | grammar | 2 | n4-grammar-066, n4-grammar-067 | 曾經……過。 | 需人工確認斷詞或基本形 |
| 既 | 既 | 待人工確認 | grammar | 2 | n4-grammar-178, n4-grammar-179 | 既……也……。 | 需人工確認斷詞或基本形 |
| 後 | 後 | 待人工確認 | grammar | 2 | n5-grammar-046, n5-grammar-233 | 禮貌句中常直接接在「です、ます」後。 | 需人工確認斷詞或基本形 |
| 好 | 好 | 待人工確認 | grammar | 2 | n4-grammar-052, n4-grammar-123 | 已經……好；表示某事被事先處理好。 | 需人工確認斷詞或基本形 |
| 更 | 更 | 待人工確認 | grammar | 2 | n5-grammar-048, n5-grammar-240 | 「AのほうがBより」表示比起B，A更……。 | 需人工確認斷詞或基本形 |
| 生 | 生 | 待人工確認 | grammar | 2 | n4-grammar-282 | 弟は来年、大学生＿＿なります。 | 需人工確認斷詞或基本形 |
| 像 | 像 | 待人工確認 | grammar | 2 | n5-grammar-004, n4-grammar-078 | 像「今日、明日、毎日」通常不加「に」。 | 需人工確認斷詞或基本形 |
| 只 | 只 | 待人工確認 | grammar | 2 | n4-grammar-194, n4-grammar-195 | 只有……；只……。 | 需人工確認斷詞或基本形 |
| 但 | 但 | 待人工確認 | grammar | 2 | n4-grammar-104, n4-grammar-254 | 也可表示原因，但 N4 常先學目的用法。 | 需人工確認斷詞或基本形 |
| 的 | 的 | 待人工確認 | grammar | 2 | n5-grammar-012, n4-grammar-276 | 相當於中文的「的」，但用法不完全相同。 | 需人工確認斷詞或基本形 |
| 得 | 得 | 待人工確認 | grammar | 2 | n4-grammar-137, n4-grammar-138 | 得……；必須……。 | 需人工確認斷詞或基本形 |
| 把 | 把 | 待人工確認 | grammar | 2 | n4-grammar-283, n4-grammar-284 | 把……弄成…… | 需人工確認斷詞或基本形 |
| 又 | 又 | 待人工確認 | grammar | 2 | n4-grammar-099 | 又……又……；而且……。 | 需人工確認斷詞或基本形 |
| 有 | 有 | 待人工確認 | grammar | 2 | n5-grammar-050, n4-grammar-151 | 「ときどき」表示頻率，有「有時候」的意思。 | 需人工確認斷詞或基本形 |
| 對 | 對 | 待人工確認 | grammar | 2 | n5-grammar-213, n4-grammar-277 | 向……；對…… | 需人工確認斷詞或基本形 |
| 點 | 點 | 待人工確認 | grammar | 2 | n5-grammar-228 | 大約……點；……左右 | 需人工確認斷詞或基本形 |
| 啦 | 啦 | 待人工確認 | grammar | 2 | n4-grammar-101 | ……啦……啦；例如……。 | 需人工確認斷詞或基本形 |
| 嗎 | 嗎 | 待人工確認 | grammar | 2 | n4-grammar-172, n4-grammar-173 | 可以幫我……嗎？ | 需人工確認斷詞或基本形 |
| お | お | お | grammar | 1 | n5-grammar-003 | 表示動作直接影響的對象。讀音通常為「お」。 | 需人工確認斷詞或基本形 |
| ま | ま | ま | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| ら | ら | ら | grammar | 1 | n4-grammar-083 | 動詞た形／い形容詞かった／な形容詞だった／名詞だった + ら | 需人工確認斷詞或基本形 |
| 加 | 加 | 待人工確認 | grammar | 1 | n4-grammar-281 | い形容詞變化時去掉「い」加「くなる」。 | 需人工確認斷詞或基本形 |
| 我 | 我 | 待人工確認 | grammar | 1 | n5-grammar-001 | 「は」用來提示主題，這裡是在說明「我」是學生。 | 需人工確認斷詞或基本形 |
| 該 | 該 | 待人工確認 | grammar | 1 | n4-grammar-157 | 要是……就好了；該……才好。 | 需人工確認斷詞或基本形 |
| 換 | 換 | 待人工確認 | reading | 1 | jp-reading-set-n4-087 | <ruby>駅<rt>えき</rt></ruby>の<ruby>乗<rt>の</rt></ruby>り<ruby>換<rt>か</rt></ruby>え | 需人工確認斷詞或基本形 |
| 願 | 願 | 待人工確認 | grammar | 1 | n4-grammar-181 | 希望……；願……。 | 需人工確認斷詞或基本形 |
| 機 | 機 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 叫 | 叫 | 待人工確認 | grammar | 1 | n4-grammar-289 | 叫……要…… | 需人工確認斷詞或基本形 |
| 向 | 向 | 待人工確認 | grammar | 1 | n5-grammar-213 | 向……；對…… | 需人工確認斷詞或基本形 |
| 高 | 高 | 待人工確認 | grammar | 1 | n5-grammar-050 | 頻率比「いつも」低，比「あまり」高。 | 需人工確認斷詞或基本形 |
| 剛 | 剛 | 待人工確認 | grammar | 1 | n4-grammar-254 | 即使……也；剛……時 | 需人工確認斷詞或基本形 |
| 混 | 混 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 最 | 最 | 待人工確認 | grammar | 1 | n5-grammar-049 | 「いちばん」表示最高程度，也就是「最」。 | 需人工確認斷詞或基本形 |
| 止 | 止 | 待人工確認 | reading | 1 | jp-reading-set-n4-087 | <ruby>鈴木<rt>すずき</rt></ruby>さんは<ruby>駅<rt>えき</rt></ruby>で<ruby>急行<rt>きゅうこう</rt></ | 需人工確認斷詞或基本形 |
| 而 | 而 | 待人工確認 | grammar | 1 | n4-grammar-247 | 不要……而……；不……就…… | 需人工確認斷詞或基本形 |
| 少 | 少 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 選 | 選 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 太 | 太 | 待人工確認 | grammar | 1 | n4-grammar-120 | 太……；過於……。 | 需人工確認斷詞或基本形 |
| 待 | 待 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 地 | 地 | 待人工確認 | grammar | 1 | n5-grammar-005 | に（目的地） | 需人工確認斷詞或基本形 |
| 著 | 著 | 待人工確認 | grammar | 1 | n4-grammar-244 | 已經……著；處於……狀態 | 需人工確認斷詞或基本形 |
| 低 | 低 | 待人工確認 | grammar | 1 | n5-grammar-050 | 頻率比「いつも」低，比「あまり」高。 | 需人工確認斷詞或基本形 |
| 都 | 都 | 待人工確認 | grammar | 1 | n4-grammar-167 | 不管……或不……都……。 | 需人工確認斷詞或基本形 |
| 等 | 等 | 待人工確認 | grammar | 1 | n5-grammar-015 | 列舉部分例子，表示「……和……等」。 | 需人工確認斷詞或基本形 |
| 如 | 如 | 待人工確認 | grammar | 1 | n4-grammar-244 | 常和自動詞搭配，如「開く、閉まる、消える」。 | 需人工確認斷詞或基本形 |
| 表 | 表 | 待人工確認 | reading | 1 | jp-reading-set-n4-052 | 分別表 | 需人工確認斷詞或基本形 |
| 物 | 物 | 待人工確認 | grammar | 1 | n4-grammar-255 | 甘い物＿＿食べないでください。 | 需人工確認斷詞或基本形 |
| 分 | 分 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 聞 | 聞 | 待人工確認 | reading | 1 | jp-reading-set-n4-043 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | 需人工確認斷詞或基本形 |
| 来 | 来 | 待人工確認 | grammar | 1 | n4-grammar-287 | 来＿＿、連絡してください。 | 需人工確認斷詞或基本形 |
| 從 | 從 | 待人工確認 | grammar | 1 | n5-grammar-227 | 從……到…… | 需人工確認斷詞或基本形 |
| 據 | 據 | 待人工確認 | grammar | 1 | n4-grammar-204 | 根據……；據……說。 | 需人工確認斷詞或基本形 |
| 當 | 當 | 待人工確認 | grammar | 1 | n4-grammar-169 | 當……的時候。 | 需人工確認斷詞或基本形 |
| 讓 | 讓 | 待人工確認 | grammar | 1 | n4-grammar-279 | 讓……容易…… | 需人工確認斷詞或基本形 |
| 呢 | 呢 | 待人工確認 | grammar | 1 | n4-grammar-163 | 不知道是否……；會不會……呢。 | 需人工確認斷詞或基本形 |

## 複合詞與固定表現
- 複合詞總數：5122
- 固定表現抽樣數：100

| 類型 | 項目 | 出現模組 | 出現次數 | 代表來源 ID |
|---|---|---|---:|---|
| 複合詞 | つもりです | grammar, reading, listening | 6 | n4-grammar-248, n4-grammar-257, jp-reading-set-n4-040 |
| 複合詞 | てもいいです | grammar, reading | 32 | n4-grammar-258, jp-reading-set-n4-010, jp-reading-set-n4-011 |
| 複合詞 | てください | grammar, reading | 21 | n5-grammar-040, n5-grammar-041, n4-grammar-073 |
| 複合詞 | てもいい | grammar, reading | 17 | n4-grammar-062, n4-grammar-063, n4-grammar-064 |
| 複合詞 | あります | grammar, listening | 16 | n5-grammar-019, n5-grammar-020, n5-grammar-021 |
| 複合詞 | かもしれない | grammar, reading | 14 | n4-grammar-080, n4-grammar-081, n4-grammar-161 |
| 複合詞 | ことがあります | grammar, reading | 14 | n4-grammar-250, n4-grammar-251, jp-reading-set-n4-012 |
| 複合詞 | ほうがいい | grammar, reading | 13 | n4-grammar-257, n4-grammar-258, jp-reading-set-n4-031 |
| 複合詞 | ことができる | grammar, reading | 11 | n4-grammar-121, n4-grammar-122, n4-grammar-146 |
| 複合詞 | いきます | grammar, listening | 9 | n5-grammar-005, n5-grammar-006, n5-grammar-011 |
| 複合詞 | なければならない | grammar, reading | 9 | n4-grammar-059, n4-grammar-060, n4-grammar-136 |
| 複合詞 | きょうは | reading, listening | 8 | jp-reading-set-n4-080, jl-001, jl-014 |
| 複合詞 | ことができます | grammar, reading | 8 | n4-grammar-250, n4-grammar-251, jp-reading-set-n4-067 |
| 複合詞 | いいですか | reading, listening | 6 | jp-reading-set-n4-043, jl-022, jl-045 |
| 複合詞 | ことになる | grammar, reading | 6 | n4-grammar-128, n4-grammar-129, n4-grammar-250 |
| 複合詞 | てほしい | grammar, reading | 6 | n4-grammar-073, n4-grammar-159, n4-grammar-175 |
| 複合詞 | なければなりません | grammar, reading | 6 | n4-grammar-258, jp-reading-set-n4-007, jp-reading-set-n4-062 |
| 複合詞 | へ行きました | grammar, reading | 6 | n4-grammar-247, jp-reading-set-n4-088, jp-reading-set-n4-099 |
| 複合詞 | へ行きます | grammar, listening | 6 | n5-grammar-006, n5-grammar-008, n5-grammar-039 |
| 複合詞 | たばかり | grammar, reading | 5 | n4-grammar-069, n4-grammar-133, jp-reading-set-n4-098 |
| 複合詞 | てみます | grammar, reading | 5 | n4-grammar-241, n4-grammar-244, n4-grammar-245 |
| 複合詞 | 予報によると | grammar, reading | 5 | n4-grammar-076, n4-grammar-204, jp-reading-set-n4-015 |
| 複合詞 | がありません | grammar, reading | 4 | n4-grammar-197, jp-reading-set-n4-025 |
| 複合詞 | そうです | grammar, reading | 4 | n4-grammar-268, jp-reading-set-n4-010, jp-reading-set-n4-036 |
| 複合詞 | ようと思う | grammar, reading | 4 | n4-grammar-070, n4-grammar-134, n4-grammar-248 |
| 複合詞 | 裡有學生 | grammar, listening | 4 | n5-grammar-021, jl-063 |
| 複合詞 | ありますか | grammar, listening | 3 | n5-grammar-219, jl-050 |
| 複合詞 | えいがを | reading, listening | 3 | jp-reading-set-n4-079, jl-006, jl-098 |
| 複合詞 | かいました | reading, listening | 3 | jp-reading-set-n4-099, jl-018, jl-035 |
| 複合詞 | かばんは | grammar, listening | 3 | n5-grammar-218, jl-019 |
| 複合詞 | しています | grammar, reading | 3 | n5-grammar-042, jp-reading-set-n4-097 |
| 複合詞 | できます | reading, listening | 3 | jp-reading-set-n4-103, jp-reading-set-n4-104, jl-092 |
| 複合詞 | 因為很熱 | grammar, listening | 3 | n5-grammar-045, jl-074 |
| 複合詞 | 因為發燒 | grammar, listening | 3 | n4-grammar-257, jl-082 |
| 複合詞 | 今天很熱 | grammar, listening | 3 | n5-grammar-016, jl-001 |
| 複合詞 | 最好早點睡 | grammar, listening | 3 | n4-grammar-257, jl-100 |
| 複合詞 | 昨天很冷 | grammar, listening | 3 | n5-grammar-025, jl-001 |
| 複合詞 | 車站在哪裡 | grammar, listening | 3 | n5-grammar-217, jl-007, jl-024 |
| 複合詞 | 請給我水 | grammar, listening | 3 | n5-grammar-235, jl-057, jl-067 |
| 複合詞 | 廁所在哪裡 | grammar, listening | 3 | n5-grammar-217, jl-007 |
| 複合詞 | あさごはんを | grammar, listening | 2 | n5-grammar-039, jl-008 |
| 複合詞 | いいです | reading, listening | 2 | jp-reading-set-n4-101, jl-100 |
| 複合詞 | いきました | reading, listening | 2 | jp-reading-set-n4-099, jl-015 |
| 複合詞 | えきまで | reading, listening | 2 | jp-reading-set-n4-098, jl-002 |
| 複合詞 | おきます | grammar, listening | 2 | n5-grammar-004, jl-011 |
| 複合詞 | おとうとは | reading, listening | 2 | jp-reading-set-n4-079, jl-038 |
| 複合詞 | かいぎは | grammar, listening | 2 | n5-grammar-224, jl-027 |
| 複合詞 | きっぷは | grammar, reading | 2 | n5-grammar-223, jp-reading-set-n4-104 |
| 複合詞 | きょうとへ | reading, listening | 2 | jp-reading-set-n4-076, jl-054 |
| 複合詞 | しゅくだいは | grammar, listening | 2 | n5-grammar-044, jl-072 |
| 複合詞 | じょうずです | grammar, listening | 2 | n5-grammar-238, jl-012 |
| 複合詞 | つもりでした | grammar, reading | 2 | n4-grammar-270, jp-reading-set-n4-087 |
| 複合詞 | としょかんで | reading, listening | 2 | jp-reading-set-n4-076, jl-013 |
| 複合詞 | にちようびに | grammar, listening | 2 | n5-grammar-050, jl-051 |
| 複合詞 | に学生がいます | grammar, listening | 2 | n5-grammar-021, jl-063 |
| 複合詞 | に起きます | grammar, listening | 2 | n5-grammar-004, jl-011 |
| 複合詞 | のみます | grammar, listening | 2 | n5-grammar-003, jl-031 |
| 複合詞 | はありません | grammar, reading | 2 | n4-grammar-166, jp-reading-set-n4-062 |
| 複合詞 | はどこですか | grammar, listening | 2 | n5-grammar-217, jl-007 |
| 複合詞 | は何曜日ですか | grammar, reading | 2 | n5-grammar-225, jp-reading-set-n4-103 |
| 複合詞 | ふっています | grammar, listening | 2 | n5-grammar-002, jl-073 |
| 複合詞 | ゆうびんきょくの | reading, listening | 2 | jp-reading-set-n4-078, jl-044 |
| 複合詞 | ようです | grammar, reading | 2 | n4-grammar-268, jp-reading-set-n4-064 |
| 複合詞 | よていです | reading, listening | 2 | jp-reading-set-n4-100, jl-078 |
| 複合詞 | を飲みます | grammar, listening | 2 | n5-grammar-031, jl-031 |
| 複合詞 | を見ました | grammar, listening | 2 | n5-grammar-033, jl-029 |
| 複合詞 | を見ます | grammar, listening | 2 | n5-grammar-010, jl-026 |
| 複合詞 | 因為頭痛 | grammar, listening | 2 | n4-grammar-107, jl-082 |
| 複合詞 | 可以在這裡拍照嗎 | grammar, listening | 2 | n4-grammar-063, jl-022 |
| 複合詞 | 今天星期幾 | grammar, listening | 2 | n5-grammar-225, jl-024 |
| 複合詞 | 早く寝たほうがいいです | grammar, listening | 2 | n4-grammar-257, jl-100 |
| 複合詞 | 這句日文的意思是什麼 | listening | 100 | jl-001, jl-002, jl-003 |
| 複合詞 | であることが分かります | reading | 49 | jp-reading-set-n4-011, jp-reading-set-n4-012, jp-reading-set-n4-013 |
| 複合詞 | 本文から | reading | 49 | jp-reading-set-n4-011, jp-reading-set-n4-012, jp-reading-set-n4-013 |
| 複合詞 | 動詞て形 | grammar | 41 | n5-grammar-039, n5-grammar-040, n5-grammar-042 |
| 複合詞 | にあたる内容があります | reading | 30 | jp-reading-set-n4-096, jp-reading-set-n4-097, jp-reading-set-n4-098 |
| 複合詞 | 動詞辞書形 | grammar | 30 | n4-grammar-068, n4-grammar-086, n4-grammar-089 |
| 複合詞 | 短文理解 | reading | 22 | jp-reading-set-n4-001, jp-reading-set-n4-002, jp-reading-set-n4-003 |
| 複合詞 | 動詞變化 | grammar | 22 | n4-grammar-051, n4-grammar-052, n4-grammar-053 |
| 複合詞 | 動詞た形 | grammar | 20 | n4-grammar-066, n4-grammar-067, n4-grammar-068 |
| 複合詞 | ではありません | grammar | 15 | n5-grammar-016, n5-grammar-017, n5-grammar-027 |
| 複合詞 | 中短文理解 | reading | 15 | jp-reading-set-n4-016, jp-reading-set-n4-017, jp-reading-set-n4-018 |
| 複合詞 | 文章の内容から | reading | 15 | jp-reading-set-n4-081, jp-reading-set-n4-082, jp-reading-set-n4-083 |
| 複合詞 | な形容詞語幹 | grammar | 12 | n5-grammar-027, n5-grammar-028, n5-grammar-029 |
| 複合詞 | について | grammar | 12 | n4-grammar-275, n4-grammar-276, n4-grammar-277 |
| 複合詞 | のほうが | grammar | 12 | n5-grammar-047, n5-grammar-048, n5-grammar-240 |
| 複合詞 | ことにしました | reading | 11 | jp-reading-set-n4-001, jp-reading-set-n4-002, jp-reading-set-n4-003 |
| 複合詞 | にとって | grammar | 11 | n4-grammar-275, n4-grammar-277, n4-grammar-278 |
| 複合詞 | 動詞ない形 | grammar | 11 | n5-grammar-041, n4-grammar-061, n4-grammar-062 |
| 複合詞 | 動詞ます形去掉ます | grammar | 11 | n4-grammar-051, n4-grammar-055, n4-grammar-056 |
| 複合詞 | なくてもいい | grammar | 10 | n4-grammar-062, n4-grammar-088, n4-grammar-140 |
| 複合詞 | 動詞ます形去ます | grammar | 10 | n5-grammar-032, n5-grammar-033, n5-grammar-034 |
| 複合詞 | 文意推論 | reading | 9 | jp-reading-set-n4-031, jp-reading-set-n4-032, jp-reading-set-n4-033 |
| 複合詞 | ています | grammar | 8 | n5-grammar-042, n4-grammar-241, n4-grammar-244 |
| 複合詞 | ではありませんでした | grammar | 8 | n5-grammar-017, n5-grammar-027, n5-grammar-028 |
| 複合詞 | てはいけない | grammar | 8 | n4-grammar-062, n4-grammar-065, n4-grammar-125 |
| 複合詞 | かもしれません | reading | 7 | jp-reading-set-n4-008, jp-reading-set-n4-039, jp-reading-set-n4-040 |
| 複合詞 | ことがある | grammar | 7 | n4-grammar-066, n4-grammar-068, n4-grammar-154 |
| 複合詞 | ためには | grammar | 7 | n4-grammar-288 |
| 複合詞 | てもらいたい | grammar | 7 | n4-grammar-262, n4-grammar-263 |

## 專有名詞數量摘要
專有名詞去重數：5

## 動詞及形容詞基本形還原抽樣
| 類別 | 表面形式 | 基本形 | 變化類型 | 來源模組 | 來源 ID |
|---|---|---|---|---|---|
| ichidan | 起きます | 起きる | 一段動詞・丁寧 | grammar | n5-grammar-004 |
| ichidan | 来ます | 来る | 一段動詞・丁寧 | grammar | n5-grammar-005 |
| ichidan | 来ます | 来る | 一段動詞・丁寧 | grammar | n5-grammar-006 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-019 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-019 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-019 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| iAdj | 安くない | 安い | い形容詞・否定 | grammar | n5-grammar-023 |
| iAdj | 安かった | 安い | い形容詞・過去 | grammar | n5-grammar-023 |
| iAdj | 高くない | 高い | い形容詞・否定 | grammar | n5-grammar-024 |
| iAdj | 高かった | 高い | い形容詞・過去 | grammar | n5-grammar-024 |
| iAdj | 高くない | 高い | い形容詞・否定 | grammar | n5-grammar-024 |
| iAdj | 寒かった | 寒い | い形容詞・過去 | grammar | n5-grammar-025 |
| iAdj | 寒くない | 寒い | い形容詞・否定 | grammar | n5-grammar-025 |
| iAdj | 寒かった | 寒い | い形容詞・過去 | grammar | n5-grammar-025 |
| iAdj | 難しくない | 難しい | い形容詞・否定 | grammar | n5-grammar-026 |
| iAdj | 難しかった | 難しい | い形容詞・過去 | grammar | n5-grammar-026 |

## Batch 12 建議優先順序
1. 優先人工確認 missing-candidate 與 manual-review 高頻項。
2. 確認複合詞是否應拆分、作為固定表現、或新增為獨立詞條。
3. 確認 kana-match 的同音詞風險後，再補入 vocabulary.json。

## 確認未修改正式資料
本批僅新增盤點腳本與精簡報告；未修改 vocabulary.json、grammar.json、japaneseReadingQuestions.js、script.js、japanese/index.html、style.css 或英文網站檔案。
