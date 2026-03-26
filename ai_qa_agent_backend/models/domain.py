from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return str(uuid.uuid4())

PyObjectId = Annotated[str, BeforeValidator(str)]

class DBModelBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(default_factory=generate_uuid, alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class User(DBModelBase):
    username: str
    email: str
    hashed_password: str
    role: str = "QA" # Admins, QA, Dev
    is_active: bool = True

class UserStory(DBModelBase):
    story_id: str
    title: str
    description: str
    acceptance_criteria: List[str]
    status: str = "New" # Processed, Analyzed, etc.

class PullRequest(DBModelBase):
    pr_number: int
    repository: str
    title: str
    description: Optional[str] = None
    author: str
    changed_files: List[str]
    diff_hunks: str
    lines_added: int = 0
    lines_deleted: int = 0
    status: str = "Open"
    
class TestCase(DBModelBase):
    related_story_id: Optional[str] = None
    related_pr_id: Optional[str] = None
    title: str
    description: str
    preconditions: List[str] = []
    steps: List[str]
    expected_result: str
    test_type: str # Functional, Edge Case, Security, Performance
    is_automated: bool = False
    priority: str = "MEDIUM" # HIGH, MEDIUM, LOW
    
class RiskReport(DBModelBase):
    related_pr_id: Optional[str] = None
    risk_score: float # 0.0 to 100.0 or 0.0 to 1.0
    risk_level: str # Low, Medium, High, Critical
    impacted_components: List[str]
    predicted_issues: List[str]
    mitigation_suggestions: List[str]
    security_risk: bool = False
    performance_risk: bool = False
    insights: List[str] = []

class DefectData(DBModelBase):
    defect_id: str
    description: str
    component: str
    severity: str
    resolution: str
    
class AnalysisJob(DBModelBase):
    target_id: str
    job_type: str # 'story_analysis' or 'pr_analysis'
    status: str = "pending" # pending, running, completed, failed
    progress: int = 0
    result: Optional[dict] = None
    error: Optional[str] = None
