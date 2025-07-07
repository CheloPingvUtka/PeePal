export async function getUserCoordinates() {
  return new Promise((resolve) => {
    // Быстрое определение без высокой точности
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        resolve(coords);
      },
      () => {
        // fallback: Владивосток
        resolve([43.116, 131.882]);
      },
      {
        enableHighAccuracy: false, // ⚡ быстрее
        maximumAge: 60000          // кэшированные координаты до 60 сек
      }
    );
  });
}
