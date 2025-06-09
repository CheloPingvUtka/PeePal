import { openFilterModal } from './openFilterModal.js';

export function initBottomMenu() {
  const firstButton = document.querySelector('#bottom-menu .menu-item:first-child');
  if (firstButton) {
    firstButton.addEventListener('click', openFilterModal);
  }
}
