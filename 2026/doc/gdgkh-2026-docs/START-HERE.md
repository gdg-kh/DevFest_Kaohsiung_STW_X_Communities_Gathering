# GDG Kaohsiung 2026 官網 — 從這裡開始

## 這個壓縮檔裡有什麼

```
START-HERE.md                    ← 你正在看的這份
docs/
  README.md                      文件索引、規格對照表、Git Flow 流程
  build-tasks.mjs                施工單產生器（改規格後重跑）
  design/                        設計文件九份，給人看的規格與決策
  tasks/                         施工單 29 份，給模型吃的自足指令
2026/
  scripts/check.mjs              自動檢查腳本
package-scripts-snippet.json     要加進 package.json 的四個 script
gdgkh-2026-design-doc.md         設計文件完整版（design/ 的合併版）
gdgkh-2026-build-prompts.md      施工單完整版（tasks/ 的來源，改這份）
```

## 放進 repo 的方式

```bash
# 在 GdgkhCc repo 根目錄
git checkout develop
git checkout -b feature/docs-2026

# 解壓後複製
cp -r docs/ ./
cp -r 2026/scripts/ ./2026/
cp gdgkh-2026-design-doc.md gdgkh-2026-build-prompts.md ./docs/

# 把 package-scripts-snippet.json 的四個 script 手動併進 package.json
```

`START-HERE.md` 與 `package-scripts-snippet.json` 不用進 repo。

## 三步驟開工

**第一步：讀設計文件。** 至少讀 `docs/design/01-overview.md`（架構）
與 `docs/design/09-plan.md`（25 條決策紀錄與理由）。
其餘七份當參考，不用一次讀完。

**第二步：跑第一個任務。**

```bash
git checkout -b feature/T01-config-json
```

開一個新對話，把 `docs/tasks/T01-config-json.md` **整份**貼上。
不要再貼設計文件，施工單是自足的。

**第三步：驗收。**
施工單末尾有該任務專屬的驗收條件，逐條確認。
資料與程式碼類的可以直接跑：

```bash
npm run check:2026
```

通過後 commit、合回 develop，再切下一條分支。

## 三件最容易做錯的事

**不要一次做完全部任務。** 一個任務一條分支一個對話。
批次太大就失去對照驗收的能力，前面的偏差會污染後面。

**不要手動改 `docs/tasks/` 底下的檔案。**
那些是產生出來的。要改共用內容改 `gdgkh-2026-build-prompts.md`，
然後 `node docs/build-tasks.mjs` 重新產生。

**驗收失敗不要在同一個對話裡反覆修。**
先判斷是程式沒照做，還是規格本來就沒寫清楚。
是後者就改規格再開新對話重跑，同樣的錯才不會下次又發生。

## 還沒決定的事

見 `docs/design/09-plan.md` 第 15 節，七項，都不擋開工：
議程要不要分享頁、講者要不要公司職稱欄位、購票平台、活動地點、
講者與議程數量、GA4 property、Google Sans 字型檔能否取得。
