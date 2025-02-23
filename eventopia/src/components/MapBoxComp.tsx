import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Map, { GeolocateControl, Marker, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl/mapbox';

import AIButtonUnselected from '../assets/ai_button_unselected.svg';
import AIButtonSelected from '../assets/ai_button_selected.svg';
import ControlButtonUnselected from '../assets/control_button_unselected.svg';
import ControlButtonSelected from '../assets/control_button_selected.svg';

import MusicPin from '../assets/pins/music.svg'
import TheatrePin from '../assets/pins/theatre.svg'
import MoviePin from '../assets/pins/movie.svg'
import ThemeParkPin from '../assets/pins/theme_park.svg'
import SportsPin from '../assets/pins/sports.svg'
import FoodDrinkPin from '../assets/pins/food&drink.svg'
import SocialPin from '../assets/pins/social.svg'
import TechPin from '../assets/pins/technology.svg'
import EducationPin from '../assets/pins/education.svg'
import ArtsPin from '../assets/pins/arts.svg'
import MountainPin from '../assets/pins/mountain.svg'
import WaterPin from '../assets/pins/water.svg'
import FamilyPin from '../assets/pins/family.svg'
import PartyPin from '../assets/pins/party.svg'
import DefaultPin from '../assets/pins/default.svg'


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapBoxComp: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any[]>([]);
  const [pinsToShow, setPinsToShow] =  useState<any[]>([]); // 


  // State for the map's center (used for the geographic marker)
  const [center, setCenter] = useState({
    latitude: 37.8,
    longitude: -122.4,
  });
  // Create a ref to access the Map instance
  const mapRef = useRef<any>(null);
  // Use a ref for our one-time click flag
  const hasSimulatedClick = useRef(false);

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
          // Simulate the click only once using our ref
          console.log(hasSimulatedClick)
          const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
            if (geoControlButton) {
                if (!hasSimulatedClick.current) {
                    hasSimulatedClick.current = true;
            
                    geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    try {
                        const response = fetch('localhost:5000/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          const fallback = { latitude: 37.8, longitude: -122.4 };
          setUserLocation(fallback);
          setCenter(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        // On initial query, if granted, track location and simulate click if not already done
        if (permissionStatus.state === 'granted') {
          setError(null);
          trackLocation();
          const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
            if (geoControlButton) {
                if (!hasSimulatedClick.current) {
                    hasSimulatedClick.current = true;
            
                    geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    try {
                        const response = fetch('localhost:5000/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }
            }
          }
        } else if (permissionStatus.state === 'prompt') {
          setError(null);
          trackLocation();
        } else if (permissionStatus.state === 'denied') {
          setError('Geolocation permission denied.');
        }
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setError(null);
            trackLocation();
            const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
            if (geoControlButton) {
                if (!hasSimulatedClick.current) {
                    hasSimulatedClick.current = true;
            
                    geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    try {
                        const response = fetch('localhost:5000/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }
                    
            }
          }
          } else if (permissionStatus.state === 'prompt') {
            setError(null);
            trackLocation();
          } else if (permissionStatus.state === 'denied') {
            setError('Geolocation permission denied.');
          }
        };
      });
    } else {
      trackLocation();
      const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
            if (geoControlButton) {
                if (!hasSimulatedClick.current) {
                    hasSimulatedClick.current = true;
            
                    geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    try {
                        const response = fetch('localhost:5000/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }
            }
          }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // This useEffect simulates a click after the control is rendered.
  useEffect(() => {
    setTimeout(() => {
      const geoControlButton = document.querySelector('.mapboxgl-ctrl-geolocate');
      if (geoControlButton && !hasSimulatedClick.current) {
        hasSimulatedClick.current = true;
        geoControlButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        try {
            const response = fetch('http://localhost:5000/get-curlocation-events')
            .then(response => response.json())
            .then(data => {
                console.log('Event data:', data);
                // Update your component state or props with the data
                setEventData(data)
            })
            .catch(error => console.error('Error fetching events:', error));;
      
            console.log("Events JSON Response:", response);
          } catch (error) {
            console.error("Error fetching events:", error);
          }
      }
    }, 1000);
  }, []);


  useEffect(() => {
    if (eventData.length > 0) {
      const newPins: { latitude: number; longitude: number; title: string; link: string }[] = eventData.map(
        (event) => ({
          latitude: event.latitude,
          longitude: event.longitude,
          img: event.thumbnail || event.image || MusicPin, 
          title: event.title || "Untitled Event",
          link: event.link || "#",
        })
      );
  
      setPinsToShow(newPins); // 
      console.log("New Pins from eventData:", newPins);
    }
  }, [eventData]);
  
  

  // Possible types: music, TBA...
  const typeToImgConverter = (type: string) => {
    switch (type) {
      case 'Concerts & Live Music':
        return MusicPin;
      case 'Theater & Performing Arts':
        return TheatrePin;
      case 'Movie Screenings':
        return MoviePin;
      case 'Theme Park Events':
        return ThemeParkPin;
      case 'Sports & Fitness':
        return SportsPin;
      case 'Food & Drink':
        return FoodDrinkPin;
      case 'Social & Networking':
        return SocialPin;
      case 'Technology & Innovation':
        return TechPin;
      case 'Education & Learning':
        return EducationPin;
      case 'Arts & Creativity':
        return ArtsPin;
      case 'Outdoor Hiking & Camping':
        return MountainPin;
      case 'Outdoor Water Sports Activities':
        return WaterPin;
      case 'Family & Kids':
        return FamilyPin;
      case 'Nightlife & Parties':
        return PartyPin;
      default:
        return DefaultPin;
    }
  }

  // The batch of pins of events/activities to show on the map
  const centerToShow = [
    {
      latitude: center.latitude,
      longitude: center.longitude,
      img: typeToImgConverter('music')
    },
    //  other pins
  ]

  const [aiButtonSelected, setAiButtonSelected] = useState(false);
  const [controlButtonSelected, setControlButtonSelected] = useState(true);
  const handleAIButtonClick = () => {
    setAiButtonSelected(!aiButtonSelected);
  }
  const handleControlButtonClick = () => {
    setControlButtonSelected(!controlButtonSelected);
  }

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
        {/* -------------- Mapbox Configs -------------- */}
        {/* Geolocation Control */}
        <GeolocateControl position="top-left" showUserLocation={true} trackUserLocation={true} />

        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* Fullscreen Controls */}
        <FullscreenControl position="top-right" />

        {/* Scale Controls */}
        <ScaleControl position="top-right" />

        {/* Marker that reflects the geographic center of the map */}
        {centerToShow.map((pin, index) => (
          <Marker key={index} latitude={pin.latitude} longitude={pin.longitude} anchor="bottom">
            <img
              src={pin.img}
              alt="Center Marker"
              style={{ width: '30px', height: '30px' }}
            />
          </Marker>
        ))}
        {pinsToShow.length > 0 ? (
  pinsToShow.map((pin, index) => {
    console.log("Rendering Marker:", pin);
    return (
      <Marker key={index} latitude={pin.latitude} longitude={pin.longitude} anchor="bottom">
        <div style={{ textAlign: "center" }}>
          <img
            src={pin.img}
            alt={pin.title}
            style={{ width: "30px", height: "30px", cursor: "pointer" }}
            onClick={() => window.open(pin.link, "_blank")}
          />
          <p style={{ fontSize: "12px", margin: "5px 0" }}>{pin.title}</p>
        </div>
      </Marker>
    );
  })
) : (null)}

      </Map>

      {/* Functionality Icons */}
      <IconGroup>
        <UserButton onClick={handleControlButtonClick}>
          <img src={controlButtonSelected ? ControlButtonSelected : ControlButtonUnselected} alt="control Button" style={{ width: '70px', height: '70px' }} />
        </UserButton>
        <UserButton onClick={handleAIButtonClick}>
          <img src={aiButtonSelected ? AIButtonSelected : AIButtonUnselected} alt="AI Button" style={{ width: '70px', height: '70px' }} />
        </UserButton>
      </IconGroup>
    </div>
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
  z-index: 5;
`

const UserButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default MapBoxComp;
