import { MapOptions, MapElement, LatLng } from "../types";
import { getAddressByLatLng, getLatLngByAddress } from './utils';

const {L} = window || {};

class MtrMap {
    private _element: MapElement;
    private _map: any;
    private _marker: LatLng | null;
    private _markerObj: any;
    private _options: MapOptions;
    private _address: string | null;
    private _circle: any;

    constructor(options: MapOptions){
        if(!L){
            throw new Error('Please add leaflet scripts to head tag first.');
        };

        this._element = options.element;
        this._options = options;
        this.init();
    };

    private init(){
        //! initialize Leaflet
        const {lng: lon, lat} = this._options.presets.latlng;
        const map = L.map(this.element, {
            center: [lat, lon],
            zoom: this._options.presets.zoom
        })
        this._map = map;

        map.on('click', (e: any) => {
            this.addMarker(e.latlng);
        });

        //! Add the OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //! Add Control
        // L.control.scale({imperial: true, metric: true}).addTo(map);
        // map.addControl(L.Control.geocoder());
        map.addControl(L.Control.addressBox({ position: 'bottomleft' }));

        map.addHandler('tilt', L.TiltHandler);

        map.tilt.enable();
        
        //! Show markers on the map
        this._marker = this._options?.marker || null;
        this.addMarker(this._options?.marker);

    };

    private renderMarker(flyDuration: number){
        let m = L.customMarker({lon: this.marker.lng, lat: this.marker.lat}, {draggable: true});
        let circle = L.circle([this.marker.lat, this.marker.lng], { radius: 10 });
        this._markerObj = m;
        this._circle = circle;

        m.on('dragend', () => {
            const latLng = m.getLatLng();
            this.addMarker(latLng);
        });

        if(this.marker.popUp){
            m.bindPopup(this.marker.popUp);
        };

        m.addTo(this.map);

        // let featureGroup = L.featureGroup([this._markerObj, this._circle]).addTo(this.map);

        // this.map.fitBounds(featureGroup.getBounds());

        // this.map.setView({lon: this.marker.lng, lat: this.marker.lat}, this.map.getZoom(), {
        //     "animate": true,
        //     "pan": {
        //       "duration": 1.5
        //     }
        //   });

        this.map.flyTo({lon: this.marker.lng, lat: this.marker.lat}, this.map.getZoom() , {
            animate: true,
            duration: flyDuration,
        });


        if(this._options?.marker){
            const addressBox = document.querySelector('.MtrMap--address.leaflet-control') as HTMLElement;
            addressBox.style.transform = 'translate3d(0,0,0)';
        };
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

    get address(){
        return this._address;
    }

    addMarker(marker: LatLng){
        let distance = L.GeometryUtil.distance(this.map, marker, this.marker);
        let flyDuration = Math.min(Math.max(0.5, +(distance / 2500).toFixed(1)), 3);

        // console.log(flyDuration);

        //! Remove last marker
        if(this._markerObj){
            this.map.removeLayer(this._markerObj);
        };

        if(this._circle){
            this.map.removeLayer(this._circle);
        }

        //! Add new marker
        this._marker = marker;
        this.renderMarker(flyDuration);

        //! Get new address based on new marker
        getAddressByLatLng({latlng: marker, language: "fa"})
        .then((data: any) => {
            const filterAddress = (item: any) => !['country_code', "country", "postcode", "ISO3166-2-lvl4"].includes(item[0]);
            const addressList = Object.entries(data.address).filter(filterAddress).map(item => item[1]).reverse();
            const addressString = addressList.join(' - ')
            this.setAddress(addressString);
        })
    };

    private setAddress(address: string){
        console.log(address)
        this._address = address;
        const addressBox = document.querySelector('.MtrMap--address.leaflet-control') as HTMLElement;
        addressBox.innerText = address;
    };
}

export default MtrMap;
export { getAddressByLatLng, getLatLngByAddress };

//! Custome marker
L.CustomMarker = L.Marker.extend({
    onAdd: function (map: any) {
      this.on('click', this._clickHandler);
      this.on('dragend', this._dragHandler);
      L.Marker.prototype.onAdd.call(this, map);
    },
  
    onRemove: function (map: any) {
      this.off('click', this._clickHandler);
      this.off('dragend', this._dragHandler);
      L.Marker.prototype.onRemove.call(this, map);
    },
  
    _clickHandler: function (e: any, map: any) {
        //! Nothing to do here
    },

    _dragHandler: function (e: any) {
        //! Nothing to do here
        // const latLng = this.getLatLng();
        // console.log(latLng);
    }
});
  
L.customMarker = function (latLng: any, options: any) {
    return new L.CustomMarker(latLng, options);
};

//! Custome control
L.Control.AddressBox = L.Control.extend({
    onAdd: function(map: any) {
        const addressDiv = L.DomUtil.create('div');
        addressDiv.classList.add('MtrMap--address');
        return addressDiv;
    },

    onRemove: function(map: any) {
        //! Nothing to do here
    }
});

L.Control.addressBox = function(opts?: any) {
    return new L.Control.AddressBox(opts);
};

L.TiltHandler = L.Handler.extend({
    addHooks: function(map: any) {
        let portrait = window.matchMedia("(orientation: portrait)");
        L.DomEvent.on(portrait, 'change', this._tilt, this);
    },

    removeHooks: function() {
        let portrait = window.matchMedia("(orientation: portrait)");
        L.DomEvent.off(portrait, 'change', this._tilt, this);
    },

    _tilt: function(e: any) {
        // Treat Gamma angle as horizontal pan (1 degree = 1 pixel) and Beta angle as vertical pan
        // this.panBy( L.point( e.gamma, e.beta ) );
        console.log(this);
    }
});

getLatLngByAddress('تهران میدان ونک').then(res => console.log(res))