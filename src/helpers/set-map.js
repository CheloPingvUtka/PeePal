import { load } from '@2gis/mapgl';


export const mapgl = await load();
export let map;


await start();
async function start() {

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

    map = new mapgl.Map('container', {
        center: LOCATION,
        zoom: 13,
        key: 'e417529f-6cc7-4e40-b743-ba94b52744f5',
    });

    const controlContent = `
    <div class="buttonRoot" id="find-me">
        <button class="button">
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