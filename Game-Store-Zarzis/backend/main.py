"""
Game Store Zarzis Backend API
Secure FastAPI backend with rate limiting and email integration
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler, Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from utils.limiter import limiter
import os
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers.email import router as email_router
from routers.verification_routes import router as verification_router
from routers.expenses_routes import router as expenses_router
from routers.admin_routes import router as admin_router, diag_router as diag_router

# Rate limiter - Already initialized in utils/limiter.py
# If re-initialization is needed:
# limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Game Store Zarzis API",
    description="Secure Backend API for Game Store Zarzis management system",
    version="2.0.0"
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration - Allow frontend access
origins = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:5173",  # Vite default
    "https://www.gamestorezarzis.com.tn",  # Live site
    "https://gamestorezarzis.com.tn",
    "https://bck.gamestorezarzis.com.tn",
]

from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Trusted Host Middleware - Prevent Host Header Attacks
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(email_router)
app.include_router(verification_router)
app.include_router(expenses_router)
app.include_router(diag_router)
app.include_router(admin_router)



@app.get("/")
async def root():
    return {
        "message": "Welcome to Game Store Zarzis API",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "email": "configured" if os.getenv("MAILERSEND_API_KEY") else "not_configured"
        }
    }
