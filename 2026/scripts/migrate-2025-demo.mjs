#!/usr/bin/env node
/**
 * 一次性腳本：把 2025 站台的 speakers / staff / thanks / twm(booths) 資料
 * 轉譯成 2026 schema，覆寫進 data/content.json 對應區塊，
 * 順便從 2025/images/ 複製圖檔到 2026/images/{speakers,staff,thanks,booths}/。
 *
 * 只匯入 day 1（原 2025/11/22 場次），對應到 2026-11-14。
 * about / tracks / virtualSpace / venueMaps 為 2026 專屬區塊，保留不動。
 *
 * 用法：node scripts/migrate-2025-demo.mjs（於 2026/ 目錄下執行）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_2026 = path.resolve(__dirname, '..');
const ROOT_2025 = path.resolve(ROOT_2026, '..', '2025');

const DAY = '2026-11-14';

// --------------------------------------------------------------------------
// 讀來源

const speakers2025 = JSON.parse(fs.readFileSync(path.join(ROOT_2025, 'data/speakers.json'), 'utf8')).speakers;
const staff2025 = JSON.parse(fs.readFileSync(path.join(ROOT_2025, 'data/staff.json'), 'utf8')).staff;
const thanks2025 = JSON.parse(fs.readFileSync(path.join(ROOT_2025, 'data/thanks.json'), 'utf8')).thanks;
const booths2025 = JSON.parse(fs.readFileSync(path.join(ROOT_2025, 'data/twm.json'), 'utf8')).booths;
const community2025 = JSON.parse(fs.readFileSync(path.join(ROOT_2025, 'data/community.json'), 'utf8')).community;

const contentPath = path.join(ROOT_2026, 'data/content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// --------------------------------------------------------------------------
// 工具

function toI18n(obj) {
  if (!obj || typeof obj !== 'object') {
    return null;
  }
  const out = {};
  if (typeof obj.zh === 'string' && obj.zh.length > 0) {
    out['zh-Hant'] = obj.zh;
  }
  if (typeof obj.en === 'string' && obj.en.length > 0) {
    out.en = obj.en;
  }
  if (typeof obj.ja === 'string' && obj.ja.length > 0) {
    out.ja = obj.ja;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function guessPlatform(key) {
  const k = key.toLowerCase();
  if (k === 'x' || k.includes('twitter')) {
    return 'twitter';
  }
  if (k.includes('facebook')) {
    return 'facebook';
  }
  if (k.includes('instagram')) {
    return 'instagram';
  }
  if (k.includes('linkedin')) {
    return 'linkedin';
  }
  if (k.includes('github')) {
    return 'github';
  }
  if (k.includes('medium')) {
    return 'medium';
  }
  if (k.includes('youtube')) {
    return 'youtube';
  }
  if (k.includes('homepage') || k.includes('website')) {
    return 'website';
  }
  return 'link';
}

function socialToLinks(social) {
  if (!social || typeof social !== 'object') {
    return [];
  }
  const out = [];
  for (const [key, url] of Object.entries(social)) {
    if (typeof url !== 'string' || url.length === 0) {
      continue;
    }
    out.push({
      platform: guessPlatform(key),
      label: { 'zh-Hant': key },
      url,
    });
  }
  return out;
}

function topicToGroupId(topicZh) {
  if (typeof topicZh !== 'string') {
    return null;
  }
  if (topicZh.includes('Gemini')) {
    return 'gemini_ai';
  }
  if (topicZh.includes('Cloud')) {
    return 'google_cloud';
  }
  if (topicZh.includes('科技向善')) {
    return 'goodness';
  }
  if (topicZh.includes('說書人')) {
    return 'storyteller';
  }
  return null;
}

// --------------------------------------------------------------------------
// sessionGroups（day 1 用到的 4 組，去掉 day 2 的「AI 生成大賽」）

const newSessionGroups = [
  {
    id: 'gemini_ai',
    order: 1,
    name: {
      'zh-Hant': 'Gemini AI 的生成式實踐',
      en: 'Gemini AI in Practice',
      ja: 'Gemini AI の生成AI実践',
    },
    color: '#4285f4',
  },
  {
    id: 'google_cloud',
    order: 2,
    name: {
      'zh-Hant': 'Google Cloud 的雲端實踐',
      en: 'Google Cloud in Practice',
      ja: 'Google Cloud のクラウド実践',
    },
    color: '#34a853',
  },
  {
    id: 'goodness',
    order: 3,
    name: {
      'zh-Hant': '科技向善的實踐之路',
      en: 'Goodness in Practice',
      ja: 'テクノロジーで社会貢献を実現する道',
    },
    color: '#f9ab00',
  },
  {
    id: 'storyteller',
    order: 4,
    name: {
      'zh-Hant': '中午說書人',
      en: 'Midday Storyteller',
      ja: '昼の語り手',
    },
    color: '#ea4335',
  },
];

// --------------------------------------------------------------------------
// 議程時段骨架（day 1，對照 2025/index.html:1145 起）

const daySlots = [
  {
    id: 'd1_t1',
    trackId: 'track_1',
    type: 'break',
    start: `${DAY}T08:30`,
    end: `${DAY}T09:00`,
    title: { 'zh-Hant': '開放報到', en: 'Registration', ja: '受付開始' },
  },
  {
    id: 'd1_t2',
    trackId: 'track_1',
    type: 'opening',
    start: `${DAY}T09:00`,
    end: `${DAY}T09:40`,
    title: { 'zh-Hant': '活動開幕', en: 'Opening', ja: '開会式' },
  },
  {
    id: 'd1_t4_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T10:00`,
    end: `${DAY}T10:40`,
    title: {
      'zh-Hant': '誠研創新議程',
      en: 'Legend Innovation Schedule',
      ja: 'Legend Innovation スケジュール',
    },
  },
  {
    id: 'd1_t5_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T11:00`,
    end: `${DAY}T11:40`,
    title: { 'zh-Hant': '議程 2-1', en: 'Session 2-1', ja: 'セッション2-1' },
  },
  {
    id: 'd1_t5_s2',
    trackId: 'track_2',
    type: 'talk',
    start: `${DAY}T11:00`,
    end: `${DAY}T11:40`,
    title: { 'zh-Hant': '議程 2-2', en: 'Session 2-2', ja: 'セッション2-2' },
  },
  {
    id: 'd1_t11_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T12:30`,
    end: `${DAY}T13:15`,
    title: { 'zh-Hant': '中午說書人', en: 'Midday Storyteller', ja: '昼の語り手' },
  },
  {
    id: 'd1_t6_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T13:30`,
    end: `${DAY}T14:10`,
    title: { 'zh-Hant': '議程 3-1', en: 'Session 3-1', ja: 'セッション3-1' },
  },
  {
    id: 'd1_t6_s2',
    trackId: 'track_2',
    type: 'talk',
    start: `${DAY}T13:30`,
    end: `${DAY}T14:10`,
    title: { 'zh-Hant': '議程 3-2', en: 'Session 3-2', ja: 'セッション3-2' },
  },
  {
    id: 'd1_t7_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T14:30`,
    end: `${DAY}T15:10`,
    title: { 'zh-Hant': '議程 4-1', en: 'Session 4-1', ja: 'セッション4-1' },
  },
  {
    id: 'd1_t7_s2',
    trackId: 'track_2',
    type: 'talk',
    start: `${DAY}T14:30`,
    end: `${DAY}T15:10`,
    title: { 'zh-Hant': '議程 4-2', en: 'Session 4-2', ja: 'セッション4-2' },
  },
  {
    id: 'd1_t8',
    trackId: 'track_1',
    type: 'break',
    start: `${DAY}T15:10`,
    end: `${DAY}T15:30`,
    title: {
      'zh-Hant': 'Pizza Time & 交流時間',
      en: 'Pizza Time & Networking',
      ja: 'ピザタイム＆交流時間',
    },
  },
  {
    id: 'd1_t9_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T15:30`,
    end: `${DAY}T16:10`,
    title: { 'zh-Hant': '議程 5-1', en: 'Session 5-1', ja: 'セッション5-1' },
  },
  {
    id: 'd1_t9_s2',
    trackId: 'track_2',
    type: 'talk',
    start: `${DAY}T15:30`,
    end: `${DAY}T16:10`,
    title: { 'zh-Hant': '議程 5-2', en: 'Session 5-2', ja: 'セッション5-2' },
  },
  {
    id: 'd1_t10_s1',
    trackId: 'track_1',
    type: 'talk',
    start: `${DAY}T16:30`,
    end: `${DAY}T17:10`,
    title: { 'zh-Hant': '議程 6-1', en: 'Session 6-1', ja: 'セッション6-1' },
  },
  {
    id: 'd1_t11',
    trackId: 'track_1',
    type: 'closing',
    start: `${DAY}T17:30`,
    end: `${DAY}T18:00`,
    title: { 'zh-Hant': '活動閉幕', en: 'Closing', ja: '閉会式' },
  },
  {
    id: 'd1_t12',
    trackId: 'track_1',
    type: 'break',
    start: `${DAY}T19:00`,
    end: `${DAY}T21:00`,
    title: {
      'zh-Hant': 'After Buffet',
      en: 'After Buffet',
      ja: 'アフタービュッフェ',
    },
  },
];

// --------------------------------------------------------------------------
// 講者：只取 day 1

const day1Speakers = speakers2025.filter((s) => s.schedule && s.schedule.day === 1);

// 建立 session_id → speakers 對應表（2025 的 session_id 有 _title 後綴）
const sessionIdToSpeakers = new Map();
for (const s of day1Speakers) {
  const key = String(s.schedule.session_id).replace(/_title$/, '');
  if (!sessionIdToSpeakers.has(key)) {
    sessionIdToSpeakers.set(key, []);
  }
  sessionIdToSpeakers.get(key).push(s);
}

const newSpeakers = day1Speakers.map((s, idx) => {
  const sessionKey = String(s.schedule.session_id).replace(/_title$/, '');
  const speaker = {
    id: s.id,
    order: idx + 1,
    name: toI18n(s.name) || { 'zh-Hant': s.id },
    sessionIds: [sessionKey],
    links: socialToLinks(s.social),
  };
  const org = toI18n(s.org);
  const title = toI18n(s.title);
  const bio = toI18n(s.bio);
  if (org) {
    speaker.org = org;
  }
  if (title) {
    speaker.title = title;
  }
  if (bio) {
    speaker.bio = bio;
  }
  return speaker;
});

// --------------------------------------------------------------------------
// 議程

const newSessions = daySlots.map((slot) => {
  const speakers = sessionIdToSpeakers.get(slot.id) || [];
  const firstSpeaker = speakers[0];
  const sessionTitle = (firstSpeaker && toI18n(firstSpeaker.session && firstSpeaker.session.name)) || slot.title;
  const sessionAbstract = (firstSpeaker && toI18n(firstSpeaker.session && firstSpeaker.session.abstract)) || {
    'zh-Hant': '議程資訊即將公布。',
  };
  const session = {
    id: slot.id,
    trackId: slot.trackId,
    title: sessionTitle,
    abstract: sessionAbstract,
    tags: firstSpeaker && Array.isArray(firstSpeaker.tags) ? firstSpeaker.tags : [],
    speakerIds: speakers.map((s) => s.id),
    start: slot.start,
    end: slot.end,
    type: slot.type,
    links: [],
  };
  const gid = firstSpeaker && topicToGroupId(firstSpeaker.topic_category && firstSpeaker.topic_category.zh);
  if (gid) {
    session.groupId = gid;
  }
  return session;
});

// --------------------------------------------------------------------------
// 贊助 thanks

const newThanksGroups = [
  {
    id: 'partner',
    order: 1,
    name: { 'zh-Hant': '合作夥伴', en: 'Partners', ja: 'パートナー' },
  },
  {
    id: 'company',
    order: 2,
    name: { 'zh-Hant': '公司贊助', en: 'Company Sponsorship', ja: '企業スポンサー' },
  },
  {
    id: 'personal',
    order: 3,
    name: { 'zh-Hant': '個人贊助', en: 'Personal Sponsorship', ja: '個人スポンサー' },
  },
];

function thanksGroupFor(entry) {
  if (entry.type === 'company') {
    return 'company';
  }
  if (entry.type === 'personal') {
    return 'personal';
  }
  return 'partner';
}

const newThanks = thanks2025.map((entry, idx) => {
  const links = socialToLinks(entry.social);
  if (typeof entry.website === 'string' && entry.website.length > 0) {
    if (!links.some((l) => l.url === entry.website)) {
      links.unshift({
        platform: 'website',
        label: { 'zh-Hant': '官方網站', en: 'Website', ja: '公式サイト' },
        url: entry.website,
      });
    }
  }
  const t = {
    id: entry.id,
    groupId: thanksGroupFor(entry),
    order: idx + 1,
    name: toI18n(entry.name) || { 'zh-Hant': entry.id },
    marquee: true,
    links,
  };
  const desc = toI18n(entry.description);
  if (desc) {
    t.description = desc;
  }
  return t;
});

// --------------------------------------------------------------------------
// 攤位 booths

const newBoothGroups = [
  {
    id: 'community',
    order: 1,
    name: { 'zh-Hant': '社群攤位', en: 'Community Booths', ja: 'コミュニティブース' },
  },
  {
    id: 'sponsor',
    order: 2,
    name: { 'zh-Hant': '贊助攤位', en: 'Sponsor Booths', ja: 'スポンサーブース' },
  },
];

function boothFromEntry(entry, order) {
  const links = socialToLinks(entry.social);
  if (typeof entry.website === 'string' && entry.website.length > 0) {
    if (!links.some((l) => l.url === entry.website)) {
      links.unshift({
        platform: 'website',
        label: { 'zh-Hant': '官方網站', en: 'Website', ja: '公式サイト' },
        url: entry.website,
      });
    }
  }
  const b = {
    id: entry.id,
    groupId: 'community',
    order,
    name: toI18n(entry.name) || { 'zh-Hant': entry.id },
    links,
  };
  const desc = toI18n(entry.description);
  if (desc) {
    b.description = desc;
  }
  return b;
}

const day1Communities = community2025.filter((c) => {
  const cats = c.category && c.category.zh;
  return Array.isArray(cats) && cats.some((label) => typeof label === 'string' && label.includes('第一天'));
});

const seenBoothIds = new Set();
const newBooths = [];
for (const entry of booths2025) {
  if (seenBoothIds.has(entry.id)) {
    continue;
  }
  seenBoothIds.add(entry.id);
  newBooths.push(boothFromEntry(entry, newBooths.length + 1));
}
for (const entry of day1Communities) {
  if (seenBoothIds.has(entry.id)) {
    continue;
  }
  seenBoothIds.add(entry.id);
  newBooths.push(boothFromEntry(entry, newBooths.length + 1));
}

// --------------------------------------------------------------------------
// 工作人員 staff（只取第一天有出現的）

const day1Staff = staff2025.filter((s) => {
  const cat = s.category && (s.category.zh || s.category.en);
  return typeof cat === 'string' && (cat.includes('第一天') || /\bDay\s*1\b/i.test(cat));
});

const newStaff = day1Staff.map((s, idx) => {
  const person = {
    id: s.id,
    order: idx + 1,
    name: toI18n(s.name) || { 'zh-Hant': s.id },
    links: socialToLinks(s.social),
  };
  const role = toI18n(s.category);
  const bio = toI18n(s.description);
  if (role) {
    person.role = role;
  }
  if (bio) {
    person.bio = bio;
  }
  return person;
});

// --------------------------------------------------------------------------
// 寫回 content.json

content.sessionGroups = newSessionGroups;
content.speakers = newSpeakers;
content.sessions = newSessions;
content.staff = newStaff;
content.thanksGroups = newThanksGroups;
content.thanks = newThanks;
content.boothGroups = newBoothGroups;
content.booths = newBooths;

fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
console.warn(`✔ 已覆寫 ${path.relative(ROOT_2026, contentPath)}`);

// --------------------------------------------------------------------------
// 複製圖檔

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function tryCopy(sourceRel, destAbs, label) {
  const source = path.join(ROOT_2025, sourceRel);
  if (!fs.existsSync(source)) {
    console.warn(`  ⚠ ${label}：找不到來源 ${sourceRel}`);
    return false;
  }
  ensureDir(path.dirname(destAbs));
  fs.copyFileSync(source, destAbs);
  return true;
}

const copied = { speakers: 0, staff: 0, thanks: 0, booths: 0 };

for (const s of day1Speakers) {
  if (typeof s.photo !== 'string' || s.photo.length === 0) {
    continue;
  }
  if (tryCopy(s.photo, path.join(ROOT_2026, `images/speakers/${s.id}.jpg`), `speaker ${s.id}`)) {
    copied.speakers += 1;
  }
}

for (const s of day1Staff) {
  if (typeof s.photo !== 'string' || s.photo.length === 0) {
    continue;
  }
  if (tryCopy(s.photo, path.join(ROOT_2026, `images/staff/${s.id}.jpg`), `staff ${s.id}`)) {
    copied.staff += 1;
  }
}

for (const entry of thanks2025) {
  if (typeof entry.logo !== 'string' || entry.logo.length === 0) {
    continue;
  }
  if (tryCopy(entry.logo, path.join(ROOT_2026, `images/thanks/${entry.id}.png`), `thanks ${entry.id}`)) {
    copied.thanks += 1;
  }
}

const boothImageSources = new Map();
for (const entry of booths2025) {
  boothImageSources.set(entry.id, entry.logo);
}
for (const entry of day1Communities) {
  if (!boothImageSources.has(entry.id)) {
    boothImageSources.set(entry.id, entry.logo);
  }
}
for (const [id, logo] of boothImageSources) {
  if (typeof logo !== 'string' || logo.length === 0) {
    continue;
  }
  if (tryCopy(logo, path.join(ROOT_2026, `images/booths/${id}.png`), `booth ${id}`)) {
    copied.booths += 1;
  }
}

console.warn(
  `✔ 圖檔複製：speakers=${copied.speakers}, staff=${copied.staff}, thanks=${copied.thanks}, booths=${copied.booths}`
);
console.warn(
  `✔ 匯入筆數：speakers=${newSpeakers.length}, sessions=${newSessions.length}, staff=${newStaff.length}, thanks=${newThanks.length}, booths=${newBooths.length}`
);
