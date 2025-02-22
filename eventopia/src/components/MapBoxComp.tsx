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
                    /*try {
                        const response = fetch('localhost:5173/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }*/
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
                    /*try {
                        const response = fetch('localhost:5173/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }*/
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
                    /*try {
                        const response = fetch('localhost:5173/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }*/
                    
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
                    /*try {
                        const response = fetch('localhost:5173/get-curlocation-events')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Event data:', data);
                            // Update your component state or props with the data
                        })
                        .catch(error => console.error('Error fetching events:', error));;
                  
                        console.log("Events JSON Response:", response);
                      } catch (error) {
                        console.error("Error fetching events:", error);
                      }*/
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
        <Marker latitude={center.latitude} longitude={center.longitude} anchor="center">
        </Marker>
      </Map>
    </div>
  );
};

export default MapBoxComp;
