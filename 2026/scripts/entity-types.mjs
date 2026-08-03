export const ENTITY_TYPES = [
  {
    key: 'speakers',
    source: 'speakers',
    ogLayout: 'person',
    ogType: 'profile',
    schema: 'Person',
    imageExt: '.jpg',
  },
  {
    key: 'staff',
    source: 'staff',
    ogLayout: 'person',
    ogType: 'profile',
    schema: 'Person',
    imageExt: '.jpg',
  },
  {
    key: 'thanks',
    source: 'thanks',
    ogLayout: 'logo',
    ogType: 'website',
    schema: 'Organization',
    imageExt: '.png',
  },
  {
    key: 'booths',
    source: 'booths',
    ogLayout: 'logo',
    ogType: 'website',
    schema: 'Organization',
    imageExt: '.png',
  },
];

const TYPE_MAP = ENTITY_TYPES.reduce((acc, entry) => {
  acc[entry.key] = entry;
  return acc;
}, {});

export function getEntityType(type) {
  return TYPE_MAP[type] || null;
}

export function assetPath(type, id) {
  const entry = TYPE_MAP[type];
  if (!entry) {
    return '';
  }
  return `images/${type}/${id}${entry.imageExt}`;
}

export function ogPath(type, id) {
  return `images/og/${type}/${id}.png`;
}
