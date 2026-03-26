import json
import logging
from typing import List, Dict
from openai import AsyncOpenAI
from core.config import settings
from models.domain import TestCase, PullRequest

logger = logging.getLogger(__name__)

api_key = settings.OPENAI_API_KEY if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here" else "dummy_key"
client = AsyncOpenAI(api_key=api_key)

async def generate_test_cases_from_story(story_id: str, title: str, description: str, criteria: List[str]) -> List[TestCase]:
    if api_key == "dummy_key":
        logger.warning("OpenAI API Key not configured. Returning mock test case.")
        return [
            TestCase(
                related_story_id=story_id,
                title="Valid authentication with correct credentials",
                description="User logs in normally.",
                preconditions=["User has a registered account"],
                steps=["Open the login page", "Enter valid credentials", "Click login"],
                expected_result="User is redirected to the dashboard",
                test_type="Positive",
                priority="HIGH"
            ),
            TestCase(
                related_story_id=story_id,
                title="Invalid credentials error handling",
                description="Ensures system blocks wrong password.",
                preconditions=["User is on login page"],
                steps=["Enter wrong password", "Click login"],
                expected_result="Error message is shown, access denied",
                test_type="Negative",
                priority="MEDIUM"
            )
        ]

    prompt = f"""
    You are an expert QA Engineer. Generate a list of comprehensive test cases (functional, edge cases, negative) for the following User Story:
    Title: {title}
    Description: {description}
    Acceptance Criteria: {', '.join(criteria)}
    
    Output JSON format:
    {{
        "test_cases": [
            {{
                "title": "Test case title",
                "description": "Brief description",
                "preconditions": ["...", "..."],
                "steps": ["Step 1", "Step 2"],
                "expected_result": "Expected outcome",
                "test_type": "Functional | Edge Case | Security | Performance",
                "is_automated": false,
                "priority": "HIGH | MEDIUM | LOW"
            }}
        ]
    }}
    Ensure response is valid JSON.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content or "{}")
        
        test_cases = []
        for tc_data in data.get("test_cases", []):
            tc_data["related_story_id"] = story_id
            test_cases.append(TestCase(**tc_data))
        return test_cases
    except Exception as e:
        logger.error(f"Error generating test cases from LLM: {str(e)}")
        return [
            TestCase(
                related_story_id=story_id,
                title="Valid authentication with correct credentials",
                description="User logs in normally.",
                preconditions=["User has a registered account"],
                steps=["Open the login page", "Enter valid credentials", "Click login"],
                expected_result="User is redirected to the dashboard",
                test_type="Positive",
                priority="HIGH"
            ),
            TestCase(
                related_story_id=story_id,
                title="Invalid credentials error handling",
                description="Ensures system blocks wrong password.",
                preconditions=["User is on login page"],
                steps=["Enter wrong password", "Click login"],
                expected_result="Error message is shown, access denied",
                test_type="Negative",
                priority="MEDIUM"
            )
        ]

async def analyze_pr_with_llm(pr: PullRequest) -> Dict:
    if api_key == "dummy_key":
        # Mock analysis
        return {
            "intent": "Unknown due to missing API key",
            "is_authentication_change": any("auth" in f.lower() for f in pr.changed_files),
            "is_payment_change": any("payment" in f.lower() for f in pr.changed_files),
            "critical_modules_impacted": [],
            "insights": ["AI API Key not configured. Using heuristics only."]
        }
        
    prompt = f"""
    Analyze the following Pull Request details and changed files to assess the business logic impact.
    PR Title: {pr.title}
    PR Description: {pr.description}
    Changed Files: {', '.join(pr.changed_files)}
    
    Return a JSON response:
    {{
        "intent": "Brief description of what this PR is attempting to accomplish",
        "is_authentication_change": true/false,
        "is_payment_change": true/false,
        "critical_modules_impacted": ["list", "of", "modules"],
        "insights": ["List 2-3 specific insights about potential bugs or risk factors"]
    }}
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content or "{}")
    except Exception as e:
        logger.error(f"Error analyzing PR context: {str(e)}")
        return {
            "intent": "Analysis failed",
            "is_authentication_change": False,
            "is_payment_change": False,
            "critical_modules_impacted": [],
            "insights": ["LLM Analysis failed."]
        }
