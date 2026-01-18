# 🎮 Game Store Zarzis - Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ecf8e)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff)](https://vitejs.dev/)

**Modern, full-featured management system for gaming cafés and console rental stores.**

Built with React + TypeScript + Supabase. Features real-time session tracking, inventory management, client loyalty system, and comprehensive analytics.

> 🌟 **New:** Trilingual support (English, French, Arabic with full RTL), Premium glassmorphism UI, Real-time collaboration.

### 📚 [Read the User Guide (How to Use)](./GUIDE.md)

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

> **Note**: Screenshots will be added in the `docs/screenshots/` folder

- Dashboard Overview
- Session Management
- Console Management  
- Inventory & POS
- Analytics & Reports
- Client Portal

</details>

---

## ✨ Features

### 🎯 Core Management
- **Real-time Session Tracking** - Monitor active gaming sessions with live updates
- **Quick Launch Shortcuts** - Start sessions instantly with keyboard shortcuts (1-9, A-Z)
- **Flexible Pricing** - Hourly rates, per-game pricing, and custom tiers
- **Client Self-Service Portal** - Customers can track points, history, and rewards

### 💰 Business Operations
- **Integrated Point-of-Sale** - Complete sales system for products and accessories
- **Smart Inventory** - Stock tracking with automatic low-stock alerts
- **Service Management** - Handle repair requests and maintenance tickets
- **Profit Analytics** - Track expenses and automatically calculate margins

### 👥 Customer Engagement
- **Loyalty Rewards Program** - Automatic points accumulation with free game rewards
- **Client Profiles** - Detailed purchase history and session tracking
- **Secure Authentication** - Optional SMS/Email verification for clients

### 📊 Analytics & Intelligence
- **Real-time Dashboard** - Live revenue, profit, and activity metrics
- **Complete Audit Trail** - Full transaction history with advanced filtering
- **Staff Attendance** - Automatic work hour tracking per device/workstation
- **Custom Reports** - Generate analytics for any date range with CSV/JSON export

### ⚙️ Customization & Control
- **Operating Hours** - Configure weekly schedules with different hours per day
- **Theme Editor** - Customize neon color palette to match your brand
- **Multi-language** - Full support for English, French, and Arabic (with RTL)
- **Data Management** - Export/import functionality for backups and migrations

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Modern UI with type safety |
| **Build Tool** | Vite 6.4 | Fast builds and HMR |
| **Styling** | Tailwind CSS + Shadcn UI | Utility-first CSS + components |
| **State** | TanStack Query + Context API | Server state + global state |
| **Backend** | Supabase | PostgreSQL + Auth + Realtime |
| **Animations** | Framer Motion | Smooth transitions |
| **Routing** | React Router v6 | Client-side navigation |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Charts** | Recharts | Data visualization |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

---

## ⚡ Quick Start

Get up and running in 5 minutes:

### 1. Clone & Install

```bash
git clone https://github.com/Start-Z/game-store-zarzis.git
cd game-store-zarzis
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Get these from: Supabase Dashboard → Settings → API

### 3. Setup Database

**Option A: Fresh Install (Recommended)**
```sql
-- In Supabase SQL Editor, run:
backend/migrations/CLEAN_INSTALL.sql
```

### 4. Create Owner Account

In Supabase Dashboard → Authentication → Users → Add User

Then assign the owner role:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'
FROM auth.users
WHERE email = 'admin@gamestore.tn';
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 🎨 Design Philosophy

This system features a **Premium WoW** design aesthetic:

- ✨ **Glassmorphism** - Frosted glass effects with backdrop blur
- 🌈 **Neon Accents** - Vibrant, customizable color palette
- 🎭 **Smooth Animations** - Framer Motion powered transitions
- 📱 **Fully Responsive** - Mobile-first approach, works on all devices
- 🌍 **Trilingual** - English, French, Arabic with full RTL support

---

## 🔐 Security

- ✅ **Row Level Security (RLS)** - All tables protected
- ✅ **Role-Based Access** - Owner/Staff/Client permissions
- ✅ **Secure Authentication** - Supabase Auth
- ✅ **Environment Variables** - Credentials never in code

---

## 👨‍💻 Author

**Built with ❤️ for Game Store Zarzis.**

For support or questions, please open an issue in the repository.

---

<div align="center">

**🎮 Start managing your game store like a pro! 🎮**

</div>