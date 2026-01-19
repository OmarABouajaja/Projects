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

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redirection Settings
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://gamestorezarzis.com.tn")

# Initialize MailerSend Client
mailer = MailerSendClient(MAILERSEND_API_KEY) if MAILERSEND_API_KEY else None

def send_email_core(subject: str, recipient_email: str, recipient_name: str, html_content: str, text_content: str) -> bool:
    """Core sending logic: Tries SDK first, then SMTP"""
    logger.info(f"Attempting to send email to {recipient_email} with subject: {subject}")
    
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
            logger.info(f"Email sent successfully via MailerSend SDK to {recipient_email}")
            return True
        except Exception as sdk_error:
            logger.error(f"MailerSend SDK Failed for {recipient_email}: {sdk_error}")
            pass

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
            logger.info(f"Email sent successfully via SMTP to {recipient_email}")
            return True
        except Exception as smtp_error:
            logger.error(f"SMTP Failed for {recipient_email}: {smtp_error}")
            return False
            
    logger.warning(f"No email delivery method configured for {recipient_email}")
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


# Translation Dictionary for Emails
EMAIL_TRANSLATIONS = {
    "staff_invite": {
        "subject": {
            "fr": "Invitation Staff - Game Store Zarzis",
            "en": "Staff Invitation - Game Store Zarzis",
            "ar": "دعوة موظف - Game Store Zarzis"
        },
        "welcome": {
            "fr": "Bienvenue dans l'Équipe!",
            "en": "Welcome to the Team!",
            "ar": "مرحباً بك في الفريق!"
        },
        "greeting": {
            "fr": "Bonjour!",
            "en": "Hello!",
            "ar": "مرحباً!"
        },
        "invite_text": {
            "fr": "Vous avez été invité à rejoindre l'équipe Game Store Zarzis en tant que",
            "en": "You have been invited to join the Game Store Zarzis team as",
            "ar": "لقد تمت دعوتك للانضمام إلى فريق Game Store Zarzis بصفتك"
        },
        "credentials": {
            "fr": "Voici vos identifiants de connexion:",
            "en": "Here are your login credentials:",
            "ar": "إليك بيانات تسجيل الدخول الخاصة بك:"
        },
        "temp_password": {
            "fr": "Mot de passe temporaire:",
            "en": "Temporary password:",
            "ar": "كلمة المرور المؤقتة:"
        },
        "action_required": {
            "fr": "Veuillez vous connecter sur le tableau de bord et changer votre mot de passe dès que possible.",
            "en": "Please log in to the dashboard and change your password as soon as possible.",
            "ar": "يرجى تسجيل الدخول إلى لوحة التحكم وتغيير كلمة المرور الخاصة بك في أقرب وقت ممكن."
        },
        "button": {
            "fr": "Accéder au Dashboard",
            "en": "Access Dashboard",
            "ar": "الدخول إلى لوحة التحكم"
        },
        "roles": {
            "owner": {"fr": "Propriétaire", "en": "Owner", "ar": "مالك"},
            "worker": {"fr": "Employé", "en": "Staff", "ar": "موظف"}
        }
    },
    "otp": {
        "subject": {
            "fr": "Votre Code de Vérification - Game Store Zarzis",
            "en": "Your Verification Code - Game Store Zarzis",
            "ar": "رمز التحقق الخاص بك - Game Store Zarzis"
        },
        "title": {
            "fr": "Code de Vérification",
            "en": "Verification Code",
            "ar": "رمز التحقق"
        },
        "instruction": {
            "fr": "Voici votre code pour accéder à votre compte:",
            "en": "Here is your code to access your account:",
            "ar": "إليك الرمز الخاص بك للوصول إلى حسابك:"
        },
        "expiry": {
            "fr": "Ce code expire dans 10 minutes.",
            "en": "This code expires in 10 minutes.",
            "ar": "تنتهي صلاحية هذا الرمز خلال 10 دقائق."
        }
    },
    "login_code": {
        "subject": {
            "fr": "Code de Connexion - Game Store Zarzis",
            "en": "Login Code - Game Store Zarzis",
            "ar": "رمز الدخول - Game Store Zarzis"
        },
        "title": {
            "fr": "Connexion Sécurisée",
            "en": "Secure Login",
            "ar": "تسجيل دخول آمن"
        },
        "request_text": {
            "fr": "Vous avez demandé à vous connecter.",
            "en": "You have requested to log in.",
            "ar": "لقد طلبت تسجيل الدخول."
        },
        "instruction": {
            "fr": "Utilisez ce code unique pour vérifier votre identité :",
            "en": "Use this unique code to verify your identity:",
            "ar": "استخدم هذا الرمز الفريد للتحقق من هويتك:"
        },
        "expiry": {
            "fr": "Ce code expire dans 10 minutes.",
            "en": "This code expires in 10 minutes.",
            "ar": "تنتهي صلاحية هذا الرمز خلال 10 دقائق."
        },
        "ignore_text": {
            "fr": "Si vous n'avez pas demandé ce code, ignorez cet email.",
            "en": "If you did not request this code, please ignore this email.",
            "ar": "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني."
        }
    }
}


def send_otp_email(
    to_email: str,
    otp_code: str,
    lang: str = "fr"
) -> bool:
    """Send OTP verification code in specific language"""
    lang = lang if lang in ["fr", "en", "ar"] else "fr"
    t = EMAIL_TRANSLATIONS["otp"]
    is_rtl = lang == "ar"
    align = "right" if is_rtl else "left"
    direction = "rtl" if is_rtl else "ltr"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: {direction};">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">{t["title"][lang]}</h2>
            <p style="font-size: 16px; color: #666;">{t["instruction"][lang]}</p>
            <div style="background: white; padding: 15px; margin: 20px auto; border-radius: 5px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #333; display: inline-block; border: 2px solid #ddd;">
                {otp_code}
            </div>
            <p style="font-size: 14px; color: #999;">{t["expiry"][lang]}</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"{t['instruction'][lang]} {otp_code}. {t['expiry'][lang]}"
    
    return send_email_core(
        subject=t["subject"][lang],
        recipient_email=to_email,
        recipient_name="User",
        html_content=html_content,
        text_content=text_content
    )


def send_staff_invitation(
    email: str,
    role: str,
    password: str,
    lang: str = "fr"
) -> bool:
    """Send invitation to new staff member in specific language"""
    lang = lang if lang in ["fr", "en", "ar"] else "fr"
    t = EMAIL_TRANSLATIONS["staff_invite"]
    role_name = t["roles"].get(role, t["roles"]["worker"])[lang]
    is_rtl = lang == "ar"
    align = "right" if is_rtl else "left"
    direction = "rtl" if is_rtl else "ltr"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: {direction}; text-align: {align};">
        <div style="background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">{t["welcome"][lang]}</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">{t["greeting"][lang]}</h2>
            <p>{t["invite_text"][lang]} <strong>{role_name}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; border-{align}: 5px solid #FDB931; margin: 20px 0;">
                <p style="margin-top: 0;">{t["credentials"][lang]}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>{t["temp_password"][lang]}</strong> {password}</p>
            </div>
            
            <p>{t["action_required"][lang]}</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{FRONTEND_URL}/staff-login" style="background: #333; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">{t["button"][lang]}</a>
            </div>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"{t['welcome'][lang]}! {t['invite_text'][lang]} {role_name}. Login: {email}, Password: {password}"
    
    return send_email_core(
        subject=t["subject"][lang],
        recipient_email=email,
        recipient_name="Nouveau Staff",
        html_content=html_content,
        text_content=text_content
    )


def send_otp_email_alternative(
    to_email: str,
    otp_code: str,
    lang: str = "fr"
) -> bool:
    """Send enhanced OTP verification code (SMS Replacement) in specific language"""
    lang = lang if lang in ["fr", "en", "ar"] else "fr"
    t = EMAIL_TRANSLATIONS["login_code"]
    is_rtl = lang == "ar"
    align = "right" if is_rtl else "left"
    direction = "rtl" if is_rtl else "ltr"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: {direction}; text-align: {align};">
        <div style="background: #333; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">{t["title"][lang]}</h2>
            <p style="font-size: 16px; color: #666;">{t["request_text"][lang]}</p>
            <p style="font-size: 16px; color: #666;">{t["instruction"][lang]}</p>
            
            <div style="background: white; padding: 20px; margin: 30px auto; border-radius: 8px; font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #333; display: inline-block; border: 2px solid #3366ff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                {otp_code}
            </div>
            
            <p style="font-size: 14px; color: #999; margin-top: 20px;">{t["expiry"][lang]}</p>
            <p style="font-size: 12px; color: #aaa;">{t["ignore_text"][lang]}</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"{t['title'][lang]}: {otp_code}. {t['expiry'][lang]}"
    
    return send_email_core(
        subject=t["subject"][lang],
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


# Password Reset Translation Dictionary
PASSWORD_RESET_TRANSLATIONS = {
    "subject": {
        "fr": "Réinitialisation du Mot de Passe - Game Store Zarzis",
        "en": "Password Reset - Game Store Zarzis",
        "ar": "إعادة تعيين كلمة المرور - Game Store Zarzis"
    },
    "title": {
        "fr": "Réinitialisation du Mot de Passe",
        "en": "Password Reset",
        "ar": "إعادة تعيين كلمة المرور"
    },
    "greeting": {
        "fr": "Bonjour,",
        "en": "Hello,",
        "ar": "مرحباً،"
    },
    "instruction": {
        "fr": "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :",
        "en": "You have requested to reset your password. Click the button below to continue:",
        "ar": "لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه للمتابعة:"
    },
    "button": {
        "fr": "Réinitialiser le Mot de Passe",
        "en": "Reset Password",
        "ar": "إعادة تعيين كلمة المرور"
    },
    "expiry": {
        "fr": "Ce lien expire dans 1 heure.",
        "en": "This link expires in 1 hour.",
        "ar": "تنتهي صلاحية هذا الرابط خلال ساعة واحدة."
    },
    "ignore": {
        "fr": "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.",
        "en": "If you did not request this reset, please ignore this email.",
        "ar": "إذا لم تطلب هذه الإعادة، يرجى تجاهل هذا البريد الإلكتروني."
    }
}


def send_password_reset_email(
    to_email: str,
    recovery_url: str,
    lang: str = "fr"
) -> bool:
    """Send password reset email with magic link in specific language"""
    lang = lang if lang in ["fr", "en", "ar"] else "fr"
    t = PASSWORD_RESET_TRANSLATIONS
    is_rtl = lang == "ar"
    align = "right" if is_rtl else "left"
    direction = "rtl" if is_rtl else "ltr"
    
    # recovery_url is now passed directly from Supabase Admin API
    reset_url = recovery_url

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: {direction}; text-align: {align};">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Game Store Zarzis</h1>
        </div>
        <div style="padding: 40px; background: #f9f9f9; text-align: center;">
            <h2 style="color: #333;">{t["title"][lang]}</h2>
            <p style="font-size: 16px; color: #666;">{t["greeting"][lang]}</p>
            <p style="font-size: 16px; color: #666;">{t["instruction"][lang]}</p>
            
            <div style="margin: 30px auto;">
                <a href="{reset_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    {t["button"][lang]}
                </a>
            </div>
            
            <p style="font-size: 14px; color: #999; margin-top: 20px;">{t["expiry"][lang]}</p>
            <p style="font-size: 12px; color: #aaa;">{t["ignore"][lang]}</p>
            
            <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                <p style="font-size: 12px; color: #666; margin: 0;">Si le bouton ne fonctionne pas, copiez ce lien :</p>
                <p style="font-size: 11px; color: #999; word-break: break-all;">{reset_url}</p>
            </div>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
            <p style="margin: 0;">Zarzis, Tunisie | Tel: 23 290 065</p>
        </div>
    </div>
    """
    text_content = f"{t['instruction'][lang]} {reset_url}. {t['expiry'][lang]}"
    
    return send_email_core(
        subject=t["subject"][lang],
        recipient_email=to_email,
        recipient_name="User",
        html_content=html_content,
        text_content=text_content
    )
