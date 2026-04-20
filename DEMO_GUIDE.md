# DBMS Mini Project — Step-by-Step Demonstration Guide

## Project: University Academic Management System (Group 1 — Education ERP)
### Course: Database Management Systems Lab | Total Marks: 40

---

## HOW YOUR PROJECT MAPS TO THE GUIDELINES

### Deliverables Checklist
| # | Deliverable | File / Location | Status |
|---|------------|----------------|--------|
| 1 | MySQL Workbench file (.mwb) | Export from MySQL Workbench → File → Save Model As | TODO |
| 2 | SQL Script file (.sql) | `database/student_portal.sql` + `database/demo_walkthrough.sql` | ✅ |
| 3 | PDF Report (max 6 pages) | Generate from this guide | TODO |
| 4 | Screenshot Folder | Run `demo_walkthrough.sql` and capture each step | TODO |
| 5 | 5-minute presentation (optional) | Use this guide as outline | ✅ |

---

## SEQUENTIAL DEMONSTRATION STEPS

### ━━━ Component A: Problem Identification & Scope (EP2) — 5 Marks ━━━

**What to say in Viva / Report:**

1. **Problem Definition:**
   - DIU manages 25,000+ students across multiple departments. Manual tracking of academics, attendance, results, finance, hostel, and transport is error-prone and inefficient.
   - We built a normalized relational database that manages the entire student lifecycle from enrollment to graduation.

2. **Stakeholders & System Users:**
   | Role | What they do |
   |------|-------------|
   | Students | View results, attendance, finance, hostel, transport, clearance |
   | Faculty | Mark attendance, enter marks, manage leave, view courses |
   | Admin | Manage users, publish results, configure system |
   | Accountant | Generate invoices, record payments |
   | Hostel Manager | Manage room allocations |
   | Transport Manager | Manage routes and subscriptions |

3. **Complexity & Constraints:**
   - **Multi-entity dependencies:** Students → Enrollments → Results → Grade Scale (chain of 4+ foreign keys)
   - **Data integrity:** CHECK constraints prevent invalid marks, locked results, etc.
   - **Concurrent access:** Transactions ensure atomic operations (invoice generation, result publishing)
   - **Immutable audit:** Blockchain-style ledger prevents data tampering
   - **RBAC:** 6 roles with 22 granular permissions

---

### ━━━ Component B: System Design (EP1) — 5 Marks ━━━

**Demo Steps (run in MySQL Workbench):**

1. **Open MySQL Workbench** → Connect to your database
2. **Run:** `USE student_portal;`
3. **Run STEP 1** from `demo_walkthrough.sql`:
   - Shows **30+ tables**, **6 views**, **11 triggers**, **3 stored procedures**
   - Screenshot this output

4. **Run STEP 2** from `demo_walkthrough.sql`:
   - Shows all **PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE** constraints
   - Shows all **referential integrity** relationships (parent→child)
   - Screenshot the FK relationship table

5. **ER Diagram:**
   - In MySQL Workbench: **Database → Reverse Engineer** → Select `student_portal`
   - This auto-generates the ER diagram
   - Export as image for the report

6. **3NF Normalization Proof:**
   - Every table has a **single-column or composite PRIMARY KEY** (1NF: atomic values)
   - No **partial dependencies** — all non-key attributes depend on the full PK (2NF)
   - No **transitive dependencies** — no non-key attribute depends on another non-key (3NF)
   - Example: `students` table — `student_code` doesn't store program name (that's in `programs` via FK)

**Key Tables by Module:**

| Module | Tables | Purpose |
|--------|--------|---------|
| Identity & RBAC | users, roles, user_roles, permissions, role_permissions | Authentication & authorization |
| Academic | departments, programs, students, semesters, courses, course_offerings, enrollments | Academic structure |
| Results | grade_scale, results | Grading with Bangladesh 4.0 scale |
| Timetable | class_sessions, attendance_records | Scheduling & attendance |
| Exams | exams, exam_marks | Assessment components |
| Finance | fee_heads, student_invoices, invoice_items, payments | Header-Detail billing |
| Hostel | hostel_rooms, room_allocations | Accommodation |
| Transport | transport_routes, transport_subscriptions | Bus service |
| Audit | audit_logs, ledger_events | Immutable audit trail |
| Config | system_config | System metadata |
| Warehouse | fact_academic | OLAP star schema |

---

### ━━━ Component C: SQL Implementation (EP1, EP2) — 10 Marks ━━━

**Run these from `demo_walkthrough.sql` — STEPS 5 through 13:**

| Query # | SQL Concept | What it demonstrates |
|---------|------------|---------------------|
| Q1 | `SELECT` + `WHERE` + `INNER JOIN` + `ORDER BY` | List active students with department |
| Q2 | `LEFT JOIN` + `GROUP BY` + `HAVING` | Programs with student count (filtered) |
| Q3 | `GROUP BY` + `AVG` + `MIN` + `MAX` + `COUNT` | Course exam performance statistics |
| Q4 | `INNER JOIN` on 5+ tables | Complete result sheet (student→grade) |
| Q5 | `LEFT JOIN` + `IS NULL` | Find students with no evaluation |
| Q6 | `RIGHT JOIN` | All semesters including empty ones |
| Q7 | **Nested subquery** (`WHERE ... IN`) | Students with grade A/A+ |
| Q8 | **Correlated subquery** | Each student's enrollment count |
| Q9 | **Derived table** (subquery in FROM) | CGPA calculation |
| Q10 | `EXISTS` subquery | Departments with active faculty |
| Q11 | **Scalar subquery** in SELECT | Student finance summary |
| Q12 | `UNION` | Combined unpaid invoices + leave requests |
| STEP 9 | **6 VIEWS** queried | CGPA, SGPA, Attendance, Dues, Live Marks, Roster |
| STEP 10 | **11 TRIGGERS** demonstrated | Audit logging, locked result protection, mark validation, payment status, immutable ledger |
| STEP 11 | **TRANSACTION** with ROLLBACK | Atomic section transfer |
| STEP 12 | **3 STORED PROCEDURES** | Invoice generation, result publishing, payment recording |

**How to demonstrate each:**
1. Copy the query from `demo_walkthrough.sql`
2. Paste into MySQL Workbench query tab
3. Click Execute (⚡)
4. Screenshot the output grid
5. Move to next query

---

### ━━━ Component D: Investigation & Analysis (EP4) — 5 Marks ━━━

**Run STEP 14 from `demo_walkthrough.sql`:**

| Investigation | Research Question | SQL Technique |
|--------------|------------------|---------------|
| 1 | Which courses have the highest exam performance? | `AVG`, `GROUP BY`, `CASE` |
| 2 | Which days of the week have lowest attendance? | `GROUP BY` day, `SUM` with `CASE` |
| 3 | What is the financial health per semester? | Derived table for payments, `SUM` |
| 4 | Which exam components contribute most to grades? | `GROUP BY` exam_type, `AVG` percentage |
| 5 | What is the hostel occupancy rate? | `LEFT JOIN`, conditional `COUNT` |
| 6 | How utilized are transport routes? | Capacity vs. subscribers ratio |

**How to explain in report:**
- State the **research question** (e.g., "Which day of the week has the lowest attendance?")
- Show the **SQL query** used
- Show the **output table/result**
- Write 2-3 lines of **interpretation** (e.g., "Tuesday has 85% attendance while Saturday has only 72%, suggesting students skip weekend classes more often")

---

### ━━━ Component E: Final Report (All EPs) — 5 Marks ━━━

**Report Structure (max 6 pages):**

| Page | Content |
|------|---------|
| 1 | **Title page** + Introduction + Problem Definition (EP2) |
| 2 | **ER Diagram** (exported from MySQL Workbench) + Schema summary table |
| 3 | **SQL Code Snippets** — show 4-5 key queries with output screenshots |
| 4 | **Views & Triggers** — list all views, show 1-2 trigger examples |
| 5 | **Transactions & Procedures** — show ROLLBACK demo + procedure call |
| 6 | **Investigation Results** + **Reflection** on how EP1, EP2, EP4 were addressed |

**EP Reflection (write this in report):**

> **EP1 (Engineering Fundamentals):** We applied ER modeling, 3NF normalization, and SQL to design a 30+ table schema with referential integrity (50+ foreign keys), CHECK constraints, and optimized indexes. Views compute CGPA and attendance without redundant storage.

> **EP2 (Problem Identification):** We identified 6 stakeholder types, decomposed the university management into 11 modules, and formulated data requirements including multi-entity dependency chains (Student → Enrollment → Result → Grade).

> **EP4 (Investigation):** We formulated 6 investigative questions and used SQL (GROUP BY, HAVING, AVG, COUNT, CASE) to discover patterns in exam performance, attendance trends, financial health, hostel occupancy, and transport utilization.

---

### ━━━ Component F: Viva — 10 Marks ━━━

**Expected questions and answers:**

| Question | Answer |
|----------|--------|
| How many tables? | 30+ tables organized in 11 modules |
| Why 3NF? | Eliminates redundancy (student name stored once in `users`, not repeated in every table) |
| Show a JOIN | Q4: 8-table INNER JOIN for complete result sheet |
| Show a subquery | Q9: Derived table calculates CGPA from results |
| What do triggers do? | 11 triggers: audit logging, locked result protection, mark validation, auto invoice-status, immutable ledger |
| Show a transaction | STEP 11: Section transfer with ROLLBACK |
| What are views for? | Precomputed queries: CGPA, attendance %, dues — avoids storing redundant data |
| What is the ledger? | Blockchain-style: each row has SHA-256 hash of previous row — immutable |
| How is RBAC implemented? | users ← user_roles → roles ← role_permissions → permissions (M:N junctions) |
| Show data integrity | CHECK constraints (marks 0-100, credit 0-6), FK with ON DELETE CASCADE/RESTRICT |

---

## QUICK START: RUN THE COMPLETE DEMO

```
Step 1:  Open MySQL Workbench → Connect to localhost
Step 2:  File → Open SQL Script → database/student_portal.sql → Execute All
Step 3:  File → Open SQL Script → database/demo_walkthrough.sql
Step 4:  Run each STEP section one by one (Ctrl+Shift+Enter for selected text)
Step 5:  Screenshot each result grid
Step 6:  For ER Diagram: Database → Reverse Engineer → Select student_portal
Step 7:  Export ER diagram as PNG/PDF
Step 8:  Compile everything into the 6-page PDF report
```

---

## FILE MAP

| File | Purpose |
|------|---------|
| `database/student_portal.sql` | Complete schema: 30+ tables, 11 triggers, 6 views, 3 procedures, sample data |
| `database/demo_walkthrough.sql` | **16-step sequential demo** matching every guideline requirement |
| `database/test_queries.sql` | Additional 15+ test queries |
| `database/diu_profiles.sql` | 4 student scenarios with realistic DIU data |
| `database/saved_queries.sql` | Query builder pipeline tables |
| Frontend (23 HTML pages) | Web interface for the portal (bonus — not required by guidelines) |
| `backend/server.js` | Node.js API server (bonus — not required by guidelines) |
