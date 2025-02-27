import React, { useState, useEffect, useRef } from "react";

import Map, { GeolocateControl, Marker, Popup,  NavigationControl, FullscreenControl, ScaleControl } from "react-map-gl/mapbox";

import MusicPin from "../assets/pins/music.svg";
import TheatrePin from "../assets/pins/theatre.svg";
import MoviePin from "../assets/pins/movie.svg";
import ThemeParkPin from "../assets/pins/theme_park.svg";
import SportsPin from "../assets/pins/sports.svg";
import FoodDrinkPin from "../assets/pins/food&drink.svg";
import SocialPin from "../assets/pins/social.svg";
import TechPin from "../assets/pins/technology.svg";
import EducationPin from "../assets/pins/education.svg";
import ArtsPin from "../assets/pins/arts.svg";
import MountainPin from "../assets/pins/mountain.svg";
import WaterPin from "../assets/pins/water.svg";
import FamilyPin from "../assets/pins/family.svg";
import PartyPin from "../assets/pins/party.svg";
import DefaultPin from "../assets/pins/default.svg";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type EventData = {
  img: string;
  title: string;
  description: string;
  time: string;
  location: string;
  cost: string;
};

interface MapBoxCompProps {
  address: string;
  latitude: number;
  longitude: number;
  onClickMarker: (eventDetail: EventData) => void;
  eventDataChange: number;
}
  
const MapBoxComp: React.FC<MapBoxCompProps> = ({ latitude, longitude, onClickMarker, eventDataChange }) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any[]>([]);
  const [pinsToShow, setPinsToShow] = useState<any[]>([{ latitude: 36.001427, longitude: -78.938232 }]);

  const [center, setCenter] = useState({
    latitude: 37.8,
    longitude: -122.4,
  });

  useEffect(() => {
    if (!latitude || !longitude) {
      console.error("Latitude or Longitude missing. Skipping fetch.");
      return;
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true,
      });
    }
  
  }, [latitude, longitude]); // 🔹 Dependencies updated

  

  useEffect(() => {
    // Debug the current location and resolved URL
    console.log("Current location:", window.location.href);
    const fileUrl = new URL('../backend/json_output/events_results.json', window.location.href);
    console.log("Resolved file URL:", fileUrl.href);
  
    const loadEventData = async () => {
      try {
        const response = await fetch(fileUrl.href);
        if (!response.ok) {
          throw new Error('Failed to load events JSON');
        }
        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error('Error loading event data:', error);
      }
    };
    loadEventData();
  }, [eventDataChange]);
  
  const mapRef = useRef<any>(null);
  const hasSimulatedClick = useRef(false);

  useEffect(() => {
    let watchId: number;

    const trackLocation = () => {
      if (!("geolocation" in navigator)) {
        setError("Geolocation is not supported by this browser.");
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
          console.log("Updated Location:", coords.latitude, coords.longitude);

          const geoControlButton = document.querySelector(".mapboxgl-ctrl-geolocate");
          if (geoControlButton && !hasSimulatedClick.current) {
            hasSimulatedClick.current = true;
            geoControlButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            try {
              fetch("http://127.0.0.1:5000/get-events")
                .then((response) => response.json())
                .then((data) => {
                  console.log("Event data:", data);
                  setEventData(data);
                })
                .catch((error) => console.error("Error fetching events:", error));
            } catch (error) {
              console.error("Error fetching events:", error);
            }
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          const fallback = { latitude: 37.8, longitude: -122.4 };
          setUserLocation(fallback);
          setCenter(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
        if (permissionStatus.state === "granted") {
          setError(null);
          trackLocation();
        } else if (permissionStatus.state === "prompt") {
          setError(null);
          trackLocation();
        } else if (permissionStatus.state === "denied") {
          setError("Geolocation permission denied.");
        }

        permissionStatus.onchange = () => {
          if (permissionStatus.state === "granted") {
            setError(null);
            trackLocation();
          } else if (permissionStatus.state === "prompt") {
            setError(null);
            trackLocation();
          } else if (permissionStatus.state === "denied") {
            setError("Geolocation permission denied.");
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

  useEffect(() => {
    setTimeout(() => {
      const geoControlButton = document.querySelector(".mapboxgl-ctrl-geolocate");
      if (geoControlButton && !hasSimulatedClick.current) {
        hasSimulatedClick.current = true;
        geoControlButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        try {
          fetch("http://127.0.0.1:5000/get-events")
            .then((response) => response.json())
            .then((data) => {
              console.log("Event data:", data);
              setEventData(data);
            })
            .catch((error) => console.error("Error fetching events:", error));
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (eventData.length > 0) {
      const newPins = eventData.map((event) => ({
        latitude: event.latitude,
        longitude: event.longitude,
        img: event.thumbnail || event.image || MusicPin,
        title: event.title || "Untitled Event",
        link: event.link || "#",
        description: event.description || '',
        time: event.date.when || ''
      }));

      setPinsToShow(newPins);
      console.log("New Pins from eventData:", newPins);
    }
  }, [eventData]);

  const typeToImgConverter = (type: string) => {
    switch (type) {
      case "Concerts & Live Music":
        return MusicPin;
      case "Theater & Performing Arts":
        return TheatrePin;
      case "Movie Screenings":
        return MoviePin;
      case "Theme Park Events":
        return ThemeParkPin;
      case "Sports & Fitness":
        return SportsPin;
      case "Food & Drink":
        return FoodDrinkPin;
      case "Social & Networking":
        return SocialPin;
      case "Technology & Innovation":
        return TechPin;
      case "Education & Learning":
        return EducationPin;
      case "Arts & Creativity":
        return ArtsPin;
      case "Outdoor Hiking & Camping":
        return MountainPin;
      case "Outdoor Water Sports Activities":
        return WaterPin;
      case "Family & Kids":
        return FamilyPin;
      case "Nightlife & Parties":
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

  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: userLocation?.longitude ?? -122.4,
          latitude: userLocation?.latitude ?? 37.8,
          zoom: 14,
        }}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onMove={(evt) => setCenter(evt.viewState)}
      >
        {/* -------------- Mapbox Configs -------------- */}
        {/* Navigation Controls */}
        <NavigationControl position="bottom-right" />

        {/* Fullscreen Controls */}
        <FullscreenControl position="bottom-right" />

        {/* Scale Controls */}
        <ScaleControl position="bottom-left" />

        {/* Geolocation Control */}
        <GeolocateControl position="bottom-left" showUserLocation={true} trackUserLocation={true} />

        {/* Marker that reflects the geographic center of the map */}

        {/* const newPins = eventData.map((event) => ({
        latitude: event.latitude,
        longitude: event.longitude,
        img: event.thumbnail || event.image || MusicPin,
        title: event.title || "Untitled Event",
        link: event.link || "#",
      })); */}

      {/* type EventData = {
  img: string;
  title: string;
  description: string;
  time: string;
  location: string;
  cost: string;
}; */}

        {pinsToShow.length > 0 ? (
          pinsToShow.map((pin, index) => {
            /*console.log("Rendering Marker:", pin);*/
            return (
              <Marker key={index} latitude={pin.latitude} longitude={pin.longitude}>
                <div onClick={() => {
                    onClickMarker({img: pin.img, title: pin.title, description: pin.description, time: pin.time, location: latitude + longitude, cost: 'dummy cost'})
                    console.log("Pin Info that Passed in:", pin)
                    }}>
                  <img
                    src={DefaultPin}
                    alt="Marker"
                    style={{ width: '30px', height: '30px' }}
                  />
                </div>
              </Marker>
            );
          })
        ) : (null)}

        {/* Conditionally render the popup when a pin is selected */}
        
      </Map>
    </>
  );
};

export default MapBoxComp;
