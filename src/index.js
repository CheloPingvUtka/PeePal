import {
    addLocation,
    loadLocations, 
    showLocationPopup, 
    form,
    getUserCoordinates,
    initBottomMenu,
    handleLocationHash,
} from './helpers';


(async () => {
  const userCoords = await getUserCoordinates();
  await loadLocations(userCoords);
})();


await handleLocationHash();
form();
initBottomMenu();
addLocation();

