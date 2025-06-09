import { setCoordinates } from '../coordinates';

export function setupAddressSuggestions(map) {
  const input = document.getElementById('address');
  const suggestionsContainer = document.getElementById('address-suggestions');

  let debounceTimeout;

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearTimeout(debounceTimeout);
    if (query.length < 3) {
      suggestionsContainer.innerHTML = '';
      return;
    }

    debounceTimeout = setTimeout(() => fetchSuggestions(query), 1000);
  });

  async function fetchSuggestions(query) {
    try {
      const res = await fetch(`https://catalog.api.2gis.com/3.0/suggests?q=${encodeURIComponent(query)}&type=building&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`);
      const data = await res.json();
      suggestionsContainer.innerHTML = '';

      const items = data.result?.items || [];

      for (const item of items) {
        const li = document.createElement('li');
        li.textContent = item.full_name;
        li.classList.add('suggestion-item');
        li.addEventListener('click', () => selectSuggestion(item, map));
        suggestionsContainer.appendChild(li);
      }
    } catch (e) {
      console.error('Ошибка при получении подсказок:', e);
    }
  }

  async function selectSuggestion(item, map) {
    input.value = item.full_name;
    suggestionsContainer.innerHTML = '';

    try {
      const res = await fetch(`https://catalog.api.2gis.com/3.0/items/byid?id=${item.id}&fields=items.point&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`);
      const data = await res.json();
      const point = data?.result?.items?.[0]?.point;

      if (point && point.lon && point.lat) {
        const coords = [point.lon, point.lat];
        setCoordinates(point.lat, point.lon);
        map.setCenter(coords);
        map.setZoom(16);
      } else throw new Error('Координаты не найдены');
    } catch (e) {
      console.error('Ошибка при получении координат по id:', e);
      alert('Не удалось получить координаты выбранного адреса.');
    }
  }
}
