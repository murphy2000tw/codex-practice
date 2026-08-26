# Batch 17C-10A：JLPT-style 正式題數契約與啟用稽核計畫

> **非官方內容聲明：**本站並非日本國際交流基金會或日本國際教育支援協會的官方網站；以下均為本站自製、非官方的 **JLPT-style** 練習題與產品規劃，不代表官方 JLPT 試題或規格。

## 1. 範圍與不變條件

本批只鎖定正式產品 profile 的題數契約、以現有資料與 adapter 動態盤點容量，並規劃下一批 activation；不載入新 bank、不註冊 production profile，也不改動 runtime、HTML、CSS、題庫、既有 checker、cache token、production registry 或任何 storage API/schema。`17c6-compat-v1` 必須逐 byte 邏輯完整保留，繼續供相容與回歸使用。

`meaning`、legacy `cloze` 與 `legacy-reading-question` 僅屬 `17c6-compat-v1`，不得進入新 profile。Listening 在兩級皆維持 `included: false`、`status: "future"`，留待 Batch 17D。

## 2. Machine-readable quota contract

文件與專用 checker 以此唯一 block 為正式契約；checker 會解析此 JSON，而非另抄 quota。

<!-- JLPT_17C10_PRODUCT_QUOTA_START -->
```json
{
  "profileVersion": "17c10-product-v1",
  "profileId": "site-jlpt-style-product",
  "profileKind": "production",
  "levels": {
    "N5": {
      "total": 20,
      "sections": {
        "vocabulary": { "included": true, "status": "available", "total": 8, "questionTypes": { "kanji-reading": 2, "orthography": 2, "context": 2, "paraphrase": 2 } },
        "grammar": { "included": true, "status": "available", "total": 4, "questionTypes": { "form-selection": 2, "sentence-composition": 2 } },
        "reading": { "included": true, "status": "available", "total": 8, "questionTypes": { "short-passage": 2, "medium-passage": 2, "information-search": 2, "notice-and-message": 2 } },
        "listening": { "included": false, "status": "future", "total": null, "questionTypes": {} }
      }
    },
    "N4": {
      "total": 34,
      "sections": {
        "vocabulary": { "included": true, "status": "available", "total": 10, "questionTypes": { "kanji-reading": 2, "orthography": 2, "context": 2, "paraphrase": 2, "usage": 2 } },
        "grammar": { "included": true, "status": "available", "total": 8, "questionTypes": { "form-selection": 4, "sentence-composition": 4 } },
        "reading": { "included": true, "status": "available", "total": 16, "questionTypes": { "short-passage": 4, "medium-passage": 4, "information-search": 4, "notice-and-message": 4 } },
        "listening": { "included": false, "status": "future", "total": null, "questionTypes": {} }
      }
    }
  }
}
```
<!-- JLPT_17C10_PRODUCT_QUOTA_END -->

N5 固定 20 題、N4 固定 34 題，但正式組成改為上述 vocabulary、grammar、reading 新題型；N5 不得有 `usage`，且 N5 的四種 reading section 全數正式納入。

## 3. 動態容量結論與計數語意

專用 checker 直接載入實際 JSON banks，並在隔離 VM 中執行 production adapters，所得 answerable candidate 容量如下：

| Level | vocabulary | grammar | reading |
| --- | --- | --- | --- |
| N5 | `kanji-reading/orthography/context/paraphrase = 12/12/12/12` | `form-selection/sentence-composition = 12/30` | `short/medium/information/notice = 2/4/4/2` |
| N4 | `kanji-reading/orthography/context/paraphrase/usage = 12/12/12/12/12` | `form-selection/sentence-composition = 12/30` | `short/medium/information/notice = 41/35/33/41` |

因此每一項 quota 都不超過對應 pool。Reading 的計數單位一律是 **answerable question**，不是 passage 或 set；同一 set 抽中的多題須保持 source question 原順序、相鄰排列，並完整保留 passage、material、evidence、ruby、set/question index 與 count metadata。

## 4. Session 原子契約

1. Pipeline 固定為 **selection → immutable snapshot → balanced answer positions → randomization**，順序不可交換。
2. 每按一次「新測驗」，均重新從各 `(level, section, questionType)` pool 無放回抽題，再重新排列選項；總題數與各題型 quota 永遠不變。
3. 在任何亂數呼叫或 session 發布之前，必須先驗證所有 pool。任一不足均拋出具結構化 details 的 `JLPT_INSUFFICIENT_POOL` 並原子失敗。
4. 禁止縮題、跨 level 借題、跨 questionType fallback、重複/複製題目及 partial session；未知題型也必須 fail closed，不能被靜默忽略。
5. 答案位置在完整 session 中均衡分配，再執行 option randomization；immutable snapshot 及 bank 不得被 mutation。
6. 不新增或修改 LocalStorage、sessionStorage、IndexedDB、Cache API 的 key、資料形狀、版本或 migration。

## 5. Activation audit gate

Batch 17C-10B 必須先載入新 banks、註冊 `17c10-product-v1`，再接入 production session 與設定畫面。同時保留可立即回退的 `17c6-compat-v1`。Activation 採 transaction-like publish：先解析並驗證**全部** banks 與 adapters、profile totals、pool capacities、canonical identities、reading metadata 與 storage 不變條件；全部成功後才以單一 commit point 發布可見 session/profile。任一 gate 失敗時不得改變 active profile、不得留下 partial session，並回退/維持 compat profile。

Batch 17C-10C 再以桌機與手機完成整頁實測：設定切換、新測驗重抽、固定 quota、reading passage/set 顯示與順序、答案均衡及全站回歸驗收。Listening 不在 10B/10C 偷跑，另由 Batch 17D 啟用。

## 6. 10A checker gate

專用 checker 會驗證 machine block、實際 adapter capacities、quota/totals、compat profile、原子不足錯誤、reading set 語意、production isolation，以及不足容量、未知題型、錯誤總數、N5 usage、listening 提前啟用與 silent fallback 等 negative fixtures。它也以 Git baseline 確認本批差異只有本文件與專用 checker，並逐項禁止 runtime、HTML/CSS、banks、既有 checker、cache token、production registry 和 storage API 的變更。
