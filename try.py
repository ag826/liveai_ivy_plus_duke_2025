import sqlite3
import os
import pandas as pd

# Path to Chrome's history database (adjust according to your OS)
chrome_history_path = os.path.expanduser(
    r"C:\Users\asus\AppData\Local\Google\Chrome\User Data\Default\History"
)


def get_top_search_results(limit=10):
    # Connect to the SQLite database (the Chrome history file)
    conn = sqlite3.connect(chrome_history_path)
    cursor = conn.cursor()

    # Query to fetch the top search results
    query = """
    SELECT url, title, visit_count, last_visit_time
    FROM urls
    ORDER BY visit_count DESC
    LIMIT ?;
    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()

    # Convert results to a readable format
    results = []
    for row in rows:
        url = row[0]
        title = row[1]
        visit_count = row[2]
        last_visit_time = row[3]
        results.append(
            {
                "URL": url,
                "Title": title,
                "Visit Count": visit_count,
                "Last Visit Time": last_visit_time,
            }
        )

    # Close the database connection
    conn.close()

    # Optionally, convert results into a pandas DataFrame for better readability
    df = pd.DataFrame(results)
    return df


# Get top search results
top_results = get_top_search_results()

# Display the results
print(top_results)
