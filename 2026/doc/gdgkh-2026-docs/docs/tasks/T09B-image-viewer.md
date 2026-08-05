# T09B 圖片放大檢視器 assets/js/ui/image-viewer.js

> 這是一個自足的施工單。**整份貼給模型即可**，不需要再貼別的文件。
> 分支：`feature/T09B-image-viewer`（從 `develop` 切出，完成後合回 `develop`）
>
> 這個檔案由 `docs/build-tasks.mjs` 產生，**不要手動修改**。
> 要改內容請改 `gdgkh-2026-build-prompts.md` 後重跑腳本。

---

# §A 共用前置（每個任務都貼這段）

```
你是資深前端工程師。我們在做一個活動官網，你要嚴格照規格寫程式。

## 技術限制（違反就是錯的）
- 純靜態網站，沒有建置流程、沒有打包工具
- 不使用任何框架（禁止 React / Vue / jQuery / Tailwind / Bootstrap）
- 不使用任何 npm 套件（T21 / T22 的產生器可用已安裝的 canvas）
- JavaScript 用 ES Modules，寫在 .js 檔，用 import / export
- CSS 用原生 CSS + CSS Variables，不用預處理器
- 禁止 innerHTML、outerHTML、document.write、eval
  → 一律用 document.createElement + textContent + appendChild
- 禁止 localStorage 以外的儲存 API
- 支援瀏覽器：最新版 Chrome / Safari / Firefox，不需支援 IE

## 專案路徑
這是一個已存在的 repo，網站根目錄是 /2026/，相對路徑都從這裡算起。
目錄慣例（不可改）：
  2026/assets/css/       樣式
  2026/assets/js/        前端程式（core / ui / sections 三層）
  2026/data/             JSON 資料
  2026/images/           圖片，依類型分資料夾
  2026/share/            產生的分享頁（不可手改）
  2026/scripts/          產生器（.mjs）

注意：2026 是全新設計，不要參考或沿用 2025 目錄的任何寫法。
/2026/ 原本的早鳥預告頁會被整個刪除，不需要相容它的任何結構。

## 品牌規範（GDG 官方社群，違反就是錯的）
- 字體：內文用 --gk-font-body（系統字體），標題用 --gk-font-display，
  中文字重上限 700，不可用 800 或 900，不可載入中文 webfont
- 顏色只能用這六個官方 hex 與其官方衍生色，不可自創或用近似色：
  #ea4335（紅）#4285f4（藍）#f9ab00（黃）#34a853（綠）#1e1e1e（黑）#f0f0f0（白）
  注意黑是 #1e1e1e 不是 #000000，白是 #f0f0f0 不是 #ffffff，黃是 #f9ab00 不是 #fbbc04
- 一律透過 tokens.css 的 CSS 變數使用顏色，不要在其他檔案裡直接寫 hex
- 字體只能用 Google Sans 與 Google Sans Mono，中文用 Noto Sans TC
- 文案中社群名稱寫「GDG Kaohsiung」，職稱一律用「GDG Organizer」，
  **絕對不可以寫「GDG Lead」**，該用語已停用

## 識別碼與圖片路徑（重要）
每筆資料只有一個 id，格式是小寫底線英文（例如 andy_wang）。
沒有另外的 slug 欄位，id 同時是網址、圖片檔名與交叉關聯鍵。

JSON 裡不存圖片路徑，一律由 id 推導：
  講者頭像    images/speakers/{id}.jpg
  工作人員    images/staff/{id}.jpg
  感謝 logo   images/thanks/{id}.png
  擺攤 logo   images/booths/{id}.png
  分享縮圖    images/og/{type}/{id}.png（只有 speakers / staff / thanks / booths 四種）
寫一個共用函式處理這件事，不要各檔案自己組字串。

## 程式風格（CI 會用 ESLint + Prettier 檢查，不符合會被擋）
- 字串用單引號，結尾要分號
- 縮排 2 空格，不用 tab
- 每行最長 120 字元（HTML 檔 100）
- 陣列與物件的尾逗號：ES5 風格（物件與陣列要，函式參數不要）
- 箭頭函式參數一律加括號：(x) => x
- 物件大括號內留空格：{ a: 1 }
- 換行用 LF
- 禁止 var，一律 const 或 let，能用 const 就用 const
- 字串串接用樣板字串，不要用 +
- 比較一律用 === 和 !==
- if / for / while 一律加大括號，不可省略
- console 只能用 console.warn 和 console.error
- 未使用的函式參數要以底線開頭命名

## 資料結構
所有文字欄位都是 I18nText 物件，長這樣：
  { "zh-Hant": "中文", "en": "English", "ja": "日本語" }
可能缺 en 或 ja，要 fallback 到 zh-Hant。

文字內的換行是 \n 字元。顯示時用 CSS white-space: pre-wrap 處理，
絕對不要把 \n 轉成 <br>。

## 命名規則
- 檔名：小寫、連字號分隔，例如 detail-modal.js
- CSS class：小寫、連字號分隔，加 gk- 前綴，例如 gk-speaker-card
- JS 變數與函式：camelCase
- slug：小寫、底線分隔，例如 andy_wang

## 輸出要求
- 只輸出一個完整檔案的完整內容
- 不要輸出說明文字、不要輸出使用範例、不要輸出 TODO 註解
- 不要自己新增規格沒寫的功能
- 規格沒寫到的細節，選最簡單的做法，不要問我
```

---

---

# §B 介面契約（跨檔案共用，先貼給模型再開工）

這段在需要用到其他模組的任務裡一起貼。**函式名與參數不可更改。**

```
## 已存在的模組與可用函式（直接 import 使用，不要重新實作）

// assets/js/core/i18n.js
export function t(i18nText)              // 取當前語言字串，缺則 fallback zh-Hant，全缺回 ''
export function getLang()                // 回傳 'zh-Hant' | 'en' | 'ja'
export function setLang(code)            // 設定語言，寫入 localStorage，觸發 'gk:langchange' 事件
export function getEnabledLangs()        // 回傳已啟用語言陣列 [{code,label}]

// assets/js/core/store.js
export async function loadData()         // 讀 data/config.json 與 data/content.json，回傳 {config, content}
export function getConfig()              // 已載入的 config
export function getContent()             // 已載入的 content
export function getSpeakerById(id)
export function getSessionById(id)
export function getSessionsBySpeakerId(id)
export function getSpeakersBySessionId(id)
export function getGroupById(id)
export function getTrackById(id)

// assets/js/ui/detail-modal.js
export function openModal(payload)       // payload 格式見任務 T08
export function closeModal()

// assets/js/core/dom.js
export function el(tag, opts, children)  // opts: {class, text, attrs, on}；children: 陣列或單一節點
export function clear(node)              // 移除所有子節點

// assets/js/ui/ballot-card.js
export function ballotCard(opts)                // 感謝票卡片，見任務 T09C

// assets/js/ui/image-viewer.js
export function openImageViewer({ src, alt })   // 開啟可縮放拖曳的圖片檢視器

// assets/js/core/analytics.js
export function track(eventName, params) // 送 GA4 事件，GA 未設定時靜默略過
```

---

---

# 本次任務

```
【任務】產生 /2026/assets/js/ui/image-viewer.js。
另外在回答最後附上要加進 assets/css/components.css 的樣式。

【可用模組】
  import { el, clear } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig } from '../core/store.js'

【要求】

export function openImageViewer({ src, alt })
export function closeImageViewer()

1. 全螢幕遮罩，中央放一張圖片，右上角關閉按鈕，底部顯示目前倍率與重置按鈕
2. DOM 只建立一次重複使用，每次開啟重設縮放與位移為初始值
3. **一律用 Pointer Events**（pointerdown / pointermove / pointerup / pointercancel），
   不要分別寫 mouse 事件與 touch 事件
4. 縮放與平移用 CSS transform 實作：
   img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
   用一個狀態物件 { scale, x, y } 管理，每次變更後統一套用
5. 操作規則：
   滾輪（wheel）：縮放。以滑鼠游標位置為錨點，
     也就是縮放後游標下的那個像素要維持在原位置
   雙指（同時有兩個 pointer）：用兩指距離的比例縮放，以兩指中點為錨點
   單指或滑鼠拖曳：平移
   雙擊或連點兩下（兩次 pointerup 間隔小於 300ms）：重置回 scale 1、位移 0
6. 限制：
   scale 範圍 1 到 6，超出要夾住
   scale 等於 1 時不可平移，位移固定為 0
   scale 大於 1 時平移要夾邊界，不可把圖片拖到完全離開畫面
7. 圖片容器的 CSS 要設 touch-action: none，否則手機會被瀏覽器捲動搶走事件
8. wheel 事件監聽要用 { passive: false } 並呼叫 preventDefault，
   否則頁面會跟著捲動
9. 關閉方式：Esc、點遮罩空白處、右上角按鈕。
   點在圖片上不可關閉
10. 開啟時 document.body 加 class 'gk-no-scroll'，關閉時移除
11. 關閉時要移除所有事件監聽（包含 window 上的），不可累積
12. 提示文字從 getConfig().ui 取：viewerResetLabel、viewerCloseLabel、viewerZoomHint

【CSS 要求】
- 遮罩深色半透明，圖片最大顯示為 90vw / 85vh
- 圖片 transform-origin 設 center center
- 拖曳中游標顯示 grabbing，可拖曳時顯示 grab
- 底部工具列半透明底、圓角、置中

【產出】先輸出 image-viewer.js，再輸出 CSS 區塊。
```

## T09B 驗收條件

桌機測試：
- [ ] 滾輪可縮放，倍率上限 6、下限 1
- [ ] 縮放後，游標下的那個像素維持在原位置（不是以圖片中心縮放）
- [ ] scale 為 1 時無法拖曳
- [ ] scale 大於 1 時可拖曳，且拖不出邊界
- [ ] 雙擊重置回 scale 1 與位移 0
- [ ] Esc 關閉、點遮罩關閉、點圖片本身不關閉

手機實機測試：
- [ ] 雙指捏合可縮放，以兩指中點為錨點
- [ ] 單指拖曳是移動圖片，不會捲動頁面
- [ ] 圖片容器的 CSS 有 `touch-action: none`

其他：
- [ ] `wheel` 監聽有 `{ passive: false }` 且呼叫 `preventDefault`，放大時頁面不捲動
- [ ] 只用 Pointer Events，全檔搜尋 `mousedown` `touchstart` 找不到
- [ ] 關閉後重新開啟五次，事件監聽沒有累積（用 DevTools 的 Event Listeners 確認）
- [ ] 開啟時 body 有 `gk-no-scroll`，關閉後移除
- [ ] 底部工具列顯示目前倍率，重置按鈕可用

---

# §E 驗收檢查清單

每個任務做完，用這張表快速檢查：

```
[ ] 檔案路徑與規格一致
[ ] 沒有出現 innerHTML
[ ] 沒有引入框架或外部函式庫（T21 / T22 除外）
[ ] export 的函式名與 §B 契約一致
[ ] 多行文字容器有 gk-multiline class
[ ] I18nText 欄位都經過 t() 處理
[ ] 缺欄位不會拋錯，只是不渲染
[ ] 可點擊元素能用鍵盤操作（tabindex + Enter/Space）
[ ] 圖片有 alt 與 loading="lazy"
[ ] 手機 375px 寬度下版面不破
[ ] 符合 Prettier 風格（單引號、分號、2 空格、120 字元）
[ ] 跑過 npm run lint 沒有 error
[ ] 程式碼裡沒有寫死的外部網址（GA 的 googletagmanager 除外），全部從 JSON 取
[ ] 除了 tokens.css 之外沒有任何檔案直接寫 hex 色碼
[ ] 沒有出現「GDG Lead」字樣
[ ] 沒有載入中文 webfont，font-weight 沒有超過 700
[ ] 圖片都有 width / height 屬性與 loading 策略
[ ] 有骨架或錯誤狀態，不會出現空白畫面
```

---

---

# §F 小模型常見翻車點（貼在提示詞最後當提醒）

```
提醒你不要犯這些錯：
1. 不要用 innerHTML 組 HTML 字串，一律 createElement + textContent
2. 不要把 \n 換成 <br>，用 CSS white-space: pre-wrap
3. 不要假設欄位一定存在，每個欄位存取前都要檢查
4. 不要自己發明函式名，照契約寫
5. 不要引入 CDN 上的函式庫
6. 不要輸出「以下是程式碼」之類的說明，直接給檔案內容
7. 不要省略程式碼寫「其餘同上」或「...」，要輸出完整內容
8. 不要用 Date 物件處理議程時間，直接切字串避免時區問題
9. 這是既有 repo，不要改動 2025 目錄、package.json 的既有內容、eslint 或 prettier 設定
10. JSON 與 JS 的語言鍵一律是 zh-Hant / en / ja，全站只有這一套代碼
11. 不要在程式碼裡寫死任何外部網址，一律從 config 或 content 取，空值時該元素不渲染
```

## T22 驗收條件

- [ ] 執行 `npm run generate:2026` 一次成功
- [ ] `share/` 下產生四個資料夾，**沒有** organizers
- [ ] 隨機開一份分享頁，head 的 og:image 是完整絕對網址
- [ ] 停用 JavaScript 後開啟分享頁，仍看得到姓名、介紹、議程文字
- [ ] 頁面內的 `window.__GK_AUTO_OPEN` 的 type 是 `speakers` / `staff` / `thanks` / `booths` 之一
- [ ] 用瀏覽器開啟分享頁，主站正常載入且對應彈窗自動開啟
- [ ] 網址列停在 `/2026/share/speakers/{id}/`，沒有跳轉
- [ ] 姓名含 `&` 或 `<` 的資料，HTML 沒有壞掉
- [ ] `sitemap.xml` 產生成功，含首頁與所有分享頁
- [ ] `robots.txt` 產生在 repo 根目錄，指向 sitemap 絕對網址
- [ ] 手動建一個 JSON 裡不存在的資料夾，執行後會被列在殘留清單
- [ ] 上一條的資料夾**沒有**被自動刪除
- [ ] 連續執行兩次，第二次大部分項目顯示 skip
- [ ] 結束時印出統計數字
- [ ] 是 ESM 語法，用 `fileURLToPath` 取代 `__dirname`

---
