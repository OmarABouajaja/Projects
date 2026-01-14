from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Optional
from pydantic import BaseModel
import datetime
from supabase import create_client, Client
import os
import json
from utils.security import require_admin
from utils.limiter import limiter

# Protect all routes in this router
router = APIRouter(
    prefix="/api/admin", 
    tags=["admin"],
    dependencies=[Depends(require_admin)]
)

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

class CleanupRequest(BaseModel):
    days_to_keep: int
    tables: list[str] = ["gaming_sessions", "sales", "expenses"]

@router.delete("/cleanup")
@limiter.limit("5/hour")
async def cleanup_data(request: Request, body: CleanupRequest):
    request_data = body
    """
    Deletes data older than X days from specified tables to free up space.
    """
    try:
        cutoff_date = (datetime.datetime.now() - datetime.timedelta(days=request_data.days_to_keep)).isoformat()
        
        results = {}
        
        # Hard warning: protecting critical tables not in list
        allowed_tables = ["gaming_sessions", "sales", "expenses", "audit_logs"]
        
        for table in request_data.tables:
            if table not in allowed_tables:
                continue
                
            # Perform deletion
            # Note: Cascade delete should handle related rows (e.g. session_pricing) if configured in DB
            # Otherwise we might need specific order.
            
            # Using Supabase/Postgrest filter
            response = supabase.table(table).delete().lt("created_at", cutoff_date).execute()
            # Count isn't always returned directly depending on headers, but we can assume success if no error
            results[table] = "Cleanup executed"

        return {"status": "success", "str(cutoff_date)": cutoff_date, "details": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
@limiter.limit("5/hour")
async def export_data(request: Request):
    """
    Exports core data as JSON for backup.
    LIMITATION: This is a simple implementation. For large datasets, 
    streaming response or pagination is required.
    """
    try:
        backup = {}
        tables = ["gaming_sessions", "sales", "expenses", "clients", "products", "services"]
        
        for table in tables:
            # Fetch last 1000 records for now to prevent timeouts in this simple version
            # Real backup needs full dump
            response = supabase.table(table).select("*").order("created_at", desc=True).limit(1000).execute()
            backup[table] = response.data
            
        return backup
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class CreateStaffRequest(BaseModel):
    email: str
    password: str
    role: str # 'owner' or 'worker'
    phone: Optional[str] = None
    full_name: Optional[str] = "Staff Member"


@router.post("/staff")
@limiter.limit("10/minute")
async def create_staff_member(request: Request, body: CreateStaffRequest):
    request_data = body
    """
    Creates a new staff member:
    1. Creates Auth User (via Admin API)
    2. Assigns Role
    3. Creates Profile
    4. Sends Invitation Email
    """
    try:
        # 1. Create Auth User
        # Note: supabase-py admin usage might vary by version. 
        # Using safely wrapped call or raw request if needed.
        # Assuming supabase.auth.admin.create_user works.
        
        attributes = {
            "email": request_data.email,
            "password": request_data.password,
            "email_confirm": True
        }
        
        # User metadata
        user_metadata = {"full_name": request_data.full_name}
        attributes["user_metadata"] = user_metadata
        
        try:
            # create_user is the admin method
            user_response = supabase.auth.admin.create_user(attributes)
            user_id = user_response.user.id
        except Exception as auth_error:
            # Check if user already exists
            if "already registered" in str(auth_error):
                raise HTTPException(status_code=400, detail="User already exists")
            raise auth_error

        # 2. Assign Role
        try:
            supabase.table("user_roles").insert({
                "user_id": user_id,
                "role": request_data.role
            }).execute()
        except Exception as role_error:
            # Rollback (delete user) if role assignment fails? 
            # ideally yes, but for now just logging
            print(f"Failed to assign role: {role_error}")
            # Try to clean up user
            supabase.auth.admin.delete_user(user_id)
            raise HTTPException(status_code=500, detail="Failed to assign role")

        # 3. Create Profile
        try:
            supabase.table("profiles").insert({
                "id": user_id,
                "full_name": request_data.full_name,
                "phone": request_data.phone,
                "is_active": True
            }).execute()
        except Exception as profile_error:
            print(f"Failed to create profile: {profile_error}")
            # Non-critical, but good to have
            
        # 4. Send Invitation Email
        # We import here to avoid circular dependencies if simple structure
        from email_service import send_staff_invitation
        
        email_sent = send_staff_invitation(
            email=request_data.email,
            role=request_data.role,
            password=request_data.password
        )
        
        return {
            "status": "success", 
            "user_id": user_id, 
            "email_sent": email_sent,
            "message": "Staff member created and invited successfully"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Create staff error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
