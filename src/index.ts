import MtrMap, { getLatLngByAddress } from './mtrMap';
import './styles.scss';

const element1 = document.querySelector('#map') as HTMLElement;
const button = document.querySelector('[data-js="add"]') as HTMLElement;

const mtrMap = new MtrMap({
    element: element1,
    presets: {
        latlng: {
            lat: 35.65,
            lng: 51.4
        },
        zoom: 10,
    },
    marker: {lat: 35.7, lng: 51.38},
});

button.addEventListener('click', () => {
    mtrMap.addMarker({lat: 20, lng: 12});
    console.log(mtrMap.marker, 'marker');

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

console.log(mtrMap.address, 'address');
