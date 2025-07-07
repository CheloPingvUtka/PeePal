import { initMap } from './map/initMap';
import { reverseGeocode } from './map/reverseGeocode';
import { setupAddressSuggestions } from './map/geoSuggest';
import { addGeoLocateButton } from './map/geoLocateButton';
import { setCoordinates } from './coordinates';
import { requireAuth } from './auth/requireAuth.js';


const btnAddLocation = document.getElementById('open-form-btn');
const formAddLocation = document.getElementById('location-modal');

export function addLocation() {
  btnAddLocation.addEventListener('click', async () => {
    requireAuth(() => {
      formAddLocation.classList.toggle('active');
      
      setTimeout(async () => {
        let location = [37.618423, 55.751244];
        
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve([p.coords.longitude, p.coords.latitude]),
              () => reject(), {
              enableHighAccuracy: false,
              maximumAge: 60000,
            });
          });
          location = pos;
        } catch {
          console.warn('Геолокация недоступна, используется Москва по умолчанию');
        }
        
        const map = await initMap(location);
        setupAddressSuggestions(map);
        addGeoLocateButton(map);
        
        map.on('click', async (event) => {
          const [lng, lat] = event.lngLat;
          setCoordinates(lat, lng);
          try {
            const address = await reverseGeocode(lng, lat);
            document.getElementById('address').value = address;
          } catch (e) {
            alert('Не удалось определить адрес');
            console.error(e);
          }
        });
      }, 100);
    });
  });
}
