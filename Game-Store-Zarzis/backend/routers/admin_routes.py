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

supabase: Client = create_client(url, key)

@router.get("/status")
async def get_admin_status():
    """Diagnostic endpoint to verify Supabase service role connectivity"""
    try:
        # Try to read from a restricted table to verify service role permissions
        res = supabase.table("user_roles").select("count").limit(1).execute()
        return {
            "status": "online",
            "supabase_connectivity": "ok",
            "service_role_authorized": True
        }
    except Exception as e:
        return {
            "status": "degraded",
            "supabase_connectivity": "failed",
            "error": str(e)
        }

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
            # Using keyword arguments is safer in newer SDK versions
            user_response = supabase.auth.admin.create_user(
                email=request_data.email,
                password=request_data.password,
                email_confirm=True,
                user_metadata={"full_name": request_data.full_name}
            )
            user_id = user_response.user.id
        except Exception as auth_error:
            error_str = str(auth_error)
            print(f"Auth Admin Error: {error_str}")
            # Check for common errors
            if "already registered" in error_str.lower() or "already exists" in error_str.lower():
                raise HTTPException(status_code=400, detail="Ce membre du personnel est déjà enregistré.")
            if "weak_password" in error_str.lower() or "password" in error_str.lower():
                raise HTTPException(status_code=400, detail=f"Mot de passe invalide: {error_str}")
            
            # If it's already an HTTPException, re-raise it
            if isinstance(auth_error, HTTPException):
                raise auth_error
                
            raise HTTPException(status_code=400, detail=f"Erreur Supabase Auth: {error_str}")

        # 2. Assign Role
        try:
            supabase.table("user_roles").insert({
                "user_id": user_id,
                "role": request_data.role
            }).execute()
        except Exception as role_error:
            print(f"Failed to assign role: {role_error}")
            # Clean up user if role assignment fails
            try:
                supabase.auth.admin.delete_user(user_id)
            except:
                pass
            raise HTTPException(status_code=400, detail=f"Impossible d'assigner le rôle: {str(role_error)}")

        # 3. Create or Update Profile
        # We use upsert because a database trigger might have already created a partial profile
        try:
            supabase.table("profiles").upsert({
                "id": user_id,
                "full_name": request_data.full_name,
                "phone": request_data.phone,
                "is_active": True,
                "updated_at": datetime.datetime.now().isoformat()
            }).execute()
        except Exception as profile_error:
            print(f"Profile upsert error: {profile_error}")
            # Non-critical, but logged
            pass
            
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
