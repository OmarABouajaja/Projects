"""
MailerSend Email Service (SDK v2.0.0)

IMPORTANT: MailerSend requires server-side integration (API key protection)
This file provides backend integration for the FastAPI server.

Free Tier: 3,000 emails/month
See: https://www.mailersend.com/
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from mailersend import MailerSendClient, EmailRequest, EmailContact
from typing import Optional, List
import os

# Get API key from environment
MAILERSEND_API_KEY = os.getenv("MAILERSEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "info@test-r9084zv1z1xgw63d.mlsender.net")
FROM_NAME = "Game Store Zarzis"

# SMTP Configuration (Fallback)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.mailersend.net")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

# Store email for receiving notifications
STORE_EMAIL = "game.store.zarzis@gmail.com"

# Initialize MailerSend Client
mailer = MailerSendClient(MAILERSEND_API_KEY) if MAILERSEND_API_KEY else None

def send_email_core(subject: str, recipient_email: str, recipient_name: str, html_content: str, text_content: str) -> bool:
    """Core sending logic: Tries SDK first, then SMTP"""
    
    # 1. Try MailerSend SDK if API key exists
    if mailer:
        try:
            sender = EmailContact(email=FROM_EMAIL, name=FROM_NAME)
            recipient = EmailContact(email=recipient_email, name=recipient_name)
            
            email_request = EmailRequest(
                from_email=sender,
                to=[recipient],
                subject=subject,
                html=html_content,
                text=text_content
            )
            mailer.email.send(email_request)
            return True
        except Exception as sdk_error:
            print(f"MailerSend SDK Failed: {sdk_error}. Falling back to SMTP...")

    # 2. Try SMTP
    if SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
            msg["To"] = f"{recipient_name} <{recipient_email}>"

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(FROM_EMAIL, recipient_email, msg.as_string())
            print(f"Email sent via SMTP to {recipient_email}")
            return True
        except Exception as smtp_error:
            print(f"SMTP Failed: {smtp_error}")
            return False
            
    return False


def send_booking_confirmation(
    client_name: str,
    client_email: str,
    console_type: str,
    session_type: str,
    preferred_date: Optional[str] = None,
    preferred_time: Optional[str] = None,
) -> bool:
    """Send booking confirmation to client"""
    date_li = f"<li style='padding: 10px; background: white; margin: 5px 0; border-radius: 5px;'><strong>Date:</strong> {preferred_date}</li>" if preferred_date else ""
    time_li = f"<li style='padding: 10px; background: white; margin: 5px 0; border-radius: 5px;'><strong>Heure:</strong> {preferred_time}</li>" if preferred_time else ""
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Bonjour {client_name}!</h2>
            <p>Votre reservation a ete confirmee:</p>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                    <strong>Console:</strong> {console_type}
                </li>
                <li style="padding: 10px; background: white; margin: 5px 0; border-radius: 5px;">
                    <strong>Type:</strong> {session_type}
                </li>
                {date_li}
                {time_li}
            </ul>
            <p style="color: #666;">Nous vous attendons!</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Reservation confirmée pour {console_type}. Nous vous attendons!"
    
    return send_email_core(
        subject="Reservation Confirmee - Game Store Zarzis",
        recipient_email=client_email,
        recipient_name=client_name,
        html_content=html_content,
        text_content=text_content
    )


def send_contact_form_notification(
    from_name: str,
    from_email: str,
    subject: str,
    message: str,
) -> bool:
    """Send contact form to store owner"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nouveau Message</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>De:</strong> {from_name} ({from_email})</p>
            <p><strong>Sujet:</strong> {subject}</p>
            <hr style="border: 1px solid #ddd;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
                <p>{message}</p>
            </div>
        </div>
    </div>
    """
    text_content = f"Message de {from_name}: {message}"
    
    return send_email_core(
        subject=f"Nouveau Message: {subject}",
        recipient_email=STORE_EMAIL,
        recipient_name="Store Owner",
        html_content=html_content,
        text_content=text_content
    )


def send_service_request_notification(
    client_name: str,
    client_phone: str,
    device_type: str,
    device_brand: str,
    issue_description: str,
    request_id: str,
    status: str = "pending",
) -> bool:
    """Send service request notification to store"""
    status_labels = {
        "pending": "Nouvelle Demande",
        "in_progress": "En Cours",
        "waiting_parts": "En Attente de Pieces",
        "completed": "Terminee",
        "cancelled": "Annulee",
    }
    
    label = status_labels.get(status, status)
    color = "#ff6b6b" if status == "pending" else "#4834d4"
    if status == "completed": color = "#6ab04c"
    if status == "waiting_parts": color = "#f0932b"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: {color}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Service Update: {label}</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>ID:</strong> {request_id[:8]}</p>
            <p><strong>Status:</strong> <span style="color: {color}; font-weight: bold;">{label}</span></p>
            <p><strong>Client:</strong> {client_name}</p>
            <p><strong>Telephone:</strong> {client_phone}</p>
            <hr style="border: 1px solid #ddd;">
            <p><strong>Appareil:</strong> {device_brand} {device_type}</p>
            <div style="background: white; padding: 15px; border-radius: 5px;">
                <p><strong>Probleme:</strong></p>
                <p>{issue_description}</p>
            </div>
        </div>
    </div>
    """
    text_content = f"Service Update [{label}] pour {client_name}. Appareil: {device_brand} {device_type}. ID: {request_id[:8]}"
    
    return send_email_core(
        subject=f"[{label}] Service #{request_id[:8]}",
        recipient_email=STORE_EMAIL,
        recipient_name="Game Store Admin",
        html_content=html_content,
        text_content=text_content
    )


def send_session_receipt(
    client_name: str,
    client_email: str,
    console_type: str,
    duration: str,
    total_amount: float,
    points_earned: int,
    date: str,
) -> bool:
    """Send session receipt to client"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Recu de Session</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Merci {client_name}!</h2>
            <table style="width: 100%; background: white; border-radius: 5px; padding: 15px;">
                <tr>
                    <td style="padding: 10px;"><strong>Date:</strong></td>
                    <td style="padding: 10px; text-align: right;">{date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px;"><strong>Console:</strong></td>
                    <td style="padding: 10px; text-align: right;">{console_type}</td>
                </tr>
                <tr>
                    <td style="padding: 10px;"><strong>Duree:</strong></td>
                    <td style="padding: 10px; text-align: right;">{duration}</td>
                </tr>
                <tr style="border-top: 2px solid #ddd;">
                    <td style="padding: 10px;"><strong>Total:</strong></td>
                    <td style="padding: 10px; text-align: right; font-size: 1.2em; color: #11998e;"><strong>{total_amount:.3f} DT</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px;"><strong>Points Gagnes:</strong></td>
                    <td style="padding: 10px; text-align: right; color: #f39c12;">+{points_earned}</td>
                </tr>
            </table>
            <p style="color: #666; text-align: center; margin-top: 20px;">A bientot!</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Recu pour votre session. Date: {date}, Console: {console_type}, Duree: {duration}, Total: {total_amount:.3f} DT."
    
    return send_email_core(
        subject="Votre Recu - Game Store Zarzis",
        recipient_email=client_email,
        recipient_name=client_name,
        html_content=html_content,
        text_content=text_content
    )


def send_otp_email(
    to_email: str,
    otp_code: str,
) -> bool:
    """Send OTP verification code"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">Code de Verification</h2>
            <p style="font-size: 16px; color: #666;">Voici votre code pour acceder a votre compte:</p>
            <div style="background: white; padding: 15px; margin: 20px auto; border-radius: 5px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #333; display: inline-block; border: 2px solid #ddd;">
                {otp_code}
            </div>
            <p style="font-size: 14px; color: #999;">Ce code expire dans 10 minutes.</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Votre code de verification est: {otp_code}. Il expire dans 10 minutes."
    
    return send_email_core(
        subject="Votre Code de Verification - Game Store Zarzis",
        recipient_email=to_email,
        recipient_name="User",
        html_content=html_content,
        text_content=text_content
    )


def send_staff_invitation(
    email: str,
    role: str,
    password: str,
) -> bool:
    """Send invitation to new staff member"""
    role_name = "Proprietaire" if role == "owner" else "Employe"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Bienvenue dans l'Equipe!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Bonjour!</h2>
            <p>Vous avez ete invite a rejoindre l'equipe Game Store Zarzis en tant que <strong>{role_name}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; border-left: 5px solid #FDB931; margin: 20px 0;">
                <p style="margin-top: 0;">Voici vos identifiants de connexion:</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Mot de passe temporaire:</strong> {password}</p>
            </div>
            
            <p>Veuillez vous connecter sur le tableau de bord et changer votre mot de passe des que possible.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/staff" style="background: #333; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder au Dashboard</a>
            </div>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Bienvenue! Vous avez ete invite en tant que {role_name}. Login: {email}, Password: {password}"
    
    return send_email_core(
        subject="Invitation Staff - Game Store Zarzis",
        recipient_email=email,
        recipient_name="Nouveau Staff",
        html_content=html_content,
        text_content=text_content
    )


def send_otp_email_alternative(
    to_email: str,
    otp_code: str,
) -> bool:
    """Send enhanced OTP verification code (SMS Replacement)"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">Connexion Sécurisée</h2>
            <p style="font-size: 16px; color: #666;">Vous avez demande a vous connecter.</p>
            <p style="font-size: 16px; color: #666;">Utilisez ce code unique pour verifier votre identite :</p>
            
            <div style="background: white; padding: 20px; margin: 30px auto; border-radius: 8px; font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #333; display: inline-block; border: 2px solid #3366ff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                {otp_code}
            </div>
            
            <p style="font-size: 14px; color: #999; margin-top: 20px;">Ce code expire dans 10 minutes.</p>
            <p style="font-size: 12px; color: #aaa;">Si vous n'avez pas demande ce code, ignorez cet email.</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Votre code de connexion Game Store Zarzis est: {otp_code}. Expire dans 10 min."
    
    return send_email_core(
        subject="Code de Connexion - Game Store Zarzis",
        recipient_email=to_email,
        recipient_name="Client",
        html_content=html_content,
        text_content=text_content
    )


def send_booking_reminder(
    client_name: str,
    client_email: str,
    console_type: str,
    booking_time: str,
) -> bool:
    """Send booking reminder"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Rappel de Reservation</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Bonjour {client_name},</h2>
            <p>Ceci est un rappel pour votre session de jeu a venir :</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; border-left: 5px solid #764ba2; margin: 20px 0;">
                <p><strong>Console :</strong> {console_type}</p>
                <p><strong>Heure :</strong> {booking_time}</p>
            </div>
            
            <p>Nous vous attendons ! Veuillez arriver 5 minutes a l'avance.</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"Rappel: Reservation {console_type} a {booking_time} chez Game Store Zarzis."
    
    return send_email_core(
        subject="Rappel Reservation - Game Store Zarzis",
        recipient_email=client_email,
        recipient_name=client_name,
        html_content=html_content,
        text_content=text_content
    )


def send_notification_email(
    to_email: str,
    subject: str,
    message: str,
    title: str = "Notification"
) -> bool:
    """Send generic notification email"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">{title}</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 5px;">
                <p style="font-size: 16px; line-height: 1.5;">{message}</p>
            </div>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    
    return send_email_core(
        subject=subject,
        recipient_email=to_email,
        recipient_name="User",
        html_content=html_content,
        text_content=message
    )
