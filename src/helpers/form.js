import { coords } from './coordinates';
import { selectedImages, setupImagePreview } from './form/imagePreview';
import { renderFiltersByCategory, allFilters } from './form/filterUtils';
import { loadCategoriesAndFilters } from './form/categoryLoader';
import { validateAddressWithCoords, getCityOrRegionName } from './form/addressValidation';
import { handleFormSubmit } from './form/handleFormSubmit';

export async function form() {
  const form = document.getElementById('add-location-form');
  const categorySelect = document.getElementById('location-type');

  await loadCategoriesAndFilters({
    categorySelectId: 'location-type',
    filtersContainerId: 'filters'
  });

  // Передаём настройки для превью фото
  setupImagePreview({
    inputId: 'photo-input',
    previewContainerId: 'photo-preview',
    imageArray: selectedImages
  });

  categorySelect.addEventListener('change', () => {
    const selectedId = parseInt(categorySelect.value);
    renderFiltersByCategory(selectedId, 'filters');
  });

  handleFormSubmit({ form, categorySelect });
}
