/**
 * Out of the box, this plugin provides search capabilities for maps
 */
import { Result, SearchByAddressResponse } from "../types";
import { debounce } from "../utils";
import pinIcon from "../assets/icons/pin.svg";
import cancelIcon from "../assets/icons/cancel.svg";
import searchIcon from "../assets/icons/search.svg";

const { L } = window || {};

L.Control.SearchBox = L.Control.extend({
  onAdd: function (map: any) {
    const container: HTMLDivElement = L.DomUtil.create("div");
    const searchWrapper: HTMLDivElement = L.DomUtil.create("div");
    const iconsWrapper: HTMLDivElement = L.DomUtil.create("div");
    const searchInput: HTMLInputElement = L.DomUtil.create("input");
    const cancelImage: HTMLImageElement = L.DomUtil.create("img");
    const searchImage: HTMLImageElement = L.DomUtil.create("img");

    searchWrapper.classList.add("MtrMap--searchWrapper");
    iconsWrapper.classList.add("MtrMap--iconsWrapper");

    cancelImage.src = cancelIcon;
    searchImage.src = searchIcon;

    iconsWrapper.appendChild(cancelImage);
    iconsWrapper.appendChild(searchImage);

    cancelImage.setAttribute("id", "cancel-image");
    searchInput.setAttribute("placeholder", "جستجوس آدرس");
    searchInput.setAttribute("id", "search-input");

    container.classList.add("MtrMap--search");
    container.setAttribute("id", "search-box");

    requestAnimationFrame(() => {
      container.classList.add("show-box");
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(iconsWrapper);
    container.appendChild(searchWrapper);

    const resultsWrapper: HTMLDivElement = L.DomUtil.create("div");
    resultsWrapper.classList.add("MtrMap--search-results");
    resultsWrapper.setAttribute("id", "search-results");

    container.appendChild(resultsWrapper);

    //! Event listeners

    //* On change input
    L.DomEvent.on(
      searchInput,
      "input",
      debounce(async (e: InputEvent) => {
        const searchText = (e.target as HTMLInputElement).value;
        if (!searchText) {
          resultsWrapper.innerHTML = "";
          resultsWrapper.classList.remove("show-results");
          cancelImage.classList.remove("show");
        } else {
          cancelImage.classList.add("show");
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

    L.DomEvent.on(searchInput, "focus", this._onFocus, resultsWrapper);
    L.DomEvent.on(container, "wheel", this._onMouseWheel, this);
    L.DomEvent.on(container, "click", this._onClick, this);
    L.DomEvent.on(container, "dblclick", this._onClick, this);
    L.DomEvent.on(container, "mousedown", this._disableDrag, this);
    L.DomEvent.on(container, "mouseup", this._enableDrag, this);
    L.DomEvent.on(document, "click", this._onClickDoc, resultsWrapper);
    L.DomEvent.on(cancelImage, "click", this._onClearSearch, searchInput);

    return container;
  },

  onRemove: function (map: any) {
    const searchBox = L.DomUtil.get("search-box");
    const searchResults = L.DomUtil.get("search-results");
    const searchInput = L.DomUtil.get("search-input");
    const cancelImage = L.DomUtil.get("cancel-image");

    L.DomEvent.off(searchInput, "focus", this._onFocus, searchResults);
    L.DomEvent.off(searchBox, "wheel", this._onMouseWheel, this);
    L.DomEvent.off(searchBox, "click", this._onClick, this);
    L.DomEvent.off(searchBox, "dblclick", this._onClick, this);
    L.DomEvent.off(searchBox, "mousedown", this._disableDrag, this);
    L.DomEvent.off(searchBox, "mouseup", this._enableDrag, this);
    L.DomEvent.off(document, "click", this._onClickDoc, searchResults);
    L.DomEvent.off(cancelImage, "click", this._onClearSearch, searchInput);
  },

  _onClearSearch: function (e: MouseEvent) {
    const searchResults: HTMLDivElement = L.DomUtil.get("search-results");
    const cancelImage: HTMLImageElement = L.DomUtil.get("cancel-image");

    this.value = "";
    searchResults.innerHTML = "";
    searchResults.classList.remove("show-results");
    cancelImage.classList.remove("show");
  },

  _onClickDoc: function (e: MouseEvent) {
    this.classList.remove("show-results");
  },

  _onFocus: function (e: FocusEvent) {
    if (this.hasChildNodes()) {
      this.classList.add("show-results");
    }
  },

  _onMouseWheel: function (e: WheelEvent) {
    e.stopPropagation();
  },

  _onClick: function (e: MouseEvent) {
    e.stopPropagation();
  },

  _disableDrag: function (e: MouseEvent) {
    this._map.dragging.disable();
  },

  _enableDrag: function (e: MouseEvent) {
    this._map.dragging.enable();
  },

  _createResultElement: function (result: Result) {
    const {
      description,
      geo_location: { title },
    } = result;

    const resItem: HTMLDivElement = L.DomUtil.create("div");
    const pinImage: HTMLImageElement = L.DomUtil.create("img");
    const resTitle: HTMLSpanElement = L.DomUtil.create("span");
    const resDescription: HTMLParagraphElement = L.DomUtil.create("p");

    resTitle.classList.add("search-title");
    resDescription.classList.add("search-description");
    resItem.classList.add("MtrMap--search-item");

    pinImage.src = pinIcon;

    resTitle.innerText = title;
    resDescription.innerText = description;

    resItem.appendChild(pinImage);
    resItem.appendChild(resTitle);
    resItem.appendChild(resDescription);

    return resItem;
  },
});

export function geocode(opts?: any) {
  return new L.Control.SearchBox(opts);
}
