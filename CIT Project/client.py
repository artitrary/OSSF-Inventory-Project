import requests

# URL of the Flask server
url = "http://127.0.0.1:5000/get_data"

# Send a GET request
response = requests.get(url)

if response.status_code == 200:
    data = response.json()  # Convert response to JSON
    print("Data from MaintenanceLog:")
    for row in data:
        print(row)
else:
    print(f"Error: {response.status_code}")
