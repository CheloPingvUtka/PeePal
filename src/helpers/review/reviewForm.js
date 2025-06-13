export function setupReviewForm(wrapper, locationId) {
  const toggleBtn = wrapper.querySelector('#toggle-review-form');
  const form = wrapper.querySelector('#review-form');
  const photoInput = wrapper.querySelector('#review-photo');
  const previewContainer = wrapper.querySelector('#review-photo-preview');

  toggleBtn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    toggleBtn.textContent = form.classList.contains('hidden') ? 'Оставить отзыв' : 'Скрыть форму';
  });

  photoInput.addEventListener('change', () => {
    previewContainer.innerHTML = '';
    [...photoInput.files].forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.classList.add('photo-preview');
      previewContainer.appendChild(img);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reviewText = wrapper.querySelector('#review-text').value;
    const cleanliness = form.querySelector('input[name="review-clean"]:checked')?.value;
    const convenience = form.querySelector('input[name="review-conv"]:checked')?.value;
    const other = form.querySelector('input[name="review-other"]:checked')?.value;

    if (!cleanliness || !convenience || !other) return alert('Оцените по всем критериям');

    const reviewRes = await fetch('http://127.0.0.1:8000/api/reviews/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: locationId,
        user: 1,
        rating_clean: cleanliness,
        rating_access: convenience,
        rating_other: other,
        text: reviewText,
      }),
    });

    if (!reviewRes.ok) {
      const err = await reviewRes.json();
      console.error(err);
      return alert('Ошибка при создании отзыва');
    }

    const review = await reviewRes.json();
    const formData = new FormData();
    formData.append('location', locationId);
    formData.append('review', review.id);

    [...photoInput.files].forEach(file => formData.append('images', file));

    const photoRes = await fetch('http://127.0.0.1:8000/api/reviews/upload-multiple/', {
      method: 'POST',
      body: formData,
    });

    if (!photoRes.ok) {
      const err = await photoRes.json();
      console.error(err);
      return alert('Фотографии не загрузились');
    }

    alert('Отзыв отправлен!');
    form.reset();
    previewContainer.innerHTML = '';
    form.classList.add('hidden');
    toggleBtn.textContent = 'Оставить отзыв';
  });
}
