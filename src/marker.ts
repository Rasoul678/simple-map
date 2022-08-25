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
        e.target.bindPopup('hello');
        e.target.openPopup();
        console.log(e);
    },

    removeHandler: function (e: any) {
        console.log(e)
    }
  
  });
  
  window.L.customMarker = function (latLng: any, options: any) {
    return new window.L.CustomMarker(latLng, options);
  } 