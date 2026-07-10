import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from backend.database.config import SessionLocal
from backend.models.document import Namespace

db = SessionLocal()

dummy_data = {
    "health_policy": 128,
    "regulatory_governance": 85,
    "vehicle_policy": 42,
    "home_folder": 15,
    "travel_policy": 8
}

for name, count in dummy_data.items():
    ns_obj = db.query(Namespace).filter(Namespace.name == name).first()
    if not ns_obj:
        ns_obj = Namespace(name=name, usage_count=count)
        db.add(ns_obj)
    else:
        ns_obj.usage_count = count

db.commit()
db.close()
print("Successfully seeded namespace usage data.")
