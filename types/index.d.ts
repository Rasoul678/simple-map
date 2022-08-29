declare global {
  interface Window {
    L: any;
    MtrMap: any;
  }
}

export type MapElement = string | HTMLElement;
export type LatLng = {
  lat: number;
  lng: number;
  popUp?: string;
};

type AddressResponse = {
  status: ApiStatusEnum;
  data: { [key: string]: string } | null;
  error?: string | null;
};

type InputField = HTMLInputElement | string;

declare enum InputsEnum {
  province = "province",
  county = "county",
  suburb = "suburb",
  city = "city",
  urbun = "urbun",
  address = "address",
}

declare enum ApiStatusEnum {
  OK,
  UNAUTHORIZED,
  LIMIT_REACHED,
  ERROR,
  INVALID_PARAMETERS,
  SERVICE_UNAVAILABLE,
}

type Inputs = {
  [key in InputsEnum]?: InputField;
};

type Tokens = {
  apiKey: string;
  mapKey: string;
};

export interface MapOptions {
  element: MapElement;
  presets?: {
    latlng: Pick<LatLng, "lat" | "lng">;
    zoom: number;
  };
  defaultMarker?: LatLng;
  events?: {
    onGetAddress?: (address: AddressResponse) => void;
  };
  inputs?: Inputs;
  iconUrl?: string;
  tokens: Tokens;
}

type StringBool = "true" | "false";

export type AddressSearchParams = {
  key: string;
  location: string;
  local_address?: StringBool;
  approx_address?: StringBool;
  subdivision?: StringBool;
  plate?: StringBool;
  request_id?: StringBool;
};
