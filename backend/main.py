from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import models
import schemas
from database import SessionLocal, engine, get_db
from pydantic import ValidationError
from ai_service import QMSAIService
from pydantic import BaseModel
from models import AIResponse, AIQueryRequest

# Create database tables
models.Base.metadata.create_all(bind=engine)

ai_service = QMSAIService()

app = FastAPI(
    title="QMS Audit Management API",
    description="API for managing quality management system audits",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database with sample data"""
    db = SessionLocal()
    try:
        # Check if we need to seed data
        count = crud.get_audits_count(db)
        if count == 0:
            crud.seed_sample_data(db)
            print("Database seeded with sample data")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "QMS Audit Management API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/audits/", response_model=schemas.AuditResponse)
async def create_audit(audit: schemas.AuditCreate, db: Session = Depends(get_db)):
    """Create a new audit"""
    try:
        db_audit = crud.create_audit(db=db, audit=audit)
        return db_audit.to_dict()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/audits/", response_model=List[schemas.AuditListResponse])
async def read_audits(
    skip: int = 0,
    limit: int = 100,
    audit_id: Optional[str] = Query(None, description="Filter by audit ID"),
    audit_type: Optional[str] = Query(None, description="Filter by audit type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    lead_auditor: Optional[str] = Query(None, description="Filter by lead auditor"),
    site: Optional[str] = Query(None, description="Filter by site/country"),
    db: Session = Depends(get_db)
):
    """Retrieve audits with optional filtering"""
    try:
        audits = crud.get_audits(
            db=db,
            skip=skip,
            limit=limit,
            audit_id=audit_id,
            audit_type=audit_type,
            status=status,
            lead_auditor=lead_auditor,
            site=site
        )
        
        # Convert to list response format
        result = []
        for audit in audits:
            result.append({
                "id": audit.id,
                "audit_id": audit.audit_id,
                "audit_title": audit.audit_title,
                "audit_type": audit.audit_type.value if audit.audit_type else "",
                "status": audit.status.value if audit.status else "",
                "auditee_name": audit.auditee_name,
                "lead_auditor": audit.lead_auditor,
                "confirmed_end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else "",
                "auditee_country": audit.auditee_country
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/audits/{audit_id}", response_model=schemas.AuditResponse)
async def read_audit(audit_id: str, db: Session = Depends(get_db)):
    """Get a specific audit by audit_id"""
    db_audit = crud.get_audit(db, audit_id=audit_id)
    if db_audit is None:
        raise HTTPException(status_code=404, detail="Audit not found")
    return db_audit.to_dict()

@app.put("/audits/{audit_id}", response_model=schemas.AuditResponse)
async def update_audit(
    audit_id: str, 
    audit_update: schemas.AuditUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing audit"""
    try:
        db_audit = crud.update_audit(db=db, audit_id=audit_id, audit_update=audit_update)
        if db_audit is None:
            raise HTTPException(status_code=404, detail="Audit not found")
        return db_audit.to_dict()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/audits/{audit_id}")
async def delete_audit(audit_id: str, db: Session = Depends(get_db)):
    """Delete an audit"""
    success = crud.delete_audit(db=db, audit_id=audit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"message": "Audit deleted successfully"}

@app.get("/audits-summary")
async def get_audits_summary(db: Session = Depends(get_db)):
    """Get summary statistics for audits"""
    try:
        total_audits = crud.get_audits_count(db)
        planned_audits = len(crud.get_audits(db, status="Planned"))
        in_progress_audits = len(crud.get_audits(db, status="In Progress"))
        closed_audits = len(crud.get_audits(db, status="Closed"))
        
        return {
            "total": total_audits,
            "planned": planned_audits,
            "in_progress": in_progress_audits,
            "closed": closed_audits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    

@app.get("/ai/tools")
async def get_ai_tools():
    """Get available AI tools"""
    try:
        tools = ai_service.get_available_tools()
        return {"success": True, "tools": tools}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI tools: {str(e)}")

@app.post("/ai/query", response_model=AIResponse)
async def execute_ai_query(request: AIQueryRequest, db: Session = Depends(get_db)):
    """Execute AI query using specified tool"""
    try:
        result = await ai_service.execute_ai_tool(
            tool_name=request.tool,
            query=request.query,
            db=db,
            context=request.context
        )
        
        # Check if result contains error
        if "error" in result and result["error"]:
            return AIResponse(
                success=False,
                tool=request.tool,
                query=request.query,
                result=result,  # Include the full result with error details
                error=result["error"]
            )
        
        return AIResponse(
            success=result.get("success", True),  # Use the success from result
            tool=request.tool,
            query=request.query,
            result=result,
            error=None
        )
        
    except Exception as e:
        return AIResponse(
            success=False,
            tool=request.tool,
            query=request.query,
            result={"error": f"Server exception: {str(e)}"},
            error=f"AI query execution failed: {str(e)}"
        )

@app.post("/ai/chat")
async def ai_chat(request: dict, db: Session = Depends(get_db)):
    """General AI chat interface"""
    try:
        query = request.get("message", "")
        if not query:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Simple query routing based on keywords
        tool_routing = {
            "high-risk": "show_high_risk_events",
            "high risk": "show_high_risk_events", 
            "risk": "show_high_risk_events",
            "summary": "summarize_open_events",
            "summarize": "summarize_open_events",
            "next steps": "suggest_next_steps",
            "suggest": "suggest_next_steps",
            "recommend": "suggest_next_steps",
            "trends": "identify_trends",
            "pattern": "identify_trends",
            "notification": "generate_notification",
            "notify": "generate_notification",
            "draft": "generate_notification"
        }
        
        # Determine tool based on query content
        selected_tool = "summarize_open_events"  # default
        for keyword, tool in tool_routing.items():
            if keyword.lower() in query.lower():
                selected_tool = tool
                break
        
        result = await ai_service.execute_ai_tool(
            tool_name=selected_tool,
            query=query,
            db=db,
            context=request.get("context")
        )
        
        return {
            "success": True,
            "message": query,
            "tool_used": selected_tool,
            "response": result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Chat processing failed: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)