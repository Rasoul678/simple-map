// import MTRMap from "./mtrMap";
// import { getLatLngByAddress, getAddressByLatLng } from "./utils";
import "./styles.scss";
import MMP from "map-package";

// const MtrMap = function (options: any) {
//   return new MTRMap(options);
// };

// window.MtrMap = MtrMap;

// export { getAddressByLatLng, getLatLngByAddress };

const element1 = document.querySelector("#map") as HTMLElement;
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

const mtrMap = new MMP({
  element: element1,
  presets: {
    center: {
      lat: 35.65,
      lng: 51.4,
    },
    zoom: 13,
    // zoomControl: true,
    // stickyMode: true,
    // flyMode: false
  },
  marker: {
    deafult: { lat: 35.7, lng: 51.38 },
    draggable: true,
  },
  events: {
    onGetAddress: showAddress,
    onMapReady: onReady,
  },
  inputs: {
    province: provinceInput,
    county: countyInput,
    suburb: suburbInput,
    city: cityInput,
    village: urbunInput,
    address: addressInput,
  },
  iconUrl: "https://cdn.parsimap.ir/icons/map-marker.png",
  tokens: {
    apiKey: process.env.PMI_API_TOKEN,
    mapKey: process.env.PMI_API_MAP_TOKEN,
  },
  plugins: ["geocode"],
});

function onReady(map: any) {
  // console.log(map);
}

function showAddress(res: any) {
  //! First method to fill inputs
  // console.log(res, "res");
  // const {address} = res || {};
  // stateInput.value = address?.state || address?.province || '';
  // countyInput.value = address?.county || '';
  // cityInput.value = address?.city || address?.town || '';
  // suburbInput.value = address?.suburb || '';
  // neighbourhoodInput.value = address?.neighbourhood || '';
  // roadInput.value = address?.road || '';
}
