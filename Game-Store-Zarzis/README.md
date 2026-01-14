# 🎮 Game Store Zarzis - Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ecf8e)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Modern, full-featured management system for gaming cafés and console rental stores.**

Built with React + TypeScript + Supabase. Features real-time session tracking, inventory management, client loyalty system, and comprehensive analytics.

> 🌟 **New:** Trilingual support (English, French, Arabic with full RTL), Premium glassmorphism UI, Real-time collaboration

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
git clone https://github.com/your-username/game-store-zarzis.git
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

**Option B: Incremental Migrations**
```bash
# Run migrations 01-31 in sequence
# See backend/migrations/README.md for details
```

### 4. Create Owner Account

In Supabase Dashboard → Authentication → Users → Add User

Then assign the owner role:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'
FROM auth.users
WHERE email = 'your-email@example.com';
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP.md](SETUP.md)** | Complete installation & deployment guide |
| **[MANUAL.md](MANUAL.md)** | User guide for owners and staff |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Developer workflow and code standards |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history and release notes |
| **[SECURITY.md](SECURITY.md)** | Security policy and vulnerability reporting |
| **[backend/migrations/README.md](backend/migrations/README.md)** | Database schema and migration guide |

---

## 🎨 Design Philosophy

This system features a **Premium WoW** design aesthetic:

- ✨ **Glassmorphism** - Frosted glass effects with backdrop blur
- 🌈 **Neon Accents** - Vibrant, customizable color palette
- 🎭 **Smooth Animations** - Framer Motion powered transitions
- 📱 **Fully Responsive** - Mobile-first approach, works on all devices
- 🌍 **Trilingual** - English, French, Arabic with full RTL support
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation

---

## 🔑 Key Features Deep Dive

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1-9` | Launch Console stations 1-9 |
| `A-Z` | Launch Console stations 10+ |
| `Ctrl+K` | Open command palette (coming soon) |

Configure shortcuts in: **Console Management** → Edit Console → Shortcut Key

### Session Management

- ⏱️ **Real-time Timer** - See active session duration live
- 🔔 **Overtime Alerts** - Audio/visual warnings for expired sessions
- 🎮 **Quick Extend** - Add time to sessions with one click
- 💰 **Auto-calculation** - Base price + extra time automatically computed

### Loyalty System

- 🎁 **Free Game After X Plays** - Reward repeat customers
- ⭐ **Points for Purchases** - Earn points on every transaction
- 🎯 **Redeem Points** - Use points for discounts or products
- 📈 **Track Progress** - Clients can see their status anytime

---

## 🏗️ Project Structure

```
game-store-zarzis/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn UI base components
│   │   ├── dashboard/   # Feature components
│   │   └── CreatorCredit.tsx
│   ├── contexts/        # Global state (Auth, Language, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route pages
│   │   ├── Index.tsx    # Landing page
│   │   ├── dashboard/   # Dashboard pages
│   │   └── ...
│   ├── types/           # TypeScript definitions
│   ├── lib/             # Utilities (Supabase client)
│   └── translations/    # i18n JSON files
├── backend/
│   ├── migrations/      # SQL schema migrations
│   │   ├── CLEAN_INSTALL.sql
│   │   └── 00-31...sql
│   └── ...              # Optional FastAPI backend
├── public/              # Static assets
├── docs/                # Extended documentation
└── Configuration files
```

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/game-store-zarzis)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel and add environment variables
# 3. Deploy!
```

### Netlify

```bash
npm run build
netlify deploy --prod
```

### Custom Server

```bash
npm run build
npx serve -s dist -l 80
```

**See [SETUP.md](SETUP.md) for detailed deployment instructions.**

---

## 🔐 Security

- ✅ **Row Level Security (RLS)** - All tables protected
- ✅ **Role-Based Access** - Owner/Staff/Client permissions
- ✅ **Secure Authentication** - Supabase Auth with optional 2FA
- ✅ **Environment Variables** - Credentials never in code
- ✅ **Input Sanitization** - XSS and SQL injection prevention

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🐛 **Report Bugs** - Open an issue with reproduction steps
2. 💡 **Suggest Features** - Share your ideas in discussions
3. 🔧 **Submit PRs** - Follow our [Contributing Guide](CONTRIBUTING.md)
4. 📖 **Improve Docs** - Help make documentation clearer
5. 🌍 **Translate** - Add support for more languages

**Good First Issues**: Check out issues labeled [`good first issue`](https://github.com/your-username/game-store-zarzis/labels/good%20first%20issue)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2026 Omar Abouajaja
```

---

## 🙋 Support & Community

### For Users
- 📖 [User Manual](MANUAL.md) - Complete feature guide
- ⚙️ [Setup Guide](SETUP.md) - Installation help
- 🐛 [Report Issues](https://github.com/your-username/game-store-zarzis/issues)

### For Developers
- 💻 [Contributing Guide](CONTRIBUTING.md) - Development workflow
- 🗄️ [Database Schema](backend/migrations/README.md) - DB documentation
- 💬 [Discussions](https://github.com/your-username/game-store-zarzis/discussions) - Ask questions

---

## ✨ Acknowledgments

Built with amazing open-source technologies:

- [React](https://react.dev) - UI library
- [Supabase](https://supabase.com) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com) - Component library
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide Icons](https://lucide.dev) - Icon set

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/game-store-zarzis&type=Date)](https://star-history.com/#your-username/game-store-zarzis&Date)

---

## 👨‍💻 Author

**Crafted with ❤️ by [Omar Abouajaja](https://www.linkedin.com/in/omar-abouajaja)**

Connect with me on [LinkedIn](https://www.linkedin.com/in/omar-abouajaja) for questions, collaborations, or just to say hi!

---

<div align="center">

**🎮 Start managing your game store like a pro! 🎮**

[Get Started](#-quick-start) • [View Docs](SETUP.md) • [Report Bug](https://github.com/your-username/game-store-zarzis/issues) • [Request Feature](https://github.com/your-username/game-store-zarzis/issues)

Made with ❤️ for gaming cafés everywhere

</div>