import { showLocationPopup } from '../map/popupManager';

export async function handleLocationHash() {
    const hash = window.location.hash;

    if (!hash.startsWith('#loc-')) return;

    const locationId = parseInt(hash.replace('#loc-', ''));

    try {
        const res = await fetch(`http://localhost:8000/api/locations/locations/${locationId}/`);
        if (!res.ok) throw new Error('Локация не найдена');

        const locationData = await res.json();

        // Загружаем оценки
        const reviewsRes = await fetch(`http://localhost:8000/api/reviews/reviews/by-location/${locationId}`);
        const reviews = await reviewsRes.json();

        if (reviews.length) {
          const sum = { clean: 0, access: 0, other: 0 };
          reviews.forEach(r => {
            sum.clean += r.rating_clean || 0;
            sum.access += r.rating_access || 0;
            sum.other += r.rating_other || 0;
        });

        locationData.rating = {
            clean: (sum.clean / reviews.length).toFixed(1),
            comfort: (sum.access / reviews.length).toFixed(1),
            other: (sum.other / reviews.length).toFixed(1),
            total: ((sum.clean + sum.access + sum.other) / (3 * reviews.length)).toFixed(1),
        };
        }

        await showLocationPopup(null, locationData);
    } catch (err) {
        console.error('[handleLocationHash] Ошибка загрузки локации:', err);
    }
}
