import { getUsernameById } from './getUsernameById.js';

const urlParams = new URLSearchParams(window.location.search);
const publicUserId = urlParams.get('id');
const isPublic = !!publicUserId;

if (isPublic) {
  try {
    const username = await getUsernameById(publicUserId);
    const usernameElement = document.querySelector('#public-username');
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  } catch (e) {
    console.error('Ошибка при получении имени пользователя:', e);
  }
}

async function loadUserReviews() {
  const endpoint = isPublic
    ? `https://peepal.ru/api/reviews/public/by-user/${publicUserId}/`
    : `https://peepal.ru/api/reviews/reviews/by-user/`;

  const res = await fetch(endpoint, {
    credentials: isPublic ? 'omit' : 'include',
  });

  if (!res.ok) {
    console.error('Не удалось загрузить отзывы:', await res.text());
    return;
  }

  const reviews = await res.json();

  const container = document.getElementById('reviews-container');
  container.innerHTML = '';

  for (let r of reviews) {
    const photosRes = await fetch(`https://peepal.ru/api/reviews/photos/?location=${r.location}`);
    const photos = await photosRes.json();

    const photoHtml = photos.map(p => `<img src="${p.photo_url}" class="review-photo" />`).join('');

    const locationRes = await fetch(`https://peepal.ru/api/locations/locations/${r.location}`);
    const location = await locationRes.json();

    const filtersHtml = location.filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('');
    const categoryName = location.category.category_name;

    const el = document.createElement('div');
    el.className = 'review-card';
    el.innerHTML = `
      ${!isPublic ? `<a href="/index.html#loc-${r.location}" class="review-edit">✎</a>` : ''}
      <div class="review-photos">${photoHtml}</div>
      <div class="review-info">
          <a href="/index.html#loc-${r.location}">${location.address}</a>
          <div class="category-filters">
              <div class="cat">${categoryName}</div>
              <div class="filters">${filtersHtml}</div>
          </div>
          <div>Чистота: ⭐ ${r.rating_clean}</div>
          <div>Удобство: ⭐ ${r.rating_access}</div>
          <div>Другое: ⭐ ${r.rating_other ?? '-'}</div>
          <p>${r.text || ''}</p>
          <small>${new Date(r.created_at).toLocaleDateString()}</small>
      </div>
    `;
    container.appendChild(el);
  }
}

loadUserReviews();