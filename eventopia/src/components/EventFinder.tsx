import React, { useState } from "react";
import SearchBar from "./SearchBar";  // Your SearchBar component
import MapBoxComp from "./MapBoxComp"; // Your map component

const EventFinder: React.FC = () => {
  const [searchedLocation, setSearchedLocation] = useState("current location");

  return (
    <div>
      <div style={{
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "80px", // Adds space below search bar
        borderRadius: "8px",
        padding: "10px" // Adds spacing inside the search bar container
      }}>
        <SearchBar onLocationChange={setSearchedLocation} onSearch={fetchEvents} loading={loading} />
      </div>
  
      {/* MapBoxComp with margin */}
      <div style={{
        flexGrow: 1,
        overflow: "hidden",
        margin: "20px 20px 20px 20px",
        borderRadius: "8px",
      }}>
        <MapBoxComp location={searchedLocation}/>
      </div>
    </div>
  );
};

export default EventFinder;
