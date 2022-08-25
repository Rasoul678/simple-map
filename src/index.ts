import MtrMap from './mtrMap';

const element1 = document.querySelector('#map') as HTMLElement;
const button = document.querySelector('[data-js="add"]') as HTMLElement;

const mtrMap = new MtrMap({
    element: element1,
    presets: {
        latlng: {
            lat: 35.68,
            lng: 51.38
        },
        zoom: 12,
    },
    markers: [{lat: 35.68, lng: 51.38}, {lat: 33, lng: 33, popUp: 'there'}],
    isSingleMarker: true
});

button.addEventListener('click', () => {
    mtrMap.addMarker({lat: 20, lng: 12});
    console.log(mtrMap.markers, 'markers');

});