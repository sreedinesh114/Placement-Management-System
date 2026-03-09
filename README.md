Placement Management System

A full-stack Placement Management Portal designed to help colleges manage campus recruitment efficiently.
It allows students to apply for drives, officers to manage companies and drives, and provides AI-powered career assistance.

Features
Student Portal

Student registration & login

View available placement drives

Apply for drives

Upload resume

Track application status

AI career assistant

Officer Dashboard

Manage companies

Create and manage drives

View applicants

Download applicant list (CSV)

Student analytics

Send notifications

AI Assistant

Resume review suggestions

Interview preparation

Company matching recommendations

Career guidance

Tech Stack

Frontend

React.js

Tailwind CSS

Axios

Lucide Icons

Backend

FastAPI

Python

JWT Authentication

Database

MongoDB

AI

Groq LLaMA model

Project Structure
Placement-Management-System
│
├── backend
│   ├── server.py
│   ├── requirements.txt
│   ├── uploads/
│   └── venv/
│
├── frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── tests
└── README.md
Prerequisites

Make sure the following are installed:

Python 3.9+

Node.js 18+

MongoDB

Git

Backend Setup (FastAPI)
1. Navigate to backend folder
cd backend
2. Create virtual environment
python -m venv venv
3. Activate virtual environment

Windows

venv\Scripts\activate

Mac/Linux

source venv/bin/activate
4. Install dependencies
pip install -r requirements.txt
5. Configure environment variables

Create a .env file inside backend folder.

Example:

MONGO_URL=your_mongodb_connection_string
DB_NAME=placement_db
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
6. Run backend server
uvicorn server:app --reload --port 8001

Backend will run at:

http://localhost:8001

API Docs:

http://localhost:8001/docs
Frontend Setup (React)
1. Navigate to frontend folder
cd frontend
2. Install dependencies
npm install
3. Run frontend
npm run dev

Frontend will run at:

http://localhost:3000
Default Roles

The system supports two roles:

Student

Apply for drives

Upload resume

Use AI assistant

Officer

Manage companies

Create drives

View applicants

Download reports

Screenshots

You can add screenshots of:

Student Dashboard

Officer Dashboard

Manage Drives

AI Assistant

Future Improvements

Resume AI analyzer

Interview scheduling

Email notifications

Company logo upload

Admin dashboard

Author

Dinesh S
GitHub:
https://github.com/sreedinesh114

License

This project is developed for educational purposes (Final Year Project).



screenshots

demo link
