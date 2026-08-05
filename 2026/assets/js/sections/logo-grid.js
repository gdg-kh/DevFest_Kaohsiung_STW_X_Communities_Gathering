import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getContent, getConfig, getGroupedList, assetPath } from '../core/store.js';
import { logoCard } from '../ui/card.js';
import { ballotCard } from '../ui/ballot-card.js';
import { openModal } from '../ui/detail-modal.js';
import { track } from '../core/analytics.js';

function renderEmptyState(container, className) {
  const config = getConfig();
  const ui = config && config.ui;
  const message = t(ui && ui.emptyStateText);
  const empty = el('p', {
    class: className,
    text: message,
  });
  mount(container, empty);
}

function makeGroupHeader(group, headerClass) {
  const header = el('header', { class: headerClass });
  const title = el('h3', {
    class: `${headerClass}-title`,
    text: t(group && group.name),
  });
  mount(header, title);
  return header;
}

function openLogoModal(type, item, group) {
  const eventName = type === 'thanks' ? 'select_thanks' : 'select_booth';
  const idKey = type === 'thanks' ? 'thanks_id' : 'booth_id';
  track(eventName, { [idKey]: item.id });
  openModal({
    image: assetPath(type, item.id),
    imageShape: 'square',
    name: item.name,
    subtitle: group ? group.name : undefined,
    bio: item.description,
    links: Array.isArray(item.links) ? item.links : [],
  });
}

function renderLogoSection(container, groups, type) {
  for (const entry of groups) {
    if (!entry || !Array.isArray(entry.items) || entry.items.length === 0) {
      continue;
    }
    const block = el('div', { class: 'gk-logo-group' });
    if (entry.group) {
      mount(block, makeGroupHeader(entry.group, 'gk-logo-group-header'));
    }
    const grid = el('div', { class: 'gk-logo-grid' });
    for (const item of entry.items) {
      const card = logoCard({
        image: assetPath(type, item.id),
        name: item.name,
        description: item.description,
        onClick: () => openLogoModal(type, item, entry.group),
      });
      mount(grid, card);
    }
    mount(block, grid);
    mount(container, block);
  }
}

function renderBallotSection(container, groups) {
  for (const entry of groups) {
    if (!entry || !Array.isArray(entry.items) || entry.items.length === 0) {
      continue;
    }
    const block = el('div', { class: 'gk-ballot-group' });
    if (entry.group) {
      mount(block, makeGroupHeader(entry.group, 'gk-ballot-group-header'));
    }
    const grid = el('div', { class: 'gk-ballot-grid' });
    for (const item of entry.items) {
      const card = ballotCard({
        image: assetPath('thanks', item.id),
        name: item.name,
        groupName: entry.group ? entry.group.name : null,
        description: item.description,
        onClick: () => openLogoModal('thanks', item, entry.group),
      });
      mount(grid, card);
    }
    mount(block, grid);
    mount(container, block);
  }
}

export function renderThanks(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-thanks-section');
  const config = getConfig();
  const showShadow = Boolean(config && config.thanks && config.thanks.showCardShadow);
  container.classList.toggle('is-shadow-off', !showShadow);
  const content = getContent();
  const list = Array.isArray(content && content.thanks) ? content.thanks : [];
  if (list.length === 0) {
    renderEmptyState(container, 'gk-thanks-empty');
    return;
  }
  const groups = getGroupedList('thanks', 'thanksGroups');
  if (groups.length === 0) {
    renderEmptyState(container, 'gk-thanks-empty');
    return;
  }
  renderBallotSection(container, groups);
}

export function renderBooths(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-booths-section');
  const content = getContent();
  const list = Array.isArray(content && content.booths) ? content.booths : [];
  if (list.length === 0) {
    renderEmptyState(container, 'gk-booths-empty');
    return;
  }
  const groups = getGroupedList('booths', 'boothGroups');
  if (groups.length === 0) {
    renderEmptyState(container, 'gk-booths-empty');
    return;
  }
  renderLogoSection(container, groups, 'booths');
}
