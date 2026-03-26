import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    # 1. Register
    print("Testing Registration...")
    reg_data = {"username": "testuser", "email": "test@user.com", "password": "password123"}
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if r.status_code not in [200, 201, 400]: # 400 if already exists
        print(f"Registration failed: {r.status_code} - {r.text}")
        sys.exit(1)
        
    # 2. Login
    print("Testing Login...")
    login_data = {"username": "testuser", "password": "password123"}
    r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} - {r.text}")
        sys.exit(1)
    
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2.5 Auth /me
    print("Testing /auth/me...")
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if r.status_code != 200:
        print(f"/auth/me failed: {r.status_code} - {r.text}")
        sys.exit(1)

    # 3. Add User Story
    print("Testing Add User Story...")
    story_data = {
        "story_id": "US-999",
        "title": "Test Story",
        "description": "Integration Test Story",
        "acceptance_criteria": ["Criteria 1", "Criteria 2"]
    }
    r = requests.post(f"{BASE_URL}/ingest/stories", json=story_data, headers=headers)
    if r.status_code != 200:
        print(f"Add story failed: {r.status_code} - {r.text}")
        sys.exit(1)
        
    db_story_id = r.json().get("id") or "US-999"

    # 4. Trigger QA Analysis
    print("Testing QA Analysis...")
    r = requests.post(f"{BASE_URL}/qa/generate-tests/story/{db_story_id}", headers=headers)
    if r.status_code != 200:
        print(f"QA Analysis failed: {r.status_code} - {r.text}")
        sys.exit(1)
        
    # 5. Check Dashboard
    print("Testing Dashboard...")
    r = requests.get(f"{BASE_URL}/dashboard/metrics", headers=headers)
    if r.status_code != 200:
        print(f"Dashboard failed: {r.status_code} - {r.text}")
        sys.exit(1)
        
    print("All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
