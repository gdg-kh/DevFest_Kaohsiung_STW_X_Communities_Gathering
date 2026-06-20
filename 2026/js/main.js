/*
 * DevFest 2026 高雄場 — 活動預告頁
 * 由 data/config.json 驅動所有顯示內容與倒數計時。
 */

/**
 * 依點號路徑（如 'event.name'）從物件取值。
 * @param {object} obj 來源物件
 * @param {string} path 點號路徑
 * @returns {*} 對應值，找不到時回傳 undefined
 */
const getByPath = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);

/**
 * 判斷值是否存在（非 null 且非 undefined）。
 * @param {*} value 待檢查的值
 * @returns {boolean}
 */
const isPresent = (value) => value !== undefined && value !== null;

/**
 * 將設定填入帶有 data-bind / data-bind-attr 屬性的元素。
 * @param {object} config 設定資料
 */
const bindStaticContent = (config) => {
  // 文字內容綁定：<el data-bind="event.name">
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const value = getByPath(config, el.getAttribute('data-bind'));
    if (isPresent(value)) {
      el.textContent = value;
    }
  });

  // 屬性綁定：<el data-bind-attr="content:site.description">
  document.querySelectorAll('[data-bind-attr]').forEach((el) => {
    el.getAttribute('data-bind-attr')
      .split(',')
      .forEach((pair) => {
        const [attr, path] = pair.split(':').map((part) => part.trim());
        const value = getByPath(config, path);
        if (attr && isPresent(value)) {
          el.setAttribute(attr, value);
        }
      });
  });
};

/**
 * 渲染意願問卷卡片。
 * @param {object} surveys surveys 設定
 */
const renderSurveys = (surveys) => {
  const grid = document.getElementById('surveys-grid');
  if (!grid || !surveys || !Array.isArray(surveys.items)) {
    return;
  }

  grid.innerHTML = '';
  surveys.items.forEach((item) => {
    const card = document.createElement('a');
    card.className = 'survey-card';
    card.href = item.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = `
      <span class="survey-card__icon" aria-hidden="true">${item.icon ?? ''}</span>
      <span class="survey-card__title">${item.title ?? ''}</span>
      <span class="survey-card__desc">${item.description ?? ''}</span>
      <span class="survey-card__button">${item.buttonText ?? '填寫問卷'}</span>
    `;
    grid.appendChild(card);
  });
};

/**
 * 渲染頁尾連結。
 * @param {object} footer footer 設定
 */
const renderFooterLinks = (footer) => {
  const container = document.getElementById('footer-links');
  if (!container || !footer || !Array.isArray(footer.links)) {
    return;
  }

  container.innerHTML = '';
  footer.links.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.text;
    container.appendChild(anchor);
  });
};

/**
 * 啟動倒數計時器。
 * @param {object} config 設定資料
 */
const initCountdown = (config) => {
  const labels = config.countdownLabels ?? {};
  const labelMap = {
    'label-days': labels.days,
    'label-hours': labels.hours,
    'label-minutes': labels.minutes,
    'label-seconds': labels.seconds,
  };
  Object.entries(labelMap).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el && isPresent(text)) {
      el.textContent = text;
    }
  });

  const targetDate = new Date(config.event.countdownTarget).getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const timerEl = document.getElementById('countdown-timer');
  const endedEl = document.getElementById('countdown-ended');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }

  const showEnded = () => {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    if (timerEl) {
      timerEl.hidden = true;
    }
    if (endedEl) {
      endedEl.textContent = config.event.countdownEndedText ?? '活動已經開始！';
      endedEl.hidden = false;
    }
  };

  const updateCountdown = () => {
    const distance = targetDate - Date.now();
    if (Number.isNaN(targetDate) || distance < 0) {
      showEnded();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
};

/**
 * 載入設定並初始化頁面。
 */
const init = async () => {
  try {
    const response = await fetch('data/config.json');
    if (!response.ok) {
      throw new Error(`無法載入 config.json（HTTP ${response.status}）`);
    }
    const config = await response.json();

    if (config.site && config.site.lang) {
      document.documentElement.lang = config.site.lang;
    }

    bindStaticContent(config);
    renderSurveys(config.surveys);
    renderFooterLinks(config.footer);
    initCountdown(config);
  } catch (error) {
    console.error('初始化失敗：', error);
  }
};

document.addEventListener('DOMContentLoaded', init);
