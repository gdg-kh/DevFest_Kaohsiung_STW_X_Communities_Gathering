#!/usr/bin/env node
/**
 * 從 gdgkh-2026-build-prompts.md 產生 docs/tasks/ 底下的自足施工單。
 *
 * 為什麼需要這支腳本：
 * 每份施工單都內嵌了共用前置（§A）、介面契約（§B）、JSON 範例（§C），
 * 這樣一份檔案貼上就能開工，但也代表這些內容有 31 份複本。
 * 要改共用內容時，**只改 gdgkh-2026-build-prompts.md，然後重跑這支腳本**，
 * 不要手動去改 tasks/ 底下的檔案。
 *
 * 用法：node docs/build-tasks.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'gdgkh-2026-build-prompts.md');
const OUT_DIR = path.join(__dirname, 'tasks');

// 不需要 JSON 範例的任務（純樣式或純工具，不碰資料結構）
const NO_DATA = new Set(['T03', 'T04', 'T07', 'T09B']);

// 任務 id 對應的分支 slug
const SLUG = {
  T01: 'config-json',
  T02: 'content-json',
  T03: 'design-tokens',
  T04: 'base-css',
  T05: 'i18n',
  T06: 'store',
  T07: 'dom-utils',
  T08: 'detail-modal',
  T09: 'cards',
  T09B: 'image-viewer',
  T09C: 'ballot-card',
  T09D: 'calendar',
  T10: 'speakers',
  T11: 'agenda',
  T12: 'staff',
  T13: 'logo-grid',
  T13B: 'virtual-space',
  T14: 'about',
  T14B: 'home-cards',
  T14C: 'free-ticket',
  T14D: 'registration',
  T14E: 'sponsor-marquee',
  T15: 'nav',
  T16: 'analytics',
  T17: 'index-main',
  T17B: '404',
  T18: 'editor-shell',
  T19: 'editor-forms',
  T20: 'editor-validate',
  T21: 'og-render',
  T22: 'generate',
};

const src = fs.readFileSync(SRC, 'utf8');

function section(startMark, endMark) {
  const i = src.indexOf(startMark);
  if (i < 0) {
    throw new Error(`找不到區段：${startMark}`);
  }
  const j = endMark ? src.indexOf(endMark) : src.length;
  return src.slice(i, j).trimEnd();
}

const COMMON = section('# §A 共用前置', '# §B 介面契約');
const CONTRACT = section('# §B 介面契約', '# §C JSON 範例');
const JSON_SAMPLE = section('# §C JSON 範例', '# §D 任務順序');
const CHECKLIST = section('# §E 驗收檢查清單', '# §F 小模型常見翻車點');
const PITFALLS = section('# §F 小模型常見翻車點');

const bodyStart = src.indexOf('# T01 ');
const bodyEnd = src.indexOf('# §E 驗收檢查清單');
const body = `\n${src.slice(bodyStart, bodyEnd)}`;

const parts = body.split(/\n# (T\d+[A-Z]?) ([^\n]+)\n/);
const tasks = [];
for (let i = 1; i < parts.length; i += 3) {
  tasks.push({
    id: parts[i],
    title: parts[i + 1],
    body: parts[i + 2].trim().replace(/-+$/, '').trim(),
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// 先清掉舊的施工單，避免任務改名後留下孤兒檔案
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith('.md')) {
    fs.unlinkSync(path.join(OUT_DIR, f));
  }
}

for (const task of tasks) {
  const slug = SLUG[task.id] || task.id.toLowerCase();
  const chunks = [
    `# ${task.id} ${task.title}`,
    '',
    '> 這是一個自足的施工單。**整份貼給模型即可**，不需要再貼別的文件。',
    `> 分支：\`feature/${task.id}-${slug}\`（從 \`develop\` 切出，完成後合回 \`develop\`）`,
    '>',
    '> 這個檔案由 `docs/build-tasks.mjs` 產生，**不要手動修改**。',
    '> 要改內容請改 `gdgkh-2026-build-prompts.md` 後重跑腳本。',
    '',
    '---',
    '',
    COMMON,
    '',
    '---',
    '',
    CONTRACT,
  ];

  if (!NO_DATA.has(task.id)) {
    chunks.push('', '---', '', JSON_SAMPLE);
  }

  chunks.push('', '---', '', '# 本次任務', '', task.body);
  chunks.push('', '---', '', CHECKLIST);
  chunks.push('', '---', '', PITFALLS, '');

  const filename = `${task.id}-${slug}.md`;
  fs.writeFileSync(path.join(OUT_DIR, filename), chunks.join('\n'));
}

console.warn(`已產生 ${tasks.length} 份施工單到 ${path.relative(ROOT, OUT_DIR)}/`);
