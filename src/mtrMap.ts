import {
  MapOptions,
  MapElement,
  LatLng,
  InputField,
  ApiStatusEnum,
} from "../types";
import { getAddressByLatLng, getLatLngByAddress } from "./utils";

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
      throw new Error("Please add leaflet scripts to head tag first.");
    }

    this._element = options.element;
    this._options = options;
    this.init();
  }

  private init() {
    //! Initialize map instance
    const { lng: lon, lat } = this._options.presets.latlng;

    const map = L.map(this.element, {
      center: [lat, lon],
      zoom: this._options.presets.zoom,
    });

    //! Add the tiles
    L.parsimapTileLayer("parsimap-streets-v11-raster", {
      key: this._options.tokens.mapKey,
    }).addTo(map);

    //! Init icon
    const icon = L.leafIcon({
      iconUrl: this._options.iconUrl,
    });

    //! Add Control
    map.addControl(L.Control.addressBox({ position: "bottomleft" }));

    //! Add handlers
    map.addHandler("tilt", L.TiltHandler);
    map.tilt.enable();

    if (this._options.presets.stickyMode) {
      map.on("move", (e: any) => {
        this._markerObj.setLatLng(map.getCenter());
      });

      map.on("dragend", (e: any) => {
        this.getAddressBy(map.getCenter());
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
    //* It means it is draggable if map is in not in sticky mode and has draggable flag on.
    const isMarkerDraggable = stickyMode ? false : draggable ?? false;

    //! Init marker
    const markerObj = L.customMarker(
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
      addressBox.style.transform = "translate3d(0,0,0)";
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

    let distance = L.GeometryUtil.distance(this.map, marker, this.marker);
    let flyDuration = Math.min(Math.max(0.5, +(distance / 2500).toFixed(1)), 3);

    // console.log(flyDuration);

    //! Remove last marker
    if (this._markerObj) {
      this.map.removeLayer(this._markerObj);
    }

    //! Add new marker
    this._marker = marker;
    this.renderMarker(flyDuration);

    //! Get new address based on new marker
    this.getAddressBy(marker);
  }

  private getAddressBy(marker: LatLng) {
    getAddressByLatLng({
      key: this._options.tokens.apiKey,
      location: `${marker.lng},${marker.lat}`,
    })
      .then((data: any) => {
        const status: ApiStatusEnum = data.status;

        //! Fire callback
        this._options.events.onGetAddress({
          status,
          data,
          error: this.getErrorMessage(status),
        });

        //! Set strigng address
        this.setAddress(data);

        //! Set input fields
        if (this._options.inputs && data) {
          let inputVlues = { address: data.address };

          new Map(Object.entries(data.subdivisions)).forEach(function (
            key: any,
            value: string
          ) {
            this[value] = key.title;
          },
          inputVlues);

          this.setInputs(inputVlues);
        }
      })
      .catch((error) => {
        this._options.events.onGetAddress({
          status: 418,
          data: null,
          error: error.message,
        });
      });
  }

  private setAddress(data: any) {
    const subArray = Array.from(Object.entries(data.subdivisions));
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
    addressBox.innerText = addressString;
    this._addressString = addressString;
  }

  private setInputs(values: any) {
    const { province, county, suburb, city, urbun, address } =
      this._options.inputs;

    const {
      ostan: provinceValue,
      shahrestan: countyValue,
      bakhsh: suburbValue,
      shahr: cityValue,
      rosta: urbunValue,
      address: addressValue,
    } = values;

    const allInputs = new Map([
      [province, provinceValue],
      [county, countyValue],
      [city, cityValue],
      [suburb, suburbValue],
      [urbun, urbunValue],
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

  getErrorMessage(status: ApiStatusEnum) {
    const messages: Record<string, string> = {
      Ok: "پاسخ به درخواست با موفقیت بوده است",
      UNAUTHORIZED: "توکن درخواستی معتبر نیست",
      AUTHEXPIRED: "محدودیت زمان وجود دارد",
      LIMIT_REACHED: "تعداد درخواست‌ها بیش از حد مجاز است",
      ERROR: "خطایی رخ داده است",
      INVALID_PARAMETERS: "پارامترهای وارد شده نادرست هستند",
      SERVICE_UNAVAILABLE: "سرویس از دسترس خارج شده است",
    };

    return messages[status] || null;
  }
}

//! Custome marker
L.CustomMarker = L.Marker.extend({
  onAdd: function (map: any) {
    this.on("click", this._clickHandler);
    this.on("dragend", this._dragHandler);
    L.Marker.prototype.onAdd.call(this, map);
  },

  onRemove: function (map: any) {
    this.off("click", this._clickHandler);
    this.off("dragend", this._dragHandler);
    L.Marker.prototype.onRemove.call(this, map);
  },

  _clickHandler: function (e: any, map: any) {
    //! Nothing to do here
  },

  _dragHandler: function (e: any) {
    //! Nothing to do here
    // const latLng = this.getLatLng();
    // console.log(latLng);
  },
});

L.customMarker = function (latLng: any, options: any) {
  return new L.CustomMarker(latLng, options);
};

//! Custome control
L.Control.AddressBox = L.Control.extend({
  onAdd: function (map: any) {
    const addressDiv = L.DomUtil.create("div");
    addressDiv.classList.add("MtrMap--address");
    addressDiv.setAttribute("id", "address");
    L.DomEvent.on(addressDiv, "click", this._onClick, this);
    return addressDiv;
  },

  onRemove: function (map: any) {
    const addressDiv = L.DomUtil.get("address");
    L.DomEvent.off(addressDiv, "click", this._onClick, this);
  },

  _onClick: function (e: any) {
    e.stopPropagation();
  },
});

L.Control.addressBox = function (opts?: any) {
  return new L.Control.AddressBox(opts);
};

//! Custom handler
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

//! Custom icon
L.LeafIcon = L.Icon.extend({
  options: {
    iconAnchor: [15, 42],
    // iconSize: [38, 95],
    // shadowSize: [50, 64],
    // shadowAnchor: [4, 62],
    // popupAnchor: [-3, -76],
  },
});

L.leafIcon = function (opts?: any) {
  return new L.LeafIcon(opts);
};

export default MtrMap;
