import { AddressSearchParams, LatLngSearchParams } from "../types";

/**
 * Get reverse address by location longitude and latitude.
 * @param {AddressSearchParams} params
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
 * @param {LatLngSearchParams} params
 * @returns Promise
 */
export const getLatLngByAddress = (params: LatLngSearchParams) => {
  const searchParams: LatLngSearchParams = {
    search_text: params.search_text,
    key: params.key,
    only_in_district: params.only_in_district || "false",
    subdivision: params.subdivision || "false",
    plate: params.plate || "false",
  };

  const url = new URL("https://api.parsimap.ir/geocode/forward");
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

export function debounce(func: Function, timeout = 300) {
  let timer: any;

  return (...args: any[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
