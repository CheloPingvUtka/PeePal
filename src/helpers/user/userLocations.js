async function getAverageRatingForLocation(locationId) {
  const res = await fetch(`http://localhost:8000/api/reviews/reviews/by-location/${locationId}`);
  const reviews = await res.json();

  if (reviews.length === 0) return null;

  const sum = {
    clean: 0,
    access: 0,
    other: 0,
  };

  reviews.forEach(r => {
    sum.clean += r.rating_clean || 0;
    sum.access += r.rating_access || 0;
    sum.other += r.rating_other || 0;
  });

  const avg = {
    clean: (sum.clean / reviews.length).toFixed(1),
    access: (sum.access / reviews.length).toFixed(1),
    other: (sum.other / reviews.length).toFixed(1),
    total: ((sum.clean + sum.access + sum.other) / (3 * reviews.length)).toFixed(1)
  };

  return avg;
}


async function loadUserLocations() {
  const res = await fetch(`http://localhost:8000/api/locations/locations/by_user/`, {
    credentials: 'include',
  });
  const locations = await res.json();

  const container = document.getElementById('locations-container');
  container.innerHTML = '';

  for (let loc of locations) {
    // Получаем фото
    const photosRes = await fetch(`http://localhost:8000/api/reviews/photos/?location=${loc.id}`);
    const photos = await photosRes.json();
    const photoHtml = photos.map(p => `<img src="${p.photo_url}" class="review-photo" />`).join('');

    // Получаем фильтры и категорию
    const filtersHtml = loc.filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('');
    const categoryName = loc.category?.category_name || 'Без категории';
    const rating = await getAverageRatingForLocation(loc.id);

    const starsHTML = rating
      ? `<div class="location-stars">⭐ ${rating.total}</div>`
      : `<div class="location-stars">⭐ Оценок пока нет</div>`;

    const el = document.createElement('div');
    el.className = 'review-card';
    el.innerHTML = `
      <a href="/index.html#loc-${loc.id}" class="review-edit">✎</a>
      <div class="review-photos">${photoHtml}</div>
      <div class="review-info">
          <a href="/index.html#loc-${loc.id}">${loc.address}</a>
          <div class="category-filters">
              <div class="cat">${loc.category.category_name}</div>
              <div class="filters">${loc.filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('')}</div>
          </div>
          ${starsHTML}
          <p>${loc.description || ''}</p>
          <small>${new Date(loc.created_at).toLocaleDateString()}</small>
      </div>
    `;
    container.appendChild(el);
  }
}

loadUserLocations();
