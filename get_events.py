from serpapi import GoogleSearch
from dotenv import load_dotenv
import os
import json
import geocoder

load_dotenv()


def get_events(
    user_location,
    event_date,  # THIS HAS TO BE A STRING
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

    # Define search parameters with auto-detected location
    params = {
        "engine": "google_events",
        "q": f"Events in {user_location} on {event_date}",  # ONLY TOP 10 RESULTS GET POPULATED WITH OFFSET OPTION AVAILABLE
        "hl": "en",
        "gl": "us",
        "api_key": os.environ["SEARCH_API_KEY"],
    }

    # Perform search
    search = GoogleSearch(params)
    results = search.get_dict()

    # Extract event results
    events_results = results.get("events_results", [])

    # Save results to a JSON file
    output_file = "json_output/events_results.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(events_results, json_file, indent=4, ensure_ascii=False)

    print(f"Results saved to {output_file}")
    print(events_results)


if __name__ == "__main__":
    print(get_events("current", "March 15 2025"))
