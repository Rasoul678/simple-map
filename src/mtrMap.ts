import {
  MapOptions,
  MapElement,
  LatLng,
  InputField,
  ApiStatusEnum,
  SearchByAddressResponse,
  Result,
} from "../types";
import { getAddressByLatLng, getLatLngByAddress, debounce } from "./utils";

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
    const { lng: lon, lat } = this._options.presets.center;

    const map = L.map(this.element, {
      center: [lat, lon],
      zoom: this._options.presets.zoom,
      zoomControl: this._options.presets.zoomControl,
    });

    map.whenReady(() => {
      if (this._options.events.onMapReady) {
        this._options.events.onMapReady(map);
      }
    });

    L.Map.include({
      getErrorMessage: this.getErrorMessage,
      getAddressBy: this.getAddressBy,
      getLatLngBy: this.getLatLngBy,
      addMarker: this.addMarker.bind(this),
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
    map.addControl(L.Control.searchBox({ position: "topright" }));

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

    let prevMarker = this.marker || this._options.presets.center;

    let distance = L.GeometryUtil.distance(this.map, marker, prevMarker);
    let flyDuration = Math.min(Math.max(0.5, +(distance / 2500).toFixed(1)), 3);

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
        status,
        data,
        error: this.getErrorMessage(status),
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
    return data;
  };
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
    addressDiv.setAttribute("id", "address-box");
    L.DomEvent.on(addressDiv, "click", this._onClick, this);
    L.DomEvent.on(addressDiv, "dblclick", this._onClick, this);
    return addressDiv;
  },

  onRemove: function (map: any) {
    const addressDiv = L.DomUtil.get("address-box");
    L.DomEvent.off(addressDiv, "click", this._onClick, this);
    L.DomEvent.off(addressDiv, "dblclick", this._onClick, this);
  },

  _onClick: function (e: any) {
    e.stopPropagation();
  },
});

L.Control.addressBox = function (opts?: any) {
  return new L.Control.AddressBox(opts);
};

L.Control.SearchBox = L.Control.extend({
  onAdd: function (map: any) {
    const container = L.DomUtil.create("div");
    const searchInput = L.DomUtil.create("input");

    searchInput.setAttribute("placeholder", "جستجوس آدرس");
    container.classList.add("MtrMap--search");
    requestAnimationFrame(() => {
      container.classList.add("show-box");
    });
    container.setAttribute("id", "search-box");

    container.appendChild(searchInput);

    const resultsWrapper = L.DomUtil.create("div");
    resultsWrapper.classList.add("MtrMap--search-results");

    container.appendChild(resultsWrapper);

    //! Event listeners
    //* On blur input
    L.DomEvent.on(searchInput, "blur", function (e: any) {
      if (!e.target.value) {
        console.log("blur");
      }
    });

    //* On focus input
    L.DomEvent.on(searchInput, "focus", function (e: any) {
      if (resultsWrapper.hasChildNodes()) {
        resultsWrapper.classList.add("show-results");
      }
    });

    //* On change input
    L.DomEvent.on(
      searchInput,
      "input",
      debounce(async (e: any) => {
        const searchText = (e.target as HTMLInputElement).value;
        if (!searchText) {
          resultsWrapper.innerHTML = "";
          resultsWrapper.classList.remove("show-results");
        }
        const data: SearchByAddressResponse = await map.getLatLngBy(searchText);

        if (data.status === "OK") {
          if (data.results.length) {
            resultsWrapper.classList.add("show-results");
          }

          resultsWrapper.innerHTML = "";

          data.results.forEach((res) => {
            const result = this._createResultElement(res);
            resultsWrapper.appendChild(result);

            result.addEventListener("click", () => {
              map.addMarker(res.geo_location.center);
              resultsWrapper.classList.remove("show-results");
              searchInput.value = res.description;
            });
          });
        }
      }, 700)
    );

    //* On mouse wheel container
    L.DomEvent.on(container, "mousewheel", function (e: any) {
      e.stopPropagation();
    });

    //* On click and double click contaiber
    L.DomEvent.on(container, "click", this._onClick, this);
    L.DomEvent.on(container, "dblclick", this._onClick, this);

    return container;
  },

  onRemove: function (map: any) {
    const searchDiv = L.DomUtil.get("search-box");
    L.DomEvent.off(searchDiv, "click", this._onClick, this);
    L.DomEvent.off(searchDiv, "dblclick", this._onClick, this);
  },

  _onClick: function (e: any) {
    e.stopPropagation();
  },

  _createResultElement: function (result: Result) {
    const element = L.DomUtil.create("div");
    element.innerText = result.description;
    element.classList.add("MtrMap--search-item");

    return element;
  },
});

L.Control.searchBox = function (opts?: any) {
  return new L.Control.SearchBox(opts);
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
