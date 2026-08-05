import { el, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';

function attachActivation(node, onClick) {
  if (typeof onClick !== 'function') {
    return;
  }
  node.addEventListener('click', (event) => {
    onClick(event);
  });
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      onClick(event);
    }
  });
}

function makeCard(className, onClick, ariaLabel) {
  const attrs = {
    role: 'button',
    tabindex: '0',
  };
  if (typeof ariaLabel === 'string' && ariaLabel.length > 0) {
    attrs['aria-label'] = ariaLabel;
  }
  const card = el('article', {
    class: className,
    attrs,
  });
  attachActivation(card, onClick);
  return card;
}

function makePersonImage(image, name) {
  const wrapper = el('div', { class: 'gk-card-media gk-card-media-person' });
  if (typeof image === 'string' && image.length > 0) {
    const img = el('img', {
      class: 'gk-card-image gk-card-image-person',
      attrs: {
        src: image,
        alt: name || '',
        loading: 'lazy',
        width: '320',
        height: '320',
      },
    });
    mount(wrapper, img);
  }
  return wrapper;
}

function makeLogoImage(image, name) {
  const wrapper = el('div', { class: 'gk-card-media gk-card-media-logo' });
  if (typeof image === 'string' && image.length > 0) {
    const img = el('img', {
      class: 'gk-card-image gk-card-image-logo',
      attrs: {
        src: image,
        alt: name || '',
        loading: 'lazy',
        width: '240',
        height: '160',
      },
    });
    mount(wrapper, img);
  }
  return wrapper;
}

function joinAffiliation(titleText, orgText) {
  if (titleText && orgText) {
    return `${titleText} · ${orgText}`;
  }
  return titleText || orgText || '';
}

function appendTextBlock(card, name, subtitle, description, affiliationText) {
  const body = el('div', { class: 'gk-card-body' });
  const nameText = t(name);
  if (nameText) {
    mount(body, el('h3', { class: 'gk-card-name', text: nameText }));
  }
  if (affiliationText) {
    mount(body, el('p', { class: 'gk-card-affiliation', text: affiliationText }));
  }
  const subtitleText = t(subtitle);
  if (subtitleText) {
    mount(body, el('p', { class: 'gk-card-subtitle', text: subtitleText }));
  }
  const descriptionText = t(description);
  if (descriptionText) {
    mount(body, el('p', { class: 'gk-card-description', text: descriptionText }));
  }
  mount(card, body);
}

export function personCard(opts) {
  const options = opts && typeof opts === 'object' ? opts : {};
  const nameText = t(options.name);
  const card = makeCard('gk-card gk-person-card', options.onClick, nameText);
  const media = makePersonImage(options.image, nameText);
  mount(card, media);
  const affiliationText = joinAffiliation(t(options.title), t(options.org));
  appendTextBlock(card, options.name, options.subtitle, options.description, affiliationText);
  return card;
}

export function logoCard(opts) {
  const options = opts && typeof opts === 'object' ? opts : {};
  const nameText = t(options.name);
  const card = makeCard('gk-card gk-logo-card', options.onClick, nameText);
  mount(card, makeLogoImage(options.image, nameText));
  const body = el('div', { class: 'gk-card-body gk-card-body-center' });
  if (nameText) {
    mount(body, el('h3', { class: 'gk-card-name', text: nameText }));
  }
  const descriptionText = t(options.description);
  if (descriptionText) {
    mount(body, el('p', { class: 'gk-card-description', text: descriptionText }));
  }
  mount(card, body);
  return card;
}

export function sessionCard(opts) {
  const options = opts && typeof opts === 'object' ? opts : {};
  const titleText = t(options.title);
  const card = makeCard('gk-card gk-session-card', options.onClick, titleText);

  const header = el('div', { class: 'gk-session-header' });
  if (typeof options.time === 'string' && options.time.length > 0) {
    mount(header, el('span', { class: 'gk-session-time', text: options.time }));
  }
  const groupText = t(options.groupName);
  if (groupText) {
    const chip = el('span', { class: 'gk-session-group', text: groupText });
    if (typeof options.groupColor === 'string' && options.groupColor.length > 0) {
      chip.style.backgroundColor = options.groupColor;
    }
    mount(header, chip);
  }
  if (header.childNodes.length > 0) {
    mount(card, header);
  }

  if (titleText) {
    mount(card, el('h3', { class: 'gk-session-title', text: titleText }));
  }

  const speakers = Array.isArray(options.speakers) ? options.speakers : [];
  if (speakers.length > 0) {
    const row = el('div', { class: 'gk-session-speakers' });
    for (const speaker of speakers) {
      if (!speaker) {
        continue;
      }
      const speakerName = t(speaker.name);
      const item = el('div', { class: 'gk-session-speaker' });
      if (typeof speaker.image === 'string' && speaker.image.length > 0) {
        mount(
          item,
          el('img', {
            class: 'gk-session-speaker-avatar',
            attrs: {
              src: speaker.image,
              alt: speakerName || '',
              loading: 'lazy',
              width: '32',
              height: '32',
            },
          })
        );
      }
      if (speakerName) {
        mount(item, el('span', { class: 'gk-session-speaker-name', text: speakerName }));
      }
      mount(row, item);
    }
    mount(card, row);
  }

  return card;
}
