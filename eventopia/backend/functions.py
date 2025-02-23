import os
from flask import Flask, jsonify
from serpapi import GoogleSearch
from dotenv import load_dotenv
import geocoder  
from flask_cors import CORS
import time
import json
import google.generativeai as genai
import datetime

app = Flask(__name__)
CORS(app)


load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)

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
    
@app.route('/get-events', methods=['GET'])
def get_events(
    user_location="current",
    start_date=datetime.date.today().strftime("%B %d %Y"),
    end_date=datetime.date.today().strftime("%B %d %Y"),  # THIS HAS TO BE A STRING
):  # mention this as either 'current' or the actual custom location needed
    # Fetch user's location automatically based on IP
    if user_location == "current":
        g = geocoder.ip("me")
        current_location = g.latlng
        g = geocoder.ip("me")
        user_location = (
            g.city + ", " + g.state if g.city and g.state else "USA"
        )  # Fallback to "USA" if location fails

    print(f"Detected location: {user_location}")

    all_results = {"events_results": []}

    # Pagination loop
    for i in range(5):
        print(i)

        # Define search parameters
        params = {
            "engine": "google_events",
            "q": f"Events in {user_location} between {start_date} to {end_date}",
            "hl": "en",
            "gl": "us",
            "api_key": os.environ["SEARCH_API_KEY"],
            "start": str(i * 10),  # Correct offset formatting
        }

        # Perform search
        search = GoogleSearch(params)
        results = search.get_dict()

        # Merge "events_results" lists instead of using +=
        if "events_results" in results:
            all_results["events_results"].extend(
                results["events_results"]
            )  # Append results properly

    # Extract event results
    events_results = all_results.get("events_results", [])
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
        

    # Save results to a JSON file
    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(events_results, json_file, indent=4, ensure_ascii=False)

    print(f"Results saved to {output_file}")
    #final_events=categorize_events()
    return events_results


#######################################################################################################################


def categorize_events(model=genai.GenerativeModel("gemini-1.5-flash")):
    json_file_path = "json_output/events_results.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        events = json.load(file)

    query = (
        "Read all the events in this JSON file and categorize each event as one of the following categories: Concerts and live music, theater and performing arts, movie screenings, theme park events, sports and fitness, food and drink, social and networking, technology and innovation, education and learningm, arts and creativity, outdoor autoddr hiking and camping, outdoor water sports activities, family and kids, nightlife and party "
        f"The file is {json.dumps(events)}"
        "Your output must be in the same json format with the additional information. Create a new column called 'category' for this."
    )

    response = model.generate_content(query)
    categorized_events = response.text

    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(categorized_events, json_file, indent=4, ensure_ascii=False)
    return jsonify(categorized_events)


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
