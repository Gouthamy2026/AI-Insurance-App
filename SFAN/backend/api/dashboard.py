from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import datetime
import calendar

from backend.database.config import get_db
from backend.models.document import Document
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    # Real data from DB
    docs_count = db.query(Document).count()
    indexed_docs = db.query(Document).filter(Document.status == "already_indexed").count()
    
    # Calculate readiness score based on indexed documents vs total
    readiness_score = int((indexed_docs / docs_count) * 100) if docs_count > 0 else 0
    
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
            
    total_policies = len(pinecone_namespaces) if pinecone_namespaces else 0

    # Reminders based on actual state
    reminders = []
    if docs_count == 0:
        reminders.append({"title": "Upload your first policy", "status": "Pending"})
    elif indexed_docs < docs_count:
        reminders.append({"title": "Documents are processing", "status": "In Progress"})
    else:
        reminders.append({"title": "All policies analyzed", "status": "Completed"})
        
    if profile_completion < 100:
        reminders.append({"title": "Complete your profile", "status": "Pending"})

    # Get recent 3 documents for activity feed
    recent_docs = db.query(Document).order_by(desc(Document.created_at)).limit(3).all()
    recent_activity = []
    for doc in recent_docs:
        recent_activity.append({
            "title": f"Policy Uploaded: {doc.filename}",
            "timestamp": doc.created_at.strftime("%b %d, %Y") if doc.created_at else "Recently",
            "icon": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
            "onClickId": 'insurance-locker'
        })
        
    if not recent_activity:
         recent_activity.append({
            "title": 'Welcome to SFAN',
            "timestamp": 'Just now',
            "icon": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
            "onClickId": 'activity-history'
        })

    # Policy Overview (Docs per namespace based on all available pinecone namespaces)
    namespace_counts = dict(db.query(Document.namespace, func.count(Document.id)).group_by(Document.namespace).all())
    policy_overview = []
    
    if pinecone_namespaces:
        for ns in pinecone_namespaces:
            policy_overview.append({
                "label": ns.replace("_", " ").title(),
                "count": namespace_counts.get(ns, 0)
            })
    else:
        # Fallback if no namespaces are configured
        for ns, count in namespace_counts.items():
            policy_overview.append({
                "label": ns.replace("_", " ").title() if ns else "Unknown",
                "count": count
            })

    return {
        "readiness_score": readiness_score,
        "docs_count": total_policies,
        "insights_count": insights_count,
        "profile_completion": profile_completion,
        "usage_trend": usage_trend,
        "reminders": reminders,
        "recent_activity": recent_activity,
        "policy_overview": policy_overview
    }
