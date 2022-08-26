declare global {
    interface Window {
      L: any;
      addMarker: (marker: any) => void
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
    marker?: LatLng,
}