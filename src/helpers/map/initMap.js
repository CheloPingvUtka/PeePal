import { mapgl } from '../set-map';

export async function initMap(center = [37.618423, 55.751244]) {
  return new mapgl.Map('map', {
    center,
    zoom: 13,
    key: 'e417529f-6cc7-4e40-b743-ba94b52744f5',
  });
}
