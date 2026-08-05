# T12 工作人員區塊 assets/js/sections/staff.js

> 這是一個自足的施工單。**整份貼給模型即可**，不需要再貼別的文件。
> 分支：`feature/T12-staff`（從 `develop` 切出，完成後合回 `develop`）
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

# §C JSON 範例（需要碰資料的任務要一起貼）

```json
// data/config.json（節錄，實際欄位以檔案為準）
{
  "site": {
    "eventName": { "zh-Hant": "GDG Kaohsiung 2026", "en": "GDG Kaohsiung 2026" },
    "year": 2026,
    "eventDate": "2026-11-14",
    "eventStart": "2026-11-14T08:30:00+08:00",
    "baseUrl": "https://gdgkh.cc/2026/",
    "venue": { "zh-Hant": "高雄軟體園區" }
  },
  "i18n": {
    "defaultLang": "zh-Hant",
    "fallbackLang": "zh-Hant",
    "languages": [
      { "code": "zh-Hant", "label": "繁體中文", "enabled": true },
      { "code": "en", "label": "English", "enabled": false },
      { "code": "ja", "label": "日本語", "enabled": false }
    ]
  },
  "analytics": { "ga4Id": "" },
  "footer": {
    "codeOfConduct": { "url": "https://gdg.tw/code_of_conduct/" },
    "links": [
      { "platform": "facebook", "label": { "zh-Hant": "臉書社團" },
        "url": "https://www.facebook.com/groups/GDGKaohsiung" }
    ],
    "copyright": { "zh-Hant": "© 2026 GDG Kaohsiung" }
  },
  "sponsorMarquee": {
    "enabled": true,
    "speedPxPerSecond": 60,
    "direction": "left",
    "pauseOnHover": true,
    "position": "afterAbout"
  },
  "thanks": {
    "showCardShadow": false
  },
  "virtualSpace": {
    "enabled": true,
    "url": "https://leapie.leapdesign.ai/",
    "embed": false,
    "qrImage": "images/virtual-space-qr.png"
  },
  "menu": [
    { "id": "about", "enabled": true, "order": 1, "label": { "zh-Hant": "活動介紹" } },
    { "id": "speakers", "enabled": true, "order": 2, "label": { "zh-Hant": "講者介紹" } },
    { "id": "agenda", "enabled": true, "order": 3, "label": { "zh-Hant": "議程時間表" } },
    { "id": "virtual", "enabled": true, "order": 4, "label": { "zh-Hant": "虛擬會場" } },
    { "id": "staff", "enabled": true, "order": 5, "label": { "zh-Hant": "工作人員" } },
    { "id": "thanks", "enabled": true, "order": 6, "label": { "zh-Hant": "特別感謝" } },
    { "id": "booths", "enabled": true, "order": 7, "label": { "zh-Hant": "活動擺攤" } },
    { "id": "lastyear", "enabled": true, "order": 8, "type": "external",
      "placement": "home",
      "url": "https://gdgkh.cc/2025/", "label": { "zh-Hant": "去年頁面" } },
    { "id": "ticket", "enabled": true, "order": 9, "type": "cta",
      "url": "https://example.com/ticket", "label": { "zh-Hant": "點我購票" } }
  ],
  "ui": {
    "detailButton": { "zh-Hant": "看詳細" },
    "closeButton": { "zh-Hant": "關閉" },
    "sessionLabel": { "zh-Hant": "議程" },
    "tagsLabel": { "zh-Hant": "標籤" },
    "linksLabel": { "zh-Hant": "連結" },
    "roleLabel": { "zh-Hant": "志工職務" },
    "backToTop": { "zh-Hant": "回到頂端" }
  }
}
```

```json
// data/content.json（節錄）
{
  "about": {
    "columns": 2,
    "sections": [
      { "id": "intro", "span": 2,
        "title": { "zh-Hant": "關於 DevFest" },
        "body": { "zh-Hant": "第一段文字\n第二段文字" },
        "image": "images/about/intro.jpg" },
      { "id": "checkin", "span": 1,
        "title": { "zh-Hant": "報到說明" },
        "body": { "zh-Hant": "報到流程" } },
      { "id": "organizer", "span": 1,
        "title": { "zh-Hant": "主辦單位" },
        "body": { "zh-Hant": "GDG Kaohsiung" } }
    ]
  },
  "sessionGroups": [
    { "id": "android", "order": 1, "name": { "zh-Hant": "Android" }, "color": "#34a853" }
  ],
  "tracks": [
    { "id": "track_1", "order": 1, "name": { "zh-Hant": "第一會場" }, "color": "#ea4335" }
  ],
  "speakers": [
    { "id": "andy_wang", "order": 1,
      "name": { "zh-Hant": "王小明" },
      "org": { "zh-Hant": "Google Taiwan" },
      "title": { "zh-Hant": "資深工程師" },
      "bio": { "zh-Hant": "介紹第一行\n介紹第二行" },
      "sessionIds": ["gemini_android"],
      "links": [ { "platform": "github", "label": { "zh-Hant": "GitHub" }, "url": "https://github.com/x" } ] }
  ],
  "sessions": [
    { "id": "gemini_android", "groupId": "android", "trackId": "track_1",
      "title": { "zh-Hant": "議程標題" },
      "abstract": { "zh-Hant": "議程介紹\n第二行" },
      "tags": [ { "zh-Hant": "初學者" } ],
      "speakerIds": ["andy_wang"],
      "start": "2026-11-14T10:00", "end": "2026-11-14T10:40",
      "type": "talk", "links": [] }
  ],
  "staff": [
    { "id": "mei_ling", "order": 1,
      "name": { "zh-Hant": "李美玲" },
      "role": { "zh-Hant": "報到組" },
      "bio": { "zh-Hant": "自我介紹" },
      "links": [] }
  ],
  "thanksGroups": [ { "id": "gold", "order": 1, "name": { "zh-Hant": "黃金級贊助" } } ],
  "thanks": [
    { "id": "example_co", "groupId": "gold", "order": 1,
      "name": { "zh-Hant": "範例公司" },
      "description": { "zh-Hant": "簡介" }, "links": [] }
  ],
  "boothGroups": [ { "id": "community", "order": 1, "name": { "zh-Hant": "社群攤位" } } ],
  "booths": [
    { "id": "kotlin_tw", "groupId": "community", "order": 1,
      "name": { "zh-Hant": "Kotlin 台灣" },
      "description": { "zh-Hant": "簡介" }, "links": [] }
  ]
}
```

---

---

# 本次任務

```
【任務】產生 /2026/assets/js/sections/staff.js。

【要求】
export function renderStaff(container)

結構與 T10 的講者區塊幾乎相同，差異只有：
1. 資料來源是 getSortedList('staff')
2. 不分組，直接一個卡片格線
3. personCard 的參數：
     image = 由 staff.id 推導的頭像路徑
     name = staff.name
     subtitle = staff.role
     description = staff.bio
     （staff 不需要 title/org 欄位，這兩個是講者專屬）
4. openModal 的 payload 只包含：
     image, imageShape 'circle', name,
     subtitle = staff.role
     bio = staff.bio
     links = staff.links
   不要傳 sessionTitle、sessionAbstract、groupName、tags
5. 點擊時呼叫 track('select_staff', { staff_id: staff.id })

【產出】只輸出 staff.js 的完整內容。
```

## T12 驗收條件

- [ ] 不分組，直接一個卡片格線
- [ ] 卡片的 subtitle 是 `staff.role`（志工職務）
- [ ] 點擊開啟的彈窗只有：頭像、姓名、志工職務、自我介紹、連結
- [ ] 彈窗**沒有**議程標題、議程介紹、群組名、標籤這些欄位
- [ ] GA 事件 `select_staff` 有送出
- [ ] 圖片路徑由 id 推導為 `images/staff/{id}.jpg`

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
