export async function validateAddressWithCoords(address, lat, lon) {
  try {
    const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lon}&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.result?.items?.length) return false;

    const found = data.result.items[0].full_name.trim().toLowerCase();
    return found === address.trim().toLowerCase();

  } catch (err) {
    console.error('Ошибка при валидации адреса:', err);
    return false;
  }
}

export async function getCityOrRegionName(lat, lon) {
  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lon}&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.result?.items || [];

    const city = items.find(i => i.type === 'adm_div' && i.subtype === 'city');
    if (city) return city.name;

    const region = items.find(i => i.type === 'adm_div' && i.subtype === 'region');
    if (region) return region.name;

    return 'Неизвестно';
  } catch (err) {
    console.error('Ошибка получения города/региона:', err);
    return 'Неизвестно';
  }
}
