"""
Email Routes for Game Store Zarzis API
Provides endpoints for sending emails via MailerSend
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
from email_service import (
    send_booking_confirmation,
    send_contact_form_notification,
    send_service_request_notification,
    send_session_receipt,
    send_staff_invitation,
    send_password_reset_email,
)

router = APIRouter(prefix="/email", tags=["Email"])


class BookingConfirmationRequest(BaseModel):
    client_name: str
    client_email: EmailStr
    console_type: str
    session_type: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None


class ContactFormRequest(BaseModel):
    from_name: str
    from_email: EmailStr
    subject: str
    message: str


class ServiceRequestNotification(BaseModel):
    client_name: str
    client_phone: str
    device_type: str
    device_brand: str
    issue_description: str
    request_id: str
    status: Optional[str] = "pending"


class SessionReceiptRequest(BaseModel):
    client_name: str
    client_email: EmailStr
    console_type: str
    duration: str
    total_amount: float
    points_earned: int
    date: str


@router.post("/booking-confirmation")
async def api_send_booking_confirmation(request: BookingConfirmationRequest):
    """Send booking confirmation email to client"""
    success = send_booking_confirmation(
        client_name=request.client_name,
        client_email=request.client_email,
        console_type=request.console_type,
        session_type=request.session_type,
        preferred_date=request.preferred_date,
        preferred_time=request.preferred_time,
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"success": True, "message": "Booking confirmation sent"}


@router.post("/contact-form")
async def api_send_contact_form(request: ContactFormRequest):
    """Send contact form to store owner"""
    success = send_contact_form_notification(
        from_name=request.from_name,
        from_email=request.from_email,
        subject=request.subject,
        message=request.message,
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"success": True, "message": "Contact form sent"}


@router.post("/service-request")
async def api_send_service_request(request: ServiceRequestNotification):
    """Send service request notification to store"""
    success = send_service_request_notification(
        client_name=request.client_name,
        client_phone=request.client_phone,
        device_type=request.device_type,
        device_brand=request.device_brand,
        issue_description=request.issue_description,
        request_id=request.request_id,
        status=request.status or "pending",
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"success": True, "message": "Service request notification sent"}


@router.post("/session-receipt")
async def api_send_session_receipt(request: SessionReceiptRequest):
    """Send session receipt to client"""
    success = send_session_receipt(
        client_name=request.client_name,
        client_email=request.client_email,
        console_type=request.console_type,
        duration=request.duration,
        total_amount=request.total_amount,
        points_earned=request.points_earned,
        date=request.date,
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"success": True, "message": "Session receipt sent"}


class StaffInvitationRequest(BaseModel):
    email: EmailStr
    role: str
    password: str


@router.post("/staff-invitation")
async def api_send_staff_invitation(request: StaffInvitationRequest):
    """Send staff invitation email"""
    success = send_staff_invitation(
        email=request.email,
        role=request.role,
        password=request.password,
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"success": True, "message": "Staff invitation sent"}


class PasswordResetRequest(BaseModel):
    email: EmailStr
    lang: Optional[str] = "fr"


@router.post("/password-reset")
async def api_send_password_reset(request: PasswordResetRequest):
    """Send password reset email with magic link"""
    # Generate a secure token (in production, store this with expiry in database)
    reset_token = secrets.token_urlsafe(32)
    
    success = send_password_reset_email(
        to_email=request.email,
        reset_token=reset_token,
        lang=request.lang or "fr",
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    
    return {
        "success": True, 
        "message": "Password reset email sent",
        "token": reset_token  # In production, don't return this - store in DB instead
    }
