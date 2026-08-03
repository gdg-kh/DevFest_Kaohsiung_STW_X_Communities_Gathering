import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig, getContent } from '../core/store.js';
import { track } from '../core/analytics.js';

function getVirtualConfig() {
  const config = getConfig();
  const vs = config && config.virtualSpace;
  if (!vs || vs.enabled !== true) {
    return null;
  }
  if (typeof vs.url !== 'string' || vs.url.length === 0) {
    return null;
  }
  return vs;
}

function getVirtualContent() {
  const content = getContent();
  return (content && content.virtualSpace) || {};
}

function uiLabel(key) {
  const config = getConfig();
  const ui = config && config.ui;
  return t(ui && ui[key]);
}

function makeEnterButton(url, entryName, labelText) {
  const link = el('a', {
    class: 'gk-virtual-enter',
    text: labelText,
    attrs: {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  link.addEventListener('click', () => {
    track('enter_virtual_space', { entry: entryName });
  });
  return link;
}

function makeIframe(url, titleText) {
  const attrs = {
    src: url,
    title: titleText || '',
    allow: 'camera; microphone; fullscreen; display-capture',
    loading: 'lazy',
  };
  return el('iframe', {
    class: 'gk-virtual-iframe',
    attrs,
  });
}

function makeNotesList(notes) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return null;
  }
  const items = [];
  for (const note of notes) {
    const noteText = t(note);
    if (noteText) {
      items.push(el('li', { class: 'gk-virtual-note', text: noteText }));
    }
  }
  if (items.length === 0) {
    return null;
  }
  const list = el('ul', { class: 'gk-virtual-notes' });
  for (const item of items) {
    mount(list, item);
  }
  return list;
}

function makeQrBlock(qrImage) {
  if (typeof qrImage !== 'string' || qrImage.length === 0) {
    return null;
  }
  const wrapper = el('div', { class: 'gk-virtual-qr' });
  const hint = uiLabel('virtualQrHint');
  const img = el('img', {
    class: 'gk-virtual-qr-image',
    attrs: {
      src: qrImage,
      alt: hint || '',
      loading: 'lazy',
      width: '180',
      height: '180',
    },
  });
  mount(wrapper, img);
  if (hint) {
    mount(wrapper, el('p', { class: 'gk-virtual-qr-hint', text: hint }));
  }
  return wrapper;
}

export function renderVirtualSpace(container) {
  if (!container) {
    return;
  }
  clear(container);
  const vs = getVirtualConfig();
  if (!vs) {
    return;
  }
  container.classList.add('gk-virtual-section');

  const vc = getVirtualContent();
  const titleText = t(vc.title);
  const descriptionText = t(vc.description);
  const buttonText = uiLabel('virtualEnterButton');

  if (titleText) {
    mount(container, el('h2', { class: 'gk-virtual-title', text: titleText }));
  }
  if (descriptionText) {
    mount(
      container,
      el('p', {
        class: 'gk-virtual-description gk-multiline',
        text: descriptionText,
      })
    );
  }

  mount(container, makeEnterButton(vs.url, 'section', buttonText));

  if (vs.embed === true) {
    mount(container, makeIframe(vs.url, titleText));
  }

  const notes = makeNotesList(vc.notes);
  if (notes) {
    mount(container, notes);
  }

  const qr = makeQrBlock(vs.qrImage);
  if (qr) {
    mount(container, qr);
  }
}

export function createVirtualSpaceLink(entryName) {
  const vs = getVirtualConfig();
  if (!vs) {
    return null;
  }
  const label = uiLabel('virtualMapCrossLink');
  return makeEnterButton(vs.url, entryName, label);
}
