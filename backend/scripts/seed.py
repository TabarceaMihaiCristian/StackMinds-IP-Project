import uuid
from app.db.session import SessionLocal
from app.models import User
from app.core.security import hash_password

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

    create_user(db, "Admin User", "admin1@example.com", "admin123", "admin")
    create_user(db, "Organizer User", "organizer1@example.com", "org123", "organizer")
    create_user(db, "Student User", "student1@example.com", "student123", "student")

    db.close()


if __name__ == "__main__":
    run()
