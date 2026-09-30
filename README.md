# FitBuddy – AI Fitness Plan Generator

FitBuddy is a FastAPI + Jinja2 + SQLite web application that uses Google's Gemini API to generate personalized 7-day workout plans, nutrition/recovery tips, and feedback-based plan revisions.

## Features

- User profile: name, User ID, age, weight, goal and intensity.
- AI-generated 7-day workout plan.
- AI-generated nutrition/recovery tip.
- Feedback loop that regenerates the workout plan.
- SQLite persistence with SQLAlchemy.
- Protected admin dashboard.
- FastAPI Swagger docs at `/docs`.
- Health endpoint at `/api/health`.
- Offline demo fallback when `GEMINI_API_KEY` is not configured.
- Render deployment configuration included.

## Project structure

```text
FitBuddy-AI-Fitness-Planner/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── ai_models.py
│   ├── gemini_service.py
│   └── routes.py
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── result.html
│   ├── admin_login.html
│   ├── all_users.html
│   └── error.html
├── static/css/style.css
├── requirements.txt
├── .env.example
├── .gitignore
├── .python-version
├── render.yaml
└── README.md
```

## Local setup – Windows / VS Code

### 1. Open the project folder

Open this folder in VS Code.

### 2. Create a virtual environment

```powershell
py -3.13 -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use Command Prompt:

```cmd
.venv\Scripts\activate.bat
```

### 3. Install dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Gemini

Copy `.env.example` to `.env`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Then put your real Gemini API key into `.env`:

```env
GEMINI_API_KEY=your_real_key
ADMIN_PASSWORD=your_private_admin_password
```

Do not commit `.env` to GitHub. It is ignored by `.gitignore`.

### 5. Run

```powershell
uvicorn app.main:app --reload
```

Open:

- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/admin

If no Gemini key is configured, FitBuddy still runs using a local demo fallback. With a valid key, Gemini handles plan/tip generation and plan updates.

## Test checklist

1. Open `/`.
2. Enter:
   - Name: Deep
   - User ID: FIT001
   - Age: 20
   - Weight: 65
   - Goal: Muscle gain
   - Intensity: Medium
3. Click Generate 7-Day Plan.
4. Confirm the result page shows a 7-day plan and nutrition/recovery tip.
5. Enter feedback such as `Add more cardio and make Day 4 a recovery day`.
6. Confirm an updated plan is stored.
7. Open `/admin`, enter your admin password, and confirm the user appears.
8. Open `/docs` and test `/api/health`.

## Current Gemini SDK

The project uses the modern `google-genai` SDK rather than the older `google-generativeai` package. The model names are environment-configurable.

The documentation that inspired this project originally named Gemini 1.5 Pro and Gemini Flash. Those older names are not hard-coded because model availability changes over time.

## Deployment

### GitHub

Create a public GitHub repository, for example:

`fitbuddy-ai-fitness-planner`

Upload the project files and use the repository URL as the permanent source-code/project link.

### Render

Connect the GitHub repository to Render as a Web Service.

Build command:

```text
pip install -r requirements.txt
```

Start command:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set these environment variables in Render:

- `GEMINI_API_KEY`
- `ADMIN_PASSWORD`

The included `render.yaml` provides the service configuration.

Note: the included SQLite database is suitable for a student/demo deployment. A free cloud instance may not provide durable SQLite storage across all redeploy/restart scenarios. For production persistence, move the database to PostgreSQL.

## Safety

FitBuddy provides general educational fitness information. It does not diagnose medical conditions or replace a qualified healthcare or fitness professional. Users should stop exercise if they experience pain, dizziness, or unusual symptoms.

## Source project basis

The implementation follows the supplied FitBuddy project documentation: FastAPI, Jinja2, SQLite/SQLAlchemy, Gemini-powered workout generation, nutrition tips, feedback-based updates, and an admin view.
