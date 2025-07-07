import { getCookie } from '../getCookie.js';

export async function loadReviewsByLocation(locationId) {
  try {
    const response = await fetch(`https://peepal.ru/api/reviews/reviews/by-location/${locationId}/`, {
      method: 'GET',
      credentials: 'include',
      headers: { 
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });

    const contentType = response.headers.get('Content-Type');
    if (!response.ok || !contentType?.includes('application/json')) {
      console.error('Ошибка при загрузке отзывов:', response.status, await response.text());
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при выполнении запроса на загрузку отзывов:', error);
    return [];
  }
}