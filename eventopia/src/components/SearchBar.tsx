import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [hours, setHours] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [locationName,setLocationName]=useState("");
  const [locationMethod, setLocationMethod] = useState("current"); 

  useEffect(() => {
    if (locationMethod === "current") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
          setLocation("current location");
        },
        () => {
          setLocation("current location");
        }
      );
    }
  }, [locationMethod]);

  const handleSearch = async () => {
    const query = `I am free for ${hours || "rest of day"} hours with ${budget || "no budget"} budget on ${
      date || "today"
    }. Show me things to do in ${location || "current location"}.`;

    const requestData = {
      time: hours || "rest of day",
      start_time: "09:00 AM",
      current_location: locationMethod === "current" ? "current" : location,
      start_date: date || "today",
      end_date: date || "today",
      cost: budget || "no budget",
      use_feature: true,
      mode_of_transport: "public",
    };

    try {
      const response = await fetch("http://localhost:5000/get-itinerary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error("Failed to fetch itinerary");

      const jsonResponse = await response.json();
      console.log("Itinerary JSON:", jsonResponse);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMapClick = (e: any) => {
    setLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10vh", fontSize: "18px" }}>
      <h2>Search Events</h2>
      <div
        style={{
          display: "inline-block",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        I am free for{" "}
        <input
          type="text"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          style={{ width: "80px", border: "none", fontSize: "18px", textAlign: "center", outline: "none" }}
        />{" "}
        hours with{" "}
        <input
          type="text"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={{ width: "80px", border: "none", fontSize: "18px", textAlign: "center", outline: "none" }}
        />{" "}
        budget on{" "}
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "120px", border: "none", fontSize: "18px", textAlign: "center", outline: "none" }}
        />
        . Show me things to do in{" "}
        <select
          value={locationMethod}
          onChange={(e) => setLocationMethod(e.target.value)}
          style={{
            border: "none",
            fontSize: "18px",
            textAlign: "center",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="current">Current Location</option>
          <option value="map">Select on Map</option>
          <option value="search">Search Location</option>
        </select>{" "}
        {locationMethod === "search" && (
        <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => {
            setLocation(e.target.value);
            setLocationName(e.target.value); // Correct way to update state
            }}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                console.log("Enter pressed! Location set:", location);
                // Optionally trigger search or process the location
            }
            }}
            style={{ width: "200px", border: "none", fontSize: "18px", textAlign: "center", outline: "none" }}
        />
        )}
        {locationMethod === "map" && (
          <button  style={{ cursor: "pointer", marginLeft: "10px" }}>
            Select on Map
          </button>
        )}
      </div>
      <br />
      <button onClick={handleSearch} disabled={loading} style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
        {loading ? "Searching..." : "Search"}
      </button>

      
    </div>
  );
};


export default SearchBar;
