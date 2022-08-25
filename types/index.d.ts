declare global {
    interface Window {
      L: any;
    }
}

export type MapElement = string | HTMLElement
export type LatLng = {
    lat: number,
    lng: number,
    popUp?: string
}

export interface MapOptions {
    element: MapElement,
    presets?: {
        latlng: Pick<LatLng, 'lat' | 'lng'>,
        zoom: number
    },
    markers?: LatLng[],
    isSingleMarker?: Boolean
}

export type AddressFormat = 'xml'|'json'|'jsonv2'|'geojson'|'geocodejson';