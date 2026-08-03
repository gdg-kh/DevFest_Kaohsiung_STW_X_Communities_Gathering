import { el, clear } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig } from '../core/store.js';

const SCALE_MIN = 1;
const SCALE_MAX = 6;
const WHEEL_STEP = 0.0015;
const DOUBLE_TAP_DELAY = 300;

let overlayEl = null;
let stageEl = null;
let imgEl = null;
let closeBtnEl = null;
let resetBtnEl = null;
let zoomLabelEl = null;
let hintEl = null;
let isOpen = false;
let lastPointerUpAt = 0;

const state = {
  scale: 1,
  x: 0,
  y: 0,
};

const pointers = new Map();
let pinchStart = null;
let dragStart = null;

function labelFromUi(key) {
  const config = getConfig();
  const ui = config && config.ui;
  if (!ui || typeof ui !== 'object') {
    return '';
  }
  return t(ui[key]);
}

function applyTransform() {
  if (!imgEl) {
    return;
  }
  if (state.scale <= 1) {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
  }
  imgEl.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
  updateZoomLabel();
}

function updateZoomLabel() {
  if (!zoomLabelEl) {
    return;
  }
  zoomLabelEl.textContent = `${Math.round(state.scale * 100)}%`;
}

function clampTranslate() {
  if (state.scale <= 1 || !imgEl || !stageEl) {
    state.x = 0;
    state.y = 0;
    return;
  }
  const stageRect = stageEl.getBoundingClientRect();
  const imgWidth = imgEl.naturalWidth || imgEl.clientWidth;
  const imgHeight = imgEl.naturalHeight || imgEl.clientHeight;
  const displayedWidth = imgEl.clientWidth * state.scale;
  const displayedHeight = imgEl.clientHeight * state.scale;
  const maxX = Math.max(0, (displayedWidth - stageRect.width) / 2);
  const maxY = Math.max(0, (displayedHeight - stageRect.height) / 2);
  if (state.x > maxX) {
    state.x = maxX;
  }
  if (state.x < -maxX) {
    state.x = -maxX;
  }
  if (state.y > maxY) {
    state.y = maxY;
  }
  if (state.y < -maxY) {
    state.y = -maxY;
  }
  if (imgWidth === 0 || imgHeight === 0) {
    return;
  }
}

function setScaleAt(nextScale, anchorClientX, anchorClientY) {
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, nextScale));
  if (clamped === state.scale) {
    return;
  }
  if (!imgEl) {
    state.scale = clamped;
    return;
  }
  const rect = imgEl.getBoundingClientRect();
  const anchorX = anchorClientX - (rect.left + rect.width / 2);
  const anchorY = anchorClientY - (rect.top + rect.height / 2);
  const ratio = clamped / state.scale;
  state.x = anchorX - (anchorX - state.x) * ratio;
  state.y = anchorY - (anchorY - state.y) * ratio;
  state.scale = clamped;
  clampTranslate();
  applyTransform();
}

function reset() {
  state.scale = 1;
  state.x = 0;
  state.y = 0;
  applyTransform();
}

function onWheel(event) {
  event.preventDefault();
  const factor = Math.exp(-event.deltaY * WHEEL_STEP);
  setScaleAt(state.scale * factor, event.clientX, event.clientY);
}

function onPointerDown(event) {
  if (!stageEl) {
    return;
  }
  stageEl.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const [a, b] = Array.from(pointers.values());
    pinchStart = {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      scale: state.scale,
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
      originX: state.x,
      originY: state.y,
    };
    dragStart = null;
  } else if (pointers.size === 1) {
    dragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      originX: state.x,
      originY: state.y,
    };
  }
}

function onPointerMove(event) {
  if (!pointers.has(event.pointerId)) {
    return;
  }
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2 && pinchStart) {
    const [a, b] = Array.from(pointers.values());
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchStart.distance <= 0) {
      return;
    }
    const targetScale = pinchStart.scale * (distance / pinchStart.distance);
    state.scale = pinchStart.scale;
    state.x = pinchStart.originX;
    state.y = pinchStart.originY;
    setScaleAt(targetScale, pinchStart.midX, pinchStart.midY);
    return;
  }
  if (pointers.size === 1 && dragStart && dragStart.pointerId === event.pointerId) {
    if (state.scale <= 1) {
      return;
    }
    state.x = dragStart.originX + (event.clientX - dragStart.clientX);
    state.y = dragStart.originY + (event.clientY - dragStart.clientY);
    clampTranslate();
    applyTransform();
  }
}

function onPointerUp(event) {
  if (pointers.has(event.pointerId)) {
    pointers.delete(event.pointerId);
  }
  if (stageEl && stageEl.hasPointerCapture(event.pointerId)) {
    stageEl.releasePointerCapture(event.pointerId);
  }
  if (pointers.size < 2) {
    pinchStart = null;
  }
  if (pointers.size === 0) {
    dragStart = null;
    const now = Date.now();
    if (now - lastPointerUpAt < DOUBLE_TAP_DELAY) {
      reset();
      lastPointerUpAt = 0;
    } else {
      lastPointerUpAt = now;
    }
  }
}

function onPointerCancel(event) {
  if (pointers.has(event.pointerId)) {
    pointers.delete(event.pointerId);
  }
  pinchStart = null;
  dragStart = null;
}

function onKeydown(event) {
  if (!isOpen) {
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    closeImageViewer();
  }
}

function onOverlayClick(event) {
  if (event.target === overlayEl) {
    closeImageViewer();
  }
}

function bindEvents() {
  if (!stageEl) {
    return;
  }
  stageEl.addEventListener('wheel', onWheel, { passive: false });
  stageEl.addEventListener('pointerdown', onPointerDown);
  stageEl.addEventListener('pointermove', onPointerMove);
  stageEl.addEventListener('pointerup', onPointerUp);
  stageEl.addEventListener('pointercancel', onPointerCancel);
  document.addEventListener('keydown', onKeydown, true);
  overlayEl.addEventListener('click', onOverlayClick);
}

function unbindEvents() {
  if (!stageEl) {
    return;
  }
  stageEl.removeEventListener('wheel', onWheel, { passive: false });
  stageEl.removeEventListener('pointerdown', onPointerDown);
  stageEl.removeEventListener('pointermove', onPointerMove);
  stageEl.removeEventListener('pointerup', onPointerUp);
  stageEl.removeEventListener('pointercancel', onPointerCancel);
  document.removeEventListener('keydown', onKeydown, true);
  if (overlayEl) {
    overlayEl.removeEventListener('click', onOverlayClick);
  }
}

function ensureRoot() {
  if (overlayEl) {
    return;
  }
  overlayEl = el('div', {
    class: 'gk-image-viewer-overlay',
    attrs: { hidden: '' },
  });
  const inner = el('div', { class: 'gk-image-viewer' });
  closeBtnEl = el('button', {
    class: 'gk-image-viewer-close',
    attrs: { type: 'button' },
    on: { click: () => closeImageViewer() },
  }, '\u00d7');

  stageEl = el('div', { class: 'gk-image-viewer-stage' });
  imgEl = el('img', {
    class: 'gk-image-viewer-image',
    attrs: {
      alt: '',
      draggable: 'false',
      width: '800',
      height: '600',
    },
  });
  stageEl.appendChild(imgEl);

  const toolbar = el('div', { class: 'gk-image-viewer-toolbar' });
  zoomLabelEl = el('span', { class: 'gk-image-viewer-zoom', text: '100%' });
  resetBtnEl = el('button', {
    class: 'gk-image-viewer-reset',
    attrs: { type: 'button' },
    on: { click: () => reset() },
  });
  hintEl = el('span', { class: 'gk-image-viewer-hint' });
  toolbar.appendChild(zoomLabelEl);
  toolbar.appendChild(resetBtnEl);
  toolbar.appendChild(hintEl);

  inner.appendChild(closeBtnEl);
  inner.appendChild(stageEl);
  inner.appendChild(toolbar);
  overlayEl.appendChild(inner);
  document.body.appendChild(overlayEl);
}

function refreshLabels() {
  if (closeBtnEl) {
    const label = labelFromUi('viewerCloseLabel');
    closeBtnEl.setAttribute('aria-label', label || 'Close');
    closeBtnEl.textContent = '\u00d7';
  }
  if (resetBtnEl) {
    const label = labelFromUi('viewerResetLabel');
    resetBtnEl.textContent = label || 'Reset';
  }
  if (hintEl) {
    const hint = labelFromUi('viewerZoomHint');
    hintEl.textContent = hint;
  }
}

export function openImageViewer(opts) {
  const options = opts && typeof opts === 'object' ? opts : {};
  const src = typeof options.src === 'string' ? options.src : '';
  if (!src) {
    return;
  }
  ensureRoot();
  refreshLabels();

  imgEl.setAttribute('src', src);
  imgEl.setAttribute('alt', typeof options.alt === 'string' ? options.alt : '');

  state.scale = 1;
  state.x = 0;
  state.y = 0;
  pointers.clear();
  pinchStart = null;
  dragStart = null;
  lastPointerUpAt = 0;
  applyTransform();

  if (!isOpen) {
    bindEvents();
  }
  overlayEl.removeAttribute('hidden');
  document.body.classList.add('gk-no-scroll');
  isOpen = true;
}

export function closeImageViewer() {
  if (!isOpen || !overlayEl) {
    return;
  }
  overlayEl.setAttribute('hidden', '');
  document.body.classList.remove('gk-no-scroll');
  unbindEvents();
  pointers.clear();
  pinchStart = null;
  dragStart = null;
  if (imgEl) {
    imgEl.removeAttribute('src');
    clear(imgEl);
  }
  isOpen = false;
}
