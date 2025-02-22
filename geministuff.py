import google.generativeai as genai
import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel
import geocoder
import json
import sqlite3
import shutil
import pandas as pd
from datetime import datetime, timedelta


load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)

#######################################################################################################################


def generate_itenary(
    time,
    current_location,  # mention this as either 'current' or the actual custom location needed
    cost,
    mode_of_transport,  # mention this as either public/private
    model=genai.GenerativeModel("gemini-1.5-flash"),
):

    if current_location == "current":
        g = geocoder.ip("me")
        current_location = g.latlng

    json_file_path = "json_output/events_results.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        events = json.load(file)

    json_file_path = "json_output/user_preference.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        features = json.load(file)

    # Construct the content string
    query = (
        f"Based on all the events that are happening around my location which is {current_location}, create a comprehensive itinerary about things I can do in a defined time period. "
        f"You should ensure that the entire trip (including transport and event duration) should be exactly equal to {time} hours and the total budget of the trip should be exactly equal to {cost} dollars. "
        f"In addition to the events we upload, include your knowledge of restaurant and public spaces if needed in your output. The events are: {json.dumps(events)}. "
        "Generate most of the itenary from events which wasy uploaded in the file above."
        f"Try to choose events which the user will be interested in, his interests are listed here: {json.dumps(features)} "
        f"Ensure that you also design the entire itinerary using {mode_of_transport} transport and include that in your output. "
        f"The start and end location should be {current_location}. "
        "Your output must be in a geoJSON format, detailing the name of the place, location (coordinates), event_description, whether you generated or the event was collected from thr events uploaded above, time since start, mode of transport to get there from the previous location, cost for this segment. "
        "Output only the geojson data and nothing else. Do not include any notes at the end. Include the total estimated cost and time of the entire journey in the output geojson."
    )

    # Pass the content as a single string to the model
    response = model.generate_content(query)

    # Assuming response is a dictionary and contains the generated text in 'text' key
    itenary = response.text

    output_file = "json_output/final_itenary.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(itenary, json_file, indent=4, ensure_ascii=False)

    return itenary


#######################################################################################################################


# def features_images(model=genai.GenerativeModel("gemini-2.0-flash")):
#     images = [
#         "images/download (1).jpeg",
#         "images/download (2).jpeg",
#         "images/download.jpeg",
#     ]
#     query = (
#         f"Based on the images you see here, what do these images tell you about the person who posted them. Identify possible themes that this person would be most interested in."
#         "return only a file of themes that the person would be interested in and no explanation at all. Return it as a json format"
#         f"The images are {', '.join(images)}. Generate only the output"
#     )
#     response = model.generate_content(query)
#     profile_features = response.text

#     output_file = "json_output/user_preference.json"
#     with open(output_file, "w", encoding="utf-8") as json_file:
#         json.dump(profile_features, json_file, indent=4, ensure_ascii=False)

#     return profile_features

#######################################################################################################################


def user_features_browsing_history(model=genai.GenerativeModel("gemini-2.0-flash")):

    json_file_path = "json_output/chrome_browsing_history.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        history = json.load(file)

    query = (
        f"Based on this user's browsing history, you see here, what do these images tell you about the person who posted them. Identify possible themes that this person would be most interested in."
        "return only a file of themes that the person would be interested in and no explanation at all. Return it as a json format"
        f"The user's browsing history is {history}. Generate only the output"
    )
    response = model.generate_content(query)
    profile_features = response.text

    output_file = "json_output/user_preference.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(profile_features, json_file, indent=4, ensure_ascii=False)

    return profile_features


#######################################################################################################################


def user_browser_history():
    # Detect OS and set the correct Chrome history path
    if os.name == "nt":  # Windows
        history_db_path = os.path.expanduser(
            r"~\AppData\Local\Google\Chrome\User Data\Default\History"
        )
    elif os.name == "posix":  # Mac/Linux
        history_db_path = os.path.expanduser(
            "~/Library/Application Support/Google/Chrome/Default/History"
        )  # Adjust for Linux if needed

    # Create a temporary copy of the history database to avoid lock issues
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
    LIMIT 100;  -- Adjust the limit as needed
    """

    cursor.execute(query)
    history_data = cursor.fetchall()

    # Convert Chrome's timestamp format to human-readable datetime
    def convert_chrome_timestamp(timestamp):
        """Convert Chrome's timestamp format to human-readable datetime."""
        return datetime(1601, 1, 1) + timedelta(microseconds=timestamp)

    # Store history in a Pandas DataFrame
    df = pd.DataFrame(
        history_data, columns=["URL", "Title", "Visit Count", "Last Visit Time"]
    )
    df["Last Visit Time"] = df["Last Visit Time"].apply(convert_chrome_timestamp)

    # Close connection
    conn.close()

    # Display results
    from IPython.display import display

    display(df)

    # Save history to JSON (optional)
    df.to_json("chrome_browsing_history.json", orient="records", indent=4)


#######################################################################################################################

if __name__ == "__main__":
    test = generate_itenary(
        "5",
        "current",
        "200",
        "private",
    )

    # print(user_features_browsing_history())
    print(test)
