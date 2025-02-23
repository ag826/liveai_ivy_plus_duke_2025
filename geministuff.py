import google.generativeai as genai
import os
from dotenv import load_dotenv
import geocoder
import json
import sqlite3
import shutil
import pandas as pd
from datetime import datetime, timedelta
import re

# Load environment variables
load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

# Initialize Gemini Model
gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itinerary based on a list of events that are happening around and your own knowledge of things to do.",
)

#######################################################################################################################

def generate_itenary(
    time,
    start_time,
    current_location,
    start_date,
    end_date,
    cost,
    use_feature,
    mode_of_transport,
    model=gemini_client,
):
    """Generates a travel itinerary using Gemini AI based on available events and user preferences."""

    # Fetch user's current location
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
                    "generated": false,
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
        return datetime(1601, 1, 1) + timedelta(microseconds=timestamp)

    df = pd.DataFrame(history_data, columns=["URL", "Title", "Visit Count", "Last Visit Time"])
    df["Last Visit Time"] = df["Last Visit Time"].apply(convert_chrome_timestamp)

    conn.close()

    # Save history to JSON
    df.to_json("json_output/chrome_browsing_history.json", orient="records", indent=4)

#######################################################################################################################

def user_features_browsing_history(model=genai.GenerativeModel("gemini-2.0-flash")):
    """Generates user preferences based on browsing history using Gemini AI."""
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

#######################################################################################################################

if __name__ == "__main__":
    test = generate_itenary(
        time="72",
        start_time="4 pm",
        current_location="current",
        start_date="march 15 2025",
        end_date="march 17 2025",
        cost="300",
        use_feature=False,
        mode_of_transport="private",
    )

    print(test)
