import {
  MapOptions,
  MapElement,
  LatLng,
  InputField,
  ApiStatusEnum,
  SearchByAddressResponse,
  SearchByLatLngResponse,
} from "./types";
import { getAddressByLatLng, getLatLngByAddress } from "./utils";
import { geocode, footer, customMarker, customIcon } from "./plugins";

const { L } = window || {};

class MtrMap {
  private _element: MapElement;
  private _map: any;
  private _marker: LatLng | null;
  private _markerObj: any;
  private _options: MapOptions;
  private _addressString: string | null;
  private _icon: any;

  constructor(options: MapOptions) {
    if (!L) {
      throw new Error(
        "Please add leaflet and other necessary scripts to head tag."
      );
    }

    this._element = options.element;
    this._options = options;
    this.init();
  }

  private init() {
    //! Initialize map instance
    const { lng: lon, lat } = this._options.presets.center;

    //* Instantiate a map object
    const map = L.map(this.element, {
      center: [lat, lon],
      zoom: this._options.presets.zoom,
      zoomControl: this._options.presets.zoomControl,
    });

    //* Fires when map is ready (handy sometimes!)
    map.whenReady(() => {
      if (this._options.events.onMapReady) {
        this._options.events.onMapReady(map);
      }
    });

    //! Add class to map container
    map.getContainer().classList.add("MtrMap--container");

    //* Include some properties to map instance (we can access them inside map object)
    L.Map.include({
      getResponseMessage: this.getResponseMessage,
      getAddressBy: this.getAddressBy,
      getLatLngBy: this.getLatLngBy,
      addMarker: this.addMarker.bind(this),
    });

    //! Add the tiles
    L.parsimapTileLayer("parsimap-streets-v11-raster", {
      key: this._options.tokens.mapKey,
    }).addTo(map);

    //! Init icon
    const icon = customIcon({
      iconUrl: this._options.iconUrl,
    });

    //! Add Control
    if (this._options.plugins.includes("footer")) {
      map.addControl(footer({ position: "bottomleft" }));
    }

    if (this._options.plugins.includes("geocode")) {
      map.addControl(geocode({ position: "topright" }));
    }

    //! Add handlers
    map.addHandler("tilt", L.TiltHandler);
    map.tilt.enable();

    if (this._options.presets.stickyMode) {
      map.on("move", (e: any) => {
        this._markerObj.setLatLng(map.getCenter());
      });

      map.on("dragend", (e: any) => {
        this.renderAddressOn(map.getCenter());
      });
    } else {
      map.on("click", (e: any) => {
        this.addMarker(e.latlng);
      });
    }

    this._map = map;
    this._icon = icon;

    //! Show markers on the map
    this._marker = this._options?.marker?.deafult || null;
    if (this._marker) {
      this.addMarker(this._options?.marker?.deafult);
    }
  }

  private renderMarker(flyDuration: number) {
    const {
      presets: { stickyMode },
      marker: { draggable },
    } = this._options;

    //* sticky mode has priority over draggable flag
    //* It means it is draggable if map is not in sticky mode and has draggable flag on.
    const isMarkerDraggable = stickyMode ? false : draggable ?? false;

    //! Init marker
    const markerObj = customMarker(
      { lon: this.marker.lng, lat: this.marker.lat },
      {
        draggable: isMarkerDraggable,
        ...(this._options.iconUrl && { icon: this._icon }),
      }
    );

    if (isMarkerDraggable) {
      markerObj.on("dragend", () => {
        const latLng = markerObj.getLatLng();
        this.addMarker(latLng);
      });
    }

    this._markerObj = markerObj;

    if (this.marker.popUp) {
      markerObj.bindPopup(this.marker.popUp);
    }

    markerObj.addTo(this.map);

    //* Fly effect on map
    this.map.flyTo(
      { lon: this.marker.lng, lat: this.marker.lat },
      this.map.getZoom(),
      {
        animate: this._options.presets.flyMode ?? true,
        duration: flyDuration,
      }
    );

    if (this._options?.marker?.deafult) {
      const addressBox = document.querySelector(
        ".MtrMap--address.leaflet-control"
      ) as HTMLElement;

      requestAnimationFrame(() => {
        if (addressBox) {
          addressBox.style.transform = "translate3d(0,0,0)";
        }
      });
    }
  }

  get element() {
    return this._element;
  }

  get map() {
    return this._map;
  }

  get marker() {
    return this._marker;
  }

  get addressString() {
    return this._addressString;
  }

  addMarker(marker: LatLng) {
    if (!marker) return;

    //* Get previous marker on map (if not, revert to the map center!)
    let prevMarker = this.marker || this._options.presets.center;

    //* Calculate distance between tow targets
    //* and then indicate how much the fly duration should be
    let distance = L.GeometryUtil.distance(this.map, marker, prevMarker);
    let flyDuration = Math.min(Math.max(0.5, +(distance / 2500).toFixed(1)), 3);

    //* If marker is pointed exactly to the same place, prevent fly animation 
    if (!distance) {
      flyDuration = 0;
    }

    //! Remove last marker
    if (this._markerObj) {
      this.map.removeLayer(this._markerObj);
    }

    //! Add new marker
    this._marker = marker;
    this.renderMarker(flyDuration);

    //! Get new address based on new marker
    this.renderAddressOn(marker);
  }

  private renderAddressOn = async (marker: LatLng) => {
    const data = await this.getAddressBy(marker);

    const status: ApiStatusEnum = data.status;

    if (status === "OK") {
      //! Fire callback
      this._options.events.onGetAddress({
        ...data,
        responseMessage: this.getResponseMessage(status),
      });

      //! Set strigng address
      this.setAddressString(data);

      //! Set input fields
      if (this._options.inputs && data) {
        let inputVlues = { address: data.address };

        new Map(Object.entries(data?.subdivisions || {})).forEach(function (
          key: any,
          value: string
        ) {
          this[value] = key.title;
        },
        inputVlues);

        this.setInputs(inputVlues);
      }
    }
  };

  private setAddressString(data: any) {
    const subArray = Array.from(Object.entries(data?.subdivisions || {}));
    let addressString: string = "";

    let names: Record<string, string> = {
      ostan: "استان",
      shahrestan: "شهرستان",
      bakhsh: "بخش",
      shahr: "شهر",
      rusta: "روستا",
    };

    subArray.forEach(function ([name, object]) {
      addressString += `${names[name]} ${(object as any).title}، `;
    });

    addressString += data.address;

    const selector = ".MtrMap--address.leaflet-control";
    const addressBox = document.querySelector(selector) as HTMLElement;
    if (addressBox) {
      addressBox.innerText = addressString;
    }
    this._addressString = addressString;
  }

  private setInputs(values: any) {
    const { province, county, suburb, city, village, address } =
      this._options.inputs;

    const {
      ostan: provinceValue,
      shahrestan: countyValue,
      bakhsh: suburbValue,
      shahr: cityValue,
      rusta: urbunValue,
      address: addressValue,
    } = values;

    const allInputs = new Map([
      [province, provinceValue],
      [county, countyValue],
      [city, cityValue],
      [suburb, suburbValue],
      [village, urbunValue],
      [address, addressValue],
    ]);

    allInputs.forEach((value, input) => {
      this.fillInput(input, value);
    });
  }

  private fillInput(input: InputField, value: string) {
    const inputElement = this.mapToInputElement(input);

    if (inputElement) {
      inputElement.value = value || "";
    } else if (!inputElement) {
      console.error(`Input element with id: "${input}" has not found.`);
    }
  }

  private mapToInputElement(input: InputField): HTMLInputElement | null {
    if (typeof input === "string") {
      const inputElement: HTMLInputElement | null = L.DomUtil.get(input);

      return inputElement;
    }

    return input;
  }

  getResponseMessage(status: ApiStatusEnum) {
    const messages: Record<string, string> = {
      OK: "پاسخ به درخواست با موفقیت بوده است",
      UNAUTHORIZED: "توکن درخواستی معتبر نیست",
      AUTHEXPIRED: "محدودیت زمان وجود دارد",
      LIMIT_REACHED: "تعداد درخواست‌ها بیش از حد مجاز است",
      ERROR: "خطایی رخ داده است",
      INVALID_PARAMETERS: "پارامترهای وارد شده نادرست هستند",
      SERVICE_UNAVAILABLE: "سرویس از دسترس خارج شده است",
    };

    return messages[status] || null;
  }

  private getLatLngBy = async (
    address: string
  ): Promise<SearchByAddressResponse> => {
    const response = await getLatLngByAddress({
      key: this._options.tokens.apiKey,
      search_text: address,
    });

    return response as SearchByAddressResponse;
  };

  private getAddressBy = async (marker: LatLng) => {
    const data: any = await getAddressByLatLng({
      key: this._options.tokens.apiKey,
      location: `${marker.lng},${marker.lat}`,
    });

    return data as SearchByLatLngResponse;
  };
}

//! Tilt handler
L.TiltHandler = L.Handler.extend({
  addHooks: function (map: any) {
    let portrait = window.matchMedia("(orientation: portrait)");
    L.DomEvent.on(portrait, "change", this._tilt, this);
  },

  removeHooks: function () {
    let portrait = window.matchMedia("(orientation: portrait)");
    L.DomEvent.off(portrait, "change", this._tilt, this);
  },

  _tilt: function (e: any) {
    // Treat Gamma angle as horizontal pan (1 degree = 1 pixel) and Beta angle as vertical pan
    // this.panBy( L.point( e.gamma, e.beta ) );
    console.log(this);
  },
});

export default MtrMap;
