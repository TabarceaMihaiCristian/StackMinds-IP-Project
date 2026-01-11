College Events Management — README

Overview
- This repository implements a full-stack College Events Management application with:
	- Backend: FastAPI + SQLAlchemy (Postgres in production, SQLite for local dev)
	- Frontend: React + Vite (production served by nginx in Docker)
	- Database migrations: Alembic
	- Container orchestration: Docker Compose

Repository layout (high level)
- Backend: [backend](backend) — FastAPI app, models, schemas, repos, migrations, and utility scripts.
- Frontend: [frontend](frontend) — React + Vite UI and build pipeline.
- Docker compose: docker-compose.yml — local development environment (Postgres, backend, frontend).

Quickstart — Docker (recommended)
- Prerequisites: Docker Desktop and Docker Compose installed.
- Start services (Postgres, backend, frontend):

```bash
docker compose up --build
```

- The backend will be available at http://localhost:8000 (API root: /api/v1).
- The frontend will be available at http://localhost (port 80).

Local development (no Docker)
- Backend
	- Create a Python 3.11 venv and install dependencies:

	```bash
	python -m venv .venv
	source .venv/bin/activate   # on Windows use: .venv\Scripts\Activate.ps1
	pip install -r backend/requirements.txt
	```

	- Environment variables: copy `backend/.env` (if present) or create one with at least:

		- `DATABASE_URL` — SQLAlchemy URL (e.g. `postgresql+pg8000://user:password@localhost:5432/college_events` or `sqlite:///./dev.db` for simple local dev)
		- `JWT_SECRET_KEY` — secret for JWT signing

	- Run the app with uvicorn:

	```bash
	uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
	```

- Frontend
	- From the `frontend` folder install deps and run dev server:

	```bash
	cd frontend
	npm ci
	npm run dev
	```

Database migrations
- Alembic migrations are under [backend/alembic](backend/alembic). Typical workflow:

```bash
cd backend
# run migrations (ensure DATABASE_URL in env)
alembic upgrade head

# to create a new migration after model changes
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

Seeding and helper scripts
- The `backend/scripts` folder contains utility scripts such as `seed.py` and `insert_event.py`. Run them from the `backend` directory using the project Python environment:

```bash
python scripts/seed.py
python scripts/insert_event.py
```

Development database (SQLite)
- For quick local work you can use SQLite by setting `DATABASE_URL=sqlite:///./dev.db` in `backend/.env` or your environment. The repo includes instructions for exploring the SQLite DB in `backend/README.md`.

Environment variables reference
- `DATABASE_URL` — SQLAlchemy connection string. Example Postgres value: `postgresql+pg8000://user:password@db:5432/college_events`.
- `JWT_SECRET_KEY` — secret key for JWT tokens.
- `JWT_ALGORITHM` — token algorithm (default HS256).
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token expiry in minutes.

Key files
- Backend app entry: [backend/app/main.py](backend/app/main.py#L1-L200)
- Backend settings: [backend/app/core/config.py](backend/app/core/config.py#L1-L200)
- DB settings: [backend/app/core/settings/database_settings.py](backend/app/core/settings/database_settings.py#L1-L200)
- Backend Dockerfile: [backend/Dockerfile](backend/Dockerfile#L1-L200)
- Frontend Dockerfile: [frontend/Dockerfile](frontend/Dockerfile#L1-L200)
- Docker Compose: [docker-compose.yml](docker-compose.yml#L1-L200)

Troubleshooting
- Database connection errors:
	- When running with Docker Compose verify the `backend` service uses the Compose `db` hostname. The compose file provides a sample `DATABASE_URL` pointing to `db:5432`.
	- If using a local Postgres instance, update `DATABASE_URL` accordingly and ensure Postgres accepts connections.

- Alembic errors:
	- Ensure your `alembic.ini` and `backend/app` `PYTHONPATH` are correct when running `alembic` from the `backend` folder. Run `alembic` commands from `backend` with the same Python environment used by the app.

- Frontend CORS issues:
	- The backend CORS middleware in [backend/app/main.py](backend/app/main.py#L1-L200) allows common local origins including `http://localhost:5173` used by Vite dev server.

Next steps and suggestions
- Add a `Makefile` or `setup.sh` for common dev tasks (migrations, seed, run backend/frontend).
- Add a `.env.example` with required environment variable keys and example values.

License & Contributions
- This repository currently has no license file. Add `LICENSE` and a `CONTRIBUTING.md` if you plan to accept contributions.

Contact
- If you want, I can:
	- add a `.env.example` and `Makefile` for convenience,
	- run the project locally in Docker and verify endpoints,
	- or add instructions to run tests with `pytest`.

---