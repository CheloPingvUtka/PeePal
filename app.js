window.map = null;
    // Главная функция, вызывается при запуске скрипта
main();
async function main() {
    // ожидание загрузки модулей
    await ymaps3.ready;
    const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapControls,
    YMapDefaultFeaturesLayer,
    YMapMarker
    } = ymaps3;

    // Импорт модулей для элементов управления на карте
    const {YMapZoomControl, YMapGeolocationControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
    
    // Функция получения координат пользователя
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
    let center = [37.618423, 55.751244];

    try {
        center = await getUserLocation();
    } catch (e) {
        console.warn('Геолокация недоступна, используется значение по умолчанию (Москва)');
    }

    // Координаты центра карты
    const CENTER_COORDINATES = center;

    // координаты метки на карте
    const MARKER_COORDINATES = center;

    // Объект с параметрами центра и зумом карты
    const LOCATION = {center: CENTER_COORDINATES, zoom: 12};

    // Создание объекта карты
    map = new YMap(document.getElementById('map'), {location: LOCATION});

    // Добавление слоев на карту
    map.addChild(scheme = new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    // Добавление элементов управления на карту
    map.addChild(new YMapControls({position: 'right'})
    .addChild(new YMapZoomControl({}))
    );
    map.addChild(new YMapControls({position: 'bottom right'})
    .addChild(new YMapGeolocationControl({}))
    );

    // Создание маркера
    const el = document.createElement('img');
    el.className = 'my-marker';
    el.src = './marker.svg';
    el.title = 'Маркер';

    // При клике на маркер меняем центр карты на LOCATION с заданным duration
    el.onclick = () => map.update({location: {...LOCATION, duration: 400}});

    // Создание заголовка маркера
    const markerTitle = document.createElement('div');
    markerTitle.className = 'marker-title';
    markerTitle.innerHTML = 'Заголовок маркера';

    // Контейнер для элементов маркера
    const imgContainer = document.createElement('div');
    imgContainer.appendChild(el);
    imgContainer.appendChild(markerTitle);

    // Добавление центра карты
    map.addChild(new YMapMarker({coordinates: CENTER_COORDINATES}));
    
    // Добавление маркера на карту
    map.addChild(new YMapMarker({coordinates: MARKER_COORDINATES}, imgContainer));
}
