import { el, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getConfig } from '../core/store.js';

function siteHeaderText() {
  const config = getConfig();
  const site = config && config.site;
  const ui = config && config.ui;
  const eventName = t(site && site.eventName);
  const headerText = t(ui && ui.ballotHeaderText);
  const parts = [];
  if (eventName) {
    parts.push(eventName);
  }
  if (headerText) {
    parts.push(headerText);
  }
  return parts.join(' ');
}

export function ballotCard(opts) {
  const options = opts && typeof opts === 'object' ? opts : {};
  const decorative = options.decorative === true;
  const nameText = t(options.name);
  const groupText = t(options.groupName);
  const clickable = typeof options.onClick === 'function' && !decorative;

  const attrs = {};
  if (decorative) {
    attrs['aria-hidden'] = 'true';
    attrs.tabindex = '-1';
  } else if (clickable) {
    attrs.role = 'button';
    attrs.tabindex = '0';
    attrs['aria-label'] = nameText || '';
  }

  const card = el('article', {
    class: 'gk-ballot-card',
    attrs,
  });

  const header = el('div', { class: 'gk-ballot-header' });
  const headerLeft = el('span', {
    class: 'gk-ballot-header-title',
    text: siteHeaderText(),
  });
  mount(header, headerLeft);
  if (groupText) {
    mount(header, el('span', { class: 'gk-ballot-header-group', text: groupText }));
  }
  mount(card, header);

  const body = el('div', { class: 'gk-ballot-body' });
  const logoWrapper = el('div', { class: 'gk-ballot-logo-wrapper' });
  if (typeof options.image === 'string' && options.image.length > 0) {
    const img = el('img', {
      class: 'gk-ballot-logo',
      attrs: {
        src: options.image,
        alt: nameText || '',
        loading: 'lazy',
        width: '160',
        height: '56',
      },
    });
    mount(logoWrapper, img);
  }
  mount(body, logoWrapper);
  if (nameText) {
    mount(body, el('div', { class: 'gk-ballot-name', text: nameText }));
  }
  mount(card, body);

  const box = el('div', { class: 'gk-ballot-checkbox' });
  const mark = el('span', { class: 'gk-ballot-checkmark', attrs: { 'aria-hidden': 'true' } });
  mount(box, mark);
  mount(card, box);

  if (clickable) {
    card.addEventListener('click', (event) => {
      options.onClick(event);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        options.onClick(event);
      }
    });
  }

  return card;
}
