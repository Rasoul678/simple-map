import { AddressFormat, LatLng } from "../types";

interface IGetAddress {
    latlng: Pick<LatLng, 'lat'|'lng'>,
    format: AddressFormat,
    language: string
};

/**
 * Get reverse address by location longitude and latitude.
 * @param params
 * @returns Promise
 */
export const getAddressByLatLng = (params: IGetAddress) => {
    const {latlng, format, language} = params;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=${format}&accept-language=${language}`;
    
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