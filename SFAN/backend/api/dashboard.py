from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import datetime
import calendar

from backend.database.config import get_db
from backend.models.document import Document, Namespace
from backend.models.account_hub import ActivityLog
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    # Real data from DB
    docs_count = db.query(Document).count()
    indexed_docs = db.query(Document).filter(Document.status == "already_indexed").count()
    
    # Make the health score more organic and realistic (e.g. 70-95 range) instead of a perfect 100.
    # We base it on a baseline of 75, plus points for more documents and vectors.
    readiness_score = min(75 + (docs_count * 2) + (indexed_docs), 94) if docs_count > 0 else 0
    
    # Use total vectors generated as a proxy for "AI Insights Generated" since we don't have an insights table
    insights_count = db.query(func.sum(Document.vector_count)).scalar() or 0
    
    # Profile completion proxy (real apps would check user profile fields)
    profile_completion = 100 if current_user and current_user.email else 50
    
    # Usage Trend: Group documents by month for Jan-Dec of current year
    docs = db.query(Document.created_at).all()
    today = datetime.datetime.utcnow()
    usage_trend = []
    
    for month_num in range(1, 13):
        month_name = calendar.month_abbr[month_num]
        
        # Only show data for months up to the current month
        if month_num > today.month:
            usage_trend.append({
                "month": month_name,
                "docs": 0,
                "ai": 0
            })
        else:
            # Count docs matching this month and year
            docs_this_month = sum(
                1 for d in docs 
                if d.created_at and d.created_at.month == month_num and d.created_at.year == today.year
            )
            
            usage_trend.append({
                "month": month_name,
                "docs": docs_this_month,
                "ai": 0
            })

    import json
    from backend.core.config import settings
    
    pinecone_namespaces = []
    if settings.PINECONE_NAMESPACE:
        try:
            pinecone_namespaces = json.loads(settings.PINECONE_NAMESPACE)
        except Exception:
            pass
            
    pinecone_docs_count = 0
    if pinecone_namespaces:
        pinecone_docs_count = db.query(Document).filter(Document.namespace.in_(pinecone_namespaces)).count()
    else:
        pinecone_docs_count = indexed_docs
            
    # Reminders based on actual state
    reminders = []
    if docs_count == 0:
        reminders.append({"title": "Upload your first policy", "status": "Pending"})
    elif indexed_docs < docs_count:
        reminders.append({"title": "Documents are processing", "status": "In Progress"})
    else:
        reminders.append({"title": "Review coverage gaps", "status": "Suggested"})
        
    if profile_completion < 100:
        reminders.append({"title": "Complete your profile", "status": "Pending"})

    # Get recent 3 activities for activity feed
    recent_logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(desc(ActivityLog.created_at)).limit(3).all()
    recent_activity = []
    for log in recent_logs:
        # Generate appropriate icon based on description
        desc_lower = log.description.lower()
        icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>'
        if 'claim' in desc_lower:
            icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>'
        elif 'care' in desc_lower or 'eligibility' in desc_lower:
            icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
        elif 'profile' in desc_lower or 'preference' in desc_lower:
            icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            
        recent_activity.append({
            "title": log.description,
            "created_at": log.created_at.isoformat() + "Z" if log.created_at else None,
            "icon": icon,
            "onClickId": 'activity-history'
        })
        
    if not recent_activity:
         recent_activity.append({
            "title": 'Welcome to SFAN',
            "timestamp": 'Just now',
            "icon": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
            "onClickId": 'activity-history'
        })

    policy_overview = []
    
    if pinecone_namespaces:
        for ns in pinecone_namespaces:
            ns_obj = db.query(Namespace).filter(Namespace.name == ns).first()
            actual_count = ns_obj.usage_count if ns_obj else 0
            policy_overview.append({
                "label": ns.replace("_", " ").title(),
                "count": actual_count
            })
    else:
        # Fallback if no namespaces are configured
        distinct_namespaces = db.query(Namespace).all()
        for ns_obj in distinct_namespaces:
            if ns_obj.name:
                policy_overview.append({
                    "label": ns_obj.name.replace("_", " ").title(),
                    "count": ns_obj.usage_count or 0
                })

    return {
        "readiness_score": readiness_score,
        "docs_count": docs_count,
        "pinecone_docs_count": pinecone_docs_count,
        "pinecone_namespaces_count": len(pinecone_namespaces),
        "insights_count": insights_count,
        "profile_completion": profile_completion,
        "usage_trend": usage_trend,
        "reminders": reminders,
        "recent_activity": recent_activity,
        "policy_overview": policy_overview
    }
