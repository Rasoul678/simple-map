import { LatLng } from "../types";

interface IGetAddress {
    latlng: Pick<LatLng, 'lat'|'lng'>,
    language: string
};

/**
 * Get reverse address by location longitude and latitude.
 * @param params
 * @returns Promise
 */
export const getAddressByLatLng = (params: IGetAddress) => {
    const {latlng: {lat, lng}, language} = params;
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.search = new URLSearchParams({
        lat: `${lat}`,
        lon: `${lng}`,
        format: "json",
        ["accept-language"]: language
    }).toString();
    
    return new Promise(async (resolve, reject) => {
        try {
            const data = await fetch(url);
            const result = await data.json();
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Query location longitude and latitude by address.
 * @param {string} query 
 * @returns Promise
 */
 export const getLatLngByAddress = (query: string) => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
        q: query,
        format: "json",
        ["polygon_geojson"]: "1",
        addressdetails: "1",
        ["accept-language"]: "fa"
    }).toString();
    
    return new Promise(async (resolve, reject) => {
        try {
            const data = await fetch(url);
            const result = await data.json();
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};