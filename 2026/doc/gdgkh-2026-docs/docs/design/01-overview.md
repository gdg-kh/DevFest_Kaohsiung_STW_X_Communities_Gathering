# 專案現況、目標、技術架構、檔案結構

> GDG Kaohsiung 2026 設計文件之一，完整索引見 `docs/design/README.md`

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
