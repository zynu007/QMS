from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date, datetime
from models import AuditType, AuditStatus

class AuditCreate(BaseModel):
    # Step 1: Initialization
    audit_title: str
    audit_type: AuditType
    audit_scope: str
    audit_objective: str
    
    # Step 2: Auditee Details
    auditee_name: str
    auditee_site_location: str
    auditee_country: str
    primary_contact_name: str
    primary_contact_email: Optional[str] = None
    
    # Step 3: Scheduling & Team
    proposed_start_date: Optional[date] = None
    proposed_end_date: Optional[date] = None
    confirmed_start_date: date
    confirmed_end_date: date
    lead_auditor: str
    audit_team: Optional[str] = None
    
    # Step 4: Audit Plan
    audit_criteria: str
    audit_agenda: Optional[str] = None

    @validator('primary_contact_email')
    def validate_email(cls, v):
        if v and v.strip():
            # Basic email validation
            if '@' not in v or '.' not in v:
                raise ValueError('Invalid email format')
        return v

    @validator('confirmed_end_date')
    def validate_dates(cls, v, values):
        if 'confirmed_start_date' in values and v <= values['confirmed_start_date']:
            raise ValueError('End date must be after start date')
        return v

    @validator('proposed_end_date')
    def validate_proposed_dates(cls, v, values):
        if v and 'proposed_start_date' in values and values['proposed_start_date'] and v <= values['proposed_start_date']:
            raise ValueError('Proposed end date must be after proposed start date')
        return v

class AuditUpdate(BaseModel):
    audit_title: Optional[str] = None
    audit_type: Optional[AuditType] = None
    audit_scope: Optional[str] = None
    audit_objective: Optional[str] = None
    auditee_name: Optional[str] = None
    auditee_site_location: Optional[str] = None
    auditee_country: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[str] = None
    proposed_start_date: Optional[date] = None
    proposed_end_date: Optional[date] = None
    confirmed_start_date: Optional[date] = None
    confirmed_end_date: Optional[date] = None
    lead_auditor: Optional[str] = None
    audit_team: Optional[str] = None
    audit_criteria: Optional[str] = None
    audit_agenda: Optional[str] = None
    status: Optional[AuditStatus] = None

class AuditResponse(BaseModel):
    id: int
    audit_id: str
    audit_title: str
    audit_type: str
    audit_scope: str
    audit_objective: str
    auditee_name: str
    auditee_site_location: str
    auditee_country: str
    primary_contact_name: str
    primary_contact_email: Optional[str]
    proposed_start_date: Optional[str]
    proposed_end_date: Optional[str]
    confirmed_start_date: str
    confirmed_end_date: str
    lead_auditor: str
    audit_team: Optional[str]
    audit_criteria: str
    audit_agenda: Optional[str]
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True

class AuditListResponse(BaseModel):
    id: int
    audit_id: str
    audit_title: str
    audit_type: str
    status: str
    auditee_name: str
    lead_auditor: str
    confirmed_end_date: str
    auditee_country: str

    class Config:
        from_attributes = True