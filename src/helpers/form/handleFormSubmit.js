import { coords } from '../coordinates';
import { selectedImages } from './imagePreview';
import { allFilters, renderFiltersByCategory } from './filterUtils';
import { validateAddressWithCoords, getCityOrRegionName } from './addressValidation';
import { getCurrentUserId } from '../auth/user';
import { getCookie } from '../getCookie.js';
import { convertImageToJpeg } from '../convertToJpeg.js';


export function handleFormSubmit({ form, categorySelect }) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const filtersContainer = document.getElementById('filters');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    try {
      const userId = await getCurrentUserId();
      const address = document.getElementById('address').value.trim();
      const rawDescription = document.getElementById('description').value.trim();
      const directions = document.getElementById('directions').value.trim();
      const description = directions
        ? `${rawDescription}\n\nКак добраться до точки: ${directions}`
        : rawDescription;
      const cleanliness = document.querySelector('input[name="cleanliness"]:checked')?.value;
      const convenience = document.querySelector('input[name="convenience"]:checked')?.value;
      const other = document.querySelector('input[name="other"]:checked')?.value;
      const selectedCategoryId = parseInt(categorySelect.value);
      const selectedFilters = [...filtersContainer.querySelectorAll('input[name="filters"]:checked')].map(el => parseInt(el.value));
      
      const isValidAddress = await validateAddressWithCoords(address, coords.lat, coords.lng);
      const cityName = await getCityOrRegionName(coords.lat, coords.lng);

      if (!address) return alert('Укажите адрес');
      if (!selectedCategoryId) return alert('Выберите категорию');
      if (isNaN(coords.lat) || isNaN(coords.lng)) return alert('Не определены координаты');
      if (!cleanliness || !convenience || !other) return alert('Поставьте оценки по всем критериям');
      if (selectedImages.length === 0) return alert('Пожалуйста, загрузите хотя бы одно фото');
      if (!isValidAddress) return alert('Адрес не соответствует координатам.');
      if (!userId) return alert('Пожалуйста, авторизуйтесь перед добавлением локации');

      const locationData = {
        address,
        description,
        category_id: selectedCategoryId,
        city_name: cityName,
        latitude: coords.lat,
        longitude: coords.lng,
        filters_ids: selectedFilters,
        user_id: userId,
        cleanliness,
        convenience,
        other,
      };

      const locationRes = await fetch('https://peepal.ru/api/locations/locations/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
         },
        body: JSON.stringify(locationData),
      });
      
      
      const locationJson = await locationRes.json();
      if (!locationRes.ok) {
        console.error('Ошибка создания локации:', locationJson);
        return alert(`Ошибка: ${locationJson?.detail || JSON.stringify(locationJson)}`);
      }
      
      for (let file of selectedImages) {
        if (!(file instanceof File)) {
          console.error('❌ Это не File:', file);
          return alert('Ошибка: один из выбранных файлов не является изображением.');
        }
      }

      const locationId = locationJson.id;
      const formData = new FormData();
      
      const convertedImages = [];
      for (let file of selectedImages) {
        try {
          const converted = await convertImageToJpeg(file);
          convertedImages.push(converted);
        } catch (err) {
          console.warn("Ошибка при конвертации изображения:", err);
          alert(`Не удалось обработать файл ${file.name}. ${err.message || ''}`);
        }
      }
      if (convertedImages.length === 0) {
        return alert('Не удалось обработать ни одно изображение. Пожалуйста, загрузите фото в формате JPEG/PNG/WebP.');
      }

      formData.append('location', locationId);
      for (let file of convertedImages) {
        formData.append('images', file);
      }


      const reviewRes = await fetch('https://peepal.ru/api/reviews/create/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
         },
        body: JSON.stringify({
          location: locationId,
          user: userId,  // временно, или получай ID текущего пользователя
          rating_clean: parseInt(cleanliness),
          rating_access: parseInt(convenience),
          rating_other: parseInt(other),
          text: description,
        }),
      });

      const reviewJson = await reviewRes.json();
      if (!reviewRes.ok) {
        console.error('Ошибка отправки отзыва:', reviewJson);
        return alert(`Ошибка отзыва: ${JSON.stringify(reviewJson)}`);
      }

      const photoRes = await fetch('https://peepal.ru/api/reviews/upload-multiple/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'X-CSRFToken': getCookie('csrftoken'),
         },
        body: formData,
      });

      const contentType = photoRes.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const photoJson = await photoRes.json();

        if (!photoRes.ok) {
          console.error('Ошибка загрузки фото:', photoJson);
          return alert(`Фотографии не загрузились: ${JSON.stringify(photoJson)}`);
        }

      } else {
        // Сервер вернул не JSON, а HTML (например, 500 ошибка)
        const htmlText = await photoRes.text();
        console.error('Сервер вернул не JSON:', htmlText);
        return alert('Ошибка на сервере при загрузке фото. Попробуйте позже.');
      }

      alert('Локация и фотографии успешно добавлены!');
      form.reset();
      renderFiltersByCategory(parseInt(categorySelect.value));
      selectedImages.length = 0;
      document.getElementById('photo-preview').innerHTML = '';
      document.getElementById('photo-input').value = '';

    } catch (error) {
      const errText = error instanceof Error ? error.message : JSON.stringify(error);
      alert('Непредвиденная ошибка:\n' + errText);
      console.error('Непредвиденная ошибка:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить на модерацию';
    }
  });
}
