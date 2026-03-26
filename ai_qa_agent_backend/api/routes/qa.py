from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from db.mongodb import get_database
from models.domain import UserStory, PullRequest, AnalysisJob, TestCase
from services.llm_service import generate_test_cases_from_story
from services.test_generation import generate_tests_for_pr
from services.ml_risk import analyze_pr_risk
from schemas.responses import GenerationResponse, RiskAssessmentResponse
from api.dependencies import get_current_user
import asyncio

router = APIRouter()

async def run_story_analysis_task(job_id: str, story: UserStory):
    db = get_database()
    try:
        await db.analysis_jobs.update_one({"_id": job_id}, {"$set": {"status": "running", "progress": 50}})
        
        test_cases = await generate_test_cases_from_story(
            story_id=story.id,
            title=story.title,
            description=story.description,
            criteria=story.acceptance_criteria
        )
        
        if test_cases:
            await db.test_cases.insert_many([tc.model_dump(by_alias=True) for tc in test_cases])
            
        await db.analysis_jobs.update_one(
            {"_id": job_id}, 
            {"$set": {
                "status": "completed",
                "progress": 100,
                "result": {
                    "message": "Tests generated successfully", 
                    "test_cases_generated": len(test_cases), 
                    "test_cases": [tc.model_dump() for tc in test_cases]
                }
            }}
        )
    except Exception as e:
        await db.analysis_jobs.update_one({"_id": job_id}, {"$set": {"status": "failed", "progress": 0, "error": str(e)}})


async def run_pr_analysis_task(job_id: str, pr: PullRequest):
    db = get_database()
    try:
        await db.analysis_jobs.update_one({"_id": job_id}, {"$set": {"status": "running", "progress": 50}})
        
        test_cases = await generate_tests_for_pr(pr)
        if test_cases:
            await db.test_cases.insert_many([tc.model_dump(by_alias=True) for tc in test_cases])
            
        await db.analysis_jobs.update_one(
            {"_id": job_id}, 
            {"$set": {
                "status": "completed",
                "progress": 100,
                "result": {
                    "message": "Tests generated from structural PR analysis successfully",
                    "test_cases_generated": len(test_cases),
                    "test_cases": [tc.model_dump() for tc in test_cases]
                }
            }}
        )
    except Exception as e:
        await db.analysis_jobs.update_one({"_id": job_id}, {"$set": {"status": "failed", "progress": 0, "error": str(e)}})


@router.post("/generate-tests/story/{story_id}")
async def generate_tests_for_story_bg(story_id: str, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    db = get_database()
    story_dict = await db.user_stories.find_one({"story_id": story_id})
    if not story_dict:
        raise HTTPException(status_code=404, detail="User story not found")
        
    story = UserStory(**story_dict)
    job = AnalysisJob(target_id=story_id, job_type="story_analysis", status="pending")
    await db.analysis_jobs.insert_one(job.model_dump(by_alias=True))
    
    background_tasks.add_task(run_story_analysis_task, job.id, story)
    
    return {"message": "Analysis job started in background", "job_id": job.id, "status": "pending"}

@router.post("/generate-tests/pr/{pr_id}")
async def analyze_pr_for_tests_bg(pr_id: str, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    db = get_database()
    pr_num = int(pr_id.replace("PR-", "")) if "PR-" in pr_id.upper() else int(pr_id)
    pr_dict = await db.pull_requests.find_one({"pr_number": pr_num})
    if not pr_dict:
        raise HTTPException(status_code=404, detail="PR not found")
        
    pr = PullRequest(**pr_dict)
    job = AnalysisJob(target_id=pr_id, job_type="pr_analysis", status="pending")
    await db.analysis_jobs.insert_one(job.model_dump(by_alias=True))
    
    background_tasks.add_task(run_pr_analysis_task, job.id, pr)
    
    return {"message": "Analysis job started in background", "job_id": job.id, "status": "pending"}

@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str, current_user = Depends(get_current_user)):
    db = get_database()
    job_dict = await db.analysis_jobs.find_one({"_id": job_id})
    if not job_dict:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_dict

@router.post("/assess-risk/pr/{pr_id}", response_model=RiskAssessmentResponse)
async def assess_pr_risk(pr_id: str, current_user = Depends(get_current_user)):
    db = get_database()
    pr_dict = await db.pull_requests.find_one({"_id": pr_id})
    if not pr_dict:
        raise HTTPException(status_code=404, detail="PR not found")
        
    pr = PullRequest(**pr_dict)
    report = await analyze_pr_risk(pr)
    
    return {"pr_id": pr.id, "report": report}

@router.get("/tests", response_model=list[TestCase])
async def list_test_cases(limit: int = 100, current_user = Depends(get_current_user)):
    db = get_database()
    cursor = db.test_cases.find({}).sort("_id", -1)
    tests = await cursor.to_list(length=limit)
    return [TestCase(**tc) for tc in tests]
