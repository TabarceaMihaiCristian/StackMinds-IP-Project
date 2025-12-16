Docker compose for the project

Services:
- db: Postgres 15
- backend: FastAPI app served with Uvicorn
- frontend: React app built and served by Nginx

Build and run
1. From the repository root (where `docker-compose.yml` is located):
```powershell
docker compose up --build
```
This will:
- build backend and frontend images
- start Postgres, backend and frontend containers

Seed the DB
- The backend image includes a `wait-for-postgres.sh` entrypoint. After the DB is up you can run seed:
```powershell
# in a new terminal
docker compose exec backend python -m app.seed
```

Access
- Frontend: http://localhost/
- Backend API: http://localhost:8000/

Notes
- The backend mounts `./backend` into the container so code changes are reflected without rebuilding (development convenience).
- If you want the seed to run automatically, we can add an init container or run the seed in the `command` after `wait-for-postgres`.
