import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useState } from "react";

import MapBoxComp from './components/MapBoxComp';
import SearchBar from './components/SearchBar';

function App() {
  const [loading, setLoading] = useState(false);

  const fetchEvents = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      console.log("Events JSON Response:", data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: "10px" }}>
      {/* SearchBar at the top with margin */}
      <div style={{
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "80px", // Adds space below search bar
        borderRadius: "8px",
        padding: "10px" // Adds spacing inside the search bar container
      }}>
        <SearchBar onSearch={fetchEvents} loading={loading} />
      </div>
  
      {/* MapBoxComp with margin */}
      <div style={{
        flexGrow: 1,
        overflow: "hidden",
        margin: "20px 20px 20px 20px",
        borderRadius: "8px",
      }}>
        <MapBoxComp />
      </div>
    </div>
  );
  
  
  
}

export default App
