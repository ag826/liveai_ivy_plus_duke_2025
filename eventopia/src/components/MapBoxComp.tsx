import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl/mapbox';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapBoxComp: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        setUserLocation({ latitude: 37.8, longitude: -122.4 }); // Fallback location (San Francisco)
      }
    );
  }, []);

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: userLocation?.longitude ?? -122.4,
        latitude: userLocation?.latitude ?? 37.8,
        zoom: 14
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      {/* Geolocation Control */}
      <GeolocateControl position="top-left" showUserLocation={true} trackUserLocation={true} />
      
      {/* Navigation Controls */}
      <NavigationControl position="top-right" />

      {/* User's Location Marker */}
      {userLocation && (
        <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} color="red" />
      )}
    </Map>
  );
};

export default MapBoxComp;
