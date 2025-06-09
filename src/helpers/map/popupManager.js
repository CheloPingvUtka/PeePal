import { mapgl, map } from '../set-map';


let currentPopup = null;

export function showLocationPopup(coord, locationData) {
  // Закрываем старый попап если он есть
  if (currentPopup) {
    destroyPopup();
  }

  const popup = new mapgl.HtmlMarker(map, {
    coordinates: coord,
    html: generatePopupHTML(locationData),
  });

  currentPopup = popup;
  setupPopupEvents(popup);
}

function generatePopupHTML({ name, address, description, tags = [], rating = {} }) {
  const tagSpans = tags.map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="location-card">
      <h2 class="location-title">${name || 'Без названия'}</h2>
      <div class="location-address">📍 ${address || 'Адрес не указан'}</div>
      <div class="location-description short">
        ${description || 'Описание отсутствует'}
        <button class="toggle-description">Показать больше</button>
      </div>
      <div class="location-tags">${tagSpans}</div>
      <div class="location-rating">
        <span>⭐ ${rating.total || '–'}</span>
        <button class="open-detailed-rating">Подробнее</button>
      </div>
    </div>
    <div class="rating-modal hidden">
      <div class="modal-content">
        <h3>Оценки пользователей</h3>
        <ul>
          <li>Чистота: ⭐ ${rating.clean || '–'}</li>
          <li>Удобство: ⭐ ${rating.comfort || '–'}</li>
          <li>Другое: ⭐ ${rating.other || '–'}</li>
        </ul>
        <button class="close-modal">Закрыть</button>
      </div>
    </div>`;
}

function setupPopupEvents(popup) {
  const html = popup.getContent();

  html.querySelectorAll('.toggle-description').forEach(button => {
    button.addEventListener('click', () => {
      const desc = button.closest('.location-description');
      desc.classList.toggle('short');
      button.textContent = desc.classList.contains('short') ? 'Показать больше' : 'Скрыть';
    });
  });

  const openBtn = html.querySelector('.open-detailed-rating');
  const modal = html.querySelector('.rating-modal');
  const closeBtn = html.querySelector('.close-modal');

  openBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Закрытие по клику на карту
  map.on('click', destroyPopup);

  // Закрытие по нажатию на элементы меню
  document.querySelectorAll('#bottom-menu, .menu-item, #open-form-btn').forEach(el =>
    el.addEventListener('click', destroyPopup)
  );
}

function destroyPopup() {
  if (!currentPopup) return;

  currentPopup.destroy();
  currentPopup = null;

  // Удаляем обработчики событий
  map.off('click', destroyPopup);
  document.querySelectorAll('#bottom-menu, .menu-item, #open-form-btn').forEach(el =>
    el.removeEventListener('click', destroyPopup)
  );
}

