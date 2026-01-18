# Deployment Guide

This document describes the deployment architecture for Game Store Zarzis.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  Cloudflare     │              │     Render      │
│  Pages          │              │     (API)       │
│  (Frontend)     │              │                 │
└────────┬────────┘              └────────┬────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       │
                       ▼
            ┌─────────────────┐
            │    Supabase     │
            │  (PostgreSQL)   │
            │  + Auth + RT    │
            └─────────────────┘
```

## 📍 Endpoints

| Service | URL | Provider |
|---------|-----|----------|
| Frontend | https://www.gamestorezarzis.com.tn | Cloudflare Pages |
| Backend API | https://bck.gamestorezarzis.com.tn | Render |
| Database | Supabase Project | Supabase |

## ☁️ Cloudflare Pages (Frontend)

### Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18

### Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://bck.gamestorezarzis.com.tn
```

### Custom Domain Setup

1. Add domain in Cloudflare Pages
2. Configure DNS CNAME record
3. Enable HTTPS (automatic)

## 🚀 Render (Backend)

### Configuration

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Runtime**: Python 3.11

### Environment Variables

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SMTP_HOST=<smtp-server>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<password>
CORS_ORIGINS=https://www.gamestorezarzis.com.tn
```

## 🗄️ Supabase (Database)

### Tables

The database includes 14+ tables:
- `consoles` - Gaming stations
- `sessions` - Active/completed sessions
- `clients` - Customer profiles
- `products` - Inventory items
- `orders` - E-commerce orders
- `expenses` - Business expenses
- `user_roles` - RBAC roles
- And more...

### Row Level Security

All tables have RLS policies enabled:
- **Owners**: Full access
- **Staff**: Operational access
- **Clients**: Self-data only

### Realtime

Enabled for:
- Sessions (live status updates)
- Consoles (availability)
- Orders (new orders)

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Quality Checks**: ESLint + TypeScript
2. **Build**: Production bundle
3. **Security**: npm audit

Cloudflare Pages auto-deploys on push to `main`.

## 📦 Manual Deployment

### Frontend

```bash
npm run build
# Upload dist/ to Cloudflare Pages
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

For questions, contact the maintainer.
