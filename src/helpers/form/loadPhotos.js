export async function loadPhotosByLocation(locationId) {
  const response = await fetch(`https://peepal.ru/api/reviews/photos/?location=${locationId}`);
  if (!response.ok) {
    console.error('Ошибка при загрузке фото:', response.status);
    return [];
  }

  const data = await response.json();
  return data.map(p => p.photo_url);
}