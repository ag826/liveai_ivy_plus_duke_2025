import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl, Marker, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl/mapbox';
import AIButton from '../assets/AI_Button.svg';
import ControlButton from '../assets/Control_Button.svg';
import styled from 'styled-components';


// const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VsaW5hemhhbiIsImEiOiJjbTdmbDh0dTEwMHB2MmxweWlqbXZveHNkIn0.SFEkajm_FXf7CXJaYpM7AQ";

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
      {/* -------------- Mapbox Configs -------------- */}
      {/* Geolocation Control */}
      <GeolocateControl position="top-left" showUserLocation={true} trackUserLocation={true} />

      {/* Navigation Controls */}
      <NavigationControl position="top-right" />

      {/* Fullscreen Controls */}
      <FullscreenControl position="top-right" />

      {/* Scale Controls */}
      <ScaleControl position="top-right" />

      {/* User's Location Marker */}
      {userLocation && (
        <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} color="red" />
      )}

      {/* -------------- App Functionalities -------------- */}
      <IconGroup>
        <UserButton>
          <img src={AIButton} alt="AI Button" style={{width: '70px', height: '70px'}}/>
        </UserButton>
        <UserButton>
          <img src={ControlButton} alt="control Button" style={{width: '70px', height: '70px'}}/>
        </UserButton>
      </IconGroup>

    </Map>
  );
};

const IconGroup = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  bottom: 50px;
  right: ${(window.innerWidth - 160) / 2}px;
`

const UserButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default MapBoxComp;
