import time
import random
import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from azure.iot.device import IoTHubDeviceClient, Message

# Load env vars
load_dotenv()

# URL of our local API
API_URL = "http://localhost:8000/sensor-data"
PROPERTIES_URL = "http://localhost:8000/properties"

# Azure Config
CONNECTION_STRING = os.getenv("AZURE_IOT_CONNECTION_STRING")

# Mock Device Config
DEVICE_ID = "sensor_01"

def get_azure_client():
    if not CONNECTION_STRING:
        return None
    try:
        client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
        client.connect()
        print("Connected to Azure IoT Hub")
        return client
    except Exception as e:
        print(f"Failed to connect to Azure: {e}")
        return None

ASSIGNED_SENSORS = []

def init_sensors():
    global ASSIGNED_SENSORS
    ASSIGNED_SENSORS = []
    try:
        res = requests.get(PROPERTIES_URL)
        if res.status_code == 200:
            properties = [p['id'] for p in res.json()]
        else:
            properties = list(range(1, 27))
    except Exception as e:
        print(f"Could not fetch properties: {e}")
        properties = list(range(1, 27))
        
    sensor_types = ['environmental', 'plumbing', 'boiler', 'communal']
    
    # Assign 1 to 2 sensors to every property
    for prop_id in properties:
        num_sensors = random.randint(1, 2)
        chosen_types = random.sample(sensor_types, num_sensors)
        for i, s_type in enumerate(chosen_types):
            sensor_id = f"{s_type[:3].upper()}-{prop_id}-{random.randint(100,999)}"
            ASSIGNED_SENSORS.append({
                "property_id": prop_id,
                "sensor_id": sensor_id,
                "type": s_type
            })
    print(f"Initialized {len(ASSIGNED_SENSORS)} sensors across {len(properties)} properties.")

def generate_environmental(sensor_id):
    if random.random() < 0.2:
        temp = random.uniform(10, 17) # Cold
        humidity = random.uniform(70, 95) # Damp
        co2 = random.uniform(800, 1500)
    else:
        temp = random.uniform(18, 25) # Normal
        humidity = random.uniform(40, 60) # Normal
        co2 = random.uniform(400, 600)
    return {
        "sensor_id": sensor_id,
        "sensor_type": "environmental",
        "payload": {
            "temp": round(temp, 2),
            "humidity": round(humidity, 2),
            "co2": round(co2, 0)
        }
    }

def generate_plumbing(sensor_id):
    leak = random.random() < 0.05 # 5% chance of leak
    base_temp = 12
    if random.random() < 0.1:
        base_temp = random.uniform(-2, 5) # Freezing temps
    return {
        "sensor_id": sensor_id,
        "sensor_type": "plumbing",
        "payload": {
            "leak_detected": leak,
            "pipe_temp": round(base_temp, 1)
        }
    }

def generate_boiler(sensor_id):
    error = None
    if random.random() < 0.05:
        error = "E119" # low pressure error
        pressure = random.uniform(0.1, 0.4)
    else:
        pressure = random.uniform(1.2, 1.8)
    return {
        "sensor_id": sensor_id,
        "sensor_type": "boiler",
        "payload": {
            "pressure": round(pressure, 2),
            "flow_rate": round(random.uniform(10, 15), 1),
            "error_code": error
        }
    }

def generate_communal(sensor_id):
    status = "OK"
    if random.random() < 0.05:
        status = "Motor Fault"
    battery = max(10, 100 - random.randint(0, 90)) # Random drain
    return {
        "sensor_id": sensor_id,
        "sensor_type": "communal",
        "payload": {
            "status": status,
            "battery_health": battery,
            "vibration_hz": round(random.uniform(40, 60), 1)
        }
    }

def generate_telemetry():
    """
    Simulates a batch of different sensors.
    """
    batch = []
    if not ASSIGNED_SENSORS:
        init_sensors()
        
    for s in ASSIGNED_SENSORS:
        if s["type"] == "environmental":
            data = generate_environmental(s["sensor_id"])
        elif s["type"] == "plumbing":
            data = generate_plumbing(s["sensor_id"])
        elif s["type"] == "boiler":
            data = generate_boiler(s["sensor_id"])
        else:
            data = generate_communal(s["sensor_id"])
            
        data["property_id"] = s["property_id"]
        batch.append(data)
        
    return batch

def main():
    print(f"Starting IoT Simulator...")
    
    azure_client = get_azure_client()
    if not azure_client:
        print("Running in LOCAL ONLY mode (No Azure Connection String found).")
    
    print("Press Ctrl+C to stop.")
    
    while True:
        sensor_batch = generate_telemetry()
        
        for data in sensor_batch:
            # 1. Send to Local API (PropSense Backend)
            try:
                response = requests.post(API_URL, json=data)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent {data['sensor_type']}: {data['payload']} -> API Status: {response.status_code} | Risk: {response.json().get('risk_evaluation')}")
            except Exception as e:
                print(f"Error sending to API: {e}")
                
            # 2. Send to Azure IoT Hub (if connected)
            if azure_client:
                msg = Message(json.dumps(data))
                msg.content_encoding = "utf-8"
                msg.content_type = "application/json"
                try:
                    azure_client.send_message(msg)
                    print(f"   └──Sent {data['sensor_type']} to Azure IoT Hub")
                except Exception as e:
                    print(f"   └──Failed to send to Azure: {e}")
        
        # Sleep a bit longer between batches
        time.sleep(8)

if __name__ == "__main__":
    main()
