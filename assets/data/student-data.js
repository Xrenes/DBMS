/**
 * Student Portal - Mock Student Data
 * Bangladesh Grading System (4.0 Scale)
 * Currency: Bangladeshi Taka (৳)
 */

// Bangladesh Grade Scale
const bdGradeScale = [
  { min: 80, max: 100, letter: 'A+', point: 4.00, remark: 'Outstanding', isPass: true },
  { min: 75, max: 79,  letter: 'A',  point: 3.75, remark: 'Excellent', isPass: true },
  { min: 70, max: 74,  letter: 'A-', point: 3.50, remark: 'Very Good', isPass: true },
  { min: 65, max: 69,  letter: 'B+', point: 3.25, remark: 'Good', isPass: true },
  { min: 60, max: 64,  letter: 'B',  point: 3.00, remark: 'Satisfactory', isPass: true },
  { min: 55, max: 59,  letter: 'B-', point: 2.75, remark: 'Above Average', isPass: true },
  { min: 50, max: 54,  letter: 'C+', point: 2.50, remark: 'Average', isPass: true },
  { min: 45, max: 49,  letter: 'C',  point: 2.25, remark: 'Below Average', isPass: true },
  { min: 40, max: 44,  letter: 'D',  point: 2.00, remark: 'Pass', isPass: true },
  { min: 0,  max: 39,  letter: 'F',  point: 0.00, remark: 'Fail', isPass: false }
];

// Grade to Point mapping for quick lookup
const gradeToPoint = {
  'A+': 4.00, 'A': 3.75, 'A-': 3.50,
  'B+': 3.25, 'B': 3.00, 'B-': 2.75,
  'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00
};

const studentData = {
  // Student Profile
  profile: {
    id: "2021301001",
    name: "Md. Iftekhar Hossain",
    firstName: "Iftekhar",
    lastName: "Hossain",
    fullName: "Md. Iftekhar Hossain",
    email: "iftekhar.hossain@diu.edu.bd",
    phone: "+880 1712-345678",
    dob: "2003-05-15",
    gender: "Male",
    bloodGroup: "B+",
    address: "House 45, Road 12, Dhanmondi, Dhaka-1209",
    program: "B.Sc. in Computer Science & Engineering",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Science & Information Technology",
    university: "Daffodil International University",
    batch: "2021-2025",
    section: "A",
    currentSemester: 6,
    enrollmentDate: "2021-01-15",
    advisor: "Dr. Syed Akter Hossain",
    rollNumber: "CSE2021001",
    photoUrl: null
  },

  // Academic Summary
  academic: {
    cgpa: 3.52,
    totalCredits: 144,
    earnedCredits: 144,
    majorCredits: 112,
    minorCredits: 32,
    completedSemesters: 6,
    majorCGPA: 3.58,
    minorCGPA: 3.42
  },

  // Semester-wise Data with BD grading
  semesters: [
    {
      id: 1,
      name: "Semester 1",
      session: "Spring 2021",
      year: "2021",
      sgpa: 3.35,
      totalCredits: 24,
      majorCredits: 18,
      minorCredits: 6,
      courses: [
        { code: "CSE101", name: "Introduction to Computer Science", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE102", name: "Structured Programming", credits: 3, grade: "A-", point: 3.50, marks: 72, category: "Major" },
        { code: "MAT101", name: "Differential Calculus", credits: 3, grade: "B", point: 3.00, marks: 62, category: "Major" },
        { code: "PHY101", name: "Physics I", credits: 3, grade: "B+", point: 3.25, marks: 66, category: "Major" },
        { code: "EEE101", name: "Basic Electrical Engineering", credits: 3, grade: "B", point: 3.00, marks: 60, category: "Major" },
        { code: "ENG101", name: "English I", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Major" },
        { code: "BAN101", name: "Bangla", credits: 3, grade: "A", point: 3.75, marks: 78, category: "Minor" },
        { code: "GED101", name: "Bangladesh Studies", credits: 3, grade: "A-", point: 3.50, marks: 73, category: "Minor" }
      ]
    },
    {
      id: 2,
      name: "Semester 2",
      session: "Summer 2021",
      year: "2021",
      sgpa: 3.42,
      totalCredits: 24,
      majorCredits: 18,
      minorCredits: 6,
      courses: [
        { code: "CSE201", name: "Data Structures", credits: 3, grade: "A-", point: 3.50, marks: 71, category: "Major" },
        { code: "CSE202", name: "Object Oriented Programming", credits: 3, grade: "B+", point: 3.25, marks: 67, category: "Major" },
        { code: "MAT201", name: "Integral Calculus", credits: 3, grade: "B+", point: 3.25, marks: 65, category: "Major" },
        { code: "PHY201", name: "Physics II", credits: 3, grade: "B", point: 3.00, marks: 61, category: "Major" },
        { code: "EEE201", name: "Electronic Devices", credits: 3, grade: "B+", point: 3.25, marks: 66, category: "Major" },
        { code: "ENG201", name: "English II", credits: 3, grade: "A", point: 3.75, marks: 77, category: "Major" },
        { code: "SOC201", name: "Sociology", credits: 3, grade: "A", point: 3.75, marks: 79, category: "Minor" },
        { code: "GED201", name: "History of Liberation War", credits: 3, grade: "A-", point: 3.50, marks: 74, category: "Minor" }
      ]
    },
    {
      id: 3,
      name: "Semester 3",
      session: "Fall 2021",
      year: "2021",
      sgpa: 3.48,
      totalCredits: 24,
      majorCredits: 20,
      minorCredits: 4,
      courses: [
        { code: "CSE301", name: "Database Management Systems", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Major" },
        { code: "CSE302", name: "Algorithms", credits: 3, grade: "A-", point: 3.50, marks: 72, category: "Major" },
        { code: "CSE303", name: "Computer Architecture", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE304", name: "Discrete Mathematics", credits: 3, grade: "B+", point: 3.25, marks: 67, category: "Major" },
        { code: "CSE305", name: "Software Engineering", credits: 3, grade: "A-", point: 3.50, marks: 73, category: "Major" },
        { code: "MAT301", name: "Linear Algebra", credits: 3, grade: "B", point: 3.00, marks: 63, category: "Major" },
        { code: "CSE306", name: "Data Structures Lab", credits: 2, grade: "A", point: 3.75, marks: 78, category: "Major" },
        { code: "ECO301", name: "Economics", credits: 2, grade: "A-", point: 3.50, marks: 74, category: "Minor" },
        { code: "ACC301", name: "Accounting", credits: 2, grade: "A", point: 3.75, marks: 77, category: "Minor" }
      ]
    },
    {
      id: 4,
      name: "Semester 4",
      session: "Spring 2022",
      year: "2022",
      sgpa: 3.55,
      totalCredits: 24,
      majorCredits: 20,
      minorCredits: 4,
      courses: [
        { code: "CSE401", name: "Operating Systems", credits: 3, grade: "A", point: 3.75, marks: 75, category: "Major" },
        { code: "CSE402", name: "Computer Networks", credits: 3, grade: "A-", point: 3.50, marks: 71, category: "Major" },
        { code: "CSE403", name: "Theory of Computation", credits: 3, grade: "B+", point: 3.25, marks: 66, category: "Major" },
        { code: "CSE404", name: "Numerical Methods", credits: 3, grade: "A-", point: 3.50, marks: 70, category: "Major" },
        { code: "CSE405", name: "Web Technologies", credits: 3, grade: "A+", point: 4.00, marks: 82, category: "Major" },
        { code: "MAT401", name: "Statistics & Probability", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE406", name: "DBMS Lab", credits: 2, grade: "A", point: 3.75, marks: 79, category: "Major" },
        { code: "MGT401", name: "Principles of Management", credits: 2, grade: "A", point: 3.75, marks: 76, category: "Minor" },
        { code: "PSY401", name: "Psychology", credits: 2, grade: "A-", point: 3.50, marks: 73, category: "Minor" }
      ]
    },
    {
      id: 5,
      name: "Semester 5",
      session: "Summer 2022",
      year: "2022",
      sgpa: 3.62,
      totalCredits: 24,
      majorCredits: 18,
      minorCredits: 6,
      courses: [
        { code: "CSE501", name: "Machine Learning", credits: 3, grade: "A+", point: 4.00, marks: 84, category: "Major" },
        { code: "CSE502", name: "Compiler Design", credits: 3, grade: "A-", point: 3.50, marks: 72, category: "Major" },
        { code: "CSE503", name: "Information Security", credits: 3, grade: "A", point: 3.75, marks: 77, category: "Major" },
        { code: "CSE504", name: "Cloud Computing", credits: 3, grade: "A-", point: 3.50, marks: 74, category: "Major" },
        { code: "CSE505", name: "Mobile Application Development", credits: 3, grade: "B+", point: 3.25, marks: 69, category: "Major" },
        { code: "CSE506", name: "Software Engineering Lab", credits: 3, grade: "A", point: 3.75, marks: 78, category: "Major" },
        { code: "MGT501", name: "Entrepreneurship", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Minor" },
        { code: "MKT501", name: "Digital Marketing", credits: 3, grade: "A+", point: 4.00, marks: 82, category: "Minor" }
      ]
    },
    {
      id: 6,
      name: "Semester 6",
      session: "Fall 2022",
      year: "2022",
      sgpa: 3.68,
      totalCredits: 24,
      majorCredits: 18,
      minorCredits: 6,
      courses: [
        { code: "CSE601", name: "Advanced Database Systems", credits: 3, grade: "A+", point: 4.00, marks: 85, category: "Major" },
        { code: "CSE602", name: "Distributed Systems", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Major" },
        { code: "CSE603", name: "Deep Learning", credits: 3, grade: "A", point: 3.75, marks: 78, category: "Major" },
        { code: "CSE604", name: "Big Data Analytics", credits: 3, grade: "A-", point: 3.50, marks: 74, category: "Major" },
        { code: "CSE605", name: "DevOps Practices", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE606", name: "Project I", credits: 3, grade: "A", point: 3.75, marks: 77, category: "Major" },
        { code: "MGT601", name: "Project Management", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Minor" },
        { code: "FIN601", name: "Financial Literacy", credits: 3, grade: "A+", point: 4.00, marks: 81, category: "Minor" }
      ]
    }
  ],

  // Live Result Data (Current Semester Components)
  liveResults: {
    semester: "Spring 2026",
    courses: [
      {
        code: "CSE701",
        name: "Artificial Intelligence",
        credits: 3,
        teacher: "Dr. Md. Mahfuzur Rahman",
        section: "A",
        components: [
          { name: "Quiz 1", obtained: 8, total: 10, weight: 5, published: true, publishedAt: "2026-02-01" },
          { name: "Quiz 2", obtained: 9, total: 10, weight: 5, published: true, publishedAt: "2026-02-15" },
          { name: "Quiz 3", obtained: null, total: 10, weight: 5, published: false },
          { name: "Assignment 1", obtained: 18, total: 20, weight: 10, published: true, publishedAt: "2026-02-10" },
          { name: "Assignment 2", obtained: null, total: 20, weight: 10, published: false },
          { name: "Midterm", obtained: 35, total: 40, weight: 25, published: true, publishedAt: "2026-02-20" },
          { name: "Presentation", obtained: null, total: 10, weight: 10, published: false },
          { name: "Attendance", obtained: 9, total: 10, weight: 5, published: true, publishedAt: "2026-02-25" },
          { name: "Final", obtained: null, total: 50, weight: 25, published: false }
        ]
      },
      {
        code: "CSE702",
        name: "Software Architecture",
        credits: 3,
        teacher: "Prof. Touhid Bhuiyan",
        section: "A",
        components: [
          { name: "Quiz 1", obtained: 7, total: 10, weight: 5, published: true, publishedAt: "2026-02-03" },
          { name: "Quiz 2", obtained: 8, total: 10, weight: 5, published: true, publishedAt: "2026-02-17" },
          { name: "Quiz 3", obtained: null, total: 10, weight: 5, published: false },
          { name: "Assignment 1", obtained: 17, total: 20, weight: 10, published: true, publishedAt: "2026-02-08" },
          { name: "Assignment 2", obtained: null, total: 20, weight: 10, published: false },
          { name: "Midterm", obtained: 32, total: 40, weight: 25, published: true, publishedAt: "2026-02-22" },
          { name: "Presentation", obtained: null, total: 10, weight: 10, published: false },
          { name: "Attendance", obtained: 8, total: 10, weight: 5, published: true, publishedAt: "2026-02-25" },
          { name: "Final", obtained: null, total: 50, weight: 25, published: false }
        ]
      },
      {
        code: "CSE703",
        name: "Internet of Things",
        credits: 3,
        teacher: "Dr. Sheak Rashed Haider Noori",
        section: "A",
        components: [
          { name: "Quiz 1", obtained: 9, total: 10, weight: 5, published: true, publishedAt: "2026-02-02" },
          { name: "Quiz 2", obtained: 8, total: 10, weight: 5, published: true, publishedAt: "2026-02-16" },
          { name: "Quiz 3", obtained: null, total: 10, weight: 5, published: false },
          { name: "Assignment 1", obtained: 19, total: 20, weight: 10, published: true, publishedAt: "2026-02-12" },
          { name: "Assignment 2", obtained: null, total: 20, weight: 10, published: false },
          { name: "Midterm", obtained: 36, total: 40, weight: 25, published: true, publishedAt: "2026-02-21" },
          { name: "Lab Work", obtained: 8, total: 10, weight: 10, published: true, publishedAt: "2026-02-24" },
          { name: "Attendance", obtained: 10, total: 10, weight: 5, published: true, publishedAt: "2026-02-25" },
          { name: "Final", obtained: null, total: 50, weight: 25, published: false }
        ]
      },
      {
        code: "CSE704",
        name: "Blockchain Technology",
        credits: 3,
        teacher: "Dr. Imran Mahmud",
        section: "A",
        components: [
          { name: "Quiz 1", obtained: 8, total: 10, weight: 5, published: true, publishedAt: "2026-02-04" },
          { name: "Quiz 2", obtained: 9, total: 10, weight: 5, published: true, publishedAt: "2026-02-18" },
          { name: "Quiz 3", obtained: null, total: 10, weight: 5, published: false },
          { name: "Assignment 1", obtained: 16, total: 20, weight: 10, published: true, publishedAt: "2026-02-11" },
          { name: "Assignment 2", obtained: null, total: 20, weight: 10, published: false },
          { name: "Midterm", obtained: 33, total: 40, weight: 25, published: true, publishedAt: "2026-02-23" },
          { name: "Project Demo", obtained: null, total: 10, weight: 10, published: false },
          { name: "Attendance", obtained: 9, total: 10, weight: 5, published: true, publishedAt: "2026-02-25" },
          { name: "Final", obtained: null, total: 50, weight: 25, published: false }
        ]
      },
      {
        code: "CSE705",
        name: "Project II",
        credits: 3,
        teacher: "Dr. Syed Akter Hossain",
        section: "A",
        components: [
          { name: "Proposal", obtained: 9, total: 10, weight: 10, published: true, publishedAt: "2026-02-05" },
          { name: "Literature Review", obtained: 17, total: 20, weight: 15, published: true, publishedAt: "2026-02-20" },
          { name: "Progress Report", obtained: null, total: 20, weight: 20, published: false },
          { name: "Mid Presentation", obtained: 18, total: 20, weight: 20, published: true, publishedAt: "2026-02-25" },
          { name: "Final Presentation", obtained: null, total: 20, weight: 20, published: false },
          { name: "Documentation", obtained: null, total: 10, weight: 15, published: false }
        ]
      }
    ]
  },

  // Attendance Data
  attendance: {
    overall: 87,
    monthlyTrend: [85, 82, 88, 90, 87, 84, 89, 91, 86, 87],
    subjects: [
      { code: "CSE701", name: "Artificial Intelligence", held: 45, present: 40, absent: 5, percent: 89, status: "safe" },
      { code: "CSE702", name: "Software Architecture", held: 42, present: 35, absent: 7, percent: 83, status: "warning" },
      { code: "CSE703", name: "Internet of Things", held: 40, present: 38, absent: 2, percent: 95, status: "safe" },
      { code: "CSE704", name: "Blockchain Technology", held: 38, present: 34, absent: 4, percent: 89, status: "safe" },
      { code: "CSE705", name: "Project II", held: 36, present: 28, absent: 8, percent: 78, status: "danger" },
      { code: "MGT701", name: "Business Communication", held: 30, present: 28, absent: 2, percent: 93, status: "safe" }
    ]
  },

  // Timetable (Bangladesh week: Sat-Thu, Friday off)
  timetable: {
    slots: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"],
    days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
    schedule: [
      // Saturday
      [
        { subject: "CSE701", name: "Artificial Intelligence", room: "PC Lab-5", faculty: "Dr. Rahman", type: "lecture" },
        null,
        { subject: "CSE702", name: "Software Architecture", room: "Room 401", faculty: "Prof. Bhuiyan", type: "lecture" },
        null,
        { subject: "CSE703", name: "Internet of Things", room: "IoT Lab", faculty: "Dr. Noori", type: "lab" },
        { subject: "CSE703", name: "Internet of Things", room: "IoT Lab", faculty: "Dr. Noori", type: "lab" },
        null,
        null
      ],
      // Sunday
      [
        null,
        { subject: "CSE704", name: "Blockchain Technology", room: "Room 502", faculty: "Dr. Mahmud", type: "lecture" },
        null,
        { subject: "MGT701", name: "Business Communication", room: "Room 301", faculty: "Ms. Sultana", type: "lecture" },
        null,
        { subject: "CSE701", name: "AI Lab", room: "AI Lab", faculty: "Dr. Rahman", type: "lab" },
        { subject: "CSE701", name: "AI Lab", room: "AI Lab", faculty: "Dr. Rahman", type: "lab" },
        null
      ],
      // Monday
      [
        { subject: "CSE702", name: "Software Architecture", room: "Room 401", faculty: "Prof. Bhuiyan", type: "lecture" },
        null,
        { subject: "CSE705", name: "Project II", room: "Project Lab", faculty: "Dr. Hossain", type: "project" },
        { subject: "CSE705", name: "Project II", room: "Project Lab", faculty: "Dr. Hossain", type: "project" },
        { subject: "CSE703", name: "Internet of Things", room: "Room 403", faculty: "Dr. Noori", type: "lecture" },
        null,
        null,
        null
      ],
      // Tuesday
      [
        { subject: "CSE701", name: "Artificial Intelligence", room: "Room 501", faculty: "Dr. Rahman", type: "lecture" },
        null,
        { subject: "CSE704", name: "Blockchain Technology", room: "Room 502", faculty: "Dr. Mahmud", type: "lecture" },
        null,
        null,
        { subject: "CSE704", name: "Blockchain Lab", room: "PC Lab-3", faculty: "Dr. Mahmud", type: "lab" },
        { subject: "CSE704", name: "Blockchain Lab", room: "PC Lab-3", faculty: "Dr. Mahmud", type: "lab" },
        null
      ],
      // Wednesday
      [
        null,
        { subject: "MGT701", name: "Business Communication", room: "Room 301", faculty: "Ms. Sultana", type: "lecture" },
        { subject: "CSE702", name: "Software Architecture", room: "Room 401", faculty: "Prof. Bhuiyan", type: "lecture" },
        null,
        { subject: "CSE705", name: "Project II", room: "Project Lab", faculty: "Dr. Hossain", type: "project" },
        { subject: "CSE705", name: "Project II", room: "Project Lab", faculty: "Dr. Hossain", type: "project" },
        null,
        null
      ],
      // Thursday
      [
        { subject: "CSE703", name: "Internet of Things", room: "Room 403", faculty: "Dr. Noori", type: "lecture" },
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    ]
  },

  // Exams
  exams: {
    upcoming: [
      {
        id: 1,
        subject: "CSE701",
        name: "Artificial Intelligence",
        type: "Final",
        date: "2026-04-15",
        time: "10:00 AM",
        duration: "3 hours",
        venue: "Exam Hall A",
        syllabus: ["Search Algorithms", "Machine Learning", "Neural Networks", "Expert Systems", "NLP"]
      },
      {
        id: 2,
        subject: "CSE702",
        name: "Software Architecture",
        type: "Final",
        date: "2026-04-17",
        time: "10:00 AM",
        duration: "3 hours",
        venue: "Exam Hall B",
        syllabus: ["Design Patterns", "Microservices", "REST APIs", "System Design", "UML"]
      },
      {
        id: 3,
        subject: "CSE703",
        name: "Internet of Things",
        type: "Final",
        date: "2026-04-19",
        time: "2:00 PM",
        duration: "3 hours",
        venue: "Exam Hall A",
        syllabus: ["Sensors", "MQTT Protocol", "Arduino", "Raspberry Pi", "Cloud Integration"]
      },
      {
        id: 4,
        subject: "CSE704",
        name: "Blockchain Technology",
        type: "Final",
        date: "2026-04-21",
        time: "10:00 AM",
        duration: "3 hours",
        venue: "Exam Hall C",
        syllabus: ["Cryptography", "Smart Contracts", "Ethereum", "Consensus", "DApps"]
      }
    ],
    results: [
      { semester: 1, mid: 65, end: 68, total: 67 },
      { semester: 2, mid: 68, end: 70, total: 69 },
      { semester: 3, mid: 70, end: 73, total: 72 },
      { semester: 4, mid: 72, end: 75, total: 74 },
      { semester: 5, mid: 75, end: 78, total: 77 },
      { semester: 6, mid: 78, end: 80, total: 79 }
    ],
    gradeDistribution: {
      "A+": 6,
      "A": 12,
      "A-": 10,
      "B+": 8,
      "B": 4,
      "B-": 2,
      "C+": 0,
      "C": 0,
      "D": 0,
      "F": 0
    }
  },

  // Finance (Bangladeshi Taka)
  finance: {
    summary: {
      totalCharges: 485000,
      totalPaid: 460000,
      outstanding: 25000,
      nextDueDate: "2026-04-01",
      nextDueAmount: 25000
    },
    balance: 25000,
    totalFees: 85000,
    paid: 60000,
    scholarship: 15000,
    feeStructure: [
      { type: "Tuition Fee", amount: 55000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Lab Fee", amount: 8000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Library Fee", amount: 3000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Development Fee", amount: 5000, dueDate: "Apr 01, 2026", status: "Pending" },
      { type: "Exam Fee", amount: 7000, dueDate: "Apr 01, 2026", status: "Pending" },
      { type: "Misc. Charges", amount: 7000, dueDate: "Apr 01, 2026", status: "Pending" }
    ],
    transactions: [
      { id: 1, date: "2021-01-15", description: "Tuition Fee - Sem 1", type: "charge", amount: 65000, balance: 65000, txnId: "TXN2021001" },
      { id: 2, date: "2021-01-20", description: "bKash Payment", type: "payment", amount: 65000, balance: 0, txnId: "BKP2021001" },
      { id: 3, date: "2021-05-01", description: "Tuition Fee - Sem 2", type: "charge", amount: 65000, balance: 65000, txnId: "TXN2021002" },
      { id: 4, date: "2021-05-10", description: "Nagad Payment", type: "payment", amount: 65000, balance: 0, txnId: "NGD2021001" },
      { id: 5, date: "2021-09-01", description: "Tuition Fee - Sem 3", type: "charge", amount: 70000, balance: 70000, txnId: "TXN2021003" },
      { id: 6, date: "2021-09-08", description: "Bank Transfer", type: "payment", amount: 70000, balance: 0, txnId: "BNK2021001" },
      { id: 7, date: "2022-01-01", description: "Tuition Fee - Sem 4", type: "charge", amount: 75000, balance: 75000, txnId: "TXN2022001" },
      { id: 8, date: "2022-01-05", description: "Merit Scholarship", type: "payment", amount: 15000, balance: 60000, txnId: "SCH2022001" },
      { id: 9, date: "2022-01-12", description: "bKash Payment", type: "payment", amount: 60000, balance: 0, txnId: "BKP2022001" },
      { id: 10, date: "2022-05-01", description: "Tuition Fee - Sem 5", type: "charge", amount: 80000, balance: 80000, txnId: "TXN2022002" },
      { id: 11, date: "2022-05-10", description: "bKash Payment", type: "payment", amount: 80000, balance: 0, txnId: "BKP2022002" },
      { id: 12, date: "2022-09-01", description: "Tuition Fee - Sem 6", type: "charge", amount: 80000, balance: 80000, txnId: "TXN2022003" },
      { id: 13, date: "2022-09-15", description: "Bank Transfer", type: "payment", amount: 60000, balance: 20000, txnId: "BNK2022001" },
      { id: 14, date: "2026-01-01", description: "Tuition Fee - Sem 7", type: "charge", amount: 85000, balance: 105000, txnId: "TXN2026001" },
      { id: 15, date: "2026-02-01", description: "Nagad Payment", type: "payment", amount: 80000, balance: 25000, txnId: "NGD2026001" }
    ],
    chargesPerSemester: [65000, 65000, 70000, 75000, 80000, 80000, 85000],
    paymentsPerSemester: [65000, 65000, 70000, 75000, 80000, 60000, 80000]
  },

  // Hostel
  hostel: {
    allocated: true,
    details: {
      hostelName: "Daffodil Tower - Block A",
      hostelType: "Boys",
      roomNumber: "A-304",
      floor: 3,
      bedNumber: 2,
      roomType: "Triple Sharing",
      roommates: [
        { name: "Mohammad Tanvir Ahmed", rollNo: "CSE2021015" },
        { name: "Sakib Al Hasan", rollNo: "CSE2021022" }
      ],
      warden: {
        name: "Mr. Abdul Karim",
        phone: "+880 1812-345678",
        email: "warden.blocka@diu.edu.bd"
      },
      facilities: ["WiFi", "Laundry", "Common Room", "Gym", "Canteen", "24/7 Security"],
      messTimings: {
        breakfast: "7:30 AM - 9:00 AM",
        lunch: "1:00 PM - 2:30 PM",
        snacks: "5:00 PM - 6:00 PM",
        dinner: "8:00 PM - 9:30 PM"
      }
    },
    complaints: [
      { id: 1, date: "2026-01-15", type: "Maintenance", description: "AC not cooling properly", status: "Resolved" },
      { id: 2, date: "2026-02-10", type: "Electrical", description: "Fan making noise", status: "In Progress" }
    ],
    feeDetails: {
      annualFee: 48000,
      paid: 48000,
      pending: 0
    }
  },

  // Transport
  transport: {
    enrolled: true,
    details: {
      routeNumber: "Route 12",
      routeName: "Dhanmondi - DIU Express",
      busNumber: "Dhaka Metro BA-11-1234",
      driver: {
        name: "Mohammad Rahim",
        phone: "+880 1912-345678"
      },
      pickupPoint: "Dhanmondi 27",
      pickupTime: "7:30 AM",
      dropTime: "6:30 PM",
      stops: [
        { name: "Dhanmondi 27", time: "7:30 AM" },
        { name: "Science Lab", time: "7:45 AM" },
        { name: "Farmgate", time: "8:00 AM" },
        { name: "Bijoy Sarani", time: "8:15 AM" },
        { name: "DIU Campus", time: "8:45 AM" }
      ]
    },
    feeDetails: {
      semesterFee: 6000,
      paid: 6000,
      pending: 0,
      validTill: "2026-06-30"
    },
    requests: [
      { id: 1, date: "2025-08-01", type: "Route Change", from: "Route 8", to: "Route 12", status: "Approved" }
    ]
  },

  // Notifications
  notifications: [
    { id: 1, type: "exam", title: "Final Exam Schedule Released", message: "Check your exam schedule for April 2026", time: "2 hours ago", read: false },
    { id: 2, type: "fee", title: "Payment Reminder", message: "Outstanding balance of ৳25,000 due by April 1", time: "1 day ago", read: false },
    { id: 3, type: "attendance", title: "Low Attendance Warning", message: "Your attendance in Project II is below 80%", time: "2 days ago", read: true },
    { id: 4, type: "academic", title: "Midterm Results Published", message: "Spring 2026 midterm results are now available", time: "1 week ago", read: true },
    { id: 5, type: "result", title: "Live Result Updated", message: "New marks published for CSE701", time: "3 hours ago", read: false }
  ]
};

// Helper functions for data access
const StudentPortal = {
  // Get grade info from marks
  getGradeFromMarks(marks) {
    return bdGradeScale.find(g => marks >= g.min && marks <= g.max) || bdGradeScale[bdGradeScale.length - 1];
  },

  // Get grade point from letter
  getGradePoint(letter) {
    return gradeToPoint[letter] || 0;
  },

  // Get current semester data
  getCurrentSemester() {
    return studentData.semesters.find(s => s.id === studentData.profile.currentSemester);
  },

  // Get semester by ID
  getSemester(id) {
    return studentData.semesters.find(s => s.id === id);
  },

  // Calculate CGPA from semesters (BD 4.0 Scale)
  calculateCGPA(semesters = studentData.semesters) {
    let totalCredits = 0;
    let totalPoints = 0;
    
    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  // Calculate Major CGPA
  calculateMajorCGPA(semesters = studentData.semesters) {
    let totalCredits = 0;
    let totalPoints = 0;
    
    semesters.forEach(sem => {
      sem.courses.filter(c => c.category === "Major").forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  // Calculate Minor CGPA
  calculateMinorCGPA(semesters = studentData.semesters) {
    let totalCredits = 0;
    let totalPoints = 0;
    
    semesters.forEach(sem => {
      sem.courses.filter(c => c.category === "Minor").forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  // Calculate live result for a course
  calculateLiveResult(courseCode) {
    const course = studentData.liveResults.courses.find(c => c.code === courseCode);
    if (!course) return null;

    const published = course.components.filter(c => c.published && c.obtained !== null);
    let weightedScore = 0;
    let totalWeight = 0;

    published.forEach(comp => {
      const score = (comp.obtained / comp.total) * comp.weight;
      weightedScore += score;
      totalWeight += comp.weight;
    });

    const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const estimatedTotal = weightedScore;
    const gradeInfo = this.getGradeFromMarks(percentage);

    return {
      weightedScore: weightedScore.toFixed(2),
      percentage: percentage.toFixed(1),
      estimatedGrade: gradeInfo.letter,
      estimatedPoint: gradeInfo.point,
      publishedWeight: totalWeight,
      remainingWeight: 100 - totalWeight,
      missingComponents: course.components.filter(c => !c.published).map(c => c.name)
    };
  },

  // Get next class from timetable
  getNextClass() {
    const now = new Date();
    let dayIndex = now.getDay();
    // BD week: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6 (holiday)
    // JS: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    // Convert: Sat(6)->0, Sun(0)->1, Mon(1)->2, Tue(2)->3, Wed(3)->4, Thu(4)->5
    const dayMap = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
    dayIndex = dayMap[dayIndex];
    
    if (dayIndex === undefined) {
      return { message: "No classes today! Enjoy your Friday." };
    }
    
    const currentHour = now.getHours();
    const schedule = studentData.timetable.schedule[dayIndex];
    const slots = studentData.timetable.slots;
    
    for (let i = 0; i < schedule.length; i++) {
      if (!schedule[i]) continue;
      const slotHour = parseInt(slots[i].split(':')[0]) + (slots[i].includes('PM') && !slots[i].includes('12') ? 12 : 0);
      
      if (slotHour >= currentHour) {
        return {
          subject: schedule[i].name,
          time: slots[i],
          room: schedule[i].room,
          faculty: schedule[i].faculty
        };
      }
    }
    
    return { message: "No more classes today!" };
  },

  // Get unread notifications count
  getUnreadCount() {
    return studentData.notifications.filter(n => !n.read).length;
  },

  // Days until exam
  getDaysUntilExam(examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  // Format currency (Bangladeshi Taka)
  formatCurrency(amount) {
    return '৳' + new Intl.NumberFormat('en-BD', {
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Get grade scale
  getGradeScale() {
    return bdGradeScale;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { studentData, StudentPortal, bdGradeScale, gradeToPoint };
}
