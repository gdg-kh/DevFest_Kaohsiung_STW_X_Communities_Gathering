import { el, clear, mount } from './core/dom.js';
import { loadData, getConfig, getContent, getSpeakerById, assetPath } from './core/store.js';
import { initI18n, t } from './core/i18n.js';
import { initAnalytics, track } from './core/analytics.js';
import { renderNav, renderFooter, initNav, initNavOverflow } from './ui/nav.js';
import { openModal } from './ui/detail-modal.js';
import { createFreeTicketLink } from './ui/free-ticket.js';
import { renderAbout } from './sections/about.js';
import { renderRegistration } from './sections/registration.js';
import { renderSponsorMarquee } from './sections/sponsor-marquee.js';
import { renderHomeCards } from './sections/home-cards.js';
import { renderSpeakers } from './sections/speakers.js';
import { renderAgenda } from './sections/agenda.js';
import { renderVirtualSpace } from './sections/virtual-space.js';
import { renderStaff } from './sections/staff.js';
import { renderThanks, renderBooths } from './sections/logo-grid.js';

const DEFAULT_ERROR_TEXT = '網站載入失敗，請稍後再試。';
let countdownTimer = 0;

function byId(id) {
  return document.getElementById(id);
}

function findMenuItem(id) {
  const config = getConfig();
  const menu = config && Array.isArray(config.menu) ? config.menu : [];
  return menu.find((item) => item && item.id === id) || null;
}

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function renderSectionTitles() {
  const map = {
    'section-about-title': 'about',
    'section-speakers-title': 'speakers',
    'section-agenda-title': 'agenda',
    'section-virtual-title': 'virtual',
    'section-staff-title': 'staff',
    'section-thanks-title': 'thanks',
    'section-booths-title': 'booths',
  };
  for (const [elemId, menuId] of Object.entries(map)) {
    const node = byId(elemId);
    if (!node) {
      continue;
    }
    const item = findMenuItem(menuId);
    node.textContent = item ? t(item.label) : '';
  }
}

function renderHero() {
  const config = getConfig();
  const site = (config && config.site) || {};
  const titleNode = byId('gk-hero-title');
  if (titleNode) {
    titleNode.textContent = t(site.eventName);
  }
  const dateNode = byId('gk-hero-date');
  if (dateNode) {
    dateNode.textContent = typeof site.eventDate === 'string' ? site.eventDate : '';
  }
  const venueNode = byId('gk-hero-venue');
  if (venueNode) {
    venueNode.textContent = t(site.venue);
  }

  const actions = byId('gk-hero-actions');
  if (actions) {
    clear(actions);
    const ticket = findMenuItem('ticket');
    const ticketUrl = ticket && typeof ticket.url === 'string' ? ticket.url : '';
    if (ticketUrl.length > 0) {
      const link = el('a', {
        class: 'gk-hero-cta',
        text: t(ticket.label),
        attrs: {
          href: ticketUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      });
      link.addEventListener('click', () => {
        track('click_ticket', { entry: 'hero' });
      });
      mount(actions, link);
    }
    const freeLink = createFreeTicketLink('hero');
    if (freeLink) {
      mount(actions, freeLink);
    }
  }

  startCountdown();
}

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = 0;
  }
  const config = getConfig();
  const site = (config && config.site) || {};
  const start = typeof site.eventStart === 'string' ? site.eventStart : '';
  const node = byId('gk-hero-countdown');
  if (!node) {
    return;
  }
  if (start.length === 0) {
    clear(node);
    return;
  }
  const target = new Date(start).getTime();
  if (Number.isNaN(target)) {
    clear(node);
    return;
  }
  const tick = () => renderCountdownTick(node, target);
  tick();
  countdownTimer = window.setInterval(tick, 1000);
}

function renderCountdownTick(node, target) {
  const diff = target - Date.now();
  clear(node);
  if (diff <= 0) {
    const text = uiLabel('eventStartedText');
    if (text) {
      mount(node, el('span', { class: 'gk-countdown-started', text }));
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = 0;
    }
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    { value: days, key: 'countdownDays' },
    { value: hours, key: 'countdownHours' },
    { value: minutes, key: 'countdownMinutes' },
    { value: seconds, key: 'countdownSeconds' },
  ];
  for (const part of parts) {
    const wrapper = el('span', { class: 'gk-countdown-unit' });
    mount(wrapper, el('span', { class: 'gk-countdown-value', text: String(part.value) }));
    const label = uiLabel(part.key);
    if (label) {
      mount(wrapper, el('span', { class: 'gk-countdown-label', text: label }));
    }
    mount(node, wrapper);
  }
}

function applyMarqueePosition() {
  const config = getConfig();
  const marquee = config && config.sponsorMarquee;
  const container = byId('gk-sponsor-marquee');
  const registration = byId('gk-registration');
  if (!container || !registration || !marquee) {
    return;
  }
  const parent = registration.parentElement;
  if (!parent) {
    return;
  }
  if (marquee.position === 'afterHero') {
    parent.insertBefore(container, registration);
  }
}

function renderAll() {
  renderSectionTitles();
  renderHero();
  const nav = byId('gk-nav');
  if (nav) {
    renderNav(nav);
  }
  const registration = byId('gk-registration');
  if (registration) {
    renderRegistration(registration);
  }
  const about = byId('gk-about');
  if (about) {
    renderAbout(about);
  }
  applyMarqueePosition();
  const marquee = byId('gk-sponsor-marquee');
  if (marquee) {
    renderSponsorMarquee(marquee);
  }
  const homeCards = byId('gk-home-cards');
  if (homeCards) {
    renderHomeCards(homeCards);
  }
  const speakers = byId('gk-speakers');
  if (speakers) {
    renderSpeakers(speakers);
  }
  const agenda = byId('gk-agenda');
  if (agenda) {
    renderAgenda(agenda);
  }
  const virtual = byId('gk-virtual');
  if (virtual) {
    renderVirtualSpace(virtual);
  }
  const staff = byId('gk-staff');
  if (staff) {
    renderStaff(staff);
  }
  const thanks = byId('gk-thanks');
  if (thanks) {
    renderThanks(thanks);
  }
  const booths = byId('gk-booths');
  if (booths) {
    renderBooths(booths);
  }
  const footer = byId('gk-footer');
  if (footer) {
    renderFooter(footer);
  }
}

function findAutoOpenData(type, id) {
  const content = getContent();
  if (!content) {
    return null;
  }
  if (type === 'speakers') {
    return getSpeakerById(id);
  }
  const listKey = type;
  const list = Array.isArray(content[listKey]) ? content[listKey] : [];
  return list.find((item) => item && item.id === id) || null;
}

function buildAutoOpenPayload(type, item) {
  if (!item) {
    return null;
  }
  if (type === 'speakers') {
    return {
      image: assetPath('speakers', item.id),
      imageShape: 'circle',
      name: item.name,
      bio: item.bio,
      links: Array.isArray(item.links) ? item.links : [],
    };
  }
  if (type === 'staff') {
    return {
      image: assetPath('staff', item.id),
      imageShape: 'circle',
      name: item.name,
      subtitle: item.role,
      bio: item.bio,
      links: Array.isArray(item.links) ? item.links : [],
    };
  }
  if (type === 'thanks' || type === 'booths') {
    return {
      image: assetPath(type, item.id),
      imageShape: 'square',
      name: item.name,
      bio: item.description,
      links: Array.isArray(item.links) ? item.links : [],
    };
  }
  return null;
}

function handleAutoOpen() {
  const info = window.__GK_AUTO_OPEN;
  if (!info || typeof info !== 'object') {
    return;
  }
  const { type, id } = info;
  if (typeof type !== 'string' || typeof id !== 'string') {
    return;
  }
  const item = findAutoOpenData(type, id);
  if (!item) {
    return;
  }
  const payload = buildAutoOpenPayload(type, item);
  if (!payload) {
    return;
  }
  track('share_page_entry', { type, id });
  openModal(payload);
}

function clearSkeletons() {
  document.body.classList.remove('gk-loading');
  const skeletons = document.querySelectorAll('.gk-skeleton-grid, .gk-skeleton-list');
  for (const node of skeletons) {
    node.remove();
  }
}

function renderLoadError(err) {
  console.error('loadData failed', err);
  const config = getConfig();
  const ui = config && config.ui;
  const message = t(ui && ui.loadErrorText) || DEFAULT_ERROR_TEXT;
  const main = byId('gk-main');
  if (!main) {
    return;
  }
  clear(main);
  const wrap = el('div', { class: 'gk-load-error' });
  mount(wrap, el('p', { class: 'gk-load-error-message', text: message }));
  const btn = el('button', {
    class: 'gk-load-error-retry',
    text: '重新載入',
    attrs: { type: 'button' },
  });
  btn.addEventListener('click', () => window.location.reload());
  mount(wrap, btn);
  mount(main, wrap);
  document.body.classList.remove('gk-loading');
}

function applyTokenColorMetas() {
  const nodes = document.querySelectorAll('meta[data-gk-token-color]');
  if (nodes.length === 0) {
    return;
  }
  const styles = getComputedStyle(document.documentElement);
  for (const node of nodes) {
    const varName = node.getAttribute('data-gk-token-color');
    if (!varName) {
      continue;
    }
    const value = styles.getPropertyValue(varName).trim();
    if (value) {
      node.setAttribute('content', value);
    }
  }
}

async function bootstrap() {
  applyTokenColorMetas();
  let data;
  try {
    data = await loadData();
  } catch (err) {
    renderLoadError(err);
    return;
  }
  initI18n(data.config && data.config.i18n);
  initAnalytics(data.config && data.config.analytics && data.config.analytics.ga4Id);

  renderAll();
  initNav();
  initNavOverflow();
  clearSkeletons();
  handleAutoOpen();

  window.addEventListener('gk:langchange', () => {
    renderAll();
    initNavOverflow();
  });
}

bootstrap();
