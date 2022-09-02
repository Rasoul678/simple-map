const { L } = window || {};

L.CustomMarker = L.Marker.extend({
  onAdd: function (map: any) {
    this.on("click", this._clickHandler);
    this.on("dragend", this._dragHandler.bind(this));
    L.Marker.prototype.onAdd.call(this, map);
  },

  onRemove: function (map: any) {
    this.off("click", this._clickHandler);
    this.off("dragend", this._dragHandler);
    L.Marker.prototype.onRemove.call(this, map);
  },

  _clickHandler: function (e: any, map: any) {
    //! Nothing to do here
    // console.log('clicked')
  },

  _dragHandler: function (e: any) {
    //! Nothing to do here
    // const latLng = this.getLatLng();
    // console.log(latLng);
  },
});

export function customMarker(latLng: any, options: any) {
  return new L.CustomMarker(latLng, options);
}
