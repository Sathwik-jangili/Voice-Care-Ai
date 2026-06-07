import requests, json

BASE = 'http://127.0.0.1:8000'

def test_guide():
    resp = requests.post(f'{BASE}/guide/search', data={'topic': 'diabetes', 'patient_id': 'general'})
    print('Guide status', resp.status_code)
    print('Guide response', resp.json())

def test_navigator():
    resp = requests.post(f'{BASE}/navigator/query', data={'query': 'what should I do next?', 'patient_id': 'general'})
    print('Navigator status', resp.status_code)
    print('Navigator response', resp.json())

def test_journal():
    # create entry
    resp = requests.post(f'{BASE}/journal/entry', data={'title': 'Test', 'content': 'Testing journal', 'patient_id': 'general'})
    print('Journal create status', resp.status_code)
    print('Journal create response', resp.json())
    if resp.ok:
        entry_id = resp.json().get('id')
        # fetch entries
        resp2 = requests.get(f'{BASE}/journal/entries/general')
        print('Journal list status', resp2.status_code)
        print('Journal list', resp2.json())
        # fetch single entry
        resp3 = requests.get(f'{BASE}/journal/entry/{entry_id}')
        print('Journal get status', resp3.status_code)
        print('Journal get', resp3.json())

if __name__ == '__main__':
    test_guide()
    test_navigator()
    test_journal()
