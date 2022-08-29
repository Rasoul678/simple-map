import MTRMap from "./mtrMap";
import { getLatLngByAddress, getAddressByLatLng } from "./utils";
import "./styles.scss";

const MtrMap = function (options: any) {
  return new MTRMap(options);
};

window.MtrMap = MtrMap;

export { getAddressByLatLng, getLatLngByAddress };

const element1 = document.querySelector("#map") as HTMLElement;
const button = document.querySelector('[data-js="add"]') as HTMLElement;
const provinceInput = document.querySelector(
  '[data-js="province"]'
) as HTMLInputElement;
const countyInput = document.querySelector(
  '[data-js="county"]'
) as HTMLInputElement;
const cityInput = document.querySelector(
  '[data-js="city"]'
) as HTMLInputElement;
const suburbInput = document.querySelector(
  '[data-js="suburb"]'
) as HTMLInputElement;
const urbunInput = document.querySelector(
  '[data-js="urbun"]'
) as HTMLInputElement;
const addressInput = document.querySelector(
  '[data-js="address"]'
) as HTMLInputElement;

const mtrMap = new MTRMap({
  element: element1,
  presets: {
    latlng: {
      lat: 35.65,
      lng: 51.4,
    },
    zoom: 13,
  },
  defaultMarker: { lat: 35.7, lng: 51.38 },
  events: {
    onGetAddress: showAddress,
  },
  inputs: {
    province: provinceInput,
    county: countyInput,
    suburb: suburbInput,
    city: cityInput,
    urbun: urbunInput,
    address: addressInput,
  },
  iconUrl: "https://cdn.parsimap.ir/icons/map-marker.png",
  tokens: {
    apiKey: process.env.PMI_API_TOKEN,
    mapKey: process.env.PMI_API_MAP_TOKEN,
  },
});

function showAddress(res: any) {
  //! First method to fill inputs
  console.log(res, "res");
  // const {address} = res || {};
  // stateInput.value = address?.state || address?.province || '';
  // countyInput.value = address?.county || '';
  // cityInput.value = address?.city || address?.town || '';
  // suburbInput.value = address?.suburb || '';
  // neighbourhoodInput.value = address?.neighbourhood || '';
  // roadInput.value = address?.road || '';
}

button &&
  button.addEventListener("click", () => {
    mtrMap.addMarker({ lat: 29.60739350145135, lng: 52.532415968397186 });
    console.log(mtrMap.marker, "Shiraz");
  });

const input = document.querySelector('[data-js="search"]');
const searchButton = document.querySelector('[data-js="search-btn"]');
const dataList = document.querySelector('[data-js="data-list"]');

searchButton &&
  searchButton?.addEventListener("click", () => {
    getLatLngByAddress((input as HTMLInputElement).value).then((res: any[]) => {
      console.log(res);
      dataList.innerHTML = "";

      res.forEach((item) => {
        const { state, county, city, road } = item.address;
        let optionTag = document.createElement("li");
        optionTag.innerText = `${state || ""}-${county || ""}-${city || ""}-${
          road || ""
        }`;
        dataList.appendChild(optionTag);

        optionTag.addEventListener("click", () => {
          mtrMap.addMarker({ lat: item.lat, lng: item.lon });
        });
      });
    });
  });
