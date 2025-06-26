const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (userId) {
  loadPublicUserInfo(userId);
} else {
  document.querySelector('#username').textContent = 'Пользователь не найден';
}


export async function loadPublicUserInfo(userId) {
  try {
    const res = await fetch(`http://localhost:8000/auth/public/${userId}/`);
    if (!res.ok) throw new Error('Ошибка запроса');

    const user = await res.json();

    document.querySelector('#username').textContent = user.username || 'Без имени';
    document.querySelector('#phone').textContent = user.phone || user.email || '–';

    document.querySelector('#reviews-count').textContent = `${user.reviews_count || 0} отзывов`;
    document.querySelector('#locations-count').textContent = `${user.locations_count || 0} мест`;

  } catch (error) {
    console.error('Ошибка загрузки профиля пользователя:', error);
    document.querySelector('#username').textContent = 'Ошибка загрузки';
  }
}
