export function getPopupHtml(loc) {
  return `
    <div class="location-card">
      <h2 class="location-title">${loc.title || 'Название неизвестно'}</h2>

      <div class="location-address">📍 ${loc.address || 'Адрес неизвестен'}</div>

      <div class="location-description short">
        ${loc.description || 'Нет описания'}
        <button class="toggle-description">Показать больше</button>
      </div>

      <div class="location-tags">
        ${(loc.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>

      <div class="location-rating">
        <span>⭐ ${loc.avg_rating || 'Нет оценки'}</span>
        <button class="open-detailed-rating">Подробнее</button>
      </div>

      <div class="rating-modal hidden">
        <div class="modal-content">
          <h3>Оценки пользователей</h3>
          <ul>
            <li>Чистота: ⭐ ${loc.cleanliness || '—'}</li>
            <li>Удобство: ⭐ ${loc.comfort || '—'}</li>
            <li>Другое: ⭐ ${loc.other || '—'}</li>
          </ul>
          <button class="close-modal">Закрыть</button>
        </div>
      </div>
    </div>
  `;
}
