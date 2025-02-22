import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, GeolocateControl, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapBoxComp: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // State for the map's center (used for the geographic marker)
  const [center, setCenter] = useState({
    latitude: 37.8,
    longitude: -122.4,
  });
  // Create a ref to access the Map instance
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let watchId: number;

    // Function to get live location updates
    const trackLocation = () => {
      if (!('geolocation' in navigator)) {
        setError('Geolocation is not supported by this browser.');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
          setCenter(coords);
          console.log('Updated Location:', coords.latitude, coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          setError(error.message);
          const fallback = { latitude: 37.8, longitude: -122.4 };
          setUserLocation(fallback);
          setCenter(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        // Trigger location if permission is granted or in prompt state
        if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
          trackLocation();
        } else if (permissionStatus.state === 'denied') {
          setError('Geolocation permission denied.');
        }
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
            trackLocation();
          }
        };
      });
    } else {
      trackLocation();
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // When userLocation changes, fly the map to that location
  useEffect(() => {
    if (mapRef.current && userLocation) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        speed: 1.5,  // Adjust speed as needed
        curve: 1,
        easing: (t: number) => t,
      });
    }
  }, [userLocation]);

  // Automatically simulate a click on the GeolocateControl button after map loads
  useEffect(() => {
    // Give the control some time to render
    setTimeout(() => {
      const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
      if (geoControlButton) {
        geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }, 1000);
  }, []);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: userLocation?.longitude ?? -122.4,
          latitude: userLocation?.latitude ?? 37.8,
          zoom: 14,
        }}
        style={{ width: '95vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onMove={(evt) => setCenter(evt.viewState)}
      >
        <GeolocateControl
          position="top-left"
          showUserLocation={true}
          trackUserLocation={true}
        />
        <NavigationControl position="top-right" />
        
        {/* Marker that reflects the geographic center of the map */}
        <Marker latitude={center.latitude} longitude={center.longitude} anchor="center">
          <img
            src="/path-to-your-marker-icon.png"
            alt="Center Marker"
            style={{ width: '30px', height: '30px' }}
          />
        </Marker>
      </Map>
    </div>
  );
};

export default MapBoxComp;
