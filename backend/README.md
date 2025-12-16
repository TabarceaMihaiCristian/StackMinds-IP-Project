Visualizing the local dev database

This workspace uses a local SQLite dev database at `backend/dev.db` when `DATABASE_URL` points to `sqlite:///./dev.db`.

VS Code (SQLTools)
- Install the `SQLTools` extension and the `SQLTools SQLite` driver.
- The workspace contains a preconfigured connection:
  - Connection name: `SQLite - dev.db`
  - Opens `backend/dev.db` directly.
- Open the SQLTools side panel and connect to `SQLite - dev.db`.

Command line (sqlite3)
- From the `backend` folder run:
```
sqlite3 ./dev.db
.headers on
.mode column
SELECT id, email, role FROM users;
```

Python quick check
```
python - <<'PY'
from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
for u in db.query(User).all():
    print(u.id, u.email, u.role)
db.close()
PY
```
