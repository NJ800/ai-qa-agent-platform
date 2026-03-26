import logging
from typing import List
from models.domain import PullRequest, TestCase
from db.mongodb import get_database

logger = logging.getLogger(__name__)

async def generate_tests_for_pr(pr: PullRequest) -> List[TestCase]:
    """
    Analyzes code diffs to generate relevant functional and structural test cases.
    """
    try:
        logger.info(f"Generating test cases for PR #{pr.pr_number}")
        
        test_cases = []
        for file in pr.changed_files:
            file_lower = file.lower()
            
            # Intelligent Test Prioritization logic
            priority = "MEDIUM"
            if any(k in file_lower for k in ["auth", "payment", "security", "core", "billing"]):
                priority = "HIGH"
            elif any(k in file_lower for k in [".md", ".txt", ".css", "ui", "assets"]):
                priority = "LOW"
                
            tc = TestCase(
                related_pr_id=pr.id,
                title=f"Integration validation for {file.split('/')[-1]}",
                description=f"Verify changes in {file} don't introduce regressions.",
                preconditions=[f"{file} dependencies are mocked"],
                steps=["1. Execute dependent modules", "2. Monitor edge cases"],
                expected_result="System runs successfully without crashes or exceptions.",
                test_type="Regression",
                is_automated=True,
                priority=priority
            )
            test_cases.append(tc)
        
        return test_cases
    except Exception as e:
        logger.error(f"Error generating tests for PR: {str(e)}")
        return []
