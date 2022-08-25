import { MapOptions, MapElement, LatLng } from "../types";

class MtrMap {
    private _element: MapElement;
    private _map: any;
    private _markers: LatLng[] = [];

    constructor(options: MapOptions){
        if(!window.L){
            throw new Error('Please add leaflet scripts to head tag first.');
        };

        this._element = options.element;
        this.init(options);

    };

    private init(options: MapOptions){
        //! initialize Leaflet
        const {lng: lon, lat} = options.presets.latlng;
        const map = window.L.map(this.element).setView({lon, lat}, options.presets.zoom);
        this._map = map;

        //! Add the OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //! Show the scale bar on the lower left corner
        window.L.control.scale({imperial: true, metric: true}).addTo(map);

        //! Show markers on the map
        this._markers = options?.markers || [];
        this.renderMarkers();
    }

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
        this._markers = [...this._markers, marker];
        this.renderMarkers();
    };

    private renderMarkers(){
        this.markers.forEach(marker => {
            let m = window.L.marker({lon: marker.lng, lat: marker.lat}, {draggable: true});

            if(marker.popUp){
                m.bindPopup(marker.popUp);
            };

            m.addTo(this.map);
        });
    }
}

export default MtrMap;