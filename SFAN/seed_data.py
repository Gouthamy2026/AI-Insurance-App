import os
import sys
import logging
from datetime import datetime, timedelta

# Ensure the backend module is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.config import SessionLocal, engine, Base
from backend.models.document import Document, Namespace
from backend.services.embedding_service import get_embeddings
from backend.services.pinecone_service import get_pinecone_index

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock Data
POLICIES = [
    {
        "filename": "Comprehensive_Health_Policy_2025.pdf",
        "file_type": "application/pdf",
        "namespace": "health_policy",
        "text": """
        COMPREHENSIVE HEALTH INSURANCE POLICY 2025
        Coverage: This policy covers inpatient hospitalization, pre and post-hospitalization expenses, day care procedures, and domiciliary hospitalization.
        Exclusions: Pre-existing diseases are not covered for the first 24 months. Cosmetic surgery, dental treatments (unless required due to accident), and self-inflicted injuries are excluded.
        Room Rent Limit: 1% of sum insured per day for normal room, 2% for ICU.
        Co-payment: A 10% co-payment applies for insured persons above 65 years of age.
        """
    },
    {
        "filename": "Motor_Comprehensive_Cover.pdf",
        "file_type": "application/pdf",
        "namespace": "vehicle_policy",
        "text": """
        MOTOR COMPREHENSIVE COVER TERMS
        Coverage: This policy provides coverage against own damage to the vehicle due to accidents, fire, theft, natural calamities, and third-party liability for bodily injury and property damage.
        Depreciation: Depreciation applies to plastic (50%), rubber (50%), and glass parts (0%) during claims. Zero Depreciation add-on covers full parts replacement.
        No Claim Bonus (NCB): A 20% discount on the premium is awarded for the first claim-free year, up to 50% for 5 consecutive claim-free years.
        Exclusions: Driving without a valid license, driving under the influence of alcohol, and using a private vehicle for commercial purposes will void the claim.
        """
    },
    {
        "filename": "Life_Wealth_Protection_Terms.pdf",
        "file_type": "application/pdf",
        "namespace": "life_wealth_policy",
        "text": """
        LIFE WEALTH PROTECTION COVER
        Benefit: In the event of the life assured's demise during the policy term, the death benefit (Sum Assured + accrued bonuses) will be paid to the nominee.
        Maturity: If the life assured survives the policy term, the maturity benefit (Sum Assured + terminal bonus) will be paid out as a lump sum or regular income.
        Surrender Value: The policy acquires a guaranteed surrender value after payment of 3 full years' premiums.
        Grace Period: A grace period of 30 days is allowed for annual premium payments. If premium is not paid within the grace period, the policy will lapse.
        """
    },
    {
        "filename": "Regulatory_Governance_Guidelines.pdf",
        "file_type": "application/pdf",
        "namespace": "regulatory_governance",
        "text": """
        REGULATORY GOVERNANCE GUIDELINES
        Compliance: All operations must comply with the local insurance regulatory authority's guidelines.
        Audits: Regular internal and external audits are mandatory to ensure transparency and accountability.
        Reporting: Annual financial and operational reports must be submitted within 90 days of the fiscal year-end.
        """
    },
    {
        "filename": "Home_Folder_Contents_Insurance.pdf",
        "file_type": "application/pdf",
        "namespace": "home_folder",
        "text": """
        HOME CONTENTS INSURANCE
        Coverage: Protects personal belongings inside the home against theft, fire, and natural disasters.
        Valuation: Claims are settled based on the replacement cost or actual cash value, depending on the policy terms.
        Exclusions: Wear and tear, intentional damage, and high-value items (like jewelry) unless specifically scheduled.
        """
    },
    {
        "filename": "Banking_Governance_Standards.pdf",
        "file_type": "application/pdf",
        "namespace": "banking_governance",
        "text": """
        BANKING GOVERNANCE STANDARDS
        Risk Management: Banks must maintain adequate capital reserves to cover potential loan losses.
        Customer Protection: Fair lending practices and clear disclosure of fees and interest rates are required.
        Data Security: Customer financial data must be protected using industry-standard encryption.
        """
    },
    {
        "filename": "Travel_Policy_Coverage.pdf",
        "file_type": "application/pdf",
        "namespace": "travel_policy",
        "text": """
        TRAVEL INSURANCE POLICY
        Medical Emergencies: Covers unexpected medical expenses incurred while traveling abroad.
        Trip Cancellation: Reimburses non-refundable trip costs if canceled due to a covered reason (e.g., illness).
        Lost Baggage: Provides compensation for lost, stolen, or damaged luggage during transit.
        """
    }
]

def seed_database():
    logger.info("Starting Seeder...")
    
    # Initialize DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        index = get_pinecone_index()
        
        for i, policy in enumerate(POLICIES):
            # Check if namespace exists in db
            ns_record = db.query(Namespace).filter(Namespace.name == policy["namespace"]).first()
            if not ns_record:
                ns_record = Namespace(name=policy["namespace"], description="Mock namespace for " + policy["namespace"])
                db.add(ns_record)
                db.commit()
            
            # Check if doc exists
            doc = db.query(Document).filter(Document.filename == policy["filename"]).first()
            if not doc:
                doc = Document(
                    filename=policy["filename"],
                    file_type=policy["file_type"],
                    namespace=policy["namespace"],
                    status="pending_ingestion"
                )
                
                # Make the created_at slightly staggered so the chart has data over time
                doc.created_at = datetime.utcnow() - timedelta(days=i*30)
                
                db.add(doc)
                db.commit()
                db.refresh(doc)
            
            logger.info("Processing {} (ID: {})".format(policy["filename"], doc.id))
            
            # Text Chunking (Simple)
            words = policy["text"].split()
            chunk_size = 50
            overlap = 10
            chunks = []
            for j in range(0, len(words), chunk_size - overlap):
                chunk_words = words[j:j + chunk_size]
                if chunk_words:
                    chunks.append(" ".join(chunk_words))
                
            logger.info("Generated {} chunks.".format(len(chunks)))
            
            if chunks:
                # Embeddings
                embeddings = get_embeddings(chunks, input_type="passage")
                
                # Pinecone Upsert
                vectors = []
                for k, embedding in enumerate(embeddings):
                    vector_id = "doc_{}_chunk_{}".format(doc.id, k)
                    metadata = {"text": chunks[k], "filename": doc.filename, "document_id": doc.id}
                    vectors.append((vector_id, embedding, metadata))
                    
                index.upsert(vectors=vectors, namespace=policy["namespace"])
                logger.info("Upserted vectors to Pinecone namespace: {}".format(policy["namespace"]))
            
            doc.status = "already_indexed"
            db.commit()
            
        logger.info("Seeding Complete!")
        
    except Exception as e:
        logger.error("Error during seeding: {}".format(e))
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
