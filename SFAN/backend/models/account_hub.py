from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.config import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String, default="light")
    proactive_suggestions = Column(Boolean, default=True)
    tone_of_voice = Column(String, default="Professional")
    two_factor_enabled = Column(Boolean, default=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    account_created_date = Column(DateTime(timezone=True), server_default=func.now())

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_name = Column(String)
    policy_type = Column(String)
    policy_number = Column(String)
    bank = Column(String)
    status = Column(String) # Active, Pending, Expired
    coverage_amount = Column(String)
    premium = Column(String)
    renewal_date = Column(String)
