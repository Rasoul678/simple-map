import { AddressSearchParams, LatLng } from "../types";

/**
 * Get reverse address by location longitude and latitude.
 * @param params
 * @returns Promise
 */
export const getAddressByLatLng = (params: AddressSearchParams) => {
  const searchParams: AddressSearchParams = {
    key: params.key,
    location: params.location,
    approx_address: params.approx_address || "true",
    local_address: params.local_address || "true",
    plate: params.plate || "false",
    subdivision: params.subdivision || "true",
    request_id: params.request_id || "false",
  };
  const url = new URL("https://api.parsimap.ir/geocode/reverse");
  url.search = new URLSearchParams(searchParams).toString();

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
    ["accept-language"]: "fa",
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
