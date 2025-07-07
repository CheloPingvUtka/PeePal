export async function getUsernameById(userId) {
  if (!userId) {
    console.warn('[getUsernameById] userId is null');
    return 'Гость';
  }

  try {
    const res = await fetch(`https://peepal.ru/auth/public/${userId}/`);
    if (!res.ok) throw new Error('Ошибка получения имени пользователя');

    const user = await res.json();
    return user.username || 'Без имени';
  } catch (err) {
    console.error('[getUsernameById] Ошибка:', err);
    return 'Ошибка';
  }
}
