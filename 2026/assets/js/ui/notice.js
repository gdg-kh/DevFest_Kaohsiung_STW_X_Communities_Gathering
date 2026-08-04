import { el } from '../core/dom.js';
import { t } from '../core/i18n.js';

const KNOWN_VARIANTS = new Set(['highlight', 'info', 'muted']);
const DEFAULT_VARIANT = 'info';

function isNewShape(payload) {
  return typeof payload === 'object' && payload !== null && Object.prototype.hasOwnProperty.call(payload, 'text');
}

function pickTextNode(payload) {
  return isNewShape(payload) ? payload.text : payload;
}

function pickVariant(payload) {
  if (!isNewShape(payload) || typeof payload.variant !== 'string') {
    return DEFAULT_VARIANT;
  }
  return KNOWN_VARIANTS.has(payload.variant) ? payload.variant : DEFAULT_VARIANT;
}

export function renderNotice(payload) {
  if (!payload) {
    return null;
  }
  const text = t(pickTextNode(payload));
  if (!text) {
    return null;
  }
  const variant = pickVariant(payload);
  return el('div', {
    class: `gk-notice gk-notice-${variant} gk-multiline`,
    text,
    attrs: { role: 'note' },
  });
}

export function getNoticeText(payload) {
  if (!payload) {
    return '';
  }
  return t(pickTextNode(payload));
}
