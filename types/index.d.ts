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

type AddressResponse = {
    status: number | string,
    address: {[key: string]: string} | null,
    error?: string | null
}

type InputField = HTMLInputElement | string;

declare enum InputsEnum {
    provinceOrState = 'provinceOrState',
    county = 'county',
    cityOrTown = 'cityOrTown',
    suburb = 'suburb',
    neighbourhood = 'neighbourhood',
    road = 'road',
}

type Inputs = {
    [key in InputsEnum]?: InputField
}

export interface MapOptions {
    element: MapElement,
    presets?: {
        latlng: Pick<LatLng, 'lat' | 'lng'>,
        zoom: number
    },
    marker?: LatLng,
    events?: {
        onGetAddress?: (address: AddressResponse) => void
    },
    inputs?: Inputs,
    iconUrl?: string
}