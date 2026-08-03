import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig, getContent, getSortedList, assetPath } from '../core/store.js';
import { logoCard } from '../ui/card.js';
import { openModal } from '../ui/detail-modal.js';
import { track } from '../core/analytics.js';
import { isFreeTicketAvailable, openFreeTicketModal } from '../ui/free-ticket.js';

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function getHomeMenuItems() {
  const config = getConfig();
  const menu = config && Array.isArray(config.menu) ? config.menu : [];
  return menu
    .filter((item) => item && item.placement === 'home' && item.enabled !== false)
    .slice()
    .sort((a, b) => {
      const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
}

function openOrganizerModal(org) {
  track('select_organizer', { organizer_id: org.id });
  openModal({
    image: assetPath('organizers', org.id),
    imageShape: 'square',
    name: org.name,
    bio: org.description,
    links: Array.isArray(org.links) ? org.links : [],
  });
}

function makeOrganizerCards() {
  const organizers = getSortedList('organizers');
  const cards = [];
  for (const org of organizers) {
    if (!org || typeof org.id !== 'string') {
      continue;
    }
    cards.push(
      logoCard({
        image: assetPath('organizers', org.id),
        name: org.name,
        description: org.description,
        onClick: () => openOrganizerModal(org),
      }),
    );
  }
  return cards;
}

function makeLastYearCard(menuItem) {
  const url = typeof menuItem.url === 'string' ? menuItem.url : '';
  if (url.length === 0) {
    return null;
  }
  const labelText = t(menuItem.label);
  const hintText = uiLabel('lastYearCardText');
  const card = el('a', {
    class: 'gk-card gk-home-external-card',
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  card.addEventListener('click', () => {
    track('click_last_year');
  });
  const body = el('div', { class: 'gk-card-body gk-card-body-center' });
  if (hintText) {
    mount(body, el('p', { class: 'gk-home-card-hint', text: hintText }));
  }
  if (labelText) {
    mount(body, el('h3', { class: 'gk-card-name', text: labelText }));
  }
  mount(card, body);
  return card;
}

function makeFreeTicketCard() {
  if (!isFreeTicketAvailable()) {
    return null;
  }
  const content = getContent();
  const ft = (content && content.freeTicket) || {};
  const titleText = t(ft.title);
  const summaryText = t(ft.summary);
  const card = el('article', {
    class: 'gk-card gk-home-free-ticket-card',
    attrs: {
      role: 'button',
      tabindex: '0',
    },
  });
  const activate = () => openFreeTicketModal('home_card');
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      activate();
    }
  });
  const body = el('div', { class: 'gk-card-body gk-card-body-center' });
  if (titleText) {
    mount(body, el('h3', { class: 'gk-card-name', text: titleText }));
  }
  if (summaryText) {
    mount(
      body,
      el('p', {
        class: 'gk-card-description gk-multiline',
        text: summaryText,
      }),
    );
  }
  mount(card, body);
  return card;
}

export function renderHomeCards(container) {
  if (!container) {
    return;
  }
  clear(container);

  const items = getHomeMenuItems();
  const cards = [];
  for (const item of items) {
    if (item.id === 'organizer') {
      const organizerCards = makeOrganizerCards();
      for (const card of organizerCards) {
        cards.push(card);
      }
    } else if (item.id === 'lastyear') {
      const card = makeLastYearCard(item);
      if (card) {
        cards.push(card);
      }
    }
  }
  const freeTicketCard = makeFreeTicketCard();
  if (freeTicketCard) {
    cards.push(freeTicketCard);
  }

  if (cards.length === 0) {
    return;
  }

  container.classList.add('gk-home-cards-section');
  const titleText = uiLabel('organizerCardTitle');
  if (titleText) {
    mount(container, el('h2', { class: 'gk-home-cards-title', text: titleText }));
  }
  const grid = el('div', { class: 'gk-home-cards-grid' });
  for (const card of cards) {
    mount(grid, card);
  }
  mount(container, grid);
}
