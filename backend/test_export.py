import urllib.request
import json

# Log in as dosen to get token
data = json.dumps({"email": "dosen@pens.ac.id", "password": "password123"}).encode('utf-8')
req = urllib.request.Request("http://localhost:8000/api/auth/login/", data=data, headers={"Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req)
    token = json.loads(resp.read().decode('utf-8'))['data']['access']
    
    # Request export
    export_req = urllib.request.Request("http://localhost:8000/api/tasks/penugasan/export/", headers={"Authorization": f"Bearer {token}"})
    try:
        export_resp = urllib.request.urlopen(export_req)
        print("SUCCESS:", export_resp.status)
        print(export_resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("EXPORT ERROR:", e.code)
        print(e.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("LOGIN ERROR:", e.code)
    print(e.read().decode('utf-8'))
