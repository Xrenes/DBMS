# Student Portal — DBMS Project

A full-stack university student portal with a Metabase-style **Admin Query Builder** panel.

## 🔗 Live Links

| Page | URL |
|------|-----|
| 🏠 **Student Portal** | [xrenes.github.io/DBMS](https://xrenes.github.io/DBMS/index.html) |
| 🛠️ **Admin Query Builder** | [xrenes.github.io/DBMS/admin-panel.html](https://xrenes.github.io/DBMS/admin-panel.html) |
| 📊 Results | [xrenes.github.io/DBMS/results.html](https://xrenes.github.io/DBMS/results.html) |
| 📅 Attendance | [xrenes.github.io/DBMS/attendance.html](https://xrenes.github.io/DBMS/attendance.html) |
| 💰 Finance | [xrenes.github.io/DBMS/finance.html](https://xrenes.github.io/DBMS/finance.html) |

> **Note:** The Admin Query Builder requires the Node.js backend running locally (`http://localhost:3000`). See setup instructions below.

---

## 📁 Project Structure

```
DBMS/
├── index.html              # Student dashboard
├── admin-panel.html        # Admin Query Builder (Metabase-style)
├── results.html            # Academic results
├── attendance.html         # Attendance tracker
├── cgpa.html               # CGPA calculator
├── exams.html              # Exam schedule
├── finance.html            # Fee & payments
├── hostel.html             # Hostel management
├── transport.html          # Transport routes
├── profile.html            # Student profile
├── assets/
│   ├── css/                # Stylesheets
│   ├── js/                 # Frontend logic + admin-query-builder.js
│   └── data/               # Static student data
├── backend/                # Node.js / Express API
│   ├── server.js
│   ├── routes/
│   └── config/
└── database/               # MySQL schema + seed data
    └── student_portal.sql
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- MySQL 8.0

### 1. Database
```sql
mysql -u root -p -h 127.0.0.1 < database/student_portal.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # Fill in DB credentials
npm install
node server.js              # Runs on http://localhost:3000
```

### 3. Frontend
```bash
# From project root
python -m http.server 8080
# Open http://localhost:8080
```

### Admin Panel Credentials
| Field | Value |
|-------|-------|
| Email | `admin@diu.edu.bd` |
| Password | `password123` |

---

## 🛠️ Admin Query Builder Features

- **Data Catalog** — Browse 32 tables organized by category
- **Operations Pipeline** — Add Filter (σ), Project (π), Join (⨝), Group (γ), Union (∪)
- **Live SQL Preview** — See generated SQL update in real-time
- **EXPLAIN** — Show execution plan for any query
- **CSV Export** — Download query results
- **DBMS Theory Demos** — 3NF, ACID, Referential Integrity, Triggers, Views, Indexing, Ledger, RBAC

---

## 🗄️ Database (MySQL 8.0)

32 tables across 8 modules: Identity & Security, Academics, Attendance & Timetable, Exams, Finance, Hostel, Transport, Admin/Monitoring.

Key features: stored procedures, triggers, views, blockchain-style ledger, RBAC, full audit log.
