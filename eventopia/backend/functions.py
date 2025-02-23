import os
from flask import Flask, jsonify, request
from serpapi import GoogleSearch
from dotenv import load_dotenv
import geocoder  
from flask_cors import CORS
import time
import json
import google.generativeai as genai
from datetime import datetime as dt
from datetime import timedelta
import datetime
<<<<<<< HEAD
import re


=======
import sqlite3
import shutil
import pandas as pd
import re
>>>>>>> 8067be8fe7f21254b0f5698b85d4a77a46e993a7
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)

def gll(address):
    params = {
        "engine": "google_maps",
        "type": "search",
        "q": address,
        "google_domain": "google.com",
        "api_key": os.getenv("SERPAPI_TOKEN") # https://docs.python.org/3/library/os.html#os.getenv
    }
    
    search = GoogleSearch(params)
    results = search.get_dict()
    print(results.keys())
    coordinates = results["place_results"]["gps_coordinates"]
    lat = coordinates['latitude']
    long = coordinates['longitude']

    return lat,long
    


def get_lat_long(address, retries=3):
    geolocator = Nominatim(user_agent="geocoding_app", timeout=10)
    for attempt in range(retries):
        try:
            location = geolocator.geocode(address)
            if location:
                return location.latitude, location.longitude
        except GeocoderTimedOut:
            print(
                f"Geocoder timed out for '{address}', retrying ({attempt+1}/{retries})..."
            )
        time.sleep(2)  # Delay between retries to avoid rate limits
    return None, None

@app.route('/get-last-coordinates', methods=['GET'])
def get_last_coordinates():
    try:
        with open("json_output/last_coordinates.json", "r") as f:
            data = json.load(f)
            return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "No cached coordinates found"}), 404
    

@app.route('/get-events', methods=['GET'])
def get_events():
    user_location = request.args.get("address", "current")  
    start_date = request.args.get("start_date", datetime.date.today().strftime("%B %d %Y"))
    end_date = request.args.get("end_date", datetime.date.today().strftime("%B %d %Y"))
    latitude=request.args.get("lat", None)
    longitude=request.args.get("long", None)

    if user_location == "current":
        g = geocoder.ip("me")
        user_location = (
            g.city + ", " + g.state if g.city and g.state else "USA"
        )  

    print(f"Detected location: {user_location}")

    all_results = {"events_results": []}

    for i in range(2):
        params = {
            "engine": "google_events",
            "q": f"Events in {user_location} between {start_date} to {end_date}",
            "hl": "en",
            "gl": "us",
            "api_key": os.environ["SEARCH_API_KEY"],
            "start": str(i * 10),
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        if "events_results" in results:
            all_results["events_results"].extend(results["events_results"])

    events_results = all_results.get("events_results", [])

    for event in events_results:
        original_address = ", ".join(event["address"])  
        street_address = event["address"][0]  
        city_state = event["address"][-1]  

        possible_addresses = [
            original_address,
            street_address + ", " + city_state,
            city_state,
        ]

        lat, lon = None, None
        for addr in possible_addresses:
            lat, lon = get_lat_long(addr)
            if lat and lon:
                break  

        event["latitude"] = lat
        event["longitude"] = lon

        print(f"Processed: {event['title']} -> ({lat}, {lon})")

        time.sleep(1)  

    # 🚀 Save raw event results before categorization
    output_file = "json_output/events_results.json"
    COORDS_FILE = "json_output/last_coordinates.json"

    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(events_results, json_file, indent=4, ensure_ascii=False)
    
    with open(COORDS_FILE, "w") as f:
        json.dump({"latitude": latitude, "longitude": longitude}, f, indent=4)

    print(f"Results saved to {output_file}")
<<<<<<< HEAD
=======
    #final_events=categorize_events()
    #return jsonify(final_events)
    return jsonify(events_results)
>>>>>>> 8067be8fe7f21254b0f5698b85d4a77a46e993a7

    # 🚀 Call categorize_events() and get the updated JSON with categories
    categorized_events = categorize_events()

    # 🚀 Ensure it's a valid dictionary before saving
    if isinstance(categorized_events, dict):  
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(categorized_events, json_file, indent=4, ensure_ascii=False)

    # 🚀 Return Flask Response
    return jsonify(categorized_events)

#######################################################################################################################

def categorize_events(model=genai.GenerativeModel("gemini-1.5-flash")):
    json_file_path = "json_output/events_results.json"

    # Load JSON file
    with open(json_file_path, "r", encoding="utf-8") as file:
        events = json.load(file)

    query = (
        "Categorize each event in this JSON file into one of the following categories: "
        "Concerts and live music, theater and performing arts, movie screenings, theme park events, "
        "sports and fitness, food and drink, social and networking, technology and innovation, "
        "education and learning, arts and creativity, outdoor activities, family and kids, nightlife and party. "
        f"The file is {json.dumps(events)} "
        "Output must be strictly in JSON format. No explanations, no Markdown formatting, no additional text."
        "Each event must include a new field called 'category' with the assigned category."
        "ENSURE valid JSON output. If an error occurs, return an empty list."
        '''
        [
        {
            "title": "Event Title",
            "date": {
            "start_date": "MMM DD",
            "when": "Day, MMM DD, Time"
            },
            "address": [
            "Street Address",
            "City, State"
            ],
            "link": "https://event-url.com",
            "event_location_map": {
            "image": "https://maps.google.com/some-image-url",
            "link": "https://www.google.com/maps/place/data=some-data",
            "serpapi_link": "https://serpapi.com/search.json?data=some-data"
            },
            "description": "Event description goes here...",
            "ticket_info": [
            {
                "source": "Ticket Provider Name",
                "link": "https://ticket-url.com",
                "link_type": "more info"
            }
            ],
            "venue": {
            "name": "Venue Name",
            "rating": 4.6,
            "reviews": 1566,
            "link": "https://google.com/search?q=venue-name"
            },
            "thumbnail": "https://image-url.com",
            "image": "https://image-url.com",
            "latitude": 35.996653,
            "longitude": -78.9018053,
            "category": "Event Category"
        }
        ]
        '''
        "Ensure the JSON structure follows this exact format with correct key-value pairs. "
        "DO NOT include any text before or after the JSON. Output must be valid JSON, without Markdown formatting (` ```json ` etc.)."
    )

    response = model.generate_content(query)
<<<<<<< HEAD
=======
    categorized_events = json.loads(response.text) 

>>>>>>> 8067be8fe7f21254b0f5698b85d4a77a46e993a7

    # Debugging: Print Raw Response
    print("Raw Response from Gemini:", response.text)

    # Check if response is empty
    if not response or not response.text.strip():
        print("ERROR: Empty response from Gemini API.")
        return {}

    cleaned_text = response.text.strip()

    # Remove Markdown formatting if present
    cleaned_text = re.sub(r"```(json)?\n", "", cleaned_text)  # Remove ```json
    cleaned_text = re.sub(r"\n```", "", cleaned_text)  # Remove closing ```
    cleaned_text = cleaned_text.replace("'", '"')
    cleaned_text = re.sub(r",\s*([\]})])", r"\1", cleaned_text)
    
    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
<<<<<<< HEAD
        json.dump(categorized_events, json_file, indent=4, ensure_ascii=False)


    # # Ensure JSON parsing
    # try:
    #     categorized_events = (cleaned_text)
    # except json.JSONDecodeError:
    #     print("ERROR: Gemini returned invalid JSON.")
    #     return {}

    # # 🚀 Return Python Dictionary, NOT `jsonify()`
    # return categorized_events

@app.route('/get-curlocation-events', methods=['GET'])
def get_curlocation_events():
    # Load environment variables from the .env file
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), 'eventopia/.env'))
    
    # Fetch user's location automatically based on IP
    g = geocoder.ip('me')
    user_location = f"{g.city}, {g.state}" if g.city and g.state else "USA"  # Fallback to "USA" if location fails
    print(f"Detected location: {user_location}")
=======
        json.dump(categorized_events, json_file, indent=4, ensure_ascii=False)  # Saves as structured JSON
    return categorized_events


>>>>>>> 8067be8fe7f21254b0f5698b85d4a77a46e993a7


@app.route('/get-coordinates', methods=['GET'])
def get_coordinates():
    address = request.args.get("address")  # Get address from query params
    if not address:
        return jsonify({"error": "Address parameter is required"}), 400

    latitude, longitude = get_lat_long(address)

    if latitude is None or longitude is None:
        return jsonify({"error": "Unable to fetch coordinates"}), 500

    return jsonify({"address": address, "latitude": latitude, "longitude": longitude})


@app.route('/get-itinerary', methods=['GET'])
def generate_itenary():

    time = request.args.get("time", "rest of day")
    start_time = request.args.get("start_time", "09:00 AM")
    current_location = request.args.get("current_location", "current")
    start_date = request.args.get("start_date", "today")
    end_date = request.args.get("end_date", "today")
    cost = request.args.get("cost", "unlimited")
    use_feature = request.args.get("use_feature", "false").lower() == "true"  # Convert to boolean
    mode_of_transport = request.args.get("mode_of_transport", "public")
    use_data = request.args.get("use_data", "false").lower() == "true"
    model=genai.GenerativeModel("gemini-1.5-flash")

    if current_location == "current":
        g = geocoder.ip("me")
        current_location = g.latlng if g.latlng else "Unknown Location"

    # Load event data
    events_file = "json_output/events_results.json"
    with open(events_file, "r", encoding="utf-8") as file:
        events = json.load(file)

    # Load user preferences if applicable
    if use_feature:
        preferences_file = "json_output/user_preference.json"
        try:
            with open(preferences_file, "r", encoding="utf-8") as file:
                features = json.load(file)
            feature_text = f"User preferences: {json.dumps(features)}"
        except FileNotFoundError:
            feature_text = "User preferences not available."
    else:
        feature_text = ""

    # Construct the query for Gemini
    query = f"""
    You are a structured travel planner. Create an itinerary based on the given events.

    Instructions:
    - Use only JSON format. Do **not** include explanations, Markdown (` ``` `), or additional text.
    - The output must be **valid GeoJSON**, following this structure:

    {{
        "type": "FeatureCollection",
        "features": [
            {{
                "type": "Feature",
                "geometry": {{
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                }},
                "properties": {{
                    "name": "Event Name",
                    "description": "Event Description",
                    "address": "Event Address",
                    "time_since_start": "30 minutes",
                    "transport": "Private transport",
                    "cost": 5
                }}
            }}
        ],
        "total_estimated_cost": 100,
        "total_estimated_time": 24
    }}

    In addition to the events we upload, include your knowledge of restaurant and public spaces if needed in your output. The events are: {json.dumps(events)}.
    "Generate most of the itenary from events which wasy uploaded in the file above."
    

    Additional Details:
    - Current location: {current_location}
    - Start Date: {start_date}
    - End Date: {end_date}
    - Total trip time: {time} hours
    - Budget: {cost} dollars
    - Mode of transport: {mode_of_transport}
    - {feature_text}
    
    "At the end of the output, include the following metadata:"
            "total_cost: The total estimated cost (rounded to US dollars) for the entire journey."
            "total_time: The total time of the entire journey in hours."

    Ensure the response is **strictly valid JSON**, without Markdown, explanations, or extra text.
    """

    response = model.generate_content(query)
    itenary = response.text  # Get raw Gemini response

    # Remove Markdown formatting if present
    itenary = re.sub(r"```(geojson|json)\n", "", itenary)
    itenary = re.sub(r"\n```", "", itenary)

    # Convert JSON string to Python dictionary
    try:
        parsed_itenary = json.loads(itenary)
    except json.JSONDecodeError:
        print("ERROR: Gemini returned invalid JSON. Saving raw response instead.")
        parsed_itenary = itenary  # Save as raw text if JSON parsing fails

    # Save cleaned JSON
    output_file = "json_output/final_itenary.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(parsed_itenary, json_file, indent=4, ensure_ascii=False)

    return parsed_itenary

#######################################################################################################################

def user_browser_history():
    """Fetches browsing history from Google Chrome and saves it as a JSON file."""
    if os.name == "nt":  # Windows
        history_db_path = os.path.expanduser(
            r"~\AppData\Local\Google\Chrome\User Data\Default\History"
        )
    elif os.name == "posix":  # Mac/Linux
        history_db_path = os.path.expanduser(
            "~/Library/Application Support/Google/Chrome/Default/History"
        )

    # Create a temporary copy of the history database
    temp_db_path = "./chrome_history_temp.db"
    shutil.copy2(history_db_path, temp_db_path)

    # Connect to the copied database
    conn = sqlite3.connect(temp_db_path)
    cursor = conn.cursor()

    # Query to fetch browsing history
    query = """
    SELECT url, title, visit_count, last_visit_time 
    FROM urls
    ORDER BY last_visit_time DESC
    LIMIT 100;
    """

    cursor.execute(query)
    history_data = cursor.fetchall()

    # Convert Chrome's timestamp format to human-readable datetime
    def convert_chrome_timestamp(timestamp):
        return dt(1601, 1, 1) + timedelta(microseconds=timestamp)

    df = pd.DataFrame(history_data, columns=["URL", "Title", "Visit Count", "Last Visit Time"])
    df["Last Visit Time"] = df["Last Visit Time"].apply(convert_chrome_timestamp)

    conn.close()

    # Save history to JSON
    df.to_json("json_output/chrome_browsing_history.json", orient="records", indent=4)

#######################################################################################################################
@app.route('/user_history', methods=['GET'])
def user_features_browsing_history():
    """Generates user preferences based on browsing history using Gemini AI."""
    model=genai.GenerativeModel("gemini-2.0-flash")
    user_browser_history()
    history_file = "json_output/chrome_browsing_history.json"

    # Load browsing history
    try:
        with open(history_file, "r", encoding="utf-8") as file:
            history = json.load(file)
    except FileNotFoundError:
        print("ERROR: Browsing history file not found.")
        return {}

    query = f"""
    Analyze this user's browsing history and identify themes of interest.
    Return the response strictly as a JSON object without explanations.

    Browsing History:
    {json.dumps(history, indent=4)}
    """

    response = model.generate_content(query)
    profile_features = response.text

    try:
        parsed_features = json.loads(profile_features)
    except json.JSONDecodeError:
        print("ERROR: Gemini returned invalid JSON. Saving raw response instead.")
        parsed_features = profile_features  # Save as raw text if JSON parsing fails

    output_file = "json_output/user_preference.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(parsed_features, json_file, indent=4, ensure_ascii=False)

    return parsed_features



if __name__ == '__main__':
    app.run(debug=True)
