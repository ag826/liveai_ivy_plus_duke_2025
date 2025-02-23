import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect } from "react";
import styled from 'styled-components';

import MapBoxComp from './components/MapBoxComp';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import SearchButtonUnselected from './assets/search_button_unselected.svg';
import SearchButtonSelected from './assets/search_button_selected.svg';
import ItineraryButtonUnselected from './assets/itinerary_button_unselected.svg';
import ItineraryButtonSelected from './assets/itinerary_button_selected.svg';
import CancelButton from './assets/cancel-button.svg'

import EventDetail from './components/EventDetail';
import Itinerary from './components/Itinerary';

type EventData = {
  img: string;
  title: string;
  description: string;
  time: string;
  location: string;
  cost: string;
};

function App() {
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");
  const [eventData, setEventData] = useState<any[]>([]);

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
  const [eventDataChange, setEventDataChange] = useState(0);

  const [cost, setCost] = useState(undefined);
  const [useUserData, setUseUserData] = useState<boolean>(false); // Default to `false`
  const [itinerary, setItinerary] = useState<null>(null);

  const handleUserDataToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setUseUserData(isChecked);

    if (isChecked) {
      try {
        console.log("Generating recommendations...");
        const response = await fetch("http://127.0.0.1:5000/user_history", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error("Failed to generate recommendations.");
        }

        console.log("Recommendations JSON file generated.");
      } catch (error) {
        console.error("Error generating recommendations:", error);
      }
    } else {
      console.log("Recommendation feature disabled.");
    }
  };

  const [useRecommendation, setUseRecommendation] = useState(false)

  const dummyEventDetailDataList =
  {
    img: '/example_event_picture.png',
    title: 'Noise Pop Music Festival',
    time: 'Feb 20 2015 - Mar 2 2015',
    location: 'San Francisco Bay Area',
    cost: 'Unknown/Free/Tiered/$25',
    description: "Scheduled from February 20 to March 2, 2025, this 11-day festival features over 160 bands across 25 venues. Headliners include St. Vincent, Benjamin Gibbard, Soccer Mommy, and Earl Sweatshirt. The festival also offers industry summits and workshops for emerging artists..."
  }

  const [eventDetailSelected, setEventDetailSelected] = useState<{
    img: string,
    title: string,
    description: string,
    time: string,
    location: string,
    cost: string
  } | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)

  const dummyDataList = [
    {
      title: 'Noise Pop Music Festival',
      location: 'San Francisco Bay Area',
      cost: 'Unknown/Free/Tiered/$25'
    },
    {
      title: 'City Marathon 2025',
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

  // img={eventDetailSelected?.img} title={eventDetailSelected!.title} description={eventDetailSelected!.description} time={eventDetailSelected!.time} location={eventDetailSelected!.location} cost={eventDetailSelected!.cost}

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", width: '100%vw' }}>
      {/* header bar */}
      <HeaderBar>
        <span style={{ fontSize: '30px' }}>EVENTOPIA</span>
      </HeaderBar>

      <MapBoxComp latitude={latitude} longitude={longitude} address={address} onClickMarker={(eventDetail: EventData) => { setEventDetailSelected(eventDetail); setShowEventDetail(true) }} eventDataChange={eventDataChange} />

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
              style={{ margin: "10px 0px 0px 10px", padding: "10px", width: "300px", height: '25px', border: "1px solid #CCCCCC", borderRadius: '10px', fontSize: '16px' }}
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
              style={{ margin: "10px 0px 0px 10px", padding: "10px", width: "300px", height: '25px', border: "1px solid #CCCCCC", borderRadius: '10px', fontSize: '16px' }}
              min="0"
            />

            <div style={{ margin: "30px 0px 0px 10px", display: 'flex', flexDirection: 'row' }}>
              <input
                type="checkbox"
                checked={useUserData}
                onChange={(event) => setUseUserData(event.target.checked)} // ✅ Handles updates

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
                  console.log(query, "hi")
                  const response = await fetch(`http://127.0.0.1:5000/get-coordinates?address=${encodeURIComponent(query)}`);
                  console.log("Fetching coordinates for:", query);

                  if (!response.ok) {
                    throw new Error("Failed to fetch coordinates");
                  }

                  const data = await response.json();
                  console.log("Fetched Coordinates:", data);
                  setLongitude(data.longitude)
                  setLatitude(data.latitude)
                  const fetchResponse = await fetch(`http://127.0.0.1:5000/get-events?address=${query}`);
                  if (!fetchResponse.ok) {
                    throw new Error("Failed to fetch events");
                  }
                  // If you need to update the map with new coordinates, store them in state
                  const eventData2 = await fetchResponse.json();
                  setEventDataChange(eventDataChange + 1)
                } catch (error) {
                  console.error("Error fetching coordinates:", error);
                  alert("Error fetching coordinates. Check console for details.");
                }
              }}>
                Search For Events
              </LightModeButton>


              <DarkModeButton onClick={async () => {

                try {
                  const coordResponse = await fetch("http://127.0.0.1:5000/get-last-coordinates");
                  const lastCoords = await coordResponse.json();
                  console.log(query, "hi2")
                  const addressParam = query.trim() ? query : "current";
                  const response = await fetch(`http://127.0.0.1:5000/get-coordinates?address=${encodeURIComponent(addressParam)}`);
                  console.log(1)
                  console.log("Fetching coordinates for:", query);

                  if (!response.ok) {
                    throw new Error("Failed to fetch coordinates");
                  }
                  const new_data = await response.json();
                  let useCachedEvents = false;
                  console.log(2)
                  // Step 2: Compare cached coordinates with current ones
                  if (lastCoords.latitude && lastCoords.longitude) {
                    console.log("Cached Coordinates:", lastCoords.latitude, lastCoords.longitude);

                    if (lastCoords.latitude === new_data.latitude && lastCoords.longitude === new_data.longitude) {
                      console.log("Coordinates match. Using cached event results.");
                      useCachedEvents = true;
                    } else {
                      console.log("Coordinates changed. Fetching new events.");
                    }
                  } else {
                    console.log("No cached coordinates found.");
                  }

                  // Step 3: Fetch events based on the check
                  let eventData;
                  if (useCachedEvents) {
                    // Fetch cached event results
                    const cachedResponse = await fetch("http://127.0.0.1:5000/get-saved-events");
                    eventData = await cachedResponse.json();
                    console.log("Loaded Cached Events:", eventData);
                  } else {
                    // Fetch new events
                    setLongitude(new_data.longitude)
                    setLatitude(new_data.latitude)
                    console.log("Coordinates:", new_data.latitude, new_data.longitude);

                    const fetchResponse = await fetch(`http://127.0.0.1:5000/get-events?address=${query}`);
                    if (!fetchResponse.ok) {
                      throw new Error("Failed to fetch events");
                    }
                    const eventData2 = await fetchResponse.json();
                    setEventDataChange(eventDataChange + 1)
                    console.log("Fetched New Events:", eventData2);
                    const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
                    const hours = Math.floor(durationInMinutes / 60);
                    const minutes = durationInMinutes % 60;
                    const formattedTime = `${hours}h ${minutes}m`;
                    if (useUserData) {
                      console.log("Generating recommendations...");

                      const response = await fetch("http://127.0.0.1:5000/user_history", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                      });

                      if (!response.ok) {
                        throw new Error("Failed to generate recommendations.");
                      }

                      console.log("Recommendations JSON file generated.");
                    } else {
                      console.log("User history not selected. Skipping recommendation generation.");
                    }
                    const fetchItinerary = await fetch(
                      `http://127.0.0.1:5000/get-itinerary?time=${encodeURIComponent(formattedTime)}&start_time=${encodeURIComponent(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))}&current_location=${encodeURIComponent(query)}&start_date=${encodeURIComponent(startTime.toLocaleDateString("en-US"))}&end_date=${encodeURIComponent(endTime.toLocaleDateString("en-US"))}&use_data=${encodeURIComponent(useUserData)}&cost=${encodeURIComponent(cost)}`,
                      {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                      }
                    );

                    if (!fetchItinerary.ok) {
                      throw new Error("Failed to fetch events");
                    }
                    const eventData = await fetchItinerary.json();
                    console.log("Fetched Itinerary:", eventData);
                    setItinerary(eventData);

                  }

                } catch (error) {
                  console.error("Error fetching events:", error);
                } finally {
                  setLoading(false);
                }
              }}>
                Plan My Trip!
              </DarkModeButton>

            </ButtonGroup>
          </Frame>
        </SearchSection>
      }
      {loading && <div>Loading...</div>}

      {/* Itinerary Section */}
      {itineraryButtonSelected && (
        <ItinerarySection>
          <Frame style={{ overflowY: 'auto' }}>
            <div>
              {itinerary?.features && itinerary.features.map((data, index) => {
                console.log('Itinerary Data:', data)
                return <Itinerary key={index} index={index} title={data.properties.name} location={data.properties.address} cost={data.properties.cost} />
              }
              )}
            </div>
          </Frame>
        </ItinerarySection>
      )}

      {/* EventDetail Section */}
      {showEventDetail && (
        <EventDetail img={eventDetailSelected?.img} title={eventDetailSelected!.title} description={eventDetailSelected!.description} time={eventDetailSelected!.time} location={eventDetailSelected!.location} cost={eventDetailSelected!.cost} onClose={() => setShowEventDetail(false)} />
      )}
    </div>
  );
}

const SingleItinerary = styled.div`
  margin: 20px 10px 0px 10px;
  width: 100%;
  border: 2px solid #CCCCCC;
  border-radius: 20px;
  position: relative;
`

const ItineraryTitle = styled.div`
  font-size: 20px;
  margin: 20px 0px 0px 20px;
  display: inline-block;
  font-weight: bold;
`;

const Numbering = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #AA0BFF;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: absolute;
  left: -10px;
  top: -10px;
  font-weight: bold;
`;


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
  border-radius: 50%;
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
  height: calc(100% - 44px);
  padding: 10px;
  border: 2px dotted grey;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
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
  cursor: pointer;
`

const DarkModeButton = styled.div`
  border-radius: 20px;
  border: 2px solid #AA0BFF;
  padding: 10px;
  font-size: 16px;
  margin: 10px 0px 10px 0px;
  color: white;
  background-color: #AA0BFF;
  width: fit-content;
  cursor: pointer;
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




export default App
