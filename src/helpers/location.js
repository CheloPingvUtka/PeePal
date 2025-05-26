import {mapgl, map} from './set-map';


function getRandomArray(minX, maxX, minY, maxY) {
    let coords = [];
    for (let i = 0; i < 5; i++) {
        let array = [Math.random() * (maxX - minX) + minX, 
                    Math.random() * (maxY - minY) + minY];
        
        coords.push(array);
    }

    return coords;
}


export async function setLocation() {
    const coords = getRandomArray(131.87, 131.96, 43.12, 43.16);
    coords.forEach((coord) => {
        const marker = new mapgl.Marker(map, {
            coordinates: coord,
        });
        marker.on('click', (e) => {
            openLoacation(marker.getCoordinates());
        });
    });
    
}


export function openLoacation(coord){
    const popup = new mapgl.HtmlMarker(map, {
        coordinates: coord,
        html: `<div class="location-card">
        <h2 class="location-title">Центральный туалет на Арбате</h2>
        
        <div class="location-address">📍 ул. Арбат, 25</div>
        
        <div class="location-description short">
        Очень чистый туалет, удобно расположен рядом с метро. Бесплатный вход, есть пеленальный столик, доступ для инвалидов...
        <button class="toggle-description">Показать больше</button>
        </div>
        
        <div class="location-tags">
        <span class="tag">♿ Доступен</span>
        <span class="tag">🍼 Пеленальный</span>
        <span class="tag">🚻 Бесплатный</span>
        </div>
        
        <div class="location-rating">
        <span>⭐ 4.3</span>
        <button class="open-detailed-rating">Подробнее</button>
        </div>
        </div>
        
        <!-- Модалка с подробным рейтингом -->
        <div class="rating-modal hidden">
        <div class="modal-content">
        <h3>Оценки пользователей</h3>
        <ul>
        <li>Чистота: ⭐ 5</li>
        <li>Удобство: ⭐ 4</li>
        <li>Другое: ⭐ 4</li>
        </ul>
        <button class="close-modal">Закрыть</button>
        </div>
        </div>`,
    });
    const popupHtml = popup.getContent();
    popupHtml.querySelectorAll('.toggle-description').forEach(button => {
        button.addEventListener('click', () => {
            const desc = button.closest('.location-description');
            desc.classList.toggle('short');
            button.textContent = desc.classList.contains('short') ? 'Показать больше' : 'Скрыть';
        });
    });
    
    const openBtn = popupHtml.querySelector('.open-detailed-rating');
    const modal = popupHtml.querySelector('.rating-modal');
    const closeBtn = popupHtml.querySelector('.close-modal');
    
    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    
    
    const canvas = map.getCanvas();
    canvas.addEventListener('click', removeLocation);
    function removeLocation(e){
        if (e.target === canvas) {
            popup.destroy();
        }
        canvas.removeEventListener('click', removeLocation);
    }
}




/*
export async function clickHandler() {
    const canvas = document.querySelector('canvas');
    canvas.addEventListener('click', click);

    function click(){
        console.log('click');
    }
}
*/