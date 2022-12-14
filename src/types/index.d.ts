declare global {
  interface Window {
    L: any;
    MtrMap: any;
  }
}

type MapElement = string | HTMLElement;
type LatLng = {
  lat: number;
  lng: number;
  popUp?: string;
};

type AddressResponse = {
  status: ApiStatusEnum;
  data: { [key: string]: string } | null;
  error?: string | null;
};

type Result = {
  description: string;
  geo_location: {
    category: string;
    title: string;
    center: Pick<LatLng, "lat" | "lng">;
    north_east: Pick<LatLng, "lat" | "lng">;
    south_west: Pick<LatLng, "lat" | "lng">;
  };
};

type Sub = {
  code: string;
  id: number;
  title: string;
  type: string;
};

type Subdivisions = {
  ostan: Sub;
  bakhsh: Sub;
  shahrestan: Sub;
  shahr: Sub;
  rusta: Sub;
};

interface SearchByAddressResponse {
  Consumer: number;
  results: Result[];
  search_type: string;
  status: ApiStatusEnum;
}

interface SearchByLatLngResponse {
  address: string;
  approximate_address: string;
  local_address: string;
  geofences: [];
  status: ApiStatusEnum;
  subdivision_prefix: string;
  subdivisions: Subdivisions;
}

type InputField = HTMLInputElement | string;

declare enum InputsEnum {
  province = "province",
  county = "county",
  suburb = "suburb",
  city = "city",
  village = "village",
  address = "address",
}

declare enum ApiStatusEnum {
  OK = "OK",
  UNAUTHORIZED = "UNAUTHORIZED",
  LIMIT_REACHED = "LIMIT_REACHED",
  ERROR = "ERROR",
  INVALID_PARAMETERS = "INVALID_PARAMETERS",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

type Inputs = {
  [key in InputsEnum]?: InputField;
};

type Tokens = {
  apiKey: string;
  mapKey: string;
};

interface MapOptions {
  element: MapElement;
  presets?: {
    center: Pick<LatLng, "lat" | "lng">;
    zoom: number;
    zoomControl?: boolean;
    flyMode?: boolean;
    stickyMode?: boolean;
  };
  marker?: {
    deafult?: LatLng;
    draggable?: boolean;
  };
  events?: {
    onGetAddress?: (
      address: SearchByLatLngResponse & { responseMessage?: string | null }
    ) => void;
    onMapReady?: (map: any) => void;
    onGeoResult?: (result: SearchByAddressResponse) => void;
  };
  inputs?: Inputs;
  iconUrl?: string;
  tokens: Tokens;
  plugins?: ("footer" | "geocode")[];
}

type StringBool = "true" | "false";

type AddressSearchParams = {
  key: string;
  location: string;
  local_address?: StringBool;
  approx_address?: StringBool;
  subdivision?: StringBool;
  plate?: StringBool;
  request_id?: StringBool;
};

export type LatLngSearchParams = {
  key: string;
  search_text: string;
  only_in_district?: StringBool;
  subdivision?: StringBool;
  plate?: StringBool;
};
