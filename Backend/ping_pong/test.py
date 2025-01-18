import requests

url = "https://localhost:4433/user/create/"

for i in range(1000):
    response = requests.post(url, json={"username": "amajid", "email": "aaa@aaa.com", "password": "amajid1234"})
    print(f"request {i + 1} Status {response.status_code}")