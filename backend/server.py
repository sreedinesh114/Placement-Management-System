from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from groq import Groq
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

UPLOAD_DIR = ROOT_DIR / 'uploads' / 'resumes'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str
    first_name: str
    last_name: str
    branch: Optional[str] = None
    year: Optional[str] = None
    roll_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str
    first_name: str
    last_name: str
    branch: Optional[str] = None
    roll_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    industry: str
    students_hired: int = 0
    avg_package: float = 0.0
    last_visit: Optional[str] = None
    status: str = "active"
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Drive(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    role: str
    package: str
    drive_date: str
    location: str = "Campus"
    min_cgpa: float = 0.0
    slots: int = 50
    registrations: int = 0
    status: str = "upcoming"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str = ""
    drive_id: str
    company: str
    role: str
    package: str
    status: str = "pending"
    current_stage: str = "Applied"
    applied_date: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    roll_number: Optional[str] = None
    cgpa: Optional[float] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    backlogs: Optional[int] = None
    skills: Optional[List[str]] = None

class FeedbackForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    form_link: str
    expiry_date: str
    target_role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    target_role: str = "student"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    message: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        branch=user_data.branch,
        roll_number=user_data.roll_number
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    if user.role == "student":
        user_dict['year'] = user_data.year
        user_dict['cgpa'] = 0.0
        user_dict['tenth_percentage'] = 0.0
        user_dict['twelfth_percentage'] = 0.0
        user_dict['backlogs'] = 0
        user_dict['skills'] = []
        user_dict['phone'] = ""
        user_dict['resume_path'] = ""
    
    await db.users.insert_one(user_dict)
    token = create_token(user.id, user.email, user.role)
    
    return {"token": token, "user": user.model_dump()}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    user.pop('password')
    
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Company Routes
@api_router.get("/companies")
async def get_companies(current_user: dict = Depends(get_current_user)):
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    return companies

@api_router.post("/companies")
async def create_company(company: Company, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can create companies")
    
    company_dict = company.model_dump()
    company_dict['created_at'] = company_dict['created_at'].isoformat()
    await db.companies.insert_one(company_dict)
    return company
@api_router.delete("/companies/{company_id}")
async def delete_company(company_id: str, current_user: dict = Depends(get_current_user)):

    if current_user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Only officers can delete companies")

    result = await db.companies.delete_one({"id": company_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")

    return {"message": "Company deleted successfully"}

# Drive Routes
@api_router.get("/drives")
async def get_drives(current_user: dict = Depends(get_current_user)):
    drives = await db.drives.find({}, {"_id": 0}).to_list(1000)
    return drives

@api_router.post("/drives")
async def create_drive(drive: Drive, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can create drives")
    
    drive_dict = drive.model_dump()
    drive_dict['created_at'] = drive_dict['created_at'].isoformat()
    await db.drives.insert_one(drive_dict)
    return drive

@api_router.delete("/drives/{drive_id}")
async def delete_drive(drive_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can delete drives")
    
    result = await db.drives.delete_one({"id": drive_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {"message": "Drive deleted successfully"}

# Student Routes
@api_router.get("/students")
async def get_students(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can view all students")
    
    students = await db.users.find({"role": "student"}, {"_id": 0, "password": 0}).to_list(1000)
    
    for student in students:
        apps = await db.applications.find({"student_id": student['id']}, {"_id": 0}).to_list(1000)
        student['total_applications'] = len(apps)
        student['placed'] = any(app['status'] == 'selected' for app in apps)
        student['offers'] = len([app for app in apps if app['status'] == 'selected'])

    return students
    

@api_router.get("/students/export")
async def export_students(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can export students")
    
    students = await db.users.find({"role": "student"}, {"_id": 0, "password": 0}).to_list(1000)
    
    for student in students:
        apps = await db.applications.find({"student_id": student['id']}, {"_id": 0}).to_list(1000)
        student['placed'] = any(app['status'] == 'selected' for app in apps)
        student['offers'] = len([app for app in apps if app['status'] == 'selected'])
    
    csv_content = "Name,Email,Branch,Roll Number,CGPA,10th%,12th%,Backlogs,Offers,Status\n"
    for student in students:
        csv_content += f"{student.get('first_name', '')} {student.get('last_name', '')},"
        csv_content += f"{student.get('email', '')},"
        csv_content += f"{student.get('branch', '')},"
        csv_content += f"{student.get('roll_number', '')},"
        csv_content += f"{student.get('cgpa', 0)},"
        csv_content += f"{student.get('tenth_percentage', 0)},"
        csv_content += f"{student.get('twelfth_percentage', 0)},"
        csv_content += f"{student.get('backlogs', 0)},"
        csv_content += f"{student.get('offers', 0)},"
        csv_content += f"{'Placed' if student.get('placed') else 'Pending'}\n"
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_export.csv"}
    )

    return students

# Application Routes
@api_router.post("/applications")
async def create_application(application: Application, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can apply")
    
    existing = await db.applications.find_one({
        "student_id": current_user['user_id'],
        "drive_id": application.drive_id
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this drive")
    
    application.student_id = current_user['user_id']
    app_dict = application.model_dump()
    await db.applications.insert_one(app_dict)
    
    await db.drives.update_one(
        {"id": application.drive_id},
        {"$inc": {"registrations": 1}}
    )
    
    return application

@api_router.get("/applications")
async def get_applications(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'student':
        apps = await db.applications.find({"student_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    else:
        apps = await db.applications.find({}, {"_id": 0}).to_list(1000)
    return apps

# Profile Routes
@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Notification Routes
@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find({"target_role": current_user['role']}, {"_id": 0}).to_list(1000)
    return notifications

@api_router.post("/notifications")
async def create_notification(notification: Notification, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can create notifications")
    
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    return notification

@api_router.delete("/notifications/{notif_id}")
async def delete_notification(notif_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can delete notifications")
    
    result = await db.notifications.delete_one({"id": notif_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}


@api_router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if not update_dict:
        return await get_profile(current_user)
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": update_dict}
    )
    
    return await get_profile(current_user)

@api_router.post("/profile/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    file_path = UPLOAD_DIR / f"{current_user['user_id']}_{file.filename}"
    
    with open(file_path, 'wb') as f:
        content = await file.read()
        f.write(content)
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"resume_path": str(file_path)}}
    )
    
    return {"message": "Resume uploaded successfully", "filename": file.filename}

@api_router.delete("/profile/delete-resume")
async def delete_resume(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get('resume_path'):
        import os
        try:
            if os.path.exists(user['resume_path']):
                os.remove(user['resume_path'])
        except Exception as e:
            logger.error(f"Failed to delete resume file: {e}")
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"resume_path": ""}}
    )
    
    return {"message": "Resume deleted successfully"}

# Analytics Routes
@api_router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can view analytics")
    
    total_students = await db.users.count_documents({"role": "student"})
    total_companies = await db.companies.count_documents({})
    active_drives = await db.drives.count_documents({"status": "upcoming"})
    
    applications = await db.applications.find({}, {"_id": 0}).to_list(10000)
    placed_students = len(set(app['student_id'] for app in applications if app['status'] == 'selected'))
    total_offers = len([app for app in applications if app['status'] == 'selected'])
    
    placement_rate = (placed_students / total_students * 100) if total_students > 0 else 0
    
    students = await db.users.find({"role": "student"}, {"_id": 0, "password": 0}).to_list(10000)
    cgpas = [s.get('cgpa', 0) for s in students if s.get('cgpa')]
    avg_cgpa = sum(cgpas) / len(cgpas) if cgpas else 0
    
    return {
        "total_students": total_students,
        "placed_students": placed_students,
        "placement_rate": round(placement_rate, 2),
        "total_companies": total_companies,
        "active_drives": active_drives,
        "total_offers": total_offers,
        "avg_cgpa": round(avg_cgpa, 2)
    }

# Feedback Form Routes
@api_router.get("/feedback-forms")
async def get_feedback_forms(current_user: dict = Depends(get_current_user)):
    forms = await db.feedback_forms.find({}, {"_id": 0}).to_list(1000)
    return forms

@api_router.post("/feedback-forms")
async def create_feedback_form(form: FeedbackForm, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can create feedback forms")
    
    form_dict = form.model_dump()
    form_dict['created_at'] = form_dict['created_at'].isoformat()
    await db.feedback_forms.insert_one(form_dict)
    return form

@api_router.delete("/feedback-forms/{form_id}")
async def delete_feedback_form(form_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'officer':
        raise HTTPException(status_code=403, detail="Only officers can delete feedback forms")
    
    result = await db.feedback_forms.delete_one({"id": form_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feedback form not found")
    return {"message": "Feedback form deleted successfully"}

# AI Assistant Routes
@api_router.post("/ai-assistant/chat")
async def ai_chat(chat_msg: ChatMessage, current_user: dict = Depends(get_current_user)):

    user = await db.users.find_one(
        {"id": current_user["user_id"]},
        {"_id": 0, "password": 0}
    )

    system_message = f"""
You are an AI career assistant for a campus placement system.

Student Name: {user.get('first_name','')} {user.get('last_name','')}
Branch: {user.get('branch','N/A')}
CGPA: {user.get('cgpa','N/A')}
Skills: {', '.join(user.get('skills', []))}

Give career guidance and placement advice.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": chat_msg.message}
            ]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        print("GROQ ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
@api_router.get("/ai-assistant/eligibility")
async def get_eligibility(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    drives = await db.drives.find({"status": "upcoming"}, {"_id": 0}).to_list(1000)
    
    eligible_count = 0
    for drive in drives:
        if user.get('cgpa', 0) >= drive.get('min_cgpa', 0) and user.get('backlogs', 0) == 0:
            eligible_count += 1
    
    total_drives = len(drives)
    percentage = (eligible_count / total_drives * 100) if total_drives > 0 else 0
    
    return {
        "eligible_count": eligible_count,
        "total_drives": total_drives,
        "percentage": round(percentage, 0)
    }
@api_router.get("/drives/{drive_id}/students")
async def get_drive_students(drive_id: str, current_user: dict = Depends(get_current_user)):

    if current_user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Only officers can view applicants")

    applications = await db.applications.find({"drive_id": drive_id}).to_list(1000)

    students = []

    for app in applications:
        student = await db.users.find_one(
            {"id": app["student_id"]},
            {"_id": 0, "password": 0}
        )

        if student:
            students.append({
                "name": student.get("first_name","") + " " + student.get("last_name",""),
                "email": student.get("email"),
                "branch": student.get("branch"),
                "cgpa": student.get("cgpa"),
                "status": student.get("status")
            })

        print("Applications found:", applications)

    return students

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

