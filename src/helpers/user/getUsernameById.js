export async function getUsernameById(userId) {
  try {
    const res = await fetch(`http://localhost:8000/auth/public/${userId}/`);
    if (!res.ok) throw new Error('Ошибка получения имени пользователя');

    const user = await res.json();
    return user.username || 'Без имени';
  } catch (err) {
    console.error('[getUsernameById] Ошибка:', err);
    return 'Ошибка';
  }
}
