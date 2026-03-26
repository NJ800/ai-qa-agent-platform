from pydantic import BaseModel, ConfigDict, Field
from typing import List
from models.domain import TestCase, RiskReport

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: str
    role: str
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class GenerationResponse(BaseModel):
    message: str
    test_cases_generated: int
    test_cases: List[TestCase]

class RiskAssessmentResponse(BaseModel):
    pr_id: str
    report: RiskReport
