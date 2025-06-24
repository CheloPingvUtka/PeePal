import { getCurrentUser } from './user.js';

export async function populateUserInfo() {
  const user = await getCurrentUser();
  if (!user) return;

  // Личный кабинет (lk.html)
  const usernameEl = document.querySelector('.user-link span:first-child');
  const phoneEl = document.querySelector('.user-phone');

  if (usernameEl) usernameEl.textContent = user.username || 'Без имени';
  if (phoneEl) phoneEl.textContent = user.phone || user.email || '—';

  // Профиль (profile.html)
  const nameBlocks = document.querySelectorAll('.info');

  if (nameBlocks.length >= 3) {
    nameBlocks[0].innerHTML = `<strong>${user.username}</strong><br/>Твоё имя`;
    nameBlocks[1].innerHTML = `${user.phone || '—'}<br/>Номер телефона`;
    nameBlocks[2].innerHTML = `${user.email || '—'}<br/>Email`;
  }
}
