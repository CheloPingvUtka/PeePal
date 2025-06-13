import { selectedReviewImages } from '../form/imagePreview.js';

export function resetReviewPreview(wrapper) {
  const form = wrapper.querySelector('#review-form');
  const previewContainer = wrapper.querySelector('#review-photo-preview');
  const input = wrapper.querySelector('#review-photo-input');

  // Сброс массива
  selectedReviewImages.length = 0;

  // Очистка интерфейса
  previewContainer.innerHTML = '';
  if (input) input.value = '';

  // Сброс значений формы
  if (form) form.reset();
}
