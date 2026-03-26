from fastapi import APIRouter, Depends
from typing import List
from db.mongodb import get_database
from models.domain import UserStory, PullRequest, DefectData, User
from schemas.requests import UserStoryCreate, PullRequestIngest, DefectDataUpload
from api.dependencies import get_current_user

router = APIRouter()

@router.post("/stories", response_model=dict)
async def ingest_user_story(story_in: UserStoryCreate, current_user = Depends(get_current_user)):
    db = get_database()
    story = UserStory(**story_in.model_dump())
    await db.user_stories.insert_one(story.model_dump(by_alias=True))
    return {"status": "success", "message": "User story ingested successfully.", "id": story.id}

@router.get("/stories", response_model=List[UserStory])
async def list_user_stories(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.user_stories.find({})
    stories = await cursor.to_list(length=100)
    return [UserStory(**st) for st in stories]

@router.post("/prs", response_model=dict)
async def ingest_pull_request(pr_in: PullRequestIngest, current_user = Depends(get_current_user)):
    db = get_database()
    pr = PullRequest(**pr_in.model_dump())
    await db.pull_requests.insert_one(pr.model_dump(by_alias=True))
    return {"status": "success", "message": "Pull Request ingested successfully.", "id": pr.id}

@router.get("/prs", response_model=List[PullRequest])
async def list_pull_requests(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.pull_requests.find({})
    prs = await cursor.to_list(length=100)
    return [PullRequest(**pr) for pr in prs]

@router.post("/defects", response_model=dict)
async def upload_defect_data(defect_in: DefectDataUpload, current_user = Depends(get_current_user)):
    db = get_database()
    defect = DefectData(**defect_in.model_dump())
    await db.defect_history.insert_one(defect.model_dump(by_alias=True))
    return {"status": "success", "message": "Defect data uploaded.", "id": defect.id}
