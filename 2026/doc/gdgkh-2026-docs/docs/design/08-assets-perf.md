# 圖片規範、效能預算、上線驗證

> GDG Kaohsiung 2026 設計文件之一，完整索引見 `docs/design/README.md`

---

## 12. 圖片規範

| 用途 | 尺寸 | 格式 | 命名 |
|---|---|---|---|
| 講者頭像 | 512×512 正方形 | jpg / webp | `images/speakers/{id}.jpg` |
| 工作人員 | 512×512 正方形 | jpg / webp | `images/staff/{id}.jpg` |
| 感謝 / 擺攤 logo | 長邊 ≤ 800，透明背景 | png / svg | `images/{type}/{id}.png` |
| 站台 OG 分享圖 | 1200×630 | png | `images/og.png` |
| 分享縮圖（四種類型） | 1200×630 | png | `images/og/{type}/{id}.png`（腳本產生） |

頭像 CSS：`aspect-ratio: 1/1; object-fit: cover; object-position: center;` — 你上傳正方形即可，非正方形也會自動置中裁切。

---

## 12.5 效能預算

靜態站沒有建置流程，圖片與字型是唯二會失控的地方，所以要有明確上限。

### 檔案大小上限
- 講者／工作人員頭像：單張 ≤ 120 KB（512×512，jpg 品質 80 或 webp）
- 感謝／擺攤 logo：單張 ≤ 60 KB（png，透明背景）
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
