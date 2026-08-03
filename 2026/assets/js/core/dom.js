function appendChildValue(parent, value) {
  if (value === null || value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      appendChildValue(parent, item);
    }
    return;
  }
  if (typeof value === 'string') {
    parent.appendChild(document.createTextNode(value));
    return;
  }
  if (value instanceof Node) {
    parent.appendChild(value);
  }
}

export function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  const options = opts && typeof opts === 'object' ? opts : {};

  if (options.class !== undefined && options.class !== null) {
    if (Array.isArray(options.class)) {
      node.className = options.class.filter((c) => typeof c === 'string' && c.length > 0).join(' ');
    } else if (typeof options.class === 'string') {
      node.className = options.class;
    }
  }

  if (typeof options.text === 'string') {
    node.textContent = options.text;
  }

  if (options.attrs && typeof options.attrs === 'object') {
    for (const key of Object.keys(options.attrs)) {
      const value = options.attrs[key];
      if (value === null || value === undefined) {
        continue;
      }
      node.setAttribute(key, String(value));
    }
  }

  if (options.on && typeof options.on === 'object') {
    for (const eventName of Object.keys(options.on)) {
      const handler = options.on[eventName];
      if (typeof handler === 'function') {
        node.addEventListener(eventName, handler);
      }
    }
  }

  appendChildValue(node, children);
  return node;
}

export function clear(node) {
  if (!node) {
    return;
  }
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function mount(parent, ...children) {
  if (!parent) {
    return parent;
  }
  appendChildValue(parent, children);
  return parent;
}
