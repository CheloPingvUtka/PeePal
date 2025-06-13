export async function loadReviewsByLocation(locationId) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/reviews/reviews/by-location/${locationId}/`);
    if (!response.ok) {
      console.error('Ошибка при загрузке отзывов:', response.status);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при выполнении запроса на загрузку отзывов:', error);
    return [];
  }
}
