import MtrMap from './mtrMap';
import {getLatLngByAddress} from './utils'

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

const input = document.querySelector('[data-js="search"]');
const searchButton = document.querySelector('[data-js="search-btn"]');
const dataList = document.querySelector('[data-js="data-list"]');

searchButton?.addEventListener('click', () => {
    getLatLngByAddress((input as HTMLInputElement).value).then((res: any[]) => {
        console.log(res);
        res.forEach(item => {
            const {state, county, city, road} = item.address;
            let optionTag = document.createElement('li');
            optionTag.innerText = `${state}-${county}-${city}-${road}`;
            dataList.appendChild(optionTag);
        })
    })
});