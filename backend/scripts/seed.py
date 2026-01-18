import uuid

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import User


def create_user(db, name, email, password, role):
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"[SKIP] User already exists: {email}")
        return

    u = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(u)
    db.commit()
    print(f"[OK] Created {role} user: {email}")


def run():
    db = SessionLocal()

    create_user(db, "George Andrei", "george@example.com", "123", "admin")
    create_user(db, "Maria Popescu", "maria@example.com", "123", "organizer")
    create_user(db, "David Pop", "david@example.com", "123", "student")

    db.close()


if __name__ == "__main__":
    run()
