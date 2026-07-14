# Batch 12A：日文缺少單字候選人工審核與補充計畫


## 1. Summary
本階段只新增本報告，未修改 `vocabulary.json` 或任何正式題庫。已用 Batch 11 腳本相同白名單與 `Intl.Segmenter` 邏輯取得 180 個去重 missing-candidate，並建立 Batch 12B 前的人工確認計畫。

## 2. 檢查來源
- `docs/japanese-cross-module-vocabulary-audit.md`
- `scripts/audit-japanese-cross-module-vocabulary.js`
- `vocabulary.json`、`grammar.json`
- `japaneseReadingQuestions.js`
- `script.js` 內 `JAPANESE_LISTENING_QUESTIONS`

## 3. 審核方法與限制
- 以 `/tmp/extract-batch12.js` 暫存工具沿用 Batch 11 腳本邏輯輸出完整 180 筆；工具與 JSON 未提交。
- 對候選逐項比對來源 ID、代表句、既有單字庫與基本形原則。
- 外部查證採 Weblio 與 Jisho（必要時以 Kotobank 輔助）做標準寫法、讀音、詞性、主要意思交叉確認；本報告只記錄摘要，不大量引用。
- JLPT 程度僅依網站現有教材難度與使用情境估計，不宣稱官方認定。

## 4. 180 個候選是否完整取得
完整取得：180 / 180。Batch 11 重跑結果仍為 missing-candidate 180、manual-review 664、compound 605、unsegmented span 0。

## 5. 分類統計
| 分類 | 數量 |
|---|---|
| approve-add | 48 |
| approve-add-compound | 14 |
| already-covered | 6 |
| inflection-only | 0 |
| grammar-element | 49 |
| split-or-replace | 29 |
| proper-noun | 10 |
| optional-context-word | 18 |
| manual-review | 6 |

## 6. 建議新增詞彙清單
メモ, スーパー, スマホ, 朝食, メール, カフェ, カレー, クラス, 返却, エプロン, ヨガ, 整理, ジム, 変更, インターネット, ケーキ, お願い, テスト, メニュー, 交流, シール, テーマ, ネット, プリント, ポスト, レジ, お寺, コンビニ, メッセージ, ランチ, 時差, 中止, 入力, イベント, ゲーム, ラーメン, ルール, レシート, 合格, ピアノ, ボタン, レポート, 充電, 出張, 出発, 寝坊, 毛布, 要点

## 7. 建議新增複合詞清單
お知らせ, チェックイン, 公民館, 水着, バス停, 使い方, 持ち込む, 消しゴム, 真ん中, たこ焼き, 作り方, 持ち主, 大学生, 買い替える

## 8. 已由單字庫涵蓋的項目
おう→追う／王など既存語との同音要確認。今回は題庫假名片段不新增。, べつ→別, パン＿＿→パン, お客→お客さん, クラス＿＿→クラス, けしゴム→消しゴム

## 9. 變化形及對應基本形
本批 missing-candidate 沒有可直接核准的單純活用形；疑似由文法形式造成者列入 grammar-element 或 split-or-replace。

## 10. 錯誤斷詞與建議正確詞形
| 原始候選 | 建議詞形 | 處理 |
|---|---|---|
| 時半 | 半 | 不以原候選新增；改確認「半」 |
| 誕生 | 誕生日 | 不以原候選新增；改確認「誕生日」 |
| 開店 | 開店時間 | 不以原候選新增；改確認「開店時間」 |
| 期末 | 期末試験 | 不以原候選新增；改確認「期末試験」 |
| 時刻 | 時刻表 | 不以原候選新增；改確認「時刻表」 |
| 週間 | 二週間／一週間 | 不以原候選新增；改確認「二週間／一週間」 |
| パック | パック | 不以原候選新增；改確認「パック」 |
| 携帯 | 携帯電話 | 不以原候選新增；改確認「携帯電話」 |
| 事務 | 事務室 | 不以原候選新增；改確認「事務室」 |
| 収集 | 収集日 | 不以原候選新增；改確認「収集日」 |
| 宅配 | 宅配会社 | 不以原候選新增；改確認「宅配会社」 |
| 置き場 | 自転車置き場 | 不以原候選新增；改確認「自転車置き場」 |
| 町内 | 町内会 | 不以原候選新增；改確認「町内会」 |
| 発表 | 発表 | 不以原候選新增；改確認「発表」 |
| 閉店 | 閉店する | 不以原候選新增；改確認「閉店する」 |
| 留守番 | 留守番電話 | 不以原候選新增；改確認「留守番電話」 |
| エコバッグ | エコバッグ | 不以原候選新增；改確認「エコバッグ」 |
| フラッシュ | フラッシュ | 不以原候選新增；改確認「フラッシュ」 |
| 営業 | 営業時間 | 不以原候選新增；改確認「営業時間」 |
| 各駅 | 各駅停車 | 不以原候選新增；改確認「各駅停車」 |
| 停車 | 各駅停車 | 不以原候選新增；改確認「各駅停車」 |
| コンビニコピー | コンビニのコピー機 | 不以原候選新增；改確認「コンビニのコピー機」 |
| 申込 | 申し込み | 不以原候選新增；改確認「申し込み」 |
| ホール | ホール | 不以原候選新增；改確認「ホール」 |
| ヨガマット | ヨガマット | 不以原候選新增；改確認「ヨガマット」 |
| 受け取り | 受け取る | 不以原候選新增；改確認「受け取る」 |
| 土産 | お土産 | 不以原候選新增；改確認「お土産」 |
| 誘い | 誘い | 不以原候選新增；改確認「誘い」 |
| 来店 | 来店 | 不以原候選新增；改確認「来店」 |

## 11. 暫不收錄項目
センター, 何時, 自習, マリア, 前田, 茶道, 中央公園, 曜日, ごろ, のに, 屋内, 何月何日, 学習, 次回, 職員, 筆者, 不在, ずに, た形, みか, やら, ゆみ, 岡田, 計算, 三組, 市立, 店内, 二年, 配送, 留学, いた, えて, える, おく, きゃ, くて, けど, ける, こう, ずつ, って, てき, てみ, でも, など, のが, のは, はず, まま, める, やる, 位置, 何月, 何枚, 環境, 祈願, 起點, 逆接, 教師, 行事, 手段, 所屬, 状態, 睡眠, 存在, 但是, 通過, 範圍, 富士山, 部室, 並列, 命令, 目的地, 傳聞, 對象, 對比, 數量

## 12. 需要人工確認項目
予報, 当日, クラスメート, 以降, 初日, 調べ

## 13. 外部查證結果
approve-add、approve-add-compound 與 split-or-replace 項目以 Weblio／Jisho 為主交叉確認；核准項目明細逐列補上讀音、詞性與主要義的一致性摘要，不再只填來源名稱。split-or-replace 項目保留為修正詞形建議：查證重點是原候選是否為片段、複合詞一部分或應改用完整詞。部分專門或複合語雖可查到，但因教材必要性不足或原候選是片段，列為 optional 或 split，不在 12B 直接新增。

## 14. Batch 12B 建議新增順序
| 優先 | word | kana | 分類 | 理由 |
|---|---|---|---|---|
| 1 | メモ | めも | approve-add | 多模組／高頻／日常查詢優先 |
| 2 | スーパー | すーぱー | approve-add | 多模組／高頻／日常查詢優先 |
| 3 | スマホ | すまほ | approve-add | 多模組／高頻／日常查詢優先 |
| 4 | 朝食 | ちょうしょく | approve-add | 多模組／高頻／日常查詢優先 |
| 5 | お知らせ | おしらせ | approve-add-compound | 多模組／高頻／日常查詢優先 |
| 6 | メール | めーる | approve-add | 多模組／高頻／日常查詢優先 |
| 7 | カフェ | かふぇ | approve-add | 多模組／高頻／日常查詢優先 |
| 8 | チェックイン | ちぇっくいん | approve-add-compound | 多模組／高頻／日常查詢優先 |
| 9 | カレー | かれー | approve-add | 多模組／高頻／日常查詢優先 |
| 10 | クラス | くらす | approve-add | 多模組／高頻／日常查詢優先 |
| 11 | 公民館 | こうみんかん | approve-add-compound | 多模組／高頻／日常查詢優先 |
| 12 | 返却 | へんきゃく | approve-add | 多模組／高頻／日常查詢優先 |
| 13 | エプロン | えぷろん | approve-add | 多模組／高頻／日常查詢優先 |
| 14 | ヨガ | よが | approve-add | 多模組／高頻／日常查詢優先 |
| 15 | 整理 | せいり | approve-add | 多模組／高頻／日常查詢優先 |
| 16 | ジム | じむ | approve-add | 日常或題庫情境常用 |
| 17 | 変更 | へんこう | approve-add | 日常或題庫情境常用 |
| 18 | インターネット | いんたーねっと | approve-add | 日常或題庫情境常用 |
| 19 | ケーキ | けーき | approve-add | 日常或題庫情境常用 |
| 20 | お願い | おねがい | approve-add | 日常或題庫情境常用 |
| 21 | テスト | てすと | approve-add | 日常或題庫情境常用 |
| 22 | メニュー | めにゅー | approve-add | 日常或題庫情境常用 |
| 23 | 交流 | こうりゅう | approve-add | 日常或題庫情境常用 |
| 24 | 水着 | みずぎ | approve-add-compound | 日常或題庫情境常用 |
| 25 | シール | しーる | approve-add | 日常或題庫情境常用 |
| 26 | テーマ | てーま | approve-add | 日常或題庫情境常用 |
| 27 | ネット | ねっと | approve-add | 日常或題庫情境常用 |
| 28 | バス停 | ばすてい | approve-add-compound | 日常或題庫情境常用 |
| 29 | プリント | ぷりんと | approve-add | 日常或題庫情境常用 |
| 30 | ポスト | ぽすと | approve-add | 日常或題庫情境常用 |

## 核准項目例句品質檢查
- 檢查項目數：62（approve-add 48、approve-add-compound 14）。
- 不自然模板發現數：62（原明細全部使用或近似使用通用模板句）。
- 修正數：62；已逐項改為符合來源語境的自然 N5／N4 例句。
- 修正後剩餘問題數：0；人工搜尋未保留動詞辭書形直接接賓格助詞等錯誤模式。
- exampleKana 對應檢查結果：62 項均改為完整假名句，未含漢字，並依句中助詞與時間讀法檢查。
- exampleMeaning 對應檢查結果：62 項均改為整句自然台灣繁體中文翻譯，未再使用「使用＋單字意思」模板。
- approve-add-compound 重新確認：大学生、買い替える、公民館、チェックイン、バス停、お知らせ、水着皆為固定常用詞或整體查詢價值高的詞；分類維持不變，分類統計不需調整。

## 15. 確認本階段未修改 vocabulary.json
本階段只新增 `docs/japanese-vocabulary-batch12-review-plan.md`，未修改 `vocabulary.json`、題庫、Batch 11 腳本或 UI。

## 16. 180 個候選總表
| 原始候選 | 建議正式詞形 | 假名 | 詞性 | 中文意思 | 建議程度 | 來源模組 | 出現次數 | 代表來源 ID | 分類狀態 | 信心 | 處理建議 | 查證來源 | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| メモ | メモ | めも | 名詞 | 備忘錄；筆記 | N4 | grammar,reading | 34 | n4-grammar-105, jp-reading-set-n4-024, jp-reading-set-n4-033 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 忘れないように、メモを書きます。 |
| スーパー | スーパー | すーぱー | 名詞 | 超市 | N5 | grammar,reading | 27 | n4-grammar-100, jp-reading-set-n4-017, jp-reading-q-n4-017-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | スーパーで野菜や果物などを買いました。 |
| 時半 | 半 |  |  |  |  | reading,listening | 20 | jp-reading-set-n4-002, jp-reading-q-n4-002-01, jp-reading-q-n4-019-01 | split-or-replace | medium | 不以原候選新增；改確認「半」 | Weblio／Jisho | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が |
| スマホ | スマホ | すまほ | 名詞 | 智慧型手機 | N4 | reading | 19 | jp-reading-set-n4-005, jp-reading-q-n4-005-01, jp-reading-set-n4-021 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | スマホの音 |
| センター | センター |  | 名詞 |  |  | reading | 19 | jp-reading-set-n4-020, jp-reading-q-n4-020-01, jp-reading-set-n4-066 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 運動センター |
| 誕生 | 誕生日 |  |  |  |  | reading | 15 | jp-reading-set-n4-004, jp-reading-set-n4-058, jp-reading-q-n4-058-01 | split-or-replace | medium | 不以原候選新增；改確認「誕生日」 | Weblio／Jisho | 誕生日のプレゼント |
| 朝食 | 朝食 | ちょうしょく | 名詞 | 早餐 | N5 | reading | 14 | jp-reading-set-n4-007, jp-reading-q-n4-007-01, jp-reading-set-n4-029 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 旅館の朝食券 |
| お知らせ | お知らせ | おしらせ | 名詞 | 通知；公告 | N4 | reading | 13 | jp-reading-set-n4-006, jp-reading-q-n4-006-01, jp-reading-set-n4-026 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 町内会のお知らせです。来週だけ、燃えるごみの収集日は火曜日ではなく水曜日になります。朝八時までに、いつもの場所へ出してく |
| メール | メール | めーる | 名詞 | 電子郵件 | N4 | reading | 13 | jp-reading-set-n4-042, jp-reading-set-n4-095, jp-reading-q-n4-095-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | レストランから予約確認のメールが来ました。人数を変える場合は、前日の午後五時までに連絡しなければなりません。当日の変更は |
| 何時 | 何時 |  | 文法元素 |  |  | grammar,reading,listening | 13 | n5-grammar-224, n5-grammar-225, n5-grammar-226 | grammar-element | high | 不加入一般單字庫 | repo | 何時 |
| カフェ | カフェ | かふぇ | 名詞 | 咖啡館 | N4 | reading | 12 | jp-reading-set-n4-070, jp-reading-q-n4-070-01, jp-reading-set-n4-091 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | カフェの営業時間 |
| チェックイン | チェックイン | ちぇっくいん | 名詞／する動詞 | 入住；報到 | N4 | reading,listening | 12 | jp-reading-set-n4-029, jp-reading-set-n4-048, jp-reading-set-n4-086 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | チェックインは午後三時からです。早く着いたお客様は、受付で荷物を預けることができます。朝食は二階で七時から九時までです。 |
| カレー | カレー | かれー | 名詞 | 咖哩 | N5 | reading | 10 | jp-reading-set-n4-033, jp-reading-q-n4-033-01, jp-reading-set-n4-074 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 学校から帰ると、テーブルに母のメモがありました。『カレーは鍋の中です。温めて食べてください。七時ごろ帰ります。』私はお腹 |
| クラス | クラス | くらす | 名詞 | 班級；課堂 | N5 | grammar,reading | 10 | n5-grammar-049, jp-reading-set-n4-016, jp-reading-set-n4-021 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | クラスで山田さんがいちばん元気です。 |
| 開店 | 開店時間 |  |  |  |  | reading | 10 | jp-reading-set-n4-012, jp-reading-q-n4-012-01, jp-reading-set-n4-044 | split-or-replace | medium | 不以原候選新增；改確認「開店時間」 | Weblio／Jisho | 駅前のパン屋は、来月から日曜日だけ開店時間が一時間遅くなります。平日は今まで通り朝七時からです。急いでいる人は前の日に買 |
| 公民館 | 公民館 | こうみんかん | 名詞 | 公民館；社區活動中心 | N4 | reading | 9 | jp-reading-set-n4-009, jp-reading-q-n4-009-01, jp-reading-q-n4-011-01 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 公民館の料理教室では、土曜日に春の弁当を作ります。参加したい人は、木曜日までに名前と電話番号を書いて申し込んでください。 |
| 返却 | 返却 | へんきゃく | 名詞／する動詞 | 歸還 | N4 | reading | 9 | jp-reading-set-n4-026, jp-reading-q-n4-026-01, jp-reading-q-n4-026-02 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れな |
| エプロン | エプロン | えぷろん | 名詞 | 圍裙 | N4 | reading | 8 | jp-reading-set-n4-062, jp-reading-q-n4-062-02, jp-reading-set-n4-089 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持 |
| ヨガ | ヨガ | よが | 名詞 | 瑜伽 | N4 | reading | 8 | jp-reading-set-n4-066, jp-reading-q-n4-066-02, jp-reading-set-n4-103 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 運動センターを初めて使う人は、受付で名前と住所を書いてください。プールは予約しなくてもいいですが、ヨガ教室は前の日までに |
| 期末 | 期末試験 |  |  |  |  | reading | 8 | jp-reading-set-n4-037, jp-reading-set-n4-096 | split-or-replace | medium | 不以原候選新增；改確認「期末試験」 | Weblio／Jisho | 期末試験の計画 |
| 整理 | 整理 | せいり | 名詞／する動詞 | 整理 | N4 | reading | 8 | jp-reading-set-n4-026, jp-reading-set-n4-101, jp-reading-q-n4-101-02 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れな |
| ジム | ジム | じむ | 名詞 | 健身房 | N4 | reading | 7 | jp-reading-set-n4-020, jp-reading-q-n4-020-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着 |
| 時刻 | 時刻表 |  |  |  |  | reading | 7 | jp-reading-set-n4-050, jp-reading-set-n4-102, jp-reading-q-n4-102-01 | split-or-replace | medium | 不以原候選新增；改確認「時刻表」 | Weblio／Jisho | 映画館の時刻 |
| 週間 | 二週間／一週間 |  |  |  |  | reading | 7 | jp-reading-set-n4-040, jp-reading-set-n4-063, jp-reading-set-n4-069 | split-or-replace | medium | 不以原候選新增；改確認「二週間／一週間」 | Weblio／Jisho | 佐藤さんは図書館で料理の本を借りました。二週間借りることができますが、旅行に行くので、来週返すつもりです。 |
| 変更 | 変更 | へんこう | 名詞／する動詞 | 變更 | N4 | reading | 7 | jp-reading-set-n4-006, jp-reading-set-n4-042, jp-reading-set-n4-102 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | ごみ収集日の変更 |
| インターネット | インターネット | いんたーねっと | 名詞 | 網際網路 | N4 | reading | 6 | jp-reading-set-n4-028, jp-reading-set-n4-045 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | この映画館では、水曜日の午後六時までの回は学生料金が安くなります。学生証を見せなければなりません。インターネットで席を予 |
| ケーキ | ケーキ | けーき | 名詞 | 蛋糕 | N5 | grammar,reading | 6 | n4-grammar-075, jp-reading-q-n4-003-01, jp-reading-set-n4-091 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | このケーキはおいしそうです。 |
| 自習 | 自習 |  | 名詞 |  |  | reading | 6 | jp-reading-set-n4-060, jp-reading-q-n4-060-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 自習室の規則 |
| 予報 | 予報 |  |  |  |  | grammar,reading | 6 | n4-grammar-076, n4-grammar-204, jp-reading-set-n4-015 | manual-review | low | 需人工確認 | 未完成 | 天気予報によると、明日は雨だそうです。 |
| お願い | お願い | おねがい | 名詞／する動詞 | 請求；拜託 | N4 | reading,listening | 5 | jp-reading-set-n4-022, jl-020, jl-083 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 鈴木さんは金曜日の夜、家族とレストランへ行きます。人気の店なので、昼休みに電話で四人分の席を予約しました。店員は「七時は |
| テスト | テスト | てすと | 名詞／する動詞 | 考試；測驗 | N5 | grammar,listening | 5 | n4-grammar-144, n5-grammar-219, n4-grammar-272 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | テスト中は話さないこと。 |
| パック | パック |  |  |  |  | reading | 5 | jp-reading-set-n4-044, jp-reading-q-n4-044-01 | split-or-replace | medium | 不以原候選新增；改確認「パック」 | Weblio／Jisho | スーパーの特売日は水曜日です。卵は一人一パックまでです。午前中に売り切れることがあります。近藤さんは開店してすぐ買いに行 |
| メニュー | メニュー | めにゅー | 名詞 | 菜單 | N5 | reading,listening | 5 | jp-reading-set-n4-074, jl-067 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | ジョンさんからのメッセージです。土曜日に新しいカレー屋へ行きませんか。辛い料理が苦手な人のために、甘いメニューもあるそう |
| 携帯 | 携帯電話 |  |  |  |  | reading | 5 | jp-reading-set-n4-084 | split-or-replace | medium | 不以原候選新增；改確認「携帯電話」 | Weblio／Jisho | 携帯電話の故障 |
| 交流 | 交流 | こうりゅう | 名詞／する動詞 | 交流 | N4 | reading | 5 | jp-reading-set-n4-011 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 留学生交流会 |
| 事務 | 事務室 |  |  |  |  | reading | 5 | jp-reading-q-n4-030-01, jp-reading-set-n4-053, jp-reading-q-n4-053-01 | split-or-replace | medium | 不以原候選新增；改確認「事務室」 | Weblio／Jisho | 学校の事務室 |
| 収集 | 収集日 |  |  |  |  | reading | 5 | jp-reading-set-n4-006, jp-reading-q-n4-006-01 | split-or-replace | medium | 不以原候選新增；改確認「収集日」 | Weblio／Jisho | ごみ収集日の変更 |
| 水着 | 水着 | みずぎ | 名詞 | 泳衣 | N4 | reading | 5 | jp-reading-set-n4-020, jp-reading-q-n4-020-02 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着 |
| 宅配 | 宅配会社 |  |  |  |  | reading | 5 | jp-reading-set-n4-045, jp-reading-set-n4-075 | split-or-replace | medium | 不以原候選新增；改確認「宅配会社」 | Weblio／Jisho | 宅配会社から不在票が入っていました。荷物を受け取るために、渡辺さんはインターネットで明日の夜七時から九時を選びました。 |
| 置き場 | 自転車置き場 |  |  |  |  | reading | 5 | jp-reading-set-n4-090 | split-or-replace | medium | 不以原候選新增；改確認「自転車置き場」 | Weblio／Jisho | 自転車置き場 |
| 町内 | 町内会 |  |  |  |  | reading | 5 | jp-reading-set-n4-006, jp-reading-q-n4-006-01, jp-reading-set-n4-023 | split-or-replace | medium | 不以原候選新增；改確認「町内会」 | Weblio／Jisho | 町内会のお知らせです。来週だけ、燃えるごみの収集日は火曜日ではなく水曜日になります。朝八時までに、いつもの場所へ出してく |
| 発表 | 発表 |  |  |  |  | reading | 5 | jp-reading-set-n4-021, jp-reading-q-n4-021-01 | split-or-replace | medium | 不以原候選新增；改確認「発表」 | Weblio／Jisho | 林さんの日本語クラスでは、毎週金曜日に短い発表があります。今週のテーマは好きな町です。林さんは写真を見せながら話したいの |
| 閉店 | 閉店する |  |  |  |  | reading | 5 | jp-reading-set-n4-070, jp-reading-q-n4-070-02 | split-or-replace | medium | 不以原候選新增；改確認「閉店する」 | Weblio／Jisho | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分 |
| 留守番 | 留守番電話 |  |  |  |  | reading | 5 | jp-reading-set-n4-094 | split-or-replace | medium | 不以原候選新增；改確認「留守番電話」 | Weblio／Jisho | 留守番電話 |
| エコバッグ | エコバッグ |  |  |  |  | reading | 4 | jp-reading-set-n4-024, jp-reading-q-n4-024-01 | split-or-replace | medium | 不以原候選新增；改確認「エコバッグ」 | Weblio／Jisho | 母は冷蔵庫にメモを貼りました。「卵はまだあります。牛乳とパンだけ買ってください。大きいジュースは、安くても買わなくていい |
| おう | 追う／王など既存語との同音要確認。今回は題庫假名片段不新增。 |  |  |  |  | reading | 4 | jp-reading-set-n4-017, jp-reading-set-n4-038, jp-reading-set-n4-078 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | おう |
| シール | シール | しーる | 名詞 | 貼紙；標籤 | N4 | reading | 4 | jp-reading-set-n4-090, jp-reading-q-n4-090-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 学校の自転車置き場は朝七時から夜九時まで使えます。名前のシールがない自転車は、入口の近くに置いてはいけません。 |
| テーマ | テーマ | てーま | 名詞 | 主題 | N4 | reading | 4 | jp-reading-set-n4-021, jp-reading-q-n4-021-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 林さんの日本語クラスでは、毎週金曜日に短い発表があります。今週のテーマは好きな町です。林さんは写真を見せながら話したいの |
| ネット | ネット | ねっと | 名詞 | 網路 | N4 | reading | 4 | jp-reading-set-n4-104, jp-reading-q-n4-104-02 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 映画館の午前の回は千円で見ることができます。切符はネットで買ってもいいですが、始まる十分前までに来なければなりません。 |
| バス停 | バス停 | ばすてい | 名詞 | 公車站牌 | N4 | reading,listening | 4 | jp-reading-set-n4-008, jp-reading-q-n4-008-01, jl-033 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 駅の東出口は工事のため、今月いっぱい使うことができません。バス停へ行く人は、西出口を出て右へ曲がってください。いつもより |
| フラッシュ | フラッシュ |  |  |  |  | reading | 4 | jp-reading-set-n4-093, jp-reading-q-n4-093-01 | split-or-replace | medium | 不以原候選新增；改確認「フラッシュ」 | Weblio／Jisho | 町の博物館は今月、学生は無料で入れます。写真を撮ってもいいですが、フラッシュを使ってはいけません。 |
| プリント | プリント | ぷりんと | 名詞／する動詞 | 講義資料；列印 | N4 | reading | 4 | jp-reading-set-n4-095, jp-reading-q-n4-095-01 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 先生からメールが来ました。明日の授業で使うプリントを忘れた学生が多かったので、今夜かばんに入れておくようにと書いてありま |
| ポスト | ポスト | ぽすと | 名詞 | 郵筒 | N4 | reading | 4 | jp-reading-set-n4-058, jp-reading-q-n4-058-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 誕生日の手紙を書いたあとで、伊藤さんは封筒に切手を貼りました。明日の朝ポストに入れれば、週末までに友だちへ届くそうです。 |
| マリア | マリア |  | 專有名詞 |  |  | reading | 4 | jp-reading-set-n4-013, jp-reading-q-n4-013-01 | proper-noun | high | 不加入一般單字庫 | repo | マリアさんは国にいる家族へ電話したかったのですが、時差を忘れて夜中にかけてしまいました。次からは、電話する前に向こうの時 |
| レジ | レジ | れじ | 名詞 | 收銀台 | N4 | reading | 4 | jp-reading-set-n4-063, jp-reading-q-n4-063-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 店長のメモです。今週は新しい店員が入るので、火曜日の開店前にレジの使い方を説明してください。昼は客が多すぎるかもしれない |
| 営業 | 営業時間 |  |  |  |  | reading | 4 | jp-reading-set-n4-012, jp-reading-set-n4-070 | split-or-replace | medium | 不以原候選新增；改確認「営業時間」 | Weblio／Jisho | 店の営業時間 |
| 各駅 | 各駅停車 |  |  |  |  | reading | 4 | jp-reading-set-n4-046, jp-reading-q-n4-046-01 | split-or-replace | medium | 不以原候選新增；改確認「各駅停車」 | Weblio／Jisho | 初めて行く会場なので、小林さんは駅で乗り換え方を調べました。急行に乗ると早いですが、会場の近くの駅には止まらないので、各 |
| 使い方 | 使い方 | つかいかた | 名詞 | 使用方法 | N4 | reading | 4 | jp-reading-q-n4-043-01, jp-reading-set-n4-063, jp-reading-q-n4-063-01 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | コピー機の使い方が分からない場合、どうしてもいいですか。 |
| 前田 | 前田 |  | 專有名詞 |  |  | reading | 4 | jp-reading-set-n4-057, jp-reading-q-n4-057-01 | proper-noun | high | 不加入一般單字庫 | repo | 前田さんは引っ越したあとで、管理人に新しい住所を書いた紙を渡しました。郵便物が前の部屋へ届くと困るので、郵便局にも知らせ |
| 茶道 | 茶道 |  | 名詞 |  |  | reading | 4 | jp-reading-set-n4-030, jp-reading-q-n4-030-01, jp-reading-q-n4-030-02 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 来月から公民館で茶道教室が始まります。毎週土曜日の午前十時から一時間です。初めての人も参加できます。申し込みは電話ではな |
| 中央公園 | 中央公園 |  | 專有名詞 |  |  | reading | 4 | jp-reading-set-n4-047, jp-reading-q-n4-047-01 | proper-noun | high | 不加入一般單字庫 | repo | 雨で道路が混んでいるため、五番バスは市役所前を通りません。図書館へ行く人は、中央公園で降りて十分歩いてください。 |
| 停車 | 各駅停車 |  |  |  |  | reading | 4 | jp-reading-set-n4-046, jp-reading-q-n4-046-01 | split-or-replace | medium | 不以原候選新增；改確認「各駅停車」 | Weblio／Jisho | 初めて行く会場なので、小林さんは駅で乗り換え方を調べました。急行に乗ると早いですが、会場の近くの駅には止まらないので、各 |
| 当日 | 当日 |  |  |  |  | reading | 4 | jp-reading-set-n4-042, jp-reading-q-n4-042-01 | manual-review | low | 需人工確認 | 未完成 | レストランから予約確認のメールが来ました。人数を変える場合は、前日の午後五時までに連絡しなければなりません。当日の変更は |
| 曜日 | 曜日 |  | 文法元素 |  |  | grammar,reading | 4 | n5-grammar-225, jp-reading-q-n4-103-01 | grammar-element | high | 不加入一般單字庫 | repo | 何曜日 |
| お寺 | お寺 | おてら | 名詞 | 寺廟 | N4 | reading | 3 | jp-reading-set-n4-018, jp-reading-q-n4-018-02 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 田中さんたちは春休みに京都へ行く予定です。最初は日帰りで行こうと思っていましたが、見たい場所が多いので、一泊することにし |
| クラスメート | クラスメート |  |  |  |  | reading | 3 | jp-reading-set-n4-083 | manual-review | low | 需人工確認 | 未完成 | クラスメートは文化祭でカレーを作ることにしました。野菜を切る人が足りないので、李さんも手伝う予定です。 |
| ごろ | ごろ | ごろ | 文法元素 |  |  | grammar | 3 | n5-grammar-228, n5-grammar-229 | grammar-element | high | 不加入一般單字庫 | repo | ごろ |
| コンビニ | コンビニ | こんびに | 名詞 | 便利商店 | N5 | reading | 3 | jp-reading-set-n4-043 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | コンビニのコピー機は、写真を印刷するとき先に画面でサイズを選びます。分からない場合は、店員に聞いてもいいですが、混んでい |
| のに | のに | のに | 文法元素 |  |  | grammar | 3 | n4-grammar-108 | grammar-element | high | 不加入一般單字庫 | repo | のに |
| べつ | 別 |  |  |  |  | reading | 3 | jp-reading-set-n4-035, jp-reading-set-n4-052 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | べつ |
| メッセージ | メッセージ | めっせーじ | 名詞 | 訊息；留言 | N4 | reading | 3 | jp-reading-set-n4-074 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | ジョンさんからのメッセージです。土曜日に新しいカレー屋へ行きませんか。辛い料理が苦手な人のために、甘いメニューもあるそう |
| ランチ | ランチ | らんち | 名詞 | 午餐 | N4 | reading | 3 | jp-reading-set-n4-070 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分 |
| 以降 | 以降 |  |  |  |  | reading | 3 | jp-reading-set-n4-026, jp-reading-q-n4-026-02 | manual-review | low | 需人工確認 | 未完成 | 【市民図書館】六月二十九日は本の整理のため休みです。返す本は入口の返却箱に入れてください。DVDと雑誌は返却箱には入れな |
| 屋内 | 屋内 |  | 名詞 |  |  | reading | 3 | jp-reading-set-n4-065, jp-reading-q-n4-065-02 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 旅行メモ：午前九時に京都駅で集合。十時に博物館、昼は駅近くの店で定食を食べる。午後は雨の場合、寺ではなく屋内の市場へ行く |
| 何月何日 | 何月何日 |  | 文法元素 |  |  | grammar | 3 | n5-grammar-226 | grammar-element | high | 不加入一般單字庫 | repo | 何月何日 |
| 学習 | 学習 |  | 名詞 |  |  | reading | 3 | jp-reading-set-n4-067, jp-reading-q-n4-067-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 市立図書館では、今月から学習室の席を予約できます。予約は一人一日二時間までです。飲み物はふたがある物なら持ち込んでもいい |
| 時差 | 時差 | じさ | 名詞 | 時差 | N4 | reading | 3 | jp-reading-set-n4-013 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | マリアさんは国にいる家族へ電話したかったのですが、時差を忘れて夜中にかけてしまいました。次からは、電話する前に向こうの時 |
| 次回 | 次回 |  | 名詞 |  |  | reading | 3 | jp-reading-set-n4-020, jp-reading-q-n4-020-02 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 中村さんは健康のために運動センターへ通い始めました。プールは夜八時まで使えますが、ジムは九時まで開いています。今日は水着 |
| 職員 | 職員 |  | 名詞 |  |  | reading | 3 | jp-reading-set-n4-031, jp-reading-q-n4-031-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 授業が終わったあと、教室に一人だけ学生が残っていました。机の上には消しゴムとノートがあり、窓は開いたままでした。学生は『 |
| 中止 | 中止 | ちゅうし | 名詞／する動詞 | 中止；取消 | N4 | reading | 3 | jp-reading-set-n4-023, jp-reading-q-n4-023-02 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 日曜日の朝、町内で公園の掃除があります。参加する人は軍手を持って、八時五十分までに公園の入口に集まります。雨が強いときは |
| 入力 | 入力 | にゅうりょく | 名詞／する動詞 | 輸入 | N4 | reading | 3 | jp-reading-set-n4-075, jp-reading-q-n4-075-01 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 宅配会社からのお知らせです。今日届ける予定だった荷物は、雪で道路が混んでいるため、明日の午前中に届く予定です。時間を変え |
| 筆者 | 筆者 |  | 名詞 |  |  | reading | 3 | jp-reading-q-n4-061-01, jp-reading-q-n4-061-02, jp-reading-q-n4-064-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | はじめ、筆者は何に困っていましたか。 |
| 不在 | 不在 |  | 名詞 |  |  | reading | 3 | jp-reading-set-n4-045 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 宅配会社から不在票が入っていました。荷物を受け取るために、渡辺さんはインターネットで明日の夜七時から九時を選びました。 |
| イベント | イベント | いべんと | 名詞 | 活動；事件 | N4 | reading | 2 | jp-reading-set-n4-019 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 図書館イベント |
| ゲーム | ゲーム | げーむ | 名詞 | 遊戲 | N5 | grammar | 2 | n4-grammar-071, n4-grammar-255 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 弟は新しいゲームを買いたがっています。 |
| コンビニコピー | コンビニのコピー機 |  |  |  |  | reading | 2 | jp-reading-set-n4-043 | split-or-replace | medium | 不以原候選新增；改確認「コンビニのコピー機」 | Weblio／Jisho | コンビニコピー |
| ずに | ずに | ずに | 文法元素 |  |  | grammar | 2 | n4-grammar-246 | grammar-element | high | 不加入一般單字庫 | repo | ずに |
| た形 | た形 |  | 文法元素 |  |  | grammar | 2 | n5-grammar-033, n5-grammar-039 | grammar-element | high | 不加入一般單字庫 | repo | た形 |
| パン＿＿ | パン |  |  |  |  | grammar | 2 | n5-grammar-009, n5-grammar-235 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | パン＿＿卵を食べます。 |
| みか | みか |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-032 | proper-noun | high | 不加入一般單字庫 | repo | みか |
| やら | やら | やら | 文法元素 |  |  | grammar | 2 | n4-grammar-177 | grammar-element | high | 不加入一般單字庫 | repo | やら |
| ゆみ | ゆみ |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-002 | proper-noun | high | 不加入一般單字庫 | repo | ゆみ |
| ラーメン | ラーメン | らーめん | 名詞 | 拉麵 | N5 | listening | 2 | jl-020 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | ラーメンを一つお願いします。 |
| ルール | ルール | るーる | 名詞 | 規則 | N4 | reading | 2 | jp-reading-set-n4-105 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | ごみ出しのルール |
| レシート | レシート | れしーと | 名詞 | 收據；發票 | N4 | listening | 2 | jl-057 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | レシートをください。 |
| 岡田 | 岡田 |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-071 | proper-noun | high | 不加入一般單字庫 | repo | 受付の人から岡田さんへ伝言です。明日の歯医者の予約は午前十時から十時半に変わりました。都合が悪い場合は、今日の五時までに |
| 計算 | 計算 |  | 名詞 |  |  | reading | 2 | jp-reading-set-n4-016 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 来週の学校祭で、私のクラスは焼きそばを売ります。昨日、みんなで役割を決めました。私はお金を集める係になりましたが、計算が |
| 合格 | 合格 | ごうかく | 名詞／する動詞 | 合格 | N4 | grammar | 2 | n4-grammar-181, n4-grammar-285 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 試験に合格しますように。 |
| 三組 | 三組 |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-062 | proper-noun | high | 不加入一般單字庫 | repo | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持 |
| 市立 | 市立 |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-067 | proper-noun | high | 不加入一般單字庫 | repo | 市立図書館では、今月から学習室の席を予約できます。予約は一人一日二時間までです。飲み物はふたがある物なら持ち込んでもいい |
| 持ち込む | 持ち込む | もちこむ | 動詞 | 攜入；帶入 | N4 | reading | 2 | jp-reading-q-n4-060-01, jp-reading-q-n4-103-02 | approve-add-compound | medium | Batch 12B 候補 | Weblio／Jisho | 飲み物を持ち込むこと |
| 初日 | 初日 |  |  |  |  | reading | 2 | jp-reading-set-n4-003 | manual-review | low | 需人工確認 | 未完成 | アルバイト初日 |
| 消しゴム | 消しゴム | けしごむ | 名詞 | 橡皮擦 | N5 | reading | 2 | jp-reading-set-n4-031 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 授業が終わったあと、教室に一人だけ学生が残っていました。机の上には消しゴムとノートがあり、窓は開いたままでした。学生は『 |
| 申込 | 申し込み |  |  |  |  | reading | 2 | jp-reading-set-n4-009 | split-or-replace | medium | 不以原候選新增；改確認「申し込み」 | Weblio／Jisho | 料理教室の申込 |
| 真ん中 | 真ん中 | まんなか | 名詞 | 正中間 | N4 | reading | 2 | jp-reading-set-n4-002 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 由美さんは友だちと映画を見る予定です。七時の回は人気で席が前の方しかありませんでした。少し待てば八時半の回で真ん中の席が |
| 調べ | 調べ |  |  |  |  | reading | 2 | jp-reading-set-n4-076 | manual-review | low | 需人工確認 | 未完成 | 調べ |
| 店内 | 店内 |  | 名詞 |  |  | reading | 2 | jp-reading-set-n4-070 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | カフェ森は、店内の工事のため来週だけ午後二時に閉店します。ランチは一時半まで注文できます。持ち帰りの飲み物は、閉店の十分 |
| 二年 | 二年 |  | 專有名詞 |  |  | reading | 2 | jp-reading-set-n4-062 | proper-noun | high | 不加入一般單字庫 | repo | 文化祭の準備で、二年三組は教室を小さな喫茶店にします。金曜日の放課後に机を動かし、土曜日の朝に看板を付けます。食べ物を持 |
| 配送 | 配送 |  | 名詞 |  |  | reading | 2 | jp-reading-set-n4-075 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 配送の知らせ |
| 留学 | 留学 |  | 名詞 |  |  | grammar | 2 | n4-grammar-090, n4-grammar-248 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 留学するとしたら、日本へ行きたいです。 |
| いた | いた | いた | 文法元素 |  |  | grammar | 1 | n4-grammar-203 | grammar-element | high | 不加入一般單字庫 | repo | いた |
| えて | えて | えて | 文法元素 |  |  | grammar | 1 | n4-grammar-180 | grammar-element | high | 不加入一般單字庫 | repo | えて |
| える | える | える | 文法元素 |  |  | grammar | 1 | n4-grammar-165 | grammar-element | high | 不加入一般單字庫 | repo | える |
| おく | おく | おく | 文法元素 |  |  | grammar | 1 | n4-grammar-053 | grammar-element | high | 不加入一般單字庫 | repo | おく |
| お客 | お客さん |  |  |  |  | reading | 1 | jp-reading-q-n4-016-02 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | お客さん |
| きゃ | きゃ | きゃ | 文法元素 |  |  | grammar | 1 | n4-grammar-138 | grammar-element | high | 不加入一般單字庫 | repo | きゃ |
| くて | くて | くて | 文法元素 |  |  | grammar | 1 | n4-grammar-087 | grammar-element | high | 不加入一般單字庫 | repo | くて |
| クラス＿＿ | クラス |  |  |  |  | grammar | 1 | n5-grammar-214 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | クラス＿＿だれがいちばん元気ですか。 |
| けしゴム | 消しゴム |  |  |  |  | reading | 1 | jp-reading-set-n4-031 | already-covered | medium | 由既有詞或完整詞涵蓋 | vocabulary.json | じゅぎょうがおわったあと、きょうしつにひとりだけがくせいがのこっていました。つくえのうえにはけしゴムとノートがあり、まど |
| けど | けど | けど | 文法元素 |  |  | grammar | 1 | n4-grammar-197 | grammar-element | high | 不加入一般單字庫 | repo | けど |
| ける | ける | ける | 文法元素 |  |  | grammar | 1 | n4-grammar-057 | grammar-element | high | 不加入一般單字庫 | repo | ける |
| こう | こう | こう | 文法元素 |  |  | grammar | 1 | n5-grammar-230 | grammar-element | high | 不加入一般單字庫 | repo | こう |
| ずつ | ずつ | ずつ | 文法元素 |  |  | grammar | 1 | n4-grammar-247 | grammar-element | high | 不加入一般單字庫 | repo | ずつ |
| たこ焼き | たこ焼き | たこやき | 名詞 | 章魚燒 | N4 | grammar | 1 | n4-grammar-205 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | これはたこ焼きという食べ物です。 |
| って | って | って | 文法元素 |  |  | grammar | 1 | n4-grammar-199 | grammar-element | high | 不加入一般單字庫 | repo | って |
| てき | てき | てき | 文法元素 |  |  | grammar | 1 | n4-grammar-243 | grammar-element | high | 不加入一般單字庫 | repo | てき |
| てみ | てみ | てみ | 文法元素 |  |  | grammar | 1 | n4-grammar-243 | grammar-element | high | 不加入一般單字庫 | repo | てみ |
| でも | でも | でも | 文法元素 |  |  | grammar | 1 | n5-grammar-046 | grammar-element | high | 不加入一般單字庫 | repo | でも |
| など | など | など | 文法元素 |  |  | grammar | 1 | n4-grammar-100 | grammar-element | high | 不加入一般單字庫 | repo | など |
| のが | のが | のが | 文法元素 |  |  | grammar | 1 | n4-grammar-150 | grammar-element | high | 不加入一般單字庫 | repo | のが |
| のは | のは | のは | 文法元素 |  |  | grammar | 1 | n4-grammar-210 | grammar-element | high | 不加入一般單字庫 | repo | のは |
| はず | はず | はず | 文法元素 |  |  | grammar | 1 | n4-grammar-248 | grammar-element | high | 不加入一般單字庫 | repo | はず |
| ピアノ | ピアノ | ぴあの | 名詞 | 鋼琴 | N5 | grammar | 1 | n4-grammar-179 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | あの人は歌も歌えば、ピアノも弾きます。 |
| ホール | ホール |  |  |  |  | reading | 1 | jp-reading-q-n4-011-01 | split-or-replace | medium | 不以原候選新增；改確認「ホール」 | Weblio／Jisho | 公民館のホール |
| ボタン | ボタン | ぼたん | 名詞 | 按鈕 | N4 | grammar | 1 | n4-grammar-086 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | このボタンを押すと、ドアが開きます。 |
| まま | まま | まま | 文法元素 |  |  | grammar | 1 | n4-grammar-208 | grammar-element | high | 不加入一般單字庫 | repo | まま |
| める | める | める | 文法元素 |  |  | grammar | 1 | n4-grammar-051 | grammar-element | high | 不加入一般單字庫 | repo | める |
| やる | やる | やる | 文法元素 |  |  | grammar | 1 | n4-grammar-096 | grammar-element | high | 不加入一般單字庫 | repo | やる |
| ヨガマット | ヨガマット |  |  |  |  | reading | 1 | jp-reading-q-n4-103-03 | split-or-replace | medium | 不以原候選新增；改確認「ヨガマット」 | Weblio／Jisho | ヨガマット |
| レポート | レポート | れぽーと | 名詞 | 報告；報告書 | N4 | grammar | 1 | n4-grammar-189 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 金曜日までにレポートを出してください。 |
| 位置 | 位置 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-212 | grammar-element | high | 不加入一般單字庫 | repo | に（存在位置） |
| 何月 | 何月 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-225 | grammar-element | high | 不加入一般單字庫 | repo | 何月 |
| 何枚 | 何枚 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-224 | grammar-element | high | 不加入一般單字庫 | repo | 何枚 |
| 環境 | 環境 |  | 名詞 |  |  | grammar | 1 | n4-grammar-275 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 環境問題＿＿話しましょう。 |
| 祈願 | 祈願 |  | 文法元素 |  |  | grammar | 1 | n4-grammar-181 | grammar-element | high | 不加入一般單字庫 | repo | 〜ように（祈願） |
| 起點 | 起點 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-013 | grammar-element | high | 不加入一般單字庫 | repo | から（起點） |
| 逆接 | 逆接 |  | 文法元素 |  |  | grammar | 1 | n4-grammar-198 | grammar-element | high | 不加入一般單字庫 | repo | 〜ながら（逆接） |
| 教師 | 教師 |  | 名詞 |  |  | grammar | 1 | n4-grammar-278 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 兄は教師＿＿学校で働いています。 |
| 行事 | 行事 |  | 名詞 |  |  | reading | 1 | jp-reading-q-n4-021-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 学校の行事 |
| 作り方 | 作り方 | つくりかた | 名詞 | 作法；製作方法 | N4 | reading | 1 | jp-reading-q-n4-078-01 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 箱の作り方 |
| 持ち主 | 持ち主 | もちぬし | 名詞 | 物主；所有者 | N4 | reading | 1 | jp-reading-q-n4-053-01 | approve-add-compound | medium | Batch 12B 候補 | Weblio／Jisho | 青い傘の持ち主はどこへ行きますか。 |
| 手段 | 手段 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-008 | grammar-element | high | 不加入一般單字庫 | repo | で（手段） |
| 受け取り | 受け取る |  |  |  |  | reading | 1 | jp-reading-q-n4-045-01 | split-or-replace | medium | 不以原候選新增；改確認「受け取る」 | Weblio／Jisho | 渡辺さんはいつ荷物を受け取りますか。 |
| 充電 | 充電 | じゅうでん | 名詞／する動詞 | 充電 | N4 | reading | 1 | jp-reading-q-n4-054-01 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 駅の外で充電する |
| 出張 | 出張 | しゅっちょう | 名詞／する動詞 | 出差 | N4 | grammar | 1 | n4-grammar-129 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 来月、東京へ出張することになりました。 |
| 出発 | 出発 | しゅっぱつ | 名詞／する動詞 | 出發 | N5 | grammar | 1 | n4-grammar-252 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 電車が出発しようとしています。 |
| 所屬 | 所屬 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-012 | grammar-element | high | 不加入一般單字庫 | repo | の（所屬） |
| 状態 | 状態 |  | 文法元素 |  |  | grammar | 1 | n4-grammar-244 | grammar-element | high | 不加入一般單字庫 | repo | 〜ている（結果状態） |
| 寝坊 | 寝坊 | ねぼう | 名詞／する動詞 | 睡過頭 | N4 | grammar | 1 | n4-grammar-183 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 寝坊したせいで、バスに乗れませんでした。 |
| 睡眠 | 睡眠 |  | 名詞 |  |  | grammar | 1 | n4-grammar-288 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 健康でいる＿＿、睡眠が大切です。 |
| 存在 | 存在 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-212 | grammar-element | high | 不加入一般單字庫 | repo | に（存在位置） |
| 大学生 | 大学生 | だいがくせい | 名詞 | 大學生 | N5 | grammar | 1 | n4-grammar-282 | approve-add-compound | high | Batch 12B 候補 | Weblio／Jisho | 弟は来年、大学生＿＿なります。 |
| 但是 | 但是 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-046 | grammar-element | high | 不加入一般單字庫 | repo | が（但是） |
| 通過 | 通過 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-211 | grammar-element | high | 不加入一般單字庫 | repo | を（通過） |
| 土産 | お土産 |  |  |  |  | listening | 1 | jl-069 | split-or-replace | medium | 不以原候選新增；改確認「お土産」 | Weblio／Jisho | この店でお土産を買います。 |
| 買い替える | 買い替える | かいかえる | 動詞 | 汰舊換新；重新購買 | N4 | reading | 1 | jp-reading-q-n4-054-01 | approve-add-compound | medium | Batch 12B 候補 | Weblio／Jisho | スマホを買い替える |
| 範圍 | 範圍 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-214 | grammar-element | high | 不加入一般單字庫 | repo | で（範圍） |
| 富士山 | 富士山 |  | 專有名詞 |  |  | grammar | 1 | n5-grammar-214 | proper-noun | high | 不加入一般單字庫 | repo | 日本で富士山がいちばん高いです。 |
| 部室 | 部室 |  | 名詞 |  |  | reading | 1 | jp-reading-q-n4-097-01 | optional-context-word | medium | 有效但本批暫不加入 | Weblio／Jisho | 写真部の部室 |
| 並列 | 並列 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-009 | grammar-element | high | 不加入一般單字庫 | repo | と（並列） |
| 命令 | 命令 |  | 文法元素 |  |  | grammar | 1 | n4-grammar-126 | grammar-element | high | 不加入一般單字庫 | repo | 命令形 |
| 毛布 | 毛布 | もうふ | 名詞 | 毛毯 | N4 | listening | 1 | jl-096 | approve-add | high | Batch 12B 候補 | Weblio／Jisho | 部屋が寒いので、毛布をください。 |
| 目的地 | 目的地 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-005 | grammar-element | high | 不加入一般單字庫 | repo | に（目的地） |
| 誘い | 誘い |  |  |  |  | reading | 1 | jp-reading-set-n4-074 | split-or-replace | medium | 不以原候選新增；改確認「誘い」 | Weblio／Jisho | 誘い |
| 要点 | 要点 | ようてん | 名詞 | 重點；要點 | N4 | grammar | 1 | n4-grammar-287 | approve-add | medium | Batch 12B 候補 | Weblio／Jisho | 全部読まなくてもいいですが、要点は見てください。 |
| 来店 | 来店 |  |  |  |  | reading | 1 | jp-reading-q-n4-042-01 | split-or-replace | medium | 不以原候選新增；改確認「来店」 | Weblio／Jisho | 来店したあと |
| 傳聞 | 傳聞 |  | 文法元素 |  |  | grammar | 1 | n4-grammar-076 | grammar-element | high | 不加入一般單字庫 | repo | 〜そうだ（傳聞） |
| 對象 | 對象 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-213 | grammar-element | high | 不加入一般單字庫 | repo | に（對象） |
| 對比 | 對比 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-215 | grammar-element | high | 不加入一般單字庫 | repo | は（對比） |
| 數量 | 數量 |  | 文法元素 |  |  | grammar | 1 | n5-grammar-229 | grammar-element | high | 不加入一般單字庫 | repo | 〜ぐらい（數量） |

## 17. 建議新增詞彙明細
| word | kana | partOfSpeech | meaning | level | example | exampleKana | exampleMeaning | sourceModules | sourceIds | occurrenceCount | classification | confidence | verification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| メモ | めも | 名詞 | 備忘錄；筆記 | N4 | 忘れないように、メモを書きます。 | わすれないように、めもをかきます。 | 為了不要忘記，我會寫備忘錄。 | grammar,reading | n4-grammar-105, jp-reading-set-n4-024, jp-reading-set-n4-033 | 34 | approve-add | high | Weblio：メモ為名詞，表示備忘錄／筆記。Jisho：memo/note；讀音與主要義一致。 |
| スーパー | すーぱー | 名詞 | 超市 | N5 | スーパーで野菜を買いました。 | すーぱーでやさいをかいました。 | 我在超市買了蔬菜。 | grammar,reading | n4-grammar-100, jp-reading-set-n4-017, jp-reading-q-n4-017-01 | 27 | approve-add | high | Weblio：スーパー為名詞，常指超級市場。Jisho：supermarket；讀音與主要義一致。 |
| スマホ | すまほ | 名詞 | 智慧型手機 | N4 | 電車の中でスマホを見ます。 | でんしゃのなかですまほをみます。 | 我在電車裡看手機。 | reading | jp-reading-set-n4-005, jp-reading-q-n4-005-01, jp-reading-set-n4-021 | 19 | approve-add | high | Weblio：スマホ為スマートフォン縮略語。Jisho：smartphone；讀音與主要義一致。 |
| 朝食 | ちょうしょく | 名詞 | 早餐 | N5 | ホテルで朝食を食べました。 | ほてるでちょうしょくをたべました。 | 我在飯店吃了早餐。 | reading | jp-reading-set-n4-007, jp-reading-q-n4-007-01, jp-reading-set-n4-029 | 14 | approve-add | high | Weblio：朝食讀作ちょうしょく，名詞。Jisho：breakfast；讀音與主要義一致。 |
| お知らせ | おしらせ | 名詞 | 通知；公告 | N4 | 学校からお知らせが来ました。 | がっこうからおしらせがきました。 | 學校寄來了通知。 | reading | jp-reading-set-n4-006, jp-reading-q-n4-006-01, jp-reading-set-n4-026 | 13 | approve-add-compound | high | Weblio：お知らせ為通知、案内。Jisho：notice/announcement；整體表現具獨立查詢價值。 |
| メール | めーる | 名詞 | 電子郵件；訊息 | N4 | 先生にメールを送りました。 | せんせいにめーるをおくりました。 | 我寄了電子郵件給老師。 | reading | jp-reading-set-n4-042, jp-reading-set-n4-095, jp-reading-q-n4-095-01 | 13 | approve-add | high | Weblio：メール為名詞，電子郵件。Jisho：e-mail/message；讀音與主要義一致。 |
| カフェ | かふぇ | 名詞 | 咖啡館 | N4 | 友だちとカフェで話しました。 | ともだちとかふぇではなしました。 | 我和朋友在咖啡館聊天。 | reading | jp-reading-set-n4-070, jp-reading-q-n4-070-01, jp-reading-set-n4-091 | 12 | approve-add | high | Weblio：カフェ為名詞，咖啡館。Jisho：cafe；讀音與主要義一致。 |
| チェックイン | ちぇっくいん | 名詞／する動詞 | 入住；報到 | N4 | ホテルに三時にチェックインします。 | ほてるにさんじにちぇっくいんします。 | 我三點在飯店辦理入住。 | reading,listening | jp-reading-set-n4-029, jp-reading-set-n4-048, jp-reading-set-n4-086 | 12 | approve-add-compound | high | Weblio：チェックイン為名詞／サ変，辦理入住或報到。Jisho：check-in, suru verb；一致。 |
| カレー | かれー | 名詞 | 咖哩 | N5 | 母がカレーを作りました。 | ははがかれーをつくりました。 | 媽媽做了咖哩。 | reading | jp-reading-set-n4-033, jp-reading-q-n4-033-01, jp-reading-set-n4-074 | 10 | approve-add | high | Weblio：カレー為名詞。Jisho：curry；讀音與主要義一致。 |
| クラス | くらす | 名詞 | 班級；課堂 | N5 | 私のクラスには学生が三十人います。 | わたしのくらすにはがくせいがさんじゅうにんいます。 | 我的班上有三十位學生。 | grammar,reading | n5-grammar-049, jp-reading-set-n4-016, jp-reading-set-n4-021 | 10 | approve-add | high | Weblio：クラス為名詞，班級／課堂。Jisho：class；讀音與主要義一致。 |
| 公民館 | こうみんかん | 名詞 | 公民館；社區活動中心 | N4 | 公民館で料理教室があります。 | こうみんかんでりょうりきょうしつがあります。 | 公民館有料理教室。 | reading | jp-reading-set-n4-009, jp-reading-q-n4-009-01, jp-reading-q-n4-011-01 | 9 | approve-add-compound | high | Weblio：公民館讀こうみんかん，公共社區設施。Jisho：community center；作為整體設施名保留。 |
| 返却 | へんきゃく | 名詞／する動詞 | 歸還 | N4 | 本を図書館に返却しました。 | ほんをとしょかんにへんきゃくしました。 | 我把書歸還給圖書館了。 | reading | jp-reading-set-n4-026, jp-reading-q-n4-026-01, jp-reading-q-n4-026-02 | 9 | approve-add | high | Weblio：返却讀へんきゃく，名詞／サ変。Jisho：returning something；讀音與詞性一致。 |
| エプロン | えぷろん | 名詞 | 圍裙 | N4 | 料理をする前にエプロンをつけます。 | りょうりをするまえにえぷろんをつけます。 | 做料理前我會穿上圍裙。 | reading | jp-reading-set-n4-062, jp-reading-q-n4-062-02, jp-reading-set-n4-089 | 8 | approve-add | high | Weblio：エプロン為名詞，圍裙。Jisho：apron；讀音與主要義一致。 |
| ヨガ | よが | 名詞 | 瑜伽 | N4 | 日曜日にヨガ教室へ行きます。 | にちようびによがきょうしつへいきます。 | 星期日我要去瑜伽教室。 | reading | jp-reading-set-n4-066, jp-reading-q-n4-066-02, jp-reading-set-n4-103 | 8 | approve-add | high | Weblio：ヨガ為名詞。Jisho：yoga；讀音與主要義一致。 |
| 整理 | せいり | 名詞／する動詞 | 整理 | N4 | 週末に部屋を整理しました。 | しゅうまつにへやをせいりしました。 | 週末我整理了房間。 | reading | jp-reading-set-n4-026, jp-reading-set-n4-101, jp-reading-q-n4-101-02 | 8 | approve-add | high | Weblio：整理讀せいり，名詞／サ変。Jisho：sorting/arranging, suru verb；一致。 |
| ジム | じむ | 名詞 | 健身房 | N4 | 仕事のあとでジムへ行きます。 | しごとのあとでじむへいきます。 | 下班後我會去健身房。 | reading | jp-reading-set-n4-020, jp-reading-q-n4-020-01 | 7 | approve-add | high | Weblio：ジム為名詞，健身房。Jisho：gym；讀音與主要義一致。 |
| 変更 | へんこう | 名詞／する動詞 | 變更 | N4 | 予定を明日に変更しました。 | よていをあしたにへんこうしました。 | 我把預定改到明天了。 | reading | jp-reading-set-n4-006, jp-reading-set-n4-042, jp-reading-set-n4-102 | 7 | approve-add | high | Weblio：変更讀へんこう，名詞／サ変。Jisho：change/modification, suru verb；一致。 |
| インターネット | いんたーねっと | 名詞 | 網際網路 | N4 | インターネットで席を予約しました。 | いんたーねっとでせきをよやくしました。 | 我在網路上預約了座位。 | reading | jp-reading-set-n4-028, jp-reading-set-n4-045 | 6 | approve-add | high | Weblio：インターネット為名詞。Jisho：Internet；讀音與主要義一致。 |
| ケーキ | けーき | 名詞 | 蛋糕 | N5 | 誕生日にケーキを食べました。 | たんじょうびにけーきをたべました。 | 生日那天我吃了蛋糕。 | grammar,reading | n4-grammar-075, jp-reading-q-n4-003-01, jp-reading-set-n4-091 | 6 | approve-add | high | Weblio：ケーキ為名詞。Jisho：cake；讀音與主要義一致。 |
| お願い | おねがい | 名詞／する動詞 | 請求；拜託 | N4 | 店員にお願いしました。 | てんいんにおねがいしました。 | 我拜託了店員。 | reading,listening | jp-reading-set-n4-022, jl-020, jl-083 | 5 | approve-add | high | Weblio：お願い讀おねがい，請求／拜託。Jisho：request/favour, suru use；讀音與主要義一致。 |
| テスト | てすと | 名詞／する動詞 | 考試；測驗 | N5 | 明日は日本語のテストがあります。 | あしたはにほんごのてすとがあります。 | 明天有日文考試。 | grammar,listening | n4-grammar-144, n5-grammar-219, n4-grammar-272 | 5 | approve-add | high | Weblio：テスト為名詞／サ変，測驗。Jisho：test；詞性與主要義一致。 |
| メニュー | めにゅー | 名詞 | 菜單 | N5 | レストランでメニューを見ました。 | れすとらんでめにゅーをみました。 | 我在餐廳看了菜單。 | reading,listening | jp-reading-set-n4-074, jl-067 | 5 | approve-add | high | Weblio：メニュー為名詞，菜單。Jisho：menu；讀音與主要義一致。 |
| 交流 | こうりゅう | 名詞／する動詞 | 交流 | N4 | 留学生と交流しました。 | りゅうがくせいとこうりゅうしました。 | 我和留學生交流了。 | reading | jp-reading-set-n4-011 | 5 | approve-add | medium | Weblio：交流讀こうりゅう，名詞／サ変。Jisho：exchange/interchange, suru verb；一致。 |
| 水着 | みずぎ | 名詞 | 泳衣 | N4 | プールへ行くので、水着を持って行きます。 | ぷーるへいくので、みずぎをもっていきます。 | 因為要去游泳池，所以我會帶泳衣去。 | reading | jp-reading-set-n4-020, jp-reading-q-n4-020-02 | 5 | approve-add-compound | high | Weblio：水着讀みずぎ，泳衣。Jisho：swimsuit；整體詞義固定，保留 compound。 |
| シール | しーる | 名詞 | 貼紙；標籤 | N4 | 名前のシールを自転車に貼ります。 | なまえのしーるをじてんしゃにはります。 | 我把姓名貼紙貼在腳踏車上。 | reading | jp-reading-set-n4-090, jp-reading-q-n4-090-01 | 4 | approve-add | high | Weblio：シール為名詞，貼紙／封條。Jisho：sticker/seal；讀音與主要義一致。 |
| テーマ | てーま | 名詞 | 主題 | N4 | 発表のテーマは好きな町です。 | はっぴょうのてーまはすきなまちです。 | 發表的主題是喜歡的城鎮。 | reading | jp-reading-set-n4-021, jp-reading-q-n4-021-01 | 4 | approve-add | high | Weblio：テーマ為名詞，主題。Jisho：theme/topic；讀音與主要義一致。 |
| ネット | ねっと | 名詞 | 網路 | N4 | 切符はネットで買えます。 | きっぷはねっとでかえます。 | 票可以在網路上買。 | reading | jp-reading-set-n4-104, jp-reading-q-n4-104-02 | 4 | approve-add | medium | Weblio：ネット為名詞，可指網路。Jisho：net/Internet；依來源用作網路。 |
| バス停 | ばすてい | 名詞 | 公車站牌；公車站 | N4 | 駅の前にバス停があります。 | えきのまえにばすていがあります。 | 車站前有公車站。 | reading,listening | jp-reading-set-n4-008, jp-reading-q-n4-008-01, jl-033 | 4 | approve-add-compound | high | Weblio：バス停讀ばすてい，巴士站。Jisho：bus stop；整體地點名具獨立查詢價值。 |
| プリント | ぷりんと | 名詞／する動詞 | 講義資料；列印 | N4 | 先生がプリントを配りました。 | せんせいがぷりんとをくばりました。 | 老師發了講義資料。 | reading | jp-reading-set-n4-095, jp-reading-q-n4-095-01 | 4 | approve-add | medium | Weblio：プリント為名詞／サ変，印刷物或列印。Jisho：print/handout；來源為課堂講義。 |
| ポスト | ぽすと | 名詞 | 郵筒 | N4 | 手紙をポストに入れました。 | てがみをぽすとにいれました。 | 我把信放進郵筒了。 | reading | jp-reading-set-n4-058, jp-reading-q-n4-058-01 | 4 | approve-add | high | Weblio：ポスト為名詞，郵筒等義。Jisho：postbox/mailbox；依來源採郵筒義。 |
| レジ | れじ | 名詞 | 收銀台 | N4 | レジでお金を払いました。 | れじでおかねをはらいました。 | 我在收銀台付了錢。 | reading | jp-reading-set-n4-063, jp-reading-q-n4-063-01 | 4 | approve-add | high | Weblio：レジ為名詞，收銀台／收銀機。Jisho：cash register；讀音與主要義一致。 |
| 使い方 | つかいかた | 名詞 | 使用方法 | N4 | この機械の使い方を教えてください。 | このきかいのつかいかたをおしえてください。 | 請告訴我這台機器的使用方法。 | reading | jp-reading-q-n4-043-01, jp-reading-set-n4-063, jp-reading-q-n4-063-01 | 4 | approve-add-compound | high | Weblio：使い方讀つかいかた，使用方式。Jisho：way to use；動詞連用形＋方，整體查詢價值高。 |
| お寺 | おてら | 名詞 | 寺廟 | N4 | 京都で古いお寺を見ました。 | きょうとでふるいおてらをみました。 | 我在京都看了古老的寺廟。 | reading | jp-reading-set-n4-018, jp-reading-q-n4-018-02 | 3 | approve-add | high | Weblio：お寺讀おてら，寺院。Jisho：temple；讀音與主要義一致。 |
| コンビニ | こんびに | 名詞 | 便利商店 | N5 | コンビニで飲み物を買いました。 | こんびにでのみものをかいました。 | 我在便利商店買了飲料。 | reading | jp-reading-set-n4-043 | 3 | approve-add | high | Weblio：コンビニ為名詞，便利商店。Jisho：convenience store；一致。 |
| メッセージ | めっせーじ | 名詞 | 訊息；留言 | N4 | 友だちにメッセージを送りました。 | ともだちにめっせーじをおくりました。 | 我傳了訊息給朋友。 | reading | jp-reading-set-n4-074 | 3 | approve-add | high | Weblio：メッセージ為名詞，訊息。Jisho：message；讀音與主要義一致。 |
| ランチ | らんち | 名詞 | 午餐 | N4 | 今日は友だちとランチを食べます。 | きょうはともだちとらんちをたべます。 | 今天我要和朋友吃午餐。 | reading | jp-reading-set-n4-070 | 3 | approve-add | high | Weblio：ランチ為名詞，午餐。Jisho：lunch；讀音與主要義一致。 |
| 時差 | じさ | 名詞 | 時差 | N4 | 日本と台湾には一時間の時差があります。 | にほんとたいわんにはいちじかんのじさがあります。 | 日本和台灣有一小時的時差。 | reading | jp-reading-set-n4-013 | 3 | approve-add | medium | Weblio：時差讀じさ，時間差。Jisho：time difference；讀音與主要義一致。 |
| 中止 | ちゅうし | 名詞／する動詞 | 中止；取消 | N4 | 雨で運動会が中止になりました。 | あめでうんどうかいがちゅうしになりました。 | 運動會因為下雨而取消了。 | reading | jp-reading-set-n4-023, jp-reading-q-n4-023-02 | 3 | approve-add | high | Weblio：中止讀ちゅうし，名詞／サ変。Jisho：cancellation/suspension；一致。 |
| 入力 | にゅうりょく | 名詞／する動詞 | 輸入；輸入資料 | N4 | 番号を入力してください。 | ばんごうをにゅうりょくしてください。 | 請輸入號碼。 | reading | jp-reading-set-n4-075, jp-reading-q-n4-075-01 | 3 | approve-add | medium | Weblio：入力讀にゅうりょく，名詞／サ変。Jisho：input, suru verb；讀音與詞性一致。 |
| イベント | いべんと | 名詞 | 活動；事件 | N4 | 週末に図書館でイベントがあります。 | しゅうまつにとしょかんでいべんとがあります。 | 週末圖書館有活動。 | reading | jp-reading-set-n4-019 | 2 | approve-add | high | Weblio：イベント為名詞，活動／事件。Jisho：event；依來源採活動義。 |
| ゲーム | げーむ | 名詞 | 遊戲 | N5 | 弟は新しいゲームを買いました。 | おとうとはあたらしいげーむをかいました。 | 弟弟買了新的遊戲。 | grammar | n4-grammar-071, n4-grammar-255 | 2 | approve-add | high | Weblio：ゲーム為名詞。Jisho：game；讀音與主要義一致。 |
| ラーメン | らーめん | 名詞 | 拉麵 | N5 | 昼ご飯にラーメンを食べました。 | ひるごはんにらーめんをたべました。 | 午餐我吃了拉麵。 | listening | jl-020 | 2 | approve-add | high | Weblio：ラーメン為名詞。Jisho：ramen；讀音與主要義一致。 |
| ルール | るーる | 名詞 | 規則 | N4 | ごみ出しのルールを守りましょう。 | ごみだしのるーるをまもりましょう。 | 請遵守丟垃圾的規則。 | reading | jp-reading-set-n4-105 | 2 | approve-add | high | Weblio：ルール為名詞，規則。Jisho：rule；讀音與主要義一致。 |
| レシート | れしーと | 名詞 | 收據；發票 | N4 | 買い物のあとでレシートをもらいました。 | かいもののあとでれしーとをもらいました。 | 購物後我拿到了收據。 | listening | jl-057 | 2 | approve-add | high | Weblio：レシート為名詞，收據。Jisho：receipt；讀音與主要義一致。 |
| 合格 | ごうかく | 名詞／する動詞 | 合格 | N4 | 試験に合格しました。 | しけんにごうかくしました。 | 我考試合格了。 | grammar | n4-grammar-181, n4-grammar-285 | 2 | approve-add | high | Weblio：合格讀ごうかく，名詞／サ変。Jisho：passing an exam, suru verb；一致。 |
| 持ち込む | もちこむ | 動詞 | 攜入；帶入 | N4 | 図書館に食べ物を持ち込まないでください。 | としょかんにたべものをもちこまないでください。 | 請不要把食物帶進圖書館。 | reading | jp-reading-q-n4-060-01, jp-reading-q-n4-103-02 | 2 | approve-add-compound | medium | Weblio：持ち込む讀もちこむ，五段動詞。Jisho：to bring in/carry in；複合動詞整體義固定。 |
| 消しゴム | けしごむ | 名詞 | 橡皮擦 | N5 | 机の上に消しゴムがあります。 | つくえのうえにけしごむがあります。 | 桌上有橡皮擦。 | reading | jp-reading-set-n4-031 | 2 | approve-add-compound | high | Weblio：消しゴム讀けしごむ，橡皮擦。Jisho：eraser；整體名詞固定。 |
| 真ん中 | まんなか | 名詞 | 正中間 | N4 | 写真の真ん中に犬がいます。 | しゃしんのまんなかにいぬがいます。 | 照片正中間有一隻狗。 | reading | jp-reading-set-n4-002 | 2 | approve-add-compound | high | Weblio：真ん中讀まんなか，正中央。Jisho：middle/centre；整體常用詞。 |
| たこ焼き | たこやき | 名詞 | 章魚燒 | N4 | 祭りでたこ焼きを買いました。 | まつりでたこやきをかいました。 | 我在祭典買了章魚燒。 | grammar | n4-grammar-205 | 1 | approve-add-compound | high | Weblio：たこ焼き讀たこやき，食品名。Jisho：takoyaki；整體食品名固定。 |
| ピアノ | ぴあの | 名詞 | 鋼琴 | N5 | 妹は毎日ピアノを弾きます。 | いもうとはまいにちぴあのをひきます。 | 妹妹每天彈鋼琴。 | grammar | n4-grammar-179 | 1 | approve-add | high | Weblio：ピアノ為名詞。Jisho：piano；讀音與主要義一致。 |
| ボタン | ぼたん | 名詞 | 按鈕 | N4 | このボタンを押すと、ドアが開きます。 | このぼたんをおすと、どあがあきます。 | 按這個按鈕，門就會打開。 | grammar | n4-grammar-086 | 1 | approve-add | high | Weblio：ボタン為名詞，按鈕。Jisho：button；讀音與主要義一致。 |
| レポート | れぽーと | 名詞 | 報告；報告書 | N4 | 金曜日までにレポートを出します。 | きんようびまでにれぽーとをだします。 | 我會在星期五以前交報告。 | grammar | n4-grammar-189 | 1 | approve-add | high | Weblio：レポート為名詞，報告。Jisho：report/paper；讀音與主要義一致。 |
| 作り方 | つくりかた | 名詞 | 作法；製作方法 | N4 | カレーの作り方を母に聞きました。 | かれーのつくりかたをははにききました。 | 我問媽媽咖哩的作法。 | reading | jp-reading-q-n4-078-01 | 1 | approve-add-compound | high | Weblio：作り方讀つくりかた，做法。Jisho：way of making; recipe；整體查詢價值高。 |
| 持ち主 | もちぬし | 名詞 | 物主；所有者 | N4 | このかばんの持ち主を探しています。 | このかばんのもちぬしをさがしています。 | 正在尋找這個包包的主人。 | reading | jp-reading-q-n4-053-01 | 1 | approve-add-compound | medium | Weblio：持ち主讀もちぬし，所有者。Jisho：owner；整體常用詞。 |
| 充電 | じゅうでん | 名詞／する動詞 | 充電；替電池補充電力 | N4 | 寝る前にスマホを充電します。 | ねるまえにすまほをじゅうでんします。 | 睡前我會替手機充電。 | reading | jp-reading-q-n4-054-01 | 1 | approve-add | high | Weblio：充電讀じゅうでん，名詞／サ変。Jisho：charging, suru verb；讀音與詞性一致。 |
| 出張 | しゅっちょう | 名詞／する動詞 | 出差 | N4 | 父は来週、大阪へ出張します。 | ちちはらいしゅう、おおさかへしゅっちょうします。 | 爸爸下週要到大阪出差。 | grammar | n4-grammar-129 | 1 | approve-add | medium | Weblio：出張讀しゅっちょう，名詞／サ変。Jisho：business trip, suru verb；讀音與主要義一致。 |
| 出発 | しゅっぱつ | 名詞／する動詞 | 出發 | N5 | 電車は七時に出発します。 | でんしゃはしちじにしゅっぱつします。 | 電車七點出發。 | grammar | n4-grammar-252 | 1 | approve-add | high | Weblio：出発讀しゅっぱつ，名詞／サ変。Jisho：departure, suru verb；一致。 |
| 寝坊 | ねぼう | 名詞／する動詞 | 睡過頭；晚起 | N4 | 今朝寝坊して、学校に遅れました。 | けさねぼうして、がっこうにおくれました。 | 今天早上睡過頭，上學遲到了。 | grammar | n4-grammar-183 | 1 | approve-add | high | Weblio：寝坊讀ねぼう，名詞／サ変。Jisho：oversleeping, suru verb；一致。 |
| 大学生 | だいがくせい | 名詞 | 大學生 | N5 | 兄は東京の大学生です。 | あにはとうきょうのだいがくせいです。 | 哥哥是東京的大學生。 | grammar | n4-grammar-282 | 1 | approve-add-compound | high | Weblio：大学生讀だいがくせい，名詞。Jisho：university student；固定身分名，保留 compound 分類。 |
| 買い替える | かいかえる | 動詞 | 換購；汰換成新的 | N4 | 古いパソコンを新しいものに買い替えました。 | ふるいぱそこんをあたらしいものにかいかえました。 | 我把舊電腦換成了新的。 | reading | jp-reading-q-n4-054-01 | 1 | approve-add-compound | medium | Weblio：買い替える讀かいかえる，一段動詞。Jisho：to replace by buying new；複合動詞整體義固定。 |
| 毛布 | もうふ | 名詞 | 毛毯 | N4 | 寒いので、毛布をかけて寝ます。 | さむいので、もうふをかけてねます。 | 因為很冷，我蓋著毛毯睡覺。 | listening | jl-096 | 1 | approve-add | high | Weblio：毛布讀もうふ，名詞。Jisho：blanket；讀音與主要義一致。 |
| 要点 | ようてん | 名詞 | 重點；要點 | N4 | 先生の話の要点をノートに書きました。 | せんせいのはなしのようてんをのーとにかきました。 | 我把老師談話的重點寫在筆記本上。 | grammar | n4-grammar-287 | 1 | approve-add | medium | Weblio：要点讀ようてん，重點。Jisho：main point/gist；讀音與主要義一致。 |
