import { getCurrentUserId } from '../auth/user';
import { getCookie } from '../getCookie.js';


export async function loadPresenceStats(locationId) {
  try {
    const res = await fetch(`https://peepal.ru/api/reviews/presence/stats/${locationId}/`, {
      method: 'GET',
      credentials: 'include',
      headers: { 
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });

    const contentType = res.headers.get('Content-Type');
    if (!res.ok || !contentType?.includes('application/json')) {
      console.error('Ошибка загрузки статистики:', res.status, await res.text());
      return { present: 0, absent: 0, choice: null };
    }

    return await res.json();
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    return { present: 0, absent: 0, choice: null };
  }
}


export async function sendPresenceVote({ locationId, vote }) {
  const userId = await getCurrentUserId();

  if (!userId) {
    console.error('Пользователь не авторизован');
    return false;
  }

  const res = await fetch('https://peepal.ru/api/reviews/presence/vote/', {
    method: 'POST',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({
      location: locationId,
      vote, // 'present' или 'absent'
      user: userId, // временно — заменить на текущего пользователя
    }),
  });

  if (!res.ok) {
    console.error('Ошибка при голосовании:', await res.text());
  }

  return res.ok;
}
