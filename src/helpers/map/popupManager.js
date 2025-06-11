import { mapgl, map } from '../set-map';
import { loadPhotosByLocation } from '../form/loadPhotos.js';


let currentPopup = null;

export async function showLocationPopup(_, locationData) {
  // Удаляем предыдущий попап
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }

  const photos = await loadPhotosByLocation(locationData.id);

  const wrapper = document.createElement('div');
  wrapper.classList.add('centered-popup');
  wrapper.innerHTML = generatePopupHTML({ ...locationData, photos });
  console.log(locationData);
  document.body.appendChild(wrapper);

  currentPopup = wrapper; // сохраняем текущий попап

  setupPopupEvents(wrapper);
}


function generatePopupHTML({ address, category, filters = [], photos = [], description, rating = {} }) {
  const filterTags = filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('');
  const photoSlides = photos.length
    ? photos.map(url => `<img src="${url}" class="photo-slide" alt="Фото локации">`).join('')
    : `<div class="photo-placeholder">Фото отсутствуют</div>`;

  return `
    <div class="location-card">
      <div class="card-header">
        <h2 class="location-title">${address || 'Адрес не указан'}</h2>
      </div>

      <div class="location-category"><strong>Категория:</strong> ${category?.category_name || 'Не указана'}</div>
      <div class="location-tags">${filterTags}</div>

      <div class="photo-slider">${photoSlides}</div>

      <div class="location-description short">
        <strong>Описание:</strong>
        <p>${description || 'Описание отсутствует.'}</p>
        <button class="toggle-description">Показать больше</button>
      </div>

      <div class="location-rating">
        <div class="rating-summary">
          <span>⭐ Средняя оценка: ${rating.total || '–'}</span>
          <button class="open-detailed-rating">Подробнее</button>
        </div>

        <div class="rating-modal hidden">
          <div class="modal-content">
            <h3>Отзывы пользователей</h3>
            <p>Функция в разработке</p>
            <ul>
              <li>Чистота: ⭐ ${rating.clean || '–'}</li>
              <li>Удобство: ⭐ ${rating.comfort || '–'}</li>
              <li>Другое: ⭐ ${rating.other || '–'}</li>
            </ul>
            <button class="close-modal">Закрыть</button>
          </div>
        </div>
      </div>

      <div class="presence-buttons presence-bottom">
        <button id="minus" class="presence-btn">Отсутствует: <span class="count">0</span></button>
        <button id="plus" class="presence-btn">Присутствует: <span class="count">0</span></button>
      </div>

      <div class="location-actions">
        <button class="report-button">Отправить жалобу</button>
      </div>
    </div>
  `;
}


function setupPopupEvents(wrapper) {
  const html = wrapper;

  const destroyPopup = () => {
    wrapper.remove();
    if (currentPopup === wrapper) currentPopup = null;

    map.off('click', destroyPopup);
    document.querySelectorAll('#bottom-menu, .menu-item, #open-form-btn').forEach(el =>
      el.removeEventListener('click', destroyPopup)
    );
  };

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

  map.on?.('click', destroyPopup);

  document.querySelectorAll('#bottom-menu, .menu-item, #open-form-btn').forEach(el =>
    el.addEventListener('click', destroyPopup)
  );

  const canvas = document.querySelector('#container canvas');
  canvas?.addEventListener('click', destroyPopup, { once: true });
}


