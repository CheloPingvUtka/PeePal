import { mapgl } from '../set-map';

export async function initMap(center = [37.618423, 55.751244]) {
  return new mapgl.Map('map', {
    center,
    zoom: 13,
    key: 'b51c5279-1c87-4a9c-9fbe-b39d0b3fdc94',
  });
}
