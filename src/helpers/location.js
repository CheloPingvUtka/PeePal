import { drawMarkers } from './map/markerManager';

export async function loadLocations(userCoords, category = null, filters = [], radius = 5) {
  if (!userCoords) {
    console.warn('[loadLocations] userCoords is undefined or invalid:', userCoords);
    return;
  }

  const url = new URL('https://peepal.ru/api/locations/locations/light/');

  // Передаём координаты и радиус на бэкенд
  url.searchParams.append('lat', userCoords[0]);
  url.searchParams.append('lon', userCoords[1]);
  url.searchParams.append('radius', radius);

  if (category) url.searchParams.append('category', category);
  filters.forEach(f => url.searchParams.append('filters', f));

  let data = [];
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Ошибка при загрузке локаций:', res.status, await res.text());
      return;
    }
    data = await res.json();
  } catch (e) {
    console.error('Ошибка запроса локаций:', e);
    return;
  }

  // Дополнительная фильтрация на клиенте (если нужно)
  const nearby = filterLocationsByDistance(userCoords, data, radius);
  drawMarkers(nearby);
}

// Оставляем на случай если сервер дал чуть больше локаций
function filterLocationsByDistance(userCoords, locations, maxKm = 5) {
  return locations.filter(loc => {
    const dx = (loc.latitude - userCoords[0]) * 111;
    const dy = (loc.longitude - userCoords[1]) * 87;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= maxKm;
  });
}
