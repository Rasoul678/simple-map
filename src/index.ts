import MtrMap from './mtrMap';

const element1 = document.querySelector('#map') as HTMLElement;
const button = document.querySelector('[data-js="add"]') as HTMLElement;

const mtrMap = new MtrMap({element: element1, presets: {
    latlng: {
        lat: 0,
        lng: 0
    },
    zoom: 3,
}, markers: [{lat: 0, lng: 0}, {lat: 33, lng: 33, popUp: 'there'}]});

mtrMap.addMarker({lat: 10, lng: 10});

button.addEventListener('click', () => {
    mtrMap.addMarker({lat: 20, lng: 12});
    console.log(mtrMap.markers, 'markers');

});

console.log(mtrMap.element);
console.log(mtrMap.map);
console.log(mtrMap.markers);