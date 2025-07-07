import { mapgl, map } from '../set-map';
import { loadAndShowLocationPopup } from './loadAndShowLocationPopup.js';

const activeMarkers = [];

export function drawMarkers(locations) {
  clearMarkers();
  let i = 0;

  function drawBatch() {
    const chunk = 1;
    for (let j = 0; j < chunk && i < locations.length; j++, i++) {
      const loc = locations[i];
      const marker = new mapgl.Marker(map, {
        coordinates: [loc.longitude, loc.latitude],
      });

      // ⬇️ обязательно замкни значение loc
      marker.on('click', ((locationId) => () => {
        loadAndShowLocationPopup(locationId);
      })(loc.id));

      activeMarkers.push(marker);
    }

    if (i < locations.length) requestAnimationFrame(drawBatch);
  }

  requestAnimationFrame(drawBatch);
}


function clearMarkers() {
  activeMarkers.forEach(marker => marker.destroy());
  activeMarkers.length = 0;
}
