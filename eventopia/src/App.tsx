import * as React from 'react';
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  return (
      <Map
        mapboxAccessToken="pk.eyJ1Ijoic2VsaW5hemhhbiIsImEiOiJjbTdmbDh0dTEwMHB2MmxweWlqbXZveHNkIn0.SFEkajm_FXf7CXJaYpM7AQ"
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        style={{ width: window.innerWidth, height: window.innerHeight, }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      />
  );
}

export default App
