from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import Audit, AuditType, AuditStatus
from schemas import AuditCreate, AuditUpdate
import uuid
from datetime import datetime, date
from typing import List, Optional

def generate_audit_id() -> str:
    """Generate a unique audit ID"""
    current_year = datetime.now().year
    random_suffix = str(uuid.uuid4())[:8].upper()
    return f"AUD-{current_year}-{random_suffix}"

def create_audit(db: Session, audit: AuditCreate) -> Audit:
    """Create a new audit"""
    audit_id = generate_audit_id()
    
    db_audit = Audit(
        audit_id=audit_id,
        **audit.dict()
    )
    
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

def get_audit(db: Session, audit_id: str) -> Optional[Audit]:
    """Get audit by audit_id"""
    return db.query(Audit).filter(Audit.audit_id == audit_id).first()

def get_audit_by_id(db: Session, id: int) -> Optional[Audit]:
    """Get audit by database id"""
    return db.query(Audit).filter(Audit.id == id).first()

def get_audits(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    audit_id: Optional[str] = None,
    audit_type: Optional[str] = None,
    status: Optional[str] = None,
    lead_auditor: Optional[str] = None,
    site: Optional[str] = None
) -> List[Audit]:
    """Get audits with optional filtering"""
    query = db.query(Audit)
    
    # Apply filters
    if audit_id:
        query = query.filter(Audit.audit_id.contains(audit_id))
    
    if audit_type and audit_type != "All":
        try:
            audit_type_enum = AuditType(audit_type)
            query = query.filter(Audit.audit_type == audit_type_enum)
        except ValueError:
            pass
    
    if status and status != "All":
        try:
            status_enum = AuditStatus(status)
            query = query.filter(Audit.status == status_enum)
        except ValueError:
            pass
    
    if lead_auditor and lead_auditor != "All":
        query = query.filter(Audit.lead_auditor.contains(lead_auditor))
    
    if site and site != "All":
        query = query.filter(Audit.auditee_country.contains(site))
    
    return query.offset(skip).limit(limit).all()

def update_audit(db: Session, audit_id: str, audit_update: AuditUpdate) -> Optional[Audit]:
    """Update an existing audit"""
    db_audit = get_audit(db, audit_id)
    if not db_audit:
        return None
    
    update_data = audit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_audit, field, value)
    
    db.commit()
    db.refresh(db_audit)
    return db_audit

def delete_audit(db: Session, audit_id: str) -> bool:
    """Delete an audit"""
    db_audit = get_audit(db, audit_id)
    if not db_audit:
        return False
    
    db.delete(db_audit)
    db.commit()
    return True

def get_audits_count(db: Session) -> int:
    """Get total count of audits"""
    return db.query(Audit).count()

def seed_sample_data(db: Session):
    """Seed database with sample data for testing"""
    sample_audits = [
        {
            "audit_title": "Annual GMP Compliance for Mfg Line B",
            "audit_type": AuditType.INTERNAL,
            "audit_scope": "Manufacturing Line B GMP compliance review covering production processes, documentation, and quality control procedures for the fiscal year 2024.",
            "audit_objective": "To verify compliance with current Good Manufacturing Practice regulations and internal quality standards.",
            "auditee_name": "Manufacturing Line B",
            "auditee_site_location": "123 Pharma Way, Boston, MA 02101, USA",
            "auditee_country": "USA",
            "primary_contact_name": "John Smith",
            "primary_contact_email": "john.smith@company.com",
            "confirmed_start_date": date(2025, 5, 10),
            "confirmed_end_date": date(2025, 5, 14),
            "lead_auditor": "QA Manager",
            "audit_team": "Sarah Johnson, Michael Brown",
            "audit_criteria": "FDA 21 CFR Parts 210/211, ICH Q7, Company SOPs QA-001 through QA-015",
            "audit_agenda": "Day 1: Opening meeting, facility tour, documentation review\nDay 2: Production process review\nDay 3: Quality control procedures\nDay 4: Closing meeting and report preparation",
            "status": AuditStatus.PLANNED
        },
        {
            "audit_title": "Qualification Audit for API Inc.",
            "audit_type": AuditType.SUPPLIER_VENDOR,
            "audit_scope": "Comprehensive supplier qualification audit covering quality management system, manufacturing capabilities, and regulatory compliance.",
            "audit_objective": "To qualify API Inc. as an approved supplier for critical raw materials and assess their quality management system.",
            "auditee_name": "API Inc.",
            "auditee_site_location": "45 Industrial Park, Mumbai, Maharashtra 400001, India",
            "auditee_country": "India",
            "primary_contact_name": "Priya Patel",
            "primary_contact_email": "priya.patel@apiinc.com",
            "confirmed_start_date": date(2025, 5, 16),
            "confirmed_end_date": date(2025, 5, 20),
            "lead_auditor": "Supplier Quality",
            "audit_team": "David Wilson, Lisa Chen",
            "audit_criteria": "ISO 9001:2015, ICH Q7, FDA Guidelines for API Manufacturing",
            "audit_agenda": "Day 1: QMS review and management interview\nDay 2: Manufacturing facility inspection\nDay 3: Laboratory and testing procedures\nDay 4: Documentation review\nDay 5: Closing meeting and action items",
            "status": AuditStatus.PLANNED
        },
        {
            "audit_title": "QC Lab Data Integrity Review",
            "audit_type": AuditType.INTERNAL,
            "audit_scope": "Comprehensive review of data integrity practices in the Quality Control Laboratory, including electronic records, data backup, and audit trails.",
            "audit_objective": "To assess compliance with data integrity requirements and identify areas for improvement in laboratory data management.",
            "auditee_name": "QC Laboratory",
            "auditee_site_location": "789 Science Drive, Research Triangle, NC 27709, USA",
            "auditee_country": "USA",
            "primary_contact_name": "Dr. Emily Rodriguez",
            "primary_contact_email": "emily.rodriguez@company.com",
            "confirmed_start_date": date(2025, 4, 12),
            "confirmed_end_date": date(2025, 4, 16),
            "lead_auditor": "QA Specialist",
            "audit_team": "Robert Johnson, Amanda White",
            "audit_criteria": "FDA Guidance on Data Integrity, 21 CFR Part 11, Company SOP-IT-005",
            "audit_agenda": "Day 1: LIMS system review\nDay 2: Laboratory procedures and practices\nDay 3: Data backup and recovery procedures\nDay 4: Training records review\nDay 5: Final assessment and recommendations",
            "status": AuditStatus.CLOSED
        }
    ]
    
    for audit_data in sample_audits:
        existing = db.query(Audit).filter(Audit.audit_title == audit_data["audit_title"]).first()
        if not existing:
            audit_id = generate_audit_id()
            db_audit = Audit(audit_id=audit_id, **audit_data)
            db.add(db_audit)
    
    db.commit()