# 日文網站排版主線整理報告

## 1. 本次整理目的

本次任務定位為「日文網站排版主線整理」，目標是在進入日文學習後，讓主要入口以「單字、文法、閱讀、聽力」四大功能方塊呈現，並讓各功能的測驗入口維持清楚、易點擊、不混入過多管理操作。

本次未修改 `vocabulary.json`，未新增或刪除日文單字，未執行 Batch 07，未新增聽力音檔，也未建立假聽力流程。

## 2. 調整前日文入口狀態

調整前的 `japanese/index.html` 已有日文分頁切換列，包含「單字、文法、閱讀、聽力」四個 tab。單字與文法共用主內容區，閱讀使用獨立閱讀 panel，聽力為準備中文案。日文主入口的 hero 仍以「日文 N5 單字卡」為主要標題，進入日文後的四大功能主線不夠像首頁入口卡片。

目前實際檢查到的日文相關結構：

| 項目 | 狀態 |
| -- | -- |
| 日文首頁 | `japanese/index.html` |
| 日文單字頁 | 與日文首頁同頁，使用 `#japaneseMainContent` 與單字模式 |
| 日文閱讀頁 | 與日文首頁同頁，使用 `#japaneseReadingPanel` |
| 日文測驗頁 | 與日文首頁同頁，使用單字、文法、閱讀測驗模式 |
| 文法頁 | 已有基礎文法資料與文法模式，使用 `grammar.json` |
| 聽力頁 | 尚未完成，僅保留準備中 placeholder |
| 主要 JS | `script.js` |
| 主要 CSS | `style.css` |

## 3. 調整後日文四大功能入口

日文首頁 hero 已改為「日文學習主入口」，並新增「日文四大功能」卡片區。四張卡片為：

1. 單字
2. 文法
3. 閱讀
4. 聽力

單字、文法與閱讀卡片會切換到現有功能區；聽力卡片以準備中狀態呈現，不提供可點擊假流程。

## 4. 單字、文法、閱讀、聽力方塊狀態

| 功能 | 調整後狀態 | 說明 |
| -- | -- | -- |
| 單字 | 可使用 | 連到現有單字卡與單字測驗模式 |
| 文法 | 基礎頁 | 使用現有文法資料與文法測驗入口，文字標示仍以現有資料為準 |
| 閱讀 | 可使用 | 連到現有閱讀練習與閱讀測驗模式 |
| 聽力 | 準備中 | 未新增音檔、未新增假測驗流程 |

## 5. 測驗入口簡化結果

各功能區保留清楚的主要模式入口：

- 單字：保留「單字練習」與「單字測驗」。
- 文法：保留「文法練習」與「文法測驗」，說明文案標示為基礎頁與現有資料。
- 閱讀：保留「閱讀練習」與「閱讀測驗」，說明文案明確標示測驗模式不顯示 ruby。
- 聽力：僅顯示準備中，不建立聽力測驗假入口。

本次未大幅重構既有測驗邏輯，僅整理主入口與說明文案。

## 6. 未完成功能的標示方式

聽力卡片使用 `is-coming-soon` 樣式與「準備中」標籤，視覺上和可點擊功能區隔。文法卡片使用「基礎頁」標籤，避免讓使用者誤以為已完成正式大型文法開發。

## 7. 手機版排版檢查結果

新增的四大功能入口使用響應式 grid：桌機為四欄、窄版為兩欄、手機版為單欄。手機版卡片保留足夠高度與整寬按鈕標籤，降低文字擠在一起或點擊區太小的風險。

目前環境未執行真實瀏覽器截圖；本次為靜態 HTML/CSS/JS 檢查與既有 Node script 回歸檢查。

## 8. 三個主要 script 結果

| 指令 | 結果 |
| -- | -- |
| `node scripts/auditSiteHealth.js` | 通過 |
| `node scripts/audit-reading-vocabulary.js` | 通過，產生閱讀詞彙盤點 JSON 摘要 |
| `node scripts/check-reading-ruby.js` | 通過，無 warning |

## 9. `vocabulary.json` 筆數確認

已執行 Python 檢查，`vocabulary.json` 仍為 3179 筆。

## 10. 是否有新增 warning 或 error

未新增 warning 或 error。`check-reading-ruby.js` 輸出為 pass，且 `git diff --check` 通過。

## 11. 下一步建議

1. 若要正式開發文法頁，可另開「文法正式頁面與題型整理」任務，避免與本次排版整理混在一起。
2. 若要開發聽力功能，建議先規劃資料格式、音檔來源、播放 UI、測驗規格，再新增正式流程。
3. 若可使用瀏覽器環境，建議補做手機寬度截圖或 Playwright 視覺檢查。

## 後續修正：主入口舊區塊與顏色整理

### 修正前問題

日文主入口四大功能方塊已完成後，頁面下方仍直接顯示舊版「日文學習」tab、分類篩選、詞性分類、程度篩選、搜尋列與單字統計／單字卡區塊，造成主入口同時像首頁與單字頁。文法卡片的「基礎頁」按鈕也使用偏咖啡色背景，與日文主色系橘紅色及準備中狀態不一致。

### 顏色整理

- 「進入單字」與「進入閱讀」維持既有可點擊功能的日文主色系橘紅色。
- 文法「基礎頁」改為「基礎頁（整理中）」並套用中性灰色淡色樣式，避免看起來像正式完成的新功能。
- 聽力「準備中」維持中性灰色淡色樣式，不新增聽力正式入口或假流程。
- 移除文法卡片按鈕原本突兀的咖啡色／深棕色視覺。

### 主入口殘留區塊移除

日文主入口預設只保留頂部導覽、日文學習主入口說明，以及「單字、文法、閱讀、聽力」四大功能方塊。下列舊區塊不再於主入口預設顯示：

1. 「日文學習」tab 區塊。
2. 單字／文法／閱讀／聽力 tab 切換列。
3. 分類篩選。
4. 詞性分類按鈕。
5. 程度篩選與搜尋列。
6. 單字統計、單字列表與單字卡區。

### 單字頁與閱讀頁狀態

單字、文法與閱讀的既有內容仍保留在同頁 DOM 中，但日文主入口初始狀態改為 `home`，並讓 `#japaneseMainContent` 預設 hidden。點選「進入單字」後才會顯示單字頁內容、分類篩選、搜尋、單字卡與單字測驗入口；點選「進入閱讀」後才會顯示閱讀練習／閱讀測驗內容。閱讀練習模式維持 ruby，閱讀測驗模式仍依既有邏輯不顯示 ruby。

### 三個主要 script 結果

| 指令 | 結果 |
| -- | -- |
| `node scripts/auditSiteHealth.js` | 通過 |
| `node scripts/audit-reading-vocabulary.js` | 通過 |
| `node scripts/check-reading-ruby.js` | 通過，無 warning |

### `vocabulary.json` 筆數確認

已執行 Python 檢查，`vocabulary.json` 仍為 3179 筆；本次未修改 `vocabulary.json`，未新增、刪除或調整任何日文單字。

### 是否仍有殘留問題

靜態檢查與既有 audit script 未發現主入口舊 tab、分類篩選、詞性分類或單字統計預設顯示的殘留問題。此環境未提供可直接執行的瀏覽器實測工具；如需視覺驗收，建議後續再以實機或 Playwright 補做桌機與手機寬度截圖確認。

## 後續修正：主入口殘留區塊與按鈕顏色根因修正

### 問題原因

實際根因在日文入口的初始化流程：`activeJapaneseTab` 預設為 `home`，但 `loadVocabulary()` 載入 `vocabulary.json` 後仍立即呼叫 `renderCategoryFilters()` 與 `applyCategory(activeCategoryId)`，進而更新分類篩選、單字統計、搜尋狀態與單字卡。也就是說，四大功能方塊已經出現在主入口後，舊單字頁的 render 流程仍會被初始化路徑觸發。

此外，主入口文法卡仍使用可點擊的 `data-japanese-entry="grammar"` 入口與 `is-foundation` 樣式，導致尚未正式開放的文法功能看起來像可用按鈕，且按鈕顏色與 disabled / muted 規則不一致。

### 修正內容

1. 新增日文首頁狀態判斷，讓首頁狀態下不顯示任何 mode panel，也不在資料載入完成時執行單字分類與單字卡 render。
2. `loadVocabulary()` 現在只在非主入口狀態下呼叫 `renderCategoryFilters()` 與 `applyCategory(activeCategoryId)`；主入口載入資料後僅保留資料於記憶體，不展開舊單字區塊。
3. 點擊「進入單字」時才呼叫單字頁模式切換與 render，因此搜尋、分類篩選、詞性分類、程度篩選、單字卡與單字測驗入口只會在單字頁出現。
4. 點擊「進入閱讀」時才顯示閱讀 panel，閱讀練習與閱讀測驗內容不會混入主入口。
5. 文法卡改為準備中卡片，不再掛 `data-japanese-entry="grammar"`，避免開啟尚未完成的文法基礎頁或假流程。
6. 文法與聽力的準備中按鈕統一使用淡灰底與灰色文字，不使用咖啡色、深棕色或主 CTA 色。
7. 補上 `scripts/check-japanese-main-entry.js` 靜態檢查，確認日文主入口不把未完成入口當成可導航卡片，並保留首頁 render guard。

### 目前主入口顯示內容

日文主入口現在只應顯示頂部導覽、日文學習主入口標題與說明，以及「單字、文法、閱讀、聽力」四大功能方塊。主入口不應再顯示舊 tab、分類篩選、詞性分類、程度篩選、3179 個單字統計、單字卡、單字搜尋、單字測驗入口、閱讀練習或閱讀測驗內容。

### 單字頁與閱讀頁狀態

單字頁仍由「進入單字」開啟，並保留搜尋、分類篩選、詞性分類、程度篩選、單字卡與單字測驗入口。閱讀頁仍由「進入閱讀」開啟，並保留閱讀練習與閱讀測驗切換；本次未修改閱讀測驗 ruby 規則。

### 檢查結果

- 日文主入口不再顯示舊 tab：已由 render guard 與靜態檢查確認。
- 日文主入口不再顯示分類篩選：已由 `loadVocabulary()` 首頁 guard 與靜態檢查確認。
- 日文主入口不再顯示 3179 單字統計：首頁不再觸發分類統計 render；`vocabulary.json` 筆數仍維持 3179。
- 點進單字後，單字頁功能仍正常：單字入口會呼叫既有 `switchMode()` 流程，保留既有單字功能。
- 點進閱讀後，閱讀頁功能仍正常：閱讀入口仍呼叫既有閱讀初始化流程。
- 文法 / 聽力準備中樣式：兩者皆使用 muted disabled 風格，不使用主 CTA 或咖啡色系。
- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。
- `node scripts/check-japanese-main-entry.js`：通過。
- `vocabulary.json` 筆數確認：3179。
- 仍有殘留問題：未發現主入口殘留舊單字區塊；本次環境未執行真實瀏覽器截圖。

## 後續修正：四大功能切換狀態

### 問題原因

前一版已阻止日文首頁初始載入時直接展開單字分類與單字卡，但四大功能方塊本身仍是頁面上方的固定 DOM。點擊「進入單字」時，程式只把 `#japaneseMainContent` 從 hidden 切成顯示，並啟動既有 `switchMode()` 單字流程；它沒有把首頁 hero 與四大功能方塊切出畫面。因此使用者看到的效果就是「首頁仍在，上方四大卡片不消失，單字內容追加在下方」。

### 修正的 view state 與 render 條件

本次新增單一日文 view render 入口 `renderJapaneseView(view)`，由同一個狀態決定日文首頁、單字頁、閱讀頁與聽力 placeholder 哪一個可以顯示。首頁 hero 與四大功能方塊被包在 `#japaneseHomeContent`，切到 `vocab` 或 `reading` 時會關閉首頁容器；返回時切回 `home`，只顯示首頁容器，不顯示單字或閱讀 panel。

點擊「進入單字」現在會先切到 `vocab` view，讓四大功能方塊消失，再啟動既有單字模式；點擊「進入閱讀」會切到 `reading` view，讓四大功能方塊消失，再初始化閱讀內容。功能頁新增「返回日文首頁」按鈕，可切回 `home` view。

### 日文首頁現在顯示內容

日文首頁只顯示頂部導覽、日文學習主入口標題與說明，以及單字、文法、閱讀、聽力四大功能方塊。首頁不顯示單字分類、單字篩選、單字卡、單字統計、舊 tab、閱讀練習或閱讀測驗內容。

### 單字頁現在顯示內容

單字頁顯示日文單字標題、返回日文首頁按鈕、搜尋、分類篩選、詞性分類、程度篩選、單字練習 / 單字測驗切換、單字卡與既有單字測驗流程。單字頁不再同時顯示日文首頁四大功能方塊、主入口說明、文法卡、閱讀卡或聽力卡。

### 閱讀頁現在顯示內容

閱讀頁顯示日文閱讀標題、返回日文首頁按鈕、閱讀練習 / 閱讀測驗切換，以及既有閱讀資料與題目。閱讀練習模式仍依既有邏輯顯示 ruby；閱讀測驗模式仍不顯示 ruby。本次未修改閱讀測驗 ruby 規則。

### 文法 / 聽力狀態

文法與聽力維持準備中 / muted 狀態，不展開正式文法內容、聽力內容、假音檔或假流程，也不會觸發單字頁或閱讀頁內容。

### 檢查結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。
- `node scripts/check-japanese-main-entry.js`：通過，並新增檢查首頁容器隔離、返回首頁控制與 `renderJapaneseView(view)` guard。
- `vocabulary.json` 筆數確認：3179。
- 仍有殘留問題：未發現點進單字或閱讀後四大功能方塊仍同時顯示的靜態殘留；本次環境未執行真實瀏覽器 viewport 截圖。

## 後續修正：單一 View 狀態切換

### 真正問題原因

前一版雖然新增了 `renderJapaneseView(view)` 並切換各區塊的 `hidden` 狀態，但 DOM 結構仍然是「首頁容器、單字容器、閱讀容器」並列存在於同一個頁面下。點擊「進入單字」時，程式只是把單字容器顯示出來，若瀏覽器或既有樣式 / 實機渲染沒有完全反映首頁容器 hidden 狀態，就會看到首頁四大功能方塊仍留在上方，而單字分類、篩選與單字卡被顯示在其下方。根因是仍有多個日文 view 容器同時掛在畫面主區域中，沒有真正用單一容器替換目前 view。

### 原本為什麼會追加單字內容

「進入單字」按鈕是 `button`，不是外部連結，也不是頁內錨點；問題不是 scroll，而是 click handler 只切換既有容器顯示狀態。原本 `#japaneseHomeContent` 與 `#japaneseMainContent` 同時存在於 DOM 主流程中，單字 view 啟動後 `switchMode()` 會繼續渲染分類、統計與單字卡到 `#japaneseMainContent`，因此在實機上呈現為單字頁內容被追加到首頁下方。

### 修正後使用的 view state 與 render 條件

本次新增明確的 `currentJapaneseView = 'home'` 狀態，並建立唯一日文主內容容器 `#japaneseContent`。`renderJapaneseView(view)` 會先透過 `normalizeJapaneseView(view)` 取得標準 view，再用 `japaneseContent.replaceChildren(nextViewElement)` 將日文主內容容器清空並替換成唯一 view。也就是說，切到 `vocabulary` 時，首頁節點會被移出主內容容器；切回 `home` 時，單字節點會被移出主內容容器。這不是只靠 CSS 隱藏，而是以單一容器替換節點，避免首頁與單字頁同時 render。

### 日文首頁現在只顯示哪些內容

`home` view 只顯示日文學習主入口標題、日文學習說明，以及單字、文法、閱讀、聽力四大功能方塊。首頁 view 不顯示單字搜尋、分類篩選、詞性篩選、程度篩選、3179 單字統計、單字卡、閱讀練習或閱讀測驗。

### 單字頁現在只顯示哪些內容

`vocabulary` view 只顯示日文單字頁標題、返回日文首頁按鈕、單字搜尋、分類篩選、詞性分類、程度篩選、單字練習 / 單字測驗入口與單字卡。單字頁不顯示日文主入口四大功能方塊、文法卡、閱讀卡、聽力卡或主入口說明。

### 閱讀頁現在只顯示哪些內容

`reading` view 只顯示日文閱讀頁標題、返回日文首頁按鈕、閱讀練習 / 閱讀測驗切換與既有閱讀內容。閱讀練習 ruby 與閱讀測驗不顯示 ruby 的規則維持既有邏輯，本次未修改閱讀 ruby 規則。

### 文法 / 聽力目前狀態

文法與聽力維持準備中 / muted 樣式，不進入正式功能頁，不展開假文法、假聽力、假測驗流程，也不會觸發單字頁或閱讀頁內容。

### 按鈕顏色修正結果

「進入單字」與「進入閱讀」保留日文主色橘紅 CTA。文法與聽力準備中按鈕維持淡灰底、灰色文字與非正式可用狀態，不使用咖啡色、深棕色或主 CTA 顏色。

### 防呆檢查結果

`node scripts/check-japanese-main-entry.js` 已更新並通過。檢查項目包含：存在 `currentJapaneseView` 狀態、存在單一 `#japaneseContent` 容器、`renderJapaneseView(view)` 使用 `replaceChildren()` 替換唯一 view、首頁與單字容器不應同時作為主內容顯示，以及首頁 render path 不直接呼叫 vocabulary filter / cards render。

### 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。

### `vocabulary.json` 筆數確認

Python 檢查確認 `vocabulary.json` 仍為 3179 筆。本次未修改 `vocabulary.json`，未新增或刪除任何日文單字。

### 是否仍有殘留問題

靜態檢查與既有 audit script 未發現首頁與單字頁同時 render 的殘留路徑。此環境未提供可直接執行的瀏覽器或手機 viewport smoke test 工具；實機視覺仍建議後續以瀏覽器補驗。

## 後續修正：日文首頁與單字頁實際切換

### 真正問題原因

本次重新追查後確認，「進入單字」入口是 `<button>`，不是 `<a href="#...">`，因此問題不是頁內錨點或 scroll。程式也已加入 `currentJapaneseView` 與單一 `#japaneseContent` 容器，但日文頁引用的共用資產仍停在舊 query string：`style.css?v=1.8` 與 `script.js?v=1.9`。實機若沿用快取資產，就會繼續執行舊的 click handler：只把單字區塊展開在主入口下方，而沒有執行新的 `japaneseContent.replaceChildren(nextViewElement)` 單一 view 替換邏輯。因此使用者看到四大功能方塊仍在上方，單字分類與單字卡追加在下方，也看不到新版單字頁頁首的「返回日文首頁」按鈕。

### 為什麼點單字後會在首頁下方追加內容

舊資產中的流程仍是靜態首頁區塊與單字區塊同時存在於 DOM，點擊「進入單字」只切換單字區塊顯示並觸發既有單字 render，沒有用單一容器替換首頁 view。當瀏覽器未載入新版 `script.js` 時，就不會執行 `currentJapaneseView = 'vocabulary'` 與 `#japaneseContent.replaceChildren(...)`，所以畫面仍像「首頁 + 下方單字內容」。

### 修正使用的 view 切換方式

目前保留單一日文內容容器 `#japaneseContent` 與 `currentJapaneseView`。`renderJapaneseView(view)` 會標準化 view 名稱，取得唯一 view 節點，並以 `japaneseContent.replaceChildren(nextViewElement)` 清空並替換日文主內容。此次追加修正日文頁資產版本，將日文頁載入的 CSS 與 JS query string 更新到 `v=2.0`，確保實機會載入包含單一 view 切換與返回按鈕的新資產，而不是沿用舊版追加式邏輯。

### 單字頁返回日文首頁按鈕

單字頁上方保留明確的「返回日文首頁」按鈕，按鈕使用 `data-japanese-back-home`，click handler 會呼叫 `renderJapaneseView('home')`。返回後 `#japaneseContent` 只保留首頁 view，單字搜尋、分類、統計與單字卡會從日文主內容容器移出。

### 日文首頁現在顯示內容

日文首頁 view 只顯示頂部導覽下方的日文學習標題 / 說明，以及單字、文法、閱讀、聽力四大功能方塊。首頁不顯示單字搜尋、分類篩選、詞性分類、3179 個單字統計、單字卡、單字測驗入口、閱讀練習、閱讀測驗或舊日文 tab。

### 單字頁現在顯示內容

單字 view 只顯示日文單字頁標題、返回日文首頁按鈕、單字搜尋、分類篩選、詞性分類、程度篩選、單字練習 / 單字測驗入口與單字卡。單字頁不顯示首頁四大功能方塊、文法卡、閱讀卡、聽力卡或日文首頁說明。

### 閱讀頁是否仍正常

閱讀 view 仍由同一個 view 切換入口顯示，保留閱讀頁標題、返回日文首頁按鈕、閱讀練習 / 閱讀測驗切換與既有閱讀內容；本次未修改閱讀 ruby 規則。

### 按鈕顏色是否修正

「進入單字」與「進入閱讀」仍使用日文主色橘紅。文法與聽力維持準備中 disabled / muted 樣式，使用淡灰底與灰色文字，不使用咖啡色、深棕色或主 CTA 顏色。

### 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。
- `node scripts/check-japanese-main-entry.js`：通過，並新增檢查日文頁必須載入 `script.js?v=2.0` 與 `style.css?v=2.0`，避免實機沿用舊快取資產。

### `vocabulary.json` 筆數確認

Python 檢查確認 `vocabulary.json` 仍為 3179 筆。本次未修改 `vocabulary.json`，未新增或刪除日文單字。

### 是否仍有殘留問題

靜態檢查與既有 audit script 未發現首頁與單字頁同時顯示的程式路徑；本次主要補上實機快取破除，確保瀏覽器載入包含單一 view 切換的新 JS / CSS。此環境未提供可直接執行的瀏覽器或手機 viewport smoke test 工具，仍建議部署後以實機重新整理確認。

## 後續修正：保留全站導覽與日文 view 互斥

### 真正問題原因

本次再追查時，先釐清「首頁 / 日文學習 / 英文學習」是全站導覽，應永久保留，不是錯誤，也不是單字頁的返回按鈕。真正問題仍集中在全站導覽下方的日文內容區：舊版 click handler 或快取腳本可能只展開 `#japaneseMainContent`，讓它出現在 `#japaneseHomeContent` 後面；也就是日文首頁四大功能方塊與單字內容是兩個同時存在的日文內容 section，而不是互斥 view。

### 為什麼點單字後會在四大方塊下方追加內容

「進入單字」是 `button`，不是頁內錨點；錯誤不是全站導覽，也不是 scroll。錯誤來源是日文內容區的 click flow 沒有在最後一步強制替換唯一 view：當舊 handler 先顯示單字區塊時，首頁區塊可能仍留在 DOM 主流程中，於是畫面變成「四大功能方塊 + 單字頁內容」。此外若實機載入舊資產，就看不到單字頁內的「返回日文首頁」按鈕。

### 全站導覽與日文內容區的差異

全站導覽位於 `#japaneseContent` 外面，包含「首頁 / 日文學習 / 英文學習」，本次不移除、不隱藏、不拿來當返回日文首頁按鈕。日文 view 互斥只作用於 `#japaneseContent` 內的 `home`、`vocabulary`、`reading`、`listening` 內容。

### 修正的 wrapper / render 條件 / click handler

本次在日文頁補上頁面層級的 `window.showJapaneseContentView(view)` 保險切換器，直接管理 `#japaneseContent` 內的 view。它會先標準化 `vocab` / `vocabulary`，再用 `japaneseContent.replaceChildren(nextElement)` 只保留單一 view，並同步設定其他日文 view 的 `hidden` 狀態。頁面層級 click delegation 會攔截 `[data-japanese-entry]` 與 `[data-japanese-back-home]`，呼叫同一個互斥切換器，確保即使舊 handler 先跑，最後仍由頁面層級保險切換把首頁四大方塊移出日文內容區。

同時日文頁資產版本升到 `style.css?v=2.1` 與 `script.js?v=2.1`，確保實機載入包含這次保險切換的新 HTML / JS / CSS。

### 單字頁返回日文首頁按鈕目前位置

單字頁的「返回日文首頁」按鈕位於 `#japaneseMainContent` 內的 `.feature-page-header`，在「日文單字」標題旁。這是單字頁內容內的返回按鈕，不是全站導覽。點擊後會呼叫 `window.showJapaneseContentView('home')`，只顯示日文首頁四大功能方塊並移除單字內容。

### 日文首頁目前顯示內容

日文首頁 view 在全站導覽下方只顯示日文學習標題 / 說明，以及單字、文法、閱讀、聽力四大功能方塊；不顯示返回日文首頁按鈕、單字搜尋、分類、詞性、3179 統計、單字卡、閱讀練習、閱讀測驗或舊日文 tab。

### 單字頁目前顯示內容

單字頁 view 在全站導覽下方顯示「返回日文首頁」按鈕、日文單字標題、搜尋、分類 / 詞性 / 程度篩選、單字練習 / 單字測驗入口與單字卡；不顯示日文首頁四大方塊、文法卡、閱讀卡、聽力卡或首頁說明。

### 閱讀頁是否同步確認

閱讀頁同樣由 `window.showJapaneseContentView('reading')` 管理，會保留全站導覽但移除日文首頁四大方塊，顯示閱讀頁標題、返回日文首頁按鈕、閱讀練習 / 閱讀測驗與既有閱讀內容。本次未修改閱讀 ruby 規則：練習模式仍顯示 ruby，測驗模式仍不顯示 ruby。

### 按鈕顏色修正結果

「進入單字」與「進入閱讀」維持日文主色橘紅。文法與聽力維持 disabled / muted 樣式，使用淡灰底與灰色文字。「返回日文首頁」使用既有次要按鈕樣式，不使用咖啡色或深棕色異常樣式。

### 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。
- `node scripts/check-japanese-main-entry.js`：通過，並檢查日文頁有 `window.showJapaneseContentView(view)`、`replaceChildren()` 與 `v=2.1` 資產版本。

### `vocabulary.json` 筆數確認

Python 檢查確認 `vocabulary.json` 仍為 3179 筆。本次未修改 `vocabulary.json`，未新增、刪除或調整任何日文單字。

### 是否仍有殘留問題

靜態檢查與既有 audit script 未發現首頁與單字頁同時存在於日文內容區的程式路徑。此環境未提供可直接執行的瀏覽器或手機 viewport smoke test 工具；部署後仍建議以實機重新整理並點擊「進入單字」「返回日文首頁」「進入閱讀」確認。

## 後續修正：四大方塊不再作為 tab 使用

### 真正問題原因

實機仍看到「單字」卡片變成 active 外框，代表四大功能方塊仍被舊 click handler 當作同頁 tab / feature switch 使用。雖然頁面已有單一 view 切換器，但舊的 `japaneseEntryButtons` target listener 仍可能先執行，先把卡片加上 `is-active`、更新 `aria-pressed`，並顯示下方 vocabulary section；若後續互斥切換沒有在事件最前面攔截，就會呈現「四大卡片留在上方 + 單字內容在下方」。

### 為什麼點單字後四大方塊會保留並出現 active 外框

「進入單字」按鈕不是錨點，也不是 scroll；問題是四大卡片仍有可被舊 tab 邏輯處理的 `data-japanese-entry` click flow。舊 handler 會把被點擊的單字卡設為 active，這對 tab 是合理的，但對主入口導覽是錯誤的。主入口卡片不應在功能頁維持 selected / active 狀態，因為點擊後應離開 home view。

### 修正的 click handler / view state / render 條件

本次把日文頁的頁面層級 click delegation 改成 capture phase，並在攔截 `[data-japanese-entry]` 或 `[data-japanese-back-home]` 後呼叫 `event.stopImmediatePropagation()`。這會讓主入口卡片先被真正 view 導覽處理，不再落入舊 tab handler。切換時仍使用 `window.showJapaneseContentView(view)` 與 `japaneseContent.replaceChildren(nextElement)`，確保日文內容區一次只保留一個 view。

同時在 `script.js` 中移除四大入口卡片的 active tab 呈現：`renderJapaneseView()` 會對所有 `japaneseEntryButtons` 移除 `is-active` 並將 `aria-pressed` 設為 `false`。四大方塊現在只作為 home view 的主入口導覽，不再作為同頁 tab。

### 四大方塊目前只在哪個 view 顯示

四大方塊只存在於 `home` view，也就是 `#japaneseHomeContent`。切到 `vocabulary` 或 `reading` 時，日文內容容器會替換為 `#japaneseMainContent` 或 `#japaneseReadingPanel`，因此不顯示四大方塊，也不會留下單字卡 active 外框。

### 單字頁返回日文首頁按鈕位置

單字頁的「返回日文首頁」按鈕位於 `#japaneseMainContent` 的 `.feature-page-header` 中，在日文單字頁標題旁。這個按鈕只在 vocabulary view 內出現，點擊後切回 home view，單字分類、搜尋、單字功能與單字卡會消失。

### 閱讀頁返回日文首頁按鈕位置

閱讀頁的「返回日文首頁」按鈕位於 `#japaneseReadingPanel` 的 `.feature-page-header` 中，在日文閱讀頁標題旁。閱讀頁同樣不顯示四大功能方塊。

### 單字頁是否仍正常

單字頁仍保留分類篩選、搜尋單字、單字功能、單字練習 / 單字測驗切換與單字卡。此次未修改日文單字測驗邏輯，也未修改 `vocabulary.json`。

### 閱讀頁是否仍正常

閱讀頁仍保留閱讀練習 / 閱讀測驗切換與既有閱讀內容。本次未修改閱讀 ruby 規則：閱讀練習模式仍顯示 ruby，閱讀測驗模式仍不顯示 ruby。

### 按鈕顏色修正結果

「進入單字」與「進入閱讀」保留日文主色橘紅。文法與聽力維持 disabled / muted 樣式。由於點擊單字後會離開 home view，單字卡片不會留在畫面上呈現 active 外框。

### 防呆檢查結果

新增並執行 `node scripts/check-japanese-view-isolation.js`。檢查內容包含：日文頁有單一 `#japaneseContent`、有 `window.showJapaneseContentView(view)`、有 `replaceChildren()`、入口 click 使用 capture + `stopImmediatePropagation()` 攔截舊 tab handler、四大入口只允許 `vocabulary` / `reading` 可導覽、文法 / 聽力維持準備中，以及 `script.js` 會移除入口卡片 `is-active`。

### 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，無 warning。
- `node scripts/check-japanese-main-entry.js`：通過。
- `node scripts/check-japanese-view-isolation.js`：通過。

### `vocabulary.json` 筆數確認

Python 檢查確認 `vocabulary.json` 仍為 3179 筆。本次未修改 `vocabulary.json`，未新增、刪除或調整日文單字。

### 是否仍有殘留問題

靜態檢查未發現四大方塊作為 tab 留在 vocabulary / reading view 的路徑。此環境未提供可直接執行的瀏覽器或手機 viewport smoke test 工具；部署後建議以實機確認點擊「進入單字」後四大方塊與 active 外框都消失。

## 後續修正：四大方塊納入 home view 容器

### 真正問題原因

本次重新檢查 `japanese/index.html` 與 `script.js` 後確認，日文四大功能卡片本身位於 `#japaneseHomeContent`，而單字內容位於同一個日文內容 root `#japaneseContent` 底下的另一個同層容器 `#japaneseMainContent`。靜態 DOM 初始結構是：全站導覽在 `#japaneseContent` 外面；日文內容 root `#japaneseContent` 裡面依序放 `#japaneseHomeContent`、`#japaneseMainContent`、`#japaneseReadingPanel` 與 `#japaneseListeningPanel`。

正式站仍出現「四大方塊 + 單字頁內容」的關鍵風險，是頁面在載入 `script.js` 後又執行一段頁面內 inline view 切換器。外部 `script.js` 會先呼叫 `renderJapaneseView("home")`，把 `#japaneseContent` 替換成只剩 `#japaneseHomeContent`；這會讓 `#japaneseMainContent` 與 `#japaneseReadingPanel` 從 document 中移出。接著 inline script 再用 `document.querySelector("#japaneseMainContent")` 與 `document.querySelector("#japaneseReadingPanel")` 建立 views map 時，可能取得不到已被移出主 document 的功能頁節點。這會讓頁面層級保險切換器不再可靠，正式站若又受到快取或舊 handler 影響，就可能退回「首頁容器留在上方、單字內容顯示在下方」的錯誤體驗。

### 四大方塊原本所在 DOM 容器

四大方塊原本就在 `#japaneseHomeContent` 內的 `<section class="entry-section japanese-main-entry-section">`，四張卡片的外層 grid 是 `<div class="entry-grid japanese-main-entry-grid">`。其中可導覽的兩張卡是 `data-japanese-entry="vocabulary"` 與 `data-japanese-entry="reading"`；文法與聽力是準備中卡片，沒有正式導覽入口。

### 為什麼之前只替換下方內容仍會留下四大方塊

若 click flow 只處理 `#japaneseMainContent`，或只把單字頁內容 append / 顯示在首頁容器後方，`#japaneseHomeContent` 裡的 hero 與四大方塊不會被移出。因此畫面會變成「日文主入口標題、日文四大功能方塊、單字頁內容」。正確做法必須讓 `#japaneseHomeContent`、`#japaneseMainContent` 與 `#japaneseReadingPanel` 成為同一個 root 底下互斥的 top-level view，而不是讓單字內容只替換四大方塊下方的小容器。

### 本次修正方式

本次保留單一日文內容 root `#japaneseContent`，並移除日文頁底部重複的 inline view 切換器，避免它在外部 `script.js` 已移動 view 節點後重新查詢 DOM 而拿到不完整 views map。日文 view 切換統一由 `script.js` 的 `renderJapaneseView(view)` 與 `window.showJapaneseContentView = switchJapaneseTab` 負責，切換時會對同一個 `#japaneseContent` 使用 `replaceChildren(nextViewElement)`，讓 home / vocabulary / reading / listening 同一時間只會有一個 view 留在日文內容 root 中。

### 單字頁目前 view 結構

單字頁是 `#japaneseMainContent`。它是 `#japaneseContent` 的 top-level vocabulary view，內容最上方是 `.feature-page-header`，其中包含「返回日文首頁」按鈕，按鈕具有 `data-japanese-back-home`。返回按鈕下方才是「日文單字」、分類篩選、搜尋單字、單字功能、單字測驗區與 `#vocabularyCards` 單字卡容器。

### 閱讀頁目前 view 結構

閱讀頁是 `#japaneseReadingPanel`。它是 `#japaneseContent` 的 top-level reading view，內容最上方同樣有 `.feature-page-header` 與 `data-japanese-back-home` 的「返回日文首頁」按鈕。閱讀功能區保留「閱讀練習」與「閱讀測驗」切換；本次沒有修改閱讀測驗 ruby 規則，閱讀練習仍顯示 ruby，閱讀測驗仍不顯示 ruby。

### 返回日文首頁按鈕位置

「返回日文首頁」位於功能頁本身的 `.feature-page-header` 內：單字頁位於 `#japaneseMainContent`，閱讀頁位於 `#japaneseReadingPanel`。它不是全站導覽，也不會取代「首頁 / 日文學習 / 英文學習」的全站導覽。

### 版本標記與 asset query string

本次將日文頁加入 `data-japanese-layout-version="2.3"` 與 `<meta name="japanese-layout-version" content="2.3">`，並把日文頁載入的 `style.css` 與 `script.js` query string 更新為 `v=2.3`，降低 GitHub Pages 或瀏覽器快取造成正式站誤判的機率。

### 防呆檢查強化

`scripts/check-japanese-view-isolation.js` 已改成檢查實際 DOM 結構，而不是只檢查 click handler 片段。新版檢查會確認：`#japaneseContent` 是單一日文 view root；`#japaneseHomeContent` 內含四大入口；`#japaneseMainContent` 不含 `data-japanese-entry`、不含「日文四大功能 / 進入單字 / 進入閱讀」；`#japaneseReadingPanel` 不含四大入口；單字與閱讀 view 都有 `data-japanese-back-home` 與「返回日文首頁」；`script.js` 會用同一個 root 執行 `replaceChildren(nextViewElement)`；頁面版本與 asset 版本皆為 `2.3`。

### 主要 script 結果與 vocabulary 筆數

本次執行 `node scripts/auditSiteHealth.js`、`node scripts/audit-reading-vocabulary.js`、`node scripts/check-reading-ruby.js`、`node scripts/check-japanese-main-entry.js` 與 `node scripts/check-japanese-view-isolation.js`。`vocabulary.json` 仍確認為 3179 筆，本次沒有修改 `vocabulary.json`，也沒有新增或刪除日文單字。

### 是否仍有殘留問題

靜態 DOM 與 script 檢查已確認四大方塊只屬於 home view，單字頁與閱讀頁不包含四大入口。此環境未提供可直接操作 GitHub Pages 實機的瀏覽器或手機 viewport；部署後仍建議以正式網址強制重新整理，確認 `japanese-layout-version` 與資產 query string 已更新為 `2.3`，再點擊「進入單字」「返回日文首頁」「進入閱讀」驗收。

## 後續修正：閱讀與文法入口回歸

### 本次問題原因

前次為了修正日文主入口切換，將日文頁改為由 `renderJapaneseView(view)` 搭配 `#japaneseContent.replaceChildren(nextViewElement)` 管理單一主要 view。這個方向保留了首頁與單字 / 閱讀頁不混在一起的成功狀態，但合併時把文法入口從可點擊的 `data-japanese-entry="grammar"` 卡片改成準備中 `<article>`，因此文法不再會觸發 `window.showJapaneseContentView()`。

閱讀頁的問題則和同一個 wrapper / view 切換有關：閱讀 panel 會被 `replaceChildren()` 移入唯一容器，閱讀頁雖能進入，但閱讀 panel 初始化 guard 只在第一次執行時呼叫 `setReadingMode("practice")`。若後續切換 view 或閱讀內容需要重新同步目前 mode，guard 會直接 return，造成閱讀練習 / 閱讀測驗按鈕狀態與內容渲染容易不同步。

### 文法入口為何變成不可進入

文法卡片原本已有既有文法資料與基礎頁流程，使用 `grammar.json` 與 `switchMode("grammar")` / `switchMode("grammar-quiz")`。前次整理把文法卡改成 `aria-label="文法準備中"` 的不可點擊卡，移除了 `data-japanese-entry="grammar"`，所以既有 click handler 找不到可導向 grammar view 的入口。

### 閱讀練習 / 閱讀測驗為何無法進入

閱讀頁內的兩個按鈕仍存在，但 `initializeReadingPanel()` 的一次性 guard 會讓後續回到閱讀 view 時不再執行 `setReadingMode()`。在單一容器移動 DOM 的架構下，進入閱讀 view 應每次同步目前閱讀 mode，否則 practice / quiz 的渲染與按鈕狀態可能停在舊狀態。

### 修正的 handler / view / mode 切換

- 恢復首頁文法卡為可點擊入口：`data-japanese-entry="grammar"`。
- `normalizeJapaneseView()` 增加 `grammar` view。
- `getJapaneseViewElement()` 讓 `grammar` 使用既有 `#japaneseMainContent`。
- `renderJapaneseView()` 在 grammar view 顯示既有主內容容器，並把頁首文字切成「日文文法 / Japanese Grammar」。
- `switchJapaneseTab()` 在 grammar view 呼叫 `switchMode("grammar")`，保留既有文法基礎資料，不新增大量題庫或假流程。
- `initializeReadingPanel()` 改為每次進入閱讀 view 都同步目前 practice / quiz mode，不再因已初始化就跳過渲染。

### 文法目前狀態

文法入口已恢復可進入。頁面使用既有文法資料與既有文法練習 / 文法測驗模式，頁首標示為日文文法，並說明文法基礎頁仍在整理中。本次沒有新增大量文法題庫，也沒有新增假測驗流程。

### 閱讀練習狀態

閱讀頁可由首頁「進入閱讀」進入；閱讀練習按鈕會顯示現有文章與題目，並維持原本 ruby / 假名輔助規則。

### 閱讀測驗狀態

閱讀測驗按鈕可切換到測驗模式並顯示題目。測驗模式仍沿用既有渲染流程，不顯示 ruby / 假名輔助；本次未修改閱讀題庫與 ruby 規則。

### 主入口 view 切換狀態

仍保留已成功的主入口切換：日文首頁只顯示四大功能方塊；進入單字、文法或閱讀後，首頁四大方塊會從主要內容容器移出；返回日文首頁後四大方塊重新出現。

### 主要 script 結果與 vocabulary 筆數

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過且無 warning。
- `vocabulary.json` 筆數確認：3179。

### 殘留問題

日文單字區內部的測驗區排版問題仍刻意保留未處理：單字測驗區仍可能顯示分類篩選、程度篩選、搜尋單字和單字功能。該問題將另開任務，本次沒有修改單字測驗排版、沒有新增單字、沒有進行 Batch 07。

## 後續修正：文法與閱讀內部分頁初始化

### 本次問題原因

前次日文主入口修正已讓 `home` / `vocabulary` / `reading` 透過單一 `#japaneseContent` root 互斥切換，四大方塊在進入功能頁後會正確消失。本次問題集中在兩個內部入口：文法入口需要明確接回 grammar view；閱讀頁進入後，內部的「閱讀練習」與「閱讀測驗」需要在閱讀 view render / re-attach 後重新同步目前 DOM 與 mode handler。

### 文法入口為何無法進入

前次整理曾把文法卡視為準備中，若缺少 `data-japanese-entry="grammar"` 或 `normalizeJapaneseView()` / `getJapaneseViewElement()` 未把 `grammar` 導向既有主內容容器，點擊文法就不會進入文法頁。本次確認文法卡保持可點擊的 `data-japanese-entry="grammar"`，`showJapaneseContentView('grammar')` 會進入 grammar view，並在 `switchJapaneseTab('grammar')` 中呼叫既有 `switchMode('grammar')`，顯示文法基礎頁整理中狀態與既有文法卡片，不新增題庫或假測驗流程。

### 閱讀練習 / 閱讀測驗為何無法進入

閱讀頁由 `replaceChildren()` 移入單一 view root 後，閱讀內部按鈕若只依賴初始載入時取得的節點與一次性 click binding，在 view 被移動或後續 render 後可能指向舊節點或未重新同步 active mode。本次改為在閱讀 view 每次初始化時執行 `bindReadingModeButtons(readingViewElement)`，重新取得目前 reading view 內的 practice / quiz 按鈕與 `#readingContent`，並使用 scoped event delegation 綁定 `[data-reading-mode]`。

### 修正內容

1. 閱讀練習按鈕補上 `data-reading-mode="practice"`。
2. 閱讀測驗按鈕補上 `data-reading-mode="quiz"`。
3. 新增 `bindReadingModeButtons(readingViewElement)`，限定在目前 `#japaneseReadingPanel` 內重新取得按鈕與內容容器。
4. `initializeReadingPanel()` 每次閱讀 view render 後都會呼叫 `bindReadingModeButtons()`，再以 `setReadingMode()` 同步 practice / quiz 顯示狀態。
5. 使用 `readingViewElement.dataset.readingModeBound` 避免重複綁定造成多次觸發。
6. 更新 `scripts/check-japanese-main-entry.js` 與 `scripts/check-japanese-view-isolation.js`，檢查 grammar entry、reading entry、reading mode data attribute、reading mode handler 與 reading view 初始化。

### 狀態確認

- 主入口 view 切換成功狀態：保留，未重構 `#japaneseContent`、`#japaneseHomeContent` 或四大方塊容器。
- 文法目前狀態：可由首頁進入既有文法基礎頁；頁面標示整理中並提供「返回日文首頁」。
- 閱讀練習目前狀態：可由閱讀頁內按鈕進入，練習模式仍呼叫既有 `showReadingPracticeQuestion()`，保留 ruby / 假名顯示規則。
- 閱讀測驗目前狀態：可由閱讀頁內按鈕進入，測驗模式仍呼叫既有 `startReadingQuiz()`，維持不顯示 ruby / 假名。
- 單字入口：未修改單字頁內部排版與測驗流程，入口仍沿用既有 vocabulary view。
- 三個主要 script 結果：`auditSiteHealth.js`、`check-japanese-main-entry.js`、`check-japanese-view-isolation.js` 皆需在提交前通過；`check-reading-ruby.js` 仍應無 warning。
- `vocabulary.json` 筆數：本次不修改，提交前確認仍為 3179 筆。
- 殘留問題：單字測驗區排版問題未在本次處理，需另開任務。

## 後續修正：單字學習與測驗 view 分離

### 1. 本次問題原因

追查後確認，日文單字測驗原本不是獨立的內部 view，而是放在同一個 `#japaneseMainContent` 單字頁容器下方。單字測驗按鈕只切換 `activeMode = "quiz"`，再把 `#quizPanel` 顯示出來，並隱藏單字卡控制與單字卡列表；但分類篩選、程度篩選、搜尋單字與「單字功能」區塊仍屬於整個單字頁容器，沒有被任何 `study` / `quiz` 互斥 view 包住，因此進入單字測驗後仍會留在畫面上。

### 2. 為什麼單字測驗頁會顯示分類 / 搜尋 / 單字功能

原本的單字測驗區只有 `#quizPanel` 本身被 `hidden` 切換；分類篩選、程度篩選、搜尋單字與單字功能不在 `#quizPanel` 裡，也沒有獨立的 `vocabularyView` 狀態控制。也就是說，測驗區只是同頁下方的面板，並不是互斥的測驗 view。這使得測驗模式顯示時，學習頁工具仍然維持顯示。

### 3. 修正後的單字學習 view 結構

本次新增 `#japaneseVocabularyStudyView` 作為日文單字區內部的學習 / 練習 view。此 view 保留返回日文首頁、日文單字標題下方的學習工具內容，包括分類篩選、詞性分類、程度篩選、搜尋單字、單字功能、單字卡列表與既有「單字測驗」入口。進入單字頁時會回到 `cards` 模式，確保使用者先看到乾淨的單字學習 / 練習 view。

### 4. 修正後的單字測驗 view 結構

`#quizPanel` 現在標記為 `data-japanese-vocabulary-view="quiz"`，並與 `#japaneseVocabularyStudyView` 成為同層的互斥區塊。進入單字測驗時，`renderJapaneseVocabularyView("quiz")` 會隱藏整個學習 view，因此分類篩選、程度篩選、搜尋單字、單字功能與單字卡列表不會出現在測驗畫面。測驗 view 只保留測驗標題、題目內容、選項、作答回饋、下一題、重新開始與返回單字學習等必要元素。

### 5. 單字測驗返回方式

單字測驗 view 新增「返回單字學習」按鈕。點擊後會呼叫既有 `switchMode("cards")` 流程，切回單字學習 / 練習 view，並恢復分類篩選、程度篩選、搜尋單字、單字功能與單字卡列表。

### 6. 單字測驗作答流程是否正常

本次未改動出題、選項、答題判定、答題回饋、下一題、重新開始測驗或分數統計邏輯。修正只調整日文單字區內部 view 的顯示條件，測驗仍沿用既有 `createQuizQuestion` / `createActiveQuizQuestion` / `restartQuiz` 流程。

### 7. 是否保留主入口 view 切換成功狀態

已保留日文首頁 `home`、單字 `vocabulary`、文法 `grammar`、閱讀 `reading` 與聽力 `listening` 的 top-level view 切換。日文首頁仍只顯示四大方塊；點「進入單字」後四大方塊消失並顯示單字學習 view；返回日文首頁仍正常。

### 8. 文法 / 閱讀是否未受影響

本次未修改正式文法內容、閱讀題庫或閱讀 ruby 規則。文法入口仍可進入整理中頁；閱讀練習仍使用 ruby；閱讀測驗仍維持不顯示 ruby。

### 9. 防呆檢查結果

新增 `scripts/check-japanese-vocabulary-view-split.js`，檢查日文單字區具有 study / quiz 互斥 view、測驗 view 不包含分類篩選 / 程度篩選 / 搜尋單字 / 單字功能 / 單字卡列表、測驗 view 具備返回單字學習，以及單字學習 view 仍保留分類、搜尋、單字卡與單字測驗入口。

### 10. 三個主要 script 結果

- `node scripts/auditSiteHealth.js`：通過。
- `node scripts/audit-reading-vocabulary.js`：通過。
- `node scripts/check-reading-ruby.js`：通過，沒有 warning。

### 11. `vocabulary.json` 筆數確認

`vocabulary.json` 未修改；檢查結果仍為 3179 筆。

### 12. 是否仍有殘留問題

本次目標範圍內未發現殘留問題。單字測驗 view 已與單字學習 / 練習 view 分離；分類篩選、程度篩選、搜尋單字、單字功能與單字卡列表不會出現在單字測驗 view。

## 後續修正：單字中頁與練習 / 測驗入口分離

### 1. 本次新增單字中頁的目的

本次修正將「進入單字」後的第一層畫面改為日文單字中頁，避免使用者從日文首頁直接落入單字練習列表。新的中頁只負責分流「單字練習」與「單字測驗」，讓單字練習工具與乾淨測驗頁維持互斥。

### 2. 新的單字流程

新的日文單字流程為：日文學習主入口 → 單字 → 單字練習 / 單字測驗。點擊日文首頁「進入單字」後，預設進入單字中頁；點「單字練習」才顯示分類、程度、搜尋、單字功能與單字卡；點「單字測驗」才進入乾淨測驗頁。

### 3. 單字中頁結構

單字中頁保留返回日文首頁、日文單字標題與「選擇要進行單字練習或單字測驗」說明，並新增兩張大卡片：「單字練習」與「單字測驗」。中頁不包含分類篩選、程度篩選、搜尋單字、單字功能、單字卡、測驗題目或測驗選項。

### 4. 單字練習頁結構

單字練習頁維持既有學習頁排版，包含分類篩選、詞性分類、程度篩選、搜尋單字、單字功能、單字卡控制與單字卡列表。本次在練習頁上方新增「返回單字選單」，讓使用者可回到中頁重新選擇練習或測驗。

### 5. 單字測驗頁結構

單字測驗頁維持乾淨測驗 view，只顯示測驗標題、題目內容、選項、作答回饋、下一題、重新開始測驗與統計資訊。測驗頁不顯示分類篩選、程度篩選、搜尋單字、單字功能、單字卡列表或 3179 個單字統計。

### 6. 返回單字選單邏輯

單字練習頁與單字測驗頁都提供「返回單字選單」。點擊後會將日文單字內部 view 切回 `menu`，並隱藏練習工具或測驗面板，只顯示「單字練習」與「單字測驗」兩個入口。

### 7. 單字測驗乾淨頁面是否保留

已保留。單字測驗仍是獨立的 `quiz` view，與 `menu`、`practice` 三段狀態互斥；分類、搜尋、單字功能與單字卡仍不會出現在測驗頁。

### 8. 文法 / 閱讀是否未受影響

本次未修改文法頁內容、閱讀頁內容、閱讀 ruby 規則或閱讀題庫。文法入口仍使用既有整理中頁流程；閱讀練習仍保留 ruby；閱讀測驗仍維持不顯示 ruby。

### 9. 防呆檢查結果

已更新 `scripts/check-japanese-vocabulary-view-split.js`，並新增 `scripts/check-japanese-vocabulary-menu.js`，檢查單字內部 view 是否具備 `menu / practice / quiz` 三段狀態、單字中頁是否只有練習與測驗入口、單字中頁是否排除分類 / 搜尋 / 單字卡、練習頁是否保留分類 / 搜尋 / 單字卡、測驗頁是否仍排除練習工具，以及練習頁與測驗頁是否都有返回單字選單。

### 10. 三個主要 script 結果

本次完成後執行 `node scripts/auditSiteHealth.js`、`node scripts/audit-reading-vocabulary.js`、`node scripts/check-reading-ruby.js`，結果皆通過；另執行 `node scripts/check-japanese-main-entry.js`、`node scripts/check-japanese-view-isolation.js`、`node scripts/check-japanese-vocabulary-view-split.js` 與 `node scripts/check-japanese-vocabulary-menu.js`，結果皆通過。

### 11. `vocabulary.json` 筆數確認

已使用 Python 讀取 `vocabulary.json` 並確認筆數仍為 3179 筆。本次未修改 `vocabulary.json`，未新增、刪除或調整正式日文單字。

### 12. 是否仍有殘留問題

本次任務範圍內未發現殘留問題。瀏覽器或手機 viewport 視覺 smoke test 若需實際截圖，可於具備瀏覽器測試工具的環境再補做；本次以靜態防呆檢查與既有 audit script 完成回歸。
