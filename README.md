# StudyOS

## Configuration

StudyOS is configured entirely through environment variables — the same codebase
runs anywhere by changing configuration only. See
[docs/configuration.md](docs/configuration.md) for the full reference. Copy
`backend/.env.example` → `backend/.env` and `frontend/.env.example` →
`frontend/.env` to customize; the defaults work out of the box for local dev.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173 by default.

## Backend

```bash
cd backend
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

uvicorn app.main:app --reload
```

Runs at http://localhost:8000 by default (configurable via `HOST` / `PORT`).  
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
