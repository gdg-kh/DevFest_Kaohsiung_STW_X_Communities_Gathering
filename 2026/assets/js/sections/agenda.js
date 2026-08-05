import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import {
  getContent,
  getConfig,
  getSortedList,
  getTrackById,
  getGroupById,
  getSpeakersBySessionId,
  assetPath,
} from '../core/store.js';
import { sessionCard } from '../ui/card.js';
import { openModal } from '../ui/detail-modal.js';
import { openImageViewer } from '../ui/image-viewer.js';
import { allSessionsButton, calendarButtons } from '../ui/calendar.js';
import { track } from '../core/analytics.js';

const SPAN_TYPES = new Set(['break', 'lunch', 'opening', 'closing']);

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function formatTime(iso) {
  if (typeof iso !== 'string' || iso.length < 16) {
    return '';
  }
  return iso.slice(11, 16);
}

function formatRange(start, end) {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) {
    return `${s} - ${e}`;
  }
  return s || e;
}

function attachActivation(node, handler) {
  node.addEventListener('click', handler);
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      handler(event);
    }
  });
}

function renderMapSection(container) {
  const content = getContent();
  const maps = Array.isArray(content && content.venueMaps) ? content.venueMaps : [];
  if (maps.length === 0) {
    return;
  }
  const section = el('div', { class: 'gk-agenda-map' });
  const hint = uiLabel('mapZoomHint');
  if (hint) {
    mount(section, el('p', { class: 'gk-agenda-map-hint', text: hint }));
  }

  const tabs = el('div', { class: 'gk-agenda-map-tabs' });
  const stage = el('div', { class: 'gk-agenda-map-stage' });
  const caption = el('p', { class: 'gk-agenda-map-caption' });

  let current = 0;
  const buttons = [];

  const image = el('img', {
    class: 'gk-agenda-map-image',
    attrs: {
      loading: 'lazy',
      width: '720',
      height: '480',
      role: 'button',
      tabindex: '0',
      alt: '',
    },
  });

  function show(index) {
    const map = maps[index];
    if (!map) {
      return;
    }
    current = index;
    const src = `images/${map.file}`;
    const alt = t(map.caption);
    image.setAttribute('src', src);
    image.setAttribute('alt', alt);
    caption.textContent = alt;
    for (const btn of buttons) {
      if (btn.dataset.index === String(index)) {
        btn.classList.add('gk-agenda-map-tab-active');
      } else {
        btn.classList.remove('gk-agenda-map-tab-active');
      }
    }
  }

  if (maps.length > 1) {
    for (let i = 0; i < maps.length; i += 1) {
      const map = maps[i];
      const btn = el('button', {
        class: 'gk-agenda-map-tab',
        attrs: { type: 'button' },
        text: t(map.caption),
      });
      btn.dataset.index = String(i);
      btn.addEventListener('click', () => show(i));
      buttons.push(btn);
      mount(tabs, btn);
    }
    mount(section, tabs);
  }

  const openViewer = () => {
    const map = maps[current];
    if (!map) {
      return;
    }
    openImageViewer({ src: `images/${map.file}`, alt: t(map.caption) });
    track('view_venue_map', { map_file: map.file });
  };
  attachActivation(image, openViewer);

  mount(stage, image);
  mount(section, stage, caption);

  show(0);
  mount(container, section);
}

function isSpan(session) {
  if (!session) {
    return false;
  }
  if (session.trackId === 'all') {
    return true;
  }
  return SPAN_TYPES.has(session.type);
}

function spanRow(session, tracks) {
  const row = el('div', {
    class: `gk-agenda-span gk-agenda-span-${session.type || 'all'}`,
  });
  const time = el('span', {
    class: 'gk-agenda-span-time',
    text: formatRange(session.start, session.end),
  });
  const title = el('span', {
    class: 'gk-agenda-span-title',
    text: t(session.title),
  });
  mount(row, time, title);
  if (tracks.length >= 2) {
    row.style.gridColumn = '2 / -1';
  }
  return row;
}

function openSessionModal(session) {
  const speakers = getSpeakersBySessionId(session.id);
  const firstSpeaker = speakers[0] || null;
  const group = getGroupById(session.groupId);
  const track2 = getTrackById(session.trackId);
  const trackName = t(track2 && track2.name);
  const venue = t(getConfig() && getConfig().site && getConfig().site.venue);
  const meta = [];
  const timeRange = formatRange(session.start, session.end);
  if (timeRange) {
    meta.push({ label: uiLabel('timeLabel') || '時間', value: timeRange });
  }
  if (trackName || venue) {
    const value = [trackName, venue].filter((v) => v && v.length > 0).join(' - ');
    meta.push({ label: uiLabel('venueLabel') || '會場', value });
  }
  const subtitleParts = speakers.map((sp) => t(sp && sp.name)).filter((n) => n && n.length > 0);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join('、') : null;

  track('select_session', { session_id: session.id });
  openModal({
    image: firstSpeaker ? assetPath('speakers', firstSpeaker.id) : undefined,
    imageShape: 'circle',
    name: session.title,
    subtitle,
    sessionTitle: session.title,
    sessionAbstract: session.abstract,
    bio: firstSpeaker ? firstSpeaker.bio : null,
    groupName: group ? group.name : null,
    groupColor: group && typeof group.color === 'string' ? group.color : undefined,
    tags: Array.isArray(session.tags) ? session.tags : [],
    meta,
    links: Array.isArray(session.links) ? session.links : [],
    extraNode: calendarButtons(session, 'modal'),
  });
}

function sessionCardFor(session) {
  const speakers = getSpeakersBySessionId(session.id).map((sp) => ({
    image: assetPath('speakers', sp.id),
    name: sp.name,
  }));
  const group = getGroupById(session.groupId);
  return sessionCard({
    title: session.title,
    time: formatRange(session.start, session.end),
    groupName: group ? group.name : null,
    groupColor: group && typeof group.color === 'string' ? group.color : undefined,
    speakers,
    onClick: () => openSessionModal(session),
  });
}

function trackIndex(tracks, trackId) {
  for (let i = 0; i < tracks.length; i += 1) {
    if (tracks[i].id === trackId) {
      return i;
    }
  }
  return -1;
}

function renderTimelineDesktop(container, tracks, sessions) {
  const grid = el('div', { class: 'gk-agenda-grid' });
  if (tracks.length >= 4) {
    grid.classList.add('gk-agenda-grid-scroll');
  }

  if (tracks.length === 1) {
    grid.classList.add('gk-agenda-grid-single');
  } else {
    grid.classList.add('gk-agenda-grid-multi');
    grid.style.setProperty('--gk-agenda-track-count', String(tracks.length));
    const header = el('div', { class: 'gk-agenda-grid-header' });
    mount(header, el('span', { class: 'gk-agenda-grid-header-cell', text: '' }));
    for (const trackData of tracks) {
      const cell = el('span', {
        class: 'gk-agenda-grid-header-cell',
        text: t(trackData.name),
      });
      if (typeof trackData.color === 'string' && trackData.color.length > 0) {
        cell.style.borderTopColor = trackData.color;
      }
      mount(header, cell);
    }
    mount(grid, header);
  }

  for (const session of sessions) {
    const timeCell = el('div', {
      class: 'gk-agenda-time-cell',
      text: formatTime(session.start),
    });
    mount(grid, timeCell);
    if (isSpan(session)) {
      mount(grid, spanRow(session, tracks));
      continue;
    }
    if (tracks.length === 1) {
      mount(grid, sessionCardFor(session));
    } else {
      const idx = trackIndex(tracks, session.trackId);
      const card = sessionCardFor(session);
      if (idx >= 0) {
        card.style.gridColumn = `${idx + 2} / span 1`;
      } else {
        card.style.gridColumn = '2 / -1';
      }
      mount(grid, card);
    }
  }
  mount(container, grid);
}

function renderTimelineMobile(container, tracks, sessions) {
  const wrapper = el('div', { class: 'gk-agenda-mobile' });
  const tabs = el('div', { class: 'gk-agenda-mobile-tabs' });
  const panels = el('div', { class: 'gk-agenda-mobile-panels' });
  const buttons = [];
  const panelList = [];

  function show(index) {
    for (let i = 0; i < buttons.length; i += 1) {
      if (i === index) {
        buttons[i].classList.add('gk-agenda-mobile-tab-active');
        panelList[i].removeAttribute('hidden');
      } else {
        buttons[i].classList.remove('gk-agenda-mobile-tab-active');
        panelList[i].setAttribute('hidden', '');
      }
    }
  }

  for (let i = 0; i < tracks.length; i += 1) {
    const trackData = tracks[i];
    const btn = el('button', {
      class: 'gk-agenda-mobile-tab',
      attrs: { type: 'button' },
      text: t(trackData.name),
    });
    btn.addEventListener('click', () => show(i));
    buttons.push(btn);
    mount(tabs, btn);

    const panel = el('div', { class: 'gk-agenda-mobile-panel' });
    for (const session of sessions) {
      if (isSpan(session)) {
        const row = el('div', {
          class: 'gk-agenda-mobile-span',
        });
        mount(
          row,
          el('span', {
            class: 'gk-agenda-mobile-span-time',
            text: formatTime(session.start),
          })
        );
        mount(
          row,
          el('span', {
            class: 'gk-agenda-mobile-span-title',
            text: t(session.title),
          })
        );
        mount(panel, row);
        continue;
      }
      if (session.trackId !== trackData.id) {
        continue;
      }
      const row = el('div', { class: 'gk-agenda-mobile-row' });
      mount(
        row,
        el('span', {
          class: 'gk-agenda-mobile-time',
          text: formatTime(session.start),
        })
      );
      mount(row, sessionCardFor(session));
      mount(panel, row);
    }
    panelList.push(panel);
    mount(panels, panel);
  }

  mount(wrapper, tabs, panels);
  mount(container, wrapper);
  if (tracks.length > 0) {
    show(0);
  }
}

function renderTimeline(container, tracks, sessions) {
  const timeline = el('div', { class: 'gk-agenda-timeline' });
  const header = el('div', { class: 'gk-agenda-timeline-header' });
  const title = el('h3', {
    class: 'gk-agenda-timeline-title',
    text: uiLabel('agendaTitle') || '議程',
  });
  mount(header, title);
  mount(header, allSessionsButton());
  mount(timeline, header);

  const desktopWrapper = el('div', { class: 'gk-agenda-only-desktop' });
  renderTimelineDesktop(desktopWrapper, tracks, sessions);
  mount(timeline, desktopWrapper);

  if (tracks.length > 1) {
    const mobileWrapper = el('div', { class: 'gk-agenda-only-mobile' });
    renderTimelineMobile(mobileWrapper, tracks, sessions);
    mount(timeline, mobileWrapper);
  }

  mount(container, timeline);
}

export function renderAgenda(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-agenda-section');

  renderMapSection(container);

  const sessionsRaw = getSortedList('sessions');
  const sessions = sessionsRaw.slice().sort((a, b) => {
    const aStart = typeof a.start === 'string' ? a.start : '';
    const bStart = typeof b.start === 'string' ? b.start : '';
    if (aStart < bStart) {
      return -1;
    }
    if (aStart > bStart) {
      return 1;
    }
    return 0;
  });
  const tracks = getSortedList('tracks');

  if (sessions.length === 0) {
    const empty = el('p', {
      class: 'gk-agenda-empty',
      text: uiLabel('emptyStateText'),
    });
    mount(container, empty);
    return;
  }

  renderTimeline(container, tracks, sessions);
}
