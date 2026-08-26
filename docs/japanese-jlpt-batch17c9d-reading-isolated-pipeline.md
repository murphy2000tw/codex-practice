# Batch 17C-9D reading isolated pipeline

本批建立 N5／N4 reading immutable adapters 與測試專用 isolated pipeline。素材是本站內部、非官方的 **JLPT-style** 練習內容，不是官方 JLPT 題庫、配額或認證內容；正式啟用與固定題數只能由 Batch 17C-10 決定。

## Adapter 與 inventory

Adapters fail closed 驗證 N5 `17c9c-n5-reading-v1` derived bank（含 reviewed source、manifest、review、digest、ruby、evidence、structured material metadata）及 N4 `17c2-n4-reading-v1` bank（只允許 N4 105 sets／150 questions），並 deep clone 每個 candidate。實際 inventory 是 162 candidates：N5 為 short 2、medium 4、information-search 4、notice 2；N4 分別為 41、35、33、41。canonical pool key 是 `(level, "reading", canonicalSection)`，canonical question identity 是 `(setId, questionId)`。

## Isolated fixture 與 selection

Checker 內的 `17c9d-isolated-reading-fixture-v1` / `site-jlpt-style-reading-fixture` / `test-only-isolated` profile 每級僅選 8 題，每個 canonical section 2 題。**這是 isolated fixture quota，不是 product quota**，不在 production registry。抽到同一 set 的多題依 canonical question order 排列，不因抽樣打亂。`sourceSetQuestionCount` 永遠是原 set 完整題數；`selectedSessionQuestionCount` 是 selection 後該 set 在本 session 的實際題數，partial selection 不截斷來源或 candidate。

## Immutable 與 option identity boundary

流程為 adapter → normalize → pools → selection → immutable pre-randomization snapshot → balanced answer positions → option randomization。Snapshot 及所有 nested object/array deep freeze；source、candidate、snapshot、randomized question 均 deep clone、不共享 mutable nested references。每級 8 題的答案位置平衡為 `2/2/2/2`。

Reading permutation metadata 使用 `17c9d-v1`，保存雙向 index mapping、pre/randomized canonical IDs、correct canonical ID 與正解原始/目前 index。option ID 固定為 `${sourceQuestionId}#option-${originalIndex}`；N5 option reviews 使用相同 permutation，其他 passage、ruby、evidence 與 material metadata 不重排。已 randomize、無效 provider/index/identity 一律拒絕。

## Fail-closed 與 production isolation

題庫不足在呼叫 random provider 與產生 partial session 前以 `JLPT_INSUFFICIENT_POOL` 拒絕，details 保存 level、section、questionType、required、available、profileVersion，且不跨 level、section 或 legacy bank fallback。Production `17c6-compat-v1`、N5 total 20（reading unavailable）、N4 total 34（legacy reading 14）與 listening 狀態不變；production build/load path、storage/cache inventory、UI 及 script tags不納入 isolated bank。本批通過不代表 N5 reading 已啟用。
