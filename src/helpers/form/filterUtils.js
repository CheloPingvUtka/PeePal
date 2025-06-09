export let allFilters = [];

export function setFilters(data) {
  allFilters = data;
}

export function renderFiltersByCategory(categoryId, containerId = 'filters') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const relevant = allFilters.filter(f => f.category === categoryId);
  relevant.forEach(filter => {
    const label = document.createElement('label');
    label.style.display = 'block';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'filters';
    checkbox.value = filter.id;

    label.appendChild(checkbox);
    label.append(` ${filter.filter_name}`);
    container.appendChild(label);
  });
}
