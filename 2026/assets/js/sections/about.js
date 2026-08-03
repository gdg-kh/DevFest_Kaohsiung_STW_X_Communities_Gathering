import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getContent } from '../core/store.js';

function makeImageBlock(image, altText) {
  if (typeof image !== 'string' || image.length === 0) {
    return null;
  }
  const wrapper = el('div', { class: 'gk-about-media' });
  const img = el('img', {
    class: 'gk-about-image',
    attrs: {
      src: image,
      alt: altText || '',
      loading: 'lazy',
      width: '640',
      height: '360',
    },
  });
  mount(wrapper, img);
  return wrapper;
}

function makeTextBlock(titleText, bodyText) {
  const wrapper = el('div', { class: 'gk-about-text' });
  if (titleText) {
    mount(wrapper, el('h3', { class: 'gk-about-title', text: titleText }));
  }
  if (bodyText) {
    mount(
      wrapper,
      el('p', { class: 'gk-about-body gk-multiline', text: bodyText }),
    );
  }
  return wrapper;
}

function makeSection(section, index) {
  const titleText = t(section && section.title);
  const bodyText = t(section && section.body);
  const image = section && typeof section.image === 'string' ? section.image : '';
  const article = el('article', {
    class: `gk-about-section ${index % 2 === 0 ? 'gk-about-image-right' : 'gk-about-image-left'}`,
  });
  const textBlock = makeTextBlock(titleText, bodyText);
  const imageBlock = makeImageBlock(image, titleText);
  if (index % 2 === 0) {
    mount(article, textBlock);
    if (imageBlock) {
      mount(article, imageBlock);
    }
  } else {
    if (imageBlock) {
      mount(article, imageBlock);
    }
    mount(article, textBlock);
  }
  return article;
}

export function renderAbout(container) {
  if (!container) {
    return;
  }
  clear(container);
  const content = getContent();
  const about = content && content.about;
  const sections = about && Array.isArray(about.sections) ? about.sections : [];
  if (sections.length === 0) {
    return;
  }
  container.classList.add('gk-about-section-wrapper');
  sections.forEach((section, index) => {
    mount(container, makeSection(section, index));
  });
}
