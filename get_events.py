from serpapi import GoogleSearch
from dotenv import load_dotenv
import os
import json
import geocoder
import google.generativeai as genai
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)

#######################################################################################################################


def get_events(
    user_location,
    start_date,
    end_date,  # THIS HAS TO BE A STRING
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

    # Save results to a JSON file
    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(events_results, json_file, indent=4, ensure_ascii=False)

    print(f"Results saved to {output_file}")
    print(events_results)
    # Call categorized events
    categorize_events()


#######################################################################################################################


def categorize_events(model=genai.GenerativeModel("gemini-1.5-flash")):
    json_file_path = "json_output/events_results.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        events = json.load(file)

    query = (
        "Read all the events in this JSON file and categorize each event as one of the following categories: Concerts and live music, theater and performing arts, movie screenings, theme park events, sports and fitness, food and drink, social and networking, technology and innovation, education and learningm, arts and creativity, outdoor autoddr hiking and camping, outdoor water sports activities, family and kids, nightlife and party "
        f"The file is {json.dumps(events)}"
        "Your output must be in the same json dictionary format with the additional information. Create a new column called 'category' for this."
        "Return the response strictly as a JSON object with no Markdown formatting, explanations, or extra text. "
        "Ensure it  is valid JSON without wrapping it in triple backticks."
    )

    response = model.generate_content(query)
    categorized_events = json.loads(response.text)

    print(categorized_events)

    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(categorized_events, json_file, indent=4, ensure_ascii=False)

    fix_lat_long()


#######################################################################################################################


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


#######################################################################################################################

def fix_lat_long():
    # Load JSON file
    file_path = "json_output/events_results.json"
    with open(file_path, "r", encoding="utf-8") as f:
        events_data = json.load(f)

    # Initialize Geopy geocoder
    geolocator = Nominatim(user_agent="geocoding_app", timeout=10)

    # Process each event and get coordinates
    for event in events_data.get("events", []):  # Ensure "events" exists in JSON
        if "latitude" in event and event["latitude"] is not None:
            continue  # Skip events that already have coordinates

        # Ensure address is a list
        if not isinstance(event.get("address"), list):
            print(f"WARNING: Address format incorrect for event '{event.get('title', 'Unknown')}'. Skipping...")
            continue  # Skip processing if address is not a list

        # Extract address components safely
        full_address = ", ".join(event["address"])  # Full address
        street_address = event["address"][0] if len(event["address"]) > 0 else ""  # Street name
        city_state = event["address"][-1] if len(event["address"]) > 1 else ""  # City & state

        possible_addresses = [
            full_address,  # Full address
            f"{street_address}, {city_state}".strip(", "),  # Street + City/State
            city_state  # City and state only
        ]

        lat, lon = None, None
        for addr in possible_addresses:
            if addr:
                lat, lon = get_lat_long(addr)
                if lat and lon:
                    break  # Stop if valid lat/lon found

        event["latitude"] = lat
        event["longitude"] = lon

        print(f"Processed: {event['title']} -> ({lat}, {lon})")

        time.sleep(2)  # Prevent API rate limits

    # Save updated JSON with coordinates
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(events_data, f, indent=4, ensure_ascii=False)

    print(f"Updated file saved to: {file_path}")



#######################################################################################################################


if __name__ == "__main__":
    # /print(get_events("current", "March 15 2025"))
    # get_events("current", "March 15 2025", "March 15 2025")
    # categorize_events()
    fix_lat_long()
