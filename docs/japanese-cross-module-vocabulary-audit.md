# Batch 11：日文跨模組單字覆蓋率盤點（精簡報告）

## Summary
本報告由 `scripts/audit-japanese-cross-module-vocabulary.js` 產生；僅盤點白名單日文欄位中的可靠 lexical token，未修改正式資料。

## 修正前問題摘要
上一版遞迴掃描所有字串且用完整漢字 Unicode 範圍判斷日文，導致中文教學說明、分類名稱與句子殘片被誤列為 missing-candidate 或 compound。本版改用欄位白名單、`Intl.Segmenter('ja', { granularity: 'word' })` 與防呆檢查。

## 欄位白名單
- 文法：grammar、kana、example、exampleKana、quiz.clozePrompt、quiz.clozePromptKana、quiz.choices（日文）、quiz.answer、similar、structure 中可明確識別的日文形式。
- 閱讀：title、titleRuby、passage、passageKana、passageRuby、vocabulary.word/kana、rubyTerms.text/reading、日文問題與日文選項。
- 聽力：japanese、kana、確定為日文的 question/options/解析欄位。

## 使用的斷詞方式
Node Intl.Segmenter 支援狀態：支援。主要使用 `Intl.Segmenter` 的 word-like token；明確詞條欄位直接作為候選 token。未使用外部 API 或大型第三方套件。

## 方法限制
`Intl.Segmenter` 並非完整日語形態分析器，部分活用、同音詞、複合詞仍需人工確認。coverage 分母只包含可靠 lexical token，排除中文欄位、metadata、grammar-element、proper-noun、punctuation、pure number、unsegmented span 與無法確認的句子殘片。

## 各模組資料數量
- 文法項目數：290
- 文法題目數：130
- 閱讀文章數：105
- 閱讀問題數：150
- 聽力題目數：100

## 各模組可靠 lexical token 與基本形數量
- 文法獨立基本形數量：975
- 閱讀獨立基本形數量：764
- 聽力獨立基本形數量：175
- 跨模組去重後基本形總數：1503

## Exact／Normalized／Review-adjusted coverage
| 模組 | Reliable lexical tokens | Exact | Normalized | Review-adjusted |
|---|---:|---:|---:|---:|
| grammar | 4189 | 1250/4189 (29.8%) | 1298/4189 (31.0%) | 3418/4189 (81.6%) |
| reading | 10977 | 6007/10977 (54.7%) | 6009/10977 (54.7%) | 10246/10977 (93.3%) |
| listening | 533 | 228/533 (42.8%) | 228/533 (42.8%) | 512/533 (96.1%) |
| overall | 15699 | 7485/15699 (47.7%) | 7535/15699 (48.0%) | 14176/15699 (90.3%) |

## Missing candidates
去重後 missing-candidate 數量：180；下表列前 120 項。

| 建議基本形 | 假名 | 詞性 | 中文意思 | JLPT 程度 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 信心 | 備註 |
|---|---|---|---|---|---|---:|---|---|---|---|
| メモ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 34 | n4-grammar-105, jp-reading-set-n4-024, jp-reading-set-n4-033 | 忘れないように、メモを書きます。 | 中 | 來自segmenter token |
| スーパー | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 27 | n4-grammar-100, jp-reading-set-n4-017, jp-reading-q-n4-017-01 | スーパーで野菜や果物などを買いました。 | 中 | 來自segmenter token |
| 時半 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading, listening | 20 | jp-reading-set-n4-002, jp-reading-q-n4-002-01, jp-reading-q-n4-019-01 | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が取れるので、二人は遅い回にしました。 | 中 | 來自segmenter token |
| スマホ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 19 | jp-reading-set-n4-005, jp-reading-q-n4-005-01, jp-reading-set-n4-021 | スマホの音 | 中 | 來自segmenter token |
| センター | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 19 | jp-reading-set-n4-020, jp-reading-q-n4-020-01, jp-reading-set-n4-066 | 運動センター | 中 | 來自segmenter token |
| 誕生 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 15 | jp-reading-set-n4-004, jp-reading-set-n4-058, jp-reading-q-n4-058-01 | 誕生日のプレゼント | 中 | 來自segmenter token |
| 朝食 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 14 | jp-reading-set-n4-007, jp-reading-q-n4-007-01, jp-reading-set-n4-029 | 旅館の朝食券 | 中 | 來自segmenter token |
| お知らせ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 13 | jp-reading-set-n4-006, jp-reading-q-n4-006-01, jp-reading-set-n4-026 | 町内会のお知らせです。来週だけ、燃えるごみの収集日は火曜日ではなく水曜日になります。朝八時までに、いつもの場所へ出してください。雨の場合も集めます。 | 中 | 來自segmenter token |
| メール | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 13 | jp-reading-set-n4-042, jp-reading-set-n4-095, jp-reading-q-n4-095-01 | レストランから予約確認のメールが来ました。人数を変える場合は、前日の午後五時までに連絡しなければなりません。当日の変更はできません。 | 中 | 來自segmenter token |
| 何時 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading, listening | 13 | n5-grammar-224, n5-grammar-225, n5-grammar-226 | 何時 | 中 | 來自segmenter token |
| カフェ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 12 | jp-reading-set-n4-070, jp-reading-q-n4-070-01, jp-reading-set-n4-091 | カフェの営業時間 | 中 | 來自segmenter token |
| チェックイン | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading, listening | 12 | jp-reading-set-n4-029, jp-reading-set-n4-048, jp-reading-set-n4-086 | チェックインは午後三時からです。早く着いたお客様は、受付で荷物を預けることができます。朝食は二階で七時から九時までです。部屋の鍵をなくしたときは、すぐ受付に知ら | 中 | 來自segmenter token |
| カレー | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 10 | jp-reading-set-n4-033, jp-reading-q-n4-033-01, jp-reading-set-n4-074 | 学校から帰ると、テーブルに母のメモがありました。『カレーは鍋の中です。温めて食べてください。七時ごろ帰ります。』私はお腹がすいていたので、手を洗ってから台所へ行 | 中 | 來自segmenter token |
| クラス | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 10 | n5-grammar-049, jp-reading-set-n4-016, jp-reading-set-n4-021 | クラスで山田さんがいちばん元気です。 | 中 | 來自segmenter token |
| 開店 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 10 | jp-reading-set-n4-012, jp-reading-q-n4-012-01, jp-reading-set-n4-044 | 駅前のパン屋は、来月から日曜日だけ開店時間が一時間遅くなります。平日は今まで通り朝七時からです。急いでいる人は前の日に買っておくとよさそうです。 | 中 | 來自segmenter token |
| 公民館 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 9 | jp-reading-set-n4-009, jp-reading-q-n4-009-01, jp-reading-q-n4-011-01 | 公民館の料理教室では、土曜日に春の弁当を作ります。参加したい人は、木曜日までに名前と電話番号を書いて申し込んでください。材料費は八百円です。 | 中 | 來自segmenter token |
| 返却 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 9 | jp-reading-set-n4-026, jp-reading-q-n4-026-01, jp-reading-q-n4-026-02 | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れないで、次の日以降に受付へ持って来てくださ | 中 | 來自segmenter token |
| エプロン | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 8 | jp-reading-set-n4-062, jp-reading-q-n4-062-02, jp-reading-set-n4-089 | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持って来る必要はありませんが、エプロンは各 | 中 | 來自segmenter token |
| ヨガ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 8 | jp-reading-set-n4-066, jp-reading-q-n4-066-02, jp-reading-set-n4-103 | 運動センターを初めて使う人は、受付で名前と住所を書いてください。プールは予約しなくてもいいですが、ヨガ教室は前の日までに予約が必要です。タオルは借りられません。 | 中 | 來自segmenter token |
| 期末 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 8 | jp-reading-set-n4-037, jp-reading-set-n4-096 | 期末試験の計画 | 中 | 來自segmenter token |
| 整理 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 8 | jp-reading-set-n4-026, jp-reading-set-n4-101, jp-reading-q-n4-101-02 | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れないで、次の日以降に受付へ持って来てくださ | 中 | 來自segmenter token |
| ジム | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 7 | jp-reading-set-n4-020, jp-reading-q-n4-020-01 | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着を忘れてしまったので、プールではなくジム | 中 | 來自segmenter token |
| 時刻 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 7 | jp-reading-set-n4-050, jp-reading-set-n4-102, jp-reading-q-n4-102-01 | 映画館の時刻 | 中 | 來自segmenter token |
| 週間 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 7 | jp-reading-set-n4-040, jp-reading-set-n4-063, jp-reading-set-n4-069 | 佐藤さんは図書館で料理の本を借りました。二週間借りることができますが、旅行に行くので、来週返すつもりです。 | 中 | 來自segmenter token |
| 変更 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 7 | jp-reading-set-n4-006, jp-reading-set-n4-042, jp-reading-set-n4-102 | ごみ収集日の変更 | 中 | 來自segmenter token |
| インターネット | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-028, jp-reading-set-n4-045 | この映画館では、水曜日の午後六時までの回は学生料金が安くなります。学生証を見せなければなりません。インターネットで席を予約した人も、入口で学生証を見せてください | 中 | 來自segmenter token |
| ケーキ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-075, jp-reading-q-n4-003-01, jp-reading-set-n4-091 | このケーキはおいしそうです。 | 中 | 來自segmenter token |
| 自習 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 6 | jp-reading-set-n4-060, jp-reading-q-n4-060-01 | 自習室の規則 | 中 | 來自segmenter token |
| 予報 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 6 | n4-grammar-076, n4-grammar-204, jp-reading-set-n4-015 | 天気予報によると、明日は雨だそうです。 | 中 | 來自segmenter token |
| お願い | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading, listening | 5 | jp-reading-set-n4-022, jl-020, jl-083 | 鈴木さんは金曜日の夜、家族とレストランへ行きます。人気の店なので、昼休みに電話で四人分の席を予約しました。店員は「七時はいっぱいですが、七時半なら空いています」 | 中 | 來自segmenter token |
| テスト | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, listening | 5 | n4-grammar-144, n5-grammar-219, n4-grammar-272 | テスト中は話さないこと。 | 中 | 來自segmenter token |
| パック | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-044, jp-reading-q-n4-044-01 | スーパーの特売日は水曜日です。卵は一人一パックまでです。午前中に売り切れることがあります。近藤さんは開店してすぐ買いに行く予定です。 | 中 | 來自segmenter token |
| メニュー | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading, listening | 5 | jp-reading-set-n4-074, jl-067 | ジョンさんからのメッセージです。土曜日に新しいカレー屋へ行きませんか。辛い料理が苦手な人のために、甘いメニューもあるそうです。行ける場合は金曜日の夜までに返事を | 中 | 來自segmenter token |
| 携帯 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-084 | 携帯電話の故障 | 中 | 來自segmenter token |
| 交流 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-011 | 留学生交流会 | 中 | 來自segmenter token |
| 事務 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-q-n4-030-01, jp-reading-set-n4-053, jp-reading-q-n4-053-01 | 学校の事務室 | 中 | 來自segmenter token |
| 収集 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-006, jp-reading-q-n4-006-01 | ごみ収集日の変更 | 中 | 來自segmenter token |
| 水着 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-020, jp-reading-q-n4-020-02 | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着を忘れてしまったので、プールではなくジム | 中 | 來自segmenter token |
| 宅配 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-045, jp-reading-set-n4-075 | 宅配会社から不在票が入っていました。荷物を受け取るために、渡辺さんはインターネットで明日の夜七時から九時を選びました。 | 中 | 來自segmenter token |
| 置き場 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-090 | 自転車置き場 | 中 | 來自segmenter token |
| 町内 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-006, jp-reading-q-n4-006-01, jp-reading-set-n4-023 | 町内会のお知らせです。来週だけ、燃えるごみの収集日は火曜日ではなく水曜日になります。朝八時までに、いつもの場所へ出してください。雨の場合も集めます。 | 中 | 來自segmenter token |
| 発表 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-021, jp-reading-q-n4-021-01 | 林さんの日本語クラスでは、毎週金曜日に短い発表があります。今週のテーマは好きな町です。林さんは写真を見せながら話したいので、昨日スマホの写真を三枚選びました。発 | 中 | 來自segmenter token |
| 閉店 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-070, jp-reading-q-n4-070-02 | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分前まで買えます。 | 中 | 來自segmenter token |
| 留守番 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 5 | jp-reading-set-n4-094 | 留守番電話 | 中 | 來自segmenter token |
| エコバッグ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-024, jp-reading-q-n4-024-01 | 母は冷蔵庫にメモを貼りました。「卵はまだあります。牛乳とパンだけ買ってください。大きいジュースは、安くても買わなくていいです。」弟はメモを読んで、財布とエコバッ | 中 | 來自segmenter token |
| おう | おう | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-017, jp-reading-set-n4-038, jp-reading-set-n4-078 | おう | 中 | 來自explicit field |
| シール | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-090, jp-reading-q-n4-090-01 | 学校の自転車置き場は朝七時から夜九時まで使えます。名前のシールがない自転車は、入口の近くに置いてはいけません。 | 中 | 來自segmenter token |
| テーマ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-021, jp-reading-q-n4-021-01 | 林さんの日本語クラスでは、毎週金曜日に短い発表があります。今週のテーマは好きな町です。林さんは写真を見せながら話したいので、昨日スマホの写真を三枚選びました。発 | 中 | 來自segmenter token |
| ネット | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-104, jp-reading-q-n4-104-02 | 映画館の午前の回は千円で見ることができます。切符はネットで買ってもいいですが、始まる十分前までに来なければなりません。 | 中 | 來自segmenter token |
| バス停 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading, listening | 4 | jp-reading-set-n4-008, jp-reading-q-n4-008-01, jl-033 | 駅の東出口は工事のため、今月いっぱい使うことができません。バス停へ行く人は、西出口を出て右へ曲がってください。いつもより五分ぐらいかかるかもしれません。 | 中 | 來自segmenter token |
| フラッシュ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-093, jp-reading-q-n4-093-01 | 町の博物館は今月、学生は無料で入れます。写真を撮ってもいいですが、フラッシュを使ってはいけません。 | 中 | 來自segmenter token |
| プリント | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-095, jp-reading-q-n4-095-01 | 先生からメールが来ました。明日の授業で使うプリントを忘れた学生が多かったので、今夜かばんに入れておくようにと書いてありました。 | 中 | 來自segmenter token |
| ポスト | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-058, jp-reading-q-n4-058-01 | 誕生日の手紙を書いたあとで、伊藤さんは封筒に切手を貼りました。明日の朝ポストに入れれば、週末までに友だちへ届くそうです。 | 中 | 來自segmenter token |
| マリア | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-013, jp-reading-q-n4-013-01 | マリアさんは国にいる家族へ電話したかったのですが、時差を忘れて夜中にかけてしまいました。次からは、電話する前に向こうの時間を確認しようと思っています。 | 中 | 來自segmenter token |
| レジ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-063, jp-reading-q-n4-063-01 | 店長のメモです。今週は新しい店員が入るので、火曜日の開店前にレジの使い方を説明してください。昼は客が多すぎるかもしれないため、質問はノートに書いておくと分かりや | 中 | 來自segmenter token |
| 営業 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-012, jp-reading-set-n4-070 | 店の営業時間 | 中 | 來自segmenter token |
| 各駅 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-046, jp-reading-q-n4-046-01 | 初めて行く会場なので、小林さんは駅で乗り換え方を調べました。急行に乗ると早いですが、会場の近くの駅には止まらないので、各駅停車に乗ります。 | 中 | 來自segmenter token |
| 使い方 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-q-n4-043-01, jp-reading-set-n4-063, jp-reading-q-n4-063-01 | コピー機の使い方が分からない場合、どうしてもいいですか。 | 中 | 來自segmenter token |
| 前田 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-057, jp-reading-q-n4-057-01 | 前田さんは引っ越したあとで、管理人に新しい住所を書いた紙を渡しました。郵便物が前の部屋へ届くと困るので、郵便局にも知らせます。 | 中 | 來自segmenter token |
| 茶道 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-030, jp-reading-q-n4-030-01, jp-reading-q-n4-030-02 | 来月から公民館で茶道教室が始まります。毎週土曜日の午前十時から一時間です。初めての人も参加できます。申し込みは電話ではなく、公民館の受付で名前を書いてください。 | 中 | 來自segmenter token |
| 中央公園 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-047, jp-reading-q-n4-047-01 | 雨で道路が混んでいるため、五番バスは市役所前を通りません。図書館へ行く人は、中央公園で降りて十分歩いてください。 | 中 | 來自segmenter token |
| 停車 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-046, jp-reading-q-n4-046-01 | 初めて行く会場なので、小林さんは駅で乗り換え方を調べました。急行に乗ると早いですが、会場の近くの駅には止まらないので、各駅停車に乗ります。 | 中 | 來自segmenter token |
| 当日 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 4 | jp-reading-set-n4-042, jp-reading-q-n4-042-01 | レストランから予約確認のメールが来ました。人数を変える場合は、前日の午後五時までに連絡しなければなりません。当日の変更はできません。 | 中 | 來自segmenter token |
| 曜日 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar, reading | 4 | n5-grammar-225, jp-reading-q-n4-103-01 | 何曜日 | 中 | 來自segmenter token |
| お寺 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-018, jp-reading-q-n4-018-02 | 田中さんたちは春休みに京都へ行く予定です。最初は日帰りで行こうと思っていましたが、見たい場所が多いので、一泊することにしました。ホテルは駅の近くにしました。朝早 | 中 | 來自segmenter token |
| クラスメート | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-083 | クラスメートは文化祭でカレーを作ることにしました。野菜を切る人が足りないので、李さんも手伝う予定です。 | 中 | 來自segmenter token |
| ごろ | ごろ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 3 | n5-grammar-228, n5-grammar-229 | ごろ | 中 | 來自explicit field |
| コンビニ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-043 | コンビニのコピー機は、写真を印刷するとき先に画面でサイズを選びます。分からない場合は、店員に聞いてもいいですが、混んでいる時間は少し待ちます。 | 中 | 來自segmenter token |
| のに | のに | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 3 | n4-grammar-108 | のに | 中 | 來自explicit field |
| べつ | べつ | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-035, jp-reading-set-n4-052 | べつ | 中 | 來自explicit field |
| メッセージ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-074 | ジョンさんからのメッセージです。土曜日に新しいカレー屋へ行きませんか。辛い料理が苦手な人のために、甘いメニューもあるそうです。行ける場合は金曜日の夜までに返事を | 中 | 來自segmenter token |
| ランチ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-070 | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分前まで買えます。 | 中 | 來自segmenter token |
| 以降 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-026, jp-reading-q-n4-026-02 | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れないで、次の日以降に受付へ持って来てくださ | 中 | 來自segmenter token |
| 屋内 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-065, jp-reading-q-n4-065-02 | 旅行メモ：午前九時に京都駅で集合。十時に博物館、昼は駅近くの店で定食を食べる。午後は雨の場合、寺ではなく屋内の市場へ行く予定です。切符は父が買っておきます。 | 中 | 來自segmenter token |
| 何月何日 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 3 | n5-grammar-226 | 何月何日 | 中 | 來自segmenter token |
| 学習 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-067, jp-reading-q-n4-067-01 | 市立図書館では、今月から学習室の席を予約できます。予約は一人一日二時間までです。飲み物はふたがある物なら持ち込んでもいいですが、席で食事はできません。 | 中 | 來自segmenter token |
| 時差 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-013 | マリアさんは国にいる家族へ電話したかったのですが、時差を忘れて夜中にかけてしまいました。次からは、電話する前に向こうの時間を確認しようと思っています。 | 中 | 來自segmenter token |
| 次回 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-020, jp-reading-q-n4-020-02 | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着を忘れてしまったので、プールではなくジム | 中 | 來自segmenter token |
| 職員 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-031, jp-reading-q-n4-031-01 | 授業が終わったあと、教室に一人だけ学生が残っていました。机の上には消しゴムとノートがあり、窓は開いたままでした。学生は『田中さんの物かもしれない』と思い、職員室 | 中 | 來自segmenter token |
| 中止 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-023, jp-reading-q-n4-023-02 | 日曜日の朝、町内で公園の掃除があります。参加する人は軍手を持って、八時五十分までに公園の入口に集まります。雨が強いときは中止ですが、小雨なら行います。終わったあ | 中 | 來自segmenter token |
| 入力 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-075, jp-reading-q-n4-075-01 | 宅配会社からのお知らせです。今日届ける予定だった荷物は、雪で道路が混んでいるため、明日の午前中に届く予定です。時間を変えたい場合は、番号を入力して手続きしてくだ | 中 | 來自segmenter token |
| 筆者 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-q-n4-061-01, jp-reading-q-n4-061-02, jp-reading-q-n4-064-01 | はじめ、筆者は何に困っていましたか。 | 中 | 來自segmenter token |
| 不在 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 3 | jp-reading-set-n4-045 | 宅配会社から不在票が入っていました。荷物を受け取るために、渡辺さんはインターネットで明日の夜七時から九時を選びました。 | 中 | 來自segmenter token |
| イベント | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-019 | 図書館イベント | 中 | 來自segmenter token |
| ゲーム | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n4-grammar-071, n4-grammar-255 | 弟は新しいゲームを買いたがっています。 | 中 | 來自segmenter token |
| コンビニコピー | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-043 | コンビニコピー | 中 | 來自segmenter token |
| ずに | ずに | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n4-grammar-246 | ずに | 中 | 來自explicit field |
| た形 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n5-grammar-033, n5-grammar-039 | た形 | 中 | 來自explicit field |
| パン＿＿ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n5-grammar-009, n5-grammar-235 | パン＿＿卵を食べます。 | 中 | 來自segmenter token |
| みか | みか | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-032 | みか | 中 | 來自explicit field |
| やら | やら | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n4-grammar-177 | やら | 中 | 來自explicit field |
| ゆみ | ゆみ | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-002 | ゆみ | 中 | 來自explicit field |
| ラーメン | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 2 | jl-020 | ラーメンを一つお願いします。 | 中 | 來自segmenter token |
| ルール | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-105 | ごみ出しのルール | 中 | 來自segmenter token |
| レシート | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | listening | 2 | jl-057 | レシートをください。 | 中 | 來自segmenter token |
| 岡田 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-071 | 受付の人から岡田さんへ伝言です。明日の歯医者の予約は午前十時から十時半に変わりました。都合が悪い場合は、今日の五時までに電話してください。 | 中 | 來自segmenter token |
| 計算 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-016 | 来週の学校祭で、私のクラスは焼きそばを売ります。昨日、みんなで役割を決めました。私はお金を集める係になりましたが、計算が苦手なので、佐藤さんと二人でやることにな | 中 | 來自segmenter token |
| 合格 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n4-grammar-181, n4-grammar-285 | 試験に合格しますように。 | 中 | 來自segmenter token |
| 三組 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-062 | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持って来る必要はありませんが、エプロンは各 | 中 | 來自segmenter token |
| 市立 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-067 | 市立図書館では、今月から学習室の席を予約できます。予約は一人一日二時間までです。飲み物はふたがある物なら持ち込んでもいいですが、席で食事はできません。 | 中 | 來自segmenter token |
| 持ち込む | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-q-n4-060-01, jp-reading-q-n4-103-02 | 飲み物を持ち込むこと | 中 | 來自segmenter token |
| 初日 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-003 | アルバイト初日 | 中 | 來自segmenter token |
| 消しゴム | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-031 | 授業が終わったあと、教室に一人だけ学生が残っていました。机の上には消しゴムとノートがあり、窓は開いたままでした。学生は『田中さんの物かもしれない』と思い、職員室 | 中 | 來自segmenter token |
| 申込 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-009 | 料理教室の申込 | 中 | 來自segmenter token |
| 真ん中 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-002 | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が取れるので、二人は遅い回にしました。 | 中 | 來自segmenter token |
| 調べ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-076 | 調べ | 中 | 來自explicit field |
| 店内 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-070 | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分前まで買えます。 | 中 | 來自segmenter token |
| 二年 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-062 | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持って来る必要はありませんが、エプロンは各 | 中 | 來自segmenter token |
| 配送 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 2 | jp-reading-set-n4-075 | 配送の知らせ | 中 | 來自segmenter token |
| 留学 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 2 | n4-grammar-090, n4-grammar-248 | 留学するとしたら、日本へ行きたいです。 | 中 | 來自segmenter token |
| いた | いた | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-203 | いた | 中 | 來自explicit field |
| えて | えて | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-180 | えて | 中 | 來自explicit field |
| える | える | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-165 | える | 中 | 來自explicit field |
| おく | おく | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-053 | おく | 中 | 來自explicit field |
| お客 | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 1 | jp-reading-q-n4-016-02 | お客さん | 中 | 來自segmenter token |
| きゃ | きゃ | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-138 | きゃ | 中 | 來自explicit field |
| くて | くて | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-087 | くて | 中 | 來自explicit field |
| クラス＿＿ | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n5-grammar-214 | クラス＿＿だれがいちばん元気ですか。 | 中 | 來自segmenter token |
| けしゴム | 待人工確認 | 待人工確認 | 待人工確認 | 待人工確認 | reading | 1 | jp-reading-set-n4-031 | じゅぎょうがおわったあと、きょうしつにひとりだけがくせいがのこっていました。つくえのうえにはけしゴムとノートがあり、まどはあいたままでした。がくせいは『たなかさ | 中 | 來自segmenter token |
| けど | けど | 待人工確認 | 待人工確認 | 待人工確認 | grammar | 1 | n4-grammar-197 | けど | 中 | 來自explicit field |

## Manual review
manual-review 去重項目數：664；下表最多列 200 項。

| 表面形式 | 可能基本形 | 假名 | 出現模組 | 出現次數 | 代表來源 ID | 一個代表句 | 需要確認原因 |
|---|---|---|---|---:|---|---|---|
| ま | ま | ま | grammar, reading, listening | 547 | n5-grammar-032, n5-grammar-033, n5-grammar-034 | ません | unresolved token |
| し | し | し | grammar, reading, listening | 328 | n5-grammar-004, n5-grammar-007, n5-grammar-008 | しちじにおきます。 | unresolved token |
| い | い | い | grammar, reading, listening | 261 | n5-grammar-002, n5-grammar-016, n5-grammar-020 | 雨が降っています。 | unresolved token |
| せん | せん | せん | grammar, reading, listening | 210 | n5-grammar-017, n5-grammar-028, n5-grammar-030 | ではありません | ambiguous kana-match |
| って | って | って | grammar, reading, listening | 184 | n5-grammar-002, n5-grammar-044, n4-grammar-053 | 雨が降っています。 | unresolved token |
| さい | さい | さい | grammar, reading, listening | 176 | n5-grammar-040, n5-grammar-041, n4-grammar-095 | てください | unresolved token |
| れ | れ | れ | grammar, reading, listening | 171 | n4-grammar-057, n4-grammar-059, n4-grammar-060 | かれはさんじかんべんきょうしつづけました。 | unresolved token |
| くだ | くだ | くだ | grammar, reading, listening | 164 | n5-grammar-040, n5-grammar-041, n4-grammar-095 | てください | unresolved token |
| っ | っ | っ | grammar, reading, listening | 147 | n5-grammar-005, n5-grammar-025, n5-grammar-026 | がっこうにいきます。 | unresolved token |
| く | く | く | grammar, reading, listening | 136 | n5-grammar-001, n5-grammar-021, n5-grammar-024 | わたしはがくせいです。 | unresolved token |
| け | け | け | grammar, reading, listening | 116 | n5-grammar-045, n4-grammar-057, n4-grammar-059 | 暑いですから、窓を開けます。 | unresolved token |
| き | き | き | grammar, reading, listening | 113 | n5-grammar-004, n5-grammar-008, n5-grammar-039 | 七時に起きます。 | ambiguous kana-match |
| てい | てい | てい | grammar, reading, listening | 113 | n5-grammar-023, n5-grammar-024, n5-grammar-025 | いけいようしげんざいこうてい | unresolved token |
| ば | ば | ば | grammar, reading, listening | 109 | n5-grammar-021, n5-grammar-022, n4-grammar-059 | ばしょにめいしがあります／います | unresolved token |
| なり | なり | なり | grammar, reading, listening | 108 | n4-grammar-059, n4-grammar-106, n4-grammar-129 | 明日までに宿題を出さなければなりません。 | unresolved token |
| ん | ん | ん | grammar, reading, listening | 108 | n5-grammar-007, n5-grammar-008, n5-grammar-009 | としょかんでべんきょうします。 | unresolved token |
| じ | じ | じ | grammar, reading, listening | 98 | n5-grammar-004, n5-grammar-013, n5-grammar-014 | しちじにおきます。 | unresolved token |
| あり | あり | あり | grammar, reading, listening | 85 | n5-grammar-015, n5-grammar-019, n5-grammar-021 | 机の上に本や鉛筆があります。 | unresolved token |
| ら | ら | ら | grammar, reading, listening | 85 | n5-grammar-041, n4-grammar-079, n4-grammar-083 | ここで写真を撮らないでください。 | unresolved token |
| り | り | り | grammar, reading, listening | 85 | n5-grammar-030, n5-grammar-042, n4-grammar-053 | ほてるはべんりではありませんでした。 | unresolved token |
| べ | べ | べ | grammar, reading, listening | 81 | n5-grammar-007, n5-grammar-009, n5-grammar-030 | としょかんでべんきょうします。 | unresolved token |
| いま | いま | いま | grammar, reading, listening | 80 | n5-grammar-044, n4-grammar-054, n4-grammar-064 | 宿題はまだ終わっていません。 | ambiguous kana-match |
| み | み | み | grammar, reading, listening | 79 | n5-grammar-003, n5-grammar-010, n5-grammar-023 | 水を飲みます。 | unresolved token |
| 行き | 行き | 待人工確認 | grammar, reading, listening | 68 | n5-grammar-005, n5-grammar-006, n5-grammar-008 | 学校に行きます。 | unresolved token |
| でき | でき | でき | grammar, reading, listening | 63 | n4-grammar-121, n4-grammar-149, n4-grammar-203 | 私は漢字を読むことができます。 | unresolved token |
| 来 | 来 | 待人工確認 | grammar, reading, listening | 63 | n4-grammar-092, n4-grammar-099, n5-grammar-216 | 母が駅まで迎えに来てくれました。 | unresolved token |
| ありま | ありま | ありま | grammar, reading, listening | 62 | n5-grammar-017, n5-grammar-028, n5-grammar-030 | ではありません | unresolved token |
| お | お | お | grammar, reading, listening | 61 | n5-grammar-044, n5-grammar-050, n4-grammar-058 | しゅくだいはまだおわっていません。 | unresolved token |
| ことに | ことに | ことに | grammar, reading | 58 | n4-grammar-128, n4-grammar-129, n4-grammar-250 | 〜ことにする | unresolved token |
| ですが | ですが | ですが | grammar, reading | 57 | n5-grammar-046, n4-grammar-286, n4-grammar-287 | この本は高いですが、おもしろいです。 | unresolved token |
| 見 | 見 | 待人工確認 | grammar, reading, listening | 54 | n5-grammar-010, n5-grammar-032, n5-grammar-033 | 友だちと映画を見ます。 | unresolved token |
| あ | あ | あ | grammar, reading, listening | 53 | n5-grammar-039, n4-grammar-068, n4-grammar-086 | あさごはんをたべて、がっこうへいきます。 | unresolved token |
| さ | さ | さ | grammar, reading, listening | 53 | n5-grammar-039, n4-grammar-059, n4-grammar-068 | あさごはんをたべて、がっこうへいきます。 | unresolved token |
| び | び | び | grammar, reading, listening | 51 | n5-grammar-032, n5-grammar-050, n4-grammar-110 | きょうはてれびをみません。 | unresolved token |
| せ | せ | せ | grammar, reading, listening | 49 | n5-grammar-023, n4-grammar-097, n4-grammar-099 | このみせはやすいです。 | unresolved token |
| 持 | 持 | 待人工確認 | grammar, reading | 49 | n4-grammar-173, n4-grammar-246, n4-grammar-266 | この荷物を持ってもらえませんか。 | unresolved token |
| う | う | う | grammar, reading, listening | 46 | n5-grammar-013, n5-grammar-025, n5-grammar-029 | じゅぎょうはくじからです。 | unresolved token |
| 友だち | 友だち | 待人工確認 | grammar, reading, listening | 45 | n5-grammar-010, n4-grammar-091, n4-grammar-093 | 友だちと映画を見ます。 | unresolved token |
| つ | つ | つ | grammar, reading, listening | 42 | n5-grammar-021, n4-grammar-119, n4-grammar-129 | きょうしつにがくせいがいます。 | unresolved token |
| んで | んで | んで | grammar, reading, listening | 42 | n5-grammar-007, n4-grammar-065, n4-grammar-184 | としょかんでべんきょうします。 | unresolved token |
| あと | あと | あと | grammar, reading, listening | 41 | n4-grammar-112, n4-grammar-286, jp-reading-q-n4-007-01 | あとで | unresolved token |
| ほうが | ほうが | ほうが | grammar, reading, listening | 41 | n5-grammar-048, n5-grammar-240, n4-grammar-257 | のほうが | unresolved token |
| ゃ | ゃ | ゃ | grammar, reading, listening | 40 | n5-grammar-008, n5-grammar-041, n4-grammar-054 | でんしゃでかいしゃへいきます。 | unresolved token |
| 書 | 書 | 待人工確認 | grammar, reading | 38 | n5-grammar-040, n4-grammar-052, n4-grammar-140 | ここに名前を書いてください。 | unresolved token |
| かん | かん | かん | grammar, reading, listening | 37 | n5-grammar-007, n4-grammar-084, n4-grammar-121 | としょかん＿＿べんきょうします。 | unresolved token |
| 食 | 食 | 待人工確認 | grammar, reading, listening | 37 | n5-grammar-009, n5-grammar-035, n5-grammar-039 | パンと卵を食べます。 | unresolved token |
| かい | かい | かい | grammar, reading, listening | 36 | n5-grammar-040, n4-grammar-052, n4-grammar-071 | ここになまえをかいてください。 | unresolved token |
| わ | わ | わ | grammar, reading, listening | 36 | n5-grammar-044, n4-grammar-064, n4-grammar-105 | 宿題はまだ終わっていません。 | unresolved token |
| こ | こ | こ | grammar, reading | 35 | n5-grammar-026, n5-grammar-030, n4-grammar-065 | いけいようしかこひてい | unresolved token |
| つもり | つもり | つもり | grammar, reading, listening | 34 | n4-grammar-248, jp-reading-set-n4-004, jp-reading-set-n4-017 | 〜つもりだ | unresolved token |
| 入れ | 入れ | 待人工確認 | grammar, reading | 34 | n4-grammar-088, jp-reading-set-n4-007, jp-reading-set-n4-019 | 予約しなくても入れます。 | unresolved token |
| いき | いき | いき | grammar, reading, listening | 33 | n5-grammar-005, n5-grammar-006, n5-grammar-008 | がっこうにいきます。 | unresolved token |
| こう | こう | こう | grammar, reading, listening | 33 | n5-grammar-005, n4-grammar-053, n4-grammar-106 | がっこうにいきます。 | unresolved token |
| 早く | 早く | 待人工確認 | grammar, reading, listening | 33 | n4-grammar-061, n4-grammar-097, n4-grammar-107 | 早く起きなくてはいけません。 | unresolved token |
| しょう | しょう | しょう | grammar, reading, listening | 31 | n5-grammar-035, n4-grammar-081, n4-grammar-188 | ましょう | unresolved token |
| 分 | 分 | 待人工確認 | grammar, reading | 30 | n4-grammar-130, n4-grammar-143, n4-grammar-158 | 明日行くかどうか、まだ分かりません。 | unresolved token |
| 回 | 回 | 待人工確認 | reading | 28 | jp-reading-set-n4-002, jp-reading-q-n4-002-01, jp-reading-set-n4-028 | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が取れるので、二人は遅い回にしました。 | unresolved token |
| ひ | ひ | ひ | grammar, reading | 27 | n5-grammar-024, n5-grammar-026, n5-grammar-028 | いけいようしひてい | ambiguous kana-match |
| 言 | 言 | 待人工確認 | grammar, reading, listening | 27 | n4-grammar-198, n4-grammar-201, n4-grammar-267 | 彼は知っていながら、何も言いませんでした。 | unresolved token |
| 出 | 出 | 待人工確認 | grammar, reading, listening | 27 | n5-grammar-038, n4-grammar-056, n4-grammar-059 | 今日は外へ出たくないです。 | unresolved token |
| おき | おき | おき | grammar, reading, listening | 26 | n5-grammar-004, n4-grammar-053, n4-grammar-061 | しちじにおきます。 | unresolved token |
| ず | ず | ず | grammar, reading, listening | 26 | n5-grammar-003, n5-grammar-026, n4-grammar-108 | みずをのみます。 | unresolved token |
| おく | おく | おく | grammar, reading, listening | 25 | n4-grammar-053, n4-grammar-064, n4-grammar-168 | 〜ておく | unresolved token |
| ほしい | ほしい | ほしい | grammar, reading | 25 | n4-grammar-072, n4-grammar-073, n4-grammar-159 | 〜ほしい | unresolved token |
| 買 | 買 | 待人工確認 | grammar, reading | 25 | n4-grammar-053, n4-grammar-263, jp-reading-set-n4-012 | 旅行の前に切符を買っておきます。 | unresolved token |
| しょ | しょ | しょ | grammar, reading, listening | 24 | n5-grammar-007, n5-grammar-021, n5-grammar-022 | としょかんでべんきょうします。 | unresolved token |
| 時 | 時 | 待人工確認 | grammar, reading, listening | 24 | n4-grammar-134, n4-grammar-152, n5-grammar-227 | 家を出ようとした時、電話が鳴りました。 | unresolved token |
| 時に | 時に | 待人工確認 | grammar, reading, listening | 24 | n5-grammar-004, n4-grammar-249, jp-reading-set-n4-010 | 七時に起きます。 | unresolved token |
| ど | ど | ど | grammar, reading, listening | 23 | n5-grammar-045, n4-grammar-086, n4-grammar-172 | あついですから、まどをあけます。 | unresolved token |
| びん | びん | びん | grammar, reading, listening | 23 | n5-grammar-233, jp-reading-set-n4-001, jp-reading-set-n4-052 | ぎんこうはゆうびんきょくのみぎにあります。 | unresolved token |
| る | る | る | grammar, reading, listening | 23 | n4-grammar-077, n4-grammar-085, n4-grammar-122 | そとはあめがふっているようです。 | unresolved token |
| 出し | 出し | 待人工確認 | grammar, reading | 23 | n4-grammar-189, jp-reading-set-n4-006, jp-reading-q-n4-031-01 | 金曜日までにレポートを出してください。 | unresolved token |
| あい | あい | あい | grammar, reading, listening | 22 | n4-grammar-166, n5-grammar-234, n4-grammar-244 | ばあいは | unresolved token |
| せい | せい | せい | grammar, reading, listening | 22 | n5-grammar-001, n5-grammar-021, n4-grammar-183 | わたしはがくせいです。 | unresolved token |
| たら | たら | たら | grammar, reading, listening | 22 | n4-grammar-083, n4-grammar-143, n4-grammar-157 | 〜たら | unresolved token |
| てく | てく | てく | grammar, reading | 22 | n4-grammar-092, n4-grammar-172, n4-grammar-261 | 母が駅まで迎えに来てくれました。 | unresolved token |
| ながら | ながら | ながら | grammar, reading, listening | 22 | n4-grammar-055, n4-grammar-198, jp-reading-set-n4-021 | 〜ながら | unresolved token |
| ばかり | ばかり | ばかり | grammar, reading | 22 | n4-grammar-069, n4-grammar-103, n4-grammar-255 | 〜たばかり | unresolved token |
| ゅ | ゅ | ゅ | grammar, reading, listening | 22 | n5-grammar-013, n4-grammar-102, n4-grammar-142 | じゅぎょうはくじからです。 | unresolved token |
| 王 | 王 | 待人工確認 | reading | 22 | jp-reading-set-n4-017, jp-reading-q-n4-017-01, jp-reading-q-n4-017-02 | 王さんは大学の近くに引っ越しました。新しい部屋は駅から少し遠いですが、窓が大きくて明るいです。前の部屋より家賃も安いので、王さんは気に入っています。ただ、スーパ | unresolved token |
| 物 | 物 | 待人工確認 | grammar, reading, listening | 22 | n5-grammar-237, n4-grammar-255, jp-reading-set-n4-015 | 私は甘い物＿＿好きです。 | unresolved token |
| なので | なので | なので | reading | 21 | jp-reading-set-n4-016, jp-reading-set-n4-022, jp-reading-set-n4-027 | 来週の学校祭で、私のクラスは焼きそばを売ります。昨日、みんなで役割を決めました。私はお金を集める係になりましたが、計算が苦手なので、佐藤さんと二人でやることにな | unresolved token |
| よる | よる | よる | grammar, reading | 21 | n4-grammar-250, n4-grammar-258, n4-grammar-280 | けんこうのために、よるおそくたべない＿＿。 | ambiguous kana-match |
| 聞 | 聞 | 待人工確認 | grammar, reading | 21 | n4-grammar-055, n4-grammar-143, n4-grammar-158 | 音楽を聞きながら歩きます。 | unresolved token |
| 忘れ | 忘れ | 待人工確認 | grammar, reading, listening | 21 | n4-grammar-105, jp-reading-set-n4-013, jp-reading-set-n4-014 | 忘れないように、メモを書きます。 | unresolved token |
| す | す | す | grammar, reading, listening | 20 | n5-grammar-022, n4-grammar-056, n4-grammar-086 | ねこはいすのしたにいます。 | unresolved token |
| だい | だい | だい | grammar, reading, listening | 20 | n5-grammar-034, n5-grammar-044, n4-grammar-059 | きのうしゅくだいをしませんでした。 | unresolved token |
| えい | えい | えい | grammar, reading, listening | 19 | n5-grammar-010, n5-grammar-033, n4-grammar-066 | ともだちとえいがをみます。 | unresolved token |
| ところ | ところ | ところ | grammar | 19 | n4-grammar-131, n4-grammar-132, n4-grammar-133 | 〜るところ | unresolved token |
| りょう | りょう | りょう | grammar, reading, listening | 19 | n5-grammar-042, n5-grammar-238, n4-grammar-241 | はははりょうりをしています。 | unresolved token |
| はず | はず | はず | grammar | 18 | n4-grammar-082, n4-grammar-161, n4-grammar-270 | 〜はずだ | unresolved token |
| きのう | きのう | きのう | grammar, reading, listening | 17 | n5-grammar-025, n5-grammar-029, n5-grammar-033 | きのうはさむかったです。 | ambiguous kana-match |
| しん | しん | しん | grammar, reading, listening | 17 | n5-grammar-041, n4-grammar-054, n4-grammar-063 | ここでしゃしんをとらないでください。 | unresolved token |
| 室 | 室 | 待人工確認 | reading | 17 | jp-reading-q-n4-030-01, jp-reading-set-n4-031, jp-reading-q-n4-031-01 | 学校の事務室 | unresolved token |
| 選び | 選び | 待人工確認 | reading | 17 | jp-reading-q-n4-001-01, jp-reading-set-n4-004, jp-reading-q-n4-004-01 | 中村さんはなぜ普通の便を選びましたか。 | unresolved token |
| 買い | 買い | 待人工確認 | grammar, reading, listening | 17 | n4-grammar-071, n4-grammar-100, jp-reading-q-n4-016-01 | 弟は新しいゲームを買いたがっています。 | unresolved token |
| まり | まり | まり | grammar, reading, listening | 16 | n4-grammar-185, n5-grammar-224, jp-reading-set-n4-010 | たいふうによって、でんしゃがとまりました。 | unresolved token |
| 開 | 開 | 待人工確認 | grammar, reading, listening | 16 | n5-grammar-045, n4-grammar-172, n5-grammar-216 | 暑いですから、窓を開けます。 | unresolved token |
| 行 | 行 | 待人工確認 | grammar, reading, listening | 16 | n4-grammar-137, n4-grammar-167, n4-grammar-257 | もう行かなくちゃ。 | unresolved token |
| 祭 | 祭 | 待人工確認 | reading | 16 | jp-reading-set-n4-016, jp-reading-q-n4-016-01, jp-reading-set-n4-062 | 学校祭の準備 | unresolved token |
| いしゅう | いしゅう | いしゅう | grammar, reading, listening | 15 | n4-grammar-079, n4-grammar-175, jp-reading-set-n4-006 | たなかさんはらいしゅうけっこんするらしいです。 | unresolved token |
| げ | げ | げ | grammar, reading | 15 | n4-grammar-071, n4-grammar-091, n4-grammar-129 | おとうとはあたらしいげーむをかいたがっています。 | unresolved token |
| ごろ | ごろ | ごろ | grammar, reading | 15 | n5-grammar-228, jp-reading-set-n4-028, jp-reading-set-n4-033 | 〜ごろ | unresolved token |
| てん | てん | てん | grammar, reading | 15 | n4-grammar-287, jp-reading-set-n4-003, jp-reading-set-n4-022 | ぜんぶよまなくてもいいですが、ようてんはみてください。 | unresolved token |
| とう | とう | とう | grammar, reading, listening | 15 | n5-grammar-047, n4-grammar-071, n4-grammar-096 | とうきょうはおおさかよりおおきいです。 | unresolved token |
| のみ | のみ | のみ | grammar, reading, listening | 15 | n5-grammar-003, n5-grammar-031, n4-grammar-194 | みずをのみます。 | unresolved token |
| まい | まい | まい | grammar, reading, listening | 15 | n5-grammar-031, n4-grammar-109, n4-grammar-148 | まいあさこーひーをのみます。 | unresolved token |
| ょ | ょ | ょ | grammar, reading, listening | 15 | n4-grammar-051, n4-grammar-053, n4-grammar-115 | いもうとはきょねん、にほんごをべんきょうしはじめました。 | unresolved token |
| ろ | ろ | ろ | grammar, reading, listening | 15 | n4-grammar-126, n5-grammar-227, n5-grammar-233 | 危ないから、早く逃げろ。 | unresolved token |
| 会 | 会 | 待人工確認 | grammar, reading, listening | 15 | n5-grammar-234, jp-reading-set-n4-006, jp-reading-q-n4-006-01 | 友だちに会いに行きます。 | unresolved token |
| 終 | 終 | 待人工確認 | grammar, reading, listening | 15 | n5-grammar-044, n4-grammar-058, n4-grammar-182 | 宿題はまだ終わっていません。 | unresolved token |
| 初めて | 初めて | 待人工確認 | reading | 15 | jp-reading-set-n4-030, jp-reading-set-n4-046, jp-reading-set-n4-055 | 来月から公民館で茶道教室が始まります。毎週土曜日の午前十時から一時間です。初めての人も参加できます。申し込みは電話ではなく、公民館の受付で名前を書いてください。 | unresolved token |
| ー | ー | ー | grammar | 14 | n5-grammar-031, n4-grammar-071, n4-grammar-075 | まいあさこーひーをのみます。 | unresolved token |
| すぎる | すぎる | すぎる | grammar, reading | 14 | n4-grammar-120, jp-reading-set-n4-021, jp-reading-q-n4-041-01 | 〜すぎる | unresolved token |
| 安 | 安 | 待人工確認 | reading | 14 | jp-reading-set-n4-024, jp-reading-set-n4-027, jp-reading-q-n4-027-02 | 母は冷蔵庫にメモを貼りました。「卵はまだあります。牛乳とパンだけ買ってください。大きいジュースは、安くても買わなくていいです。」弟はメモを読んで、財布とエコバッ | unresolved token |
| 屋 | 屋 | 待人工確認 | reading | 14 | jp-reading-set-n4-010, jp-reading-set-n4-012, jp-reading-set-n4-032 | 自転車屋から李さんへ電話がありました。修理は終わりましたが、店は今日は六時に閉まります。六時に間に合わない場合は、明日の午前中に取りに来てもいいそうです。 | unresolved token |
| 撮 | 撮 | 待人工確認 | grammar, reading, listening | 14 | n5-grammar-041, n4-grammar-063, n4-grammar-093 | ここで写真を撮らないでください。 | unresolved token |
| 使 | 使 | 待人工確認 | grammar, reading | 14 | n4-grammar-286, jp-reading-set-n4-020, jp-reading-set-n4-060 | 使っ＿＿、後で返してください。 | unresolved token |
| 止 | 止 | 待人工確認 | grammar, reading | 14 | n4-grammar-268, jp-reading-set-n4-046, jp-reading-q-n4-046-01 | 雨はすぐには止みそうにないです。 | unresolved token |
| 席 | 席 | 待人工確認 | reading | 14 | jp-reading-set-n4-002, jp-reading-q-n4-002-01, jp-reading-set-n4-022 | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が取れるので、二人は遅い回にしました。 | unresolved token |
| 着い | 着い | 待人工確認 | grammar, reading | 14 | n4-grammar-082, n4-grammar-133, jp-reading-set-n4-029 | 電車はもう着いたはずです。 | unresolved token |
| 閉 | 閉 | 待人工確認 | reading | 14 | jp-reading-q-n4-001-01, jp-reading-set-n4-010, jp-reading-set-n4-027 | 窓口が閉まっていたから | unresolved token |
| がい | がい | がい | grammar, reading, listening | 13 | n5-grammar-020, n5-grammar-021, n4-grammar-152 | 公園に子どもがいます。 | unresolved token |
| きん | きん | きん | grammar, reading | 13 | n4-grammar-189, jp-reading-set-n4-004, jp-reading-set-n4-021 | きんようびまでにれぽーとをだしてください。 | unresolved token |
| しゅく | しゅく | しゅく | grammar, reading, listening | 13 | n5-grammar-034, n5-grammar-044, n4-grammar-059 | きのうしゅくだいをしませんでした。 | unresolved token |
| 降り | 降り | 待人工確認 | reading, listening | 13 | jp-reading-set-n4-034, jp-reading-set-n4-036, jp-reading-set-n4-047 | 遠足の日の朝、空は暗く、雨が降りそうでした。先生は『山の道はすべりやすいので、今日は博物館へ行きます』と言いました。学生たちは少し驚きましたが、バスの中で博物館 | unresolved token |
| 子ども | 子ども | 待人工確認 | grammar, reading | 13 | n5-grammar-020, n4-grammar-056, n4-grammar-110 | 公園に子どもがいます。 | unresolved token |
| 思 | 思 | 待人工確認 | grammar, reading | 13 | n4-grammar-192, jp-reading-set-n4-013, jp-reading-set-n4-018 | この問題は思ったほどではありません。 | unresolved token |
| 寝 | 寝 | 待人工確認 | grammar, reading, listening | 13 | n4-grammar-136, n4-grammar-208, n5-grammar-228 | 明日早いので、もう寝ないといけません。 | unresolved token |
| 遅 | 遅 | 待人工確認 | grammar, reading | 13 | n4-grammar-250, n4-grammar-258, jp-reading-set-n4-012 | 健康のために、夜遅く食べない＿＿。 | unresolved token |
| 方 | 方 | 待人工確認 | reading | 13 | jp-reading-set-n4-001, jp-reading-set-n4-002, jp-reading-set-n4-046 | 中村さんは妹にお菓子を送りたくて郵便局へ行きました。箱が少し大きかったので、窓口の人に安い送り方を聞きました。明日着く必要はないため、普通の便で送ることにしまし | unresolved token |
| 李 | 李 | 待人工確認 | reading | 13 | jp-reading-set-n4-010, jp-reading-q-n4-010-01, jp-reading-set-n4-037 | 自転車屋から李さんへ電話がありました。修理は終わりましたが、店は今日は六時に閉まります。六時に間に合わない場合は、明日の午前中に取りに来てもいいそうです。 | unresolved token |
| しゅう | しゅう | しゅう | grammar, reading, listening | 12 | n4-grammar-070, n4-grammar-101, n5-grammar-220 | しゅうまつはいえでやすもうとおもいます。 | unresolved token |
| つけ | つけ | つけ | grammar, reading | 12 | n4-grammar-208, n5-grammar-231, jp-reading-set-n4-007 | 電気をつけたまま寝てしまいました。 | unresolved token |
| について | について | について | grammar, reading | 12 | n4-grammar-275, n4-grammar-276, jp-reading-q-n4-044-01 | 〜について | unresolved token |
| わり | わり | わり | grammar, reading | 12 | n4-grammar-058, n4-grammar-182, n5-grammar-224 | 本を読み終わりました。 | unresolved token |
| 飲 | 飲 | 待人工確認 | grammar, reading, listening | 12 | n5-grammar-003, n5-grammar-031, n4-grammar-060 | 水を飲みます。 | unresolved token |
| 証 | 証 | 待人工確認 | reading | 12 | jp-reading-set-n4-028, jp-reading-q-n4-028-01, jp-reading-set-n4-055 | この映画館では、水曜日の午後六時までの回は学生料金が安くなります。学生証を見せなければなりません。インターネットで席を予約した人も、入口で学生証を見せてください | unresolved token |
| 読み | 読み | 待人工確認 | grammar, reading, listening | 12 | n4-grammar-058, n4-grammar-114, n4-grammar-135 | 本を読み終わりました。 | unresolved token |
| ちゃ | ちゃ | ちゃ | grammar, reading | 11 | n4-grammar-137, n4-grammar-142, n4-grammar-284 | 〜なくちゃ | unresolved token |
| ちょう | ちょう | ちょう | reading | 11 | jp-reading-set-n4-003, jp-reading-set-n4-004, jp-reading-set-n4-006 | マイクさんはきょうからきっさてんでアルバイトをはじめました。てんちょうは、ちゅうもんをきくまえにみずをだすこと、わからないことばがあったらすぐかくにんすることを | unresolved token |
| われ | われ | われ | grammar, reading | 11 | n4-grammar-273, jp-reading-set-n4-038, jp-reading-set-n4-073 | 〜と言われている | unresolved token |
| 始め | 始め | 待人工確認 | grammar, reading | 11 | n4-grammar-051, n4-grammar-069, jp-reading-set-n4-003 | 妹は去年、日本語を勉強し始めました。 | unresolved token |
| 思い | 思い | 待人工確認 | grammar, reading, listening | 11 | n4-grammar-070, n4-grammar-156, n4-grammar-202 | 週末は家で休もうと思います。 | unresolved token |
| 借り | 借り | 待人工確認 | grammar, reading | 11 | n5-grammar-234, jp-reading-q-n4-026-02, jp-reading-set-n4-040 | 図書館へ本を借り＿＿行きます。 | unresolved token |
| 乗 | 乗 | 待人工確認 | grammar, reading | 11 | n4-grammar-114, n4-grammar-155, n4-grammar-183 | 電車に乗っている間、本を読みました。 | unresolved token |
| 別 | 別 | 待人工確認 | reading | 11 | jp-reading-set-n4-035, jp-reading-q-n4-035-01, jp-reading-set-n4-052 | 私は靴屋で黒い靴を見ていました。値段は安かったですが、少し小さく感じました。店員は『長く歩くなら、少し大きいほうがいいですよ』と言いました。私は旅行で使うので、 | unresolved token |
| 歩 | 歩 | 待人工確認 | grammar, reading, listening | 11 | n4-grammar-119, jp-reading-set-n4-017, jp-reading-set-n4-047 | 歩けないほど疲れました。 | unresolved token |
| いち | いち | いち | grammar, reading, listening | 10 | n5-grammar-229, jp-reading-set-n4-030, jp-reading-set-n4-032 | まいにちいちじかん＿＿べんきょうします。 | ambiguous kana-match |
| うち | うち | うち | grammar | 10 | n4-grammar-142, n4-grammar-187, n4-grammar-188 | じゅぎょうちゅうにはなしちゃいけません。 | unresolved token |
| ぐち | ぐち | ぐち | grammar, reading | 10 | n5-grammar-231, jp-reading-set-n4-001, jp-reading-set-n4-008 | でぐちは＿＿です。 | unresolved token |
| しな | しな | しな | grammar, reading, listening | 10 | n4-grammar-127, n4-grammar-138, jp-reading-q-n4-007-01 | 早く宿題をしなさい。 | unresolved token |
| じゅっ | じゅっ | じゅっ | grammar, reading | 10 | n4-grammar-118, n5-grammar-229, jp-reading-set-n4-019 | えきまでじゅっぷんくらいかかります。 | unresolved token |
| とい | とい | とい | grammar, reading | 10 | n4-grammar-136, n4-grammar-201, n5-grammar-217 | 〜ないといけない | unresolved token |
| という | という | という | grammar | 10 | n4-grammar-201, n4-grammar-205, n4-grammar-274 | という | unresolved token |
| として | として | として | grammar | 10 | n4-grammar-252, n4-grammar-278 | 〜ようとしている | unresolved token |
| なん | なん | なん | grammar, listening | 10 | n5-grammar-220, n5-grammar-224, n5-grammar-225 | なに／なん | unresolved token |
| はじめ | はじめ | はじめ | grammar, reading | 10 | n4-grammar-051, n4-grammar-069, jp-reading-set-n4-003 | いもうとはきょねん、にほんごをべんきょうしはじめました。 | unresolved token |
| ぷん | ぷん | ぷん | grammar, reading | 10 | n4-grammar-118, n5-grammar-229, jp-reading-set-n4-019 | えきまでじゅっぷんくらいかかります。 | unresolved token |
| まっ | まっ | まっ | grammar, reading | 10 | n4-grammar-169, n4-grammar-254, n4-grammar-261 | こまったときは、ともだちにそうだんします。 | unresolved token |
| わっ | わっ | わっ | reading, listening | 10 | jp-reading-set-n4-023, jp-reading-set-n4-031, jp-reading-q-n4-034-01 | 日曜日の朝、町内で公園の掃除があります。参加する人は軍手を持って、八時五十分までに公園の入口に集まります。雨が強いときは中止ですが、小雨なら行います。終わったあ | unresolved token |
| 洗 | 洗 | 待人工確認 | grammar, reading | 10 | n4-grammar-113, jp-reading-set-n4-033, jp-reading-set-n4-052 | 手を洗ってから、ご飯を食べます。 | unresolved token |
| 送り | 送り | 待人工確認 | reading | 10 | jp-reading-set-n4-001, jp-reading-q-n4-074-01, jp-reading-set-n4-078 | 中村さんは妹にお菓子を送りたくて郵便局へ行きました。箱が少し大きかったので、窓口の人に安い送り方を聞きました。明日着く必要はないため、普通の便で送ることにしまし | unresolved token |
| ぐらい | ぐらい | ぐらい | grammar, reading | 9 | n4-grammar-118, n5-grammar-229, jp-reading-set-n4-008 | 〜くらい／ぐらい | unresolved token |
| けい | けい | けい | grammar, reading | 9 | n5-grammar-027, n5-grammar-028, n5-grammar-029 | なけいようしげんざいこうてい | unresolved token |
| しけ | しけ | しけ | grammar, reading | 9 | n5-grammar-026, n4-grammar-108, n4-grammar-181 | しけんはむずかしくなかったです。 | unresolved token |
| せつ | せつ | せつ | grammar, reading | 9 | n4-grammar-054, n4-grammar-073, n4-grammar-171 | たいせつなしゃしんをなくしてしまいました。 | unresolved token |
| たま | たま | たま | grammar, reading, listening | 9 | n5-grammar-009, n4-grammar-107, n4-grammar-206 | ぱんとたまごをたべます。 | unresolved token |
| による | による | による | grammar, reading | 9 | n4-grammar-076, n4-grammar-204, jp-reading-set-n4-015 | 天気予報によると、明日は雨だそうです。 | unresolved token |
| らい | らい | らい | grammar, reading, listening | 9 | n4-grammar-128, n4-grammar-129, n4-grammar-248 | らいねん、にほんへいくことにしました。 | unresolved token |
| 間 | 間 | 待人工確認 | grammar, reading | 9 | n4-grammar-114, n4-grammar-115, n4-grammar-199 | 〜間 | unresolved token |
| 教え | 教え | 待人工確認 | grammar, reading | 9 | n4-grammar-091, n4-grammar-245, n4-grammar-265 | 私は友だちに日本語を教えてあげました。 | unresolved token |
| 始まり | 始まり | 待人工確認 | grammar, reading, listening | 9 | n5-grammar-224, jp-reading-q-n4-019-01, jp-reading-set-n4-030 | 授業は何時に始まりますか。 | unresolved token |
| 読 | 読 | 待人工確認 | grammar, reading, listening | 9 | n4-grammar-147, n4-grammar-287, jp-reading-set-n4-024 | この漢字が読めます。 | unresolved token |
| 入 | 入 | 待人工確認 | reading | 9 | jp-reading-set-n4-017, jp-reading-q-n4-017-01, jp-reading-set-n4-045 | 王さんは大学の近くに引っ越しました。新しい部屋は駅から少し遠いですが、窓が大きくて明るいです。前の部屋より家賃も安いので、王さんは気に入っています。ただ、スーパ | unresolved token |
| 話 | 話 | 待人工確認 | grammar, reading | 9 | n4-grammar-065, n4-grammar-102, n4-grammar-122 | 図書館で大きな声で話してはいけません。 | unresolved token |
| ぎ | ぎ | ぎ | grammar, reading, listening | 8 | n5-grammar-050, n5-grammar-224, n4-grammar-249 | にちようびにときどきおよぎます。 | unresolved token |
| ぎょ | ぎょ | ぎょ | grammar, reading, listening | 8 | n5-grammar-013, n4-grammar-062, n4-grammar-142 | じゅぎょうはくじからです。 | unresolved token |
| こん | こん | こん | reading, listening | 8 | jp-reading-set-n4-005, jp-reading-set-n4-008, jp-reading-set-n4-021 | さとうさんのスマホはあさからおとがでませんでした。でんわはうけられますが、めざましがならないかもしれません。あしたははやいので、こんやはふるいとけいもつかうこと | unresolved token |
| しょく | しょく | しょく | reading | 8 | jp-reading-set-n4-007, jp-reading-set-n4-029, jp-reading-set-n4-031 | フロントのせつめいでは、ちょうしょくはいっかいのしょくどうでしちじからくじまでです。しょくどうにはいるまえに、へやのばんごうがかいてあるちょうしょくけんをうけつ | unresolved token |
| そ | そ | そ | grammar, reading, listening | 8 | n5-grammar-038, n4-grammar-077, n4-grammar-110 | きょうはそとへでたくないです。 | unresolved token |
| でも | でも | でも | reading | 8 | jp-reading-set-n4-004, jp-reading-q-n4-044-01, jp-reading-set-n4-061 | 兄の誕生日に、私は青いシャツを買うつもりでした。でも母から、兄が最近料理を始めたと聞きました。それで、シャツではなく使いやすい包丁を選びました。 | unresolved token |
| ばん | ばん | ばん | reading, listening | 8 | jp-reading-set-n4-007, jp-reading-set-n4-009, jp-reading-set-n4-037 | フロントのせつめいでは、ちょうしょくはいっかいのしょくどうでしちじからくじまでです。しょくどうにはいるまえに、へやのばんごうがかいてあるちょうしょくけんをうけつ | unresolved token |
| めい | めい | めい | grammar, reading | 8 | n5-grammar-021, n5-grammar-022, n4-grammar-073 | ばしょにめいしがあります／います | unresolved token |
| やら | やら | やら | grammar | 8 | n4-grammar-177 | 〜やら〜やら | unresolved token |
| ゆう | ゆう | ゆう | grammar, reading, listening | 8 | n5-grammar-233, jp-reading-set-n4-001, jp-reading-set-n4-027 | ぎんこうはゆうびんきょくのみぎにあります。 | unresolved token |
| 形容詞 | 形容詞 | 待人工確認 | grammar | 8 | n5-grammar-023, n5-grammar-024, n5-grammar-025 | い形容詞現在肯定 | unresolved token |
| 降 | 降 | 待人工確認 | grammar, listening | 8 | n5-grammar-002, n4-grammar-077, n4-grammar-083 | 雨が降っています。 | unresolved token |
| 込 | 込 | 待人工確認 | grammar, reading | 8 | n4-grammar-184, jp-reading-set-n4-009, jp-reading-set-n4-060 | 道が込んでいたものだから、遅れました。 | unresolved token |
| 混 | 混 | 待人工確認 | reading | 8 | jp-reading-set-n4-043, jp-reading-set-n4-047, jp-reading-set-n4-075 | コンビニのコピー機は、写真を印刷するとき先に画面でサイズを選びます。分からない場合は、店員に聞いてもいいですが、混んでいる時間は少し待ちます。 | unresolved token |
| 受け | 受け | 待人工確認 | reading | 8 | jp-reading-set-n4-005, jp-reading-q-n4-005-01, jp-reading-q-n4-082-01 | 佐藤さんのスマホは朝から音が出ませんでした。電話は受けられますが、目覚ましが鳴らないかもしれません。明日は早いので、今夜は古い時計も使うことにしました。 | unresolved token |
| 書き | 書き | 待人工確認 | grammar, reading | 8 | n4-grammar-105, n4-grammar-123, n4-grammar-280 | 忘れないように、メモを書きます。 | unresolved token |
| 少 | 少 | 待人工確認 | reading | 8 | jp-reading-set-n4-043, jp-reading-set-n4-054, jp-reading-set-n4-099 | コンビニのコピー<ruby>機<rt>き</rt></ruby>は、<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>印刷<rt>いんさつ< | unresolved token |
| 乗り | 乗り | 待人工確認 | reading | 8 | jp-reading-set-n4-046, jp-reading-q-n4-046-01, jp-reading-set-n4-076 | 初めて行く会場なので、小林さんは駅で乗り換え方を調べました。急行に乗ると早いですが、会場の近くの駅には止まらないので、各駅停車に乗ります。 | unresolved token |
| 待 | 待 | 待人工確認 | grammar, reading | 8 | n4-grammar-261, jp-reading-set-n4-002, jp-reading-set-n4-043 | 待っ＿＿ありがとう。 | unresolved token |
| 置 | 置 | 待人工確認 | grammar, reading | 8 | n4-grammar-135, n4-grammar-259, jp-reading-q-n4-010-01 | 読みかけの本を机に置きました。 | unresolved token |
| えて | えて | えて | grammar, reading | 7 | n4-grammar-091, n4-grammar-180, n4-grammar-265 | わたしはともだちににほんごをおしえてあげました。 | unresolved token |
| しく | しく | しく | grammar, reading | 7 | n5-grammar-026, n4-grammar-149, n4-grammar-191 | 試験は難しくなかったです。 | unresolved token |
| すい | すい | すい | grammar, reading | 7 | n4-grammar-288, jp-reading-set-n4-028, jp-reading-set-n4-033 | けんこうでいる＿＿、すいみんがたいせつです。 | unresolved token |
| すか | すか | すか | grammar, reading, listening | 7 | n5-grammar-219, jp-reading-q-n4-018-02, jp-reading-set-n4-035 | テストは＿＿ありますか。 | unresolved token |

## Unresolved / unsegmented
- unresolved token 數量：664
- unsegmented span 數量：0

## 複合詞與固定表現
- compound 數量：605
- compound 判定條件：明確 vocabulary/rubyTerms 欄位、Intl.Segmenter 完整詞、或可由兩個以上已知詞完整組成。不得只依字數判定。
- fixed-expression 抽樣數：100

| 類型 | 項目 | 出現模組 | 出現次數 | 代表來源 ID |
|---|---|---|---:|---|
| compound | もう一度 | grammar, reading, listening | 10 | n4-grammar-073, n4-grammar-171, jp-reading-q-n4-010-01 |
| compound | 今夜 | reading, listening | 7 | jp-reading-set-n4-005, jp-reading-q-n4-005-01, jp-reading-set-n4-095 |
| compound | もう少し | grammar, listening | 2 | n4-grammar-186, jl-050 |
| compound | ですか | grammar | 9 | n5-grammar-217, n5-grammar-218, n5-grammar-219 |
| compound | たなか | reading | 7 | jp-reading-set-n4-018, jp-reading-set-n4-031, jp-reading-set-n4-036 |
| compound | ながら | grammar | 7 | n4-grammar-055, n4-grammar-198, n4-grammar-246 |
| compound | うんどうセンター | reading | 6 | jp-reading-set-n4-020, jp-reading-set-n4-066, jp-reading-set-n4-103 |
| compound | なかむら | reading | 6 | jp-reading-set-n4-001, jp-reading-set-n4-020, jp-reading-set-n4-100 |
| compound | 木村 | reading | 6 | jp-reading-set-n4-054, jp-reading-q-n4-054-01 |
| compound | します | grammar | 5 | n5-grammar-019, n5-grammar-020, n5-grammar-034 |
| compound | について | grammar | 5 | n4-grammar-275, n4-grammar-276, n4-grammar-277 |
| compound | のほうが | grammar | 5 | n5-grammar-047, n5-grammar-048, n5-grammar-240 |
| compound | ばかり | grammar | 5 | n4-grammar-069, n4-grammar-252, n4-grammar-255 |
| compound | 千円 | reading | 5 | jp-reading-q-n4-009-01, jp-reading-set-n4-104, jp-reading-q-n4-104-01 |
| compound | さんじゅっぷん | reading | 4 | jp-reading-set-n4-019, jp-reading-set-n4-064 |
| compound | そうに | grammar | 4 | n4-grammar-279, n4-grammar-280, n4-grammar-289 |
| compound | ちいきせいそう | reading | 4 | jp-reading-set-n4-051, jp-reading-set-n4-061 |
| compound | ではありません | grammar | 4 | n5-grammar-016, n5-grammar-017, n5-grammar-028 |
| compound | ところ | grammar | 4 | n4-grammar-131, n4-grammar-133, n4-grammar-248 |
| compound | として | grammar | 4 | n4-grammar-275, n4-grammar-277, n4-grammar-278 |
| compound | にとって | grammar | 4 | n4-grammar-275, n4-grammar-277, n4-grammar-278 |
| compound | によって | grammar | 4 | n4-grammar-185, n4-grammar-275, n4-grammar-277 |
| compound | はずだ | grammar | 4 | n4-grammar-082, n4-grammar-285 |
| compound | はちじはん | reading | 4 | jp-reading-set-n4-002, jp-reading-set-n4-055 |
| compound | ヨガきょうしつ | reading | 4 | jp-reading-set-n4-066, jp-reading-set-n4-103 |
| compound | 山本 | reading | 4 | jp-reading-set-n4-015, jp-reading-q-n4-015-01 |
| compound | 地域清掃 | reading | 4 | jp-reading-set-n4-051, jp-reading-set-n4-061 |
| compound | 八時半 | reading | 4 | jp-reading-set-n4-002, jp-reading-set-n4-055 |
| compound | 本棚 | reading | 4 | jp-reading-set-n4-025, jp-reading-q-n4-025-01, jp-reading-q-n4-025-02 |
| compound | 夜中 | reading | 4 | jp-reading-set-n4-013, jp-reading-q-n4-013-01 |
| compound | ことがある | grammar | 3 | n4-grammar-066, n4-grammar-068, n4-grammar-257 |
| compound | せいり | reading | 3 | jp-reading-set-n4-026, jp-reading-set-n4-101 |
| compound | ています | grammar | 3 | n4-grammar-241, n4-grammar-244, n4-grammar-245 |
| compound | てください | grammar | 3 | n5-grammar-041, n4-grammar-244, n4-grammar-245 |
| compound | てみます | grammar | 3 | n4-grammar-241, n4-grammar-244, n4-grammar-245 |
| compound | ところに | grammar | 3 | n4-grammar-253, n4-grammar-254 |
| compound | なければならない | grammar | 3 | n4-grammar-059, n4-grammar-260, n4-grammar-267 |
| compound | ほうがいい | grammar | 3 | n4-grammar-257, n4-grammar-258 |
| compound | ようだ | grammar | 3 | n4-grammar-077 |
| compound | られる | grammar | 3 | n4-grammar-122, n4-grammar-146 |
| compound | 昼前 | reading | 3 | jp-reading-set-n4-077, jp-reading-q-n4-077-01 |
| compound | 〜だけでなく〜も：表示不只。 | grammar | 2 | n4-grammar-179, n4-grammar-180 |
| compound | あたためて | reading | 2 | jp-reading-set-n4-033 |
| compound | いとう | reading | 2 | jp-reading-set-n4-058 |
| compound | かきました | reading | 2 | jp-reading-set-n4-082 |
| compound | きます | grammar | 2 | n5-grammar-005, n5-grammar-006 |
| compound | きむら | reading | 2 | jp-reading-set-n4-054 |
| compound | きょうとえき | reading | 2 | jp-reading-set-n4-065 |
| compound | くても | grammar | 2 | n4-grammar-167, n4-grammar-260 |
| compound | くないです | grammar | 2 | n5-grammar-016, n5-grammar-024 |
| compound | ぐらい | grammar | 2 | n5-grammar-229 |
| compound | クリーニングてん | reading | 2 | jp-reading-set-n4-082 |
| compound | ければ | grammar | 2 | n4-grammar-084, n4-grammar-089 |
| compound | こうえんかつどう | reading | 2 | jp-reading-set-n4-072 |
| compound | ごごよじ | reading | 2 | jp-reading-set-n4-059 |
| compound | ことがあります | grammar | 2 | n4-grammar-250, n4-grammar-251 |
| compound | ことができます | grammar | 2 | n4-grammar-250, n4-grammar-251 |
| compound | ことにしています | grammar | 2 | n4-grammar-250, n4-grammar-251 |
| compound | こばやし | reading | 2 | jp-reading-set-n4-046 |
| compound | ごばんバス | reading | 2 | jp-reading-set-n4-047 |
| compound | コピーき | reading | 2 | jp-reading-set-n4-043 |
| compound | さんばんバス | reading | 2 | jp-reading-set-n4-069 |
| compound | しつないよう | reading | 2 | jp-reading-set-n4-072 |
| compound | しました | grammar | 2 | n5-grammar-034, n5-grammar-042 |
| compound | しません | grammar | 2 | n5-grammar-034, n5-grammar-042 |
| compound | じゅっぷんまえ | reading | 2 | jp-reading-set-n4-070, jp-reading-set-n4-104 |
| compound | しらべ | reading | 2 | jp-reading-set-n4-076 |
| compound | しりつとしょかん | reading | 2 | jp-reading-set-n4-067 |
| compound | そうだ | grammar | 2 | n4-grammar-075, n4-grammar-076 |
| compound | そうにない | grammar | 2 | n4-grammar-268 |
| compound | たいです | grammar | 2 | n5-grammar-037, n5-grammar-038 |
| compound | だった | grammar | 2 | n4-grammar-083 |
| compound | ためには | grammar | 2 | n4-grammar-288 |
| compound | ちゅうおうこうえん | reading | 2 | jp-reading-set-n4-047 |
| compound | つもり | grammar | 2 | n4-grammar-248, n4-grammar-249 |
| compound | てあげたい | grammar | 2 | n4-grammar-262, n4-grammar-263 |
| compound | てあげています | grammar | 2 | n4-grammar-264, n4-grammar-265 |
| compound | てあります | grammar | 2 | n4-grammar-241, n4-grammar-245 |
| compound | ていきます | grammar | 2 | n4-grammar-241, n4-grammar-244 |
| compound | ている | grammar | 2 | n4-grammar-114, n4-grammar-115 |
| compound | てくれています | grammar | 2 | n4-grammar-264, n4-grammar-265 |
| compound | ではありませんでした | grammar | 2 | n5-grammar-017, n5-grammar-030 |
| compound | てはいけませんが | grammar | 2 | n4-grammar-286, n4-grammar-287 |
| compound | てみたい | grammar | 2 | n4-grammar-262, n4-grammar-263 |
| compound | てみて | grammar | 2 | n4-grammar-256, n4-grammar-261 |
| compound | てもいいですが | grammar | 2 | n4-grammar-286, n4-grammar-287 |
| compound | てもらいたい | grammar | 2 | n4-grammar-262, n4-grammar-263 |
| compound | てもらっています | grammar | 2 | n4-grammar-264, n4-grammar-265 |
| compound | ても大丈夫 | grammar | 2 | n4-grammar-259, n4-grammar-260 |
| compound | といい | grammar | 2 | n4-grammar-074, n4-grammar-285 |
| compound | という | grammar | 2 | n4-grammar-205 |
| compound | ということ | grammar | 2 | n4-grammar-274 |
| compound | ところでした | grammar | 2 | n4-grammar-269, n4-grammar-270 |
| compound | ところへ | grammar | 2 | n4-grammar-253, n4-grammar-254 |
| compound | とはいえ | grammar | 2 | n4-grammar-200 |
| compound | と言っています | grammar | 2 | n4-grammar-272, n4-grammar-273 |
| compound | と思っています | grammar | 2 | n4-grammar-272, n4-grammar-273 |
| compound | ないでください | grammar | 2 | n5-grammar-040, n4-grammar-260 |
| compound | ないと | grammar | 2 | n4-grammar-246, n4-grammar-247 |
| compound | なくてはいけない | grammar | 2 | n4-grammar-061, n4-grammar-259 |

## 專有名詞數量摘要
專有名詞去重數：20

## 基本形還原抽樣
| 類別 | 表面形式 | 基本形 | 變化類型 | 來源模組 | 來源 ID |
|---|---|---|---|---|---|
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-019 |
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-019 |
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-020 |
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-020 |
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-021 |
| godan | あります | ある | 五段動詞・丁寧 | grammar | n5-grammar-022 |
| godan | 飲みます | 飲む | 五段動詞・丁寧 | grammar | n5-grammar-031 |
| godan | 飲みません | 飲む | 五段動詞・丁寧否定 | grammar | n5-grammar-031 |
| godan | 飲みました | 飲む | 五段動詞・丁寧過去 | grammar | n5-grammar-031 |
| godan | 飲みませんでした | 飲む | 五段動詞・丁寧否定過去 | grammar | n5-grammar-031 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-019 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-019 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-020 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-021 |
| ichidan | います | いる | 一段動詞・丁寧 | grammar | n5-grammar-022 |
| ichidan | 見ません | 見る | 一段動詞・丁寧否定 | grammar | n5-grammar-032 |
| ichidan | 見ます | 見る | 一段動詞・丁寧 | grammar | n5-grammar-032 |
| ichidan | 見ました | 見る | 一段動詞・丁寧過去 | grammar | n5-grammar-032 |
| ichidan | 見ませんでした | 見る | 一段動詞・丁寧否定過去 | grammar | n5-grammar-032 |
| iAdj | 安くない | 安い | い形容詞・否定 | grammar | n5-grammar-023 |
| iAdj | 安かった | 安い | い形容詞・過去 | grammar | n5-grammar-023 |
| iAdj | 高くない | 高い | い形容詞・否定 | grammar | n5-grammar-024 |
| iAdj | 高かった | 高い | い形容詞・過去 | grammar | n5-grammar-024 |
| iAdj | 寒かった | 寒い | い形容詞・過去 | grammar | n5-grammar-025 |
| iAdj | 寒くない | 寒い | い形容詞・否定 | grammar | n5-grammar-025 |
| iAdj | 難しくない | 難しい | い形容詞・否定 | grammar | n5-grammar-026 |
| iAdj | 難しかった | 難しい | い形容詞・過去 | grammar | n5-grammar-026 |
| naAdj | 静かでした | 静か | な形容詞・丁寧過去 | grammar | n5-grammar-027 |
| naAdj | きれいでした | きれい | な形容詞・丁寧過去 | grammar | n5-grammar-028 |
| naAdj | 静かでした | 静か | な形容詞・丁寧過去 | grammar | n5-grammar-029 |
| naAdj | 便利でした | 便利 | な形容詞・丁寧過去 | grammar | n5-grammar-030 |
| naAdj | 予定でした | 予定 | な形容詞・丁寧過去 | grammar | n4-grammar-270 |
| ambiguous | き | き | ambiguous kana-match | grammar | n5-grammar-004 |
| ambiguous | き | き | ambiguous kana-match | grammar | n5-grammar-004 |
| ambiguous | き | き | ambiguous kana-match | grammar | n5-grammar-008 |
| ambiguous | あつい | あつい | ambiguous kana-match | grammar | n5-grammar-016 |
| ambiguous | あつい | あつい | ambiguous kana-match | grammar | n5-grammar-016 |
| ambiguous | せん | せん | ambiguous kana-match | grammar | n5-grammar-017 |
| ambiguous | せん | せん | ambiguous kana-match | grammar | n5-grammar-017 |
| ambiguous | せん | せん | ambiguous kana-match | grammar | n5-grammar-017 |
| ambiguous | せん | せん | ambiguous kana-match | grammar | n5-grammar-017 |
| ambiguous | せん | せん | ambiguous kana-match | grammar | n5-grammar-017 |

## 人工抽樣確認
前 50 個 missing-candidate 已人工抽樣檢視：未發現中文分類名稱、欄位名稱、完整句子、句子殘片或助詞助動詞誤判；仍需 Batch 12 對讀音、詞性、中文意思與 JLPT 進行人工確認。

## Batch 12 建議優先順序
1. 優先人工確認 missing-candidate 高頻項與 manual-review。
2. 確認 compound 是否應拆分、保留為固定表現、或新增為獨立詞條。
3. 確認 kana-match 同音詞風險後，再補入 vocabulary.json。

## 確認未修改正式資料
本批僅新增／更新盤點腳本與精簡報告；未修改 vocabulary.json、grammar.json、japaneseReadingQuestions.js、script.js、日文 UI 或英文網站檔案。
