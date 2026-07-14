# Batch 13B-1 audit rule design：already-covered 與 grammar-element 候選分析

## 1. Summary

- 本報告僅新增設計文件，沒有修改稽核程式、單字庫、文法庫、題庫或網站功能。
- 分析範圍：already-covered 6 筆、grammar-element 49 筆，合計 55 筆。
- 判定結果：safe-auto-resolve 33、manual-only 8、reclassify-needed 14、no-change 0，合計 55。
- 目前 missing-candidate 為 117；若 Batch 13B-2 只實作本報告 safe-auto-resolve，預期 missing-candidate = 117 - 33 = 84。

## 2. 正式基準
| 指標 | 值 |
|---|---:|
| vocabulary.json | 3241 |
| N5 | 1021 |
| N4 | 2220 |
| missing-candidate | 117 |
| unsegmented span | 0 |

## 3. 資料來源
- docs/japanese-vocabulary-batch13-remaining-review.md
- scripts/audit-japanese-cross-module-vocabulary.js（唯讀）
- vocabulary.json（唯讀）
- grammar.json（唯讀）
- japaneseReadingQuestions.js、script.js（唯讀來源內容）

## 4. 現有audit判定流程
目前 `processToken` 的有效順序是：`normalize()` 內先做 exact match；再嘗試動詞、形容詞與する動詞 lemma；再用 kana map 做 kana normalization；接著檢查內建 grammarElements／properNouns；回到 `processToken` 後做 known compound 或 explicit compound；最後可靠 token 進入 missing-candidate，否則 manual-review。最適合的新規則位置：exact／lemma／kana 之後、known compound 之前。理由是 alias 與 grammar-source-bound 規則應避免遮蔽真正 exact/lemma/kana 命中，也應先於 compound 將 cloze 底線與文法來源片段歸類。建議新狀態：`orthographic-alias-match`、`grammar-element-source-bound`；不建議刪除 missing-candidate，也不建議放寬 unsegmented span。

## 5. already-covered 6筆逐筆分析

| 候選文字 | 假名 | 來源模組 | 來源ID | 代表句 | Batch 13A分類 | 對應 vocabulary word/id | 未命中原因與差異 | 目前流程未命中步驟 | 建議比對規則 | 稽核狀態 | 可安全自動處理 | 風險 | 必要測試案例 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| おう | — | reading | jp-reading-set-n4-017, jp-reading-set-n4-038, jp-reading-set-n4-078 | おう | already-covered | 一応 / 2776（同音片段；非同義，Batch 13A already-covered 需重評） | 表記差異：假名／漢字或敬語表記；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | manual-only | reclassify-needed | 否 | 同音候選可對應追う、王、負う等；現有資料未提供唯一 vocabulary id，Batch 13A already-covered 不足以支持自動處理。 | 正向：おう 僅在相同來源上下文轉為 manual-only；反向：同字串作一般詞時仍不得靜默排除。 |
| べつ | — | reading | jp-reading-set-n4-035, jp-reading-set-n4-052 | べつ | already-covered | 別々に / 2486（含 べつ；非單獨「別」） | 表記差異：假名／漢字或敬語表記；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | manual-only | reclassify-needed | 否 | vocabulary.json 沒有單獨「別／べつ」；不能用「別々に」或「特別」覆蓋單獨片段。 | 正向：べつ 保留為重評案例；反向：不得因 特別/別々に 等包含字形或讀音就排除。 |
| パン＿＿ | — | grammar | n5-grammar-009, n5-grammar-235 | パン＿＿卵を食べます。 | already-covered | パン / 132 | 表記差異：cloze 底線；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | orthographic alias | safe-auto-resolve | 是 | 底線是 cloze 佔位符，去除後 exact match パン。 | 正向：パン＿＿ 僅在相同來源上下文轉為 orthographic alias；反向：同字串作一般詞時仍不得靜默排除。 |
| お客 | — | reading | jp-reading-q-n4-016-02 | お客さん | already-covered | お客様 / 1480 | 表記差異：假名／漢字或敬語表記；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | manual-only | manual-only | 否 | お客與お客様敬語層級不同，不能自動視為同一詞。 | 正向：お客 僅在相同來源上下文轉為 manual-only；反向：同字串作一般詞時仍不得靜默排除。 |
| クラス＿＿ | — | grammar | n5-grammar-214 | クラス＿＿だれがいちばん元気ですか。 | already-covered | クラス / 3189 | 表記差異：cloze 底線；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | orthographic alias | safe-auto-resolve | 是 | 底線是 cloze 佔位符，去除後 exact match クラス。 | 正向：クラス＿＿ 僅在相同來源上下文轉為 orthographic alias；反向：同字串作一般詞時仍不得靜默排除。 |
| けしゴム | — | reading | jp-reading-set-n4-031 | じゅぎょうがおわったあと、きょうしつにひとりだけがくせいがのこっていました。つくえのうえにはけしゴムとノートがあり、まど | already-covered | 消しゴム / 3226 | 表記差異：假名／漢字或敬語表記；假名差異：需以 vocabulary kana 驗證；漢字/平假名/片假名差異：表層 token 不等於 word；正式形或活用差異：非活用，屬 alias 或人工判定。 | exact 未命中；lemma 未命中；kana 未唯一命中或未命中；known/explicit compound 未命中；進入 missing-candidate。 | orthographic alias | safe-auto-resolve | 是 | 假名漢字混寫與既有 消しゴム 對應；需限定 alias。 | 正向：けしゴム 僅在相同來源上下文轉為 orthographic alias；反向：同字串作一般詞時仍不得靜默排除。 |

## 6. grammar-element 49筆逐筆分析

| 候選文字 | 假名/讀法 | 來源模組 | 來源ID | 代表句 | 文法功能 | 類別 | grammar.json 對應 | 助詞 | 助動詞 | 接續形式 | 活用附屬 | 固定結構 | 不適合單字卡原因 | 建議狀態 | 安全自動 | 風險 | 必要測試案例 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 何時 | — | grammar,reading,listening | n5-grammar-224, n5-grammar-225, n5-grammar-226 | 何時 | 何時 | 助動詞/接續/活用片段 | n5-grammar-224: 何時 / 何時 + に／ですか<br>n5-grammar-225: 何曜日 / 何曜日 + ですか<br>n5-grammar-226: 何月何日 / 何月何日 + ですか | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-224 的 grammar 欄位/structure 命中；反向：閱讀文章中的「何時」若為一般詞仍保留 missing-candidate。 |
| 曜日 | — | grammar,reading | n5-grammar-225, jp-reading-q-n4-103-01 | 何曜日 | 曜日 | 文法標籤 | n5-grammar-225: 何曜日 / 何曜日 + ですか | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-225 的 grammar 欄位/structure 命中；反向：閱讀文章中的「曜日」若為一般詞仍保留 missing-candidate。 |
| ごろ | ごろ | grammar | n5-grammar-228, n5-grammar-229 | ごろ | ごろ | 助動詞/接續/活用片段 | n5-grammar-228: 〜ごろ / 時間點 + ごろ<br>n5-grammar-229: 〜ぐらい（數量） / 數量詞 + ぐらい | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-228 的 grammar 欄位/structure 命中；反向：閱讀文章中的「ごろ」若為一般詞仍保留 missing-candidate。 |
| のに | のに | grammar | n4-grammar-108 | のに | のに | 助詞/連語 | n4-grammar-108: 〜のに / 普通形 + のに／な形容詞語幹 + な + のに／名詞 + な + のに | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-108 的 grammar 欄位/structure 命中；反向：閱讀文章中的「のに」若為一般詞仍保留 missing-candidate。 |
| 何月何日 | — | grammar | n5-grammar-226 | 何月何日 | 何月何日 | 助動詞/接續/活用片段 | n5-grammar-226: 何月何日 / 何月何日 + ですか | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-226 的 grammar 欄位/structure 命中；反向：閱讀文章中的「何月何日」若為一般詞仍保留 missing-candidate。 |
| ずに | ずに | grammar | n4-grammar-246 | ずに | ずに | 助動詞/接續/活用片段 | n4-grammar-246: 〜ずに / 動詞ない形去い + ずに／する→せずに | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-246 的 grammar 欄位/structure 命中；反向：閱讀文章中的「ずに」若為一般詞仍保留 missing-candidate。 |
| た形 | — | grammar | n5-grammar-033, n5-grammar-039 | た形 | た形 | 助動詞/接續/活用片段 | n5-grammar-033: ました / 動詞ます形去ます + ました<br>n5-grammar-039: て形 / 動詞て形 | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-033 的 grammar 欄位/structure 命中；反向：閱讀文章中的「た形」若為一般詞仍保留 missing-candidate。 |
| やら | やら | grammar | n4-grammar-177 | やら | やら | 助詞/連語 | n4-grammar-177: 〜やら〜やら / 名詞 + やら + 名詞 + やら | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-177 的 grammar 欄位/structure 命中；反向：閱讀文章中的「やら」若為一般詞仍保留 missing-candidate。 |
| いた | いた | grammar | n4-grammar-203 | いた | いた | 助動詞/接續/活用片段 | n4-grammar-203: 〜と聞く / 普通形 + と聞く／聞いた | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-203 的 grammar 欄位/structure 命中；反向：閱讀文章中的「いた」若為一般詞仍保留 missing-candidate。 |
| えて | えて | grammar | n4-grammar-180 | えて | えて | 助動詞/接續/活用片段 | n4-grammar-180: 〜に加えて / 名詞 + に加えて | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-180 的 grammar 欄位/structure 命中；反向：閱讀文章中的「えて」若為一般詞仍保留 missing-candidate。 |
| える | える | grammar | n4-grammar-165 | える | える | 助動詞/接續/活用片段 | n4-grammar-165: 〜ように見える / 普通形 + ように見える | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-165 的 grammar 欄位/structure 命中；反向：閱讀文章中的「える」若為一般詞仍保留 missing-candidate。 |
| おく | おく | grammar | n4-grammar-053 | おく | おく | 助動詞/接續/活用片段 | n4-grammar-053: 〜ておく / 動詞て形 + おく | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-053 的 grammar 欄位/structure 命中；反向：閱讀文章中的「おく」若為一般詞仍保留 missing-candidate。 |
| きゃ | きゃ | grammar | n4-grammar-138 | きゃ | きゃ | 助動詞/接續/活用片段 | n4-grammar-138: 〜なきゃ / 動詞ない形去い + きゃ | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-138 的 grammar 欄位/structure 命中；反向：閱讀文章中的「きゃ」若為一般詞仍保留 missing-candidate。 |
| くて | くて | grammar | n4-grammar-087 | くて | くて | 助動詞/接續/活用片段 | n4-grammar-087: 〜ても / 動詞て形／い形容詞くて／な形容詞で／名詞で + も | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-087 的 grammar 欄位/structure 命中；反向：閱讀文章中的「くて」若為一般詞仍保留 missing-candidate。 |
| けど | けど | grammar | n4-grammar-197 | けど | けど | 助詞/連語 | n4-grammar-197: 〜けど / 普通形 + けど | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-197 的 grammar 欄位/structure 命中；反向：閱讀文章中的「けど」若為一般詞仍保留 missing-candidate。 |
| ける | ける | grammar | n4-grammar-057 | ける | ける | 助動詞/接續/活用片段 | n4-grammar-057: 〜続ける / 動詞ます形去掉ます + 続ける | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-057 的 grammar 欄位/structure 命中；反向：閱讀文章中的「ける」若為一般詞仍保留 missing-candidate。 |
| こう | こう | grammar | n5-grammar-230 | こう | こう | 助動詞/接續/活用片段 | n5-grammar-230: ここ／そこ／あそこ / ここ／そこ／あそこ + は／に／で | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-230 的 grammar 欄位/structure 命中；反向：閱讀文章中的「こう」若為一般詞仍保留 missing-candidate。 |
| ずつ | ずつ | grammar | n4-grammar-247 | ずつ | ずつ | 助詞/連語 | n4-grammar-247: 〜ないで / 動詞ない形 + で | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-247 的 grammar 欄位/structure 命中；反向：閱讀文章中的「ずつ」若為一般詞仍保留 missing-candidate。 |
| って | って | grammar | n4-grammar-199 | って | って | 助詞/連語 | n4-grammar-199: 〜たって / 動詞た形 + って | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-199 的 grammar 欄位/structure 命中；反向：閱讀文章中的「って」若為一般詞仍保留 missing-candidate。 |
| てき | てき | grammar | n4-grammar-243 | てき | てき | 助動詞/接續/活用片段 | n4-grammar-243: 〜てくる / 動詞て形 + くる | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-243 的 grammar 欄位/structure 命中；反向：閱讀文章中的「てき」若為一般詞仍保留 missing-candidate。 |
| てみ | てみ | grammar | n4-grammar-243 | てみ | てみ | 助動詞/接續/活用片段 | n4-grammar-243: 〜てくる / 動詞て形 + くる | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-243 的 grammar 欄位/structure 命中；反向：閱讀文章中的「てみ」若為一般詞仍保留 missing-candidate。 |
| でも | でも | grammar | n5-grammar-046 | でも | でも | 助詞/連語 | n5-grammar-046: が（但是） / 句子 + が + 句子 | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-046 的 grammar 欄位/structure 命中；反向：閱讀文章中的「でも」若為一般詞仍保留 missing-candidate。 |
| など | など | grammar | n4-grammar-100 | など | など | 助詞/連語 | n4-grammar-100: 〜や〜など / 名詞 + や + 名詞 + など | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-100 的 grammar 欄位/structure 命中；反向：閱讀文章中的「など」若為一般詞仍保留 missing-candidate。 |
| のが | のが | grammar | n4-grammar-150 | のが | のが | 助詞/連語 | n4-grammar-150: 〜のが得意だ／苦手だ / 動詞辞書形 + のが得意だ／苦手だ | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-150 的 grammar 欄位/structure 命中；反向：閱讀文章中的「のが」若為一般詞仍保留 missing-candidate。 |
| のは | のは | grammar | n4-grammar-210 | のは | のは | 助詞/連語 | n4-grammar-210: 〜のは〜だ / 動詞普通形 + のは + 名詞／形容詞 + だ | 是 | 否 | 是 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-210 的 grammar 欄位/structure 命中；反向：閱讀文章中的「のは」若為一般詞仍保留 missing-candidate。 |
| はず | はず | grammar | n4-grammar-248 | はず | はず | 助動詞/接續/活用片段 | n4-grammar-248: 〜つもりだ / 動詞辞書形／ない形 + つもりだ | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-248 的 grammar 欄位/structure 命中；反向：閱讀文章中的「はず」若為一般詞仍保留 missing-candidate。 |
| まま | まま | grammar | n4-grammar-208 | まま | まま | 助動詞/接續/活用片段 | n4-grammar-208: 〜まま / 動詞た形／ない形 + まま；名詞 + のまま | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-208 的 grammar 欄位/structure 命中；反向：閱讀文章中的「まま」若為一般詞仍保留 missing-candidate。 |
| める | める | grammar | n4-grammar-051 | める | める | 助動詞/接續/活用片段 | n4-grammar-051: 〜始める / 動詞ます形去掉ます + 始める | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-051 的 grammar 欄位/structure 命中；反向：閱讀文章中的「める」若為一般詞仍保留 missing-candidate。 |
| やる | やる | grammar | n4-grammar-096 | やる | やる | 助動詞/接續/活用片段 | n4-grammar-096: 〜てやる / 動詞て形 + やる | 否 | 是 | 是 | 是 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n4-grammar-096 的 grammar 欄位/structure 命中；反向：閱讀文章中的「やる」若為一般詞仍保留 missing-candidate。 |
| 位置 | — | grammar | n5-grammar-212 | に（存在位置） | 位置 | 文法標籤 | n5-grammar-212: に（存在位置） / 場所名詞 + に + あります／います | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-212 的 grammar 欄位/structure 命中；反向：閱讀文章中的「位置」若為一般詞仍保留 missing-candidate。 |
| 何月 | — | grammar | n5-grammar-225 | 何月 | 何月 | 助動詞/接續/活用片段 | n5-grammar-225: 何曜日 / 何曜日 + ですか | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-225 的 grammar 欄位/structure 命中；反向：閱讀文章中的「何月」若為一般詞仍保留 missing-candidate。 |
| 何枚 | — | grammar | n5-grammar-224 | 何枚 | 何枚 | 助動詞/接續/活用片段 | n5-grammar-224: 何時 / 何時 + に／ですか | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | safe-auto-resolve | 是 | 可由 grammar.json id/structure/pattern 及來源欄位限定，作為文法元素處理。 | 正向：只在來源 id n5-grammar-224 的 grammar 欄位/structure 命中；反向：閱讀文章中的「何枚」若為一般詞仍保留 missing-candidate。 |
| 祈願 | — | grammar | n4-grammar-181 | 〜ように（祈願） | 祈願 | 文法標籤 | n4-grammar-181: 〜ように（祈願） / 普通形 + ように | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n4-grammar-181 的 grammar 欄位/structure 命中；反向：閱讀文章中的「祈願」若為一般詞仍保留 missing-candidate。 |
| 起點 | — | grammar | n5-grammar-013 | から（起點） | 起點 | 文法標籤 | n5-grammar-013: から（起點） / 時間／地點 + から | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-013 的 grammar 欄位/structure 命中；反向：閱讀文章中的「起點」若為一般詞仍保留 missing-candidate。 |
| 逆接 | — | grammar | n4-grammar-198 | 〜ながら（逆接） | 逆接 | 文法標籤 | n4-grammar-198: 〜ながら（逆接） / 動詞ます形去ます + ながら | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n4-grammar-198 的 grammar 欄位/structure 命中；反向：閱讀文章中的「逆接」若為一般詞仍保留 missing-candidate。 |
| 手段 | — | grammar | n5-grammar-008 | で（手段） | 手段 | 文法標籤 | n5-grammar-008: で（手段） / 工具／方法／交通工具 + で + 動詞 | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-008 的 grammar 欄位/structure 命中；反向：閱讀文章中的「手段」若為一般詞仍保留 missing-candidate。 |
| 所屬 | — | grammar | n5-grammar-012 | の（所屬） | 所屬 | 文法標籤 | n5-grammar-012: の（所屬） / 名詞 + の + 名詞 | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-012 的 grammar 欄位/structure 命中；反向：閱讀文章中的「所屬」若為一般詞仍保留 missing-candidate。 |
| 状態 | — | grammar | n4-grammar-244 | 〜ている（結果状態） | 状態 | 文法標籤 | n4-grammar-244: 〜ている（結果状態） / 自動詞て形 + いる | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n4-grammar-244 的 grammar 欄位/structure 命中；反向：閱讀文章中的「状態」若為一般詞仍保留 missing-candidate。 |
| 存在 | — | grammar | n5-grammar-212 | に（存在位置） | 存在 | 文法標籤 | n5-grammar-212: に（存在位置） / 場所名詞 + に + あります／います | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-212 的 grammar 欄位/structure 命中；反向：閱讀文章中的「存在」若為一般詞仍保留 missing-candidate。 |
| 但是 | — | grammar | n5-grammar-046 | が（但是） | 但是 | 文法標籤 | n5-grammar-046: が（但是） / 句子 + が + 句子 | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-046 的 grammar 欄位/structure 命中；反向：閱讀文章中的「但是」若為一般詞仍保留 missing-candidate。 |
| 通過 | — | grammar | n5-grammar-211 | を（通過） | 通過 | 文法標籤 | n5-grammar-211: を（通過） / 場所名詞 + を + 移動動詞 | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-211 的 grammar 欄位/structure 命中；反向：閱讀文章中的「通過」若為一般詞仍保留 missing-candidate。 |
| 範圍 | — | grammar | n5-grammar-214 | で（範圍） | 範圍 | 文法標籤 | n5-grammar-214: で（範圍） / 範圍名詞 + で + いちばん／形容詞 | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-214 的 grammar 欄位/structure 命中；反向：閱讀文章中的「範圍」若為一般詞仍保留 missing-candidate。 |
| 並列 | — | grammar | n5-grammar-009 | と（並列） | 並列 | 文法標籤 | n5-grammar-009: と（並列） / 名詞 + と + 名詞 | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-009 的 grammar 欄位/structure 命中；反向：閱讀文章中的「並列」若為一般詞仍保留 missing-candidate。 |
| 命令 | — | grammar | n4-grammar-126 | 命令形 | 命令 | 文法標籤 | n4-grammar-126: 命令形 / 五段動詞變え段／一段動詞去掉る + ろ／する→しろ／来る→来い | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n4-grammar-126 的 grammar 欄位/structure 命中；反向：閱讀文章中的「命令」若為一般詞仍保留 missing-candidate。 |
| 目的地 | — | grammar | n5-grammar-005 | に（目的地） | 目的地 | 文法標籤 | n5-grammar-005: に（目的地） / 地點 + に + 行きます／来ます／帰ります | 否 | 否 | 否 | 否 | 是 | 可能同時是一般名詞或複合詞片段，缺少足夠限制前不應自動排除。 | manual-only | 否 | 可作一般名詞或題目詞；不得以全域文字規則排除。 | 正向：只在來源 id n5-grammar-005 的 grammar 欄位/structure 命中；反向：閱讀文章中的「目的地」若為一般詞仍保留 missing-candidate。 |
| 傳聞 | — | grammar | n4-grammar-076 | 〜そうだ（傳聞） | 傳聞 | 文法標籤 | n4-grammar-076: 〜そうだ（傳聞） / 普通形 + そうだ | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n4-grammar-076 的 grammar 欄位/structure 命中；反向：閱讀文章中的「傳聞」若為一般詞仍保留 missing-candidate。 |
| 對象 | — | grammar | n5-grammar-213 | に（對象） | 對象 | 文法標籤 | n5-grammar-213: に（對象） / 人名詞 + に + 動詞 | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-213 的 grammar 欄位/structure 命中；反向：閱讀文章中的「對象」若為一般詞仍保留 missing-candidate。 |
| 對比 | — | grammar | n5-grammar-215 | は（對比） | 對比 | 文法標籤 | n5-grammar-215: は（對比） / 名詞 + は | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-215 的 grammar 欄位/structure 命中；反向：閱讀文章中的「對比」若為一般詞仍保留 missing-candidate。 |
| 數量 | — | grammar | n5-grammar-229 | 〜ぐらい（數量） | 數量 | 文法標籤 | n5-grammar-229: 〜ぐらい（數量） / 數量詞 + ぐらい | 否 | 否 | 否 | 否 | 是 | 文法結構、助詞、助動詞或功能標籤；應由 grammar coverage 追蹤，不應作一般 N5/N4 vocabulary 卡。 | reclassify-needed | 否 | 較像中文文法標籤，不是日文候選；需先確認抽取來源欄位。 | 正向：只在來源 id n5-grammar-229 的 grammar 欄位/structure 命中；反向：閱讀文章中的「數量」若為一般詞仍保留 missing-candidate。 |

## 7. safe-auto-resolve清單

- パン＿＿
- クラス＿＿
- けしゴム
- 何時
- ごろ
- のに
- 何月何日
- ずに
- た形
- やら
- いた
- えて
- える
- おく
- きゃ
- くて
- けど
- ける
- こう
- ずつ
- って
- てき
- てみ
- でも
- など
- のが
- のは
- はず
- まま
- める
- やる
- 何月
- 何枚

## 8. manual-only清單

- お客
- 曜日
- 位置
- 手段
- 状態
- 存在
- 通過
- 目的地

## 9. reclassify-needed清單

- おう
- べつ
- 祈願
- 起點
- 逆接
- 所屬
- 但是
- 範圍
- 並列
- 命令
- 傳聞
- 對象
- 對比
- 數量

## 10. no-change清單

- （無）

## 11. 誤判風險
- 不得使用 117 筆或 55 筆文字黑名單。
- 不得只因字串出現在 grammar.json 就全域排除；規則必須同時檢查來源 module、field、id/pattern/structure 與上下文。
- 「おう」「お客」「曜日」「位置」「手段」「状態」「存在」「通過」「目的地」等可能是一般詞或非唯一對應，需保留人工審核。
- 中文文法標籤（祈願、起點、逆接等）應先重新評估抽取欄位，避免把非日文詞彙候選偽裝成已解決。


## 12. 預期數量變化
| 分類 | 數量 |
|---|---:|
| safe-auto-resolve | 33 |
| manual-only | 8 |
| reclassify-needed | 14 |
| no-change | 0 |
| 合計 | 55 |

| 子集合 | 可安全自動處理 | 需人工處理 |
|---|---:|---:|
| already-covered 6筆 | 3 | 3 |
| grammar-element 49筆 | 30 | 19 |

預期實作後 missing-candidate = 117 - 33 = 84；unsegmented span 預期仍為 0。


## 13. Batch 13B-2最小實作方案
- 預計修改：`scripts/audit-japanese-cross-module-vocabulary.js`；可能新增 fixture 或專用檢查腳本 `scripts/check-japanese-vocabulary-batch13b-audit-rules.js`；不得修改 vocabulary.json、grammar.json 或題庫。
- 新規則名稱：`orthographic-alias-match`、`grammar-element-source-bound`。
- 順序：exact → lemma → kana normalization → orthographic alias → grammar source-bound → known compound → explicit compound → missing-candidate。
- 限制：alias 必須逐項列明目標 vocabulary id；grammar 規則必須限定 module=grammar 與欄位/grammar id，不能全域忽略相同文字。
- 正向測試：パン＿＿→パン、クラス＿＿→クラス、けしゴム→消しゴム、ずに→grammar-element-source-bound。
- 反向測試：おう、 お客、位置、状態 等仍不得自動消失。
- 回滾條件：missing-candidate 低於預期 84、unsegmented span 非 0、或任何正式資料 diff。


## 14. 回歸測試設計
- JSON/JS 語法與既有 health/menu/view isolation checks 全部保留。
- 新增固定資料檢查：safe 清單必須轉狀態；manual/reclassify/no-change 清單必須仍可在 audit 報表追蹤。
- 對照案例：`おう`、`お客`、`曜日`、`位置`、`祈願` 應保持 missing-candidate 或人工分類，不得被全域排除。


## 15. 測試與Git狀態
- `python3 -m json.tool vocabulary.json >/dev/null`：通過。
- `python3 -m json.tool grammar.json >/dev/null`：通過。
- `node --check script.js`：通過。
- `node scripts/auditSiteHealth.js`：通過，輸出 Japanese vocabulary cards 3241、Japanese grammar cards 290。
- `node scripts/check-japanese-main-entry.js`：通過。
- `node scripts/check-japanese-vocabulary-menu.js`：通過。
- `node scripts/check-japanese-vocabulary-view-split.js`：通過。
- `node scripts/check-japanese-grammar-menu.js`：通過。
- `node scripts/check-japanese-reading-menu.js`：通過。
- `node scripts/check-reading-ruby.js`：通過。
- `node scripts/check-japanese-listening-menu.js`：通過。
- `node scripts/check-japanese-listening-view-isolation.js`：通過。
- `node scripts/check-japanese-listening-state-isolation.js`：通過。
- `node scripts/check-japanese-view-isolation.js`：通過。
- `node scripts/audit-japanese-cross-module-vocabulary.js >/tmp/audit.out`：通過；正式 audit 報告維持 missing-candidate 117、unsegmented span 0。
- `git diff --check`：通過。
- `git status --short`：執行時僅顯示新增 `docs/japanese-vocabulary-batch13b-audit-rule-plan.md`。
