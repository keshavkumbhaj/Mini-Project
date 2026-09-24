# ROZ MARRA — AI-Powered Personal Management Dashboard

ROZ MARRA is a modern, dark-first personal productivity and management application built for high daily focus. It centralizes habit consistency, expense records, and recurring subscriptions into a unified overview and pairs them with cross-domain intelligence.

Developed by **Web Weavers** (3rd Semester Mini-Project).

---

## 🧭 Project Architecture

```text
Mini-Project/
├── frontend/                     # Pure HTML/CSS/Vanilla JS interface
│   ├── index.html                # Main Executive Dashboard Overview
│   ├── habits.html               # Habit Management & Streaks
│   ├── expenses.html             # Expense Tracking & Category Breakdown
│   ├── subscriptions.html        # Recurring Subscription Tracker
│   ├── css/
│   │   └── style.css             # Dark-first design system
│   ├── js/
│   │   └── dashboard.js          # Chart.js visualization & interactive logic
│   └── assets/
│       └── logo/
│           ├── README.txt        # Instructions for official logo asset
│           └── rozmarra-logo.svg # Vector geometric logo fallback
│
├── backend/                      # Python Flask Backend (Upcoming Phase)
│   ├── app.py                    # REST APIs
│   ├── database.py               # SQLite schema & helpers
│   └── ai.py                     # Gemini API intelligence layer
│
├── database/                     # Local SQLite Storage
│   └── app.db
│
├── requirements.txt              # Backend dependencies
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🎨 Visual System & Branding

- **Design Philosophy**: High-signal, calm, dark-first SaaS productivity interface.
- **Base Background**: `#0B0F14`
- **Sidebar**: `#10151C`
- **Cards & Containers**: `#151B23` (Hover: `#1A222C`)
- **Borders**: `#252D38`
- **Typography**: Crisp system sans-serif hierarchy with `#F5F7FA` (primary) and `#8B95A5` (secondary).
- **Brand Gradient**: Restrained cyan (`#60E0FF`) → blue (`#4F8BFF`) → indigo (`#635BFF`) → purple (`#8B5CF6`).

---

## 🚀 Quick Start (Phase 1 Frontend)

You can launch the dashboard locally using any static web server:

### Using Python:
```bash
python -m http.server 8000
```
Then visit:
```text
http://localhost:8000/
# or directly:
http://localhost:8000/frontend/index.html
```

---

## 🔑 Logo Integration

To insert your official ROZ MARRA brand logo:
1. Copy your logo image to `frontend/assets/logo/logo.png`.
2. The dashboard will automatically detect and prioritize `logo.png` over the vector SVG fallback.