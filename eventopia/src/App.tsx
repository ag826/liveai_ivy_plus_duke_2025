import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from "react";
import styled from 'styled-components';

import MapBoxComp from './components/MapBoxComp';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import SearchButtonUnselected from './assets/search_button_unselected.svg';
import SearchButtonSelected from './assets/search_button_selected.svg';
import ItineraryButtonUnselected from './assets/itinerary_button_unselected.svg';
import ItineraryButtonSelected from './assets/itinerary_button_selected.svg';


function App() {
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [latitude, setLatitude] = useState(37.7749); // Default to San Francisco (SFO)
  const [longitude, setLongitude] = useState(-122.4194);
  const [address, setAddress] = useState("San Francisco, CA"); // Default location

  const fetchEvents = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5173/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      console.log("Events JSON Response:", data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };


  const [searchButtonSelected, setSearchButtonSelected] = useState(true);
  const [itineraryButtonSelected, setItineraryButtonSelected] = useState(false);
  const handleSearchButtonClick = () => {
    setSearchButtonSelected(!searchButtonSelected);
  }
  const handleItineraryButtonClick = () => {
    setItineraryButtonSelected(!itineraryButtonSelected);
  }

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [cost, setCost] = useState(undefined);

  const [useRecommendation, setUseRecommendation] = useState(false)

  const dummyDataList = [
    {
      title: 'Noise Pop Music Festival',
      location: 'San Francisco Bay Area',
      cost: 'Unknown/Free/Tiered/$25'
    },
    {
      title: 'City Marathon 2015',
      location: 'Central Park, New York, NY',
      cost: 'Unknown/Free/Tiered/$25'
    },
    {
      title: 'City Marathon 2015',
      location: 'Central Park, New York, NY',
      cost: 'Unknown/Free/Tiered/$25'
    },
    {
      title: 'City Marathon 2015',
      location: 'Central Park, New York, NY',
      cost: 'Unknown/Free/Tiered/$25'
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", width: '100%vw' }}>
      {/* header bar */}
      <HeaderBar>
        <span style={{ fontSize: '30px' }}>EVENTOPIA</span>
      </HeaderBar>

      <MapBoxComp latitude={latitude} longitude={longitude} address={address} />

      {/* Functionality Icons */}
      <UserButton style={{ top: '90px', left: '20px' }} onClick={handleSearchButtonClick}>
        {searchButtonSelected ? <ButtonImageSelected src={SearchButtonSelected} alt="Search Button Selected" />
          : <ButtonImageUnselected src={SearchButtonUnselected} alt="Search Button Unselected" />
        }
      </UserButton>
      <UserButton style={{ top: '90px', right: '20px' }} onClick={handleItineraryButtonClick}>
        {itineraryButtonSelected ? <ButtonImageSelected src={ItineraryButtonSelected} alt="Search Button Selected" />
          : <ButtonImageUnselected src={ItineraryButtonUnselected} alt="Search Button Unselected" />
        }
      </UserButton>

      {/* Search Section */}
      {searchButtonSelected &&
        <SearchSection>
          <Frame>
            <Title>Location</Title>
            <input
              type="text"
              placeholder="Enter query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ margin: "10px 0px 0px 10px", padding: "10px", width: "300px", height: '25px', border: "1px solid #CCCCCC", borderRadius: '10px' }}
            />

            <Title>Time</Title>
            <StyledDatePickersContainer>
              <p>Start Time:</p>
              <StyledDatePicker
                selectsStart
                dateFormat="MMMM d, yyyy h:mm aa"
                timeFormat="HH:mm"
                selected={startTime}
                onChange={(date: Date | null) => date && setStartTime(date)}
                minDate={new Date()}
                todayButton={"Today"}
                showTimeSelect />
            </StyledDatePickersContainer>
            <StyledDatePickersContainer>
              <p>End Time:</p>
              <StyledDatePicker
                selectsEnd
                dateFormat="MMMM d, yyyy h:mm aa"
                timeFormat="HH:mm"
                selected={endTime}
                onChange={(date: Date | null) => date && setEndTime(date)}
                minDate={new Date()}
                todayButton={"Today"}
                showTimeSelect />
            </StyledDatePickersContainer>


            <Title>Cost</Title>
            <input
              type="number"
              value={cost}
              onChange={(event) => { setCost(event.target.value); }}
              placeholder="Enter a number"
              style={{ margin: "10px 0px 0px 10px", padding: "10px", width: "300px", height: '25px', border: "1px solid #CCCCCC", borderRadius: '10px' }}
              min="0"
            />

            <div style={{ margin: "30px 0px 0px 10px", display: 'flex', flexDirection: 'row' }}>
              <input
                type="checkbox"
                checked={useRecommendation}
                onChange={(event) => { setUseRecommendation(event.target.checked); }}
              />
              <label style={{ fontSize: '13px' }}>Select to tailor recommendations to search history</label>
            </div>

            <ButtonGroup>
            <LightModeButton onClick={async () => {
                console.log("Button clicked! Query:", query); // Debugging log

                if (!query.trim()) {
                  console.error("Please enter a valid location.");
                  alert("Please enter a valid location.");
                  return;
                }

                try {
                  const response = await fetch(`http://localhost:5000/get-coordinates?address=${encodeURIComponent(query)}`);
                  console.log("Fetching coordinates for:", query);

                  if (!response.ok) {
                    throw new Error("Failed to fetch coordinates");
                  }

                  const data = await response.json();
                  console.log("Fetched Coordinates:", data);
                  setLongitude(data.longitude)  
                  setLatitude(data.latitude)
                  setAddress(query)
                  // If you need to update the map with new coordinates, store them in state
                  
                } catch (error) {
                  console.error("Error fetching coordinates:", error);
                  alert("Error fetching coordinates. Check console for details.");
                }
              }}>
              Search For Events
            </LightModeButton>


              <DarkModeButton>
                <span>Plan My Trip!</span>
              </DarkModeButton>
            </ButtonGroup>
          </Frame>
        </SearchSection>
      }

      {/* Itinerary Section */}
      {itineraryButtonSelected && (
        <ItinerarySection>
          <Frame>
            <div>
              {dummyDataList.map((data, index) => (
                <Itinerary key={index}>
                  <ItineraryTitle>{data.title}</ItineraryTitle>
                  <ul style={{ fontSize: '15px' }}>
                    <li><span style={{ fontWeight: 'bold' }}>Location:</span>{data.location}</li>
                    <li><span style={{ fontWeight: 'bold' }}>Cost:</span>{data.cost}</li>
                  </ul>
                </Itinerary>
              ))}
            </div>
          </Frame>
        </ItinerarySection>
      )}
    </div>
  );
}

const HeaderBar = styled.div`
  width: 100vw;
  height: 70px;
  background: #AA0BFF;
  display: flex;
  flex-firection: column;
  align-items: center;
  justify-content: center;
`;

const UserButton = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 5;
`;

const ButtonImageUnselected = styled.img`
  width: 80px; 
  height: 80px;
`;

const ButtonImageSelected = styled.img`
  width: 80px; 
  height: 80px;
`;

const SearchSection = styled.div`
  position: absolute;
  background: #ffffff;
  color: black;
  top: 125px;
  left: 55px;
  width: 400px;
  height: 550px;
  border-radius: 15px;
  z-index: 3;
`;

const Frame = styled.div`
  position: relative;
  top: 10px;
  left: 10px;
  width: calc(100% - 44px);
  height: 506px;
  padding: 10px;
  border: 2px dotted grey;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  overflow-y: auto;
`;

const Title = styled.span`
  font-size: 20px;
  margin: 20px 0px 0px 10px;
  display: inline-block;
`

const StyledDatePickersContainer = styled.div`
  margin: 10px 0px 0px 10px;
  display: flex;
  flex-direction: row;
  gap: 10px;
`

const StyledDatePicker = styled(DatePicker)`
  width: 230px; /* Adjust width */
  height: 40px; /* Adjust height */
  font-size: 16px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  align-items: center;
  margin-top: 15px;
`

const LightModeButton = styled.div`
  border-radius: 20px;
  border: 2px solid #AA0BFF;
  padding: 10px;
  font-size: 16px;
  margin: 10px 0px 10px 0px;
  color: #AA0BFF;
`

const DarkModeButton = styled.div`
  border-radius: 20px;
  border: 2px solid #AA0BFF;
  padding: 10px;
  font-size: 16px;
  margin: 10px 0px 10px 0px;
  color: white;
  background-color: #AA0BFF;
`

const ItinerarySection = styled.div`
  position: absolute;
  background: #ffffff;
  color: black;
  top: 125px;
  right: 55px;
  width: 400px;
  height: 550px;
  border-radius: 15px;
  z-index: 3;
`;

const Itinerary = styled.div`
  margin: 20px 10px 0px 10px;
  width: 100%;
  border: 2px solid #CCCCCC;
  border-radius: 20px;
`

const ItineraryTitle = styled.div`
  font-size: 20px;
  margin: 20px 0px 0px 20px;
  display: inline-block;
  font-weight: bold;
`;

export default App
