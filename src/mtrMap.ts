require('./marker');
import { MapOptions, MapElement, LatLng } from "../types";
import { getAddressByLatLng } from './utils'

class MtrMap {
    private _element: MapElement;
    private _map: any;
    private _markers: LatLng[] = [];
    private _markerObj: any[] = [];
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
            console.log(e)
            this.addMarker(e.latlng);
        })

        //! Add the OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //! Show the scale bar on the lower left corner
        window.L.control.scale({imperial: true, metric: true}).addTo(map);
        map.addControl(window.L.Control.geocoder());

        //! Show markers on the map
        this._markers = this._options?.markers || [];
        this.renderMarkers();
    };

    private renderMarkers(){
        const markers = this._options.isSingleMarker ? [this.markers[0]] : this.markers;
        markers.forEach((marker) => {
            let m = window.L.customMarker({lon: marker.lng, lat: marker.lat}, {draggable: true});
            this._markerObj.push(m);
            if(marker.popUp){
                m.bindPopup(marker.popUp);
            };

            m.addTo(this.map);
        });
    };

    get element(){
        return this._element
    };

    get map(){
        return this._map
    };

    get markers(){
        return this._markers
    };

    addMarker(marker: LatLng){
        if(this._options.isSingleMarker){
            this._markerObj.forEach(marker => {
                this.map.removeLayer(marker);
            })
        };

        this._markers = [marker, ...this._markers];
        this.renderMarkers();
    };
}

export default MtrMap;


getAddressByLatLng({latlng: {lat: 36.68655642027285, lng: 53.543612601721804}, format: "json", language: "fa"})
.then((data: any) => console.log(data.address))
