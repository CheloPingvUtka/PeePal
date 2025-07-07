import { showLocationPopup } from './popupManager';

export async function loadAndShowLocationPopup(locationId) {
  try {
    const locationData = await getLocationDetailsById(locationId);
    showLocationPopup([locationData.longitude, locationData.latitude], locationData);
  } catch (e) {
    console.error('Не удалось загрузить данные локации:', e);
  }
}

async function getLocationDetailsById(id) {
  const res = await fetch(`https://peepal.ru/api/locations/locations/${id}/`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
