export async function requireAuth(callback) {
  try {
    const res = await fetch('http://localhost:8000/auth/me/', {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Авторизован как:', data.username); // проверка
      callback?.();
    } else {
      console.log('❌ Не авторизован. Переход на /auth/');
      window.location.href = `http://localhost:8000/auth/login/?next=${getNextAction()}`;
    }
  } catch (e) {
    console.error('Ошибка при проверке авторизации', e);
    window.location.href = `http://localhost:8000/auth/login/?next=${getNextAction()}`;
  }
}

function getNextAction() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('profile')) return 'profile';
  if (currentPath.includes('add')) return 'add-location';
  if (currentPath.includes('review')) return 'review';
  return '';
}


// Универсальная функция показа формы авторизации
function openAuthModal() {
  const modal = document.querySelector('#auth-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
  } else {
    alert("Пожалуйста, войдите в систему.");
  }
}
