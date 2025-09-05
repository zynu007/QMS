import os
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import google.generativeai as genai
from models import Audit, AuditStatus, AuditType
import crud

class QMSAIService:
    def __init__(self):
        # Configure Gemini API
        api_key = "api key here"
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # AI Tools definitions
        self.tools = {
            "show_high_risk_events": {
                "name": "Show High-Risk Events",
                "description": "Identify and filter audits based on severity, priority, and risk factors",
                "icon": "alert-triangle"
            },
            "summarize_open_events": {
                "name": "Summarize Open Events",
                "description": "Provide a summary of open/planned audits for the specified time period",
                "icon": "file-text"
            },
            "suggest_next_steps": {
                "name": "Suggest Next Steps",
                "description": "Get AI recommendations for specific audit actions and follow-ups",
                "icon": "lightbulb"
            },
            "identify_trends": {
                "name": "Identify Audit Trends", 
                "description": "Analyze audit patterns and trends across different types and locations",
                "icon": "trending-up"
            },
            "generate_notification": {
                "name": "Generate Notification",
                "description": "Create draft notifications for audit communications and closures",
                "icon": "bell"
            }
        }

    def _extract_json_from_response(self, response_text: str) -> Dict[str, Any]:
        """Extract JSON from AI response, handling various formats"""
        try:
            # First try direct JSON parsing
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        try:
            # Look for JSON blocks in markdown format
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            
            # Look for JSON blocks without language identifier
            json_match = re.search(r'```\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            
            # Look for JSON content between curly braces
            json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
                
        except json.JSONDecodeError:
            pass
        
        # If all JSON parsing fails, return a structured fallback
        return {
            "error": "Could not parse JSON response",
            "raw_response": response_text[:500],  # Truncate for debugging
            "fallback": True
        }

    def _create_fallback_response(self, tool_name: str, query: str, raw_response: str) -> Dict[str, Any]:
        """Create a fallback response when JSON parsing fails"""
        return {
            "tool": tool_name,
            "query": query,
            "ai_response": raw_response,
            "success": False,
            "error": "AI returned non-JSON response. Check raw response for details."
        }

    async def execute_ai_tool(self, tool_name: str, query: str, db: Session, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute AI tool based on tool name and query"""
        try:
            if tool_name == "show_high_risk_events":
                return await self._show_high_risk_events(query, db)
            elif tool_name == "summarize_open_events":
                return await self._summarize_open_events(query, db)
            elif tool_name == "suggest_next_steps":
                return await self._suggest_next_steps(query, db, context)
            elif tool_name == "identify_trends":
                return await self._identify_trends(query, db)
            elif tool_name == "generate_notification":
                return await self._generate_notification(query, db, context)
            else:
                return {"error": f"Unknown tool: {tool_name}"}
                
        except Exception as e:
            return {"error": f"AI service error: {str(e)}"}

    async def _show_high_risk_events(self, query: str, db: Session) -> Dict[str, Any]:
        """Identify high-risk audit events"""
        try:
            # Get all audits
            audits = crud.get_audits(db, limit=1000)
            
            # Prepare audit data for AI analysis
            audit_data = []
            for audit in audits:
                audit_info = {
                    "audit_id": audit.audit_id,
                    "title": audit.audit_title,
                    "type": audit.audit_type.value if audit.audit_type else "",
                    "status": audit.status.value if audit.status else "",
                    "auditee": audit.auditee_name,
                    "country": audit.auditee_country,
                    "start_date": audit.confirmed_start_date.isoformat() if audit.confirmed_start_date else "",
                    "end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else "",
                    "lead_auditor": audit.lead_auditor,
                    "scope": audit.audit_scope
                }
                audit_data.append(audit_info)

            # Create AI prompt with explicit JSON format instructions
            prompt = f"""
IMPORTANT: You must respond with ONLY valid JSON, no additional text, explanations, or markdown formatting.

As a QMS expert, analyze the audit data and identify high-risk events. Return ONLY this JSON structure:

{{
    "high_risk_audits": [
        {{
            "audit_id": "string",
            "risk_score": 8,
            "risk_factors": ["Regulatory audit", "Critical materials"],
            "recommendations": ["Immediate review required"]
        }}
    ],
    "summary": "Brief summary of findings",
    "total_high_risk": 3
}}

Query: {query}
Audit Data: {json.dumps(audit_data[:10])}  # Limit data to prevent token overflow

Criteria for high-risk:
- Regulatory audits (score 9-10)
- Supplier/Vendor audits with critical materials (score 7-8)
- Overdue or delayed audits (score 6-8)
- Audits with broad scope (score 6-7)
- Multi-site or international audits (score 5-7)

Return only the JSON response:
"""

            response = self.model.generate_content(prompt)
            ai_result = self._extract_json_from_response(response.text)
            
            # Handle fallback response
            if ai_result.get("fallback"):
                return self._create_fallback_response("show_high_risk_events", query, response.text)
            
            # Filter actual audits based on AI recommendations
            high_risk_ids = [item.get("audit_id") for item in ai_result.get("high_risk_audits", []) if item.get("audit_id")]
            filtered_audits = [audit for audit in audits if audit.audit_id in high_risk_ids]
            
            return {
                "tool": "show_high_risk_events",
                "query": query,
                "ai_analysis": ai_result,
                "filtered_audits": [
                    {
                        "id": audit.id,
                        "audit_id": audit.audit_id,
                        "audit_title": audit.audit_title,
                        "audit_type": audit.audit_type.value if audit.audit_type else "",
                        "status": audit.status.value if audit.status else "",
                        "auditee_name": audit.auditee_name,
                        "lead_auditor": audit.lead_auditor,
                        "confirmed_end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else "",
                        "auditee_country": audit.auditee_country
                    } for audit in filtered_audits
                ],
                "success": True
            }
            
        except Exception as e:
            return {
                "tool": "show_high_risk_events",
                "query": query,
                "success": False,
                "error": f"Processing error: {str(e)}"
            }

    async def _summarize_open_events(self, query: str, db: Session) -> Dict[str, Any]:
        """Summarize open audit events"""
        try:
            # Get open/planned audits from last month
            one_month_ago = date.today() - timedelta(days=30)
            audits = crud.get_audits(db, limit=1000)
            
            # Filter for open events in timeframe
            open_audits = [
                audit for audit in audits 
                if audit.status in [AuditStatus.PLANNED, AuditStatus.IN_PROGRESS] 
                and audit.created_at and audit.created_at.date() >= one_month_ago
            ]

            audit_summary = []
            for audit in open_audits:
                audit_summary.append({
                    "audit_id": audit.audit_id,
                    "title": audit.audit_title,
                    "type": audit.audit_type.value if audit.audit_type else "",
                    "status": audit.status.value if audit.status else "",
                    "auditee": audit.auditee_name,
                    "lead_auditor": audit.lead_auditor,
                    "start_date": audit.confirmed_start_date.isoformat() if audit.confirmed_start_date else "",
                    "end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else ""
                })

            prompt = f"""
IMPORTANT: Respond with ONLY valid JSON, no markdown or additional text.

Analyze open audits and return this exact JSON structure:

{{
    "executive_summary": "Brief summary of open audits",
    "breakdown": {{
        "by_type": {{"Internal": 5, "Regulatory": 2}},
        "by_status": {{"Planned": 3, "In Progress": 4}}
    }},
    "upcoming_deadlines": ["Audit AUD-2025-001 due Dec 15", "Audit AUD-2025-002 due Jan 10"],
    "resource_insights": "Team allocation and workload insights",
    "key_concerns": ["Concern 1", "Concern 2"],
    "total_open": {len(open_audits)}
}}

Query: {query}
Open Audits Data: {json.dumps(audit_summary[:20])}

Return only JSON:
"""

            response = self.model.generate_content(prompt)
            ai_result = self._extract_json_from_response(response.text)
            
            if ai_result.get("fallback"):
                return self._create_fallback_response("summarize_open_events", query, response.text)
            
            return {
                "tool": "summarize_open_events",
                "query": query,
                "ai_analysis": ai_result,
                "audit_count": len(open_audits),
                "audits": audit_summary,
                "success": True
            }
            
        except Exception as e:
            return {
                "tool": "summarize_open_events", 
                "query": query,
                "success": False,
                "error": f"Processing error: {str(e)}"
            }

    async def _suggest_next_steps(self, query: str, db: Session, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Suggest next steps for specific audit"""
        try:
            audit_id = context.get("audit_id") if context else None
            
            if audit_id:
                audit = crud.get_audit(db, audit_id)
                if not audit:
                    return {"error": f"Audit {audit_id} not found"}
            else:
                # Extract audit ID from query if not in context
                import re
                audit_id_match = re.search(r'(AUD-\d{4}-[A-Z0-9]+)', query)
                if audit_id_match:
                    audit_id = audit_id_match.group(1)
                    audit = crud.get_audit(db, audit_id)
                else:
                    return {"error": "No audit ID specified"}

            if not audit:
                return {"error": f"Audit {audit_id} not found"}

            audit_details = {
                "audit_id": audit.audit_id,
                "title": audit.audit_title,
                "type": audit.audit_type.value if audit.audit_type else "",
                "status": audit.status.value if audit.status else "",
                "scope": audit.audit_scope,
                "objective": audit.audit_objective,
                "auditee": audit.auditee_name,
                "country": audit.auditee_country,
                "lead_auditor": audit.lead_auditor,
                "audit_team": audit.audit_team,
                "start_date": audit.confirmed_start_date.isoformat() if audit.confirmed_start_date else "",
                "end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else "",
                "criteria": audit.audit_criteria,
                "agenda": audit.audit_agenda
            }

            prompt = f"""
IMPORTANT: Return ONLY valid JSON, no markdown or explanations.

Provide recommendations for this audit. Return this exact JSON structure:

{{
    "immediate_actions": ["Action 1", "Action 2"],
    "medium_term_actions": ["Action 1", "Action 2"],
    "long_term_considerations": ["Consideration 1"],
    "risk_mitigation": ["Risk strategy 1"],
    "resource_requirements": ["Resource need 1"],
    "key_stakeholders": ["Stakeholder 1"],
    "timeline_recommendations": "Timeline guidance"
}}

Query: {query}
Audit: {json.dumps(audit_details)}

Return only JSON:
"""

            response = self.model.generate_content(prompt)
            ai_result = self._extract_json_from_response(response.text)
            
            if ai_result.get("fallback"):
                return self._create_fallback_response("suggest_next_steps", query, response.text)
            
            return {
                "tool": "suggest_next_steps",
                "query": query,
                "audit": audit_details,
                "ai_recommendations": ai_result,
                "success": True
            }
            
        except Exception as e:
            return {
                "tool": "suggest_next_steps",
                "query": query,
                "success": False,
                "error": f"Processing error: {str(e)}"
            }

    async def _identify_trends(self, query: str, db: Session) -> Dict[str, Any]:
        """Identify trends in audit data"""
        try:
            audits = crud.get_audits(db, limit=1000)
            
            # Prepare trend analysis data
            trend_data = []
            for audit in audits:
                trend_data.append({
                    "audit_id": audit.audit_id,
                    "type": audit.audit_type.value if audit.audit_type else "",
                    "status": audit.status.value if audit.status else "",
                    "country": audit.auditee_country,
                    "lead_auditor": audit.lead_auditor,
                    "created_date": audit.created_at.isoformat() if audit.created_at else "",
                    "start_date": audit.confirmed_start_date.isoformat() if audit.confirmed_start_date else "",
                    "end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else ""
                })

            prompt = f"""
IMPORTANT: Return ONLY valid JSON with no additional text.

Analyze trends and return this exact JSON structure:

{{
    "frequency_trends": "Trend description",
    "type_distribution": {{"Internal": 45, "Regulatory": 30, "Supplier": 25}},
    "geographic_distribution": {{"US": 40, "Europe": 35, "Asia": 25}},
    "auditor_workload": {{"John Smith": 12, "Jane Doe": 8}},
    "seasonal_patterns": "Pattern description", 
    "completion_metrics": {{"average_days": 14, "completion_rate": 85}},
    "risk_areas": ["Risk area 1", "Risk area 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}}

Query: {query}
Data: {json.dumps(trend_data[:30])}

Return only JSON:
"""

            response = self.model.generate_content(prompt)
            ai_result = self._extract_json_from_response(response.text)
            
            if ai_result.get("fallback"):
                return self._create_fallback_response("identify_trends", query, response.text)
            
            return {
                "tool": "identify_trends",
                "query": query,
                "ai_analysis": ai_result,
                "data_points": len(trend_data),
                "success": True
            }
            
        except Exception as e:
            return {
                "tool": "identify_trends",
                "query": query,
                "success": False,
                "error": f"Processing error: {str(e)}"
            }

    async def _generate_notification(self, query: str, db: Session, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate notification drafts"""
        try:
            notification_type = context.get("type", "general") if context else "general"
            audit_id = context.get("audit_id") if context else None

            audit_details = {}
            if audit_id:
                audit = crud.get_audit(db, audit_id)
                if audit:
                    audit_details = {
                        "audit_id": audit.audit_id,
                        "title": audit.audit_title,
                        "type": audit.audit_type.value if audit.audit_type else "",
                        "status": audit.status.value if audit.status else "",
                        "auditee": audit.auditee_name,
                        "lead_auditor": audit.lead_auditor,
                        "start_date": audit.confirmed_start_date.isoformat() if audit.confirmed_start_date else "",
                        "end_date": audit.confirmed_end_date.isoformat() if audit.confirmed_end_date else "",
                        "primary_contact": audit.primary_contact_name,
                        "contact_email": audit.primary_contact_email
                    }

            prompt = f"""
IMPORTANT: Return ONLY valid JSON with no markdown formatting.

Generate notifications and return this exact JSON structure:

{{
    "notifications": {{
        "commencement": {{
            "subject": "Audit Commencement Notice",
            "body": "Email body text",
            "recipients": ["primary.contact@company.com"]
        }},
        "completion": {{
            "subject": "Audit Completion Notice",
            "body": "Email body text",
            "recipients": ["primary.contact@company.com"]
        }},
        "follow_up": {{
            "subject": "Action Items Follow-up",
            "body": "Email body text",
            "recipients": ["primary.contact@company.com"]
        }},
        "closure": {{
            "subject": "Audit Closure Notification",
            "body": "Email body text", 
            "recipients": ["primary.contact@company.com"]
        }},
        "escalation": {{
            "subject": "Audit Escalation Required",
            "body": "Email body text",
            "recipients": ["manager@company.com"]
        }}
    }},
    "recommended_type": "completion"
}}

Query: {query}
Type: {notification_type}
Audit: {json.dumps(audit_details) if audit_details else "General notification"}

Return only JSON:
"""

            response = self.model.generate_content(prompt)
            ai_result = self._extract_json_from_response(response.text)
            
            if ai_result.get("fallback"):
                return self._create_fallback_response("generate_notification", query, response.text)
            
            return {
                "tool": "generate_notification",
                "query": query,
                "notification_type": notification_type,
                "audit_details": audit_details,
                "ai_generated": ai_result,
                "success": True
            }
            
        except Exception as e:
            return {
                "tool": "generate_notification",
                "query": query,
                "success": False,
                "error": f"Processing error: {str(e)}"
            }

    def get_available_tools(self) -> List[Dict[str, str]]:
        """Return list of available AI tools"""
        return [
            {
                "id": tool_id,
                "name": tool_info["name"],
                "description": tool_info["description"],
                "icon": tool_info["icon"]
            }
            for tool_id, tool_info in self.tools.items()
        ]