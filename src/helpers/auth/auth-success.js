import { requireAuth } from './requireAuth.js';

function runNextAction() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');

  requireAuth(() => {
    switch (next) {
      case 'add-location':
        document.getElementById('open-form-btn')?.click();
        break;
      case 'profile':
        window.location.href = '/src/page/lk.html'; // или открытие модального окна
        break;
      case 'review':
        document.getElementById('review-btn')?.click();
        break;
      default:
        window.location.href = '/'; // fallback
    }
  });
}

runNextAction();
