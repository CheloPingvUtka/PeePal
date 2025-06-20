import { setupImagePreview, selectedReviewImages } from '../form/imagePreview.js';
import { resetReviewPreview } from './resetReviewPreview.js';
import { requireAuth } from '../auth/requireAuth.js';
import { getCurrentUserId } from '../auth/user';


export function setupReviewForm(wrapper, locationId) {
  const toggleBtn = wrapper.querySelector('#toggle-review-form');
  const form = wrapper.querySelector('#review-form');

  // Инициализация превью изображений для формы отзыва
  setupImagePreview({
    inputId: 'review-photo-input',
    previewContainerId: 'review-photo-preview',
    imageArray: selectedReviewImages,
  });

  // Обработка показа/скрытия формы
  toggleBtn.addEventListener('click', () => {
    requireAuth(() => {
      const isHidden = form.classList.toggle('hidden');
      toggleBtn.textContent = isHidden ? 'Оставить отзыв' : 'Скрыть форму';

      if (isHidden) {
        resetReviewPreview(wrapper);
      }
    }, 'review');
  });


  // Обработка отправки формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reviewText = wrapper.querySelector('#review-text').value;
    const cleanliness = form.querySelector('input[name="review-clean"]:checked')?.value;
    const convenience = form.querySelector('input[name="review-conv"]:checked')?.value;
    const other = form.querySelector('input[name="review-other"]:checked')?.value;
    const userId = await getCurrentUserId();

    if (!userId) {
      console.error('Пользователь не авторизован');
      return false;
    }

    if (!cleanliness || !convenience || !other) {
      return alert('Оцените по всем критериям');
    }

    if (selectedReviewImages.length === 0) {
      return alert('Загрузите хотя бы одно фото');
    }

    try {
      // Отправка отзыва
      const reviewRes = await fetch('http://127.0.0.1:8000/api/reviews/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationId,
          user: userId, // временно
          rating_clean: cleanliness,
          rating_access: convenience,
          rating_other: other,
          text: reviewText,
        }),
      });

      if (!reviewRes.ok) {
        const err = await reviewRes.json();
        console.error(err);

        if (err?.non_field_errors?.[0]) {
          return alert(err.non_field_errors[0]);
        }

        return alert('Ошибка при создании отзыва');
      }

      const review = await reviewRes.json();

      // Отправка изображений
      const formData = new FormData();
      formData.append('location', locationId);
      formData.append('review', review.id);

      for (const file of selectedReviewImages) {
        formData.append('images', file);
      }

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
      resetReviewPreview(wrapper);
      form.classList.add('hidden');
      toggleBtn.textContent = 'Оставить отзыв';

    } catch (error) {
      console.error('Ошибка при отправке формы отзыва:', error);
      alert('Что-то пошло не так. Проверьте консоль разработчика.');
    }
  });
}
