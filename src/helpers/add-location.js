import {mapgl} from './set-map';
import { setCoordinates, coords } from './coordinates';


const btnAddLocation = document.getElementById('open-form-btn');
const formAddLocation = document.getElementById('location-modal');
//export const coords = { lng: NaN, lat: NaN };


async function startForm() {

    function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                const coords = [position.coords.longitude, position.coords.latitude];
                resolve(coords);
                },
                () => {
                reject();
                }
            );
            } else {
            reject();
            }
        });
    }

    // Центр по умолчанию — Москва
    let LOCATION = [37.618423, 55.751244];

    try {
        LOCATION = await getUserLocation();
    } catch (e) {
        console.warn('Геолокация недоступна, используется значение по умолчанию (Москва)');
    }

    const map = new mapgl.Map('map', {
        center: LOCATION,
        zoom: 13,
        key: 'e417529f-6cc7-4e40-b743-ba94b52744f5',
    });

    // Обратное геокодирование
    map.on('click', async (event) => {
        const [lng, lat] = event.lngLat;
        setCoordinates(lat, lng);

        try {
            const address = await reverseGeocode(lng, lat);
            document.getElementById('address').value = address;
        } catch (err) {
            console.error(err);
            alert('Не удалось определить адрес');
        }
    });


    async function reverseGeocode(lng, lat) {
        const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`;

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        console.log('[DEBUG] Ответ от 2GIS:', data);

        if (data.result?.items?.length) {
            return data.result.items[0].full_name;
        }

        throw new Error('Address not found');
    }


    //Прямое геокодирование
    const addressInput = document.getElementById('address');
    const suggestionsContainer = document.getElementById('address-suggestions');

    let debounceTimeout;
    let selectedCoords = null; // сюда сохраняются координаты выбранного адреса

    addressInput.addEventListener('input', () => {
    const query = addressInput.value.trim();
    clearTimeout(debounceTimeout);

    if (query.length < 3) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    debounceTimeout = setTimeout(() => {
        fetchSuggestions(query);
    }, 1000);
    });

    async function fetchSuggestions(query) {
    try {
        const res = await fetch(
        `https://catalog.api.2gis.com/3.0/suggests?q=${encodeURIComponent(query)}&type=building&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`
        );
        const data = await res.json();
        console.log(data);
        suggestionsContainer.innerHTML = '';

        const items = data.result?.items || [];

        for (const item of items) {
        const li = document.createElement('li');
        li.textContent = item.full_name;
        li.classList.add('suggestion-item');
            li.addEventListener('click', async () => {
            addressInput.value = item.full_name;
            suggestionsContainer.innerHTML = '';

            try {
                const res = await fetch(`https://catalog.api.2gis.com/3.0/items/byid?id=${item.id}&fields=items.point&key=e417529f-6cc7-4e40-b743-ba94b52744f5&locale=ru_RU`);
                const data = await res.json();
                const point = data?.result?.items?.[0]?.point;

                if (point && point.lon && point.lat) {
                //selectedCoords = [parseFloat(point.lon), parseFloat(point.lat)];
                setCoordinates(point.lat, point.lon);
                console.log('[DEBUG] Координаты по адресу:', point.lat, point.lon);
                } else {
                throw new Error('Координаты не найдены');
                }

            } catch (e) {
                console.error('Ошибка при получении координат по id:', e);
                alert('Не удалось получить координаты выбранного адреса.');
            }
            });

        suggestionsContainer.appendChild(li);
        }
    } catch (err) {
        console.error('Ошибка при получении подсказок:', err);
    }
    }

    const controlContent = `
    <div class="buttonRoot" id="find-me">
        <button class="button" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <path fill="currentColor"
                d="M17.89 26.27l-2.7-9.46-9.46-2.7 18.92-6.76zm-5.62-12.38l4.54 1.3 1.3 4.54 3.24-9.08z"
                />
                </svg>
                </button>
    </div>
    <p id="status"></p>
    `;
    
    const control = new mapgl.Control(map, controlContent, {
        position: 'centerRight',
    });
    
    const status = control.getContainer().querySelector('#status');
    let circle;
    
    function success(pos) {
        const center = [pos.coords.longitude, pos.coords.latitude];
        
        status.textContent = '';
        if (circle) {
            circle.destroy();
        }
        
        circle = new mapgl.CircleMarker(map, {
            coordinates: center,
            radius: 14,
            color: '#0088ff',
            strokeWidth: 4,
            strokeColor: '#ffffff',
            stroke2Width: 6,
            stroke2Color: '#0088ff55',
        });
        map.setCenter(center);
        map.setZoom(16);
    }
    
    function error() {
        status.textContent = 'Unable to retrieve your location';
    }
    
    function geoFindMe() {
        if (!navigator.geolocation) {
            status.textContent = 'Geolocation is not supported by your browser';
        } else {
            status.textContent = 'Locating…';
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

    control
    .getContainer()
    .querySelector('#find-me')
    .addEventListener('click', geoFindMe);
}

export function addLocation() {
  btnAddLocation.addEventListener('click', () => {
    formAddLocation.classList.toggle('active');

    // Показываем карту после появления DOM
    setTimeout(() => {
      startForm();
    }, 100);
  });
}
