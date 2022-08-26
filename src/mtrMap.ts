import { MapOptions, MapElement, LatLng } from "../types";
import { getAddressByLatLng, getLatLngByAddress } from './utils'

class MtrMap {
    private _element: MapElement;
    private _map: any;
    private _marker: LatLng;
    private _markerObj: any;
    private _options: MapOptions;

    constructor(options: MapOptions){
        if(!window.L){
            throw new Error('Please add leaflet scripts to head tag first.');
        };

        this._element = options.element;
        this._options = options;
        this.init();
    };

    private init(){
        //! initialize Leaflet
        const {lng: lon, lat} = this._options.presets.latlng;
        const map = window.L.map(this.element).setView({lon, lat}, this._options.presets.zoom);
        this._map = map;

        map.on('click', (e: any) => {
            this.addMarker(e.latlng);
        });

        //! Add the OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //! Show the scale bar on the lower left corner
        window.L.control.scale({imperial: true, metric: true}).addTo(map);
        map.addControl(window.L.Control.geocoder());

        //! Show markers on the map
        this._marker = this._options?.marker;
        this.renderMarker();
    };

    private renderMarker(){
        let m = window.L.customMarker({lon: this.marker.lng, lat: this.marker.lat}, {draggable: true});
        this._markerObj = m;
        if(this.marker.popUp){
            m.bindPopup(this.marker.popUp);
        };

        m.addTo(this.map);
    };

    get element(){
        return this._element;
    };

    get map(){
        return this._map;
    };

    get marker(){
        return this._marker;
    };

    addMarker(marker: LatLng){
        //! Remove last marker
        this.map.removeLayer(this._markerObj);

        //! Add new marker
        this._marker = marker;
        this.renderMarker();

        //! Get new address based on new marker
        getAddressByLatLng({latlng: marker, language: "fa"})
        .then((data: any) => console.log(data.address))
    };
}

export default MtrMap;

window.L.CustomMarker = window.L.Marker.extend({

    onAdd: function (map: any) {
      this.on('click', this.clickHandler);
      window.L.Marker.prototype.onAdd.call(this, map);
    },
  
    onRemove: function (map: any) {
      this.off('click', this.removeHandler);
      window.L.Marker.prototype.onRemove.call(this, map);
    },
  
    clickHandler: function (e: any) {
        console.log(e, 'add');
    },

    removeHandler: function (e: any) {
        console.log(e, 'remove');
    }
  
});
  
window.L.customMarker = function (latLng: any, options: any) {
    return new window.L.CustomMarker(latLng, options);
};

getLatLngByAddress('تهران میدان ونک').then(res => console.log(res))