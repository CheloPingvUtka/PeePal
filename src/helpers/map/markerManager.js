import { mapgl, map } from '../set-map';
import { showLocationPopup } from './popupManager';

const activeMarkers = [];

export function drawMarkers(locations) {
  clearMarkers();

  locations.forEach(loc => {
    const marker = new mapgl.Marker(map, {
      coordinates: [loc.longitude, loc.latitude],
    });

    marker.on('click', () => {
      showLocationPopup([loc.longitude, loc.latitude], loc);
    });

    activeMarkers.push(marker);
  });
}

function clearMarkers() {
  activeMarkers.forEach(marker => marker.destroy());
  activeMarkers.length = 0;
}
