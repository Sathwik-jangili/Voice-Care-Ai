import requests

BASE = 'http://127.0.0.1:8000'

def test_guide():
    print("Testing Guide Search...")
    try:
        resp = requests.post(f'{BASE}/guide/search', data={'topic': 'flu', 'patient_id': 'general'})
        print('Status:', resp.status_code)
        if resp.ok:
            print('Response:', resp.json())
        else:
            print('Error:', resp.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == '__main__':
    test_guide()
