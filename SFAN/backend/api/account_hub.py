from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from pydantic import BaseModel
import datetime

from backend.database.config import get_db
from backend.models.account_hub import Notification, ActivityLog, UserPreference, UserProfile, Policy
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/account-hub", tags=["account_hub"])

class ProfileUpdate(BaseModel):
    full_name: str = None
    dob: str = None
    gender: str = None
    occupation: str = None
    phone_number: str = None

class PreferencesUpdate(BaseModel):
    theme: str = None
    proactive_suggestions: bool = None
    tone_of_voice: str = None
    two_factor_enabled: bool = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, full_name=current_user.email.split("@")[0])
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    policy_count = db.query(Policy).filter(Policy.user_id == current_user.id).count()
    from backend.models.document import Document
    analyses_count = db.query(Document).count() * 2 # Mocked proxy
    
    return {
        "email": current_user.email,
        "role": current_user.role,
        "full_name": profile.full_name,
        "dob": profile.dob,
        "gender": profile.gender,
        "occupation": profile.occupation,
        "phone_number": profile.phone_number,
        "last_login": profile.last_login.isoformat() + "Z" if profile.last_login else None,
        "account_created_date": profile.account_created_date.isoformat() + "Z" if profile.account_created_date else None,
        "total_policies": policy_count,
        "total_analyses": analyses_count
    }

@router.put("/profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if data.full_name is not None: profile.full_name = data.full_name
    if data.dob is not None: profile.dob = data.dob
    if data.gender is not None: profile.gender = data.gender
    if data.occupation is not None: profile.occupation = data.occupation
    if data.phone_number is not None: profile.phone_number = data.phone_number
    
    db.commit()
    
    # Log activity
    log = ActivityLog(user_id=current_user.id, description="Profile Updated")
    db.add(log)
    db.commit()
    
    return {"status": "success"}

@router.get("/policies")
def get_policies(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    policies = db.query(Policy).filter(Policy.user_id == current_user.id).all()
    if not policies:
        # Seed some real-looking policies
        policies = [
            Policy(user_id=current_user.id, policy_name="Comprehensive Health", policy_type="Health Insurance", policy_number="H-123456", bank="HDFC", status="Active", coverage_amount="₹5,00,000", premium="₹120/mo", renewal_date="2027-01-15"),
            Policy(user_id=current_user.id, policy_name="Home Shield", policy_type="Home Insurance", policy_number="HM-987654", bank="ICICI", status="Active", coverage_amount="₹1,000,000", premium="₹80/mo", renewal_date="2026-11-20"),
            Policy(user_id=current_user.id, policy_name="Auto Guard", policy_type="Auto Insurance", policy_number="A-555555", bank="SBI", status="Expired", coverage_amount="₹50,000", premium="₹45/mo", renewal_date="2025-05-10")
        ]
        for p in policies:
            db.add(p)
        db.commit()
        
        log = ActivityLog(user_id=current_user.id, description="Viewed My Policies")
        db.add(log)
        db.commit()
        
        policies = db.query(Policy).filter(Policy.user_id == current_user.id).all()
        
    return [{
        "id": p.id,
        "policy_name": p.policy_name,
        "policy_type": p.policy_type,
        "policy_number": p.policy_number,
        "bank": p.bank,
        "status": p.status,
        "coverage_amount": p.coverage_amount,
        "premium": p.premium,
        "renewal_date": p.renewal_date
    } for p in policies]

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(desc(Notification.created_at)).all()
    if not notifs:
        notifs = []
        
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat() + "Z" if n.created_at else None
    } for n in notifs]

@router.put("/notifications/{notif_id}/read")
def read_notification(notif_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@router.put("/notifications/read-all")
def read_all_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"status": "success"}

@router.delete("/notifications/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).delete()
    db.commit()
    return {"status": "success"}

@router.get("/activity")
def get_activity(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(desc(ActivityLog.created_at)).limit(20).all()
    if not logs:
        logs = []

    return [{
        "id": l.id,
        "description": l.description,
        "created_at": l.created_at.isoformat() + "Z" if l.created_at else None
    } for l in logs]

@router.post("/activity")
def log_activity(data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    desc_text = data.get("description", "Unknown Action")
    log = ActivityLog(user_id=current_user.id, description=desc_text)
    db.add(log)
    db.commit()
    return {"status": "success"}

@router.get("/preferences")
def get_preferences(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
        
    return {
        "theme": pref.theme,
        "proactive_suggestions": pref.proactive_suggestions,
        "tone_of_voice": pref.tone_of_voice,
        "two_factor_enabled": pref.two_factor_enabled
    }

@router.put("/preferences")
def update_preferences(data: PreferencesUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        
    if data.theme is not None: pref.theme = data.theme
    if data.proactive_suggestions is not None: pref.proactive_suggestions = data.proactive_suggestions
    if data.tone_of_voice is not None: pref.tone_of_voice = data.tone_of_voice
    if data.two_factor_enabled is not None: pref.two_factor_enabled = data.two_factor_enabled
    
    db.commit()
    
    log = ActivityLog(user_id=current_user.id, description="Preferences Updated")
    db.add(log)
    db.commit()
    return {"status": "success"}

@router.get("/security")
def get_security(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    
    return {
        "last_login": profile.last_login.isoformat() + "Z" if (profile and profile.last_login) else datetime.datetime.utcnow().isoformat() + "Z",
        "two_factor_enabled": pref.two_factor_enabled if pref else False,
        "active_sessions": [
            {"device": "Current Browser", "location": "Local", "status": "Active Now", "is_current": True}
        ]
    }
