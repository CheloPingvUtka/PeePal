export async function reverseGeocode(lng, lat) {
  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.result?.items?.length) {
    return data.result.items[0].full_name;
  }

  throw new Error('Address not found');
}
