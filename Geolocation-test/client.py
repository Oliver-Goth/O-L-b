from socket import *
import requests
import json

# Set up the client socket
dbUrl = "https://o-loebrest20231128112940.azurewebsites.net/api/GPSLocation"
serverName = "10.200.130.54"
serverPort = 12000
clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect((serverName, serverPort))

while True:
    # Receive data from the server
    modifiedSentence = clientSocket.recv(1024)

    # Check if the received data is empty (socket closed)
    if not modifiedSentence:
        break

    # Decode the received data to string using 'utf-8'
    decodedSentence = modifiedSentence.decode('utf-8')
    print('From server:', decodedSentence)

    # Gets the full geoData string
    full_text = decodedSentence
    
    # Split the text into lines
    lines = full_text.split('\n')

    # Iterate through each line and extract the numeric values
    latitude = None
    longitude = None

    for line in lines:
        if 'Latitude:' in line:
            latitude = float(line.split(':')[1].strip())
        elif 'Longitude:' in line:
            longitude = float(line.split(':')[1].strip())

    # Check if both latitude and longitude are found
    if latitude is not None and longitude is not None:
        data = {"Latitude": latitude, "Longitude": longitude}

        # Converts the data into json
        json_data = json.dumps(data, indent=2)
        requests.post(dbUrl, json=json.loads(json_data))
    else:
        print("Latitude or Longitude not found in the input text.")
        break

