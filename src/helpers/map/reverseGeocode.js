export async function reverseGeocode(lng, lat) {
  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&key=b51c5279-1c87-4a9c-9fbe-b39d0b3fdc94&locale=ru_RU`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.result?.items?.length) {
    return data.result.items[0].full_name;
  }

  throw new Error('Address not found');
}
