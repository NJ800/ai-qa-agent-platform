from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from core.security import verify_password, create_access_token, get_password_hash
from db.mongodb import get_database
from models.domain import User
from api.dependencies import get_current_user
from schemas.requests import UserCreate, Token
from schemas.responses import UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    db = get_database()
    if await db.users.find_one({"username": user_in.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    if await db.users.find_one({"email": user_in.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role
    )
    
    await db.users.insert_one(user.model_dump(by_alias=True))
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user_dict = await db.users.find_one({"username": form_data.username})
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    user = User(**user_dict)
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
