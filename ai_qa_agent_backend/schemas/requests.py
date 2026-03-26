from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "QA"

class UserStoryCreate(BaseModel):
    story_id: str
    title: str
    description: str
    acceptance_criteria: List[str]

class PullRequestIngest(BaseModel):
    pr_number: int
    repository: str
    title: str
    description: Optional[str] = None
    author: str
    changed_files: List[str]
    diff_hunks: str
    lines_added: int = 0
    lines_deleted: int = 0

class DefectDataUpload(BaseModel):
    defect_id: str
    description: str
    component: str
    severity: str
    resolution: str
