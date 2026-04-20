# University Academic Management System — DBMS Lab Project

A full-stack university student portal with a Metabase-style **Admin Query Builder** panel.  
**CSE 312: Database Management System Lab** — Group 1, Daffodil International University

## 🔗 Live Links (GitHub Pages)

> All pages below are **live** at: **https://xrenes.github.io/DBMS/**  
> GitHub Repo: **https://github.com/Xrenes/DBMS**

### Student Pages
| Page | Live URL |
|------|----------|
| 🏠 **Login** | [xrenes.github.io/DBMS/login.html](https://xrenes.github.io/DBMS/login.html) |
| 🎓 **Student Dashboard** | [xrenes.github.io/DBMS/index.html](https://xrenes.github.io/DBMS/index.html) |
| 📊 **Results** | [xrenes.github.io/DBMS/results.html](https://xrenes.github.io/DBMS/results.html) |
| 📈 **Live Results** | [xrenes.github.io/DBMS/live-results.html](https://xrenes.github.io/DBMS/live-results.html) |
| 🎓 **CGPA Calculator** | [xrenes.github.io/DBMS/cgpa.html](https://xrenes.github.io/DBMS/cgpa.html) |
| 📅 **Attendance** | [xrenes.github.io/DBMS/attendance.html](https://xrenes.github.io/DBMS/attendance.html) |
| 📆 **Routine** | [xrenes.github.io/DBMS/routine.html](https://xrenes.github.io/DBMS/routine.html) |
| 📝 **Exam Schedule** | [xrenes.github.io/DBMS/exam-schedule.html](https://xrenes.github.io/DBMS/exam-schedule.html) |
| 📋 **Registration** | [xrenes.github.io/DBMS/registration.html](https://xrenes.github.io/DBMS/registration.html) |
| 💰 **Finance** | [xrenes.github.io/DBMS/finance.html](https://xrenes.github.io/DBMS/finance.html) |
| 🏠 **Hostel** | [xrenes.github.io/DBMS/hostel.html](https://xrenes.github.io/DBMS/hostel.html) |
| 🚌 **Transport** | [xrenes.github.io/DBMS/transport.html](https://xrenes.github.io/DBMS/transport.html) |
| ✅ **Clearance** | [xrenes.github.io/DBMS/clearance.html](https://xrenes.github.io/DBMS/clearance.html) |
| ⭐ **Evaluation** | [xrenes.github.io/DBMS/evaluation.html](https://xrenes.github.io/DBMS/evaluation.html) |
| 📢 **Notices** | [xrenes.github.io/DBMS/notices.html](https://xrenes.github.io/DBMS/notices.html) |
| 👤 **Profile** | [xrenes.github.io/DBMS/profile.html](https://xrenes.github.io/DBMS/profile.html) |

### Faculty Pages
| Page | Live URL |
|------|----------|
| 🔑 **Faculty Login** | [xrenes.github.io/DBMS/login-faculty.html](https://xrenes.github.io/DBMS/login-faculty.html) |
| 📊 **Faculty Dashboard** | [xrenes.github.io/DBMS/faculty-dashboard.html](https://xrenes.github.io/DBMS/faculty-dashboard.html) |
| 📚 **Faculty Courses** | [xrenes.github.io/DBMS/faculty-courses.html](https://xrenes.github.io/DBMS/faculty-courses.html) |
| 📋 **Faculty Attendance** | [xrenes.github.io/DBMS/faculty-attendance.html](https://xrenes.github.io/DBMS/faculty-attendance.html) |
| 📝 **Result Management** | [xrenes.github.io/DBMS/faculty-result-management.html](https://xrenes.github.io/DBMS/faculty-result-management.html) |
| 👥 **Faculty Students** | [xrenes.github.io/DBMS/faculty-students.html](https://xrenes.github.io/DBMS/faculty-students.html) |
| 📅 **Faculty Routine** | [xrenes.github.io/DBMS/faculty-routine.html](https://xrenes.github.io/DBMS/faculty-routine.html) |
| 🏖️ **Faculty Leave** | [xrenes.github.io/DBMS/faculty-leave.html](https://xrenes.github.io/DBMS/faculty-leave.html) |
| 👤 **Faculty Profile** | [xrenes.github.io/DBMS/faculty-profile.html](https://xrenes.github.io/DBMS/faculty-profile.html) |

### Admin Pages
| Page | Live URL |
|------|----------|
| 🔑 **Admin Login** | [xrenes.github.io/DBMS/login-admin.html](https://xrenes.github.io/DBMS/login-admin.html) |
| 🛠️ **Admin Panel (Query Builder)** | [xrenes.github.io/DBMS/admin-panel.html](https://xrenes.github.io/DBMS/admin-panel.html) |
| 🧪 **API Tester** | [xrenes.github.io/DBMS/api-tester.html](https://xrenes.github.io/DBMS/api-tester.html) |
| 📄 **Project Report** | [xrenes.github.io/DBMS/Project_Report.html](https://xrenes.github.io/DBMS/Project_Report.html) |

> **Note:** The Admin Query Builder and login authentication require the Node.js backend running locally (`http://localhost:3000`). On GitHub Pages, demo credentials work automatically.

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
