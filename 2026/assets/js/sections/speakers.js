import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getContent, getConfig, getSortedList, getSessionById, getGroupById, assetPath } from '../core/store.js';
import { personCard } from '../ui/card.js';
import { openModal } from '../ui/detail-modal.js';
import { track } from '../core/analytics.js';

function firstSessionOf(speaker) {
  if (!speaker || !Array.isArray(speaker.sessionIds) || speaker.sessionIds.length === 0) {
    return null;
  }
  for (const sid of speaker.sessionIds) {
    const session = getSessionById(sid);
    if (session) {
      return session;
    }
  }
  return null;
}

function groupIdOf(speaker) {
  const session = firstSessionOf(speaker);
  return session && typeof session.groupId === 'string' ? session.groupId : null;
}

function buildGroups(speakers) {
  const sessionGroups = getSortedList('sessionGroups');
  const buckets = new Map();
  const order = [];
  for (const group of sessionGroups) {
    buckets.set(group.id, { group, items: [] });
    order.push(group.id);
  }
  const orphans = [];
  for (const speaker of speakers) {
    const gid = groupIdOf(speaker);
    if (gid && buckets.has(gid)) {
      buckets.get(gid).items.push(speaker);
    } else {
      orphans.push(speaker);
    }
  }
  const result = [];
  for (const gid of order) {
    const entry = buckets.get(gid);
    if (entry.items.length > 0) {
      result.push(entry);
    }
  }
  if (orphans.length > 0) {
    result.push({ group: null, items: orphans });
  }
  return result;
}

function makeGroupHeader(group) {
  const header = el('header', { class: 'gk-speakers-group-header' });
  const bar = el('span', { class: 'gk-speakers-group-bar' });
  if (group && typeof group.color === 'string' && group.color.length > 0) {
    bar.style.backgroundColor = group.color;
  }
  const title = el('h3', {
    class: 'gk-speakers-group-title',
    text: t(group && group.name),
  });
  mount(header, bar, title);
  return header;
}

function openSpeakerModal(speaker) {
  const session = firstSessionOf(speaker);
  const group = session ? getGroupById(session.groupId) : null;
  track('select_speaker', { speaker_id: speaker.id });
  openModal({
    image: assetPath('speakers', speaker.id),
    imageShape: 'circle',
    number: typeof speaker.order === 'number' ? speaker.order : undefined,
    name: speaker.name,
    bio: speaker.bio,
    sessionTitle: session ? session.title : null,
    sessionAbstract: session ? session.abstract : null,
    groupName: group ? group.name : null,
    groupColor: group && typeof group.color === 'string' ? group.color : undefined,
    tags: session && Array.isArray(session.tags) ? session.tags : [],
    links: Array.isArray(speaker.links) ? speaker.links : [],
  });
}

function makeCardFor(speaker) {
  const session = firstSessionOf(speaker);
  const opts = {
    image: assetPath('speakers', speaker.id),
    number: typeof speaker.order === 'number' ? speaker.order : undefined,
    name: speaker.name,
    description: speaker.bio,
    onClick: () => openSpeakerModal(speaker),
  };
  if (session) {
    opts.subtitle = session.title;
  }
  return personCard(opts);
}

function renderEmptyState(container) {
  const config = getConfig();
  const ui = config && config.ui;
  const message = t(ui && ui.emptyStateText);
  const empty = el('p', {
    class: 'gk-speakers-empty',
    text: message,
  });
  mount(container, empty);
}

export function renderSpeakers(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-speakers-section');

  const content = getContent();
  const speakers = Array.isArray(content && content.speakers) ? getSortedList('speakers') : [];

  if (speakers.length === 0) {
    renderEmptyState(container);
    return;
  }

  const groups = buildGroups(speakers);
  if (groups.length === 0) {
    renderEmptyState(container);
    return;
  }

  for (const entry of groups) {
    const groupBlock = el('div', { class: 'gk-speakers-group' });
    if (entry.group) {
      mount(groupBlock, makeGroupHeader(entry.group));
    }
    const grid = el('div', { class: 'gk-speakers-grid' });
    for (const speaker of entry.items) {
      mount(grid, makeCardFor(speaker));
    }
    mount(groupBlock, grid);
    mount(container, groupBlock);
  }
}
