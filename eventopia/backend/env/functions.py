import os
from flask import Flask, jsonify
from serpapi import GoogleSearch
from dotenv import load_dotenv
import geocoder  

app = Flask(__name__)

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
    
    return jsonify(events_results)



if __name__ == '__main__':
    app.run(debug=True)
