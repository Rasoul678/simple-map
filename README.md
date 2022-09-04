# [Mootanroo](https://mootanroo.com/) Map

### This is a customized map service based on [parsimap](https://www.parsimap.ir/) and [leaflet](https://leafletjs.com/) api.

- Run `yarn start` script to see a demo of the map on development.

- Run `yarn build` to create a production build in dist folder.

### To make the map work, we must add the proper tags to the head. Parsimap tiles and leaflet JS tags are included in these tags. You can find examples in `public/index.html` folder. Dont forget to add css files too.

### **`Quick Features`**:

- Easy implementaion
- Support rich plugins by options
- External input binding
- Written in typescript(fast development)

### **`Quick start`**:

- Create a production build
  - `yarn build`
- Copy `js` and `css` files to your project and then address them on the head tag (file names start with `mtrmap`).
- Now you can access `MtrMap` class on `window` object in browser.

## **`Options`**:

### **`-element`**: The div element that we want to render map into it.

### **`-presets`**: Here we can set initial values for our map

- **`center`**: Map initial center ( _{ lat: number, lng: number }_ )
- **`zoom`**: Initial zoom level ( _number_ )
- **`zoomControl`**: A boolean indicates that whether we should show zoom control or not( _boolean_ )
- **`stickyMode`**: If true, marker always points to center ( _boolean_)
- **`flyMode`**: If true, adds smooth animation between two points ( _boolean_ )

### **`-marker`**: Defines default marker for map on initialization

- **`default`**: marker lattitude and longitude ( _{ lat: number, lng: number }_ )
- **`draggable`**: If true, user can drag marker around ( _boolean_ )

### **`-events`**: For now, There are two events that we can pass to the map

- **`onGetAddress`**: Whenever a marker is set, this callback function is triggered
- **`onMapReady`**: Whenever a map is ready, this callback function is triggered

### **`-inputs`**: We can pass either `input element` or its `id` to the map to bind it with its corresponding value

- **`province`**: Ostan field
- **`county`**: Shahrestan field
- **`suburb`**: Bakhsh field
- **`city`**: Shahr field
- **`village`**: Rusta field
- **`address`**: Local address field

### **`-iconUrl`**: We can pass our own icon url to override default icon provided by openstreetmap

### **`-tokens`**: In order for the map to work correctly we should pass api token and map token that our map service provider (in this case parsimap) gives to us
- **`apiKey`**
- **`mapKey`**

### **`-plugins`**: For now, there are two plugins for map that we can activate them by including their name in an array ( `['geocode', 'footer']` )

- **`geocode`**: For searching addresses and set marker by clicking on the results (very handy and customizable)
- **`footer`**: For showing address related to pinned marker at the bottom of the map (not a necessity).