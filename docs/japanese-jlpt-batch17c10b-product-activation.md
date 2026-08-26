# Batch 17C-10B：JLPT N5／N4 正式題型啟用

> 本站內容為自製、非官方的 JLPT-style 練習，不代表官方 JLPT 試題、配額或認證。

## 正式 profile

Runtime 正式註冊 `17c10-product-v1`／`site-jlpt-style-product`，其 quota 逐項沿用 Batch 17C-10A machine-readable contract。N5 固定為單字 8、文法 4、閱讀 8，共 20 題；N4 固定為單字 10、文法 8、閱讀 16，共 34 題。Listening 兩級均維持 `future`，不納入 session。

`17c6-compat-v1` 原樣保留。六份新 bank 任一 fetch、JSON parse、adapter、canonical identity、capacity 或 profile gate 失敗時，runtime 不發布 candidates 或 partial session，active profile 回到 compatibility profile，並顯示「新題型載入失敗，已使用相容模式」與原因。

## Transaction-like 載入

六份 product banks 先以 `Promise.all` 完整 fetch，再全部 parse。Vocabulary、grammar form-selection、sentence-composition、N5 reading 與 N4 reading 分別通過既有 audited adapters；兩級 profile 及所有 pool capacity 在 commit point 前完成驗證。只有全部成功後，candidate 集合與 active profile 才一起發布。

正式 session 順序固定為：

1. 全 pool validation（不足以 `JLPT_INSUFFICIENT_POOL` 原子失敗）。
2. 各 `(level, section, questionType)` 無放回 selection。
3. deep-clone、deep-freeze immutable snapshot。
4. 建立均衡答案位置（N5 `5/5/5/5`；N4 為 `8/8/9/9` 的排列）。
5. 使用既有 crypto rejection sampling 隨機排列 options/chunks 及其 metadata。

每次返回設定重新開始都重新抽題、重新排選項，不保留跨 session 排除表。Reading 維持 `(setId, questionId)` identity、同 set 相鄰與原順序、完整 count/index、passage、material、evidence 與 ruby metadata。所有題庫來源、candidate、snapshot 與 randomized question 均不共用 mutable nested references。

## UI 與安全

設定畫面標示正式／相容模式、固定 section 題數與總題數。題型以繁體中文顯示；sentence-composition 的 `★`、chunks 與 canonical chunk identity 留在專用 pipeline；information-search 素材與 evidence 僅以 `createElement`、`textContent` 及既有 ruby renderer 顯示，不把題庫內容寫入 `innerHTML`。N5、N4 正式完成畫面均列出單字、文法與閱讀，並保留聽力後續開放提示。

本批沒有修改 JSON 題庫、source、manifest、builder 輸出、歷史 checker、一般日文功能或任何 storage key/schema。

## 專用 checker

`scripts/check-japanese-jlpt-batch17c10b-product-activation.js` 解析 17C-10A contract，直接執行 production adapters 與完整 N5/N4 pipeline，並驗證 quota、balanced positions、immutability/reference isolation、reading grouping/metadata、option/chunk permutation、compat profile、storage inventory、production wiring、六份逐 bank load-failure fixtures、pool shortage、未知題型及其他 negative fixtures。
