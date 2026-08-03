import { el } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig, getContent, getSpeakersBySessionId, getTrackById } from '../core/store.js';
import { track } from '../core/analytics.js';

const PRODID = '-//GDG Kaohsiung//DevFest 2026//ZH';
const TZ_OFFSET_HOURS = 8;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function pad2(value) {
  const str = String(value);
  return str.length >= 2 ? str : `0${str}`;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

function parseLocal(dt) {
  if (typeof dt !== 'string' || dt.length < 16) {
    return null;
  }
  const year = parseInt(dt.slice(0, 4), 10);
  const month = parseInt(dt.slice(5, 7), 10);
  const day = parseInt(dt.slice(8, 10), 10);
  const hour = parseInt(dt.slice(11, 13), 10);
  const minute = parseInt(dt.slice(14, 16), 10);
  if ([year, month, day, hour, minute].some((v) => Number.isNaN(v))) {
    return null;
  }
  return { year, month, day, hour, minute };
}

function shiftToUtc(parts) {
  let { year, month, day, hour } = parts;
  const minute = parts.minute;
  hour -= TZ_OFFSET_HOURS;
  while (hour < 0) {
    hour += 24;
    day -= 1;
    if (day < 1) {
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      day = daysInMonth(year, month);
    }
  }
  while (hour >= 24) {
    hour -= 24;
    day += 1;
    const dim = daysInMonth(year, month);
    if (day > dim) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }
  return { year, month, day, hour, minute };
}

function formatUtc(parts) {
  return `${parts.year}${pad2(parts.month)}${pad2(parts.day)}T${pad2(parts.hour)}${pad2(parts.minute)}00Z`;
}

function toIcsUtc(dt) {
  const parsed = parseLocal(dt);
  if (!parsed) {
    return '';
  }
  return formatUtc(shiftToUtc(parsed));
}

function nowUtcStamp() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const hour = pad2(d.getUTCHours());
  const minute = pad2(d.getUTCMinutes());
  const second = pad2(d.getUTCSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function escapeIcsText(input) {
  const str = typeof input === 'string' ? input : '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) {
    return line;
  }
  const decoder = new TextDecoder();
  const chunks = [];
  let start = 0;
  while (start < bytes.length) {
    const limit = chunks.length === 0 ? 75 : 74;
    let end = Math.min(start + limit, bytes.length);
    while (end > start && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }
    if (end <= start) {
      end = start + limit;
    }
    const chunk = decoder.decode(bytes.subarray(start, end));
    chunks.push(chunks.length === 0 ? chunk : ` ${chunk}`);
    start = end;
    if (start >= bytes.length) {
      break;
    }
    if (bytes.length - start <= 74) {
      chunks.push(` ${decoder.decode(bytes.subarray(start))}`);
      start = bytes.length;
      break;
    }
  }
  return chunks.join('\r\n');
}

function joinLines(lines) {
  return lines.map((line) => foldLine(line)).join('\r\n');
}

function venueText() {
  const config = getConfig();
  return t(config && config.site && config.site.venue);
}

function trackName(session) {
  const trackObj = getTrackById(session && session.trackId);
  return t(trackObj && trackObj.name);
}

function sessionLocation(session) {
  const parts = [];
  const trackText = trackName(session);
  const venue = venueText();
  if (trackText) {
    parts.push(trackText);
  }
  if (venue) {
    parts.push(venue);
  }
  return parts.join(' - ');
}

function sessionDescription(session) {
  const speakers = getSpeakersBySessionId(session && session.id);
  const names = speakers
    .map((sp) => t(sp && sp.name))
    .filter((n) => n && n.length > 0)
    .join('、');
  const abstract = t(session && session.abstract);
  const parts = [];
  if (names) {
    parts.push(names);
  }
  if (abstract) {
    parts.push(abstract);
  }
  return parts.join('\n');
}

function buildEvent(session) {
  if (!session || typeof session !== 'object') {
    return [];
  }
  const startUtc = toIcsUtc(session.start);
  const endUtc = toIcsUtc(session.end);
  if (!startUtc || !endUtc) {
    return [];
  }
  const summary = t(session.title);
  const description = sessionDescription(session);
  const location = sessionLocation(session);
  const lines = [
    'BEGIN:VEVENT',
    `UID:${session.id}@gdgkh.cc`,
    `DTSTAMP:${nowUtcStamp()}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(summary)}`,
  ];
  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }
  if (location) {
    lines.push(`LOCATION:${escapeIcsText(location)}`);
  }
  lines.push('END:VEVENT');
  return lines;
}

export function buildIcs(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
  ];
  for (const session of list) {
    for (const line of buildEvent(session)) {
      lines.push(line);
    }
  }
  lines.push('END:VCALENDAR');
  return `${joinLines(lines)}\r\n`;
}

export function downloadIcs(sessions, filename) {
  const content = buildIcs(sessions);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = typeof filename === 'string' && filename.length > 0 ? filename : 'event.ics';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(session) {
  if (!session || typeof session !== 'object') {
    return '';
  }
  const startUtc = toIcsUtc(session.start);
  const endUtc = toIcsUtc(session.end);
  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', t(session.title));
  if (startUtc && endUtc) {
    params.set('dates', `${startUtc}/${endUtc}`);
  }
  const description = sessionDescription(session);
  if (description) {
    params.set('details', description);
  }
  const location = sessionLocation(session);
  if (location) {
    params.set('location', location);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

export function calendarButtons(session, entry) {
  const wrapper = el('div', { class: 'gk-calendar-buttons' });
  if (!session || typeof session !== 'object') {
    return wrapper;
  }

  const downloadLabel = uiLabel('downloadIcsLabel') || 'Download .ics';
  const googleLabel = uiLabel('googleCalendarLabel') || 'Add to Google Calendar';

  const downloadBtn = el('button', {
    class: 'gk-calendar-button gk-calendar-button-ics',
    attrs: { type: 'button' },
    text: downloadLabel,
    on: {
      click: () => {
        downloadIcs([session], `${session.id}.ics`);
        track('add_to_calendar', {
          session_id: session.id,
          type: 'ics',
          entry: entry || '',
        });
      },
    },
  });

  const googleAnchor = el('a', {
    class: 'gk-calendar-button gk-calendar-button-google',
    attrs: {
      href: googleCalendarUrl(session),
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    text: googleLabel,
    on: {
      click: () => {
        track('add_to_calendar', {
          session_id: session.id,
          type: 'google',
          entry: entry || '',
        });
      },
    },
  });

  wrapper.appendChild(downloadBtn);
  wrapper.appendChild(googleAnchor);
  return wrapper;
}

export function allSessionsButton() {
  const label = uiLabel('addAllSessionsLabel') || 'Add all sessions';
  const button = el('button', {
    class: 'gk-calendar-button gk-calendar-button-all',
    attrs: { type: 'button' },
    text: label,
    on: {
      click: () => {
        const content = getContent();
        const sessions = Array.isArray(content && content.sessions) ? content.sessions : [];
        const filtered = sessions.filter((s) => {
          const type = s && s.type;
          return type !== 'break' && type !== 'lunch';
        });
        downloadIcs(filtered, 'gdgkh-2026.ics');
        track('add_to_calendar', {
          session_id: 'all',
          type: 'ics_all',
          entry: 'agenda',
        });
      },
    },
  });
  return button;
}
