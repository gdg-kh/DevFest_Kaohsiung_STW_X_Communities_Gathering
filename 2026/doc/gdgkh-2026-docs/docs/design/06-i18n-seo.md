# 多國語言、SEO、分享頁、GA

> GDG Kaohsiung 2026 設計文件之一，完整索引見 `docs/design/README.md`

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
