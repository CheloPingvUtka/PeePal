export async function loadUserStats() {
  try {
    const res = await fetch('https://peepal.ru/api/user/stats/', {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Ошибка запроса');

    const data = await res.json();

    // Вставка данных в HTML
    document.querySelector('.stat-value.reviews').textContent = `${data.reviews_count} отзывов`;
    document.querySelector('.stat-value.pending').textContent = `${data.pending_locations_count} места`;
  } catch (error) {
    console.error('Ошибка загрузки статистики пользователя:', error);
  }
}
