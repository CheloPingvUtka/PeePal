import { loadLocations } from './location';
import { getUserCoordinates } from './map/getUserCoordinates';
import { loadCategoriesAndFilters } from './form/categoryLoader';

let isFilterModalOpen = false;
let categoriesLoaded = false;

document.getElementById('apply-filters').addEventListener('click', async () => {
  const overlay = document.getElementById('filter-overlay');

  const selectedCategory = document.getElementById('location-type-modal').value;
  const selectedFilters = [...document.querySelectorAll('#filters-modal input[name="filters"]:checked')].map(el => el.value);
  const radius = parseInt(document.getElementById('radius-slider').value);

  try {
    const coords = await getUserCoordinates();
    await loadLocations(coords, selectedCategory, selectedFilters, radius); // передаём
  } catch (e) {
    console.error('Ошибка определения координат:', e);
  }

  overlay.classList.add('hidden');
  isFilterModalOpen = false;
});

document.getElementById('select-all').addEventListener('click', async () => {
  const overlay = document.getElementById('filter-overlay');

  try {
    const coords = await getUserCoordinates();

    // Загрузка всех локаций — без категории и фильтров, радиус большой
    await loadLocations(coords, null, [], 10000);
  } catch (e) {
    console.error('Ошибка определения координат:', e);
  }

  // Закрыть попап
  overlay.classList.add('hidden');
  isFilterModalOpen = false;
});



export async function openFilterModal() {
  const overlay = document.getElementById('filter-overlay');
  const closeBtn = document.getElementById('close-filter-modal');
  const allMenuItems = document.querySelectorAll('#bottom-menu .menu-item');
  const form = document.getElementById('location-modal');

  if (form?.classList.contains('active')) {
    form.classList.remove('active');
  }

  if (isFilterModalOpen) {
    overlay.classList.add('hidden');
    isFilterModalOpen = false;
    return;
  }

  overlay.classList.remove('hidden');
  isFilterModalOpen = true;

  if (!categoriesLoaded) {
    await loadCategoriesAndFilters({
      categorySelectId: 'location-type-modal',
      filtersContainerId: 'filters-modal'
    });
    categoriesLoaded = true;
  }

  // 👉 Добавляем обработчик слайдера здесь
  const slider = document.getElementById('radius-slider');
  const valueDisplay = document.getElementById('radius-value');

  if (slider && valueDisplay) {
    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = `${e.target.value} км`;
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
      isFilterModalOpen = false;
    }
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    isFilterModalOpen = false;
  });

  allMenuItems.forEach((item, index) => {
    if (index !== 0) {
      item.addEventListener('click', () => {
        overlay.classList.add('hidden');
        isFilterModalOpen = false;
      });
    }
  });
}