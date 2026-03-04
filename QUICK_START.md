# 🚀 Quick Start Guide - Student Portal Testing

## ✅ Current Status
- ✅ Backend dependencies installed
- ✅ Frontend files ready
- ✅ API Tester created with login functionality
- ⚠️ Database passwords need to be updated

## 📋 Setup Steps

### Step 1: Make Sure XAMPP Services are Running

Open XAMPP Control Panel and verify:
- ✅ MySQL is **Running** (green)
- ✅ Apache is **Running** (green)

---

### Step 2: Import Database (if not done yet)

**Method A: MySQL Workbench**
1. Open MySQL Workbench
2. Connect to local MySQL (127.0.0.1:3306, user: root, password: empty)
3. File → Open SQL Script
4. Select: `C:\Users\ifti2\Documents\DBMS\database\student_portal.sql`
5. Click Execute ⚡

**Method B: Command Line**
```powershell
# Open PowerShell
cd C:\xampp\mysql\bin
.\mysql.exe -u root

# In MySQL prompt:
source C:/Users/ifti2/Documents/DBMS/database/student_portal.sql
```

---

### Step 3: Update Passwords in Database

In MySQL Workbench, run this script:

**File → Open SQL Script → Select:** `C:\Users\ifti2\Documents\DBMS\database\update_passwords.sql`

Click Execute ⚡

This sets all user passwords to `password123`

---

### Step 4: Start Backend Server

```powershell
cd C:\Users\ifti2\Documents\DBMS\backend
node server.js
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║         STUDENT PORTAL BACKEND SERVER                      ║
║  Status:    Running                                        ║
║  Port:      3000                                           ║
╚════════════════════════════════════════════════════════════╝
```

**Keep this terminal open!**

---

### Step 5: Open API Tester

Open in browser:
```
C:\Users\ifti2\Documents\DBMS\api-tester.html
```

Or via Apache:
```
http://localhost/student-portal/api-tester.html
```

---

## 🧪 Testing the Complete System

### Test 1: Login

1. In API Tester, the login form should show:
   - Email: `iftekhar.hossain@diu.edu.bd`
   - Password: `password123`

2. Click **"Login"** button

3. You should see: ✅ Login Successful!

4. Authentication status will change to: **Logged in ✓**

---

### Test 2: Test API Endpoints

Now that you're logged in, try these:

**Click "Get Grade Scale"** 
- Should show: A+, A, B+, B-, C+, C, D, F grades

**Click "Get Departments"**
- Should show: CSE, EEE, BBA, etc.

**Click "Get All Courses"**
- Should show courses like CSE101, CSE102, etc.

---

### Test 3: Verify in Database

After each API call, verify in MySQL Workbench:

```sql
USE student_portal;

-- Check grade scale
SELECT * FROM grade_scale ORDER BY min_marks DESC;

-- Check departments  
SELECT * FROM departments;

-- Check courses
SELECT * FROM courses;
```

Data should match!

---

### Test 4: Make a Change and Track It

**Step A: Add new course in MySQL Workbench**
```sql
USE student_portal;

INSERT INTO courses (dept_id, course_code, title, credit, category)
VALUES (1, 'CSE499', 'Final Year Project', 6, 'Project');
```

**Step B: View via API**
- Click "Get All Courses" in API Tester
- Your new course should appear!

**Step C: Check Audit Log**
```sql
SELECT * FROM audit_logs 
WHERE table_name = 'courses' 
ORDER BY created_at DESC 
LIMIT 1;
```

You'll see the INSERT was automatically logged!

---

## 🌐 Access Your App

| Component | URL |
|-----------|-----|
| **Frontend Dashboard** | http://localhost/student-portal/index.html |
| **API Tester** | http://localhost/student-portal/api-tester.html |
| **API Health** | http://localhost:3000/api/health |
| **MySQL Workbench** | Connect to 127.0.0.1:3306 |

---

## 👥 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | iftekhar.hossain@diu.edu.bd | password123 |
| **Admin** | admin@diu.edu.bd | password123 |
| **Faculty** | dr.akter@diu.edu.bd | password123 |

---

## 🔧 Troubleshooting

### Issue: "Login Failed"
**Solution:** Run `update_passwords.sql` in MySQL Workbench

### Issue: "EADDRINUSE port 3000"
**Solution:** 
```powershell
Get-Process -Name node | Stop-Process -Force
```
Then restart server

### Issue: "Database connection failed"
**Solution:** Check XAMPP MySQL is running

### Issue: "Authentication Required"
**Solution:** Click "Login" button first in API Tester

---

## 📊 Monitoring Tools

1. **Backend Terminal** - Shows all API requests in real-time
2. **API Tester** - Visual testing interface
3. **MySQL Workbench** - Database inspection
4. **Test Queries File** - Ready-to-use SQL queries

---

## 🎯 Quick Test Checklist

- [ ] XAMPP MySQL and Apache running
- [ ] Database imported (student_portal)
- [ ] Passwords updated (run update_passwords.sql)
- [ ] Backend server started (node server.js)
- [ ] API Tester opened in browser
- [ ] Successfully logged in
- [ ] API endpoints return data
- [ ] Database queries match API responses

---

All set! 🎉 Your Student Portal is fully functional!
