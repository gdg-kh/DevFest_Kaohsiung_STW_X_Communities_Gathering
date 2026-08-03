import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig, getContent } from '../core/store.js';
import { isFreeTicketAvailable, isFreeTicketClosed, openFreeTicketModal } from '../ui/free-ticket.js';
import { track } from '../core/analytics.js';

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function getMenuUrl(id) {
  const config = getConfig();
  const menu = config && Array.isArray(config.menu) ? config.menu : [];
  for (const item of menu) {
    if (item && item.id === id) {
      return typeof item.url === 'string' ? item.url : '';
    }
  }
  return '';
}

function makeNotice(noticeText) {
  if (!noticeText) {
    return null;
  }
  return el('div', {
    class: 'gk-registration-notice gk-multiline',
    text: noticeText,
    attrs: { role: 'note' },
  });
}

function makeCollapsedFreeCard(closedText) {
  const card = el('article', {
    class: 'gk-registration-card gk-registration-card-free gk-registration-card-collapsed gk-registration-card-full',
  });
  mount(card, el('p', { class: 'gk-registration-card-closed', text: closedText }));
  return card;
}

function makeEligibilityList(eligibility) {
  if (!Array.isArray(eligibility) || eligibility.length === 0) {
    return null;
  }
  const list = el('ul', { class: 'gk-registration-eligibility' });
  const items = eligibility.slice(0, 3);
  for (const entry of items) {
    const text = t(entry);
    if (text) {
      mount(list, el('li', { text }));
    }
  }
  if (list.childNodes.length === 0) {
    return null;
  }
  return list;
}

function makeReviewNote() {
  const config = getConfig();
  const ui = config && config.ui;
  const template = t(ui && ui.freeTicketReviewNote);
  if (!template) {
    return null;
  }
  const days = config && config.freeTicket && config.freeTicket.reviewDays;
  const daysText = typeof days === 'number' ? String(days) : '';
  const rendered = template.replace('{days}', daysText);
  return el('p', { class: 'gk-registration-review-note', text: rendered });
}

function makeFreeButton() {
  const label = uiLabel('freeTicketCardButton');
  const btn = el('button', {
    class: 'gk-registration-button gk-registration-button-primary',
    text: label,
    attrs: { type: 'button' },
  });
  btn.addEventListener('click', () => {
    openFreeTicketModal('registration_card');
  });
  return btn;
}

function makeFreeCard() {
  const content = getContent();
  const ft = (content && content.freeTicket) || {};
  if (isFreeTicketClosed()) {
    return makeCollapsedFreeCard(t(ft.closedText));
  }
  const card = el('article', {
    class: 'gk-registration-card gk-registration-card-free',
  });
  const titleText = t(ft.title);
  if (titleText) {
    mount(card, el('h3', { class: 'gk-registration-card-title', text: titleText }));
  }
  const summaryText = t(ft.summary);
  if (summaryText) {
    mount(
      card,
      el('p', {
        class: 'gk-registration-card-summary gk-multiline',
        text: summaryText,
      })
    );
  }
  const eligibility = makeEligibilityList(ft.eligibility);
  if (eligibility) {
    mount(card, eligibility);
  }
  const reviewNote = makeReviewNote();
  if (reviewNote) {
    mount(card, reviewNote);
  }
  mount(card, makeFreeButton());
  return card;
}

function makeDirectButton() {
  const label = uiLabel('directTicketCardButton');
  const url = getMenuUrl('ticket');
  if (url.length === 0) {
    return el('button', {
      class: 'gk-registration-button gk-registration-button-disabled',
      text: label,
      attrs: {
        type: 'button',
        disabled: 'disabled',
        'aria-disabled': 'true',
      },
    });
  }
  const link = el('a', {
    class: 'gk-registration-button gk-registration-button-primary',
    text: label,
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  link.addEventListener('click', () => {
    track('click_ticket', { entry: 'registration_card' });
  });
  return link;
}

function makeDirectCard(fullWidth) {
  const card = el('article', {
    class: `gk-registration-card gk-registration-card-direct${fullWidth ? ' gk-registration-card-full' : ''}`,
  });
  const content = getContent();
  const registration = (content && content.registration) || {};
  const titleText = t(registration.directTitle);
  if (titleText) {
    mount(card, el('h3', { class: 'gk-registration-card-title', text: titleText }));
  }
  const summaryText = t(registration.directSummary);
  if (summaryText) {
    mount(
      card,
      el('p', {
        class: 'gk-registration-card-summary gk-multiline',
        text: summaryText,
      })
    );
  }
  mount(card, makeDirectButton());
  return card;
}

function makeCocLink() {
  const config = getConfig();
  const footer = config && config.footer;
  const coc = footer && footer.codeOfConduct;
  const url = coc && typeof coc.url === 'string' ? coc.url : '';
  if (url.length === 0) {
    return null;
  }
  const labelText = uiLabel('cocLinkText');
  if (!labelText) {
    return null;
  }
  const link = el('a', {
    class: 'gk-registration-coc',
    text: labelText,
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  link.addEventListener('click', () => {
    track('click_coc', { entry: 'registration' });
  });
  return el('p', { class: 'gk-registration-coc-wrap' }, link);
}

export function renderRegistration(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-registration-section');

  const content = getContent();
  const registration = (content && content.registration) || {};
  const noticeText = t(registration.orderNotice);
  const notice = makeNotice(noticeText);
  if (notice) {
    mount(container, notice);
  }

  const grid = el('div', { class: 'gk-registration-grid' });
  const freeAvailable = isFreeTicketAvailable();
  const freeClosed = freeAvailable && isFreeTicketClosed();
  const directFullWidth = !freeAvailable || freeClosed;
  if (freeAvailable) {
    mount(grid, makeFreeCard());
  }
  mount(grid, makeDirectCard(directFullWidth));
  mount(container, grid);

  const coc = makeCocLink();
  if (coc) {
    mount(container, coc);
  }
}
