from backend.database.config import SessionLocal, Base, engine
from backend.models.user import User, UserRole
from backend.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@sfan.com").first()
        if not admin:
            print("Creating default admin user...")
            new_admin = User(
                email="admin@sfan.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.admin
            )
            db.add(new_admin)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists. Overwriting password to admin123...")
            admin.hashed_password = get_password_hash("admin123")
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
