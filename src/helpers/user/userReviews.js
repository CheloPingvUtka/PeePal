async function loadUserReviews() {
  const res = await fetch(`http://localhost:8000/api/reviews/reviews/by-user/`, {
    credentials: 'include',
  });
  const reviews = await res.json();

  const container = document.getElementById('reviews-container');
  container.innerHTML = '';

  for (let r of reviews) {
    // Получаем фотографии
    const photosRes = await fetch(`http://localhost:8000/api/reviews/photos/?location=${r.location}`);
    const photos = await photosRes.json();
    const photoHtml = photos.map(p => `<img src="${p.photo_url}" class="review-photo" />`).join('');

    // Получаем данные о локации
    const locationRes = await fetch(`http://localhost:8000/api/locations/locations/${r.location}`);
    const location = await locationRes.json();

    const filtersHtml = location.filters.map(f => `<span class="tag">${f.filter_name}</span>`).join('');
    const categoryName = location.category.category_name;

    const el = document.createElement('div');
    el.className = 'review-card';
    el.innerHTML = `
      <a href="/index.html#loc-${r.location}" class="review-edit">✎</a>
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
