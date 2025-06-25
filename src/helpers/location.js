import { drawMarkers } from './map/markerManager';

export async function loadLocations(userCoords, category = null, filters = [], radius = 5) {
  if (!userCoords) {
    console.warn('[loadLocations] userCoords is undefined or invalid:', userCoords);
    return;
  }

  const url = new URL('http://127.0.0.1:8000/api/locations/locations/');
  if (category) url.searchParams.append('category', category);
  filters.forEach(f => url.searchParams.append('filters', f));

  const res = await fetch(url);
  const data = await res.json();
  const nearby = filterLocationsByDistance(userCoords, data, radius); // <-- radius
  drawMarkers(nearby);
}

function filterLocationsByDistance(userCoords, locations, maxKm = 5) {
  return locations.filter(loc => {
    const dx = (loc.latitude - userCoords[0]) * 111;
    const dy = (loc.longitude - userCoords[1]) * 87;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= maxKm;
  });
}
