import google.generativeai as genai
import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel
import geocoder
import json

load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)


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

    json_file_path = "events_results.json"
    # Load the JSON file into a Python dictionary
    with open(json_file_path, "r", encoding="utf-8") as file:
        events = json.load(file)

    # Construct the content string
    query = (
        f"Based on all the events that are happening around my location which is {current_location}, create a comprehensive itinerary about things I can do in a defined time period. "
        f"You should ensure that the entire trip (including transport and event duration) should be less than or equal to {time} hours and the total budget of the trip should be less than or equal to {cost} dollars. "
        f"In addition to your own knowledge of events that are happening, include restaurant and public spaces if needed in your output. The events under consideration are: {json.dumps(events)}. "
        f"Ensure that you also design the entire itinerary using {mode_of_transport} transport and include that in your output. "
        f"The start and end location should be {current_location}. "
        "Your output must be in a geoJSON format, detailing the name of the place, location (coordinates), time since start, mode of transport to get there from the previous location, cost for this segment. "
        "Output only the geojson data and nothing else. Do not include any notes at the end. Include the total estimated cost and time of the entire journey in the output geojson."
    )

    # Pass the content as a single string to the model
    response = model.generate_content(query)

    # Assuming response is a dictionary and contains the generated text in 'text' key
    itenary = response.text
    return itenary


if __name__ == "__main__":
    test = generate_itenary(
        "3",
        "current",
        "100",
        "private",
    )

    print(f"OUTPUT:{test}")
