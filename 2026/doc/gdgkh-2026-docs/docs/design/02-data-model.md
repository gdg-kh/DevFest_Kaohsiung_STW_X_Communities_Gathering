# 兩份 JSON 與核心資料模型

> GDG Kaohsiung 2026 設計文件之一，完整索引見 `docs/design/README.md`

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
