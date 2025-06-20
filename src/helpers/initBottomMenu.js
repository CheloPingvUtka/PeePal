import { openFilterModal } from './openFilterModal.js';
import { requireAuth } from './auth/requireAuth.js';

export function initBottomMenu() {
  const firstButton = document.querySelector('#bottom-menu .menu-item:first-child');
  if (firstButton) {
    firstButton.addEventListener('click', openFilterModal);
  }

  const profileBtn = document.getElementById('profile-btn');
  
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {

      requireAuth(() => {
        window.location.href = './page/lk.html';
      }, 'profile');
    });
  } else {
    console.warn('⚠️ Кнопка профиля не найдена на странице');
  }
}
