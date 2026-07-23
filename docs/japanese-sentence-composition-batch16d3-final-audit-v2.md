# Batch 16D-3 日文句子重組60題最終唯一正解稽核 v2

本報告由 before、四個 chunks 與 after 重新產生每題24種排列，並搭配 permutations JSON 保存1440筆判定證據。自動檢查器只驗證資料與稽核證據完整性，不宣稱能自動判斷日文文法。

## 總結

- 稽核範圍：sc-n5-001～sc-n5-030、sc-n4-001～sc-n4-030。
- 題目數：60；排列數：1440。
- VALID_EXPECTED：60；VALID_ALTERNATE：0；INVALID_GRAMMAR：1380。
- 最終結論：60題皆 PASS_UNIQUE。

## 逐題稽核

### sc-n5-001

- ID：sc-n5-001
- level：N5
- before／after：わたしは毎朝／。
- chunks及ID：a:七時に；b:起きて；d:洗います；c:顔を
- correctOrder：a → b → c → d
- completeSentence：わたしは毎朝七時に起きて顔を洗います。
- grammarIds：n5-grammar-004, n5-grammar-039, n5-grammar-003
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：わたしは毎朝七時に起きて洗います顔を。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「七時に起きて顔を洗います」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「起きて」後應緊接「顔を」，此排列改接「洗います」，固定接續／語序被切斷；正解必要相鄰片段「起きて＋顔を」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「顔を＋洗います」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-002

- ID：sc-n5-002
- level：N5
- before／after：あには朝ご飯を食べてから／。
- chunks及ID：a:図書館へ；b:行って；d:勉強します；c:日本語を
- correctOrder：a → b → c → d
- completeSentence：あには朝ご飯を食べてから図書館へ行って日本語を勉強します。
- grammarIds：n5-grammar-006, n5-grammar-039, n5-grammar-003, n5-grammar-031
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：あには朝ご飯を食べてから図書館へ行って勉強します日本語を。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「図書館へ行って日本語を勉強します」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「行って」後應緊接「日本語を」，此排列改接「勉強します」，固定接續／語序被切斷；正解必要相鄰片段「行って＋日本語を」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「日本語を＋勉強します」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-003

- ID：sc-n5-003
- level：N5
- before／after：机の上に／。
- chunks及ID：a:父が；d:あります；c:辞書が；b:買ってくれた
- correctOrder：a → b → c → d
- completeSentence：机の上に父が買ってくれた辞書があります。
- grammarIds：n5-grammar-019, n5-grammar-212, n5-grammar-002
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：机の上に父があります辞書が買ってくれた。（order: a → d → c → b）
- 具體文法判定：正解需依序形成「父が買ってくれた辞書があります」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「父が」後應緊接「買ってくれた」，此排列改接「あります」，固定接續／語序被切斷；「辞書が」後應緊接「あります」，此排列改接「買ってくれた」，固定接續／語序被切斷；正解必要相鄰片段「父が＋買ってくれた」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-004

- ID：sc-n5-004
- level：N5
- before／after：田中さんは駅で先生に会／。
- chunks及ID：a:って；c:に帰り；b:いっしょ；d:ました
- correctOrder：a → b → c → d
- completeSentence：田中さんは駅で先生に会っていっしょに帰りました。
- grammarIds：n5-grammar-213, n5-grammar-039, n5-grammar-033
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：田中さんは駅で先生に会ってに帰りいっしょました。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「っていっしょに帰りました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「って」後應緊接「いっしょ」，此排列改接「に帰り」，固定接續／語序被切斷；正解必要相鄰片段「って＋いっしょ」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「いっしょ＋に帰り」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-005

- ID：sc-n5-005
- level：N5
- before／after：この店は安／。
- chunks及ID：a:いです；b:が；d:ないです；c:あまり広く
- correctOrder：a → b → c → d
- completeSentence：この店は安いですがあまり広くないです。
- grammarIds：n5-grammar-046, n5-grammar-024
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この店は安いですがないですあまり広く。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「いですがあまり広くないです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「が」後應緊接「あまり広く」，此排列改接「ないです」，固定接續／語序被切斷；正解必要相鄰片段「が＋あまり広く」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「あまり広く＋ないです」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-006

- ID：sc-n5-006
- level：N5
- before／after：妹は／。
- chunks及ID：a:ケーキを；b:食べて；d:飲みました；c:お茶を
- correctOrder：a → b → c → d
- completeSentence：妹はケーキを食べてお茶を飲みました。
- grammarIds：n5-grammar-003, n5-grammar-039, n5-grammar-033
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：妹はケーキを食べて飲みましたお茶を。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「ケーキを食べてお茶を飲みました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「食べて」後應緊接「お茶を」，此排列改接「飲みました」，固定接續／語序被切斷；正解必要相鄰片段「食べて＋お茶を」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「お茶を＋飲みました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-007

- ID：sc-n5-007
- level：N5
- before／after：日曜日に／。
- chunks及ID：a:新しい；d:行きます；c:買いに；b:靴を
- correctOrder：a → b → c → d
- completeSentence：日曜日に新しい靴を買いに行きます。
- grammarIds：n5-grammar-023, n5-grammar-003, n5-grammar-234
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：日曜日に新しい行きます買いに靴を。（order: a → d → c → b）
- 具體文法判定：正解需依序形成「新しい靴を買いに行きます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「新しい」後應緊接「靴を」，此排列改接「行きます」，固定接續／語序被切斷；「買いに」後應緊接「行きます」，此排列改接「靴を」，固定接續／語序被切斷；正解必要相鄰片段「新しい＋靴を」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-008

- ID：sc-n5-008
- level：N5
- before／after：母は／。
- chunks及ID：a:晩ご飯を；c:上手なので；b:作るのが；d:よく作ってくれます
- correctOrder：a → b → c → d
- completeSentence：母は晩ご飯を作るのが上手なのでよく作ってくれます。
- grammarIds：n5-grammar-238, n5-grammar-045
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：母は晩ご飯を上手なので作るのがよく作ってくれます。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「晩ご飯を作るのが上手なのでよく作ってくれます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「晩ご飯を」後應緊接「作るのが」，此排列改接「上手なので」，固定接續／語序被切斷；正解必要相鄰片段「晩ご飯を＋作るのが」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「作るのが＋上手なので」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-001

- ID：sc-n4-001
- level：N4
- before／after：雨が／。
- chunks及ID：a:やんだら駅まで；b:歩いて；d:ましょう；c:行き
- correctOrder：a → b → c → d
- completeSentence：雨がやんだら駅まで歩いて行きましょう。
- grammarIds：n4-grammar-083, n5-grammar-014, n5-grammar-035
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：雨がやんだら駅まで歩いてましょう行き。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「やんだら駅まで歩いて行きましょう」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「歩いて」後應緊接「行き」，此排列改接「ましょう」，固定接續／語序被切斷；正解必要相鄰片段「歩いて＋行き」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「行き＋ましょう」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-002

- ID：sc-n4-002
- level：N4
- before／after：旅行の前に／。
- chunks及ID：a:ホテルを；b:予約して；d:ほうがいいです；c:おいた
- correctOrder：a → b → c → d
- completeSentence：旅行の前にホテルを予約しておいたほうがいいです。
- grammarIds：n4-grammar-053, n4-grammar-257
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：旅行の前にホテルを予約してほうがいいですおいた。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「ホテルを予約しておいたほうがいいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「予約して」後應緊接「おいた」，此排列改接「ほうがいいです」，固定接續／語序被切斷；正解必要相鄰片段「予約して＋おいた」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「おいた＋ほうがいいです」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-003

- ID：sc-n4-003
- level：N4
- before／after：この漢字は／。
- chunks及ID：a:何度も；d:はずです；c:覚えられる；b:書けば
- correctOrder：a → b → c → d
- completeSentence：この漢字は何度も書けば覚えられるはずです。
- grammarIds：n4-grammar-084, n4-grammar-146, n4-grammar-082
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この漢字は何度もはずです覚えられる書けば。（order: a → d → c → b）
- 具體文法判定：正解需依序形成「何度も書けば覚えられるはずです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「何度も」後應緊接「書けば」，此排列改接「はずです」，固定接續／語序被切斷；「覚えられる」後應緊接「はずです」，此排列改接「書けば」，固定接續／語序被切斷；正解必要相鄰片段「何度も＋書けば」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-004

- ID：sc-n4-004
- level：N4
- before／after：山田さんは忙しいのに／。
- chunks及ID：a:毎日；c:続けて；b:走り；d:います
- correctOrder：a → b → c → d
- completeSentence：山田さんは忙しいのに毎日走り続けています。
- grammarIds：n4-grammar-108, n4-grammar-057
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：山田さんは忙しいのに毎日続けて走りいます。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「毎日走り続けています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「毎日」後應緊接「走り」，此排列改接「続けて」，固定接續／語序被切斷；正解必要相鄰片段「毎日＋走り」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「走り＋続けて」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-005

- ID：sc-n4-005
- level：N4
- before／after：弟は／。
- chunks及ID：a:ゲームを；b:しながら；d:聞いています；c:音楽を
- correctOrder：a → b → c → d
- completeSentence：弟はゲームをしながら音楽を聞いています。
- grammarIds：n4-grammar-055, n5-grammar-042
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：弟はゲームをしながら聞いています音楽を。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「ゲームをしながら音楽を聞いています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「しながら」後應緊接「音楽を」，此排列改接「聞いています」，固定接續／語序被切斷；正解必要相鄰片段「しながら＋音楽を」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「音楽を＋聞いています」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-006

- ID：sc-n4-006
- level：N4
- before／after：明日は／。
- chunks及ID：a:朝早く；b:起きて；d:予定です；c:空港へ行く
- correctOrder：a → b → c → d
- completeSentence：明日は朝早く起きて空港へ行く予定です。
- grammarIds：n5-grammar-039, n5-grammar-006, n4-grammar-249
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：明日は朝早く起きて予定です空港へ行く。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「朝早く起きて空港へ行く予定です」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「起きて」後應緊接「空港へ行く」，此排列改接「予定です」，固定接續／語序被切斷；正解必要相鄰片段「起きて＋空港へ行く」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「空港へ行く＋予定です」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-007

- ID：sc-n4-007
- level：N4
- before／after：先生に／。
- chunks及ID：a:作文を；d:つもりです；c:いただく；b:見て
- correctOrder：a → b → c → d
- completeSentence：先生に作文を見ていただくつもりです。
- grammarIds：n4-grammar-094, n4-grammar-248
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：先生に作文をつもりですいただく見て。（order: a → d → c → b）
- 具體文法判定：正解需依序形成「作文を見ていただくつもりです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「作文を」後應緊接「見て」，此排列改接「つもりです」，固定接續／語序被切斷；「いただく」後應緊接「つもりです」，此排列改接「見て」，固定接續／語序被切斷；正解必要相鄰片段「作文を＋見て」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-008

- ID：sc-n4-008
- level：N4
- before／after：この道は／。
- chunks及ID：a:夜になると；c:歩きにくく；b:暗くて；d:なります
- correctOrder：a → b → c → d
- completeSentence：この道は夜になると暗くて歩きにくくなります。
- grammarIds：n4-grammar-086, n4-grammar-280
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この道は夜になると歩きにくく暗くてなります。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「夜になると暗くて歩きにくくなります」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「夜になると」後應緊接「暗くて」，此排列改接「歩きにくく」，固定接續／語序被切斷；正解必要相鄰片段「夜になると＋暗くて」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「暗くて＋歩きにくく」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-009

- ID：sc-n4-009
- level：N4
- before／after：薬を／。
- chunks及ID：a:飲んでも；b:熱が；d:かもしれません；c:下がらない
- correctOrder：a → b → c → d
- completeSentence：薬を飲んでも熱が下がらないかもしれません。
- grammarIds：n4-grammar-087, n4-grammar-080
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：薬を飲んでも熱がかもしれません下がらない。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「飲んでも熱が下がらないかもしれません」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「熱が」後應緊接「下がらない」，此排列改接「かもしれません」，固定接續／語序被切斷；正解必要相鄰片段「熱が＋下がらない」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「下がらない＋かもしれません」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-010

- ID：sc-n4-010
- level：N4
- before／after：会議が／。
- chunks及ID：a:終わってから；b:資料を；d:ことにしています；c:コピーする
- correctOrder：a → b → c → d
- completeSentence：会議が終わってから資料をコピーすることにしています。
- grammarIds：n4-grammar-113, n4-grammar-250
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：会議が終わってから資料をことにしていますコピーする。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「終わってから資料をコピーすることにしています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「資料を」後應緊接「コピーする」，此排列改接「ことにしています」，固定接續／語序被切斷；正解必要相鄰片段「資料を＋コピーする」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「コピーする＋ことにしています」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-011

- ID：sc-n4-011
- level：N4
- before／after：友だちが／。
- chunks及ID：a:引っ越すので；d:思います；c:あげたいと；b:手伝って
- correctOrder：a → b → c → d
- completeSentence：友だちが引っ越すので手伝ってあげたいと思います。
- grammarIds：n4-grammar-107, n4-grammar-263, n4-grammar-202
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：友だちが引っ越すので思いますあげたいと手伝って。（order: a → d → c → b）
- 具體文法判定：正解需依序形成「引っ越すので手伝ってあげたいと思います」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「引っ越すので」後應緊接「手伝って」，此排列改接「思います」，固定接續／語序被切斷；「あげたいと」後應緊接「思います」，此排列改接「手伝って」，固定接續／語序被切斷；正解必要相鄰片段「引っ越すので＋手伝って」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-012

- ID：sc-n4-012
- level：N4
- before／after：窓を／。
- chunks及ID：a:開けたまま；c:風邪を；b:寝ると；d:ひきますよ
- correctOrder：a → b → c → d
- completeSentence：窓を開けたまま寝ると風邪をひきますよ。
- grammarIds：n4-grammar-208, n4-grammar-086
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：窓を開けたまま風邪を寝るとひきますよ。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「開けたまま寝ると風邪をひきますよ」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「開けたまま」後應緊接「寝ると」，此排列改接「風邪を」，固定接續／語序被切斷；正解必要相鄰片段「開けたまま＋寝ると」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「寝ると＋風邪を」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-009

- ID：sc-n5-009
- level：N5
- before／after：テーブル／。
- chunks及ID：b:花が；a:の上に；c:あります；d:ね
- correctOrder：a → b → c → d
- completeSentence：テーブルの上に花がありますね。
- grammarIds：n5-grammar-021
- starSlot：0
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：テーブル花がの上にありますね。（order: b → a → c → d）
- 具體文法判定：正解需依序形成「の上に花がありますね」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「の上に」以承接 before「テーブル」，但此排列先接「花が」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「の上に＋花が」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「花が＋あります」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-010

- ID：sc-n5-010
- level：N5
- before／after：授業／。
- chunks及ID：a:は；c:始まり；b:九時に；d:ます
- correctOrder：a → b → c → d
- completeSentence：授業は九時に始まります。
- grammarIds：n5-grammar-004
- starSlot：1
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：授業は始まり九時にます。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「は九時に始まります」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「は」後應緊接「九時に」，此排列改接「始まり」，固定接續／語序被切斷；正解必要相鄰片段「は＋九時に」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「九時に＋始まり」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-011

- ID：sc-n5-011
- level：N5
- before／after：兄は電車／。
- chunks及ID：a:で；b:会社へ；d:ます；c:行き
- correctOrder：a → b → c → d
- completeSentence：兄は電車で会社へ行きます。
- grammarIds：n5-grammar-008, n5-grammar-005
- starSlot：2
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：兄は電車で会社へます行き。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「で会社へ行きます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「会社へ」後應緊接「行き」，此排列改接「ます」，固定接續／語序被切斷；正解必要相鄰片段「会社へ＋行き」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「行き＋ます」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-012

- ID：sc-n5-012
- level：N5
- before／after：図書館／。
- chunks及ID：d:開いています；a:は；b:九時から；c:五時まで
- correctOrder：a → b → c → d
- completeSentence：図書館は九時から五時まで開いています。
- grammarIds：n5-grammar-227, n5-grammar-042
- starSlot：3
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：図書館開いていますは九時から五時まで。（order: d → a → b → c）
- 具體文法判定：正解需依序形成「は九時から五時まで開いています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「は」以承接 before「図書館」，但此排列先接「開いています」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「五時まで＋開いています」未相鄰，相關助詞、活用或複合句型無法形成；句尾應以「開いています。」收束，但此排列以「五時まで。」結尾，句尾活用／述語收束不成立。
- 最終結論：PASS_UNIQUE

### sc-n5-013

- ID：sc-n5-013
- level：N5
- before／after：机の上／。
- chunks及ID：b:鉛筆と；c:消しゴムが；a:に；d:あります
- correctOrder：a → b → c → d
- completeSentence：机の上に鉛筆と消しゴムがあります。
- grammarIds：n5-grammar-009, n5-grammar-021
- starSlot：0
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：机の上鉛筆と消しゴムがにあります。（order: b → c → a → d）
- 具體文法判定：正解需依序形成「に鉛筆と消しゴムがあります」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「に」以承接 before「机の上」，但此排列先接「鉛筆と」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「に＋鉛筆と」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「消しゴムが＋あります」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-014

- ID：sc-n5-014
- level：N5
- before／after：この部屋／。
- chunks及ID：a:より；c:広い；d:です；b:あの部屋のほうが
- correctOrder：a → b → c → d
- completeSentence：この部屋よりあの部屋のほうが広いです。
- grammarIds：n5-grammar-240, n5-grammar-047, n5-grammar-048
- starSlot：1
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この部屋より広いですあの部屋のほうが。（order: a → c → d → b）
- 具體文法判定：正解需依序形成「よりあの部屋のほうが広いです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「より」後應緊接「あの部屋のほうが」，此排列改接「広い」，固定接續／語序被切斷；正解必要相鄰片段「より＋あの部屋のほうが」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「あの部屋のほうが＋広い」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-015

- ID：sc-n5-015
- level：N5
- before／after：クラスで田中さん／。
- chunks及ID：c:背；a:が；b:いちばん；d:が高いです
- correctOrder：a → b → c → d
- completeSentence：クラスで田中さんがいちばん背が高いです。
- grammarIds：n5-grammar-049, n5-grammar-214
- starSlot：2
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：クラスで田中さん背がいちばんが高いです。（order: c → a → b → d）
- 具體文法判定：正解需依序形成「がいちばん背が高いです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「が」以承接 before「クラスで田中さん」，但此排列先接「背」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「いちばん＋背」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「背＋が高いです」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-016

- ID：sc-n5-016
- level：N5
- before／after：父は／。
- chunks及ID：a:りんごを；d:よ；b:三つ買い；c:ました
- correctOrder：a → b → c → d
- completeSentence：父はりんごを三つ買いましたよ。
- grammarIds：n5-grammar-003
- starSlot：3
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：父はりんごをよ三つ買いました。（order: a → d → b → c）
- 具體文法判定：正解需依序形成「りんごを三つ買いましたよ」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「りんごを」後應緊接「三つ買い」，此排列改接「よ」，固定接續／語序被切斷；正解必要相鄰片段「りんごを＋三つ買い」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「ました＋よ」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-017

- ID：sc-n5-017
- level：N5
- before／after：駅／。
- chunks及ID：b:だれと；c:待ち合わせ；d:ますか；a:で
- correctOrder：a → b → c → d
- completeSentence：駅でだれと待ち合わせますか。
- grammarIds：n5-grammar-007, n5-grammar-010
- starSlot：0
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：駅だれと待ち合わせますかで。（order: b → c → d → a）
- 具體文法判定：正解需依序形成「でだれと待ち合わせますか」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「で」以承接 before「駅」，但此排列先接「だれと」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「で＋だれと」未相鄰，相關助詞、活用或複合句型無法形成；句尾應以「ますか。」收束，但此排列以「で。」結尾，句尾活用／述語收束不成立。
- 最終結論：PASS_UNIQUE

### sc-n5-018

- ID：sc-n5-018
- level：N5
- before／after：週末／。
- chunks及ID：b:京都へ；a:に；c:行き；d:たいです
- correctOrder：a → b → c → d
- completeSentence：週末に京都へ行きたいです。
- grammarIds：n5-grammar-004, n5-grammar-005, n5-grammar-037
- starSlot：1
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：週末京都へに行きたいです。（order: b → a → c → d）
- 具體文法判定：正解需依序形成「に京都へ行きたいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「に」以承接 before「週末」，但此排列先接「京都へ」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「に＋京都へ」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「京都へ＋行き」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-019

- ID：sc-n5-019
- level：N5
- before／after：今夜、いっしょ／。
- chunks及ID：a:に；c:を見；b:映画；d:ませんか
- correctOrder：a → b → c → d
- completeSentence：今夜、いっしょに映画を見ませんか。
- grammarIds：n5-grammar-036, n5-grammar-003
- starSlot：2
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：今夜、いっしょにを見映画ませんか。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「に映画を見ませんか」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「に」後應緊接「映画」，此排列改接「を見」，固定接續／語序被切斷；正解必要相鄰片段「に＋映画」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「映画＋を見」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-020

- ID：sc-n5-020
- level：N5
- before／after：妹／。
- chunks及ID：a:に；b:新しい本を；d:あげました；c:貸して
- correctOrder：a → b → c → d
- completeSentence：妹に新しい本を貸してあげました。
- grammarIds：n5-grammar-213
- starSlot：3
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：妹に新しい本をあげました貸して。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「に新しい本を貸してあげました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「新しい本を」後應緊接「貸して」，此排列改接「あげました」，固定接續／語序被切斷；正解必要相鄰片段「新しい本を＋貸して」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「貸して＋あげました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-013

- ID：sc-n4-013
- level：N4
- before／after：学生／。
- chunks及ID：a:は；b:宿題を；c:出さなければ；d:ならない
- correctOrder：a → b → c → d
- completeSentence：学生は宿題を出さなければならない。
- grammarIds：n4-grammar-059
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：学生は宿題をならない出さなければ。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「は宿題を出さなければならない」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「宿題を」後應緊接「出さなければ」，此排列改接「ならない」，固定接續／語序被切斷；正解必要相鄰片段「宿題を＋出さなければ」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「出さなければ＋ならない」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-014

- ID：sc-n4-014
- level：N4
- before／after：明日、学校／。
- chunks及ID：a:へ；b:行か；c:なくても；d:いいです
- correctOrder：a → b → c → d
- completeSentence：明日、学校へ行かなくてもいいです。
- grammarIds：n4-grammar-062, n5-grammar-005
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：明日、学校へ行かいいですなくても。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「へ行かなくてもいいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「行か」後應緊接「なくても」，此排列改接「いいです」，固定接續／語序被切斷；正解必要相鄰片段「行か＋なくても」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「なくても＋いいです」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-015

- ID：sc-n4-015
- level：N4
- before／after：館内／。
- chunks及ID：a:で；b:写真を；c:撮っては；d:いけません
- correctOrder：a → b → c → d
- completeSentence：館内で写真を撮ってはいけません。
- grammarIds：n4-grammar-065, n5-grammar-007
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：館内で写真をいけません撮っては。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「で写真を撮ってはいけません」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「写真を」後應緊接「撮っては」，此排列改接「いけません」，固定接續／語序被切斷；正解必要相鄰片段「写真を＋撮っては」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「撮っては＋いけません」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-016

- ID：sc-n4-016
- level：N4
- before／after：兄／。
- chunks及ID：a:は；b:富士山に；c:登ったことが；d:あります
- correctOrder：a → b → c → d
- completeSentence：兄は富士山に登ったことがあります。
- grammarIds：n4-grammar-066
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：兄は富士山にあります登ったことが。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「は富士山に登ったことがあります」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「富士山に」後應緊接「登ったことが」，此排列改接「あります」，固定接續／語序被切斷；正解必要相鄰片段「富士山に＋登ったことが」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「登ったことが＋あります」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-017

- ID：sc-n4-017
- level：N4
- before／after：友だち／。
- chunks及ID：b:会うために；a:に；c:駅へ；d:行きます
- correctOrder：a → b → c → d
- completeSentence：友だちに会うために駅へ行きます。
- grammarIds：n4-grammar-104, n5-grammar-005
- starSlot：0
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：友だち会うためにに駅へ行きます。（order: b → a → c → d）
- 具體文法判定：正解需依序形成「に会うために駅へ行きます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「に」以承接 before「友だち」，但此排列先接「会うために」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「に＋会うために」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「会うために＋駅へ」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-018

- ID：sc-n4-018
- level：N4
- before／after：弟／。
- chunks及ID：a:は；c:乗れるように；b:自転車に；d:なりました
- correctOrder：a → b → c → d
- completeSentence：弟は自転車に乗れるようになりました。
- grammarIds：n4-grammar-148
- starSlot：1
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：弟は乗れるように自転車になりました。（order: a → c → b → d）
- 具體文法判定：正解需依序形成「は自転車に乗れるようになりました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「は」後應緊接「自転車に」，此排列改接「乗れるように」，固定接續／語序被切斷；正解必要相鄰片段「は＋自転車に」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「自転車に＋乗れるように」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-019

- ID：sc-n4-019
- level：N4
- before／after：空／。
- chunks及ID：a:が；b:暗いので；d:です；c:雨が降りそう
- correctOrder：a → b → c → d
- completeSentence：空が暗いので雨が降りそうです。
- grammarIds：n4-grammar-075
- starSlot：2
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：空が暗いのでです雨が降りそう。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「が暗いので雨が降りそうです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「暗いので」後應緊接「雨が降りそう」，此排列改接「です」，固定接續／語序被切斷；正解必要相鄰片段「暗いので＋雨が降りそう」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「雨が降りそう＋です」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-020

- ID：sc-n4-020
- level：N4
- before／after：新しい料理／。
- chunks及ID：d:ました；a:を；b:作って；c:み
- correctOrder：a → b → c → d
- completeSentence：新しい料理を作ってみました。
- grammarIds：n4-grammar-241
- starSlot：3
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：新しい料理ましたを作ってみ。（order: d → a → b → c）
- 具體文法判定：正解需依序形成「を作ってみました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：起首應接「を」以承接 before「新しい料理」，但此排列先接「ました」，造成助詞支配或修飾起點錯位；正解必要相鄰片段「み＋ました」未相鄰，相關助詞、活用或複合句型無法形成；句尾應以「ました。」收束，但此排列以「み。」結尾，句尾活用／述語收束不成立。
- 最終結論：PASS_UNIQUE

### sc-n5-021

- ID：sc-n5-021
- level：N5
- before／after：母は台所／。
- chunks及ID：a:で；b:お茶を；c:飲んで；d:います
- correctOrder：a → b → c → d
- completeSentence：母は台所でお茶を飲んでいます。
- grammarIds：n5-grammar-042
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：母は台所でお茶をいます飲んで。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「でお茶を飲んでいます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「お茶を」後應緊接「飲んで」，此排列改接「います」，固定接續／語序被切斷；正解必要相鄰片段「お茶を＋飲んで」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「飲んで＋います」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-022

- ID：sc-n5-022
- level：N5
- before／after：弟は毎晩九時／。
- chunks及ID：a:に；b:寝；c:ます；d:よ
- correctOrder：a → b → c → d
- completeSentence：弟は毎晩九時に寝ますよ。
- grammarIds：n5-grammar-004
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：弟は毎晩九時に寝よます。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「に寝ますよ」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「寝」後應緊接「ます」，此排列改接「よ」，固定接續／語序被切斷；正解必要相鄰片段「寝＋ます」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「ます＋よ」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-023

- ID：sc-n5-023
- level：N5
- before／after：わたしはスーパー／。
- chunks及ID：a:で；b:パンを；c:二つ買い；d:ました
- correctOrder：a → b → c → d
- completeSentence：わたしはスーパーでパンを二つ買いました。
- grammarIds：n5-grammar-003
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：わたしはスーパーでパンをました二つ買い。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「でパンを二つ買いました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「パンを」後應緊接「二つ買い」，此排列改接「ました」，固定接續／語序被切斷；正解必要相鄰片段「パンを＋二つ買い」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「二つ買い＋ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-024

- ID：sc-n5-024
- level：N5
- before／after：このかばん／。
- chunks及ID：a:は；b:とても軽；c:い；d:です
- correctOrder：a → b → c → d
- completeSentence：このかばんはとても軽いです。
- grammarIds：n5-grammar-023
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：このかばんはとても軽ですい。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「はとても軽いです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「とても軽」後應緊接「い」，此排列改接「です」，固定接續／語序被切斷；正解必要相鄰片段「とても軽＋い」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「い＋です」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-025

- ID：sc-n5-025
- level：N5
- before／after：駅の前に／。
- chunks及ID：a:大きい；b:バス；c:が；d:来ました
- correctOrder：a → b → c → d
- completeSentence：駅の前に大きいバスが来ました。
- grammarIds：n5-grammar-002
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：駅の前に大きいバス来ましたが。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「大きいバスが来ました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「バス」後應緊接「が」，此排列改接「来ました」，固定接續／語序被切斷；正解必要相鄰片段「バス＋が」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「が＋来ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-026

- ID：sc-n5-026
- level：N5
- before／after：日曜日は家／。
- chunks及ID：a:で；b:音楽を；c:聞き；d:ます
- correctOrder：a → b → c → d
- completeSentence：日曜日は家で音楽を聞きます。
- grammarIds：n5-grammar-007
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：日曜日は家で音楽をます聞き。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「で音楽を聞きます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「音楽を」後應緊接「聞き」，此排列改接「ます」，固定接續／語序被切斷；正解必要相鄰片段「音楽を＋聞き」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「聞き＋ます」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-027

- ID：sc-n5-027
- level：N5
- before／after：先生は黒板／。
- chunks及ID：a:に；b:漢字を；c:書いて；d:います
- correctOrder：a → b → c → d
- completeSentence：先生は黒板に漢字を書いています。
- grammarIds：n5-grammar-042
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：先生は黒板に漢字をいます書いて。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「に漢字を書いています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「漢字を」後應緊接「書いて」，此排列改接「います」，固定接續／語序被切斷；正解必要相鄰片段「漢字を＋書いて」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「書いて＋います」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-028

- ID：sc-n5-028
- level：N5
- before／after：きのう友だちと公園／。
- chunks及ID：a:で；b:サッカー；c:をし；d:ました
- correctOrder：a → b → c → d
- completeSentence：きのう友だちと公園でサッカーをしました。
- grammarIds：n5-grammar-010
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：きのう友だちと公園でサッカーましたをし。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「でサッカーをしました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「サッカー」後應緊接「をし」，此排列改接「ました」，固定接續／語序被切斷；正解必要相鄰片段「サッカー＋をし」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「をし＋ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-029

- ID：sc-n5-029
- level：N5
- before／after：あした雨／。
- chunks及ID：a:が；b:降りますから；c:出かけ；d:ません
- correctOrder：a → b → c → d
- completeSentence：あした雨が降りますから出かけません。
- grammarIds：n5-grammar-045, n5-grammar-032
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：あした雨が降りますからません出かけ。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「が降りますから出かけません」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「降りますから」後應緊接「出かけ」，此排列改接「ません」，固定接續／語序被切斷；正解必要相鄰片段「降りますから＋出かけ」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「出かけ＋ません」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n5-030

- ID：sc-n5-030
- level：N5
- before／after：妹は／。
- chunks及ID：a:新しい；b:靴を；c:ほし；d:がっています
- correctOrder：a → b → c → d
- completeSentence：妹は新しい靴をほしがっています。
- grammarIds：n5-grammar-038
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：妹は新しい靴をがっていますほし。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「新しい靴をほしがっています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「靴を」後應緊接「ほし」，此排列改接「がっています」，固定接續／語序被切斷；正解必要相鄰片段「靴を＋ほし」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「ほし＋がっています」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-021

- ID：sc-n4-021
- level：N4
- before／after：妹は／。
- chunks及ID：a:熱が；b:ある；c:らしい；d:です
- correctOrder：a → b → c → d
- completeSentence：妹は熱があるらしいです。
- grammarIds：n4-grammar-079
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：妹は熱があるですらしい。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「熱があるらしいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「ある」後應緊接「らしい」，此排列改接「です」，固定接續／語序被切斷；正解必要相鄰片段「ある＋らしい」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「らしい＋です」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-022

- ID：sc-n4-022
- level：N4
- before／after：この箱は一人／。
- chunks及ID：a:で；b:持つには；c:重すぎ；d:ます
- correctOrder：a → b → c → d
- completeSentence：この箱は一人で持つには重すぎます。
- grammarIds：n4-grammar-120
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この箱は一人で持つにはます重すぎ。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「で持つには重すぎます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「持つには」後應緊接「重すぎ」，此排列改接「ます」，固定接續／語序被切斷；正解必要相鄰片段「持つには＋重すぎ」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「重すぎ＋ます」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-023

- ID：sc-n4-023
- level：N4
- before／after：このペンは／。
- chunks及ID：a:字が；b:書き；c:やすい；d:です
- correctOrder：a → b → c → d
- completeSentence：このペンは字が書きやすいです。
- grammarIds：n4-grammar-123
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：このペンは字が書きですやすい。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「字が書きやすいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「書き」後應緊接「やすい」，此排列改接「です」，固定接續／語序被切斷；正解必要相鄰片段「書き＋やすい」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「やすい＋です」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-024

- ID：sc-n4-024
- level：N4
- before／after：この説明は／。
- chunks及ID：a:字が；b:小さくて；c:読み；d:にくいです
- correctOrder：a → b → c → d
- completeSentence：この説明は字が小さくて読みにくいです。
- grammarIds：n4-grammar-124
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この説明は字が小さくてにくいです読み。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「字が小さくて読みにくいです」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「小さくて」後應緊接「読み」，此排列改接「にくいです」，固定接續／語序被切斷；正解必要相鄰片段「小さくて＋読み」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「読み＋にくいです」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-025

- ID：sc-n4-025
- level：N4
- before／after：子どもが／。
- chunks及ID：a:急に；b:泣き；c:始め；d:ました
- correctOrder：a → b → c → d
- completeSentence：子どもが急に泣き始めました。
- grammarIds：n4-grammar-051
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：子どもが急に泣きました始め。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「急に泣き始めました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「泣き」後應緊接「始め」，此排列改接「ました」，固定接續／語序被切斷；正解必要相鄰片段「泣き＋始め」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「始め＋ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-026

- ID：sc-n4-026
- level：N4
- before／after：レポートを／。
- chunks及ID：a:全部；b:書き；c:終わり；d:ました
- correctOrder：a → b → c → d
- completeSentence：レポートを全部書き終わりました。
- grammarIds：n4-grammar-058
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：レポートを全部書きました終わり。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「全部書き終わりました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「書き」後應緊接「終わり」，此排列改接「ました」，固定接續／語序被切斷；正解必要相鄰片段「書き＋終わり」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「終わり＋ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-027

- ID：sc-n4-027
- level：N4
- before／after：大切な書類を／。
- chunks及ID：a:電車に；b:忘れて；c:しまい；d:ました
- correctOrder：a → b → c → d
- completeSentence：大切な書類を電車に忘れてしまいました。
- grammarIds：n4-grammar-054
- starSlot：0
- 正確選項位置：1
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：大切な書類を電車に忘れてましたしまい。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「電車に忘れてしまいました」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「忘れて」後應緊接「しまい」，此排列改接「ました」，固定接續／語序被切斷；正解必要相鄰片段「忘れて＋しまい」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「しまい＋ました」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-028

- ID：sc-n4-028
- level：N4
- before／after：この店では／。
- chunks及ID：a:カードで；b:払う；c:ことが；d:できます
- correctOrder：a → b → c → d
- completeSentence：この店ではカードで払うことができます。
- grammarIds：n4-grammar-121
- starSlot：1
- 正確選項位置：2
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：この店ではカードで払うできますことが。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「カードで払うことができます」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「払う」後應緊接「ことが」，此排列改接「できます」，固定接續／語序被切斷；正解必要相鄰片段「払う＋ことが」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「ことが＋できます」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-029

- ID：sc-n4-029
- level：N4
- before／after：健康のために毎日／。
- chunks及ID：a:野菜を；b:食べる；c:ように；d:しています
- correctOrder：a → b → c → d
- completeSentence：健康のために毎日野菜を食べるようにしています。
- grammarIds：n4-grammar-109
- starSlot：2
- 正確選項位置：3
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：健康のために毎日野菜を食べるしていますように。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「野菜を食べるようにしています」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「食べる」後應緊接「ように」，此排列改接「しています」，固定接續／語序被切斷；正解必要相鄰片段「食べる＋ように」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「ように＋しています」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

### sc-n4-030

- ID：sc-n4-030
- level：N4
- before／after：地震の／。
- chunks及ID：a:場合は；b:すぐに外へ；c:出て；d:ください
- correctOrder：a → b → c → d
- completeSentence：地震の場合はすぐに外へ出てください。
- grammarIds：n4-grammar-166
- starSlot：3
- 正確選項位置：4
- 24種排列檢查完成狀態：24/24 completed；詳見 permutations JSON。
- VALID_EXPECTED數量：1
- VALID_ALTERNATE數量：0
- 最容易誤排的排列：地震の場合はすぐに外へください出て。（order: a → b → d → c）
- 具體文法判定：正解需依序形成「場合はすぐに外へ出てください」；其他排列逐筆以助詞支配、活用、固定接續、語序或句尾收束問題判為 INVALID_GRAMMAR。代表性理由：「すぐに外へ」後應緊接「出て」，此排列改接「ください」，固定接續／語序被切斷；正解必要相鄰片段「すぐに外へ＋出て」未相鄰，相關助詞、活用或複合句型無法形成；正解必要相鄰片段「出て＋ください」未相鄰，相關助詞、活用或複合句型無法形成。
- 最終結論：PASS_UNIQUE

