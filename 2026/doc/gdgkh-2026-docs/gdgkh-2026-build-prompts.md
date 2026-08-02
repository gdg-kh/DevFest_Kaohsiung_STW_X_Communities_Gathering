# GDG Kaohsiung 2026 — 施工提示詞包（給快速/小模型用）

搭配文件：`gdgkh-2026-design-doc.md`（那份是給人看的規格，這份是給模型吃的指令）

## 使用方式

1. 每個任務**開一個新對話**，避免上下文污染
2. 每次都先貼「§A 共用前置」，再貼該任務的提示詞
3. 一個任務只產一個檔案，產完就驗收，過了才做下一個
4. 依 §D 的順序做，不要跳號（後面的任務依賴前面的介面）

小模型的失敗模式是「自由發揮」，所以下面每個提示詞都寫死了檔名、函式名、參數、輸出格式。**不要精簡這些提示詞**，冗長是故意的。

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
  主辦 logo   images/organizers/{id}.png（只用於首頁卡片，不產分享頁與 OG 圖）
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
  "freeTicket": {
    "enabled": true,
    "formUrl": "https://forms.gle/example",
    "closeAt": "2026-10-15T23:59:59+08:00",
    "reviewDays": 3
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
    { "id": "organizer", "enabled": true, "order": 9, "placement": "home",
      "label": { "zh-Hant": "主辦單位" } },
    { "id": "ticket", "enabled": true, "order": 10, "type": "cta",
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
    "sections": [
      { "id": "intro",
        "title": { "zh-Hant": "關於 DevFest" },
        "body": { "zh-Hant": "第一段文字\n第二段文字" },
        "image": "images/about/intro.jpg" }
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
  ],
  "organizers": [
    { "id": "gdg_kaohsiung", "order": 1,
      "name": { "zh-Hant": "GDG Kaohsiung" },
      "description": { "zh-Hant": "簡介" }, "links": [] }
  ]
}
```

---

# §D 任務順序

```
基礎層   T01 → T02 → T03 → T04 → T05 → T06
元件層   T07 → T08 → T09 → T09B → T09C → T09D
區塊層   T10 → T11 → T12 → T13 → T13B → T14 → T14B → T14C → T14D → T14E
外殼層   T15 → T16 → T17 → T17B
後台     T18 → T19 → T20
腳本     T21 → T22
```

---

# T01 假資料 config.json

```
【任務】產生 /2026/data/config.json 的完整假資料檔。

【輸入】§C 的 config.json 範例。

【要求】
1. 完全照範例的欄位結構，不可新增或刪除欄位
2. menu 十個項目全部保留，enabled 全設 true
   lastyear 與 organizer 兩筆要有 "placement": "home"，其餘不寫這個欄位
   （沒寫就等於 "nav"，另一個可能值是 "footer"）
3. i18n.languages 三種語言都列出，zh-Hant 的 enabled 為 true，en 和 ja 為 false
4. 所有 I18nText 只填 zh-Hant-Hant，不要填 en 和 ja
5. analytics.ga4Id 留空字串
6. ui 區塊補齊這些 key，每個都要有 zh-Hant：
   detailButton, closeButton, sessionLabel, sessionAbstractLabel, groupLabel,
   tagsLabel, linksLabel, roleLabel, backToTop, langLabel, ticketCta,
   speakerNumberPrefix, allTracksLabel, emptyStateText, eventStartedText,
   countdownDays, countdownHours, countdownMinutes, countdownSeconds,
   mapZoomHint, viewerResetLabel, viewerCloseLabel, viewerZoomHint,
   virtualEnterButton, virtualQrHint, virtualMapCrossLink, navMoreLabel,
   lastYearCardText, organizerCardTitle, freeTicketLink, freeTicketFormButton,
   freeTicketEligibilityLabel, freeTicketProcessLabel, freeTicketCardButton,
   directTicketCardButton, freeTicketReviewNote, sponsorMarqueeTitle, ballotHeaderText,
   cocLinkText, addToCalendarLabel, downloadIcsLabel, googleCalendarLabel,
   addAllSessionsLabel, loadErrorText, retryButtonLabel, notFoundText, backHomeLabel
7. 輸出必須是合法 JSON，不可有註解、不可有尾逗號

【產出】只輸出 config.json 的完整內容。
```

## T01 驗收條件

- [ ] `JSON.parse` 讀得過，沒有註解也沒有尾逗號
- [ ] `menu` 剛好十筆，每筆都有 `id` `enabled` `order` `label`
- [ ] `menu` 的 `order` 是 1 到 10 不重複
- [ ] `lastyear` 與 `organizer` 的 `placement` 是 `"home"`，其餘九筆沒有 `placement` 欄位
- [ ] `i18n.languages` 三筆，只有 `zh-Hant` 的 `enabled` 是 `true`
- [ ] `site.eventStart` 是 `2026-11-14T08:30:00+08:00`
- [ ] `analytics.ga4Id` 是空字串
- [ ] `ui` 區塊包含規格列出的每一個 key，一個都不缺
- [ ] 全檔搜尋 `"en"` 與 `"ja"` 找不到任何一個（只填 zh-Hant）
- [ ] `freeTicket`、`virtualSpace`、`sponsorMarquee`、`footer` 四個物件都存在

---

# T02 假資料 content.json

```
【任務】產生 /2026/data/content.json 的完整假資料檔。

【輸入】§C 的 content.json 範例。

【要求】
1. 完全照範例結構
2. 資料量：
   - about.sections 3 筆
   - sessionGroups 4 筆（Android / Web / AI / Cloud），
     color 只能用 GDG 四色 #ea4335 #4285f4 #f9ab00 #34a853，各給一色
   - tracks 1 筆（track_1，名稱「第一會場」）
   - speakers 8 筆
   - sessions 10 筆
   - staff 6 筆
   - thanksGroups 3 筆
   - thanks 7 筆，其中 2 筆的 marquee 設為 false、1 筆省略該欄位、其餘為 true
   - boothGroups 2 筆、booths 5 筆
   - organizers 2 筆（不需要分享頁，但一樣要有 id）
   - registration 一筆（orderNotice、directTitle、directSummary）
   - freeTicket 一筆（title、summary、eligibility 三則、process 四則、notes、closedText）
   - virtualSpace 一筆（title、description、notes 兩則）
   - venueMaps 2 筆（一樓平面圖、二樓平面圖），欄位是 file 與 caption
3. 關聯必須雙向一致：speaker.sessionIds 裡的 id 一定要在 sessions 存在，
   session.speakerIds 裡的 id 一定要在 speakers 存在
4. 其中要有 1 場議程有 2 位講者（測試多講者情況）
5. sessions 要包含這些 type：opening 1 場、talk 7 場、break 1 場、lunch 1 場
   type 為 break / lunch / opening 的場次 speakerIds 設為空陣列
6. 時間從 2026-11-14T09:00 排到 17:00，不可重疊，格式一律 YYYY-MM-DDTHH:mm
7. **每筆只有一個 id**，格式是小寫底線的英文（例如 andy_wang、gemini_android），
   同類型內不重複。不要另外產生 slug 欄位，id 本身就是網址。
   不要在 JSON 裡寫圖片路徑，圖片路徑由程式用 id 推導
8. 有 3 筆的 bio 或 description 要含 \n 換行（測試換行顯示）
9. links 的 platform 用這些值：website, x, threads, facebook, instagram,
   linkedin, github, youtube, medium, email
10. 所有 I18nText 只填 zh-Hant
11. 不要有 avatar / image / logo / ogImage 這些欄位

【產出】只輸出 content.json 的完整內容。合法 JSON，無註解無尾逗號。
```

## T02 驗收條件

- [ ] `JSON.parse` 讀得過
- [ ] 各陣列筆數：about.sections 3、sessionGroups 4、tracks 1、speakers 8、sessions 10、staff 6、thanksGroups 3、thanks 7、boothGroups 2、booths 5、organizers 2、venueMaps 2
- [ ] 每個 `id` 都是小寫英文加底線，同類型內不重複
- [ ] 全檔搜尋 `avatar` `image` `logo` `ogImage` 都找不到（圖片路徑由 id 推導）
- [ ] 全檔搜尋 `slug` 找不到（只有 id）
- [ ] 每個 `speaker.sessionIds` 裡的值都能在 `sessions` 找到對應 id
- [ ] 每個 `session.speakerIds` 裡的值都能在 `speakers` 找到對應 id
- [ ] 上面兩項是雙向的：A 的 sessionIds 有 B，B 的 speakerIds 就必須有 A
- [ ] 剛好有一場議程的 `speakerIds` 長度是 2
- [ ] `sessions` 的 type 分布：opening 1、talk 7、break 1、lunch 1
- [ ] type 為 break / lunch / opening 的場次 `speakerIds` 是空陣列
- [ ] 所有 `start` 與 `end` 符合 `YYYY-MM-DDTHH:mm`，日期都是 2026-11-14
- [ ] 依 start 排序後，沒有任何兩場時間重疊
- [ ] 至少 3 筆的 bio 或 description 含有 `\n`
- [ ] `sessionGroups` 的 color 只用 `#ea4335` `#4285f4` `#f9ab00` `#34a853`
- [ ] `thanks` 中有 2 筆 `marquee` 為 false、1 筆沒有該欄位
- [ ] `links[].platform` 只用規格列出的那幾個值

---

# T03 設計 token assets/css/tokens.css

```
【任務】產生 /2026/assets/css/tokens.css。

【風格】台灣選舉看板風，但版面現代乾淨。梗在元素與文案，不在排版混亂。

【重要】這是 Google Developer Groups 的官方社群活動網站，
配色與字體必須完全遵守 GDG 品牌規範：
hex 值要精確、不可用近似色、不可自創顏色、不可用替代字體。

【要求】只定義 :root 的 CSS Variables 與 @font-face，不寫任何選擇器樣式。

必須包含這些變數：

顏色（**這些是 GDG 官方色票的精確 hex，一個字元都不可以改，也不可以自己加新顏色**）
  --gk-red: #ea4335        GDG Red 500，主色、CTA、票頭、印章
  --gk-blue: #4285f4       GDG Blue 500，次要色、群組標籤
  --gk-yellow: #f9ab00     GDG Yellow 600，強調、號次底色
  --gk-green: #34a853      GDG Green 500，時間軸、成功狀態
  --gk-ink: #1e1e1e        GDG Black 02，文字與票匭底（注意不是純黑）
  --gk-paper: #f0f0f0      GDG OFF White，背景與票身（注意不是純白）
  --gk-line: #d0d0d0       分隔線（由 OFF White 加深，不是新色相）

  衍生色（只能用官方 Halftone 與 Pastel，不可自己調）
  --gk-blue-halftone: #57caff
  --gk-green-halftone: #5cdb6d
  --gk-yellow-halftone: #ffd427
  --gk-red-halftone: #ff7daf     注意這是粉紅不是紅
  --gk-blue-pastel: #c3ecf6
  --gk-green-pastel: #ccf6c5
  --gk-yellow-pastel: #ffe7a5
  --gk-red-pastel: #f8d8d8

字體（**只載一支顯示字體，內文與中文一律用系統字體，不載中文 webfont**）
  --gk-font-body: system-ui, -apple-system, 'Segoe UI', Roboto,
                  'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif
  --gk-font-display: 'Google Sans', 'Google Sans Flex',
                     'Noto Sans TC', system-ui, sans-serif
  --gk-font-mono: 'Google Sans Mono', ui-monospace, SFMono-Regular,
                  'SF Mono', Consolas, monospace

  顯示字體只用在標題、票頭、號次徽章、購票按鈕，其餘一律用 --gk-font-body
  不可以用 Arial、Helvetica、Open Sans、Archivo、Anton 當品牌字

字重（中文很重要）
  --gk-fw-normal: 400
  --gk-fw-medium: 500
  --gk-fw-bold: 700
  **上限就是 700，不要定義也不要使用 800 或 900**。
  微軟正黑沒有 Black 字重，瀏覽器會做假粗體，中文大字級下會糊掉。
  標題的份量改用色塊、粗外框、硬邊陰影達成，不靠字重。

字級（用 clamp 做流體字級，手機到桌機平順縮放）
  --gk-fs-hero, --gk-fs-h1, --gk-fs-h2, --gk-fs-h3,
  --gk-fs-body, --gk-fs-small, --gk-fs-tiny

間距（4 的倍數）
  --gk-sp-1 到 --gk-sp-8

圓角
  --gk-radius-sm: 4px
  --gk-radius-md: 8px
  --gk-radius-lg: 16px
  --gk-radius-full: 999px

陰影
  --gk-shadow-card, --gk-shadow-modal
  風格是硬邊印刷風偏移陰影（例如 4px 4px 0 顏色），不要柔和模糊陰影

其他
  --gk-maxw: 1200px
  --gk-nav-h: 64px
  --gk-transition: 180ms ease

字體載入：**只用一個 @import**，引入 Google Fonts 的
Google Sans（或 Google Sans Flex）的 500 與 700 兩個字重，加上 &display=swap。
不要引入 Noto Sans TC、Noto Sans JP 或任何中文日文 webfont，
中文與日文一律使用使用者裝置的系統字體。

【產出】只輸出 tokens.css 的完整內容。
```

## T03 驗收條件

- [ ] 檔案只有 `:root { ... }` 與 `@import`，沒有任何其他選擇器
- [ ] 六個主色的 hex 完全正確：`#ea4335` `#4285f4` `#f9ab00` `#34a853` `#1e1e1e` `#f0f0f0`
- [ ] 沒有出現 `#fbbc04`、`#000`、`#000000`、`#fff`、`#ffffff`
- [ ] 八個 Halftone 與 Pastel 變數都有定義且 hex 正確
- [ ] `--gk-font-body` 開頭是 `system-ui`，且不含 `Google Sans`
- [ ] `--gk-font-display` 含 `Google Sans`，且不含 Arial / Helvetica / Open Sans / Archivo / Anton
- [ ] 字重變數只到 700，全檔搜尋 `800` 與 `900` 找不到
- [ ] 七個字級變數都用 `clamp()`
- [ ] `--gk-sp-1` 到 `--gk-sp-8` 都存在且是 4 的倍數
- [ ] 陰影變數是硬邊偏移（形如 `4px 4px 0`），沒有第三個模糊參數以外的柔化
- [ ] `@import` 只有一行，只載顯示字體的 500 與 700，且帶 `display=swap`
- [ ] `@import` 沒有引入 Noto Sans TC / Noto Sans JP 或任何中日文字型

---

# T04 基礎樣式 assets/css/base.css

```
【任務】產生 /2026/assets/css/base.css。假設 tokens.css 已經載入，直接使用其中的變數。

【要求】
1. CSS reset：box-sizing border-box、margin/padding 歸零、img 為 block 且 max-width 100%
2. body 用 --gk-paper 背景、--gk-ink 文字、--gk-font-body
3. 定義工具 class：
   .gk-container   最大寬 var(--gk-maxw)、水平置中、左右 padding
   .gk-multiline   white-space: pre-wrap; word-break: break-word; line-height: 1.7
   .gk-sr-only     螢幕閱讀器專用隱藏
   .gk-hide        display: none
4. 標題 h1 h2 h3 用 --gk-font-display，font-weight 最高 700，**不可用 800 或 900**
   標題的視覺份量改用色塊反白、2 到 3px 粗外框、硬邊偏移陰影達成
   中文標題可加 letter-spacing: -0.02em 收緊字距製造密實感
5. a 預設不加底線，hover 才加
6. 焦點樣式：:focus-visible 給 3px 實線 --gk-blue 外框（無障礙用，不可移除）
7. 加 @media (prefers-reduced-motion: reduce) 區塊，把所有動畫與轉場時間設為 0.01ms
8. 捲動用 scroll-behavior: smooth，但在 reduced-motion 下改成 auto
9. 選取文字的 ::selection 用 --gk-yellow 底色

【禁止】不要寫任何元件樣式（卡片、按鈕、Modal 都不要）。

【產出】只輸出 base.css 的完整內容。
```

## T04 驗收條件

- [ ] 全檔沒有直接寫 hex 色碼，顏色一律用 `var(--gk-*)`
- [ ] `.gk-multiline` 同時有 `white-space: pre-wrap` 與 `word-break: break-word`
- [ ] `.gk-container` `.gk-sr-only` `.gk-hide` 都存在
- [ ] `h1` `h2` `h3` 的 `font-weight` 不超過 700
- [ ] 有 `:focus-visible` 樣式且不是 `outline: none`
- [ ] 有 `@media (prefers-reduced-motion: reduce)` 區塊，內含動畫時間歸零與 `scroll-behavior: auto`
- [ ] 沒有任何卡片、按鈕、彈窗的元件樣式
- [ ] 手動測試：在 375px 寬度下 `.gk-container` 沒有橫向捲軸

---

# T05 多語言模組 assets/js/core/i18n.js

```
【任務】產生 /2026/assets/js/core/i18n.js。

【要求】實作並 export 這五個函式，名稱與參數不可更改：

export function initI18n(configI18n)
  參數是 config.json 的 i18n 物件。
  決定當前語言的優先序：
    1. 網址參數 ?lang=xx，且該語言在 languages 中且 enabled 為 true
    2. localStorage 的 'gk_lang'，同樣要檢查 enabled
    3. navigator.language 開頭比對（zh 開頭對到 zh，ja 對到 ja，其餘對到 en），同樣檢查 enabled
    4. configI18n.defaultLang
  把結果存入模組變數，並設定 document.documentElement.lang

export function t(i18nText)
  參數是 I18nText 物件。
  回傳當前語言的字串；沒有就回 fallbackLang 的字串；再沒有就回空字串。
  參數是 null、undefined 或不是物件時，回空字串（不可拋錯）。
  參數本身是字串時，直接回傳該字串。

export function getLang()
  回傳當前語言代碼字串。

export function setLang(code)
  切換語言。寫入 localStorage 的 'gk_lang'，更新 document.documentElement.lang，
  然後 dispatch 一個 window 事件：new CustomEvent('gk:langchange', { detail: { lang: code } })
  不要重新整理頁面。

export function getEnabledLangs()
  回傳 enabled 為 true 的語言陣列，每筆是 { code, label }。

【禁止】不要碰 DOM 渲染，不要 import 其他模組。

【產出】只輸出 i18n.js 的完整內容。
```

## T05 驗收條件

實際在瀏覽器 console 逐條試：

- [ ] `t({'zh-Hant':'中文','en':'x'})` 在語言為 `ja` 時回傳「中文」
- [ ] `t(null)`、`t(undefined)`、`t(123)` 都回傳空字串且不拋錯
- [ ] `t('純字串')` 回傳「純字串」
- [ ] `t({})` 回傳空字串
- [ ] `getEnabledLangs()` 只回傳 `enabled` 為 true 的語言
- [ ] 網址帶 `?lang=ja` 但 ja 的 enabled 為 false 時，語言不會變成 ja
- [ ] `setLang('en')` 之後 `localStorage.getItem('gk_lang')` 是 `'en'`
- [ ] `setLang('en')` 之後 `document.documentElement.lang` 是 `'en'`
- [ ] `setLang()` 會觸發 `gk:langchange` 事件，且 `event.detail.lang` 正確
- [ ] `setLang()` 不會重新整理頁面
- [ ] 這個檔案沒有 import 任何其他模組

---

# T06 資料模組 assets/js/core/store.js

```
【任務】產生 /2026/assets/js/core/store.js。

【要求】實作並 export 這些函式，名稱與參數不可更改：

export async function loadData()
  用 fetch 讀取 'data/config.json' 與 'data/content.json'，兩支並行（Promise.all）。
  網址要加版本參數避免快取：'data/config.json?v=' + Date.now()
  讀完後建立內部索引（Map）：speakers by id、sessions by id、groups by id、tracks by id。
  存入模組變數，回傳 { config, content }。
  任一支 fetch 失敗時 throw 一個 Error，訊息寫明是哪個檔案失敗。

export function getConfig()
export function getContent()
  回傳已載入的資料。尚未載入時回傳 null。

export function getSpeakerById(id)
export function getSessionById(id)
export function getGroupById(id)
export function getTrackById(id)
  用索引查，查不到回傳 null（不要拋錯）。

export function getSessionsBySpeakerId(speakerId)
  回傳該講者的議程陣列，依 start 時間排序。查不到回空陣列。

export function getSpeakersBySessionId(sessionId)
  回傳該議程的講者陣列，依 speakerIds 的順序。查不到回空陣列。

export function getSortedList(arrayName)
  取 content[arrayName]，依 order 由小到大排序後回傳新陣列。
  該欄位不存在時回空陣列。

export function assetPath(type, id)
  依類型回傳圖片路徑。type 為 'speakers' 或 'staff' 時回傳 .jpg，
  'thanks' / 'booths' / 'organizers' 回傳 .png。
  格式：'images/' + type + '/' + id + 副檔名

export function ogPath(type, id)
  回傳 'images/og/' + type + '/' + id + '.png'

export function getGroupedList(arrayName, groupArrayName)
  例如 getGroupedList('thanks', 'thanksGroups')。
  回傳 [{ group, items }] 陣列，group 依 order 排序，items 也依 order 排序。
  沒有對應群組的項目，歸到最後一個 { group: null, items: [...] }；
  若沒有這種項目就不要產生這一筆。

【禁止】不要碰 DOM，不要 import i18n。

【產出】只輸出 store.js 的完整內容。
```

## T06 驗收條件

- [ ] `loadData()` 的兩個 fetch 是並行的（用 `Promise.all`，不是兩個 await 串起來）
- [ ] fetch 的網址帶有版本參數避免快取
- [ ] 把 `data/config.json` 改名後執行，`loadData()` 拋出的 Error 訊息有指出是哪個檔案
- [ ] `getSpeakerById('不存在')` 回傳 `null` 而不是拋錯
- [ ] `getSessionsBySpeakerId()` 的結果依 `start` 由早到晚排序
- [ ] `getSpeakersBySessionId()` 的順序與 `speakerIds` 陣列順序一致
- [ ] `getSortedList('不存在的欄位')` 回傳空陣列
- [ ] `getGroupedList('thanks','thanksGroups')` 的 group 依 order 排序，items 也依 order 排序
- [ ] 把某筆 thanks 的 groupId 改成不存在的值，該筆會出現在最後一組 `{group: null}`
- [ ] 上一條的情況若不存在，就不會產生 `{group: null}` 這一筆
- [ ] `assetPath('speakers','andy_wang')` 回傳 `images/speakers/andy_wang.jpg`
- [ ] `assetPath('thanks','example_co')` 回傳 `images/thanks/example_co.png`
- [ ] `ogPath('staff','mei_ling')` 回傳 `images/og/staff/mei_ling.png`
- [ ] 這個檔案沒有操作 DOM，也沒有 import i18n

---

# T07 DOM 工具 assets/js/core/dom.js

```
【任務】產生 /2026/assets/js/core/dom.js。

【要求】

export function el(tag, opts = {}, children = [])
  建立並回傳一個元素。
  opts 支援這些 key（都是選填）：
    class  字串或字串陣列，設定 className
    text   字串，用 textContent 設定（不是 innerHTML）
    attrs  物件，逐一 setAttribute
    on     物件，key 是事件名、value 是 handler，逐一 addEventListener
    html   不支援，若傳入要直接忽略
  children 可以是單一 Node、字串、或它們的陣列（含巢狀陣列要攤平）。
  字串 child 用 document.createTextNode 加入。
  null 與 undefined 的 child 要略過。

export function clear(node)
  移除 node 的所有子節點。

export function mount(parent, ...children)
  把 children 依序 append 到 parent，回傳 parent。

【禁止】絕對不可使用 innerHTML。

【產出】只輸出 dom.js 的完整內容。
```

## T07 驗收條件

- [ ] 全檔搜尋 `innerHTML` 找不到
- [ ] `el('div', {text: '<b>x</b>'})` 產生的節點 `textContent` 是 `<b>x</b>`，不是粗體
- [ ] `el('div', {html: '<b>x</b>'})` 會忽略 html，不會插入 HTML
- [ ] `el('div', {class: ['a','b']})` 的 className 是 `a b`
- [ ] `el('div', {}, ['文字', null, undefined, el('span')])` 只產生兩個子節點
- [ ] 巢狀陣列 `[[a,b],[c]]` 會被攤平
- [ ] `el('button', {on: {click: fn}})` 點擊會觸發 fn
- [ ] `clear(node)` 之後 `node.childNodes.length` 是 0
- [ ] `mount(parent, a, b)` 回傳 parent

---

# T08 詳細彈窗 assets/js/ui/detail-modal.js + CSS

```
【任務】產生 /2026/assets/js/ui/detail-modal.js。
另外在回答最後附上要加進 assets/css/components.css 的 Modal 樣式。

【可用模組】
  import { el, clear, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig } from '../core/store.js'

【payload 格式】呼叫端會傳這個物件，欄位都可能不存在：
{
  image: 'images/speakers/andy_wang.jpg', // 由 id 推導，可能沒有
  imageShape: 'circle' | 'square',        // 預設 circle
  number: 3,                              // 號次，可能沒有
  name: I18nText,                         // 一定有
  subtitle: I18nText,                     // 志工職務或群組名，可能沒有
  bio: I18nText,                          // 可能沒有
  sessionTitle: I18nText,                 // 可能沒有
  sessionAbstract: I18nText,              // 可能沒有
  groupName: I18nText,                    // 可能沒有
  groupColor: '#34A853',                  // 可能沒有
  tags: [I18nText],                       // 可能是空陣列
  meta: [{ label: I18nText, value: I18nText }],  // 時間、地點等，可能是空陣列
  links: [{ platform, label: I18nText, url }],   // 可能是空陣列
  extraNode: null,                               // 可能沒有，一個已建好的 DOM 節點
  footerAction: {                                // 可能沒有
    text: I18nText,
    url: 'https://...',                          // 有 url 就渲染成外連按鈕
    disabled: false,                             // true 時渲染成停用按鈕
    onClick: null                                // 沒有 url 但有這個時渲染成一般按鈕
  }
}

【要求】
1. export function openModal(payload) 與 export function closeModal()
2. Modal 的 DOM 只建立一次，之後重複使用；每次開啟先 clear 內容再重建
3. 結構：遮罩 .gk-modal-overlay > 卡片 .gk-modal（role="dialog" aria-modal="true"）
4. 所有多行文字（bio、sessionAbstract）的容器要加 class 'gk-multiline'
5. 欄位不存在就整塊不要渲染，不要留空標題
6. 區塊標題文字從 getConfig().ui 取，例如議程區用 ui.sessionLabel、
   標籤區用 ui.tagsLabel、連結區用 ui.linksLabel，都要經過 t() 處理
7. links 用 <a> 且 target="_blank" rel="noopener noreferrer"
8. extraNode 存在時，把它附加在連結區之後、footerAction 之前
9. footerAction 存在時，在彈窗最底部渲染一顆按鈕：
   有 url 就用 <a target="_blank" rel="noopener noreferrer">，
   disabled 為 true 就渲染成停用狀態、不可點擊，
   沒有 url 但有 onClick 就用 <button>。沒有 footerAction 就不渲染
10. 關閉方式三種都要做：右上角關閉按鈕、點遮罩、按 Esc
11. 開啟時 document.body 加 class 'gk-no-scroll' 鎖背景捲動，關閉時移除
12. 開啟時把焦點移到關閉按鈕；關閉時把焦點還給開啟前的元素（先存起來）
13. 焦點鎖定：Tab 與 Shift+Tab 在 Modal 內循環，不可跑到背景

【CSS 要求】
- 桌機（min-width: 1280px）：卡片置中，最大寬 640px，最大高 80vh，內容可捲動
- 手機：從底部滑上來的 bottom sheet，圓角只在上方，最大高 90vh
- 遮罩半透明黑
- 卡片用 --gk-shadow-modal 與硬邊風格

【產出】先輸出 detail-modal.js 完整內容，再輸出 CSS 區塊。
```

## T08 驗收條件

- [ ] 連續開關彈窗五次，`document.querySelectorAll('.gk-modal').length` 始終是 1
- [ ] payload 只給 `name` 一個欄位時，不會出現空的區塊標題
- [ ] `bio` 與 `sessionAbstract` 的容器有 `gk-multiline` class，含 `\n` 的文字會正確換行
- [ ] `tags` 為空陣列時，標籤區整塊不渲染
- [ ] `links` 的 `<a>` 都有 `target="_blank"` 與 `rel="noopener noreferrer"`
- [ ] `extraNode` 有值時會出現在連結區之後
- [ ] `footerAction` 有 url 時渲染成 `<a target="_blank">`
- [ ] `footerAction.disabled` 為 true 時按鈕不可點擊，也沒有 href
- [ ] 沒有 `footerAction` 時彈窗底部沒有多餘空白區塊
- [ ] 按 Esc 會關閉
- [ ] 點遮罩會關閉，點卡片內部不會關閉
- [ ] 開啟時 `document.body` 有 `gk-no-scroll`，關閉後移除
- [ ] 開啟時焦點在關閉按鈕上
- [ ] 一直按 Tab，焦點只在彈窗內循環，不會跑到背景的導覽列
- [ ] 按 Shift+Tab 反向循環一樣不會逃逸
- [ ] 關閉後焦點回到開啟前點擊的那張卡片
- [ ] 手機 375px 寬度下是從底部滑上來的 bottom sheet
- [ ] 內容超長時卡片內部可捲動，背景不動

---

# T09 共用卡片 assets/js/ui/card.js + CSS

```
【任務】產生 /2026/assets/js/ui/card.js，提供三種卡片的建立函式。
另外附上要加進 assets/css/components.css 的卡片樣式。

【可用模組】el / clear / mount 來自 ../core/dom.js，t 來自 ../core/i18n.js

【要求】export 三個函式：

export function personCard({ image, number, name, subtitle, description, onClick })
  用於講者與工作人員。
  結構：正方形圖片容器（CSS 讓圖片變圓形、object-fit: cover、object-position: center）、
        左上角號次徽章（number 沒有就不渲染）、姓名、subtitle、description 摘要。
  description 摘要要截斷：CSS 用 -webkit-line-clamp: 3。
  整張卡片可點擊，也要能用鍵盤操作：tabindex="0"、role="button"、
  Enter 與 Space 都要觸發 onClick。

export function logoCard({ image, name, description, onClick })
  用於特別感謝、擺攤、主辦單位。
  圖片用 object-fit: contain（logo 不可裁切），置中，固定高度區塊。
  其餘同上，一樣要可鍵盤操作。

export function sessionCard({ title, time, groupName, groupColor, speakers, onClick })
  用於時間軸。speakers 是 [{ image, name }] 陣列。
  結構：時間、群組色標籤、議程標題、下方一排講者小頭像加姓名。
  講者為空陣列時不渲染那一排。
  一樣要可鍵盤操作。

【CSS 要求】
- 卡片格線由呼叫端負責，卡片本身不設定 margin
- 講者圖片容器 aspect-ratio: 1 / 1
- hover 時卡片位移 2px 並加深偏移陰影，配合 --gk-transition
- 卡片邊框 2px 實線 --gk-ink，硬邊印刷風

【產出】先輸出 card.js，再輸出 CSS 區塊。
```

## T09 驗收條件

- [ ] `personCard` 的圖片容器 `aspect-ratio` 是 `1 / 1`
- [ ] 傳入非正方形圖片時，圖片置中裁切而不是變形（`object-fit: cover`）
- [ ] `logoCard` 的圖片是 `object-fit: contain`，logo 不被裁切
- [ ] `number` 不傳時，號次徽章整個不渲染
- [ ] `description` 超過三行時被截斷（`-webkit-line-clamp: 3`）
- [ ] 三種卡片都有 `tabindex="0"` 與 `role="button"`
- [ ] 用鍵盤 Tab 到卡片後按 Enter 會觸發 onClick
- [ ] 按 Space 也會觸發，且不會捲動頁面
- [ ] `sessionCard` 的 speakers 為空陣列時，講者那一排不渲染
- [ ] 卡片本身沒有設定 margin（間距由呼叫端的格線負責）
- [ ] hover 時卡片位移且陰影加深

---

# T09C 感謝票卡片 assets/js/ui/ballot-card.js

```
【任務】產生 /2026/assets/js/ui/ballot-card.js。
另外在回答最後附上要加進 assets/css/components.css 的樣式。

【背景】贊助商、個人贊助、合作夥伴在網站上呈現成一張「選票」，
概念是「有他們這一票，活動才成立」。
這個元件會用在兩個地方：首頁跑馬燈、特別感謝區塊的格線，兩處外觀完全相同。

【可用模組】
  import { el, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig } from '../core/store.js'

【要求】

export function ballotCard({ image, name, groupName, onClick, decorative })
  回傳一個卡片元素。參數都可能不存在。
  decorative 為 true 時（跑馬燈的重複副本用），
  設 aria-hidden="true" 與 tabindex="-1"，且不綁定 onClick。

卡片由上而下四層：

1. 票頭：紅色橫帶（--gk-red），白字。
   左側印 config.site.eventName 與固定文字 config.ui.ballotHeaderText，
   右側小字印 groupName（沒有就不渲染右側）
2. 票身：米白紙面。中央 img，object-fit: contain、置中，
   桌機高度 56px、手機 40px。下方一行是 name 文字
3. 圈選欄：右下角一個 28x28 的細框方格，
   內含一枚紅色中空圓圈（用 CSS border-radius 與 border 做，不要用文字符號），
   transform: rotate(4deg)，opacity 0.85，模擬蓋章的不完美
4. 卡片左右緣用 repeating-linear-gradient 做出虛線齒孔（像撕下來的票根），
   上下緣保持直邊

樣式細節：
- 卡片固定寬度（桌機 200px、手機 150px），高度自適應但同一列要等高
- 紙面用 var(--gk-paper)，不要純白
- 卡片外框 2px 實線 var(--gk-ink)，陰影用硬邊偏移 4px 4px 0
- hover 時 transform: translateY(-3px)，陰影加深，圈選章顏色加深
- onClick 存在且 decorative 不為 true 時：
  tabindex="0"、role="button"，Enter 與 Space 都要觸發

【禁止】不要對 logo 做灰階、旋轉或變形處理（贊助商 logo 有品牌規範）。

【產出】先輸出 ballot-card.js，再輸出 CSS 區塊。
```

## T09C 驗收條件

- [ ] 票頭是紅色底白字，右側顯示 groupName
- [ ] `groupName` 不傳時，票頭右側不渲染，版面不歪
- [ ] logo 是 `object-fit: contain`，桌機高 56px、手機高 40px
- [ ] 所有票的尺寸相同，沒有任何依群組變大變小的邏輯
- [ ] 圈選欄的紅圈是用 CSS border 做的，不是文字符號 ○ 或 ◯
- [ ] 圈選欄有輕微旋轉（rotate 約 4deg）
- [ ] 左右緣有虛線齒孔，上下緣是直邊
- [ ] `decorative: true` 時，元素有 `aria-hidden="true"` 與 `tabindex="-1"`，且點擊沒有反應
- [ ] `decorative: false` 且有 onClick 時，Tab 可聚焦，Enter 與 Space 都能觸發
- [ ] 紙面用 `var(--gk-paper)`，不是純白
- [ ] 全檔沒有對 logo 做 `filter: grayscale`、`rotate` 或 `skew`
- [ ] 同一列的卡片等高

---

# T09B 圖片放大檢視器 assets/js/ui/image-viewer.js

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

# T09D 加入行事曆 assets/js/ui/calendar.js

```
【任務】產生 /2026/assets/js/ui/calendar.js。

【可用模組】
  import { el } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getContent, getSpeakersBySessionId, getTrackById } from '../core/store.js'
  import { track } from '../core/analytics.js'

【背景】活動時間都在台北時區。JSON 的時間格式是 '2026-11-14T10:00'（沒有時區資訊），
一律視為 UTC+8。

【要求】

export function buildIcs(sessions)
  參數是議程陣列，回傳一個 .ics 檔的完整字串。
  規則：
  - 開頭 BEGIN:VCALENDAR、VERSION:2.0、PRODID、CALSCALE:GREGORIAN，結尾 END:VCALENDAR
  - 每筆議程一個 VEVENT
  - 時間轉成 UTC 格式：把 '2026-11-14T10:00' 減八小時後寫成 '20261114T020000Z'
    直接用字串切割與數字運算處理，不要用 Date 物件避免裝置時區干擾
  - UID 用 `${session.id}@gdgkh.cc`
  - DTSTAMP 用產生當下的 UTC 時間
  - SUMMARY 用議程標題
  - DESCRIPTION 放講者姓名（多位用頓號串接）與議程介紹
  - LOCATION 用會場名稱加上 config.site.venue
  - **換行一律用 CRLF（\r\n），不是 \n**
  - 單行超過 75 個位元組要折行：換行後在行首加一個空格
  - 文字中的逗號、分號、反斜線要跳脫（前面加反斜線），換行符號寫成 \\n
  - 整份用 UTF-8

export function downloadIcs(sessions, filename)
  用 buildIcs 產生字串，包成 Blob（type: 'text/calendar;charset=utf-8'），
  用 URL.createObjectURL 加一個暫時的 <a> 觸發下載，用完 revokeObjectURL。

export function googleCalendarUrl(session)
  組出並回傳 https://calendar.google.com/calendar/render?action=TEMPLATE
  的網址，帶 text、dates（格式 20261114T020000Z/20261114T024000Z）、
  details、location 參數，全部經過 encodeURIComponent。

export function calendarButtons(session, entry)
  回傳一個含兩顆按鈕的元素：
  「下載 .ics」按鈕，點擊呼叫 downloadIcs([session], `${session.id}.ics`)
  「加入 Google 日曆」<a>，href 用 googleCalendarUrl，
  target="_blank" rel="noopener noreferrer"
  兩者點擊都要 track('add_to_calendar', { session_id: session.id, type, entry })
  按鈕文字從 config.ui 取：downloadIcsLabel、googleCalendarLabel

export function allSessionsButton()
  回傳一顆按鈕，點擊時把所有 type 不是 break 與 lunch 的議程
  一次匯出成 gdgkh-2026.ics。文字用 config.ui.addAllSessionsLabel。

【產出】只輸出 calendar.js 的完整內容，附上需要的 CSS 區塊。
```

## T09D 驗收條件

`.ics` 檔實測：
- [ ] 下載後用純文字編輯器開啟，換行是 CRLF（`\r\n`）
- [ ] 超過 75 位元組的行有折行，且續行開頭是一個空格
- [ ] `DTSTART` 是 `20261114T020000Z`（10:00 台北時間減八小時）
- [ ] `UID` 格式是 `{id}@gdgkh.cc`
- [ ] 有 `BEGIN:VCALENDAR` / `VERSION:2.0` / `PRODID` / `END:VCALENDAR`
- [ ] 中文的 SUMMARY 與 DESCRIPTION 顯示正常沒有亂碼
- [ ] 描述中的換行寫成 `\n`（兩個字元），逗號與分號有跳脫
- [ ] **實際匯入 Google 日曆與 Apple 行事曆各一次，時間顯示為 10:00**

Google 日曆連結：
- [ ] 點擊後開新分頁，標題、時間、地點都正確帶入
- [ ] 網址的參數都經過 `encodeURIComponent`

其他：
- [ ] 全檔沒有使用 `new Date()` 去解析議程時間字串（避免裝置時區干擾）
- [ ] `allSessionsButton()` 匯出的檔案不含 break 與 lunch 場次
- [ ] 下載後 `URL.revokeObjectURL` 有被呼叫

---

# T10 講者區塊 assets/js/sections/speakers.js

```
【任務】產生 /2026/assets/js/sections/speakers.js。

【可用模組】
  import { el, clear, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getContent, getConfig, getSortedList, getSessionById, getGroupById } from '../core/store.js'
  import { personCard } from '../ui/card.js'
  import { openModal } from '../ui/detail-modal.js'
  import { track } from '../core/analytics.js'

【要求】
export function renderSpeakers(container)
  1. 先 clear(container)
  2. 取 getSortedList('speakers')，依「議程群組」分組：
     講者的群組 = 它第一個 sessionId 對應議程的 groupId
     沒有議程的講者歸到最後一組，標題用 config.ui 沒有的話就不顯示標題
  3. 群組順序依 sessionGroups 的 order
  4. 每組輸出：群組標題（左側有該群組 color 的色條）+ 卡片格線
  5. 卡片格線用 CSS Grid，桌機 4 欄、平板 3 欄、手機 2 欄（斷點 1280 / 768），用 auto-fill minmax 實作
  6. 每張卡片用 personCard，傳入：
       image = 由 speaker.id 推導的頭像路徑
       number = 該講者在全部講者中的 order
       name = speaker.name
       subtitle = 第一場議程的 title（沒有議程就不傳）
       description = speaker.bio
  7. 點擊卡片時：
       呼叫 track('select_speaker', { speaker_id: speaker.id })
       組出 payload 呼叫 openModal，payload 內容：
         image, imageShape 'circle', number, name,
         bio = speaker.bio
         sessionTitle = 第一場議程 title
         sessionAbstract = 第一場議程 abstract
         groupName = 群組 name、groupColor = 群組 color
         tags = 第一場議程的 tags
         links = speaker.links
       講者有多場議程時，sessionTitle 與 sessionAbstract 取第一場即可
  8. 沒有任何講者時，顯示 config.ui.emptyStateText 的文字

【產出】只輸出 speakers.js 的完整內容。附上需要的 CSS 區塊。
```

## T10 驗收條件

- [ ] 講者依第一場議程的 groupId 分組，群組順序依 sessionGroups 的 order
- [ ] 沒有議程的講者出現在最後一組
- [ ] 群組標題左側有該群組 color 的色條
- [ ] 桌機 4 欄、平板 3 欄、手機 2 欄
- [ ] 卡片的 subtitle 是第一場議程標題；沒有議程時不傳 subtitle 且版面不歪
- [ ] 點擊卡片開啟的彈窗含：頭像、姓名、bio、議程標題、議程介紹、群組名、標籤、連結
- [ ] 多場議程的講者，彈窗顯示第一場
- [ ] 把 content.speakers 清空後，顯示 `ui.emptyStateText` 而不是空白
- [ ] GA 事件 `select_speaker` 有送出且帶正確的 speaker_id
- [ ] 圖片路徑是由 id 推導，不是從 JSON 讀

---

# T11 場地地圖與議程時間軸 assets/js/sections/agenda.js

```
【任務】產生 /2026/assets/js/sections/agenda.js。

【可用模組】同 T10，另外用 sessionCard、getTrackById、getSpeakersBySessionId，
以及 import { openImageViewer } from '../ui/image-viewer.js'

【要求】
export function renderAgenda(container)

版面順序是：先場地地圖區塊，再議程時間軸。

## 第一部分：場地地圖

1. 資料來自 getContent().venueMaps，格式：
   [ { file: 'venue-map-1f.png', caption: { 'zh-Hant': '一樓平面圖' } } ]
   圖片完整路徑是 'images/' + file
2. 陣列不存在或為空時，整個地圖區塊不渲染，直接進時間軸
3. 只有一張時直接顯示；兩張以上時上方加一排分頁按鈕，
   按鈕文字用 caption，點擊切換顯示的圖片，當前那顆要有 active 樣式
4. 圖片下方顯示 caption 文字，上方顯示 config.ui.mapZoomHint 的提示文字
5. 圖片桌機最大寬 720px 等比縮放、手機滿版，加 loading="lazy" 與 alt（用 caption）
6. 點擊圖片時呼叫 openImageViewer({ src, alt })，
   並呼叫 track('view_venue_map', { map_file: file })
7. 圖片本身要可鍵盤操作：tabindex="0"、role="button"、Enter 與 Space 觸發
8. 地圖區塊最後面加一個到虛擬會場的次要連結：
   import { createVirtualSpaceLink } from './virtual-space.js'
   呼叫 createVirtualSpaceLink('venue_map')，回傳 null 時就不渲染

## 第二部分：議程時間軸

0. 時間軸標題列右側放「加入整天議程」按鈕：
   import { allSessionsButton } from '../ui/calendar.js'
1. 取 content.sessions，依 start 時間由早到晚排序
2. 取 content.tracks，依 order 排序。軌道數量決定版面：
   - tracks 長度為 1：單欄垂直時間軸，不顯示會場名稱
   - tracks 長度 2 到 3：桌機用 CSS Grid 分欄並排，每軌一欄，欄寬平均
   - tracks 長度 4 以上：桌機用可橫向捲動的容器，每欄最小寬 280px
   - 手機（max-width: 1279px）一律改成會場 tab 切換，一次顯示一軌
3. 左側是時間刻度欄，顯示每個時段的開始時間（HH:mm）
4. session.trackId 為 'all'，或 type 是 break / lunch / opening / closing 時，
   該筆要橫跨所有欄位（grid-column: 1 / -1），樣式用淡色底、不可點擊
5. 一般議程用 sessionCard 渲染，speakers 從 getSpeakersBySessionId 取，
   只帶頭像路徑（由 id 推導）與 name
6. 點擊議程卡：
   呼叫 track('select_session', { session_id: session.id })
   openModal 的 payload：
     image 用第一位講者的頭像路徑（沒講者就不傳）
     name = session.title
     subtitle = 講者姓名（多位用頓號「、」串接）
     sessionTitle = session.title
     sessionAbstract = session.abstract
     bio = 第一位講者的 bio
     groupName / groupColor 從 groupId 取
     tags = session.tags
     meta = [{ label 時間, value 'HH:mm - HH:mm' }, { label 會場, value track.name }]
     links = session.links
     footerAction 不使用；改為在 payload 加一個 extraNode 欄位，
     值是 calendarButtons(session, 'modal') 回傳的元素
     （detail-modal 要支援 extraNode：有值時附加在連結區之後）
7. 時間格式化寫一個內部函式 formatTime(isoString) 回傳 'HH:mm'，
   直接用字串切割，不要用 Date 物件（避免時區問題）

【產出】只輸出 agenda.js 的完整內容，附上需要的 CSS 區塊。
```

## T11 驗收條件

場地地圖：
- [ ] `venueMaps` 為空陣列時，地圖區塊整塊不渲染，直接顯示時間軸
- [ ] 只有一張時不出現分頁按鈕
- [ ] 兩張以上時出現分頁按鈕，當前那顆有 active 樣式
- [ ] 點擊圖片開啟 image-viewer
- [ ] Tab 可聚焦圖片，Enter 與 Space 都能開啟
- [ ] 地圖區塊最後有到虛擬會場的連結；把 `virtualSpace.enabled` 設 false 後該連結消失

時間軸：
- [ ] `tracks` 只有一筆時是單欄，不顯示會場名稱
- [ ] 手動把 tracks 加到 2 筆，桌機自動變成兩欄並排
- [ ] 加到 4 筆時，桌機容器可橫向捲動
- [ ] 視窗縮到 1279px 以下時，改成會場 tab 切換
- [ ] type 為 break / lunch / opening / closing 的項目橫跨所有欄位且不可點擊
- [ ] 時間顯示為 `HH:mm`，且全檔沒有用 `new Date()` 解析議程時間
- [ ] 點擊議程卡的彈窗含：講者頭像、議程標題、議程介紹、講者 bio、群組、標籤、時間、會場
- [ ] 多講者的場次，subtitle 用頓號串接所有講者
- [ ] 彈窗內有加入行事曆的按鈕
- [ ] 時間軸頂端有「加入整天議程」按鈕

---

# T12 工作人員區塊 assets/js/sections/staff.js

```
【任務】產生 /2026/assets/js/sections/staff.js。

【要求】
export function renderStaff(container)

結構與 T10 的講者區塊幾乎相同，差異只有：
1. 資料來源是 getSortedList('staff')
2. 不分組，直接一個卡片格線
3. personCard 的參數：
     image = 由 staff.id 推導的頭像路徑
     number 不傳
     name = staff.name
     subtitle = staff.role
     description = staff.bio
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
- [ ] 卡片沒有號次徽章
- [ ] GA 事件 `select_staff` 有送出
- [ ] 圖片路徑由 id 推導為 `images/staff/{id}.jpg`

---

# T13 感謝／擺攤／主辦區塊 assets/js/sections/logo-grid.js

```
【任務】產生 /2026/assets/js/sections/logo-grid.js，一個檔案處理三個區塊。

【要求】export 三個函式，內部共用同一個私有函式：

export function renderThanks(container)
  用 getGroupedList('thanks', 'thanksGroups')
  **這一區用 ballotCard 而不是 logoCard**（import 自 '../ui/ballot-card.js'），
  排成格線就是「計票板」的效果：桌機四欄、平板三欄、手機兩欄。
  群組標題做成投票所的分區牌樣式，群組之間用一條細虛線分隔。
  ballotCard 的 groupName 傳該群組的 name。

export function renderBooths(container)
  用 getGroupedList('booths', 'boothGroups')
  這一區維持用 logoCard（攤位是參與者不是投票者，視覺要跟感謝票區分）

export function renderOrganizers(container)
  用 getSortedList('organizers')，不分組。
  這個函式由首頁卡片區塊（T14B）呼叫，不是獨立的選單區塊。

私有函式 renderLogoSection(container, groups)
  groups 是 [{ group, items }]。
  每組輸出群組標題（group 為 null 時不輸出標題）+ 卡片格線。
  格線桌機 4 欄、手機 2 欄。
  每張卡用 logoCard：
    image = 由 item.id 與類型推導的 logo 路徑
    name = item.name
    description = item.description
  點擊後 openModal，payload：
    image, imageShape 'square', name,
    subtitle = 群組名稱（沒有就不傳）
    bio = item.description
    links = item.links

【產出】只輸出 logo-grid.js 的完整內容。
```

## T13 驗收條件

- [ ] `renderThanks` 用的是 `ballotCard`，不是 `logoCard`
- [ ] `renderBooths` 用的是 `logoCard`，兩區視覺明顯不同
- [ ] 感謝區依群組分區，群組標題是分區牌樣式，群組間有細虛線
- [ ] 感謝區桌機 4 欄、平板 3 欄、手機 2 欄
- [ ] `renderOrganizers` 不分組
- [ ] 群組為 null 時不輸出標題
- [ ] 三者的彈窗 payload 都是 `imageShape: 'square'`
- [ ] 三個函式共用同一個私有函式，沒有三段重複程式碼
- [ ] organizers 的圖片路徑是 `images/organizers/{id}.png`

---

# T13B 虛擬會場區塊 assets/js/sections/virtual-space.js

```
【任務】產生 /2026/assets/js/sections/virtual-space.js。

【背景】這是一個 Gather Town 類型的線上虛擬空間，
從網站上線就開放，使用者可以先進去逛場地。不需要任何時間判斷或倒數。

【可用模組】
  import { el, clear, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getContent } from '../core/store.js'
  import { track } from '../core/analytics.js'

【要求】
export function renderVirtualSpace(container)

1. 讀 getConfig().virtualSpace，格式：
   { enabled: true, url: '...', embed: false, qrImage: 'images/virtual-space-qr.png' }
   enabled 為 false 或整個物件不存在時，container 不渲染任何東西，直接 return
2. 讀 getContent().virtualSpace，格式：
   { title: I18nText, description: I18nText, notes: [I18nText] }
3. 版面由上而下：
   標題（title）
   說明文字（description，容器加 class 'gk-multiline'）
   主要進入按鈕（文字用 config.ui.virtualEnterButton）
   注意事項清單（notes，用 ul li，沒有或空陣列就不渲染整塊）
   QR code 圖片（qrImage 有值才渲染，下方放 config.ui.virtualQrHint 的提示文字，
   圖片顯示寬度 180px，加 alt）
4. 進入按鈕是 <a>，屬性 href = url、target="_blank"、rel="noopener noreferrer"
   點擊時呼叫 track('enter_virtual_space', { entry: 'section' })
5. embed 為 true 時，在主要按鈕下方額外渲染一個 iframe：
   src = url，width 100%、aspect-ratio 16 / 9、border 0
   allow="camera; microphone; fullscreen; display-capture"
   title 屬性用 title 文字
   embed 為 false 時完全不建立 iframe（不是隱藏，是不建立）

另外 export 一個函式給議程區塊用：
export function createVirtualSpaceLink(entryName)
  回傳一個 <a> 元素，文字用 config.ui.virtualMapCrossLink，
  href、target、rel 同上，點擊時 track('enter_virtual_space', { entry: entryName })。
  virtualSpace.enabled 為 false 時回傳 null。

【產出】只輸出 virtual-space.js 的完整內容，附上需要的 CSS 區塊。
```

## T13B 驗收條件

- [ ] `virtualSpace.enabled` 設 false 後，區塊完全不渲染
- [ ] `virtualSpace.url` 設空字串後，區塊也不渲染
- [ ] 進入按鈕是 `<a>`，有 `target="_blank"` 與 `rel="noopener noreferrer"`
- [ ] `notes` 為空陣列時，注意事項整塊不渲染
- [ ] `qrImage` 為空時，QR 區塊不渲染
- [ ] `embed` 為 false 時，DOM 裡**沒有** iframe 元素（不是隱藏）
- [ ] `embed` 改成 true 後出現 iframe，且有 `allow="camera; microphone; fullscreen; display-capture"`
- [ ] `createVirtualSpaceLink('venue_map')` 在 enabled 為 false 時回傳 null
- [ ] GA 事件 `enter_virtual_space` 帶有正確的 entry 值

---

# T14 活動介紹區塊 assets/js/sections/about.js

```
【任務】產生 /2026/assets/js/sections/about.js。

【要求】
export function renderAbout(container)
1. 取 getContent().about.sections
2. 每個 section 輸出：標題（h3）、圖片（有 image 才輸出，alt 用標題文字，
   加 loading="lazy"）、內文（容器加 class 'gk-multiline'）
3. 圖文交錯排版：桌機第一筆圖在右、第二筆圖在左，依序交替；手機一律圖在上文在下
4. about.sections 為空或不存在時，container 不渲染任何東西也不報錯

【產出】只輸出 about.js 的完整內容，附上需要的 CSS 區塊。
```

## T14 驗收條件

- [ ] 桌機圖文交錯：第一筆圖在右、第二筆圖在左、第三筆圖在右
- [ ] 手機一律圖在上文在下
- [ ] 內文容器有 `gk-multiline`，含 `\n` 的文字正確換行
- [ ] 沒有 `image` 的 section 不渲染圖片，版面不留空洞
- [ ] 圖片有 `alt`（用標題文字）與 `loading="lazy"`
- [ ] 把 `about.sections` 設成空陣列，不報錯也不渲染

---

# T14B 首頁快速入口卡片 assets/js/sections/home-cards.js

```
【任務】產生 /2026/assets/js/sections/home-cards.js。

【背景】「去年頁面」與「主辦單位」不放在導覽列，
改成活動介紹區塊最下方的一排卡片。

【可用模組】
  import { el, clear, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getSortedList } from '../core/store.js'
  import { logoCard } from '../ui/card.js'
  import { openModal } from '../ui/detail-modal.js'
  import { track } from '../core/analytics.js'

【要求】
export function renderHomeCards(container)

1. 先 clear(container)
2. 區塊標題用 config.ui.organizerCardTitle
3. 卡片格線：桌機四欄、平板三欄、手機兩欄
4. 依 config.menu 中 placement 為 'home' 的項目決定要渲染哪些卡片，
   依 order 排序。項目 enabled 為 false 就跳過
5. id 為 'organizer' 的項目：
   對 getSortedList('organizers') 每一筆產一張 logoCard
   image 由 id 推導（images/organizers/{id}.png）
   點擊時 track('select_organizer', { organizer_id: item.id }) 並 openModal，
   payload：image、imageShape 'square'、name、bio 用 description、links
6. id 為 'lastyear' 的項目：
   產一張外連卡片（不是 logoCard，另外做一個樣式）
   顯示 config.ui.lastYearCardText 的文字與該項目的 label
   點擊直接開新分頁（<a target="_blank" rel="noopener noreferrer">），
   並 track('click_last_year')
7. 卡片區最後加一張免費票申請卡：
   import { isFreeTicketAvailable, openFreeTicketModal } from '../ui/free-ticket.js'
   isFreeTicketAvailable() 為 true 時才渲染，
   卡片文字用 content.freeTicket 的 title 與 summary，
   點擊呼叫 openFreeTicketModal('home_card')
8. 完全沒有卡片可渲染時，container 不渲染任何東西

【產出】只輸出 home-cards.js 的完整內容，附上需要的 CSS 區塊。
```

## T14B 驗收條件

- [ ] 只渲染 `placement` 為 `home` 的選單項目
- [ ] 把 organizer 的 `enabled` 設 false 後，主辦卡片消失
- [ ] 主辦卡片點擊開彈窗，不是外連
- [ ] 去年頁面卡片是 `<a target="_blank">`，點擊開新分頁
- [ ] 去年頁面的 url 為空字串時，該卡片不渲染
- [ ] 免費票卡片在 `freeTicket.enabled` 為 false 時不渲染
- [ ] 全部都不渲染時，container 是空的且沒有標題殘留
- [ ] 桌機 4 欄、平板 3 欄、手機 2 欄

---

# T14C 免費票申請入口 assets/js/ui/free-ticket.js

```
【任務】產生 /2026/assets/js/ui/free-ticket.js。

【背景】主辦方用 Google 表單受理免費票申請，人工審核後寄送優惠碼。
網站只負責說明資格與導向表單，**不處理也不顯示任何優惠碼**。
點擊入口時不直接跳轉到表單，而是先開一個說明彈窗，
使用者讀完資格條件再決定是否前往。

【可用模組】
  import { el, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getContent } from '../core/store.js'
  import { openModal } from './detail-modal.js'
  import { track } from '../core/analytics.js'

【要求】

export function isFreeTicketAvailable()
  回傳布林值。getConfig().freeTicket 不存在、enabled 為 false、
  或 formUrl 為空字串時回傳 false。

export function isFreeTicketClosed()
  回傳布林值。config.freeTicket.closeAt 有值且已經過了那個時間點時回 true。
  closeAt 為空字串或不存在時回 false。
  比較時間用 new Date(closeAt).getTime() < Date.now()
  （這裡可以用 Date，因為 closeAt 是含時區的完整 ISO 字串）

export function openFreeTicketModal(entry)
  1. isFreeTicketAvailable() 為 false 時直接 return
  2. 呼叫 track('open_free_ticket', { entry })
  3. 取 getContent().freeTicket，組出 payload 呼叫 openModal：
     name = title
     bio = summary
     meta 依序放兩組：
       { label: ui.freeTicketEligibilityLabel, value: eligibility 陣列每則換行串接 }
       { label: ui.freeTicketProcessLabel, value: process 陣列每則加上序號後換行串接 }
     process 有四個步驟，要完整顯示，讓使用者知道不是填完表單就有票
     再把 notes 放進 sessionAbstract 欄位（會用 gk-multiline 顯示）
     彈窗最上方要先顯示 content.registration.orderNotice 的提醒文字
     （這是使用者前往表單前最後一次來得及的提醒）
  4. 彈窗底部要有一顆按鈕：
     未截止時：<a> 連到 formUrl，target="_blank" rel="noopener noreferrer"，
       文字用 ui.freeTicketFormButton，
       點擊時 track('click_free_ticket_form', { entry })
     已截止時：改成停用狀態的按鈕，文字用 content.freeTicket.closedText，
       不可點擊、不可連出
  5. 這顆按鈕要透過 openModal 的 payload 傳入，
     不要直接操作 detail-modal 的 DOM

export function createFreeTicketLink(entry)
  回傳一個可點擊元素，文字用 config.ui.freeTicketLink，
  點擊時呼叫 openFreeTicketModal(entry)。
  isFreeTicketAvailable() 為 false 時回傳 null。
  要能用鍵盤操作（tabindex、role、Enter 與 Space）。

【給 T08 的補充】
detail-modal 的 payload 要多支援一個選填欄位：
  footerAction: { text: I18nText, url?: string, disabled?: boolean, onClick?: Function }
url 有值時渲染成 <a target="_blank" rel="noopener noreferrer">，
disabled 為 true 時渲染成停用按鈕，
兩者都沒有但有 onClick 時渲染成一般按鈕。
沒有這個欄位時彈窗底部不渲染任何東西。

【產出】只輸出 free-ticket.js 的完整內容，附上需要的 CSS 區塊。
```

## T14C 驗收條件

- [ ] `formUrl` 為空字串時，`isFreeTicketAvailable()` 回傳 false
- [ ] `enabled` 為 false 時同樣回傳 false
- [ ] `closeAt` 設成過去的時間，`isFreeTicketClosed()` 回傳 true
- [ ] `closeAt` 為空字串時回傳 false
- [ ] 彈窗最上方顯示 `registration.orderNotice`
- [ ] 彈窗列出全部四個 process 步驟，不是只有前兩個
- [ ] 未截止時，底部按鈕是 `<a target="_blank">` 連到 formUrl
- [ ] 已截止時，底部是停用按鈕，顯示 `closedText`，且**沒有** href
- [ ] `createFreeTicketLink()` 在不可用時回傳 null
- [ ] 該連結可用鍵盤操作
- [ ] GA 兩個事件都有送：`open_free_ticket` 與 `click_free_ticket_form`，且 entry 值正確
- [ ] 全檔沒有出現任何優惠碼字串

---

# T14D 報名區塊 assets/js/sections/registration.js

```
【任務】產生 /2026/assets/js/sections/registration.js。

【背景】活動有兩種報名路徑：
  A. 符合資格者先填 Google 表單，主辦人工審核後寄優惠碼或免費報名連結，
     對方再自己去報名頁面完成報名
  B. 沒有任何資格的人直接去報名頁面買票
網站要同時服務這兩種人，而且要讓 A 類使用者在按下購票之前就看到免費票資訊，
避免買完才發現可以免費。

【可用模組】
  import { el, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getContent } from '../core/store.js'
  import { isFreeTicketAvailable, isFreeTicketClosed, openFreeTicketModal } from '../ui/free-ticket.js'
  import { track } from '../core/analytics.js'

【要求】
export function renderRegistration(container)

1. 最上方一行提醒文字，取 content.registration.orderNotice，
   樣式要明顯（有底色或左側色條），不是不起眼的小字
2. 下方兩張卡並排。桌機用 CSS Grid 兩欄等寬，手機改成上下排（上：免費票，下：直接報名）
3. 左卡（免費票申請）：
   isFreeTicketAvailable() 為 false 時整張卡不渲染
   標題用 content.freeTicket.title
   摘要用 content.freeTicket.summary
   下方列出 content.freeTicket.eligibility 的前三則（超過三則就顯示前三則）
   審核提醒文字用 config.ui.freeTicketReviewNote，
     裡面的天數用 config.freeTicket.reviewDays 取代字串中的 {days}
   按鈕文字用 config.ui.freeTicketCardButton，
     點擊呼叫 openFreeTicketModal('registration_card')
   isFreeTicketClosed() 為 true 時：整張卡收合成一行，
     只顯示 content.freeTicket.closedText，沒有按鈕
4. 右卡（直接報名）：
   標題用 content.registration.directTitle
   摘要用 content.registration.directSummary
   按鈕文字用 config.ui.directTicketCardButton，
     是 <a>，href 取 config.menu 中 id 為 ticket 那筆的 url，
     target="_blank" rel="noopener noreferrer"，
     點擊時 track('click_ticket', { entry: 'registration_card' })
   該 url 為空字串時，按鈕改成停用狀態
5. 左卡不渲染或已截止時，右卡要自動撐滿整個寬度（用 grid-column: 1 / -1）
6. 兩張卡下方放一行行為準則連結：
   文字用 config.ui.cocLinkText，href 用 config.footer.codeOfConduct.url，
   target="_blank" rel="noopener noreferrer"，
   點擊時 track('click_coc', { entry: 'registration' })
7. 兩張卡的視覺權重要相當，不要把其中一張做得比較大或比較搶眼

【產出】只輸出 registration.js 的完整內容，附上需要的 CSS 區塊。
```

## T14D 驗收條件

- [ ] 順序提醒文字有底色或色條，不是不起眼的小字
- [ ] 桌機兩張卡等寬並排，手機上下排且免費票在上
- [ ] 兩張卡視覺權重相當，沒有一張明顯較大或較搶眼
- [ ] 左卡列出 eligibility 的前三則
- [ ] 審核提醒文字中的 `{days}` 被 `reviewDays` 的值取代
- [ ] `isFreeTicketClosed()` 為 true 時，左卡收合成一行且右卡撐滿寬度
- [ ] `freeTicket.enabled` 為 false 時，左卡不渲染且右卡撐滿寬度
- [ ] 右卡按鈕是 `<a target="_blank">`，連到 menu 中 ticket 的 url
- [ ] ticket 的 url 為空字串時，右卡按鈕是停用狀態
- [ ] 兩張卡下方有行為準則連結，連到 `https://gdg.tw/code_of_conduct/`
- [ ] GA `click_ticket` 帶 `entry: 'registration_card'`

---

# T14E 贊助商跑馬燈 assets/js/sections/sponsor-marquee.js

```
【任務】產生 /2026/assets/js/sections/sponsor-marquee.js。

【背景】首頁一條橫向無限循環的贊助商 logo 帶。
資料直接讀 content.thanks，不另外建一份清單。

【可用模組】
  import { el, clear, mount } from '../core/dom.js'
  import { t } from '../core/i18n.js'
  import { getConfig, getContent, getSortedList } from '../core/store.js'
  import { openModal } from '../ui/detail-modal.js'
  import { track } from '../core/analytics.js'

【要求】
export function renderSponsorMarquee(container)

1. 讀 getConfig().sponsorMarquee：
   { enabled, speedPxPerSecond, direction, pauseOnHover, position }
   enabled 為 false 或物件不存在時，container 不渲染任何東西並 return
2. 資料來源是 getSortedList('thanks')。
   只保留 marquee 為 true 的項目；**該欄位不存在時視為 true**。
   過濾後沒有項目時不渲染
3. 區塊標題用 config.ui.sponsorMarqueeTitle
4. DOM 結構：
   外層 .gk-marquee（overflow: hidden）
   內層 .gk-marquee-track（display: flex，套用動畫）
   track 內是重複多份的項目清單
5. **重複次數要動態計算，不可寫死兩份**：
   先渲染一份，量測它的 offsetWidth，
   重複到「總寬度 >= 容器寬度的兩倍」為止，至少兩份。
   贊助商很少時（例如三個）只放兩份會出現空白，這是必須避免的
6. 第一份以外的所有副本都要加 aria-hidden="true"
7. **動畫用純 CSS，不要用 JavaScript 逐幀計算位置**：
   @keyframes 從 translateX(0) 到 translateX(-50%)
   注意：因為 track 內容是重複的，-50% 剛好接回起點，看起來連續
   animation-duration 不是固定值，要用「總寬度 ÷ 速度」算出來：
     桌機速度 = config.speedPxPerSecond
     手機（視窗寬度 < 768）速度 = config.speedPxPerSecond * 0.75
     duration 秒數 = track 總寬度的一半 ÷ 速度
   算出來的值透過 style 設成 CSS 變數傳入，不要在 JS 裡直接設 animation 屬性字串
   這樣贊助商從 5 家增加到 20 家時，移動速度不變，只是循環週期變長
   animation-timing-function: linear
   animation-iteration-count: infinite
   direction 為 'right' 時，用 animation-direction: reverse
8. pauseOnHover 為 true 時，容器 hover 與 focus-within 都要
   animation-play-state: paused
9. 每個項目用 ballotCard 渲染（import { ballotCard } from '../ui/ballot-card.js'）：
   image 由 id 推導（images/thanks/{id}.png）
   name 用該筆的 name，groupName 用該筆 groupId 對應群組的 name
   第一份副本：decorative 為 false，onClick 開彈窗
     （image、imageShape 'square'、name、bio 用 description、links）
     並 track('select_sponsor', { sponsor_id: item.id, entry: 'marquee' })
   第二份之後的副本：decorative 為 true
10. **無障礙**：CSS 要加
    @media (prefers-reduced-motion: reduce) 區塊，
    在其中把 animation 設為 none，並改成 overflow-x: auto 讓使用者手動捲動。
    跑馬燈對前庭障礙使用者是常見的不適來源，這段不可省略
11. 視窗大小改變時重新計算重複份數與 duration，用 ResizeObserver，
    並用 requestAnimationFrame 節流
12. 票與票之間留固定間距（桌機 24px、手機 16px），
    不需要額外的分隔符號，票的邊界就是分隔

【CSS 要求：票匭底】
- 跑馬燈外層背景做成深色票匭質感：
  深墨色（var(--gk-ink)）底，疊一層很淡的細直紋
  （repeating-linear-gradient，線寬 1px、間距 6px、透明度 0.06），
  讓米白色的票在上面浮出來
- 容器上下各一條 4px 的紅色實線收邊
- 容器左右兩端各一段淡出：
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)
- 區塊標題放在容器左上角，紅色雙線方框、transform: rotate(-2deg)，像蓋歪的印章
- 不要加閃爍、霓虹、旋轉或跳動效果

【產出】只輸出 sponsor-marquee.js 的完整內容，附上需要的 CSS 區塊。
```

## T14E 驗收條件

- [ ] `sponsorMarquee.enabled` 為 false 時整塊不渲染
- [ ] 只顯示 `marquee` 為 true 的項目；沒有該欄位的項目**會**顯示
- [ ] 把 thanks 減到只剩 3 筆，跑馬燈中間沒有空白也沒有跳接
- [ ] 把 thanks 加到 20 筆，移動速度與 3 筆時相同（只是週期變長）
- [ ] 動畫是 CSS `@keyframes`，全檔沒有 `requestAnimationFrame` 逐幀更新位置
- [ ] `animation-timing-function` 是 `linear`
- [ ] 第一份以外的副本都有 `aria-hidden="true"`
- [ ] Tab 鍵只會走過第一份副本的票，不會重複走三遍
- [ ] 滑鼠移入時暫停，移出後從暫停處繼續（不是跳回起點）
- [ ] 鍵盤 focus 進入時也暫停
- [ ] 開啟系統的「減少動態」後，動畫停止且可手動橫向捲動
- [ ] 容器左右兩端有淡出效果，不是硬邊切斷
- [ ] 縮放視窗後重新計算，仍然沒有空白
- [ ] `direction: 'right'` 時方向相反

---

# T15 導覽與路由 assets/js/ui/nav.js

```
【任務】產生 /2026/assets/js/ui/nav.js。

【重要背景】選單有十個項目，中文最短、日文與英文標籤更長。
導覽列**必須永遠保持單行**，不可換行也不可被裁切。
下面第 6 點的溢出機制是達成這件事的關鍵，不可簡化或省略。

【要求】

export function renderNav(container)
1. 從 getConfig().menu 取項目，過濾 enabled 為 true，依 order 排序
2. 只渲染 placement 為 'nav' 或沒有 placement 欄位的項目
   （placement 為 'home' 或 'footer' 的不進導覽列）
3. type 為 'external' 的項目輸出 <a target="_blank" rel="noopener noreferrer">
4. type 為 'cta' 的項目（購票）：
   輸出成 <a> 而不是 <button>，屬性 href = item.url、
   target="_blank"、rel="noopener noreferrer"（外部售票平台，開新視窗）
   樣式是最醒目的實心按鈕，用主色 --gk-red
   點擊時呼叫 track('click_ticket', { entry: 'nav' })
   這顆永遠固定在導覽列最右邊，**不可被移進溢出選單**
   item.url 為空字串時整顆不渲染
5. 其餘項目輸出按鈕，點擊時呼叫 navigateTo(item.id)
6. 語言切換器：從 getEnabledLangs() 產生。只有一種語言時整個不渲染。
   顯示短代碼即可（中 / EN / 日），不要顯示完整語言名稱。
   切換時呼叫 setLang() 並 track('change_language', { lang })

export function renderFooter(container)
  頁尾分四塊，由上而下：
  1. 社群連結：config.footer.links，用 <a target="_blank" rel="noopener noreferrer">
  2. 次要選單：placement 為 'footer' 或 'home' 的項目，純文字連結列
  3. 行為準則：config.footer.codeOfConduct.url，
     文字用 config.ui.cocLinkText，開新分頁，
     這是參加活動的前提，樣式不要做得比其他連結小
  4. 版權：config.footer.copyright
  任何一塊的資料不存在時，該塊不渲染。

export function initNavOverflow()
  這是保證單行的機制，做法如下：
  1. 導覽列項目容器外再包一層 wrapper，wrapper 設 overflow: hidden、white-space: nowrap
  2. 建立一個「更多」按鈕與它的下拉清單，初始隱藏。
     按鈕文字用 config.ui.navMoreLabel
  3. 用 ResizeObserver 監看 wrapper 寬度變化，變化時重新計算：
     先把所有項目移回主列（下拉清單清空）
     用 offsetWidth 逐項累加寬度
     可用寬度 = wrapper 寬度 - 購票按鈕寬度 - 語言切換器寬度 - 「更多」按鈕寬度 - 16px 緩衝
     累加超過可用寬度的項目，依序移進下拉清單
  4. 下拉清單為空時，「更多」按鈕要隱藏
  5. 重算要用 requestAnimationFrame 節流，避免 ResizeObserver 連續觸發時抖動
  6. 語言切換後標籤長度會變，'gk:langchange' 事件也要觸發重算
  7. 下拉清單點外面要關閉，Esc 也要關閉

export function navigateTo(sectionId)
  桌機（視窗寬度 >= 1280）：
    隱藏所有 section，只顯示指定的那個（用 class 切換，不要動 style 屬性）
    更新網址 hash 為 '#/' + sectionId，用 history.pushState
    送 GA：track('page_view', { page_path: '/2026/#/' + sectionId })
    捲動回頁面頂端
  手機（視窗寬度 < 1280）：
    所有 section 都顯示，改用 element.scrollIntoView({ behavior: 'smooth' }) 捲到該區塊
    網址 hash 同樣更新

export function initNav()
  1. 監聽 window 的 popstate，依 hash 呼叫對應顯示邏輯
  2. 用 matchMedia('(min-width: 1280px)') 監聽桌機與手機模式切換，
     不要用 resize 事件輪詢
  3. 頁面載入時讀取現有 hash 決定初始顯示，沒有 hash 就顯示第一個項目
  4. 手機模式時，導覽列改成可橫向捲動的 chip 列（overflow-x: auto），
     這個模式下不啟用溢出選單機制
  5. 手機模式捲動時高亮當前區塊，用 IntersectionObserver 判斷，
     不要用 scroll 事件計算位置

【CSS 要求】
- 導覽列項目文字用 clamp(0.875rem, 0.8vw + 0.5rem, 1rem)，最小不低於 14px
- 項目左右 padding 也用 clamp 流體縮放
- 主列 white-space: nowrap，不可 flex-wrap
- 「更多」下拉清單絕對定位在按鈕下方，寬度自適應
- 手機 chip 列隱藏捲軸但保留可捲動（scrollbar-width: none 與 ::-webkit-scrollbar）

【產出】只輸出 nav.js 的完整內容，附上需要的 CSS 區塊。
```

## T15 驗收條件

導覽列單行（最重要）：
- [ ] 視窗寬 1280px、語言中文，導覽列單行不換行
- [ ] 切換到英文與日文，仍然單行不換行也不裁切
- [ ] 把某個選單標籤改成很長的字串，超出的項目自動進「更多」下拉
- [ ] 下拉清單為空時，「更多」按鈕隱藏
- [ ] 購票按鈕永遠在最右邊，任何寬度下都不會進「更多」
- [ ] 慢慢縮放視窗，項目進出下拉的過程不抖動
- [ ] 切換語言後會重新計算（監聽 `gk:langchange`）

其他：
- [ ] 只渲染 `placement` 為 `nav` 或沒有該欄位的項目
- [ ] 購票按鈕是 `<a target="_blank" rel="noopener noreferrer">`
- [ ] ticket 的 url 為空時，按鈕不渲染
- [ ] 語言只有一種時，語言切換器整個不渲染
- [ ] 1280px 以上：點選單只顯示一個 section，網址 hash 更新
- [ ] 1280px 以下：所有 section 都顯示，點選單平滑捲動
- [ ] 用 `matchMedia` 監聽斷點，全檔沒有 `window.addEventListener('resize')` 輪詢
- [ ] 手機 chip 列可橫向捲動且捲軸隱藏
- [ ] 手機捲動時當前區塊高亮，且是用 `IntersectionObserver`
- [ ] 瀏覽器上一頁／下一頁能正確切換區塊
- [ ] 頁尾四塊都渲染，行為準則連結存在且不比其他連結小

---

# T16 GA 模組 assets/js/core/analytics.js

```
【任務】產生 /2026/assets/js/core/analytics.js。

【要求】

export function initAnalytics(ga4Id)
  ga4Id 為空字串、null 或 undefined 時，直接 return，不做任何事，也不報錯。
  有值時動態建立 script 標籤載入
  https://www.googletagmanager.com/gtag/js?id=GA4ID（async），
  並初始化 dataLayer 與 gtag 函式，送出 config。

export function track(eventName, params = {})
  GA 尚未初始化時，直接 return（靜默略過，不可拋錯，也不可 console.error）。
  已初始化時呼叫 gtag('event', eventName, params)。

export function trackPageView(path, title)
  送 gtag('event', 'page_view', { page_path: path, page_title: title })。

【禁止】不要在模組頂層執行任何有副作用的程式碼。

【產出】只輸出 analytics.js 的完整內容。
```

## T16 驗收條件

- [ ] `ga4Id` 為空字串時，`initAnalytics()` 不做任何事，DevTools 的 Network 沒有 gtag 請求
- [ ] `ga4Id` 為空時呼叫 `track()` 不拋錯，也不在 console 印錯誤
- [ ] 填入測試用 ID 後，Network 有載入 googletagmanager
- [ ] `track('test', {a:1})` 在 GA DebugView 看得到
- [ ] 模組頂層沒有任何有副作用的程式碼（import 進來不會自動送出請求）
- [ ] 除了 googletagmanager 之外，這個檔案沒有其他寫死的網址

---

# T17 主頁面 index.html + main.js

```
【任務】產生兩個檔案：/2026/index.html 與 /2026/assets/js/main.js。

【index.html 要求】
1. lang 屬性先寫 zh-Hant，之後由 JS 動態改
2. head 要有：charset utf-8、viewport、title、description、canonical、
   og:type website、og:title、og:description、og:image、og:url、
   twitter:card summary_large_image、theme-color
3. 依序載入 assets/css/tokens.css、base.css、components.css、layout.css
4. 用 <script type="module" src="assets/js/main.js"></script>
5. body 結構：
   <header id="gk-nav">（導覽列，內容由 JS 填）
   <main>
     <section id="section-about" class="gk-section">
       （由上而下：報名區塊 #gk-registration、活動介紹容器、
         贊助商跑馬燈 #gk-sponsor-marquee、快速入口卡片 #gk-home-cards）
   跑馬燈容器的位置依 config.sponsorMarquee.position 決定：
     'afterHero' 時移到報名區塊之前，'afterAbout' 時維持上面的順序
     <section id="section-speakers" class="gk-section">
     <section id="section-agenda" class="gk-section">
     <section id="section-virtual" class="gk-section">
     <section id="section-staff" class="gk-section">
     <section id="section-thanks" class="gk-section">
     <section id="section-booths" class="gk-section">
   </main>
   <footer id="gk-footer">（頁尾，內含 placement 為 footer 的選單項目）
   每個 section 內先放一個 h2 標題容器與一個內容容器 div
6. 在 main 之前放一個 Hero 區塊，含活動名稱、日期、地點、購票按鈕與倒數計時，內容由 JS 填
   購票按鈕下方要放免費票申請的次要連結：
   import { createFreeTicketLink } from './ui/free-ticket.js'
   呼叫 createFreeTicketLink('hero')，回傳 null 時就不渲染
   購票按鈕同樣是 <a target="_blank" rel="noopener noreferrer">，
   href 取 config.menu 中 id 為 ticket 那筆的 url，
   點擊時 track('click_ticket', { entry: 'hero' })，url 為空就不渲染
   倒數計時讀 config.site.eventStart（ISO 8601 含時區，例如 2026-11-14T08:30:00+08:00），
   每秒更新天/時/分/秒，時間到就顯示 config.ui.eventStartedText 的文字，
   單位文字從 config.ui.countdownDays / countdownHours / countdownMinutes / countdownSeconds 取
   離開頁面時要 clearInterval，不可留著計時器
7. 加一個 skip link（跳到主要內容），無障礙用
8. noscript 標籤內放一句提示：本網站需要 JavaScript
9. **骨架畫面直接寫在 HTML 裡**，不等 JS 就顯示：
   body 預設帶 class 'gk-loading'，
   每個 section 內先放固定數量的灰色卡片輪廓（講者八張、議程六列、感謝八張），
   尺寸與實際卡片一致，避免資料到達時版面跳動
   骨架用 CSS 動畫做輕微明暗流動，
   prefers-reduced-motion 時停止動畫但保留靜態灰塊
10. 所有 <img> 都要寫 width 與 height 屬性；
    Hero 圖用 fetchpriority="high"，其餘用 loading="lazy" 與 decoding="async"
11. head 加 <link rel="preconnect"> 指向 fonts.googleapis.com 與 fonts.gstatic.com

【main.js 要求】
1. import 所有需要的模組
2. 流程：loadData() → initI18n(config.i18n) → initAnalytics(config.analytics.ga4Id)
   → renderNav → 各 section 的 render 函式 → renderFooter → initNav()
   → initNavOverflow() → handleAutoOpen()
3. 監聽 'gk:langchange' 事件，重新執行所有 render 函式（不要重整頁面）
4. 渲染完成後移除 index.html 裡的骨架元素（把 body 上的 class 'gk-loading' 拿掉）
5. **分享頁自動開啟彈窗**：
   分享頁會在載入 main.js 之前設定
   window.__GK_AUTO_OPEN = { type: 'speakers', id: 'andy_wang' }
   寫一個 handleAutoOpen() 函式：
   讀這個變數，依 type 找到對應資料（speakers / staff / thanks / booths），
   組出跟該區塊點擊卡片時一樣的 payload 呼叫 openModal，
   並 track('share_page_entry', { type, id })
   找不到對應資料時什麼都不做，不可拋錯
   變數不存在時（一般進站）也什麼都不做
6. loadData 失敗時，把骨架換成錯誤訊息與「重新載入」按鈕：
   訊息文字取 config.ui.loadErrorText，但因為 config 可能就是載入失敗的那個，
   要有寫死的中文預設值當後備（這是全站唯一允許寫死中文字的地方）
   按鈕點擊呼叫 location.reload()
7. 每個 section 的 h2 標題文字從 config.menu 對應項目的 label 取

【產出】先輸出 index.html，再輸出 main.js。
```

## T17 驗收條件

骨架與載入：
- [ ] 把網路限速到 Slow 3G，第一時間看到的是骨架不是空白
- [ ] 骨架在 HTML 裡，停用 JavaScript 後仍然看得到
- [ ] 資料載入完成後骨架消失，且版面沒有跳動（DevTools 的 CLS 接近 0）
- [ ] 開啟「減少動態」後，骨架的流動動畫停止但灰塊還在
- [ ] 把 `data/config.json` 改名，頁面顯示錯誤訊息與重新載入按鈕，不是空白
- [ ] 上一條的錯誤訊息即使 config 讀不到也顯示得出中文

分享頁自動開啟：
- [ ] 在 console 設 `window.__GK_AUTO_OPEN = {type:'speakers', id:'andy_wang'}` 後重載，彈窗自動開啟
- [ ] id 改成不存在的值，頁面正常顯示且不拋錯
- [ ] 不設這個變數時，一切正常

其他：
- [ ] head 有 canonical、og:title、og:image、twitter:card
- [ ] 有 preconnect 指向 fonts.googleapis.com 與 fonts.gstatic.com
- [ ] 所有 `<img>` 都有 width 與 height 屬性
- [ ] Hero 圖有 `fetchpriority="high"`，其餘圖片有 `loading="lazy"`
- [ ] 有 skip link，Tab 第一下就能到
- [ ] 切換語言後所有區塊重新渲染，頁面沒有重整
- [ ] section 順序：報名 → 活動介紹 → 跑馬燈 → 首頁卡片
- [ ] `sponsorMarquee.position` 改成 `afterHero` 後，跑馬燈移到報名區塊之前

---

# T17B 404 頁面 2026/404.html

```
【任務】產生 /2026/404.html。

【背景】GitHub Pages 會對不存在的路徑回傳這個檔案。
最常見的情況是分享連結打錯字，例如 /2026/share/speakers/andy_wan/。

【要求】
1. 單一 HTML 檔，樣式沿用 css/tokens.css 與 base.css，不要另外寫一套
2. 台灣選舉風：做成「查無此人選票」的視覺，
   一張空白選票加一枚作廢章，標題用選舉公報的口吻
3. 內容：
   標題與說明文字（中文寫死即可，這頁不做多語）
   一顆回活動首頁的按鈕，連到 /2026/
   四個常用區塊的快速連結：講者、議程、虛擬會場、報名
4. 加一小段 script：
   讀 location.pathname，如果符合 /2026/share/{type}/... 的格式，
   額外顯示一行「你要找的是不是這個分類？」並連到對應區塊
   （speakers → /2026/#/speakers，staff → /2026/#/staff，依此類推）
   不做模糊比對或猜測 id，只做分類層級的引導
5. head 加 <meta name="robots" content="noindex">
6. 不要載入 main.js，也不要讀取任何 JSON，這頁必須在資料掛掉時也能顯示

【產出】只輸出 404.html 的完整內容。
```

## T17B 驗收條件

- [ ] 直接開 `/2026/404.html` 顯示正常
- [ ] 把 `data/` 資料夾改名後，這頁仍然顯示正常（不依賴 JSON）
- [ ] 沒有載入 main.js
- [ ] head 有 `<meta name="robots" content="noindex">`
- [ ] 有回首頁按鈕與四個區塊快速連結，全部可點
- [ ] 在網址列輸入 `/2026/share/speakers/typo/` 後，頁面出現「你要找的是不是講者？」的引導
- [ ] 輸入 `/2026/隨便亂打/` 時，不出現引導但頁面仍正常
- [ ] 樣式沿用 tokens.css 與 base.css，沒有另寫一套色碼

---

# T18 後台骨架 2026/editor.html

```
【任務】產生 /2026/editor.html，這是一個單檔的 JSON 編輯工具。

【定位】純前端，不連任何後端。唯一目的：產生 config.json 與 content.json 兩份檔案。

【本任務範圍】只做骨架與匯入匯出，表單編輯留給下一個任務。

【要求】
1. 單一 HTML 檔，CSS 寫在 <style>，JS 寫在 <script type="module">，不引入外部檔案
2. 版面：左側是分類清單，右側是編輯區
   左側分類：網站設定、選單、介面文字、活動介紹、議程群組、會場、
             講者、議程、工作人員、特別感謝、擺攤、主辦單位
3. 頂部工具列按鈕：
   匯入 JSON（開檔案選擇，可同時選兩個檔）
   貼上 JSON（開一個 textarea 對話框，貼上後解析）
   下載 config.json
   下載 content.json
   複製 config.json 到剪貼簿
   複製 content.json 到剪貼簿
   清空草稿
4. 匯入時要驗證是合法 JSON，失敗顯示錯誤訊息，不可讓頁面壞掉
5. 全域狀態放在一個物件 state = { config: {}, content: {} }
6. 每次修改 state 都要寫入 localStorage 的 'gk_admin_draft'，
   頁面載入時若有草稿就自動還原，並顯示「已還原草稿」提示
7. 匯出的 JSON 用 JSON.stringify(obj, null, 2) 格式化
8. 沒有資料時，提供「載入空白範本」按鈕，建立最小可用的結構

【產出】只輸出 index.html 的完整內容。
```

## T18 驗收條件

- [ ] 單一 HTML 檔，沒有引入任何外部 JS 或 CSS 檔
- [ ] 左側十二個分類都在
- [ ] 匯入一份合法 JSON 後，資料正確載入
- [ ] 匯入一份壞掉的 JSON（少一個括號），顯示錯誤訊息且頁面沒壞
- [ ] 改動任一欄位後重新整理頁面，草稿自動還原並顯示提示
- [ ] 「清空草稿」後重新整理，回到空白狀態
- [ ] 下載的 JSON 有兩空格縮排
- [ ] 複製到剪貼簿後貼進編輯器，內容完整
- [ ] 「載入空白範本」能產生最小可用結構
- [ ] 全檔沒有用 innerHTML 組表單

---

# T19 後台表單引擎（接續 T18）

```
【任務】在 /2026/editor.html 中加入表單編輯功能。我會把現有檔案貼給你，
你輸出完整的修改後檔案。

【要求】

1. 寫一個通用的表單產生函式，依欄位定義產生表單：
   欄位型別要支援：text、textarea、i18n-text、i18n-textarea、
                   number、select、boolean（核取方塊）、slug、links、tags
   thanks 每一筆要有一個 marquee 核取方塊（預設勾選）
2. i18n 欄位的呈現：三個分頁 zh-Hant / en / ja，
   分頁標籤上顯示是否已填（未填的標籤加紅點）
3. 陣列型資料（講者、議程等）的操作：
   新增一筆、刪除一筆（要二次確認）、上移、下移
   排序變動時自動重寫每筆的 order 為 1, 2, 3...
4. links 欄位：可動態增減的列，每列有 platform 下拉、
   url 輸入框、label 的 i18n 輸入
   platform 選項固定為：website, x, threads, facebook, instagram,
   linkedin, github, youtube, medium, blog, email, line, discord, slideshare
5. slug 欄位：
   輸入時自動轉小寫、空白轉底線、移除非 a-z 0-9 _ 的字元
   即時檢查同類型內是否重複，重複時輸入框變紅並顯示訊息
   保留字擋掉：data, assets, images, admin, speaker, staff, thanks,
               booth, organizer
   旁邊有「由名稱產生」按鈕
6. 關聯欄位：
   講者編輯頁的 sessionIds 用多選清單，選項顯示議程標題
   議程編輯頁的 speakerIds 用多選清單，選項顯示講者姓名
   兩邊要連動：在講者頁加了議程，議程的 speakerIds 也要同步更新
7. 每個分類頁上方顯示該分類的資料筆數

【禁止】不要引入任何外部函式庫。不要使用 innerHTML 組表單。

【產出】輸出完整的 2026/editor.html。
```

## T19 驗收條件

- [ ] i18n 欄位有三個分頁，未填的分頁標籤有紅點
- [ ] 新增一筆講者後，order 自動編號
- [ ] 刪除時有二次確認
- [ ] 上移下移後，所有筆的 order 重寫成 1, 2, 3...
- [ ] slug 欄位輸入大寫或空白會自動轉成小寫底線
- [ ] 輸入重複的 id 時，欄位變紅並顯示訊息
- [ ] 輸入保留字 `data` 或 `share` 時被擋下
- [ ] 「由名稱產生」按鈕能產出合法 id
- [ ] links 可動態增減列，platform 是下拉選單
- [ ] 在講者頁勾選一場議程後，切到議程頁，該議程的 speakerIds 已同步包含這位講者
- [ ] 反向操作也同步
- [ ] thanks 每筆有 marquee 核取方塊，預設勾選
- [ ] 每個分類頁上方顯示筆數

---

# T20 後台驗證與預覽（接續 T19）

```
【任務】在 /2026/editor.html 中加入驗證與預覽功能。我會把現有檔案貼給你，
你輸出完整的修改後檔案。

【要求】

1. 驗證面板，按「檢查」時執行，列出所有問題，每筆問題可點擊跳到對應欄位：
   錯誤（紅色）
     - 必填欄位空白：id、slug、name 的 zh-Hant
     - slug 重複或含非法字元
     - speaker.sessionIds 指向不存在的議程
     - session.speakerIds 指向不存在的講者
     - session.groupId 或 trackId 指向不存在的群組或會場
     - 議程時間格式錯誤（不符合 YYYY-MM-DDTHH:mm）
     - 同一會場的議程時間重疊
   警告（黃色）
     - 圖片路徑空白
     - en 或 ja 未翻譯（列出總數即可，不要每筆都列）
     - 連結 url 不是 http 或 https 開頭
2. 頂部顯示未翻譯統計：例如「英文 12 / 45 未填，日文 45 / 45 未填」
3. 匯出前若有紅色錯誤，跳出確認對話框詢問是否仍要匯出
4. 預覽功能：右側可切換成 iframe，載入 ../2026/index.html。
   因為預覽站讀的是 repo 裡的檔案、不是草稿，
   所以預覽區上方要有一行提示文字說明這件事
5. diff 功能：記住匯入時的原始 JSON 字串，
   按「查看變更」時逐行比對目前的 JSON，顯示新增行與刪除行（不同顏色）

【產出】輸出完整的 2026/editor.html。
```

## T20 驗收條件

故意製造錯誤來測，每一條都要能被抓到：
- [ ] 清空某筆的 name.zh-Hant → 紅色錯誤
- [ ] 把兩筆講者的 id 設成一樣 → 紅色錯誤
- [ ] 把 `session.speakerIds` 指向不存在的 id → 紅色錯誤
- [ ] 把 `session.groupId` 改成不存在的群組 → 紅色錯誤
- [ ] 把時間改成 `2026/11/14 10:00` → 格式錯誤
- [ ] 同一會場排兩場重疊的議程 → 紅色錯誤
- [ ] 把某個 url 改成 `www.example.com`（沒有 https）→ 黃色警告
- [ ] 點擊任一條問題，能跳到對應欄位
- [ ] 頂部顯示未翻譯統計數字，且數字正確
- [ ] 有紅色錯誤時按匯出，跳出確認對話框
- [ ] 預覽 iframe 能載入，上方有「預覽的是 repo 檔案不是草稿」的提示
- [ ] 「查看變更」能顯示與匯入版本的新增行與刪除行

---

# T21 產生器設定表與 OG 繪圖 2026/scripts/

```
【任務】產生兩個檔案：
  /2026/scripts/entity-types.mjs
  /2026/scripts/render-og.mjs

【環境】Node.js，**ESM 語法**（import / export，副檔名 .mjs）。
可用的套件只有 canvas（node-canvas，已安裝）：
  import { createCanvas, loadImage, registerFont } from 'canvas';

【entity-types.mjs 要求】
export 一個陣列 ENTITY_TYPES，四筆，每筆的欄位：
（主辦單位不做分享頁與 OG 圖，不要放進這個表）
  key        'speakers' | 'staff' | 'thanks' | 'booths'
  source     content.json 裡的欄位名（同 key）
  ogLayout   'person'（speakers, staff）或 'logo'（thanks, booths）
  ogType     'profile'（speakers, staff）或 'website'（thanks, booths）
  schema     'Person' 或 'Organization'
  imageExt   '.jpg'（speakers, staff）或 '.png'
再 export 兩個函式：
  assetPath(type, id)  → 'images/{type}/{id}{副檔名}'
  ogPath(type, id)     → 'images/og/{type}/{id}.png'
這個檔案是唯一的類型設定來源，之後要加新的分享類型只改這裡。

【render-og.mjs 要求】
export async function renderOgImage({ type, item, layout, config, outPath })
  畫布 1200x630，用 canvas 畫圖並寫成 PNG。

  共用底：底色 #f0f0f0（GDG OFF White），四邊 24px 紅色 #ea4335 外框，
          左下角活動名稱與日期（字級 32）

  layout 為 'person'：
    左側 380x380 圓形頭像，照片置中裁切（等比放大到蓋滿圓形再裁）
    speakers 才畫左上角紅色圓形號次徽章，staff 不畫
    右側由上而下：姓名（字級 72，Black 字重）、
    speakers 畫議程標題、staff 畫志工職務（字級 40，最多兩行）

  layout 為 'logo'：
    logo 等比縮放置中，不裁切，最大 600x360
    下方畫名稱（字級 56）

  字型用 registerFont 掛載 ../assets/fonts/ 內的中文字型檔
  （OG 圖是伺服器端繪圖，這裡才需要實體字型檔，與前端網頁無關）。字型檔不存在時用 console.warn 提示並繼續。

  圖片檔不存在時，畫灰底加姓名首字的預設圖，不可拋錯中斷。

再 export 一個函式：
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines)
  自動換行，超過 maxLines 時截斷並加省略號。

【產出】先輸出 entity-types.mjs，再輸出 render-og.mjs。
```

## T21 驗收條件

- [ ] `ENTITY_TYPES` 剛好四筆，**沒有** organizers
- [ ] `assetPath('speakers','x')` 回傳 `.jpg`，`assetPath('thanks','x')` 回傳 `.png`
- [ ] 執行後產生的 PNG 尺寸是 1200×630
- [ ] 用瀏覽器開啟產生的圖，中文顯示正常沒有豆腐字
- [ ] 把 `assets/fonts/` 改名後執行，印出 warning 但不中斷
- [ ] 刪掉某個講者的頭像檔後執行，該張圖是灰底加姓名首字，程式不中斷
- [ ] 講者版有號次徽章，工作人員版沒有
- [ ] 超長的議程標題會換行並在第二行截斷加省略號
- [ ] logo 版的 logo 沒有被裁切（等比縮放置中）
- [ ] 底色是 `#f0f0f0`，外框是 `#ea4335`
- [ ] 是 ESM 語法（`import`），檔名是 `.mjs`

---

# T22 產生器主流程 2026/scripts/generate.mjs

```
【任務】產生三個檔案：
  /2026/scripts/generate.mjs
  /2026/scripts/render-page.mjs
  /2026/scripts/share-template.html

【環境】Node.js，**ESM**（.mjs）。除了 canvas 之外不新增套件，
其餘用內建的 fs、path、url。
ESM 沒有 __dirname，要用：
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

【share-template.html 要求】
四種類型共用一個模板，用這些佔位字串讓程式取代：
  {{TITLE}} {{DESCRIPTION}} {{CANONICAL}} {{OG_TYPE}} {{OG_IMAGE}}
  {{JSON_LD}} {{BODY_CONTENT}} {{TYPE}} {{ID}}
分享頁位於 /2026/share/{type}/{id}/，所以資源路徑要往上三層：
  ../../../assets/css/... 與 ../../../assets/js/main.js

【render-page.mjs 要求】
export function renderSharePage({ type, item, typeConfig, config, store })
  回傳一個 HTML 字串。內容規則：
  title：「{名稱} — {活動名稱}」
  meta description：介紹前 80 字，換行改成空格
  canonical：{baseUrl}share/{type}/{id}/
  og:type 用 typeConfig.ogType，og:image 用 baseUrl 串 ogPath
  twitter:card summary_large_image
  JSON-LD 用 typeConfig.schema
  body 放給爬蟲看的純文字：h1 名稱、img 含 alt、介紹段落，
  speakers 另外加議程名稱與議程介紹，最後一個回 /2026/ 的連結
  頁面內嵌一小段 script 設定：
    window.__GK_AUTO_OPEN = { type: '...', id: '...' };
  讓 main.js 載入後自動開啟對應彈窗
export function escapeHtml(text)
  處理 & < > " ' 五個字元

【generate.mjs 要求】
1. 讀 ../data/config.json 與 ../data/content.json
2. 依 ENTITY_TYPES 逐一處理，四種類型走同一條流程，不可寫四段重複程式碼：
   產生 OG 圖 → 產生分享頁
3. 輸出位置：
   ../images/og/{type}/{id}.png
   ../share/{type}/{id}/index.html
   資料夾不存在時用 fs.mkdirSync recursive 建立
4. 增量：把來源資料與圖片 mtime 算 hash 存進 ../.generate-cache.json，沒變的跳過
5. 另外產生 ../sitemap.xml（首頁 + 所有分享頁，lastmod 用今天日期）
   與 ../../robots.txt（允許所有爬蟲，指向 sitemap 絕對網址）
6. 殘留偵測：掃 ../share 下四個資料夾，列出 JSON 已不存在的 id，
   用 console.warn 印出提示手動刪除，不自動刪除
7. 結束印出統計：產生幾張圖、幾頁、跳過幾筆、失敗幾筆、殘留幾個資料夾
8. 單筆失敗用 console.warn 印出 type 與 id，不中斷整批

【產出】依序輸出 generate.mjs、render-page.mjs、share-template.html。

【注意】share-template.html 內設定的變數名稱必須是
  window.__GK_AUTO_OPEN = { type: '...', id: '...' }
type 的值必須是 'speakers' / 'staff' / 'thanks' / 'booths' 之一，
與 main.js 的 handleAutoOpen 對應，不可自行改名。
```

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

