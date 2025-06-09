export async function getUserCoordinates() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        resolve(coords);
      },
      () => {
        const fallback = [43.116, 131.882]; // Владивосток
        resolve(fallback);
      }
    );
  });
}
