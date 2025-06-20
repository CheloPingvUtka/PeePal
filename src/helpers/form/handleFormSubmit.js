import { coords } from '../coordinates';
import { selectedImages } from './imagePreview';
import { allFilters, renderFiltersByCategory } from './filterUtils';
import { validateAddressWithCoords, getCityOrRegionName } from './addressValidation';
import { getCurrentUserId } from '../auth/user';


export function handleFormSubmit({ form, categorySelect }) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const filtersContainer = document.getElementById('filters');

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

      const locationRes = await fetch('http://127.0.0.1:8000/api/locations/locations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });
      
      
      const locationJson = await locationRes.json();
      if (!locationRes.ok) {
        console.error('Ошибка создания локации:', locationJson);
        return alert(`Ошибка: ${locationJson?.detail || JSON.stringify(locationJson)}`);
      }
      
      const locationId = locationJson.id;
      const formData = new FormData();
      formData.append('location', locationId);
      for (let file of selectedImages) {
        formData.append('images', file);
      }

      const reviewRes = await fetch('http://127.0.0.1:8000/api/reviews/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const photoRes = await fetch('http://127.0.0.1:8000/api/reviews/upload-multiple/', {
        method: 'POST',
        body: formData,
      });

      const photoJson = await photoRes.json();
      if (!photoRes.ok) {
        console.error('Ошибка загрузки фото:', photoJson);
        return alert(`Фотографии не загрузились: ${JSON.stringify(photoJson)}`);
      }

      alert('Локация и фотографии успешно добавлены!');
      form.reset();
      renderFiltersByCategory(parseInt(categorySelect.value));
      selectedImages.length = 0;
      document.getElementById('photo-preview').innerHTML = '';
      document.getElementById('photo-input').value = '';

    } catch (error) {
      console.error('Непредвиденная ошибка:', error);
      alert('Что-то пошло не так. Проверь консоль разработчика.');
    }
  });
}
