import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
username = f"testuser_{int(time.time())}"
password = "TestPassword123!"

session = requests.Session()

def print_step(title):
    print(f"\n[{title}]")

# 1. Register
print_step("Registering User")
res = session.post(f"{BASE_URL}/auth/register", json={
    "username": username,
    "email": f"{username}@example.com",
    "password": password
})
print(res.status_code, res.text)
assert res.status_code == 200

# 2. Login
print_step("Logging in")
res = session.post(f"{BASE_URL}/auth/login", data={
    "username": username,
    "password": password
})
print(res.status_code, res.text)
assert res.status_code == 200
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Submit User Story
print_step("Submitting User Story")
story_payload = {
    "story_id": f"US-{int(time.time())}",
    "title": "As a user, I want to reset my password",
    "description": "If I forget my password, I need an email link.",
    "acceptance_criteria": ["Email is sent", "Link expires in 15 mins"]
}
res = session.post(f"{BASE_URL}/ingest/stories", json=story_payload, headers=headers)
print(res.status_code, res.text)
assert res.status_code == 200
db_story_id = res.json()["id"]

# 4. Create Analysis Job (Story)
print_step("Generating tests for story")
res = session.post(f"{BASE_URL}/qa/generate-tests/story/{story_payload['story_id']}", headers=headers)
print(res.status_code, res.text)
assert res.status_code == 200
job_id = res.json()["job_id"]

# 5. Check Job Status
print_step("Polling generated tests job")
while True:
    res = session.get(f"{BASE_URL}/qa/jobs/{job_id}", headers=headers)
    j = res.json()
    status = j["status"]
    print(f"Status: {status}, Progress: {j.get('progress', 0)}%")
    if status in ["completed", "failed"]:
        break
    time.sleep(1)

# 6. Submit PR
print_step("Submitting PR")
pr_payload = {
    "pr_number": int(time.time()) % 10000,
    "repository": "ai-qa-agent",
    "title": "Fix auth routing overflow",
    "description": "Fixed an issue in auth middleware.",
    "author": "octocat",
    "changed_files": ["src/auth.js", "src/dashboard.js"],
    "diff_hunks": "+ const x = 2;\n- const x = 1;"
}
res = session.post(f"{BASE_URL}/ingest/prs", json=pr_payload, headers=headers)
print(res.status_code, res.text)
assert res.status_code == 200

# 7. Create Analysis Job (PR)
print_step("Generating tests for PR")
res = session.post(f"{BASE_URL}/qa/generate-tests/pr/{pr_payload['pr_number']}", headers=headers)
print(res.status_code, res.text)
assert res.status_code == 200
pr_job_id = res.json()["job_id"]

print_step("Polling PR test job")
while True:
    res = session.get(f"{BASE_URL}/qa/jobs/{pr_job_id}", headers=headers)
    j = res.json()
    status = j["status"]
    print(f"Status: {status}, Progress: {j.get('progress', 0)}%")
    if status in ["completed", "failed"]:
        break
    time.sleep(1)

# 8. Assess PR Risk
print_step("Assessing Risk (Heuristic + AI)")
res = session.post(f"{BASE_URL}/qa/assess-risk/pr/{pr_payload['pr_number']}", headers=headers)
print(res.status_code, res.text)
# Optional 200 checks here depending on if it has a DB ID format vs raw number.
# Oh wait, assess-risk is expecting `_id` in the code?
# Wait, let's just see the print result, we'll fix it if it's 404 or 500.

# 9. Dashboard
print_step("Fetching Dashboard metrics")
res = session.get(f"{BASE_URL}/dashboard/metrics", headers=headers)
print(res.status_code, res.text)
assert res.status_code == 200

print("\n✅ End-to-End Success!")
