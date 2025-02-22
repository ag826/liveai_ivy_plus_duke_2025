import google.generativeai as genai
import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel
import tempfile

load_dotenv()
api_key = os.environ["API_KEY"]
genai.configure(api_key=api_key)

gemini_client = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a local travel planner who will create an itenary based on a list of events that are happening around and your own knowledge of things to do",
)


# Profiler of the interviewer
def generate_itenary(
    time,
    current_location,
    cost,
    events,
    mode_of_transport,  # mention this as either public/private
    model=genai.GenerativeModel("gemini-1.5-flash"),
):
    response = model.generate_content(
        [
            f"Based on all the events that are happing around my location which is {current_location}, create a comprehensive itenary about things I can do in a defined time period."
            f"You should ensure that the entire trip (including transport and event duration) should be less than or equal to {time} hours and the total budget of the trip should be less than or equal to {cost} dollars"
            f"In addition to your own knowledge of events that are happening, include restaurant and public spaces if needed in your output. The events under consideration are: {events}. Ensure that you also designing the entire itenary using {mode_of_transport} transport and include that in your output.  "
            f"The start and end location should be {current_location}"
            "Your output must be in a geoJSON format, detailing the name of the place, location (coordinates), time since start, mode of transport to get there from the previous location, cost for this segment",
        ]
    )
    itenary = response.text
    return itenary


if __name__ == "__main__":

    questions = generate_itenary(
        "3",
        "durham, NC",
        "100",
        "Sarah P Duke NGardens, Nasher Museum, Durham Central Park",
        "private",
    )

    print(f"FEEDBACK:{questions}")
