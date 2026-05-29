# StudyOS

## Frontend

```
bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

## Backend

```
bash
cd backend
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

uvicorn app.main:app --reload
```

Runs at http://localhost:8000  
API docs at http://localhost:8000/docs

## Project Structure

```
study-os/
├── frontend/        # React + TypeScript + Vite + Tailwind + shadcn/ui
├── backend/         # FastAPI + SQLAlchemy + Alembic + SQLite
├── shared/          # Shared types/utilities (future)
├── docs/            # Project documentation
├── prompts/         # LLM prompt templates
├── scripts/         # Dev/ops scripts
└── database/        # SQLite database files
```
