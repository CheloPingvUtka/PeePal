export async function validateAddressWithCoords(address, lat, lon) {
  try {
    const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lon}&key=b51c5279-1c87-4a9c-9fbe-b39d0b3fdc94&locale=ru_RU`;
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
  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lon}&key=b51c5279-1c87-4a9c-9fbe-b39d0b3fdc94&locale=ru_RU`;

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
