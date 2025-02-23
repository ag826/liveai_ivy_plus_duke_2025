import os
from flask import Flask, jsonify
from serpapi import GoogleSearch
from dotenv import load_dotenv
import geocoder  
from flask_cors import CORS
from geopy.geocoders import Nominatim
import time

app = Flask(__name__)
CORS(app)


def get_lat_long(address):
    params = {
        "engine": "google_maps",
        "type": "search",
        "q": address,
        "google_domain": "google.com",
        "api_key": os.getenv("SERPAPI_TOKEN") # https://docs.python.org/3/library/os.html#os.getenv
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    coordinates = results["place_results"]["gps_coordinates"]
    lat = coordinates['latitude']
    long = coordinates['longitude']

    return lat,long
    

@app.route('/get-curlocation-events', methods=['GET'])
def get_curlocation_events():
    # Load environment variables from the .env file
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), 'eventopia/.env'))
    
    # Fetch user's location automatically based on IP
    g = geocoder.ip('me')
    user_location = f"{g.city}, {g.state}" if g.city and g.state else "USA"  # Fallback to "USA" if location fails
    print(f"Detected location: {user_location}")

    # Get API key from environment
    api_key = os.getenv("SERPAPI_TOKEN")
    
    # Define search parameters with auto-detected location
    params = {
        "engine": "google_events",
        "q": f"Events in {user_location}",
        "hl": "en",
        "gl": "us",
        "api_key": api_key
    }
    
    # Perform search using SerpAPI
    search = GoogleSearch(params)
    results = search.get_dict()
    events_results = results.get("events_results", [])

    for event in events_results:
        address = ", ".join(event.get("address", []))  # Convert address list to string
        if address:
            lat,long = get_lat_long(address)
            if lat and long:
                event["latitude"], event["longitude"] = lat,long
            else:
                event["latitude"], event["longitude"] = None, None
        else:
            event["latitude"], event["longitude"] = None, None
        time.sleep(1)
    
    return jsonify(events_results)



if __name__ == '__main__':
    app.run(debug=True)
