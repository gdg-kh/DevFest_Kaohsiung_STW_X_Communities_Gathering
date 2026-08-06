import { el, clear, mount } from '../core/dom.js';
import { t, getEnabledLangs, setLang, getLang } from '../core/i18n.js';
import { getConfig } from '../core/store.js';
import { track } from '../core/analytics.js';

const DESKTOP_MEDIA = '(min-width: 1280px)';
const OVERFLOW_BUFFER = 16;

let navRootEl = null;
let mainListEl = null;
let moreButtonEl = null;
let moreListEl = null;
let ctaAnchorEl = null;
let langSwitcherEl = null;
let overflowInitialized = false;
let currentSectionId = '';

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function sortedMenuItems() {
  const config = getConfig();
  const menu = config && Array.isArray(config.menu) ? config.menu : [];
  return menu
    .filter((item) => item && item.enabled !== false)
    .slice()
    .sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
}

function isNavItem(item) {
  return !item.placement || item.placement === 'nav';
}

function isFooterMenuItem(item) {
  return item.placement === 'footer' || item.placement === 'home';
}

function makeNavButton(item) {
  const label = t(item.label);
  const btn = el('button', {
    class: 'gk-nav-item',
    text: label,
    attrs: { type: 'button', 'data-menu-id': item.id },
  });
  btn.addEventListener('click', () => {
    navigateTo(item.id);
  });
  return btn;
}

function makeExternalLink(item) {
  const label = t(item.label);
  const url = typeof item.url === 'string' ? item.url : '';
  if (url.length === 0) {
    return null;
  }
  return el('a', {
    class: 'gk-nav-item gk-nav-item-external',
    text: label,
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'data-menu-id': item.id,
    },
  });
}

function makeCtaLink(item) {
  const label = t(item.label);
  const url = typeof item.url === 'string' ? item.url : '';
  if (url.length === 0) {
    return null;
  }
  const link = el('a', {
    class: 'gk-nav-cta',
    text: label,
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  link.addEventListener('click', () => {
    track('click_ticket', { entry: 'nav' });
  });
  return link;
}

function makeLangSwitcher() {
  const langs = getEnabledLangs();
  if (!Array.isArray(langs) || langs.length < 2) {
    return null;
  }
  const wrapper = el('div', { class: 'gk-nav-langs', attrs: { role: 'group' } });
  const current = getLang();
  for (const lang of langs) {
    const short = shortLangLabel(lang.code);
    const btn = el('button', {
      class: lang.code === current ? 'gk-nav-lang gk-nav-lang-active' : 'gk-nav-lang',
      text: short,
      attrs: {
        type: 'button',
        'data-lang': lang.code,
        'aria-pressed': lang.code === current ? 'true' : 'false',
      },
    });
    btn.addEventListener('click', () => {
      setLang(lang.code);
      track('change_language', { lang: lang.code });
    });
    mount(wrapper, btn);
  }
  return wrapper;
}

function shortLangLabel(code) {
  if (code === 'zh-Hant') {
    return '中';
  }
  if (code === 'en') {
    return 'EN';
  }
  if (code === 'ja') {
    return '日';
  }
  return code;
}

function makeMoreButton() {
  const label = uiLabel('navMoreLabel');
  const btn = el('button', {
    class: 'gk-nav-more',
    text: label,
    attrs: {
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      hidden: 'hidden',
    },
  });
  return btn;
}

function makeMoreList() {
  return el('div', {
    class: 'gk-nav-more-list',
    attrs: { role: 'menu', hidden: 'hidden' },
  });
}

function toggleMoreOpen(open) {
  if (!moreButtonEl || !moreListEl) {
    return;
  }
  const isOpen = open === undefined ? moreListEl.hasAttribute('hidden') : open;
  if (isOpen) {
    moreListEl.removeAttribute('hidden');
    moreButtonEl.setAttribute('aria-expanded', 'true');
  } else {
    moreListEl.setAttribute('hidden', 'hidden');
    moreButtonEl.setAttribute('aria-expanded', 'false');
  }
}

function handleGlobalClickForMore(event) {
  if (!moreListEl || moreListEl.hasAttribute('hidden')) {
    return;
  }
  if (moreListEl.contains(event.target) || (moreButtonEl && moreButtonEl.contains(event.target))) {
    return;
  }
  toggleMoreOpen(false);
}

function handleGlobalKeydownForMore(event) {
  if (event.key === 'Escape') {
    toggleMoreOpen(false);
  }
}

export function renderNav(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-nav');
  navRootEl = container;

  const wrapper = el('div', { class: 'gk-nav-wrapper' });
  mainListEl = el('div', { class: 'gk-nav-list', attrs: { role: 'menubar' } });
  moreButtonEl = makeMoreButton();
  moreListEl = makeMoreList();
  moreButtonEl.addEventListener('click', () => toggleMoreOpen());

  mount(wrapper, mainListEl);
  const moreWrapper = el('div', { class: 'gk-nav-more-wrapper' });
  mount(moreWrapper, moreButtonEl);
  mount(moreWrapper, moreListEl);
  mount(wrapper, moreWrapper);
  mount(container, wrapper);

  const items = sortedMenuItems().filter(isNavItem);
  const ctaItems = [];
  const normalItems = [];
  for (const item of items) {
    if (item.type === 'cta') {
      ctaItems.push(item);
    } else {
      normalItems.push(item);
    }
  }

  for (const item of normalItems) {
    let node;
    if (item.type === 'external') {
      node = makeExternalLink(item);
    } else {
      node = makeNavButton(item);
    }
    if (node) {
      mount(mainListEl, node);
    }
  }

  ctaAnchorEl = null;
  for (const item of ctaItems) {
    const cta = makeCtaLink(item);
    if (cta) {
      ctaAnchorEl = cta;
      mount(wrapper, cta);
    }
  }

  langSwitcherEl = makeLangSwitcher();
  if (langSwitcherEl) {
    mount(wrapper, langSwitcherEl);
  }
}

function makeFooterLinks(config) {
  const links = config && config.footer && Array.isArray(config.footer.links) ? config.footer.links : [];
  if (links.length === 0) {
    return null;
  }
  const wrapper = el('div', { class: 'gk-footer-links' });
  for (const link of links) {
    const label = t(link.label) || link.platform;
    const url = typeof link.url === 'string' ? link.url : '';
    if (url.length === 0) {
      continue;
    }
    mount(
      wrapper,
      el('a', {
        class: 'gk-footer-link',
        text: label,
        attrs: {
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      })
    );
  }
  if (wrapper.childNodes.length === 0) {
    return null;
  }
  return wrapper;
}

function makeFooterSecondary() {
  const items = sortedMenuItems().filter(isFooterMenuItem);
  if (items.length === 0) {
    return null;
  }
  const wrapper = el('div', { class: 'gk-footer-secondary' });
  for (const item of items) {
    const label = t(item.label);
    if (item.type === 'external' || item.placement === 'footer') {
      const url = typeof item.url === 'string' ? item.url : '';
      if (url.length === 0) {
        continue;
      }
      mount(
        wrapper,
        el('a', {
          class: 'gk-footer-secondary-link',
          text: label,
          attrs: {
            href: url,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        })
      );
    } else {
      const btn = el('button', {
        class: 'gk-footer-secondary-link',
        text: label,
        attrs: { type: 'button' },
      });
      btn.addEventListener('click', () => navigateTo(item.id));
      mount(wrapper, btn);
    }
  }
  if (wrapper.childNodes.length === 0) {
    return null;
  }
  return wrapper;
}

function makeFooterCopyright(config) {
  const text = t(config && config.footer && config.footer.copyright);
  if (!text) {
    return null;
  }
  return el('p', { class: 'gk-footer-copyright', text });
}

export function renderFooter(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-footer');
  const config = getConfig();
  const links = makeFooterLinks(config);
  if (links) {
    mount(container, links);
  }
  const secondary = makeFooterSecondary();
  if (secondary) {
    mount(container, secondary);
  }
  const copyright = makeFooterCopyright(config);
  if (copyright) {
    mount(container, copyright);
  }
}

function collectMainItems() {
  const nodes = [];
  if (!mainListEl) {
    return nodes;
  }
  for (const child of Array.from(mainListEl.children)) {
    nodes.push(child);
  }
  return nodes;
}

function collectMoreItems() {
  const nodes = [];
  if (!moreListEl) {
    return nodes;
  }
  for (const child of Array.from(moreListEl.children)) {
    nodes.push(child);
  }
  return nodes;
}

function isDesktop() {
  return window.matchMedia(DESKTOP_MEDIA).matches;
}

function recomputeOverflow() {
  if (!mainListEl || !moreButtonEl || !moreListEl || !navRootEl) {
    return;
  }
  if (!isDesktop()) {
    for (const node of collectMoreItems()) {
      mainListEl.appendChild(node);
    }
    moreButtonEl.setAttribute('hidden', 'hidden');
    toggleMoreOpen(false);
    return;
  }
  for (const node of collectMoreItems()) {
    mainListEl.appendChild(node);
  }
  const wrapperWidth = mainListEl.parentElement.getBoundingClientRect().width;
  const ctaWidth = ctaAnchorEl ? ctaAnchorEl.getBoundingClientRect().width : 0;
  const langWidth = langSwitcherEl ? langSwitcherEl.getBoundingClientRect().width : 0;
  const moreWidth = moreButtonEl.getBoundingClientRect().width || 60;
  const usable = wrapperWidth - ctaWidth - langWidth - moreWidth - OVERFLOW_BUFFER;

  let used = 0;
  const items = collectMainItems();
  const overflow = [];
  for (const node of items) {
    const w = node.getBoundingClientRect().width;
    if (used + w > usable) {
      overflow.push(node);
    } else {
      used += w;
    }
  }
  for (const node of overflow) {
    moreListEl.appendChild(node);
  }
  if (overflow.length === 0) {
    moreButtonEl.setAttribute('hidden', 'hidden');
    toggleMoreOpen(false);
  } else {
    moreButtonEl.removeAttribute('hidden');
  }
}

export function initNavOverflow() {
  if (overflowInitialized || !mainListEl) {
    return;
  }
  overflowInitialized = true;
  let frame = 0;
  const schedule = () => {
    if (frame) {
      return;
    }
    frame = requestAnimationFrame(() => {
      frame = 0;
      recomputeOverflow();
    });
  };
  const wrapper = mainListEl.parentElement;
  if (typeof ResizeObserver === 'function' && wrapper) {
    const observer = new ResizeObserver(schedule);
    observer.observe(wrapper);
  }
  window.addEventListener('gk:langchange', schedule);
  document.addEventListener('click', handleGlobalClickForMore);
  document.addEventListener('keydown', handleGlobalKeydownForMore);
  schedule();
}

function findSection(sectionId) {
  return document.querySelector(`[data-section-id="${sectionId}"]`);
}

function showSectionDesktop(sectionId) {
  const sections = document.querySelectorAll('[data-section-id]');
  for (const node of sections) {
    if (node.getAttribute('data-section-id') === sectionId) {
      node.classList.remove('gk-section-hidden');
    } else {
      node.classList.add('gk-section-hidden');
    }
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function scrollToSectionMobile(sectionId) {
  const sections = document.querySelectorAll('[data-section-id]');
  for (const node of sections) {
    node.classList.remove('gk-section-hidden');
  }
  const target = findSection(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

export function navigateTo(sectionId) {
  if (typeof sectionId !== 'string' || sectionId.length === 0) {
    return;
  }
  currentSectionId = sectionId;
  const newHash = `#/${sectionId}`;
  if (window.location.hash !== newHash) {
    window.history.pushState({ sectionId }, '', newHash);
  }
  if (isDesktop()) {
    showSectionDesktop(sectionId);
    track('page_view', { page_path: `/2026/#/${sectionId}` });
  } else {
    scrollToSectionMobile(sectionId);
  }
  highlightActive(sectionId);
}

function highlightActive(sectionId) {
  const nodes = document.querySelectorAll('[data-menu-id]');
  for (const node of nodes) {
    if (node.getAttribute('data-menu-id') === sectionId) {
      node.classList.add('gk-nav-item-active');
    } else {
      node.classList.remove('gk-nav-item-active');
    }
  }
}

function getInitialSectionId() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/(.+)$/);
  if (match && match[1]) {
    const candidate = match[1];
    if (document.querySelector(`[data-section-id="${candidate}"]`)) {
      return candidate;
    }
  }
  const items = sortedMenuItems()
    .filter(isNavItem)
    .filter((i) => i.type !== 'cta');
  return items.length > 0 ? items[0].id : '';
}

function setupIntersectionHighlight() {
  const sections = Array.from(document.querySelectorAll('[data-section-id]'));
  if (sections.length === 0 || typeof IntersectionObserver !== 'function') {
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (isDesktop()) {
        return;
      }
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-section-id');
          if (id) {
            highlightActive(id);
          }
        }
      }
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  for (const section of sections) {
    observer.observe(section);
  }
}

function applyMode() {
  if (isDesktop()) {
    document.body.classList.add('gk-mode-desktop');
    document.body.classList.remove('gk-mode-mobile');
    if (currentSectionId) {
      showSectionDesktop(currentSectionId);
    }
  } else {
    document.body.classList.add('gk-mode-mobile');
    document.body.classList.remove('gk-mode-desktop');
    const sections = document.querySelectorAll('[data-section-id]');
    for (const node of sections) {
      node.classList.remove('gk-section-hidden');
    }
  }
  recomputeOverflow();
}

export function initNav() {
  window.addEventListener('popstate', () => {
    const id = getInitialSectionId();
    if (id) {
      currentSectionId = id;
      if (isDesktop()) {
        showSectionDesktop(id);
      } else {
        scrollToSectionMobile(id);
      }
      highlightActive(id);
    }
  });

  const mql = window.matchMedia(DESKTOP_MEDIA);
  const onChange = () => applyMode();
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(onChange);
  }

  currentSectionId = getInitialSectionId();
  applyMode();
  if (currentSectionId) {
    if (isDesktop()) {
      showSectionDesktop(currentSectionId);
    }
    highlightActive(currentSectionId);
  }
  setupIntersectionHighlight();
}
