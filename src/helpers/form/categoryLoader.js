import { setFilters, renderFiltersByCategory } from './filterUtils';

export async function loadCategoriesAndFilters({ categorySelectId, filtersContainerId }) {
  try {
    const [catRes, filterRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/locations/categories/'),
      fetch('http://127.0.0.1:8000/api/locations/filters/')
    ]);

    const categories = await catRes.json();
    const filters = await filterRes.json();

    setFilters(filters);

    const select = document.getElementById(categorySelectId);
    const filtersContainer = document.getElementById(filtersContainerId);

    if (!select || !filtersContainer) return;

    select.innerHTML = '';

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.category_name;
      select.appendChild(option);
    });

    if (categories.length > 0) {
      select.value = categories[0].id;
      renderFiltersByCategory(categories[0].id, filtersContainerId);
    }

    // Слушаем выбор категории, чтобы фильтры менялись
    select.addEventListener('change', () => {
      renderFiltersByCategory(parseInt(select.value), filtersContainerId);
    });
  } catch (e) {
    console.error('Ошибка загрузки категорий/фильтров:', e);
    alert('Ошибка загрузки фильтров или категорий.');
  }
}
