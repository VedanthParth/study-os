# Configuration

StudyOS is configured entirely through environment variables. The same codebase
runs unchanged in local development, Docker, a VPS, or any managed platform
(Railway, Render, Azure, AWS, …) — only configuration differs.

This document is the single source of truth for configuring StudyOS. A new
developer should be able to get the project running from this page alone.

---

## Philosophy

Configuration is:

- **Centralized** — the backend reads everything through one typed `Settings`
  object ([`backend/app/core/config.py`](../backend/app/core/config.py)); the
  frontend reads everything through one config module
  ([`frontend/src/config/env.ts`](../frontend/src/config/env.ts)). There are no
  scattered `os.getenv()` calls or hardcoded URLs.
- **Type-safe** — values are parsed and validated by `pydantic-settings`.
  Invalid types or missing required values fail fast at startup.
- **Environment-driven** — nothing assumes localhost, a fixed port, a local
  database, or a local backend URL. Behaviour is determined by configuration.
- **Production-ready** — sensible defaults make local development zero-config,
  while deployments override only what they need.

The application never assumes where it is running.

---

## Backend

### How it loads

Resolution order (highest priority first):

1. Real process environment variables.
2. Values in `backend/.env`.
3. Defaults declared on the `Settings` class.

The `.env` file is **never committed** (it is git-ignored). The committed
[`backend/.env.example`](../backend/.env.example) documents every variable.

### Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `APP_NAME` | optional | `StudyOS API` | Human-readable application/API name. |
| `ENVIRONMENT` | optional | `development` | One of `development`, `testing`, `staging`, `production`. |
| `DEBUG` | optional | `false` | Enables verbose framework behaviour. Keep `false` in production. |
| `HOST` | optional | `127.0.0.1` | Interface the server binds to. Use `0.0.0.0` in containers. |
| `PORT` | optional | `8000` | Port the server binds to. |
| `API_PREFIX` | optional | `/api` | Prefix applied to every API route. |
| `DATABASE_URL` | optional* | local SQLite | Full SQLAlchemy URL. Blank → `backend/database/studyos.db`. |
| `SECRET_KEY` | **required in staging/production** | dev placeholder | Secret for signing tokens (used once auth lands). |
| `ALGORITHM` | optional | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | optional | `1440` | Access-token lifetime in minutes. |
| `BACKEND_CORS_ORIGINS` | optional | `http://localhost:5173` | Allowed browser origins (JSON array or comma-separated). |
| `LOG_LEVEL` | optional | `INFO` | `DEBUG`/`INFO`/`WARNING`/`ERROR`/`CRITICAL`. |

\* `DATABASE_URL` is optional in development (defaults to local SQLite) but should
be set explicitly in every deployed environment.

#### Future variables (documented, not yet consumed)

These are declared so deployments can be prepared ahead of the features that use
them. They are currently unused and may be left blank.

| Variable | Default | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | _empty_ | OpenAI API key. |
| `ANTHROPIC_API_KEY` | _empty_ | Anthropic API key. |
| `OPENROUTER_API_KEY` | _empty_ | OpenRouter API key. |
| `OLLAMA_BASE_URL` | _empty_ | Base URL of a local Ollama server. |
| `STORAGE_PROVIDER` | `local` | File storage backend (only `local` today). |
| `SMTP_HOST` | _empty_ | Outbound email host. |
| `SMTP_PORT` | _empty_ | Outbound email port. |

### Validation & fail-fast behaviour

Startup raises a clear error (and the app does not boot) when:

- A value cannot be parsed into its declared type (e.g. `PORT=abc`).
- `ENVIRONMENT` is `staging` or `production` while `SECRET_KEY` is still the
  insecure development default.

Optional variables fall back to the defaults in the table above.

### Environment profiles

There is a single codebase; `ENVIRONMENT` selects behaviour:

| Environment | Typical use | Notes |
| --- | --- | --- |
| `development` | Local work | Zero-config: SQLite + insecure dev secret allowed. |
| `testing` | Automated tests | Point `DATABASE_URL` at a throwaway/in-memory DB. |
| `staging` | Pre-prod | Requires a real `SECRET_KEY`; mirror production settings. |
| `production` | Live | Requires a real `SECRET_KEY`; set `DEBUG=false`. |

---

## Frontend

The frontend reads configuration from Vite's `import.meta.env` through
[`frontend/src/config/env.ts`](../frontend/src/config/env.ts). Only variables
prefixed with `VITE_` are exposed to the browser.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | optional in dev | `http://localhost:8000` | Base URL of the backend API (no trailing slash). |

The localhost default exists purely for local development. Production builds
should set `VITE_API_URL` explicitly. See
[`frontend/.env.example`](../frontend/.env.example).

---

## Local setup

```bash
# Backend
cd backend
cp .env.example .env            # optional; defaults work out of the box
python -m venv venv
# Windows:        venv\Scripts\activate
# macOS / Linux:  source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host "$HOST" --port "$PORT"
```

```bash
# Frontend
cd frontend
cp .env.example .env            # optional; defaults to http://localhost:8000
npm install
npm run dev
```

With no `.env` files at all, the backend runs on `127.0.0.1:8000` against a local
SQLite database and the frontend talks to `http://localhost:8000`.

---

## Production setup

1. Provide configuration through your platform's environment-variable mechanism
   (dashboard, secrets manager, or a deployment `.env`). Do **not** commit
   secrets.
2. Set at minimum:
   - `ENVIRONMENT=production`
   - `DEBUG=false`
   - `SECRET_KEY=<generated secret>` — e.g.
     `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `DATABASE_URL=<your database URL>`
   - `BACKEND_CORS_ORIGINS=<your frontend origin(s)>`
   - `HOST=0.0.0.0` and `PORT` to whatever the platform expects.
3. Build the frontend with `VITE_API_URL` pointing at the deployed backend.
4. Run database migrations: `alembic upgrade head` (the migration runner reads
   `DATABASE_URL` from the same configuration).

---

## Adding a new setting

1. Add a typed field (with a default if optional) to `Settings` in
   [`backend/app/core/config.py`](../backend/app/core/config.py).
2. Document it in [`backend/.env.example`](../backend/.env.example) and in the
   table above.
3. Read it via the `settings` object — never `os.getenv`.
