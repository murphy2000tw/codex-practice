# Batch 17C-10B：JLPT N5／N4 正式題型啟用

> 本站內容為自製、非官方的 JLPT-style 練習，不代表官方 JLPT 試題、配額或認證。

## 正式 profile

Runtime 正式註冊 `17c10-product-v1`／`site-jlpt-style-product`，其 quota 逐項沿用 Batch 17C-10A machine-readable contract。N5 固定為單字 8、文法 4、閱讀 8，共 20 題；N4 固定為單字 10、文法 8、閱讀 16，共 34 題。Listening 兩級均維持 `future`，不納入 session。

`17c6-compat-v1` 原樣保留。六份新 bank 任一 fetch、JSON parse、adapter、canonical identity、capacity 或 profile gate 失敗時，runtime 不發布 candidates 或 partial session，active profile 回到 compatibility profile，並顯示「新題型載入失敗，已使用相容模式」與原因。

## Transaction-like 載入

正式共用 helper `buildJapaneseJlptProductCandidates()` 先以 `Promise.all` 完整 fetch 六份 product banks，再全部 parse。Vocabulary、grammar form-selection、sentence-composition、N5 reading 與 N4 reading 分別通過既有 audited adapters；兩級 profile 及所有 pool capacity 在 commit point 前完成驗證。`loadJapaneseJlptProductBanks()` 只有在 helper 完整成功後，才將 354 candidates 與 active profile 一起發布。helper／loader 接受可注入的 fetch provider，讓專用 checker 能逐次執行真實 production 路徑，而不是複製載入邏輯。

正式 session 順序固定為：

1. 全 pool validation（不足以 `JLPT_INSUFFICIENT_POOL` 原子失敗）。
2. 各 `(level, section, questionType)` 無放回 selection。
3. deep-clone、deep-freeze immutable snapshot。
4. 建立均衡答案位置（N5 `5/5/5/5`；N4 為 `8/8/9/9` 的排列）。
5. 使用既有 crypto rejection sampling 隨機排列 options/chunks 及其 metadata。

每次返回設定重新開始都重新抽題、重新排選項，不保留跨 session 排除表。Reading 維持 `(setId, questionId)` identity、同 set 相鄰與原順序、完整 count/index、passage、material、evidence 與 ruby metadata。所有題庫來源、candidate、snapshot 與 randomized question 均不共用 mutable nested references。

## UI 與安全

設定畫面標示正式／相容模式、固定 section 題數與總題數。題型以繁體中文顯示；各新題型使用明確的 metadata renderer，字串 `answerDisplay` 只顯示一次，legacy object 格式仍保留既有欄位呈現。sentence-composition 的 `★`、chunks 與 canonical chunk identity 留在專用 pipeline。information-search 的 `labeled-table` 以 `table`／`thead`／`tbody`／row／cell 安全 DOM 呈現，不向使用者顯示 evidence、內部 ID、projection 或原始 JSON；最小 CSS 僅為表格邊框、cell spacing 與手機橫向捲動容器。所有題庫文字只經 `createElement`、`textContent` 及既有 ruby renderer 顯示，不寫入 `innerHTML`。N5、N4 正式完成畫面均列出單字、文法與閱讀，並保留聽力後續開放提示。

本批沒有修改 JSON 題庫、source、manifest、builder 輸出、歷史 checker、一般日文功能或任何 storage key/schema。

## 專用 checker

`scripts/check-japanese-jlpt-batch17c10b-product-activation.js` 解析 17C-10A contract，直接執行 production adapters 與完整 N5/N4 pipeline，並驗證 quota、balanced positions、immutability/reference isolation、reading grouping/metadata、option/chunk permutation、compat profile、storage inventory 與 production wiring。Loader fixtures 實際呼叫 production loader：一個成功 fixture 發布 354 candidates；六個逐 bank HTTP failure fixtures 各讓其餘 product／compat responses 正常，並驗證正式 runtime state 沒有 candidates/session、compat profile 保持 active 且顯示回退原因。另有可信 DOM stub 執行十六個 UI fixtures，驗證七種新題型及其缺漏 metadata fallback、legacy answer object 與 structured table，以及 pool shortage、未知題型、duplicate identity、invalid provider 等十二個 negative fixtures。
