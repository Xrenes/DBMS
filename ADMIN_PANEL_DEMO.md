# Admin Panel — Presentation Demo Guide

> **Goal:** Walk through every operation in the Admin Query Builder that fulfils
> Guidelines.pdf Components A–F (40 marks total).

---

## Pre-requisites
1. Start MySQL → ensure `student_portal` database has data (`demo_walkthrough.sql`)
2. `cd backend && node server.js` → server on **http://localhost:3000**
3. Open **admin-panel.html** in browser (auto-login as `admin@diu.edu.bd`)

---

## STEP-BY-STEP PRESENTATION FLOW

### 1. Show the Data Catalog (Component A — Problem Identification, 5 marks)

**What to click:** Look at the **left sidebar — "Data Catalog"**

| Action | What It Shows |
|--------|---------------|
| Scroll through 13 categories | Identity & Security, Academics, Attendance & Timetable, Exams, Finance, Hostel, Transport, Notices, Evaluation, Faculty Management, Registration, Clearance, Admin/Monitoring |
| Point out row counts next to each table | 30+ tables with real data |
| Show Views section at bottom | 6 precomputed views |

**Say:** *"Our system manages 30+ tables across 13 functional areas for a university with 25,000+ students, covering registration, academics, finance, hostel, transport, and clearance."*

---

### 2. 3NF Normalization (Component B — System Design, 5 marks)

**What to click:** Right drawer → **DBMS Theory Demos** → **3NF Normalization**

This auto-runs:
```sql
SELECT t.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE, c.COLUMN_KEY,
       kcu.REFERENCED_TABLE_NAME AS fk_references
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c ON ...
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON ...
WHERE t.TABLE_SCHEMA = 'student_portal'
```

**Say:** *"Every table is in 3NF — no transitive dependencies. Each non-key column depends only on the primary key. Foreign keys link related tables instead of duplicating data."*

---

### 3. Referential Integrity — Foreign Keys (Component B)

**What to click:** Theory Demos → **FK Referential Integrity**

Shows all FK relationships with ON UPDATE / ON DELETE rules.

**Say:** *"We have 40+ foreign key constraints ensuring referential integrity. CASCADE and RESTRICT rules prevent orphan records."*

---

### 4. Visual JOIN Operation (Component C — SQL Implementation, 10 marks)

**What to click:**
1. Left sidebar → click **`students`** table (under Academics)
2. Right drawer → click **"+ Add Operation"** → **Join Table**
3. In the Join modal:
   - Left table: `students`
   - Join type: **INNER** (click the button)
   - Right table: select **`users`**
   - ON: `students.user_id = users.user_id`
   - Click **Confirm**
4. Click **"View SQL"** button in top bar to see generated SQL
5. Click **Execute** → see results in data grid

**Generated SQL shown:**
```sql
SELECT `students`.*, `users`.*
FROM `students`
INNER JOIN `users` ON `students`.`user_id` = `users`.`user_id`
```

**Then change join type:**
- Edit the Join operation → switch to **LEFT JOIN** → Execute
- Switch to **RIGHT JOIN** → Execute  

**Say:** *"The query builder visually generates JOINs. Here I used INNER, LEFT, and RIGHT joins. Results change based on join type — LEFT keeps all left-table rows even without matches."*

---

### 5. Filter Rows — WHERE Clause (Component C)

**What to click:**
1. With `students` still selected, click **"+ Add Operation"** → **Filter Rows**
2. Add conditions:
   - Column: `batch_year`, Operator: `=`, Value: `2024`
   - Click "+ Add Condition" → Logic: `AND`, Column: `section`, Operator: `=`, Value: `A`
3. Click **Apply Filters** → Execute

**Generated SQL:**
```sql
WHERE `students`.`batch_year` = '2024' AND `students`.`section` = 'A'
```

**Say:** *"σ Selection — filtering rows based on multiple conditions with AND/OR logic."*

---

### 6. Choose Columns — Projection (Component C)

**What to click:**
1. **"+ Add Operation"** → **Choose Columns**
2. Uncheck all, then select only: `student_code`, `user_id`, `batch_year`, `section`
3. Click **Apply**

**Say:** *"π Projection — selecting only the columns we need, reducing data transfer."*

---

### 7. GROUP BY + Aggregates + HAVING (Component C)

**What to click:**
1. Click a table like **`enrollments`** from sidebar
2. **"+ Add Operation"** → **Group & Summarize**
3. GROUP BY: check `student_id`
4. Add aggregates:
   - `COUNT(*)` alias `total_courses`
   - Click "+ Add Aggregate" → `COUNT(*)` alias (another if wanted)
5. HAVING: type `COUNT(*) > 3`
6. Click **Apply** → Execute

**Generated SQL:**
```sql
SELECT `enrollments`.`student_id`, COUNT(*) AS `total_courses`
FROM `enrollments`
GROUP BY `enrollments`.`student_id`
HAVING COUNT(*) > 3
```

**Say:** *"γ Aggregation — GROUP BY with COUNT and HAVING clause filters groups, not individual rows."*

---

### 8. UNION — Append Table (Component C)

**What to click:**
1. Select **`notices`** table
2. **"+ Add Operation"** → **Append Table**
3. Select another table (or same table for demo)
4. Union Type: **UNION** (removes duplicates) or **UNION ALL**
5. Execute

**Say:** *"∪ Union — combines result sets from two compatible queries. UNION removes duplicates, UNION ALL keeps all rows."*

---

### 9. Custom SQL — Subqueries (Component C)

**What to click:**
1. **"+ Add Operation"** → **Custom SQL**
2. Click the **"Notices"** template button — it contains a subquery:

```sql
SELECT n.notice_id, n.title, n.audience, n.priority,
  (SELECT COUNT(*) FROM notice_reads nr WHERE nr.notice_id = n.notice_id) AS read_count
FROM notices n
JOIN users u ON n.posted_by = u.user_id
ORDER BY n.created_at DESC
```

3. Click **Execute**

**Say:** *"This uses a correlated subquery — for each notice, it counts how many users have read it. The inner query references the outer query's notice_id."*

---

### 10. Custom SQL — Multi-Table JOIN (Component C)

**What to click:** Custom SQL → click **"Results"** template:

```sql
SELECT s.student_code, u.full_name, c.course_code, c.title,
       r.total_mark, r.grade_code, g.grade_point, sem.name AS semester
FROM results r
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN semesters sem ON co.semester_id = sem.semester_id
LEFT JOIN grade_scale g ON r.grade_code = g.grade_code
```

**Say:** *"This query joins 7 tables — results, enrollments, students, users, course_offerings, courses, semesters — plus a LEFT JOIN to grade_scale. This demonstrates complex multi-table relationships."*

---

### 11. Views (Component C)

**What to click (Option A — Theory):** Theory Demos → **Views**
- Shows all view definitions from INFORMATION_SCHEMA

**What to click (Option B — Use a view):**
1. In sidebar, scroll to **Views** section
2. Click **`vw_attendance_summary`** or **`vw_evaluation_summary`**
3. Data loads automatically — it's queried like a table

**Say:** *"Views are virtual tables computed from base tables. We have 6 views: vw_student_results, vw_attendance_summary, vw_evaluation_summary, vw_notice_list, vw_faculty_leave_balance, vw_cgpa. They simplify complex queries and restrict data access."*

---

### 12. Triggers & Audit (Component C)

**What to click:** Theory Demos → **Triggers & Audit**

Shows all 11 triggers with their timing, event, and body:
- `trg_users_insert` — logs user creation
- `trg_enrollment_insert` — auto-creates result record  
- `trg_payment_insert` — updates invoice status
- `trg_result_update` — auto-calculates grade
- etc.

**Say:** *"We have 11 triggers. For example, trg_result_update fires AFTER UPDATE on results — it looks up the grade from grade_scale and auto-assigns it. trg_payment_insert fires after a payment and updates the invoice status."*

---

### 13. Stored Procedures / Transactions (Component C)

**What to click:** Custom SQL → click **"CALL Procedure"** template:
```sql
CALL sp_approve_registration(1, 1);
```

Or click **"Admit Student"** template:
```sql
CALL sp_admit_student('Rahim Uddin', 'rahim.uddin@diu.edu.bd', ...);
```

Then click Theory Demos → **ACID Transactions** to show procedure definitions.

**Say:** *"sp_admit_student is a transaction — it creates a user, generates a student code, creates an enrollment, and optionally assigns a hostel room. If any step fails, the entire transaction rolls back. This ensures ACID properties — Atomicity, Consistency, Isolation, Durability."*

---

### 14. DML Operations — INSERT / UPDATE / DELETE (Component C)

**What to click:** Custom SQL → use DML template buttons:

| Template | SQL |
|----------|-----|
| **INSERT Notice** | `INSERT INTO notices (title, content, audience, priority, posted_by) VALUES (...)` |
| **UPDATE Student** | `UPDATE students SET section = 'B' WHERE student_id = 1` |
| **DELETE Notice** | `DELETE FROM notices WHERE notice_id = 1` |

Execute each and observe "X row(s) affected" message.

**Say:** *"The admin panel supports full CRUD — Create, Read, Update, Delete. DDL (DROP, ALTER) is blocked for safety."*

---

### 15. EXPLAIN — Query Optimization (Component D — Investigation, 5 marks)

**What to click:**
1. Build any query (e.g., students + JOIN users)
2. Click **"Explain"** button in top bar
3. View the execution plan in the data grid

Shows: `id`, `select_type`, `table`, `type`, `possible_keys`, `key`, `rows`, `Extra`

**Say:** *"EXPLAIN shows MySQL's execution plan. We can see which indexes it uses, how many rows it scans, and whether it does a full table scan or uses an index lookup."*

Then click Theory Demos → **Indexing & EXPLAIN** to see all indexes in the database.

---

### 16. RBAC Security (Component D)

**What to click:** Theory Demos → **RBAC Security**

```sql
SELECT u.user_id, u.email, u.full_name,
  GROUP_CONCAT(DISTINCT r.role_name) AS roles,
  GROUP_CONCAT(DISTINCT p.perm_code) AS permissions
FROM users u LEFT JOIN user_roles ur ON ...
LEFT JOIN roles r ON ... LEFT JOIN role_permissions rp ON ...
LEFT JOIN permissions p ON ...
GROUP BY u.user_id
```

**Say:** *"Role-Based Access Control — each user has roles (admin, faculty, student), and each role has specific permissions. This is a many-to-many relationship using junction tables."*

---

### 17. Blockchain Ledger (Component D — Advanced Feature)

**What to click:** Theory Demos → **Blockchain Ledger**

Shows: `event_id`, `event_type`, `prev_hash`, `curr_hash`, `chain_status`

**Say:** *"Every data change is logged in an immutable ledger with SHA-256 hash chains. Each event stores the hash of the previous event, creating a tamper-evident audit trail — like a mini blockchain."*

---

### 18. Export CSV (Component D — Data Analysis)

**What to click:**
1. Run any query (e.g., Results template)
2. Click **"Export"** button in top bar
3. CSV file downloads

**Say:** *"Query results can be exported to CSV for further analysis in Excel or other tools."*

---

### 19. Save & Load Queries

**What to click:**
1. After building a query, type a title in **"Query Title"** (right drawer)
2. Click **"Save"** or **"Save As…"**
3. Query is saved to the `saved_queries` table

**Say:** *"Queries can be saved and reloaded, enabling reusable reports."*

---

## GUIDELINES CHECKLIST — What Each Admin Panel Feature Covers

| Guideline Component | Marks | Admin Panel Feature |
|---------------------|-------|---------------------|
| **A. Problem Identification** | 5 | Data Catalog (13 categories, 30+ tables) |
| **B. System Design — ER/Schema** | 5 | 3NF demo, FK Referential Integrity demo, Views demo |
| **C1. SELECT / WHERE / GROUP BY / HAVING** | — | Filter Rows, Group & Summarize operations |
| **C2. JOINs (INNER/LEFT/RIGHT)** | — | Visual Join operation with type selector |
| **C3. Nested/Correlated Subqueries** | — | Custom SQL → Notices template (correlated subquery) |
| **C4. Views** | — | Views in sidebar + Views theory demo |
| **C5. Triggers** | — | Triggers & Audit theory demo (11 triggers) |
| **C6. Transactions** | — | CALL sp_admit_student + ACID Transactions demo |
| **C7. Stored Procedures** | — | CALL Procedure template, Admit Student template |
| **D. Investigation & Analysis** | 5 | EXPLAIN, Indexing, RBAC, Ledger, Export CSV |
| **E. Report** | 5 | Screenshot each step above for the report |
| **F. Viva** | 10 | Live demo of all above — explain SQL shown on screen |

---

## QUICK 5-MINUTE DEMO SCRIPT (If Time Is Short)

1. **30s** — Show Data Catalog (30+ tables, 13 areas) → Component A
2. **30s** — Theory Demo: FK Referential Integrity → Component B  
3. **45s** — Click `students` → Add Join (users, INNER) → Show SQL → Execute → Component C (JOINs)
4. **30s** — Add Filter (batch_year = 2024) → Execute → Component C (WHERE)
5. **30s** — Select `enrollments` → Group by student_id, COUNT(*), HAVING > 3 → Component C (GROUP BY)
6. **30s** — Custom SQL: Notices template (subquery) → Execute → Component C (Subqueries)
7. **20s** — Click Views in sidebar → Component C (Views)
8. **20s** — Theory Demo: Triggers & Audit → Component C (Triggers)
9. **30s** — Custom SQL: CALL sp_admit_student → Execute → Component C (Transactions + Procedures)
10. **15s** — Click Explain button → Component D
11. **15s** — Theory Demo: RBAC → Component D
12. **15s** — Export CSV → Component D

**Total: ~5 minutes covering ALL Components A–D + F (live viva)**
