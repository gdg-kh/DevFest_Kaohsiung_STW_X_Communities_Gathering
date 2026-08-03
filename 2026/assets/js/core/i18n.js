const STORAGE_KEY = 'gk_lang';
const DEFAULT_FALLBACK = 'zh-Hant';

let currentLang = DEFAULT_FALLBACK;
let fallbackLang = DEFAULT_FALLBACK;
let languages = [];

function isEnabled(code) {
  if (!code) {
    return false;
  }
  const match = languages.find((lang) => lang.code === code);
  return Boolean(match && match.enabled);
}

function matchNavigatorLang() {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return null;
  }
  const raw = String(navigator.language).toLowerCase();
  if (raw.startsWith('zh')) {
    return 'zh-Hant';
  }
  if (raw.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

function readQueryLang() {
  if (typeof window === 'undefined' || !window.location) {
    return null;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang');
  } catch {
    return null;
  }
}

function readStorageLang() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorageLang(code) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore
  }
}

function applyDocumentLang(code) {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = code;
  }
}

export function initI18n(configI18n) {
  const cfg = configI18n && typeof configI18n === 'object' ? configI18n : {};
  languages = Array.isArray(cfg.languages) ? cfg.languages.slice() : [];
  fallbackLang = typeof cfg.fallbackLang === 'string' && cfg.fallbackLang ? cfg.fallbackLang : DEFAULT_FALLBACK;
  const defaultLang = typeof cfg.defaultLang === 'string' && cfg.defaultLang ? cfg.defaultLang : fallbackLang;

  const queryLang = readQueryLang();
  if (queryLang && isEnabled(queryLang)) {
    currentLang = queryLang;
    applyDocumentLang(currentLang);
    return currentLang;
  }

  const storageLang = readStorageLang();
  if (storageLang && isEnabled(storageLang)) {
    currentLang = storageLang;
    applyDocumentLang(currentLang);
    return currentLang;
  }

  const navLang = matchNavigatorLang();
  if (navLang && isEnabled(navLang)) {
    currentLang = navLang;
    applyDocumentLang(currentLang);
    return currentLang;
  }

  currentLang = defaultLang;
  applyDocumentLang(currentLang);
  return currentLang;
}

export function t(i18nText) {
  if (i18nText === null || i18nText === undefined) {
    return '';
  }
  if (typeof i18nText === 'string') {
    return i18nText;
  }
  if (typeof i18nText !== 'object') {
    return '';
  }
  const value = i18nText[currentLang];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  const fallback = i18nText[fallbackLang];
  if (typeof fallback === 'string' && fallback.length > 0) {
    return fallback;
  }
  return '';
}

export function getLang() {
  return currentLang;
}

export function setLang(code) {
  if (typeof code !== 'string' || !code) {
    return;
  }
  currentLang = code;
  writeStorageLang(code);
  applyDocumentLang(code);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('gk:langchange', { detail: { lang: code } }));
  }
}

export function getEnabledLangs() {
  return languages
    .filter((lang) => lang && lang.enabled === true)
    .map((lang) => ({ code: lang.code, label: lang.label }));
}
