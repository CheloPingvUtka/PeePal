import {
    addLocation,
    loadLocations, 
    showLocationPopup, 
    form,
    getUserCoordinates,
    initBottomMenu
} from './helpers';


(async () => {
  const userCoords = await getUserCoordinates();
  await loadLocations(userCoords);
})();

form();
initBottomMenu();
addLocation();
//openLoacation();

//clickHandler();
//start();
