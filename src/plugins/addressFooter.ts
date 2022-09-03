/**
 * With this plugin, an address box would appear at the bottom
 */
const { L } = window || {};

L.Control.AddressBox = L.Control.extend({
  onAdd: function (map: any) {
    //* Prepare address box
    const addressBox = L.DomUtil.create("div");
    addressBox.classList.add("MtrMap--address");
    addressBox.setAttribute("id", "address-box");
    L.DomEvent.on(addressBox, "click", this._onClick, this);
    L.DomEvent.on(addressBox, "dblclick", this._onClick, this);
    L.DomEvent.on(addressBox, "mousedown", this._disableDrag, this);
    L.DomEvent.on(addressBox, "mouseup", this._enableDrag, this);
    return addressBox;
  },

  onRemove: function (map: any) {
    const addressBox = L.DomUtil.get("address-box");

    L.DomEvent.off(addressBox, "click", this._onClick, this);
    L.DomEvent.off(addressBox, "dblclick", this._onClick, this);
    L.DomEvent.off(addressBox, "mousedown", this._disableDrag, this);
    L.DomEvent.off(addressBox, "mouseup", this._enableDrag, this);
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
});

export function footer(opts?: any) {
  return new L.Control.AddressBox(opts);
}
