import { mapgl, map } from '../set-map';
import { loadPhotosByLocation } from '../form/loadPhotos.js';
import { loadPresenceStats, sendPresenceVote } from '../review/presence.js';
import { setupReviewForm } from '../review/reviewForm.js';
import { resetReviewPreview } from '../review/resetReviewPreview.js';
import { loadReviewsByLocation } from '../review/loadReviews.js';
import { getUserCoordinates } from './getUserCoordinates.js';


let currentPopup = null;
const routeLines = [];

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

  setupPopupEvents(wrapper, locationData);
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
          <div class="modal-content enhanced-reviews">
            <button class="close-modal top-right">×</button>
            <h3>Средняя оценка</h3>
            <div class="rating-summary-breakdown">
              <ul>
                <li>Чистота: ⭐ ${rating.clean || '–'}</li>
                <li>Удобство: ⭐ ${rating.comfort || '–'}</li>
                <li>Доступность: ⭐ ${rating.other || '–'}</li>
              </ul>
            </div>
            <h3>Отзывы пользователей</h3>
            <div class="user-reviews">
              <!-- Отзывы загружаются сюда динамически -->
            </div>
          </div>
        </div>
    
      <div class="review-form-wrapper">
        <button id="toggle-review-form" class="review-toggle-btn">Оставить отзыв</button>
        <form id="review-form" class="hidden">
          <div class="photo-upload">
            <label for="review-photo-input">Загрузить фото</label>
            <label class="custom-file-input" for="review-photo-input">Выбрать файлы</label>
            <input type="file" id="review-photo-input" accept="image/*" multiple />
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
              <span>Доступность</span>
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
        <button class="route-button">Построить маршрут</button>
        <button class="report-button">Закрыть окно</button>
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


async function setupPopupEvents(wrapper, locationData) {
  const html = wrapper;

  const minusBtn = html.querySelector('#minus');
  const plusBtn = html.querySelector('#plus');

  const locationId = parseInt(wrapper.querySelector('.location-title')?.dataset?.locationId);
  let stats;
  try {
    stats = await loadPresenceStats(locationId);
  } catch (e) {
    console.error('Ошибка при загрузке presence stats', e);
    return;
  }

  let reviews;
  try {
    reviews = await loadReviewsByLocation(locationId);
  } catch (e) {
    console.error('Ошибка при загрузке loadReviewsByLocation', e);
    return;
  }

  const reviewsContainer = wrapper.querySelector('.user-reviews');

  html.querySelector('.route-button')?.addEventListener('click', async () => {
    const userCoords = await getUserCoordinates(); // [lat, lon]
    const targetCoords = [parseFloat(locationData.latitude), parseFloat(locationData.longitude)];
    
    const response = await fetch('https://routing.api.2gis.com/routing/7.0.0/global?key=b51c5279-1c87-4a9c-9fbe-b39d0b3fdc94', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points: [
          { type: 'stop', lon: userCoords[1], lat: userCoords[0] },
          { type: 'stop', lon: targetCoords[1], lat: targetCoords[0] }
        ],
        transport: 'walking',
        route_mode: 'fastest',
        traffic_mode: 'jam'
      }),
    });
    
    const data = await response.json();
    if (!data.result || !data.result[0]) {
      alert('Маршрут не найден');
      return;
    }
    
    
    function parseLineString(lineString) {
      return lineString
      .replace('LINESTRING(', '')
      .replace(')', '')
      .split(', ')
      .map(coord => {
        const [lon, lat] = coord.split(' ').map(Number);
        return [lon, lat];
      });
    }
    
    
    const route = data.result[0];
    const pathCoordinates = [];
    
    // Закрыть попап
    wrapper.remove();
    currentPopup = null;
    
    // Собираем координаты начала
    if (route.begin_pedestrian_path?.geometry?.selection) {
      pathCoordinates.push(...parseLineString(route.begin_pedestrian_path.geometry.selection));
    }
    
    // Удаление предыдущих маршрутов
    routeLines.forEach(line => line.destroy());
    routeLines.length = 0;
    
    // Добавляем все отрезки из манёвров
    for (const maneuver of route.maneuvers || []) {
      const geometrySegments = maneuver.outcoming_path?.geometry || [];
      for (const segment of geometrySegments) {
        const coords = parseLineString(segment.selection);
        pathCoordinates.push(...coords);
      }
    }
    
    // Добавляем координаты конца
    if (route.end_pedestrian_path?.geometry?.selection) {
      pathCoordinates.push(...parseLineString(route.end_pedestrian_path.geometry.selection));
    }

    // Отрисовка линии маршрута
    const line = new mapgl.Polyline(map, {
      coordinates: pathCoordinates,
      color: '#0088ff',
      width: 4,
    });
    routeLines.push(line);

  });


  // добавим каждый отзыв
  if (Array.isArray(reviews)) {
    reviews.forEach(review => {
      const item = document.createElement('li');
      item.innerHTML = `
        <strong><a href="src/page/user-profile.html?id=${review.user}">${review.user_name}</a></strong><br>
        ${review.text ? `<p>${review.text}</p>` : ''}
        <span>Чистота: ⭐ ${review.rating_clean}</span><br>
        <span>Удобство: ⭐ ${review.rating_access}</span><br>
        <span>Доступность: ⭐ ${review.rating_other}</span><br>
      `;
      reviewsContainer.appendChild(item);
    });
  } else {
    console.warn('❌ Отзывы не загружены или пришли не в виде массива:', reviews);
  }

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
    // Если в карточке есть форма отзыва — сбросить её перед удалением
    const reviewForm = wrapper.querySelector('#review-form');
    if (reviewForm) {
      resetReviewPreview(wrapper);
    }

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

  document.querySelectorAll('#bottom-menu, .menu-item, #open-form-btn, .report-button').forEach(el =>
    el.addEventListener('click', destroyPopup)
  );

  const canvas = document.querySelector('#container canvas');
  canvas?.addEventListener('click', destroyPopup, { once: true });
}


