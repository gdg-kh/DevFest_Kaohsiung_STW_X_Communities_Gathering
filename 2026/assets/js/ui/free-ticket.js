import { el } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig, getContent } from '../core/store.js';
import { openModal } from './detail-modal.js';
import { track } from '../core/analytics.js';

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function uiValue(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return ui && ui[key];
}

function joinI18nList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  const lines = [];
  for (const item of list) {
    const text = t(item);
    if (text) {
      lines.push(text);
    }
  }
  return lines.join('\n');
}

function joinNumberedList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  const lines = [];
  let index = 1;
  for (const item of list) {
    const text = t(item);
    if (text) {
      lines.push(`${index}. ${text}`);
      index += 1;
    }
  }
  return lines.join('\n');
}

export function isFreeTicketAvailable() {
  const config = getConfig();
  const ft = config && config.freeTicket;
  if (!ft || ft.enabled !== true) {
    return false;
  }
  if (typeof ft.formUrl !== 'string' || ft.formUrl.length === 0) {
    return false;
  }
  return true;
}

export function isFreeTicketClosed() {
  const config = getConfig();
  const ft = config && config.freeTicket;
  const closeAt = ft && ft.closeAt;
  if (typeof closeAt !== 'string' || closeAt.length === 0) {
    return false;
  }
  const ts = new Date(closeAt).getTime();
  if (Number.isNaN(ts)) {
    return false;
  }
  return ts < Date.now();
}

function buildMeta(freeTicket) {
  const meta = [];
  const eligibilityText = joinI18nList(freeTicket.eligibility);
  if (eligibilityText) {
    meta.push({
      label: uiValue('freeTicketEligibilityLabel'),
      value: { 'zh-Hant': eligibilityText },
    });
  }
  const processText = joinNumberedList(freeTicket.process);
  if (processText) {
    meta.push({
      label: uiValue('freeTicketProcessLabel'),
      value: { 'zh-Hant': processText },
    });
  }
  return meta;
}

function buildFooterAction(entry) {
  const config = getConfig();
  const ft = config && config.freeTicket;
  const closed = isFreeTicketClosed();
  const content = getContent();
  const contentFt = (content && content.freeTicket) || {};
  if (closed) {
    return {
      text: contentFt.closedText,
      disabled: true,
    };
  }
  return {
    text: uiValue('freeTicketFormButton'),
    url: ft.formUrl,
    onClick: () => {
      track('click_free_ticket_form', { entry });
    },
  };
}

function mergeNoticeIntoBio(notice, summary) {
  const noticeText = t(notice);
  const summaryText = t(summary);
  if (!noticeText) {
    return summary;
  }
  if (!summaryText) {
    return notice;
  }
  return { 'zh-Hant': `${noticeText}\n\n${summaryText}` };
}

export function openFreeTicketModal(entry) {
  if (!isFreeTicketAvailable()) {
    return;
  }
  track('open_free_ticket', { entry });

  const content = getContent();
  const freeTicket = (content && content.freeTicket) || {};
  const registration = (content && content.registration) || {};

  openModal({
    name: freeTicket.title,
    bio: mergeNoticeIntoBio(registration.orderNotice, freeTicket.summary),
    meta: buildMeta(freeTicket),
    sessionAbstract: freeTicket.notes,
    footerAction: buildFooterAction(entry),
  });
}

export function createFreeTicketLink(entry) {
  if (!isFreeTicketAvailable()) {
    return null;
  }
  const labelText = uiLabel('freeTicketLink');
  const link = el('a', {
    class: 'gk-free-ticket-link',
    text: labelText,
    attrs: {
      role: 'button',
      tabindex: '0',
      href: '#',
    },
  });
  const activate = (event) => {
    if (event) {
      event.preventDefault();
    }
    openFreeTicketModal(entry);
  };
  link.addEventListener('click', activate);
  link.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      openFreeTicketModal(entry);
    }
  });
  return link;
}
