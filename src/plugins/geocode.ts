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
    L.DomEvent.on(container, "wheel", this._onMouseWheel, this);
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
    L.DomEvent.off(searchBox, "wheel", this._onMouseWheel, this);
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
    const {
      description,
      geo_location: { title },
    } = result;

    const resItem = L.DomUtil.create("div");
    const resTitle = L.DomUtil.create("span");
    const resDescription = L.DomUtil.create("p");

    resTitle.classList.add("search-title");
    resDescription.classList.add("search-description");
    resItem.classList.add("MtrMap--search-item");

    const pinSvg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
      >
        <defs>
          <style>
            .a {
              fill: #707070;
            }
            .b {
              fill: none;
            }
          </style>
        </defs>
        <g transform="translate(-1495.335 -392)">
          <g transform="translate(1495.335 392)">
            <g transform="translate(2.707 0.541)">
              <path
                class="a"
                d="M5847.325,3927.6l-.005-.006a6.608,6.608,0,0,0-8.8.006,6.134,6.134,0,0,0-.582,8.043l4.98,6.624,4.975-6.613A6.136,6.136,0,0,0,5847.325,3927.6Zm-.159,7.548-4.239,5.635-4.255-5.646a5.286,5.286,0,0,1,.489-6.926,5.652,5.652,0,0,1,7.521-.006A5.29,5.29,0,0,1,5847.166,3935.153Z"
                transform="translate(-5836.709 -3925.926)"
              />
              <path
                class="a"
                d="M5847.87,3932.89a2.231,2.231,0,1,0,.654,1.578A2.238,2.238,0,0,0,5847.87,3932.89Zm-1.578,2.935a1.36,1.36,0,1,1,1.363-1.358A1.361,1.361,0,0,1,5846.292,3935.825Z"
                transform="translate(-5840.019 -3928.764)"
              />
            </g>
            <rect class="b" width="18" height="18" />
          </g>
        </g>
      </svg>
    `;

    resItem.innerHTML = pinSvg;
    resTitle.innerText = title;
    resDescription.innerText = description;

    resItem.appendChild(resTitle);
    resItem.appendChild(resDescription);

    return resItem;
  },
});

export function geocode(opts?: any) {
  return new L.Control.SearchBox(opts);
}
