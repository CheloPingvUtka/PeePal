import { getUsernameById } from './getUsernameById.js';

const userId = new URLSearchParams(window.location.search).get('id');
const username = await getUsernameById(userId);

document.querySelector('#public-username').textContent = username;


const urlParams = new URLSearchParams(window.location.search);
const publicUserId = urlParams.get('id');
const isPublic = !!publicUserId;

async function loadUserReviews() {
  const endpoint = isPublic
    ? `http://localhost:8000/api/reviews/public/by-user/${publicUserId}/`
    : `http://localhost:8000/api/reviews/reviews/by-user/`;

  const res = await fetch(endpoint, {
    credentials: isPublic ? 'omit' : 'include',
  });
  const reviews = await res.json();

  const container = document.getElementById('reviews-container');
  container.innerHTML = '';

  for (let r of reviews) {
    const photosRes = await fetch(`http://localhost:8000/api/reviews/photos/?location=${r.location}`);
    const photos = await photosRes.json();

    const photoHtml = photos.map(p => `<img src="${p.photo_url}" class="review-photo" />`).join('');

    const locationRes = await fetch(`http://localhost:8000/api/locations/locations/${r.location}`);
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
