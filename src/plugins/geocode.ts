/**
 * Out of the box, this plugin provides search capabilities for maps
 */
import { Result, SearchByAddressResponse } from "../../types";
import { debounce } from "../utils";

const { L } = window || {};

L.Control.SearchBox = L.Control.extend({
  onAdd: function (map: any) {
    const container = L.DomUtil.create("div");
    const searchInput = L.DomUtil.create("input");

    searchInput.setAttribute("placeholder", "جستجوس آدرس");
    searchInput.setAttribute("id", "search-input");

    container.classList.add("MtrMap--search");
    container.setAttribute("id", "search-box");
    
    requestAnimationFrame(() => {
      container.classList.add("show-box");
    });

    container.appendChild(searchInput);

    const resultsWrapper = L.DomUtil.create("div");
    resultsWrapper.classList.add("MtrMap--search-results");
    resultsWrapper.setAttribute("id", "search-results");

    container.appendChild(resultsWrapper);

    //! Event listeners

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

    L.DomEvent.on(searchInput, "blur", this._onBlur, resultsWrapper);
    L.DomEvent.on(searchInput, "focus", this._onFocus, resultsWrapper);
    L.DomEvent.on(container, "mousewheel", this._onMouseWheel, this);
    L.DomEvent.on(container, "click", this._onClick, this);
    L.DomEvent.on(container, "dblclick", this._onClick, this);
    L.DomEvent.on(container, "mousedown", this._disableDrag, this);
    L.DomEvent.on(container, "mouseup", this._enableDrag, this);

    return container;
  },

  onRemove: function (map: any) {
    const searchBox = L.DomUtil.get("search-box");
    const searchResults = L.DomUtil.get("search-results");
    const searchInput = L.DomUtil.get("search-input");

    L.DomEvent.off(searchInput, "blur", this._onBlur, searchResults);
    L.DomEvent.off(searchBox, "mousewheel", this._onMouseWheel, this);
    L.DomEvent.off(searchBox, "click", this._onClick, this);
    L.DomEvent.off(searchBox, "dblclick", this._onClick, this);
    L.DomEvent.off(searchBox, "mousedown", this._disableDrag, this);
    L.DomEvent.off(searchBox, "mouseup", this._enableDrag, this);
  },

  _onFocus: function () {
    if (this.hasChildNodes()) {
      this.classList.add("show-results");
    }
  },

  _onBlur: function () {
    this.classList.remove("show-results");
  },

  _onMouseWheel: function (e: any) {
    e.stopPropagation();
  },

  _onClick: function (e: any) {
    e.stopPropagation();
  },

  _disableDrag: function () {
    this._map.dragging.disable();
  },

  _enableDrag: function () {
    this._map.dragging.enable();
  },

  _createResultElement: function (result: Result) {
    const resItem = L.DomUtil.create("div");
    const resText = L.DomUtil.create("span");
    const pinSvg = `
        <svg style="width: 24px; height: 24px; fill: #000">
          <path
            fill-rule="evenodd"
            d="M4 9.611C4 5.391 7.59 2 12 2s8 3.39 8 7.611c0 2.818-1.425 5.518-3.768 8.034a23.496 23.496 0 01-2.514 2.322c-.517.413-.923.706-1.166.867L12 21.2l-.552-.366c-.243-.16-.65-.454-1.166-.867a23.499 23.499 0 01-2.514-2.322C5.425 15.129 4 12.428 4 9.61zm8.47 8.794c.784-.627 1.569-1.34 2.298-2.124C16.8 14.101 18 11.827 18 9.611 18 6.521 15.33 4 12 4S6 6.522 6 9.611c0 2.215 1.2 4.49 3.232 6.67A21.536 21.536 0 0012 18.769c.148-.111.305-.233.47-.364zM12 14a4.001 4.001 0 010-8 4.001 4.001 0 010 8zm0-2a2.001 2.001 0 000-4 2.001 2.001 0 000 4z"
            clip-rule="evenodd"
          ></path>
        </svg>
      `;
    resItem.innerHTML = pinSvg;
    resText.innerText = result.description;
    resItem.appendChild(resText);
    resItem.classList.add("MtrMap--search-item");

    return resItem;
  },
});

export function geocode(opts?: any) {
  return new L.Control.SearchBox(opts);
}
