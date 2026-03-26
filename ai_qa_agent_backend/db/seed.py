import logging
from db.mongodb import get_database
from models.domain import PullRequest, DefectData, RiskReport, UserStory, TestCase

logger = logging.getLogger(__name__)

async def seed_database_if_empty():
    db = get_database()
    
    # Check if Risk Reports exist (since the chart relies entirely on this)
    risk_count = await db.risk_reports.count_documents({})
    if risk_count > 0:
        logger.info("Database already populated with Risk Reports. Skipping seed.")
        return
        
    logger.info("Initializing database with sample AI QA Data...")
    
    # 1. Sample Defects for Self-learning
    sample_defects = [
        DefectData(defect_id="BUG-001", description="Auth token bypass", component="Authentication", severity="Critical", resolution="Fixed JWT validation").model_dump(by_alias=True),
        DefectData(defect_id="BUG-002", description="Session overflow", component="Authentication", severity="High", resolution="Increased memory bounds").model_dump(by_alias=True),
        DefectData(defect_id="BUG-003", description="Payment gateway timeout", component="Payments", severity="High", resolution="Added retry logic").model_dump(by_alias=True)
    ]
    await db.defect_history.insert_many(sample_defects)
    
    # 2. Sample User Stories
    sample_stories = [
        UserStory(story_id="US-100", title="MFA Implementation", description="Add Multi-factor auth to login", acceptance_criteria=["SMS must be sent", "Fail after 3 tries"]).model_dump(by_alias=True)
    ]
    await db.user_stories.insert_many(sample_stories)
    
    # 3. Sample PRs
    sample_prs = [
        PullRequest(pr_number=101, repository="core-api", title="Update auth logic", author="dev_sarah", changed_files=["src/auth/jwt.py", "src/auth/login.py", ".env"], diff_hunks="...", lines_added=150, lines_deleted=20).model_dump(by_alias=True),
        PullRequest(pr_number=102, repository="frontend-app", title="Fix button padding", author="ui_tom", changed_files=["src/components/Button.jsx"], diff_hunks="...", lines_added=5, lines_deleted=5).model_dump(by_alias=True)
    ]
    await db.pull_requests.insert_many(sample_prs)
    
    # 4. Sample Risk Reports for Dashboard
    # To make Dashboard look robust
    sample_risks = [
        RiskReport(
            related_pr_id=sample_prs[0]["_id"],
            risk_score=85.0,
            risk_level="Critical",
            impacted_components=["Authentication", "Configuration"],
            predicted_issues=["JWT secret exposure", "Token replay attacks"],
            mitigation_suggestions=["Require secondary review on .env modifications"],
            security_risk=True,
            performance_risk=False,
            insights=["Sensitive configuration file changed: .env", "Authentication logic modified in: src/auth/login.py", "Historical learning: Authentication has a high failure rate (2 previous defects). Risk increased."]
        ).model_dump(by_alias=True),
        RiskReport(
            related_pr_id=sample_prs[1]["_id"],
            risk_score=10.0,
            risk_level="Low",
            impacted_components=["UI/UX"],
            predicted_issues=[],
            mitigation_suggestions=[],
            security_risk=False,
            performance_risk=False,
            insights=["Minor visual padding updates. Minimal regression footprint."]
        ).model_dump(by_alias=True)
    ]
    await db.risk_reports.insert_many(sample_risks)
    
    # 5. Sample Test Cases
    sample_tests = [
        TestCase(related_pr_id=sample_prs[0]["_id"], title="Test invalid JWT format", description="Ensure malformed tokens return 401", steps=["Send request with invalid JWT", "Verify 401"], expected_result="401 Unauthorized", test_type="Security", is_automated=True, priority="HIGH").model_dump(by_alias=True),
        TestCase(related_pr_id=sample_prs[0]["_id"], title="Test JWT expiry", description="Ensure expired tokens return 401", steps=["Wait for expiry", "Send request", "Verify 401"], expected_result="401 Unauthorized", test_type="Edge Case", is_automated=True, priority="HIGH").model_dump(by_alias=True)
    ]
    await db.test_cases.insert_many(sample_tests)
    
    logger.info("Sample AI QA Data successfully injected.")
