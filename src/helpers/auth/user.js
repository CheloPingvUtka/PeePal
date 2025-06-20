export async function getCurrentUserId() {
  try {
    const res = await fetch('http://localhost:8000/auth/me/', {
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.id || null;
  } catch (error) {
    console.error('Ошибка при получении ID пользователя:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const res = await fetch('http://localhost:8000/auth/me/', {
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
}
