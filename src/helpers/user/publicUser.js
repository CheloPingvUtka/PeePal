const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (userId) {
  loadPublicUserInfo(userId);
} else {
  document.querySelector('#username').textContent = 'Пользователь не найден';
}


export async function loadPublicUserInfo(userId) {
  try {
    const res = await fetch(`https://peepal.ru/auth/public/${userId}/`);
    if (!res.ok) throw new Error('Ошибка запроса');

    const user = await res.json();

    document.querySelector('#username').textContent = user.username || 'Без имени';
    document.querySelector('#phone').textContent = user.phone || user.email || '–';

    // Создаём статистику с кликабельными ссылками
    const statsContainer = document.querySelector('.stats');
    statsContainer.innerHTML = `
      <a href="public-reviews.html?id=${userId}" class="stat-box">
        <div class="stat-title">Отзывы</div>
        <div class="stat-value">${user.reviews_count || 0} отзывов</div>
      </a>
      <a href="public-locations.html?id=${userId}" class="stat-box">
        <div class="stat-title">Локации</div>
        <div class="stat-value">${user.locations_count || 0} мест</div>
      </a>
    `;

  } catch (error) {
    console.error('Ошибка загрузки профиля пользователя:', error);
    document.querySelector('#username').textContent = 'Ошибка загрузки';
  }
}

