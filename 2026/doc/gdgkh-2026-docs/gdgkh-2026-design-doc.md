# GDG Kaohsiung 2026 官網 — 設計規劃文件 v0.1

狀態：規劃中（尚未開始寫程式）
日期：2026-07-30

---

## 0. 專案現況（已讀取 repo）

已看過 `GdgkhCc-master` 全部程式碼。重點：

- 根目錄 `index.html` **已經**改成導向 `/2026/`，`CNAME` 已是 `gdgkh.cc`
- `/2026/` 目前是早鳥預告頁：倒數計時 + 四份意願問卷（講者/志工/擺攤/贊助）+ 頁尾
  → **正式版上線時整頁刪除替換，不保留任何早鳥頁程式碼**
- `/2025/` 是完整站台，架構是：`css/`、`js/`、`data/*.json`、`images/`、`share/{type}/{slug}/index.html`
- 分享頁與 OG 圖已有成熟做法：年度目錄下的 `generate-*.js`（CommonJS）+ `*-template.html` + `canvas` 套件
- 內容後台已有前例：`2025/json-editor.html`、`2025/og-image-generator.html`
- 專案有 ESLint + Prettier，且 GitHub Actions 會跑 lint 與 format 檢查
- 活動時間已確定：**2026-11-14（六）08:30**（來自早鳥頁的 `countdownTarget`）

**結論：本次不另起爐灶，沿用既有目錄慣例與工具鏈，只換掉 `/2026/` 的內容與樣式。**

---

## 0.5 繼承與重來的界線

2026 **不沿用 2025 的內部設計**。2025 是逐年加功能疊出來的，
資料散在 JSON 與 `main.js` 兩處、六支高度重複的產生腳本、
語言代碼在 JSON 用 `zh` 但在 JS 用 `zh-Hant`。這些都不要帶進來。

### 繼承（repo 層級，不重做）
| 項目 | 原因 |
|---|---|
| `CNAME`、根目錄 `index.html` 導向 | 已設定好且正確 |
| `eslint.config.js`、`.prettierrc`、CI workflow | 全 repo 共用，CI 會擋，必須遵守 |
| `package.json`（只新增 scripts，不動既有內容） | 全 repo 共用 |
| `canvas` 套件 | 已安裝且可用，沒必要多裝一個 |
| 年度目錄結構 `/2026/` | 站台分年的大原則正確 |

### 重來（`/2026/` 內部，完全重新設計）
| 2025 的做法 | 2026 的做法 | 理由 |
|---|---|---|
| 語言鍵 JSON 用 `zh`、JS 用 `zh-Hant`，中間要轉換 | 全站統一 `zh-Hant` / `en` / `ja`，沒有轉換層 | 兩套代碼是 bug 溫床 |
| 議程寫死在 `main.js` 的 translations，講者在 JSON | 所有內容都在 JSON，JS 不含任何中文字 | 單一資料來源 |
| 六支 `generate-*.js` 邏輯重複 | 一支產生器 + 類型設定表 | DRY |
| `js/` 平鋪、`dynamic-content.js` 一千多行 | 分層目錄，一個檔案一個職責 | 可讀性 |
| CommonJS `require` | ESM `.mjs` | 與前端 module 語法一致 |
| id 與 slug 兩套識別碼要同步 | **只有一個 `id`，本身就是 slug 格式** | 少一組要對齊的東西 |
| 圖片檔名 `speak-{id}.png` 前綴混雜 | `images/speakers/{id}.jpg` 依類型分資料夾 | 不用前綴區分 |
| 講者卡片邏輯與感謝卡片各寫一份 | 共用卡片元件 + 共用詳細彈窗 | 少一半程式碼 |

### 單一識別碼原則
每筆資料只有一個 `id`，格式是小寫底線（例：`andy_wang`），同時當作：
- 網址：`/2026/share/speakers/andy_wang/`
- 圖片檔名：`images/speakers/andy_wang.jpg`
- OG 圖檔名：`images/og/speakers/andy_wang.png`
- 交叉關聯：`session.speakerIds: ['andy_wang']`

不再有 `spk_001` 這種內部 id 加一個 slug 的雙軌制。

### Prettier 設定（產出的程式碼必須符合）
單引號、結尾分號、2 空格縮排、printWidth 120（HTML 100）、
trailingComma es5、arrowParens always、bracketSpacing true、LF 換行。

### ESLint 重點規則
禁止 `var`、優先 `const`、優先樣板字串、`===` 強制、`if` 一律加大括號、
`console` 只允許 `warn` 與 `error`、未使用變數要以 `_` 開頭。

### 既有 2026 早鳥頁：整頁刪除

正式版上線時，`/2026/` 底下這些檔案**全部刪除**，不做相容、不留過渡：

```
2026/index.html        刪除，換成正式版
2026/css/style.css     刪除（新樣式在 assets/css/）
2026/js/main.js        刪除（新程式在 assets/js/）
2026/data/config.json  刪除，換成新結構
2026/favicon.svg       保留
```

早鳥頁的內容（倒數計時、四份意願問卷）**不搬進正式版**。
倒數計時改為正式版 Hero 區的元件重新實作，資料只留一個 `eventStart` 欄位。
四份問卷連結不再出現在網站上，但為避免遺失，收在本文件附錄 A。

切換步驟：
1. 新版檔案在同一個 branch 建好、本機 `npm run serve:2026` 驗過
2. 一次 commit 刪除舊四個檔案並加入新檔案（不要分兩次 commit，避免中間狀態壞站）
3. `npm run generate:2026` 產生分享頁與 OG 圖
4. `npm run lint:fix && npm run format`
5. 推上 master，確認 `https://gdgkh.cc/` 與 `https://gdgkh.cc/2026/` 都正常

---

## 1. 專案目標

- 產出 GDG Kaohsiung 2026 全新視覺的活動官網
- 內容完全由兩份 JSON 驅動，不需改動程式碼即可更新
- 附一個純前端後台，用來產生這兩份 JSON（你自行複製貼上、commit、push）
- 桌機版：選單分頁式；手機版：一頁式向下捲動
- 三語系：繁體中文 / English / 日本語

---

## 2. 技術架構 ✅ 已定案：純靜態、無建置流程

- HTML + CSS + 原生 JS（ES Modules）
- 沒有 node_modules、沒有 CI，push 就上線
- 前台以輕量自製 render 函式產生 DOM（不引入框架）
- 唯一外部相依：Google Fonts（可改為自架字體檔）

### 因應「無建置」的實作規範
- JS 用 ES Modules（`<script type="module">`），依區塊拆檔，瀏覽器原生載入
- CSS 用 CSS Variables 做設計 token，不用預處理器
- 圖片自行壓縮後放進 repo（無自動最佳化流程）
- 本機預覽：`python3 -m http.server` 或任何靜態伺服器（因為要 fetch JSON，不能直接開 file://）
- 快取：JSON 以 `?v=` 版本參數避免 GitHub Pages 快取舊資料

### 部署
- GitHub Pages
- 2026 站放在 `/2026/`，2025 站保留在 `/2025/`，根目錄 redirect 到最新年度
- 後台放在 `2026/editor.html`（純前端、無密碼、只產生 JSON，不含任何機密）

---

## 3. 檔案結構（2026 內部重新設計）

```
/
├─ CNAME / index.html / package.json / eslint.config.js / .prettierrc   （沿用，不動）
├─ 2025/                                （封存，完全不碰）
└─ 2026/
   ├─ index.html
   ├─ 404.html
   ├─ editor.html                       後台（單檔）
   ├─ sitemap.xml                       產生
   ├─ robots.txt                        產生（放 repo 根目錄）
   ├─ data/
   │  ├─ config.json                    網站功能
   │  └─ content.json                   網站資料
   ├─ assets/
   │  ├─ css/
   │  │  ├─ tokens.css                  設計 token，只有變數
   │  │  ├─ base.css                    reset 與工具 class
   │  │  ├─ components.css              卡片、按鈕、彈窗、標籤
   │  │  └─ layout.css                  導覽、區塊、格線、RWD
   │  ├─ js/
   │  │  ├─ main.js                     進入點，只做流程編排
   │  │  ├─ core/
   │  │  │  ├─ i18n.js                  語言
   │  │  │  ├─ store.js                 載入 JSON、建索引、查詢
   │  │  │  ├─ dom.js                   建立元素的小工具
   │  │  │  ├─ router.js                桌機分頁 / 手機捲動
   │  │  │  └─ analytics.js             GA4
   │  │  ├─ ui/
   │  │  │  ├─ card.js                  三種卡片
   │  │  │  ├─ detail-modal.js          共用詳細彈窗
   │  │  │  ├─ nav.js                   導覽列與語言切換
   │  │  │  └─ payload.js               各類型 → 彈窗資料的轉換
   │  │  └─ sections/
   │  │     ├─ about.js / speakers.js / agenda.js
   │  │     ├─ staff.js / logo-grid.js  （感謝/擺攤/主辦共用）
   │  │     ├─ virtual-space.js         虛擬會場
   │  │     ├─ home-cards.js            首頁快速入口卡片
   │  │     ├─ registration.js          報名區塊（兩張路徑卡）
   │  │     └─ sponsor-marquee.js       首頁贊助商跑馬燈
   │  ├─ ui/free-ticket.js              免費票申請入口（彈窗 + 連結）
   │  └─ fonts/                         NotoSansTC 字重檔（給產生器用）
   ├─ images/
   │  ├─ speakers/{id}.jpg
   │  ├─ staff/{id}.jpg
   │  ├─ thanks/{id}.png
   │  ├─ booths/{id}.png
   │  ├─ organizers/{id}.png          （只用於卡片，不產 OG 圖）
   │  ├─ about/{id}.jpg
   │  └─ og/{type}/{id}.png             產生
   ├─ share/                            產生，不可手改（四種類型）
   │  ├─ speakers/{id}/index.html
   │  ├─ staff/{id}/index.html
   │  ├─ thanks/{id}/index.html
   │  └─ booths/{id}/index.html
   └─ scripts/
      ├─ generate.mjs                   進入點：產生分享頁 + OG 圖 + sitemap
      ├─ entity-types.mjs               四種分享類型的設定表（唯一要改的地方）
      ├─ render-og.mjs                  Canvas 繪圖
      ├─ render-page.mjs                分享頁 HTML 組裝
      └─ share-template.html            共用模板
```

### 設計要點
- **`entity-types.mjs` 是唯一的類型設定表**：要新增分享類型時只改這一支，
  產生器、後台、前台區塊都從它讀設定
- **一個檔案一個職責**，最大的檔案（`store.js`、`detail-modal.js`）預期都在 200 行內
- `main.js` 只負責流程編排，不含任何渲染邏輯與中文字
- `share/` 是產生物，加進 `.gitignore` 的例外清單並註明不可手改

### 要新增的 npm scripts
```json
"generate:2026": "node 2026/scripts/generate.mjs",
"serve:2026": "npx serve 2026"
```
（`.mjs` 副檔名讓 ESM 可用，不需要動 `package.json` 的 `type` 欄位）

---

## 4. 兩份 JSON 的職責切分

### `config.json` — 網站功能
控制「網站長怎樣、開什麼、叫什麼」，年度之間結構穩定。

```jsonc
{
  "version": 1,
  "site": {
    "eventName":  { "zh-Hant": "...", "en": "...", "ja": "..." },
    "year": 2026,
    "eventDate": "2026-11-14",
    "venue":      { "zh-Hant": "...", "en": "...", "ja": "..." },
    "baseUrl": "https://gdgkh.cc/2026/",
    "ogImage": "images/og.png",
    "description": { "zh-Hant": "...", "en": "...", "ja": "..." },
    "themeVariant": "election-classic"
  },
  "analytics": {
    "ga4Id": "G-XXXXXXXXXX"
  },
  "i18n": {
    "defaultLang": "zh-Hant",
    "languages": ["zh-Hant", "en", "ja"],
    "fallbackLang": "zh-Hant"
  },
  "menu": [
    { "id": "about",    "enabled": true, "order": 1,
      "label": { "zh-Hant": "活動介紹", "en": "About", "ja": "イベント紹介" } },
    { "id": "speakers", "enabled": true, "order": 2, "label": { ... } },
    { "id": "agenda",   "enabled": true, "order": 3, "label": { ... } },
    { "id": "staff",    "enabled": true, "order": 4, "label": { ... } },
    { "id": "thanks",   "enabled": true, "order": 5, "label": { ... } },
    { "id": "booths",   "enabled": true, "order": 6, "label": { ... } },
    { "id": "lastyear", "enabled": true, "order": 7, "type": "external",
      "url": "https://.../2025/", "label": { ... } },
    { "id": "organizer","enabled": true, "order": 8, "label": { ... } },
    { "id": "ticket",   "enabled": true, "order": 9, "type": "cta",
      "url": "https://kktix.com/...", "label": { ... } }
  ],
  "ui": {
    "detailButton":   { "zh-Hant": "看詳細", "en": "Details", "ja": "詳細" },
    "closeButton":    { ... },
    "backToTop":      { ... },
    "sessionLabel":   { ... },
    "tagsLabel":      { ... },
    "linksLabel":     { ... }
  }
}
```

重點：**選單順序、開關、外部連結、所有 UI 固定文案**都在這裡，程式不寫死任何中文字。

### `content.json` — 網站資料
```jsonc
{
  "version": 1,
  "about": {
    "sections": [
      { "id": "intro",
        "title": { "zh-Hant": "...", "en": "...", "ja": "..." },
        "body":  { "zh-Hant": "第一行\n第二行", "en": "...", "ja": "..." },
        "image": "images/about/intro.jpg" }
    ]
  },
  "sessionGroups": [
    { "id": "android", "order": 1,
      "name": { "zh-Hant": "Android", "en": "Android", "ja": "Android" },
      "color": "#34a853" }
  ],
  "speakers": [ ... ],
  "sessions": [ ... ],
  "staff": [ ... ],
  "thanksGroups": [ ... ], "thanks": [ ... ],
  "boothGroups":  [ ... ], "booths": [ ... ],
  "organizers":   [ ... ]
}
```

---

## 5. 核心資料模型

### 共用型別

```jsonc
// I18nText — 所有文字欄位都是這個結構
{ "zh-Hant": "文字", "en": "text", "ja": "テキスト" }

// LinkItem — 額外連結，陣列動態產生
{
  "platform": "x",                        // 對應內建 icon key
  "label": { "zh-Hant": "X", ... },         // 可覆寫顯示名稱
  "url": "https://..."
}
```

內建 platform icon（其餘 fallback 為通用連結圖示）：
`website / x / threads / facebook / instagram / linkedin / github / youtube / medium / blog / email / line / discord / slideshare`

### 換行處理（你特別提到）
- JSON 字串內一律用 `\n` 表示換行
- 渲染用 `textContent` + CSS `white-space: pre-wrap; word-break: break-word;`
- **不使用 `innerHTML`**，避免 XSS 與排版炸掉
- 後台輸入框為多行 textarea，存檔時自動轉義成 `\n`
- 如果之後真的需要粗體/連結，再另開 `format` 欄位擴充 — **本次確定不做 Markdown**

### Speaker
```jsonc
{
  "id": "andy_wang",              // 唯一識別碼＝網址＝圖片檔名
  "order": 1,
  "name":   { "zh-Hant": "王小明", "en": "Ming Wang", "ja": "..." },
  "org":    { "zh-Hant": "Google Taiwan", ... },   // 公司／組織（D27）
  "title":  { "zh-Hant": "資深工程師", ... },      // 職稱（D27）
  "bio":    { "zh-Hant": "...\n...", ... },
  "sessionIds": ["gemini_android"],
  "links": [ LinkItem, ... ]
}
```
> `org` 與 `title` 皆為選填 I18nText；卡片、詳細彈窗與 person OG 圖若兩者都有值以「`title · org`」拼接顯示，
> 只有一項時顯示該項，全缺時整行不渲染。

### Session
```jsonc
{
  "id": "gemini_android",
  "groupId": "android",
  "trackId": "track_1",
  "title":    { "zh-Hant": "...", ... },
  "abstract": { "zh-Hant": "...\n...", ... },
  "tags": [ { "zh-Hant": "初學者", "en": "Beginner", "ja": "初級" } ],
  "speakerIds": ["andy_wang"],
  "start": "2026-11-14T10:00",
  "end":   "2026-11-14T10:40",
  "type":  "talk",          // talk / keynote / break / lunch / opening / closing
  "links": [ LinkItem, ... ]
}
```
> 講者與議程用 id 互相關聯（單一真實來源），避免資料重複打兩次。
> **圖片路徑不寫進 JSON**：由 id 與類型推導（`images/speakers/{id}.jpg`、
> `images/og/speakers/{id}.png`），少一組會不同步的欄位。
> 副檔名固定：頭像 `.jpg`、logo `.png`。

### VenueMap（場地地圖）
```jsonc
"venueMaps": [
  { "file": "venue-map-1f.png",
    "caption": { "zh-Hant": "一樓平面圖", "en": "...", "ja": "..." } }
]
```
- 路徑 = `images/` + `file`（這是少數直接寫檔名的欄位，因為地圖不屬於任何實體）
- 陣列長度 1 時直接顯示該張圖；多張時上方出現分頁按鈕（例如 1F / 2F / 攤位區）
- 空陣列或欄位不存在時，整個地圖區塊不渲染

### Track（軌道 / 會議室）— 彈性多軌設計
```jsonc
"tracks": [
  { "id": "track_1", "order": 1, "name": { "zh-Hant": "第一會場", ... }, "color": "#ea4335" }
]
```

軌道數由 `tracks` 陣列長度**自動決定**，程式不寫死：

| tracks 數量 | 時間軸呈現 |
|---|---|
| 1 | 單欄垂直時間軸（不顯示會場名） |
| 2–3 | 桌機分欄並排（欄寬平均），手機用會場 tab 切換 |
| 4+ | 桌機橫向捲動分欄，手機用會場 tab 切換 |

- `type` 為 `break` / `lunch` / `opening` / `closing` 的項目可設 `"trackId": "all"`，橫跨全部欄位（休息時間不需要分軌）
- 現在先用單軌資料開發，之後你要加第二軌只需在 `tracks` 加一筆、把 session 的 `trackId` 填上，版面自動切換

### Staff
```jsonc
{
  "id": "mei_ling", "order": 1,
  "name": I18nText,
  "bio":  I18nText,
  "role": I18nText,          // 志工職業
  "links": [ LinkItem ]
}
```

### Thanks / Booth（結構相同，共用元件）
> 「特別感謝」與「贊助商」共用同一區塊，靠 `thanksGroups` 區分（例如：鑽石級贊助 / 黃金級贊助 / 場地協力 / 特別感謝），群組順序決定顯示順序與卡片大小級距。

```jsonc
// groups
{ "id": "gold", "order": 1, "name": I18nText }
// items
{ "id": "example_co", "groupId": "gold", "order": 1,
  "name": I18nText,
  "description": I18nText, "links": [ LinkItem ] }
```

### Organizer
```jsonc
{ "id": "gdg_kaohsiung", "order": 1, "name": I18nText,
  "description": I18nText, "links": [ LinkItem ] }
```

---

## 6. 共用詳細彈窗（DetailModal）

所有卡片點擊後開同一個 modal，資料先轉成統一契約：

```jsonc
DetailPayload {
  avatar?, name, subtitle?,        // subtitle = 志工職業 / 群組名
  bio?, sessionTitle?, sessionAbstract?,
  groupName?, tags?: [], links?: [], meta?: []   // meta = 時間 / 地點
}
```

| 來源 | 帶入欄位 |
|---|---|
| 講者卡 | 頭像、姓名、介紹、議程名稱、議程介紹、議程群組、標籤、連結 |
| 議程軸 | 同上（由 session 反查 speaker，多講者則並列） |
| 工作人員 | 頭像、姓名、志工職業、自我介紹、連結 |
| 特別感謝 / 擺攤 | 圖片、名稱、群組、介紹、連結 |

Modal 行為：ESC 關閉、點遮罩關閉、focus trap、開啟時鎖背景捲動、手機版由下往上滑出（bottom sheet）、桌機版置中卡片。

---

## 6.5 場地地圖與圖片檢視器

議程區塊的版面順序：**場地地圖 → 議程時間軸**。

### 地圖區塊
- 資料來自 `content.venueMaps`
- 桌機顯示縮圖（最大寬 720px，等比），手機滿版
- 圖片上方有提示文字（`ui.mapZoomHint`），說明可點擊放大
- 多張地圖時，上方一排分頁按鈕切換

### 圖片檢視器 `ui/image-viewer.js`
獨立元件，不綁定地圖用途，未來講者頭像等也能複用。

| 操作 | 桌機 | 手機 |
|---|---|---|
| 放大縮小 | 滾輪 | 雙指捏合 |
| 平移 | 按住拖曳 | 單指拖曳 |
| 重置 | 雙擊 | 雙擊 |
| 關閉 | Esc、點背景、右上角按鈕 | 點背景、右上角按鈕 |

實作重點：
- 用 Pointer Events 一套處理滑鼠與觸控，不要分開寫 mouse 與 touch
- 縮放範圍 1 到 6 倍，縮放以游標／雙指中心為錨點，不是以圖片中心
- 平移要夾住邊界，放大倍率為 1 時不可拖動
- 圖片容器加 `touch-action: none`，否則手機會被瀏覽器的捲動與縮放搶走事件
- 開啟時鎖背景捲動，關閉時解鎖並移除所有事件監聽
- 底部顯示目前倍率與一個重置按鈕（給不知道可以雙擊的人）

---

## 6.6 虛擬會場（Leapie）

一個 Gather Town 類型的線上虛擬空間，**從網站上線就開放**，
定位是「另一種取得活動資訊的方式」——使用者可以先進去逛場地、看攤位配置，
活動當天再進去互動。不做時間狀態切換，永遠可進入。

### 呈現方式
- 選單獨立一項（順序放在議程時間表之後）
- 站內獨立區塊，不是單純外連。理由是進入前需要說明：
  要開哪些權限、建議用什麼裝置、怎麼選分身
- 場地地圖區塊下方加一個次要入口：「也可以到虛擬會場實際走一圈」
  （地圖與虛擬會場是同一類的空間資訊，放一起最自然）
- 進入用新分頁開啟（`target="_blank" rel="noopener noreferrer"`），
  使用者關掉分頁還能回到議程頁
- 附 QR code 圖片，方便現場的人用手機掃

### 不做 iframe 嵌入
這類服務多半設有 `X-Frame-Options` 或 CSP `frame-ancestors`，嵌了會是空白；
就算能嵌，WebRTC 的攝影機麥克風權限在 iframe 內容易失敗，
手機上拖曳手勢也會跟頁面捲動打架。
config 保留一個 `embed` 開關（預設 `false`），實測確認可嵌再打開。

### 資料
```jsonc
// config.json
"virtualSpace": {
  "enabled": true,
  "url": "https://leapie.leapdesign.ai/",
  "embed": false,
  "qrImage": "images/virtual-space-qr.png"
}

// content.json
"virtualSpace": {
  "title": { "zh-Hant": "線上競選總部", ... },
  "description": { "zh-Hant": "進去逛場地、看攤位...\n活動當天可以...", ... },
  "notes": [
    { "zh-Hant": "建議使用電腦版 Chrome" },
    { "zh-Hant": "需要允許麥克風與攝影機權限" }
  ]
}
```

QR code 圖片自行產生一次放進 `images/`，不為了這個引入 QR 套件。

GA 事件：`enter_virtual_space`（帶入口位置：選單 / 地圖下方 / 區塊主按鈕）。

---

## 6.7 首頁快速入口卡片

「去年頁面」與「主辦單位」不放導覽列，改成活動介紹區塊最下方的一排卡片。

### 為什麼是卡片不是頁尾
頁尾是死角，主辦單位有 logo 與介紹，做成卡片比一行文字連結有份量得多；
去年頁面做成帶年份與視覺的卡片，也比藏在頁尾容易被點。
兩者的瀏覽頻率不足以佔導覽列，但也不該被埋掉，卡片是剛好的中間值。

### 主辦單位不再是獨立區塊
主辦單位通常只有一到兩筆，為它開一個完整 section 太重。
改成首頁卡片，點擊後開共用的詳細彈窗（logo、介紹、額外連結都在裡面）。
主辦單位**不產生分享頁**（見 10.2），資料仍在 `content.organizers`。

### 卡片內容
- 主辦單位：每個單位一張，logo + 名稱，點擊開詳細彈窗
- 去年頁面：一張外連卡片，顯示年份與一句說明，新分頁開啟
- 桌機一排三到四欄，手機兩欄

### menu 的 placement 欄位
```jsonc
{ "id": "organizer", "placement": "home", ... }   // 首頁卡片
{ "id": "lastyear",  "placement": "home", ... }   // 首頁卡片
```
值有三種：`nav`（預設，不寫就是這個）、`home`、`footer`。
之後想把某項搬回導覽列，改 JSON 就好，不用動程式。

---

## 6.8 報名區塊：兩條路徑

免費票的流程是：填 Google 表單 → 你人工審核 → 寄信給申請者優惠碼或免費報名連結 → 對方自己去報名。
所以網站要同時服務兩種人，而且**順序不能搞錯**。

### 核心問題是順序
符合資格的人如果先按了購票、買完才發現有免費票，就要退票重來，
麻煩的是你不是使用者。所以免費票的提醒**必須出現在購票動作之前，而且不能是不起眼的小字連結**。

### 解法：並排的兩張路徑卡
在 Hero 下方放一個報名區塊，兩張卡並排（手機上下排），使用者自己對號入座：

**左卡「我可能符合資格」**
標題、資格條件摘要（前兩三條）、按鈕「查看資格並申請」
點擊開資格說明彈窗，讀完再前往表單
卡片上明確標註：需人工審核，約 N 個工作天回信

**右卡「直接報名」**
標題、票種與價格摘要、按鈕「前往報名」
直接外連售票平台，開新視窗

兩張卡視覺權重相當，不做主次之分——沒有資格的人不該覺得自己走錯路。

### 順序提醒
報名區塊上方一行提醒文字，例如：
「符合免費票資格者請先申請，取得優惠碼後再報名。已購票恕不退差額。」
這句話寫在 `content.registration.orderNotice`，
同一句也會出現在免費票彈窗的最上方——那是最後一次來得及提醒的地方。

### 導覽列購票按鈕維持直接外連
不做攔截式的確認彈窗。對已經知道自己要買票的人來說那是純粹的摩擦，
而且提醒已經在 Hero 下方講過一次了。

### 免費票截止後
`closeAt` 過期時，左卡收合成一行說明（顯示 `closedText`），
右卡的直接報名維持不變，並自動撐滿版面。

### 資料
```jsonc
// config.json
"freeTicket": {
  "enabled": true,
  "formUrl": "https://forms.gle/xxxxx",
  "closeAt": "2026-10-15T23:59:59+08:00",   // 空字串表示不設截止
  "reviewDays": 3
}
// 直接報名沿用 menu 中 id 為 ticket 那筆的 url，不另外設一個欄位

// content.json
"registration": {
  "orderNotice": { "zh-Hant": "符合免費票資格者請先申請...", ... },
  "directTitle": { "zh-Hant": "直接報名", ... },
  "directSummary": { "zh-Hant": "一般票 NT$XXX，含午餐與紀念品", ... }
},
"freeTicket": {
  "title": { "zh-Hant": "免費票申請", ... },
  "summary": { "zh-Hant": "學生與弱勢身分可申請免費票", ... },
  "eligibility": [ { "zh-Hant": "在學學生（需附學生證）" }, ... ],
  "process": [
    { "zh-Hant": "填寫表單並上傳證明" },
    { "zh-Hant": "主辦人工審核" },
    { "zh-Hant": "審核通過後以 email 寄送優惠碼或免費報名連結" },
    { "zh-Hant": "自行前往報名頁面使用優惠碼完成報名" }
  ],
  "notes": { "zh-Hant": "名額有限，額滿為止\n請留意信件是否被歸類為垃圾郵件", ... },
  "closedText": { "zh-Hant": "免費票申請已截止", ... }
}
```

### 其他細節
- 優惠碼**絕不出現在網站上**。靜態站沒有權限控管，寫進 JSON 就等於公開
- `process` 要把四個步驟完整列出，讓申請者知道「不是填完表單就有票」
- 提醒申請者檢查垃圾郵件匣，這是實務上最常見的客訴來源
- 首頁快速入口卡片區也放一張免費票卡，給滑到下方才注意到的人
- GA：`open_free_ticket`（帶入口來源）、`click_free_ticket_form`、`click_ticket`（帶 entry）
  兩者相減就知道有多少人看完資格後放棄

### 選舉風文案
「競選補助款申請」「小額募款回饋」之類的梗可以玩，
但資格條件與流程步驟要寫得直白，別讓人看不懂自己能不能申請。

---

## 6.85 首頁贊助商跑馬燈

首頁一條橫向無限循環的 logo 帶，感謝贊助商、個人贊助與合作夥伴。

### 所有票一樣大
不做贊助層級的大小差異。每張票尺寸相同，logo 統一高度、`object-fit: contain`。
層級差異只用票頭右側的「票種」文字表示，視覺份量一視同仁。

### 資料來源與開關
直接讀 `content.thanks`，每筆的 `marquee` 欄位決定是否上跑馬燈（省略時為 `true`）。
不另外建一份清單，避免同一個贊助商要維護兩處。

```jsonc
"sponsorMarquee": {
  "enabled": true,
  "speedPxPerSecond": 60,    // 桌機每秒移動像素，手機自動取 0.75 倍
  "direction": "left",
  "pauseOnHover": true,
  "position": "afterAbout"   // afterHero 或 afterAbout
}
```

### 怎麼跑

**速度用「每秒幾像素」而不是「幾秒跑一圈」。**
如果設定成固定秒數，贊助商從 5 家變成 20 家時，同樣時間要跑完更長的內容，
速度就會暴增。改成固定 px/s，動畫時間由程式算：`總寬度 ÷ 速度`。
贊助商增加時只是循環週期變長，觀感一致。

**無縫循環**：把清單重複渲染，動畫從 `translateX(0)` 跑到 `translateX(-50%)`，
接回起點時視覺上連續。

**重複次數動態計算**：重複到總寬度至少為容器寬的兩倍為止，至少兩份。
只放兩份的話，贊助商很少時中間會出現空白再突然跳接。

**線性等速**：`animation-timing-function: linear`。
用 ease 系列會在接點處出現速度變化，循環的破綻會被看出來。

**純 CSS 動畫**：`@keyframes` 加 `transform: translateX()`，走 GPU 合成。
JS 只負責產生 DOM 與計算 duration，不做逐幀運算。

**暫停**：滑鼠移入或鍵盤 focus 進入時 `animation-play-state: paused`。

**減少動態偏好**：`prefers-reduced-motion: reduce` 時停止動畫，
改成可手動橫向捲動的靜態列。跑馬燈對前庭障礙使用者是常見的不適來源，
這條不是可選項。

**兩端淡出**：容器左右各一段 `mask-image` 漸層，
讓 logo 進出時淡入淡出，而不是被硬邊切斷。

### 選舉要素：每個贊助商是一張「感謝票」

概念是「有他們這一票，活動才成立」。
跑馬燈上跑的不是裸 logo，而是一張一張的**選票**。

### 選票卡的構造（`ui/ballot-card.js`）

由上而下四層，比照台灣選票的版面：

**票頭。** 一條紅色橫帶，白字印活動名與「感謝票」字樣。
右側小字印該筆所屬的群組名稱當「票種」（贊助商 / 個人贊助 / 合作夥伴）。

**票身。** 米白紙面，中央放 logo，`object-fit: contain` 等比縮放，
統一高度、置中對齊。下方一行是名稱。

**圈選欄。** 右下角一個細框方格，裡面蓋一枚紅色中空圓圈（圈選章的印記），
微微傾斜 3 到 5 度、邊緣不完全均勻，像真的蓋上去的。
這是整張票的視覺重點，也是「已投下這一票」的意思。

**裁切邊。** 卡片左右緣用 `repeating-linear-gradient` 做出虛線齒孔，
像從票本上撕下來的。上下緣保持直邊。

紙面加極輕微噪點與一點點紙張的暖色，不要純白。
卡片給一個硬邊偏移陰影（`4px 4px 0`），維持整站的印刷風。

### 跑馬燈：一排選票橫向流過

背景改成深色的**票匭**質感（深墨色帶木紋感的細直紋），
讓米白色的票在上面浮出來。原本的布條與三角旗撤掉，
票本身已經夠有識別度，再加布條會太滿。

票與票之間留固定間距，不再需要 ☑ 分隔符號——票的邊界就是分隔。

跑法不變：等速 px/s、線性、無縫循環、hover 暫停、
`prefers-reduced-motion` 時停止並改為手動捲動、兩端 `mask-image` 淡出。

hover 時該張票輕微抬起（位移 3px 加深陰影），圈選章的紅色加深，
像被拿起來端詳。

### 特別感謝區塊：同一張票，排成計票板

「特別感謝」區塊直接複用同一個選票元件，**依群組分區排成格線**，
就是你說的「一頁顯示多張票」。

群組標題做成投票所的分區牌（例如「贊助商」「個人贊助」「合作夥伴」），
下方是該群組的所有票，桌機四欄、平板三欄、手機兩欄。
群組間用一條細虛線分隔，像計票板上的分欄。

同一個元件用在兩處的好處是：改一次樣式，跑馬燈與區塊一起變，
而且使用者在兩個地方看到的是同一個東西，認知不會斷裂。

### 擺攤區塊不用選票
攤位是「參與者」不是「投票者」，維持原本的 logo 卡片，
用市集攤位旗幟的視覺處理，跟感謝票區分開。

---

## 6.9 所有外部連結一覽

程式碼中**不得出現任何寫死的網址**，全部由 JSON 控制。
新增或修改連結只要改 JSON、重推，不用動程式。

| 用途 | JSON 位置 | 空值時的行為 |
|---|---|---|
| 免費票申請表單 | `config.freeTicket.formUrl` | 免費票入口與卡片完全不渲染 |
| 報名／購票 | `config.menu` 中 `id: "ticket"` 的 `url` | 購票按鈕不渲染，報名卡的按鈕停用 |
| 去年頁面 | `config.menu` 中 `id: "lastyear"` 的 `url` | 該卡片不渲染 |
| 虛擬會場 | `config.virtualSpace.url` | 區塊與交叉連結都不渲染 |
| 講者／工作人員／贊助／攤位的社群連結 | 各筆資料的 `links[].url` | 該筆連結不渲染 |
| 主辦單位連結 | `content.organizers[].links[].url` | 同上 |

驗收時要用 grep 檢查 `assets/js/` 底下有沒有 `https://` 開頭的字串，
除了 GA 的 googletagmanager 網址之外不該有任何一個。

---

## 6.95 加入行事曆

議程詳細彈窗底部提供兩個選項，讓使用者把場次加進自己的行事曆：

- **下載 .ics**：前端即時組字串產生 Blob 後下載，不需要任何套件與後端
- **加入 Google 日曆**：組出 `calendar.google.com/calendar/render?action=TEMPLATE&...` 的網址，新分頁開啟

實作要點：
- 時區固定 `Asia/Taipei`。.ics 內用 UTC（`DTSTART:20261114T020000Z`），
  換算時直接減八小時，不要依賴使用者裝置時區
- `UID` 用 `{session.id}@gdgkh.cc`，`DTSTAMP` 用產生當下時間
- `SUMMARY` 用議程標題、`DESCRIPTION` 放講者姓名與議程介紹、
  `LOCATION` 用會場名稱與場地地址
- .ics 的換行必須是 CRLF，行長超過 75 字元要折行，這是規格要求，
  不照做的話部分行事曆軟體會解析失敗
- 中文內容要正確編碼為 UTF-8
- 也在時間軸每張議程卡右下角放一個小圖示按鈕，不用開彈窗就能加

另外在議程區塊頂端提供「加入整天議程」的按鈕，一次匯出所有場次成一個 .ics。

---

## 7. 版型與導覽

### 桌機（≥ 1280px）
- 頂部固定選單列，仿**競選看板橫幅**：左邊 logo + 活動名，右邊選單項目，最右「點我購票」大按鈕
- 購票是外部售票平台連結，一律 `<a target="_blank" rel="noopener noreferrer">` 開新視窗，
  且固定在最右、不進溢出選單；`url` 為空時整顆不渲染（票還沒開賣時的狀態）
- 購票入口共三處：導覽列、Hero 區、手機版區塊按鈕，GA 事件都帶 `entry` 參數區分
- 點選單切換 section（hash route，例如 `#/speakers`），一次只顯示一個區塊
- 「去年頁面」直接開新分頁

### 選單不換行的處理（項目已達十項）

不靠縮小字體硬塞。字級縮到 13px 以下中文會很難讀，
而且英文與日文的標籤比中文長得多（「特別感謝」對上 Special Thanks），
只要切語言就會破版，寫死的斷點救不了。

四層處理，由上而下：

**一、先從結構減量。** 把「去年頁面」與「主辦單位」移出導覽列，
改成首頁的快速入口卡片（見 6.7）。頁尾同時保留一份純文字連結。
導覽列剩八項：活動介紹、講者、議程、虛擬會場、工作人員、特別感謝、擺攤、購票。

**二、流體字級但有下限。** `clamp(0.875rem, 0.8vw + 0.5rem, 1rem)`，
最小 14px 為止，不再往下縮。同時把左右 padding 也跟著流體縮。

**三、量測式溢出選單（priority+ 模式）。** 這是保證單行的機制：
用 `ResizeObserver` 監看導覽列寬度，逐項量測累加寬度，
放不下的項目移進最右邊的「更多」下拉選單。
不寫死斷點，切語言、換字體、改標籤都自動適應。
購票 CTA 永遠固定在最右，不進溢出選單。

**四、再放不下就進手機模式。** 桌機門檻從 1024px 提高到 **1280px**，
1280px 以下直接切到一頁式 + 可橫向捲動的 chip 導覽。
這段程式本來就要寫，等於免費多一層保險。

語言切換器用短代碼（中 / EN / 日）加地球圖示，不寫完整語言名稱。

### 手機（< 1280px）
- 一頁式，全部 section 依序往下排
- 頂部橫向捲動的 chip 導覽（點了平滑捲動到該段）
- 「購票」在頁面中以按鈕區塊呈現，「去年頁面」「主辦單位」是首頁卡片
- 右下角回到頂部按鈕（做成競選旗幟造型）

### 平板（768–1279px）
併入一頁式，但卡片改兩欄。

---

## 7.5 頁尾

頁尾內容由 `config.footer` 控制，分四塊：

1. **社群連結**：`links` 陣列，格式同其他地方的 LinkItem
2. **次要選單**：`placement` 為 `footer` 或 `home` 的選單項目
3. **必要連結**：行為準則、隱私說明（如果有）
4. **版權宣告**：`© 2026 GDG Kaohsiung`，加一行 GDG 社群聲明

### 行為準則（Code of Conduct）
- 網址：`https://gdg.tw/code_of_conduct/`
- 放在 `config.footer.codeOfConduct.url`
- 除了頁尾之外，**報名區塊的兩張路徑卡下方也要放一行連結**，
  讓人在報名前就看得到
- 文案要明確寫出這是參加活動的前提，不是可看可不看的附錄

### 選舉風
頁尾做成選舉公報的版權區：細線框、小字、置中，
加一行玩梗的免責聲明（例如：本網站與任何政黨無關，純屬技術社群活動）。

---

## 7.6 載入與錯誤狀態

JSON 是 `fetch` 進來的，慢網路下會有一段空白，要處理。

### 載入中：骨架佔位
不用轉圈圈的 spinner，用**骨架畫面（skeleton）**：
在各區塊的位置先畫出灰色的卡片輪廓（正確的尺寸與格線），資料到了再替換。

理由是 spinner 只告訴使用者「在等」，骨架同時告訴他「等一下會出現什麼、大概多少」，
而且畫面不會在資料到達時整個跳動（避免版面位移）。

實作：
- 骨架直接寫在 `index.html` 裡，不等 JS 就顯示，第一個位元組到達就有東西看
- 用 CSS 動畫做輕微的明暗流動（`prefers-reduced-motion` 時停止動畫，保留靜態灰塊）
- 骨架的卡片數量固定（例如講者區八張），不用精確符合實際筆數
- 資料渲染完成後移除骨架

### 載入失敗
顯示一段明確的錯誤訊息與「重新載入」按鈕，不要留白畫面。
訊息文字放 `config.ui.loadErrorText`，因為 config 可能就是載入失敗的那一個，
所以這句話要有寫死的中文預設值當最後防線——**這是全站唯一允許寫死中文的地方**。

### 圖片載入失敗
`onerror` 時換成預設圖：講者與工作人員用灰底加姓名首字，logo 用通用圖示。

---

## 8. 視覺設計：台灣選舉風 ✅ 已定案：混合玩梗（大膽一點）

風格定位：**現代版面骨架 + 復古看板元素 + 明確的玩梗文案**。
排版乾淨可讀（畢竟是要看議程的），但視覺記憶點大膽——超粗黑體、號次徽章、紅色印章、宣傳車跑馬燈、「凍蒜」感嘆號、選票勾選框。梗放在文案與微互動，不犧牲資訊可讀性。

具體玩梗點（可再增減）：
- Hero：「2026 高雄開發者大選」「政見發表會」，倒數計時做成「開票倒數」
- 講者卡：左上角號次徽章（1 號、2 號…），議程名稱當「競選標語」
- 議程群組篩選 chip = 「政黨」色籤
- 購票按鈕：「投他一票」＋點下去蓋章動畫
- 頁尾：選舉公報風小字聲明（例：本網站與任何政黨無關，純屬技術社群玩梗）
- 跑馬燈：宣傳車廣播式橫向字幕，放公告與贊助商

### 色彩：**一律使用 GDG 官方色票，不自創顏色**

GDG 是 Google 官方社群品牌，hex 必須精確，不能用近似色。
選舉風是「用官方色去演繹」，不是換一組自己覺得像選舉的顏色。

| 用途 | GDG 官方色名 | Hex |
|---|---|---|
| 主色、CTA、票頭、印章 | Red 500 | `#ea4335` |
| 次要色、群組標籤 | Blue 500 | `#4285f4` |
| 強調、號次底色 | Yellow 600 | `#f9ab00` |
| 時間軸、成功狀態 | Green 500 | `#34a853` |
| 文字、票匭底 | Black 02 | `#1e1e1e` |
| 背景、票身紙面 | OFF White | `#f0f0f0` |

注意兩個常被寫錯的值：
GDG 的黃是 `#f9ab00`（不是 Google 品牌常見的 `#fbbc04`），
黑是 `#1e1e1e`（不是純黑），白是 `#f0f0f0`（不是純白）。

需要更多層次時，只能從官方的 Halftone 與 Pastel 衍生色取用：
Halftone Blue `#57caff`、Halftone Green `#5cdb6d`、Halftone Yellow `#ffd427`、
Halftone Red `#ff7daf`（注意這個是粉紅不是紅）；
Pastel Blue `#c3ecf6`、Pastel Green `#ccf6c5`、Pastel Yellow `#ffe7a5`、Pastel Red `#f8d8d8`。

**紙張質感不靠改色。** 原本規劃的暖米白 `#FAF7F0` 是自創色，撤掉。
票身與背景一律用 OFF White `#f0f0f0`，
紙感改用極輕微的噪點疊層與硬邊陰影達成，不動 hex。

配色比例照 GDG 的 60/30/10：
60% 中性色打底、30% 一個核心色當主視覺（本站用 Red 500）、10% 其餘核心色當 accent。

### 字體 ✅ 已定案：內文系統字體，標題載一支顯示字體

全站只載**一支**顯示字體給標題用，其餘一律走系統字體堆疊。
內文佔全站九成以上文字量，用系統字體省掉大部分流量也更有原生感；
標題只有幾十個字，載一支字型成本很低，品牌識別與效能兼顧。

```css
/* 內文：不載任何字型 */
--gk-font-body: system-ui, -apple-system, 'Segoe UI', Roboto,
                'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;

/* 標題與票頭：唯一載入的字體 */
--gk-font-display: 'Google Sans', 'Google Sans Flex',
                   'Noto Sans TC', system-ui, sans-serif;

/* 短標記、時間、票號 */
--gk-font-mono: 'Google Sans Mono', ui-monospace, SFMono-Regular,
                'SF Mono', Consolas, monospace;
```

### 顯示字體取得順序
Google Sans 是 Google 的受限授權字體，不在開源清單內，
Google Fonts 上目前可取得的是 **Google Sans Flex**。實作時依序嘗試：
1. Google Fonts 的 Google Sans / Google Sans Flex
2. GDG Organizer 品牌資源包內的 webfont，自架於 `assets/fonts/`
3. 兩者都不行才依品牌指南的但書用替代字體，並在文件註明

**不可退回 Arial、Helvetica、Open Sans 這類通用字體充當品牌字。**

### 中文標題不靠字重，靠視覺處理
這是這個決定的關鍵配套。中文系統字體的字重在各平台不一致：
Mac 是蘋方、Windows 是微軟正黑、Android 是 Noto Sans CJK，
而**微軟正黑沒有 Black 字重**，瀏覽器會做假粗體，大字級下中文會糊掉。

所以中文標題的「看板感」改用這些手段達成，不依賴 font-weight 900：
- 紅色實心色塊反白（白字壓在 `--gk-red` 上）
- 2 到 3px 的粗外框與硬邊偏移陰影
- 斜切色塊、印章方框、號次徽章等圖形元素
- 字距收緊（`letter-spacing: -0.02em`）製造密實感

中文字重上限設 `700`，**不要用 `800` 或 `900`**，
也不要靠 `-webkit-text-stroke` 補粗，那在小字級會糊。

### 只載必要的字重
顯示字體只載 500 與 700 兩個字重，`&display=swap`。
不載中文 webfont（中文字型檔動輒數 MB，是效能預算的最大威脅）。

### 借用 GDG 的版面語言

GDG 的視覺簽名不只在顏色，還在版面骨架，而且剛好跟選舉主題相合：

- **章節編號**：每個區塊用超大的 `01.` `02.` `03.` 開場，
  這與選票上的候選人號次是同一個視覺語言，兩者可以直接疊合
- **右上角 mono 麵包屑**：用 Google Sans Mono 標示目前區塊，
  像選舉公報頁眉
- **Eyebrow + 超大標題**：小字前綴加大標題的組合

### GDG 命名規則（文案要遵守）

- 社群名稱一律寫 `GDG Kaohsiung` 或 `Google Developer Group Kaohsiung`
- 工作人員職稱**不可寫 `GDG Lead`**，該用語已停用，一律用 `GDG Organizer`
- 這條要寫進後台的欄位提示，避免填資料時打錯

### 視覺元件對應
| 網站區塊 | 選舉隱喻 |
|---|---|
| Hero | 大型競選看板：超大標題、日期、地點、「凍蒜」感嘆號 |
| 講者卡 | 候選人看板：**號次徽章**、圓形頭像＋紅框、姓名大字、議程名稱當競選標語 |
| 議程時間表 | 車掃行程表 / 開票倒數：垂直時間軸＋時段色帶 |
| 場地地圖 | 選區地圖／責任區劃分圖 |
| 議程群組 | 「政黨」色籤，篩選 chip |
| 工作人員 | 助選團隊，加志工職業當「職稱布條」 |
| 特別感謝 | 計票板：一張張感謝票依群組分區排列 |
| 活動擺攤 | 市集攤位旗幟 |
| 購票按鈕 | 「投給我們一票」大型 CTA，蓋章動畫 |
| 購票入口 | 導覽列最右固定一顆「點我購票」，外部連結、開新視窗 |
| 贊助商跑馬燈 | 純 CSS 無限循環，等速 px/s；每個贊助商是一張「感謝票」，票匭底 |
| 感謝票元件 | 跑馬燈與特別感謝區塊共用同一個選票卡片，後者依群組排成計票板 |
| 報名區塊 | Hero 下方兩張並排路徑卡：申請免費票 vs 直接報名；上方一行順序提醒 |
| 免費票申請 | Google 表單受理、人工審核後寄信；網站不碰優惠碼，入口先開資格說明彈窗 |
| 虛擬會場 | 線上競選總部 |
| 頁尾 | 選舉公報風：印章、聲明小字 |

### 質感細節
- 斜切色塊（skew）、紙質噪點、印刷套色偏移（misregistration）微效果
- 跑馬燈：宣傳車廣播式的橫向捲動字幕（放重要公告）
- 紅色印章章框 hover 效果
- 動畫尊重 `prefers-reduced-motion`

### 政治中立原則
只借用「視覺語彙」，**不使用任何真實政黨標誌、顏色政治暗示、候選人肖像或口號**，避免爭議。文案走幽默自嘲路線。

---

## 9. 多國語言 ✅ 已定案：架構三語齊備，內容先做中文、之後再補

三語的**程式與資料結構一次做完**，但實際內容允許只有中文。

- `config.i18n.languages` 每個語言有 `enabled` 開關：
  ```jsonc
  "languages": [
    { "code": "zh-Hant", "label": "繁體中文", "enabled": true },
    { "code": "en",    "label": "English",  "enabled": false },
    { "code": "ja",    "label": "日本語",   "enabled": false }
  ]
  ```
  → 英日文還沒翻好時設 `false`，語言切換器就只顯示中文；翻完改成 `true` 即可上線，不用改程式。
- 缺欄位一律 fallback 到 `fallbackLang`（zh），不會出現空白或 `undefined`
- `<html lang>` 動態切換；語言優先序：URL `?lang=ja` → localStorage → 瀏覽器語言 → `defaultLang`
- 切換語言不重整頁面，重新 render 即可
- 後台會統計「未翻譯欄位數」並可一鍵跳到缺漏處，方便之後補譯
- SEO：只對 `enabled` 的語言輸出 hreflang

---

## 10. SEO、分享頁與 GA

### 10.1 為什麼分享頁必須是「實體 HTML 檔」
Facebook、LINE、X、Threads 的爬蟲**不執行 JavaScript**。純 SPA 的 hash route 分享出去，預覽圖與標題會全部一樣。
所以每個要被分享的對象都要有一個真實存在的 `index.html`，裡面直接寫死該對象的 meta。

### 10.2 需要分享頁的四種類型

| 類型 | 路徑 | 縮圖版型 |
|---|---|---|
| 講者 | `/2026/share/speakers/{id}/` | 號次 + 圓形頭像 + 姓名 + 議程名稱 |
| 工作人員 | `/2026/share/staff/{id}/` | 圓形頭像 + 姓名 + 志工職業 |
| 特別感謝 / 贊助 | `/2026/share/thanks/{id}/` | Logo 置中 + 名稱 + 群組名 |
| 活動擺攤 | `/2026/share/booths/{id}/` | Logo 置中 + 攤位名稱 + 群組名 |

全部共用同一套 stub 樣板與同一支產生腳本，只差資料來源與縮圖版型。

**主辦單位不做分享頁。** 它只有一到兩筆、內容穩定，
而且沒有人會單獨分享主辦單位連結——要分享會分享活動首頁。
省下這一組頁面與縮圖，也少一個要維護的 id 命名空間。
它的資料仍在 `content.organizers`，仍然有首頁卡片與詳細彈窗。

### 10.3 id 規則（同時是 slug）
- **統一小寫、底線分隔**：`andy_wang`、`gdg_kaohsiung`、`kotlin_tw`
- 允許字元：`a-z`、`0-9`、`_`
- 中文名稱由後台自動建議 id（英文名優先，沒有則音譯），可手動覆寫
- 唯一性檢查在**各類型內**（同類型不可重複；不同類型因為有路徑前綴，可以同名）
- 保留字擋掉：`data`、`css`、`js`、`images`、`share`、`speakers`、`staff`、`thanks`、`booths`、`about`

### 10.4 分享頁 stub 內容
每頁約 2–3 KB：

```html
<title>王小明 — GDG Kaohsiung 2026</title>
<meta name="description" content="議程名稱｜一句話介紹">
<link rel="canonical" href="https://gdgkh.cc/2026/share/speakers/andy_wang/">
<meta property="og:type" content="profile">
<meta property="og:title" content="王小明 — GDG Kaohsiung 2026">
<meta property="og:image" content="https://gdgkh.cc/2026/images/og/speakers/andy_wang.png">
<meta property="og:url" content="https://gdgkh.cc/2026/share/speakers/andy_wang/">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{ "@type": "Person", ... }</script>
```

`<body>` 內：
- 直接寫入純文字內容（姓名、介紹、議程名稱）給爬蟲與無 JS 環境，也是 SEO 內容
- 載入主站 JS，讀 JSON 後渲染完整站台並自動開啟對應的 DetailModal
- URL 用 `history.replaceState` 保持不變，不做 redirect（避免 SEO 權重流失）
- 附「回到活動首頁」連結

### 10.5 產生器 `2026/scripts/`

```bash
npm run generate:2026     # 一次產生 OG 圖 + 分享頁 + sitemap + robots
```

- **ESM `.mjs`**，與前端 module 語法一致
- 相依套件：`canvas`（已在 devDependencies，不新增套件）
- 核心是 `entity-types.mjs` 的設定表，四種類型共用同一條產生流程：

```js
export const ENTITY_TYPES = [
  {
    key: 'speakers',
    source: 'speakers',        // content.json 的欄位名
    ogLayout: 'person',
    ogType: 'profile',
    schema: 'Person',
    image: (item) => `images/speakers/${item.id}.jpg`,
    subtitle: (item, store) => store.firstSessionTitle(item),
  },
  // staff / thanks / booths 各一筆
];
```

- 新增第六種類型時只加一筆設定，產生器完全不用改
- 中文字型：`registerFont` 掛載 `assets/fonts/` 內的 Noto Sans TC
- 增量產生：內容 hash 比對，沒變的跳過
- 殘留偵測：列出 JSON 已刪除但資料夾還在的 id，只提示不自動刪
- 產完要跑 `npm run lint:fix` 與 `npm run format`，否則 CI 會擋

### 10.6 站台層級 SEO
- `sitemap.xml`：首頁 + 四種類型的所有分享頁，腳本產生
- `robots.txt`：允許全部，指向 sitemap
- 首頁 JSON-LD：`Event` schema（名稱、日期、地點、票券連結、performer 清單）
- 每頁 canonical、`hreflang`（只輸出 `enabled` 的語言）
- `404.html`：GitHub Pages 對未知路徑回傳它，用來把打錯的網址導回對應列表
- 圖片全部帶 `alt`、`loading="lazy"`
- 語意標籤：`<main> <section> <article> <time datetime="">`

### 10.7 GA4
- 用 `config.analytics.ga4Id` 動態注入 gtag（2025 已有帳號，沿用或另開 data stream 皆可）
- SPA 切換 section 要手動送 `page_view`（帶 `page_path`）
- 建議自訂事件：`select_speaker`、`select_session`、`click_ticket`、`change_language`、`share_page_entry`（從分享頁進站，帶類型與 id）

### 10.8 網域與部署
- repo 根目錄放 `CNAME`（內容：`gdgkh.cc`）
- `https://gdgkh.cc/` → 根目錄 `index.html` 以 meta refresh + canonical 導向 `/2026/`
- 去年頁面連結：`https://gdgkh.cc/2025/`

---

## 11. 後台管理網站（`2026/editor.html`）

### 定位
純前端單檔工具，不連任何後端與資料庫。**只做一件事：產生兩份 JSON。**

### 流程
1. 匯入：貼上現有 JSON 或選擇本機檔案（也可直接抓 GitHub raw URL）
2. 編輯：表單式，分頁對應 config / content 各區塊
3. 匯出：格式化 JSON，一鍵複製 / 下載 `.json`

### 功能清單
- 三語輸入：每個文字欄位有 zh / en / ja 三個 tab，未填會標紅
- 陣列項目：新增、刪除、拖曳排序（自動維護 `order`）
- 關聯選擇：講者選議程、議程選講者用下拉多選，不用手打 id
- 額外連結：動態新增列（platform 下拉 + URL + 顯示名）
- id 自動產生與唯一性檢查
- 即時預覽：右側 iframe 直接載入前台，套用當前草稿
- localStorage 自動存草稿，避免關掉分頁全沒了
- 驗證：必填欄位、URL 格式、圖片路徑是否符合命名規則、時間重疊警告
- 匯出前 diff：顯示與匯入版本的差異，方便你確認要 commit 什麼

### id 管理
- 四種分享類型（講者/工作人員/感謝/擺攤）每筆只有一個 id，同時當網址與圖片檔名；
  主辦單位也有 id，但只用於圖片檔名與彈窗
- 依名稱自動建議 id（小寫、底線分隔），可手動覆寫
- 即時檢查：格式、同類型內唯一性、保留字衝突
- 提醒：id 改動會連動網址、圖片檔名與所有交叉關聯，後台要一併更新並提示重跑產生器

> 分享頁與 OG 縮圖不由後台產生，交給年度目錄下的 node 腳本。後台維持單純：**只產生兩份 JSON**。
> 位置沿用 2025 慣例放在 `2026/editor.html`，可用 `npm run serve` 後在瀏覽器開啟。

---

## 12. 圖片規範

| 用途 | 尺寸 | 格式 | 命名 |
|---|---|---|---|
| 講者頭像 | 512×512 正方形 | jpg / webp | `images/speakers/{id}.jpg` |
| 工作人員 | 512×512 正方形 | jpg / webp | `images/staff/{id}.jpg` |
| 感謝 / 擺攤 / 主辦 logo | 長邊 ≤ 800，透明背景 | png / svg | `images/{type}/{id}.png` |
| 站台 OG 分享圖 | 1200×630 | png | `images/og.png` |
| 分享縮圖（四種類型） | 1200×630 | png | `images/og/{type}/{id}.png`（腳本產生） |

頭像 CSS：`aspect-ratio: 1/1; object-fit: cover; object-position: center;` — 你上傳正方形即可，非正方形也會自動置中裁切。

---

## 12.5 效能預算

靜態站沒有建置流程，圖片與字型是唯二會失控的地方，所以要有明確上限。

### 檔案大小上限
- 講者／工作人員頭像：單張 ≤ 120 KB（512×512，jpg 品質 80 或 webp）
- 感謝／擺攤／主辦 logo：單張 ≤ 60 KB（png，透明背景）
- OG 縮圖：單張 ≤ 200 KB（1200×630 png）
- 場地地圖：單張 ≤ 400 KB（這是唯一允許大檔的，因為要放大看）
- 單一頁面首次載入（不含圖片）：≤ 300 KB

### 圖片
- 全部加 `loading="lazy"`，但首屏的 Hero 圖例外，要用 `fetchpriority="high"`
- 每張 `<img>` 都要寫 `width` 與 `height` 屬性，避免版面位移（CLS）
- 講者頭像用 `decoding="async"`

### 字型
- `font-display: swap`，避免字型下載期間文字看不見
- `<link rel="preconnect">` 指向 `fonts.googleapis.com` 與 `fonts.gstatic.com`
- **只載一支顯示字體的 500 與 700 兩個字重**，其餘全走系統字體
- **不載任何中文 webfont**。中文字型檔動輒數 MB，是效能預算的最大威脅；
  中文一律使用系統既有字體

### 目標
Lighthouse 行動版效能 ≥ 90、CLS < 0.1、LCP < 2.5s。
上線前用手機實機在 4G 下測一次，不要只看桌機的數字。

---

## 12.6 上線前驗證清單

- [ ] Facebook 分享偵錯工具跑過四種分享頁各一個，確認縮圖與標題正確
- [ ] LINE 貼上連結確認預覽卡片
- [ ] Lighthouse 行動版四項分數
- [ ] 手機實機測試：iOS Safari 與 Android Chrome 各一次
- [ ] 375px 寬度下所有區塊不破版
- [ ] 三種語言各切一次，導覽列不換行、不裁切
- [ ] 鍵盤操作走完全站：Tab 能到所有可點擊元素、彈窗焦點不逃逸
- [ ] 開啟系統的「減少動態」後，跑馬燈停止、動畫消失
- [ ] `npm run lint` 與 `npm run format:check` 通過
- [ ] 所有外部連結實際點過一次（購票、表單、虛擬會場、去年頁面、行為準則）

---

## 13. 開發階段與任務對照

施工提示詞在另一份文件 `gdgkh-2026-build-prompts.md`，共 27 個任務。

| 階段 | 任務 | 內容 |
|---|---|---|
| 資料 | T01–T02 | config.json 與 content.json 假資料 |
| 樣式 | T03–T04 | 設計 token、基礎樣式 |
| 核心 | T05–T07 | i18n、store、dom |
| 元件 | T08–T09D | 詳細彈窗、卡片、圖片檢視器、感謝票、行事曆 |
| 區塊 | T10–T14E | 講者、議程與地圖、工作人員、感謝與擺攤、虛擬會場、活動介紹、首頁卡片、免費票、報名、跑馬燈 |
| 外殼 | T15–T17B | 導覽與溢出選單、GA、首頁與骨架、404 |
| 後台 | T18–T20 | 骨架、表單引擎、驗證與預覽 |
| 產生器 | T21–T22 | 類型設定表與 OG 繪圖、分享頁與 sitemap |

建議順序：先做 T01–T09D 打好地基（這些沒有 UI 也能驗），
再一次做完區塊層，最後做後台與產生器。
後台可以延後——手改 JSON 也能上線，後台是為了讓你之後改得舒服。

---

## 14. 決策紀錄

| 項目 | 決定 |
|---|---|
| 技術架構 | 純靜態、無建置（HTML/CSS/原生 JS） |
| 選舉風格強度 | 混合玩梗（大膽一點） |
| 多語言 | 架構三語齊備，內容先中文，英日以 `enabled` 開關後補 |
| 議程軌道 | 做成彈性：軌道數由 `tracks` 陣列決定，先以單軌開發 |
| 文字格式 | 純文字 + `\n` 換行，不做 Markdown |
| 特別感謝 / 贊助 | 同一區塊，用群組區分 |
| 網域 | `https://gdgkh.cc/2026/`，CNAME 與根目錄導向皆已就緒 |
| 語言鍵 | JSON 用 `zh-Hant` / `en` / `ja`（沿用既有專案） |
| 目錄慣例 | `css/`、`js/`、`data/`、`share/`，不用 `assets/` |
| 活動時間 | 2026-11-14（六）08:30（取自早鳥頁倒數設定） |
| 虛擬會場 | 獨立區塊 + 選單一項，從上線就開放，新分頁外連，不 iframe 嵌入 |
| 導覽列 | 保證單行：結構減量 + 流體字級（下限 14px）+ 量測式溢出選單；桌機門檻 1280px |
| 去年頁面／主辦單位 | 移出導覽列，改成首頁快速入口卡片，頁尾另留純文字連結 |
| 分享頁 | 講者/工作人員/感謝/擺攤 四種類型有實體頁 + OG 縮圖；主辦單位不做 |
| 識別碼 | 單一 `id`（小寫底線），同時是網址、圖片檔名與關聯鍵 |
| 產生方式 | `2026/scripts/generate.mjs`（ESM + 既有 canvas 套件），類型設定表驅動 |
| SEO / GA | sitemap、robots、JSON-LD、hreflang；GA4 ID 寫在 config |

## 15. 待確認問題

剩下的都是內容層面，不擋開工，可以邊做邊補：

1. 議程本身要不要也有分享頁？（`/2026/share/sessions/{id}/`）
2. 2025 講者資料有 `org`（公司）與 `title`（職稱），2026 要不要保留？目前規劃不做。
3. 購票平台是 KKTIX 還是其他？
4. 活動地點（早鳥頁的 `locationText` 是空的）。
5. 講者大約幾位、議程幾場？
6. GA4 沿用 2025 的 property 還是另開？我只要 ID 寫進 config。
7. Google Sans 的字型檔能不能從 GDG 品牌資源包取得？拿不到就用 Google Sans Flex。（見第 8 章）

---

## 附錄 A：早鳥頁資料備份

刪除早鳥頁前先存這裡，之後若需要可自行取用。

活動開始時間：`2026-11-14T08:30:00+08:00`（星期六）

四份意願問卷（Google Forms）：
- 講者意願：`https://forms.gle/B56e4iRz9BBe3R7W7`
- 志工意願：`https://forms.gle/CEkRWm7gd8u5RZYE7`
- 擺攤意願：`https://forms.gle/VX3vgjDoGt638cE56`
- 贊助意願：`https://forms.gle/NJ8DpfKGf5fGG6Mw9`

頁尾連結：GDG Kaohsiung 臉書社團 `https://www.facebook.com/groups/GDGKaohsiung`
