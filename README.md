# AI Context-Aware QA Agent Platform

This project is an AI-powered QA system designed to improve software testing by automatically generating test cases, analyzing pull requests, and identifying potential risks before deployment.

The idea behind this project is to move away from static testing and instead build a system that understands context — what changed, why it changed, and what could break.

---

## Features

* Generate test cases from user stories
* Analyze pull requests based on changed files and code size
* Predict risk levels (low, medium, high) using hybrid logic
* Highlight security-sensitive changes (like `.env` or auth modules)
* Dashboard showing PR stats, risk distribution, and insights
* Background job system for handling analysis

---

## Tech Stack

* Backend: FastAPI (Python)
* Frontend: React (Vite + Tailwind CSS)
* Database: MongoDB
* AI: OpenAI API (with fallback logic)

---

## How to Run

### Backend

```bash
cd ai_qa_agent_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd ai_qa_agent_frontend
npm install
npm run dev
```

---

## How It Works

1. User adds a user story or pull request
2. The system processes it in the background
3. AI extracts key details (inputs, conditions, etc.)
4. Test cases are generated
5. Risk is calculated using file changes and heuristics
6. Results are shown on the dashboard

---

## Example PR Input

```json
{
  "pr_id": "PR-101",
  "title": "Auth update",
  "changed_files": ["auth.py", ".env"],
  "lines_added": 120,
  "lines_deleted": 30
}
```

---

## Notes

* The risk model is currently heuristic-based
* The system is designed to support future ML-based improvements
* Some AI responses fall back to safe defaults if API is unavailable

---

## Authors

* Nikhil Jain


