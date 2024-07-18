import ssl
import time
import warnings
import threading
import requests
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from queue import Queue
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socket import *

def handle_client(connectionSocket, addr, data_queue):
    print(addr[0])
    while True:
        if not data_queue.empty():
            geo_data = data_queue.get()
            connectionSocket.send(geo_data.encode())

        # Add a small delay to avoid busy waiting
        time.sleep(1)

        if connectionSocket.fileno() == -1:
            break  # Exit the loop if the socket is closed

    connectionSocket.close()




def start_local_server():

    # A little hack to ignore the ssl deprecationWarning
    warnings.filterwarnings("ignore", category=DeprecationWarning, module="ssl")

    # Specify the path to the certificate and private key
    cert_path = 'cert.pem'
    key_path = 'key.pem'

    # Create an SSL context
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(cert_path, key_path)

    # Create an HTTPS server with the SSL context
    httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
    httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

    print("Starting HTTPS server on https://localhost:8000/")

    # Run the server in a separate thread allowing the selenium script to be executed
    data_queue = Queue()
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.start()

    time.sleep(2)

    #Run the handle client in a seperate thread
    serverName = ""
    serverPort = 12000
    serverSocket = socket(AF_INET, SOCK_STREAM)
    serverSocket.bind((serverName, serverPort))
    serverSocket.listen(1)
    print('Server is ready to listen')

    selenium_thread = threading.Thread(target=run_selenium_script, args=(data_queue,))
    selenium_thread.start()

    while True:
            print('server running')
            connectionSocket, addr = serverSocket.accept()
            threading.Thread(target=handle_client, args=(connectionSocket, addr, data_queue)).start()
            time.sleep(5)



def run_selenium_script(data_queue):
    run = True
    chrome_options = Options()
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-notifications')
    chrome_options.add_argument('--ignore-certificate-errors')

    with webdriver.Chrome(options=chrome_options) as driver:
        driver.get('https://localhost:8000/')
        dbUrl = "https://o-loebrest20231128112940.azurewebsites.net/api/GPSLocation"

        while run == True:
                # Explicit wait for the "locationData" element's visibility
            try:
                geoElement = WebDriverWait(driver, 30).until(
                    EC.visibility_of_element_located((By.ID, "locationData"))
                )

                # a small delay before interacting with the element
                time.sleep(2)

                geoData = geoElement.text
                print(geoData)
                

                data_queue.put(geoData)
                
                # Gets the full geoData string
                full_text = geoData

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
                    

                time.sleep(5)
                    
                driver.refresh()

            except Exception as e:
                    print("Error:", str(e))


if __name__ == "__main__":
    start_local_server()

    
