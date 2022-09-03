/**
 * This plugin allows us to customize leaflet marker icons in any way we like
 */
const { L } = window || {};

L.LeafIcon = L.Icon.extend({
  options: {
    iconAnchor: [15, 42],
    // iconSize: [38, 95],
    // shadowSize: [50, 64],
    // shadowAnchor: [4, 62],
    // popupAnchor: [-3, -76],
  },
});

export function customIcon(opts?: any) {
  return new L.LeafIcon(opts);
}
