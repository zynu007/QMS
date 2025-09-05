from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum
from typing import Optional, Dict, Any
from datetime import date
from pydantic import BaseModel


class AuditType(enum.Enum):
    INTERNAL = "Internal"
    SUPPLIER_VENDOR = "Supplier/Vendor"
    REGULATORY = "Regulatory"
    CRO = "CRO"
    FOR_CAUSE = "For-Cause"
    PAI = "Pre-Approval Inspection (PAI)"
    SURVEILLANCE = "Surveillance"

class AuditStatus(enum.Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"
    CANCELLED = "Cancelled"

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String, unique=True, index=True)
    
    # Step 1: Initialization
    audit_title = Column(String, nullable=False)
    audit_type = Column(Enum(AuditType), nullable=False)
    audit_scope = Column(Text, nullable=False)
    audit_objective = Column(Text, nullable=False)
    
    # Step 2: Auditee Details
    auditee_name = Column(String, nullable=False)
    auditee_site_location = Column(String, nullable=False)
    auditee_country = Column(String, nullable=False)
    primary_contact_name = Column(String, nullable=False)
    primary_contact_email = Column(String)
    
    # Step 3: Scheduling & Team
    proposed_start_date = Column(Date)
    proposed_end_date = Column(Date)
    confirmed_start_date = Column(Date, nullable=False)
    confirmed_end_date = Column(Date, nullable=False)
    lead_auditor = Column(String, nullable=False)
    audit_team = Column(String)
    
    # Step 4: Audit Plan
    audit_criteria = Column(Text, nullable=False)
    audit_agenda = Column(Text)
    
    # Meta fields
    status = Column(Enum(AuditStatus), default=AuditStatus.PLANNED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "audit_id": self.audit_id,
            "audit_title": self.audit_title,
            "audit_type": self.audit_type.value if self.audit_type else None,
            "audit_scope": self.audit_scope,
            "audit_objective": self.audit_objective,
            "auditee_name": self.auditee_name,
            "auditee_site_location": self.auditee_site_location,
            "auditee_country": self.auditee_country,
            "primary_contact_name": self.primary_contact_name,
            "primary_contact_email": self.primary_contact_email,
            "proposed_start_date": self.proposed_start_date.isoformat() if self.proposed_start_date else None,
            "proposed_end_date": self.proposed_end_date.isoformat() if self.proposed_end_date else None,
            "confirmed_start_date": self.confirmed_start_date.isoformat() if self.confirmed_start_date else None,
            "confirmed_end_date": self.confirmed_end_date.isoformat() if self.confirmed_end_date else None,
            "lead_auditor": self.lead_auditor,
            "audit_team": self.audit_team,
            "audit_criteria": self.audit_criteria,
            "audit_agenda": self.audit_agenda,
            "status": self.status.value if self.status else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
class AIQueryRequest(BaseModel):
    query: str
    tool: str
    context: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    success: bool
    tool: str
    query: str
    result: Dict[str, Any]
    error: Optional[str] = None
