import { mapgl, map } from '../set-map';
import { loadPhotosByLocation } from '../form/loadPhotos.js';
import { loadPresenceStats, sendPresenceVote } from '../review/presence.js';
import { setupReviewForm } from '../review/reviewForm.js';


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


function generatePopupHTML({ id, address, category, filters = [], photos = [], description, rating = {} }) {

  const filterTags = filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('');
  const photoSlides = photos.length
    ? photos.map(url => `<img src="${url}" class="photo-slide" alt="Фото локации">`).join('')
    : `<div class="photo-placeholder">Фото отсутствуют</div>`;

  return `
    <div class="location-card">
      <div class="card-header">
        <h2 class="location-title" data-location-id="${id}">${address || 'Адрес не указан'}</h2>
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
    
      <div class="review-form-wrapper">
        <button id="toggle-review-form" class="review-toggle-btn">Оставить отзыв</button>
        <form id="review-form" class="hidden">
          <div class="photo-upload">
            <label class="custom-file-input" for="review-photo">Выбрать фото</label>
            <input type="file" id="review-photo" accept="image/*" multiple>
            <div id="review-photo-preview" class="preview-container"></div>
          </div>

          <textarea id="review-text" placeholder="Ваш отзыв..."></textarea>

          <div class="rating-wrapper">
            <label>Оцените:</label>
            <div>
              <span>Чистота</span>
              <div class="stars">${generateStars('review-clean')}</div>
            </div>
            <div>
              <span>Удобство</span>
              <div class="stars">${generateStars('review-conv')}</div>
            </div>
            <div>
              <span>Другое</span>
              <div class="stars">${generateStars('review-other')}</div>
            </div>
          </div>

          <button type="submit" class="moder-btn">Отправить отзыв</button>
        </form>
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


function generateStars(name) {
  return [...Array(5)].map((_, i) => `
    <input type="radio" id="${name}-${5 - i}" name="${name}" value="${5 - i}">
    <label for="${name}-${5 - i}">★</label>
  `).join('');
}


async function setupPopupEvents(wrapper) {
  const html = wrapper;

  const minusBtn = html.querySelector('#minus');
  const plusBtn = html.querySelector('#plus');

  const locationId = parseInt(wrapper.querySelector('.location-title')?.dataset?.locationId);
  const stats = await loadPresenceStats(locationId);
  setupReviewForm(wrapper, locationId);

  minusBtn.querySelector('.count').textContent = stats.absent;
  plusBtn.querySelector('.count').textContent = stats.present;

  minusBtn.addEventListener('click', async () => {
    const success = await sendPresenceVote({ locationId, vote: 'absent' });
    if (success) {
      const updated = await loadPresenceStats(locationId);
      minusBtn.querySelector('.count').textContent = updated.absent;
      plusBtn.querySelector('.count').textContent = updated.present;
    }
  });

  plusBtn.addEventListener('click', async () => {
    const success = await sendPresenceVote({ locationId, vote: 'present' });
    if (success) {
      const updated = await loadPresenceStats(locationId);
      minusBtn.querySelector('.count').textContent = updated.absent;
      plusBtn.querySelector('.count').textContent = updated.present;
    }
  });

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


