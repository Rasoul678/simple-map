const { L } = window || {};

L.Control.AddressBox = L.Control.extend({
  onAdd: function (map: any) {
    const addressDiv = L.DomUtil.create("div");
    addressDiv.classList.add("MtrMap--address");
    addressDiv.setAttribute("id", "address-box");
    L.DomEvent.on(addressDiv, "click", this._onClick, this);
    L.DomEvent.on(addressDiv, "dblclick", this._onClick, this);
    return addressDiv;
  },

  onRemove: function (map: any) {
    const addressDiv = L.DomUtil.get("address-box");
    L.DomEvent.off(addressDiv, "click", this._onClick, this);
    L.DomEvent.off(addressDiv, "dblclick", this._onClick, this);
  },

  _onClick: function (e: any) {
    e.stopPropagation();
  },
});

export function footer(opts?: any) {
  return new L.Control.AddressBox(opts);
}
