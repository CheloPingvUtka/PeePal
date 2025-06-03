//import {coords} from './add-location';
import { coords } from './coordinates';


let allFilters = [];
const selectedImages = [];


export async function form() {
  const form = document.getElementById('add-location-form');
  const categorySelect = document.getElementById('location-type');
  const filtersContainer = document.getElementById('filters');

  await loadCategoriesAndFilters();


  //рендер мини фото
  document.getElementById('photo-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      selectedImages.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-image-wrapper';

        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'preview-image';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerText = '×';

        removeBtn.onclick = () => {
          selectedImages.splice(selectedImages.indexOf(file), 1);
          wrapper.remove();
        };

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        document.getElementById('photo-preview').appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    }

    // Сброс input, чтобы можно было заново выбрать тот же файл
    e.target.value = '';
  });


  // При смене категории — обновляем фильтры
  categorySelect.addEventListener('change', () => {
    const selectedId = parseInt(categorySelect.value);
    renderFiltersByCategory(selectedId);
  });
  

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const address = document.getElementById('address').value.trim();
      const description = document.getElementById('description').value.trim();
      const directions = document.getElementById('directions').value.trim();
      const cleanliness = document.querySelector('input[name="cleanliness"]:checked')?.value;
      const convenience = document.querySelector('input[name="convenience"]:checked')?.value;
      const other = document.querySelector('input[name="other"]:checked')?.value;
      const selectedCategoryId = parseInt(categorySelect.value);
      const selectedFilters = [...filtersContainer.querySelectorAll('input[name="filters"]:checked')].map(el => parseInt(el.value));
      

      // --- ВАЛИДАЦИЯ ---
      if (!address) return alert('Укажите адрес');
      if (!selectedCategoryId) return alert('Выберите категорию');
      if (isNaN(coords.lat) || isNaN(coords.lng)) return alert('Не определены координаты');
      if (!cleanliness || !convenience || !other) return alert('Поставьте оценки по всем критериям');
      if (selectedImages.length === 0) return alert('Пожалуйста, загрузите хотя бы одно фото');

      const locationData = {
        address,
        description,
        directions,
        category_id: selectedCategoryId,
        city_name: 'Москва',
        latitude: coords.lat,
        longitude: coords.lng,
        filters: selectedFilters,
        user_id: 1, // заменить на текущего пользователя
        cleanliness,
        convenience,
        other
      };

      const locationRes = await fetch('http://127.0.0.1:8000/api/locations/locations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
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


      const photoRes = await fetch('http://127.0.0.1:8000/api/reviews/upload-multiple/', {
        method: 'POST',
        body: formData
      });

      const photoJson = await photoRes.json();
      if (!photoRes.ok) {
        console.error('Ошибка загрузки фото:', photoJson);
        return alert(`Фотографии не загрузились: ${JSON.stringify(photoJson)}`);
      }

      alert('Локация и фотографии успешно добавлены!');
      form.reset();
      renderFiltersByCategory(parseInt(categorySelect.value));  // очистка чекбоксов
      selectedImages.length = 0; // очистка массива
      document.getElementById('photo-preview').innerHTML = ''; // очистка превью
      document.getElementById('photo-input').value = ''; // сброс input


    } catch (error) {
      console.error('Непредвиденная ошибка:', error);
      alert('Что-то пошло не так. Проверь консоль разработчика.');
    }
  });
}


async function loadCategoriesAndFilters() {
  try {
    const [catRes, filterRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/locations/categories/'),
      fetch('http://127.0.0.1:8000/api/locations/filters/')
    ]);

    const categories = await catRes.json();
    allFilters = await filterRes.json();

    const categorySelect = document.getElementById('location-type');
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.category_name;
      categorySelect.appendChild(option);
    });

    // Отрисовать фильтры сразу для первой категории
    if (categories.length > 0) {
      categorySelect.value = categories[0].id;
      renderFiltersByCategory(categories[0].id);
    }

  } catch (e) {
    console.error('Ошибка загрузки категорий или фильтров:', e);
    alert('Ошибка загрузки фильтров или категорий. Проверь подключение к API.');
  }
}


function renderFiltersByCategory(categoryId) {
  const filtersContainer = document.getElementById('filters');
  filtersContainer.innerHTML = '';

  const relevantFilters = allFilters.filter(f => f.category === categoryId);
  relevantFilters.forEach(filter => {
    const label = document.createElement('label');
    label.style.display = 'block';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'filters';
    checkbox.value = filter.id;
    label.appendChild(checkbox);
    label.append(` ${filter.filter_name}`);
    filtersContainer.appendChild(label);
  });
}
