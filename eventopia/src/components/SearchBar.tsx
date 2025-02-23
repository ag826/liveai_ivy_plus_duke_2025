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
  const [locationName, setLocationName] = useState("");
  const [locationMethod, setLocationMethod] = useState("current");
  const [query, setQuery] = useState(""); // 🔹 Fixed: `query` is now defined

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
    <div style={{ textAlign: "center" }}>
      <input
        type="text"
        placeholder="Enter query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />
    </div>
  );
};

export default SearchBar;
