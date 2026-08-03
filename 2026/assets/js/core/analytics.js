let initialized = false;

function ensureGtag() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (typeof window.gtag === 'function') {
    return window.gtag;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  return window.gtag;
}

export function initAnalytics(ga4Id) {
  if (typeof ga4Id !== 'string' || ga4Id.length === 0) {
    return;
  }
  if (initialized) {
    return;
  }
  initialized = true;
  const gtag = ensureGtag();
  if (!gtag) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', ga4Id);
}

export function track(eventName, params = {}) {
  if (!initialized) {
    return;
  }
  if (typeof eventName !== 'string' || eventName.length === 0) {
    return;
  }
  const gtag = typeof window !== 'undefined' ? window.gtag : null;
  if (typeof gtag !== 'function') {
    return;
  }
  gtag('event', eventName, params);
}

export function trackPageView(path, title) {
  track('page_view', { page_path: path, page_title: title });
}
