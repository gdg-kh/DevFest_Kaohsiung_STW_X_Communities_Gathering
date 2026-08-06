import { el, clear, mount } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getContent, getConfig, getSortedList, assetPath } from '../core/store.js';
import { personCard } from '../ui/card.js';
import { openModal } from '../ui/detail-modal.js';
import { buildStaffPayload } from '../ui/detail-payload.js';
import { track } from '../core/analytics.js';

function openStaffModal(staff) {
  track('select_staff', { staff_id: staff.id });
  openModal(buildStaffPayload(staff));
}

function makeCardFor(staff) {
  return personCard({
    image: assetPath('staff', staff.id),
    name: staff.name,
    subtitle: staff.role,
    description: staff.bio,
    onClick: () => openStaffModal(staff),
  });
}

function renderEmptyState(container) {
  const config = getConfig();
  const ui = config && config.ui;
  const message = t(ui && ui.emptyStateText);
  const empty = el('p', {
    class: 'gk-staff-empty',
    text: message,
  });
  mount(container, empty);
}

export function renderStaff(container) {
  if (!container) {
    return;
  }
  clear(container);
  container.classList.add('gk-staff-section');

  const content = getContent();
  const staff = Array.isArray(content && content.staff) ? getSortedList('staff') : [];

  if (staff.length === 0) {
    renderEmptyState(container);
    return;
  }

  const grid = el('div', { class: 'gk-staff-grid' });
  for (const person of staff) {
    mount(grid, makeCardFor(person));
  }
  mount(container, grid);
}
