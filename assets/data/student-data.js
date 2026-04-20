/**
 * Student Portal -- Mock Student Data (3 Profiles)
 * Daffodil International University -- BSc in CSE
 * Bangladesh Grading System (4.0 Scale)
 * Currency: Bangladeshi Taka (Tk.)
 *
 * Profile selector at the bottom reads localStorage('portal_student_type'):
 *   'new'       -> Newly Admitted Student (added by admin, minimal data)
 *   'current'   -> Current Mid-Journey Student (6 trimesters done)
 *   'completed' -> Fully Graduated Student (12 trimesters, 130 credits)
 */

// ================================================================
// SHARED -- Bangladesh Grade Scale
// ================================================================
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

const gradeToPoint = {
  'A+': 4.00, 'A': 3.75, 'A-': 3.50,
  'B+': 3.25, 'B': 3.00, 'B-': 2.75,
  'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00
};


// ================================================================
// PROFILE 1 -- NEWLY ADMITTED STUDENT (added by admin)
// ================================================================
// > Filled by admin at admission:
//     name, email, phone, ID, program, department, batch, section,
//     enrollment date, guardian info, admission fee.
// > To be updated later:
//     courses, results, attendance, timetable,
//     live results, exam schedule.
// ================================================================
const newStudentData = {
  profile: {
    id: "261-15-6006",
    name: "Rahima Akter",
    firstName: "Rahima",
    lastName: "Akter",
    fullName: "Rahima Akter",
    email: "rahima15-6006@diu.edu.bd",
    phone: "+880 1856-123456",
    dob: "2007-09-12",
    gender: "Female",
    bloodGroup: "A+",
    address: "House 12, Road 5, Uttara Sector-7, Dhaka-1230",
    program: "B.Sc. in Computer Science & Engineering",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Science & Information Technology",
    university: "Daffodil International University",
    batch: "66th",
    section: "PC-A",
    currentSemester: 0,
    enrollmentDate: "2026-04-15",
    advisor: "To be assigned",
    rollNumber: "--",
    photoUrl: null,
    // Extra: fields filled by admin during sp_admit_student
    guardianName: "Md. Kamal Hossain",
    guardianPhone: "+880 1712-654321",
    guardianRelation: "Father",
    admissionOfficer: "admin@diu.edu.bd",
    admissionStatus: "Admitted -- Pending Course Registration",
    pendingUpdates: [
      "Course Registration (Trimester 1)",
      "Section & Routine Assignment",
      "Student ID Card Photo Upload",
      "Bank Account / Mobile Banking Link"
    ]
  },

  academic: {
    cgpa: 0,
    totalCredits: 132,
    earnedCredits: 0,
    majorCredits: 0,
    minorCredits: 0,
    completedSemesters: 0,
    majorCGPA: 0,
    minorCGPA: 0
  },

  semesters: [],

  liveResults: { semester: "Spring 2026", courses: [] },

  attendance: {
    overall: 0,
    monthlyTrend: [],
    subjects: []
  },

  timetable: {
    slots: ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"],
    days: ["Sat","Sun","Mon","Tue","Wed","Thu"],
    schedule: [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]]
  },

  exams: { upcoming: [], results: [], gradeDistribution: {} },

  finance: {
    summary: { totalCharges: 0, totalPaid: 0, outstanding: 0, nextDueDate: null, nextDueAmount: 0 },
    balance: 0,
    totalFees: 0,
    paid: 0,
    scholarship: 0,
    feeStructure: [],
    transactions: [],
    chargesPerSemester: [],
    paymentsPerSemester: []
  },

  notifications: []
};


// ================================================================
// PROFILE 2 -- CURRENT MID-JOURNEY STUDENT (Trimester 7)
// Real DIU CSE courses -- 6 trimesters completed, 78 credits earned
// ================================================================
const currentStudentData = {
  profile: {
    id: "241-15-5765",
    name: "Iftekhar Hossain",
    firstName: "Iftekhar",
    lastName: "Hossain",
    fullName: "Iftekhar Hossain",
    email: "iftekhar15-5765@diu.edu.bd",
    phone: "+880 1712-345678",
    dob: "2005-05-15",
    gender: "Male",
    bloodGroup: "B+",
    address: "House 45, Road 12, Mirpur, Dhaka-1209",
    program: "B.Sc. in Computer Science & Engineering",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Science & Information Technology",
    university: "Daffodil International University",
    batch: "64th",
    section: "PC-A",
    currentSemester: 7,
    enrollmentDate: "2024-01-10",
    advisor: "Dr. Sheak Rashed Haider Noori",
    rollNumber: "241-15-5765",
    photoUrl: null
  },

  academic: {
    cgpa: 3.42,
    totalCredits: 132,
    earnedCredits: 78,
    majorCredits: 72,
    minorCredits: 6,
    completedSemesters: 6,
    majorCGPA: 3.40,
    minorCGPA: 3.69
  },

  semesters: [
    {
      id: 1, name: "Trimester 1", session: "Spring 2024", year: "2024",
      sgpa: 3.19, totalCredits: 13.5, majorCredits: 12, minorCredits: 1.5,
      courses: [
        { code: "CSE 111", name: "Introduction to Computer Studies", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE 133", name: "Structured Programming Language", credits: 3, grade: "B", point: 3.00, marks: 62, category: "Major" },
        { code: "MAT 111", name: "Differential Calculus & Coordinate Geometry", credits: 3, grade: "B", point: 3.00, marks: 60, category: "Major" },
        { code: "PHY 111", name: "Physics I (Mechanics, Waves & Oscillation)", credits: 3, grade: "B+", point: 3.25, marks: 66, category: "Major" },
        { code: "GED 111", name: "Bangla I", credits: 1.5, grade: "A", point: 3.75, marks: 78, category: "Minor" }
      ]
    },
    {
      id: 2, name: "Trimester 2", session: "Summer 2024", year: "2024",
      sgpa: 3.28, totalCredits: 13.5, majorCredits: 12, minorCredits: 1.5,
      courses: [
        { code: "CSE 131", name: "Fundamentals of Data Structures", credits: 3, grade: "B+", point: 3.25, marks: 67, category: "Major" },
        { code: "CSE 134", name: "Object Oriented Programming", credits: 3, grade: "A-", point: 3.50, marks: 71, category: "Major" },
        { code: "MAT 121", name: "Integral Calculus & Ordinary Differential Equations", credits: 3, grade: "B+", point: 3.25, marks: 65, category: "Major" },
        { code: "PHY 121", name: "Physics II (Electricity & Magnetism)", credits: 3, grade: "B", point: 3.00, marks: 61, category: "Major" },
        { code: "GED 121", name: "Bangladesh Studies", credits: 1.5, grade: "A-", point: 3.50, marks: 74, category: "Minor" }
      ]
    },
    {
      id: 3, name: "Trimester 3", session: "Fall 2024", year: "2024",
      sgpa: 3.44, totalCredits: 12, majorCredits: 12, minorCredits: 0,
      courses: [
        { code: "CSE 231", name: "Advanced Data Structures", credits: 3, grade: "A-", point: 3.50, marks: 72, category: "Major" },
        { code: "CSE 233", name: "Algorithm Design & Analysis", credits: 3, grade: "A-", point: 3.50, marks: 70, category: "Major" },
        { code: "CSE 232", name: "Database Management Systems", credits: 3, grade: "A", point: 3.75, marks: 76, category: "Major" },
        { code: "MAT 211", name: "Linear Algebra & Fourier Analysis", credits: 3, grade: "B", point: 3.00, marks: 63, category: "Major" }
      ]
    },
    {
      id: 4, name: "Trimester 4", session: "Spring 2025", year: "2025",
      sgpa: 3.44, totalCredits: 12, majorCredits: 12, minorCredits: 0,
      courses: [
        { code: "CSE 234", name: "Discrete Mathematics", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE 235", name: "Digital Logic & Circuit Design", credits: 3, grade: "A-", point: 3.50, marks: 72, category: "Major" },
        { code: "CSE 236", name: "Theory of Computation", credits: 3, grade: "B+", point: 3.25, marks: 66, category: "Major" },
        { code: "MAT 361", name: "Statistics & Probability", credits: 3, grade: "A", point: 3.75, marks: 75, category: "Major" }
      ]
    },
    {
      id: 5, name: "Trimester 5", session: "Summer 2025", year: "2025",
      sgpa: 3.53, totalCredits: 13.5, majorCredits: 12, minorCredits: 1.5,
      courses: [
        { code: "CSE 311", name: "Computer Architecture & Organization", credits: 3, grade: "A-", point: 3.50, marks: 73, category: "Major" },
        { code: "CSE 331", name: "Software Engineering", credits: 3, grade: "A", point: 3.75, marks: 77, category: "Major" },
        { code: "CSE 332", name: "Operating Systems", credits: 3, grade: "A-", point: 3.50, marks: 71, category: "Major" },
        { code: "EEE 111", name: "Electrical Circuits I", credits: 3, grade: "B+", point: 3.25, marks: 67, category: "Major" },
        { code: "GED 211", name: "Sociology", credits: 1.5, grade: "A", point: 3.75, marks: 76, category: "Minor" }
      ]
    },
    {
      id: 6, name: "Trimester 6", session: "Fall 2025", year: "2025",
      sgpa: 3.64, totalCredits: 13.5, majorCredits: 12, minorCredits: 1.5,
      courses: [
        { code: "CSE 333", name: "Computer Networking", credits: 3, grade: "A", point: 3.75, marks: 78, category: "Major" },
        { code: "CSE 334", name: "Artificial Intelligence", credits: 3, grade: "A+", point: 4.00, marks: 82, category: "Major" },
        { code: "CSE 335", name: "Microprocessors & Assembly Language", credits: 3, grade: "B+", point: 3.25, marks: 68, category: "Major" },
        { code: "CSE 336", name: "Web Engineering", credits: 3, grade: "A-", point: 3.50, marks: 74, category: "Major" },
        { code: "GED 231", name: "Economics", credits: 1.5, grade: "A", point: 3.75, marks: 76, category: "Minor" }
      ]
    }
  ],

  // Current Trimester 7 -- Live Results (Spring 2026)
  // DIU marks: Quiz(15) + Assignment(5) + Presentation(8) + Attendance(7) + Mid(25) + Final(40) = 100
  liveResults: {
    semester: "Spring 2026",
    courses: [
      {
        code: "CSE 411", name: "Machine Learning", credits: 3,
        teacher: "Dr. S. M. Aminul Haque", section: "PC-A",
        components: [
          { name: "Quiz 1", obtained: 12, total: 15, weight: 5, published: true, publishedAt: "2026-02-01" },
          { name: "Quiz 2", obtained: 13, total: 15, weight: 5, published: true, publishedAt: "2026-02-15" },
          { name: "Quiz 3", obtained: null, total: 15, weight: 5, published: false },
          { name: "Assignment", obtained: 4, total: 5, weight: 5, published: true, publishedAt: "2026-02-10" },
          { name: "Presentation", obtained: null, total: 8, weight: 8, published: false },
          { name: "Attendance", obtained: 6, total: 7, weight: 7, published: true, publishedAt: "2026-03-20" },
          { name: "Mid", obtained: 21, total: 25, weight: 25, published: true, publishedAt: "2026-03-05" },
          { name: "Final", obtained: null, total: 40, weight: 40, published: false }
        ]
      },
      {
        code: "CSE 431", name: "Compiler Design", credits: 3,
        teacher: "Dr. Arif Mahmud", section: "PC-A",
        components: [
          { name: "Quiz 1", obtained: 10, total: 15, weight: 5, published: true, publishedAt: "2026-02-03" },
          { name: "Quiz 2", obtained: 11, total: 15, weight: 5, published: true, publishedAt: "2026-02-17" },
          { name: "Quiz 3", obtained: null, total: 15, weight: 5, published: false },
          { name: "Assignment", obtained: 4, total: 5, weight: 5, published: true, publishedAt: "2026-02-08" },
          { name: "Presentation", obtained: null, total: 8, weight: 8, published: false },
          { name: "Attendance", obtained: 5, total: 7, weight: 7, published: true, publishedAt: "2026-03-20" },
          { name: "Mid", obtained: 18, total: 25, weight: 25, published: true, publishedAt: "2026-03-06" },
          { name: "Final", obtained: null, total: 40, weight: 40, published: false }
        ]
      },
      {
        code: "CSE 432", name: "Computer Graphics", credits: 3,
        teacher: "Prof. Touhid Bhuiyan", section: "PC-A",
        components: [
          { name: "Quiz 1", obtained: 13, total: 15, weight: 5, published: true, publishedAt: "2026-02-02" },
          { name: "Quiz 2", obtained: 12, total: 15, weight: 5, published: true, publishedAt: "2026-02-16" },
          { name: "Quiz 3", obtained: null, total: 15, weight: 5, published: false },
          { name: "Assignment", obtained: 5, total: 5, weight: 5, published: true, publishedAt: "2026-02-12" },
          { name: "Presentation", obtained: null, total: 8, weight: 8, published: false },
          { name: "Attendance", obtained: 7, total: 7, weight: 7, published: true, publishedAt: "2026-03-20" },
          { name: "Mid", obtained: 22, total: 25, weight: 25, published: true, publishedAt: "2026-03-07" },
          { name: "Final", obtained: null, total: 40, weight: 40, published: false }
        ]
      },
      {
        code: "CSE 433", name: "Information Security & Cryptography", credits: 3,
        teacher: "Dr. Imran Mahmud", section: "PC-A",
        components: [
          { name: "Quiz 1", obtained: 11, total: 15, weight: 5, published: true, publishedAt: "2026-02-04" },
          { name: "Quiz 2", obtained: 12, total: 15, weight: 5, published: true, publishedAt: "2026-02-18" },
          { name: "Quiz 3", obtained: null, total: 15, weight: 5, published: false },
          { name: "Assignment", obtained: 4, total: 5, weight: 5, published: true, publishedAt: "2026-02-11" },
          { name: "Presentation", obtained: null, total: 8, weight: 8, published: false },
          { name: "Attendance", obtained: 6, total: 7, weight: 7, published: true, publishedAt: "2026-03-20" },
          { name: "Mid", obtained: 20, total: 25, weight: 25, published: true, publishedAt: "2026-03-08" },
          { name: "Final", obtained: null, total: 40, weight: 40, published: false }
        ]
      }
    ]
  },

  attendance: {
    overall: 87,
    monthlyTrend: [85, 82, 88, 90, 87, 84, 89, 91, 86, 87],
    subjects: [
      { code: "CSE 411", name: "Machine Learning", held: 45, present: 40, absent: 5, percent: 89, status: "safe" },
      { code: "CSE 431", name: "Compiler Design", held: 42, present: 35, absent: 7, percent: 83, status: "warning" },
      { code: "CSE 432", name: "Computer Graphics", held: 40, present: 38, absent: 2, percent: 95, status: "safe" },
      { code: "CSE 433", name: "Information Security & Cryptography", held: 38, present: 34, absent: 4, percent: 89, status: "safe" }
    ]
  },

  timetable: {
    slots: ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"],
    days: ["Sat","Sun","Mon","Tue","Wed","Thu"],
    schedule: [
      [{ subject:"CSE 411",name:"Machine Learning",room:"PC Lab-5",faculty:"Dr. Haque",type:"lecture"},null,{subject:"CSE 431",name:"Compiler Design",room:"Room 401",faculty:"Dr. Mahmud",type:"lecture"},null,{subject:"CSE 432",name:"Computer Graphics",room:"CG Lab",faculty:"Prof. Bhuiyan",type:"lab"},{subject:"CSE 432",name:"Computer Graphics",room:"CG Lab",faculty:"Prof. Bhuiyan",type:"lab"},null,null],
      [null,{subject:"CSE 433",name:"Info Security",room:"Room 502",faculty:"Dr. Imran",type:"lecture"},null,null,null,{subject:"CSE 411",name:"ML Lab",room:"AI Lab",faculty:"Dr. Haque",type:"lab"},{subject:"CSE 411",name:"ML Lab",room:"AI Lab",faculty:"Dr. Haque",type:"lab"},null],
      [{subject:"CSE 431",name:"Compiler Design",room:"Room 401",faculty:"Dr. Mahmud",type:"lecture"},null,null,null,{subject:"CSE 432",name:"Computer Graphics",room:"Room 403",faculty:"Prof. Bhuiyan",type:"lecture"},null,null,null],
      [{subject:"CSE 411",name:"Machine Learning",room:"Room 501",faculty:"Dr. Haque",type:"lecture"},null,{subject:"CSE 433",name:"Info Security",room:"Room 502",faculty:"Dr. Imran",type:"lecture"},null,null,{subject:"CSE 433",name:"Security Lab",room:"PC Lab-3",faculty:"Dr. Imran",type:"lab"},{subject:"CSE 433",name:"Security Lab",room:"PC Lab-3",faculty:"Dr. Imran",type:"lab"},null],
      [null,null,{subject:"CSE 431",name:"Compiler Design",room:"Room 401",faculty:"Dr. Mahmud",type:"lecture"},null,null,null,null,null],
      [{subject:"CSE 432",name:"Computer Graphics",room:"Room 403",faculty:"Prof. Bhuiyan",type:"lecture"},null,null,null,null,null,null,null]
    ]
  },

  exams: {
    upcoming: [
      { id:1,subject:"CSE 411",name:"Machine Learning",type:"Final",date:"2026-05-10",time:"10:00 AM",duration:"3 hours",venue:"Exam Hall A",syllabus:["Supervised Learning","Neural Networks","SVM","Decision Trees","Clustering"] },
      { id:2,subject:"CSE 431",name:"Compiler Design",type:"Final",date:"2026-05-12",time:"10:00 AM",duration:"3 hours",venue:"Exam Hall B",syllabus:["Lexical Analysis","Parsing","Syntax Trees","Code Generation","Optimization"] },
      { id:3,subject:"CSE 432",name:"Computer Graphics",type:"Final",date:"2026-05-14",time:"2:00 PM",duration:"3 hours",venue:"Exam Hall A",syllabus:["Transformations","Clipping","Rasterization","Shading","Ray Tracing"] },
      { id:4,subject:"CSE 433",name:"Information Security",type:"Final",date:"2026-05-16",time:"10:00 AM",duration:"3 hours",venue:"Exam Hall C",syllabus:["Cryptography","PKI","Network Security","Web Security","Forensics"] }
    ],
    results: [
      { semester:1,mid:63,end:66,total:65 },
      { semester:2,mid:66,end:68,total:67 },
      { semester:3,mid:69,end:72,total:71 },
      { semester:4,mid:68,end:72,total:70 },
      { semester:5,mid:72,end:75,total:74 },
      { semester:6,mid:75,end:78,total:77 }
    ],
    gradeDistribution: { "A+":2,"A":6,"A-":8,"B+":7,"B":4,"B-":0,"C+":0,"C":0,"D":0,"F":0 }
  },

  finance: {
    summary: { totalCharges: 571750, totalPaid: 546750, outstanding: 25000, nextDueDate: "2026-04-30", nextDueAmount: 25000 },
    balance: 25000, totalFees: 85000, paid: 60000, scholarship: 15000,
    feeStructure: [
      { type: "Tuition Fee", amount: 55000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Lab Fee", amount: 8000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Library Fee", amount: 3000, dueDate: "Mar 15, 2026", status: "Paid" },
      { type: "Development Fee", amount: 5000, dueDate: "Apr 30, 2026", status: "Pending" },
      { type: "Exam Fee", amount: 7000, dueDate: "Apr 30, 2026", status: "Pending" },
      { type: "Misc. Charges", amount: 7000, dueDate: "Apr 30, 2026", status: "Pending" }
    ],
    transactions: [
      { id:1,date:"2024-01-10",description:"Admission Fee",type:"charge",amount:61750,balance:61750,txnId:"ADM2024001" },
      { id:2,date:"2024-01-10",description:"bKash Payment -- Admission",type:"payment",amount:61750,balance:0,txnId:"BKP2024001" },
      { id:3,date:"2024-01-15",description:"Tuition Fee -- Trimester 1",type:"charge",amount:85000,balance:85000,txnId:"TXN2024001" },
      { id:4,date:"2024-01-20",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2024002" },
      { id:5,date:"2024-05-01",description:"Tuition Fee -- Trimester 2",type:"charge",amount:85000,balance:85000,txnId:"TXN2024002" },
      { id:6,date:"2024-05-10",description:"Nagad Payment",type:"payment",amount:85000,balance:0,txnId:"NGD2024001" },
      { id:7,date:"2024-09-01",description:"Tuition Fee -- Trimester 3",type:"charge",amount:85000,balance:85000,txnId:"TXN2024003" },
      { id:8,date:"2024-09-05",description:"Merit Scholarship",type:"payment",amount:15000,balance:70000,txnId:"SCH2024001" },
      { id:9,date:"2024-09-12",description:"Bank Transfer",type:"payment",amount:70000,balance:0,txnId:"BNK2024001" },
      { id:10,date:"2025-01-01",description:"Tuition Fee -- Trimester 4",type:"charge",amount:85000,balance:85000,txnId:"TXN2025001" },
      { id:11,date:"2025-01-08",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2025001" },
      { id:12,date:"2025-05-01",description:"Tuition Fee -- Trimester 5",type:"charge",amount:85000,balance:85000,txnId:"TXN2025002" },
      { id:13,date:"2025-05-10",description:"Nagad Payment",type:"payment",amount:85000,balance:0,txnId:"NGD2025001" },
      { id:14,date:"2025-09-01",description:"Tuition Fee -- Trimester 6",type:"charge",amount:85000,balance:85000,txnId:"TXN2025003" },
      { id:15,date:"2025-09-15",description:"Bank Transfer",type:"payment",amount:60000,balance:25000,txnId:"BNK2025001" },
      { id:16,date:"2026-01-01",description:"Tuition Fee -- Trimester 7",type:"charge",amount:85000,balance:110000,txnId:"TXN2026001" },
      { id:17,date:"2026-02-01",description:"bKash Payment",type:"payment",amount:85000,balance:25000,txnId:"BKP2026001" }
    ],
    chargesPerSemester: [61750,85000,85000,85000,85000,85000,85000,85000],
    paymentsPerSemester: [61750,85000,85000,85000,85000,85000,60000,85000]
  },

  notifications: [
    { id:1,type:"exam",title:"Final Exam Schedule Released",message:"Check your exam schedule for Spring 2026.",time:"2 hours ago",read:false },
    { id:2,type:"fee",title:"Payment Reminder",message:"Outstanding balance of Tk.25,000 due by April 30.",time:"1 day ago",read:false },
    { id:3,type:"attendance",title:"Low Attendance Warning",message:"Your attendance in Compiler Design is below 85%.",time:"2 days ago",read:true },
    { id:4,type:"academic",title:"Midterm Results Published",message:"Spring 2026 midterm results are now available.",time:"1 week ago",read:true },
    { id:5,type:"result",title:"Live Result Updated",message:"New marks published for CSE 411 Machine Learning.",time:"3 hours ago",read:false }
  ]
};


// ================================================================
// PROFILE 3 -- COMPLETED / GRADUATED STUDENT
// All 12 trimesters done, 130/130 credits, CGPA 3.58
// Real DIU CSE courses
// ================================================================
const completedStudentData = {
  profile: {
    id: "221-15-3456",
    name: "Tanvir Ahmed",
    firstName: "Tanvir",
    lastName: "Ahmed",
    fullName: "Tanvir Ahmed",
    email: "tanvir15-3456@diu.edu.bd",
    phone: "+880 1678-987654",
    dob: "2003-01-22",
    gender: "Male",
    bloodGroup: "O+",
    address: "Flat 4B, Green View Apartments, Gulshan-2, Dhaka-1212",
    program: "B.Sc. in Computer Science & Engineering",
    department: "Computer Science & Engineering",
    faculty: "Faculty of Science & Information Technology",
    university: "Daffodil International University",
    batch: "57th",
    section: "PC-B",
    currentSemester: 12,
    enrollmentDate: "2022-01-12",
    advisor: "Prof. Dr. Touhid Bhuiyan",
    rollNumber: "221-15-3456",
    photoUrl: null,
    graduationDate: "2026-01-30",
    graduationStatus: "Graduated",
    convocation: "15th Convocation -- Spring 2026"
  },

  academic: {
    cgpa: 3.55,
    totalCredits: 132,
    earnedCredits: 132,
    majorCredits: 123,
    minorCredits: 9,
    completedSemesters: 12,
    majorCGPA: 3.54,
    minorCGPA: 3.67
  },

  semesters: [
    {
      id:1, name:"Trimester 1", session:"Spring 2022", year:"2022",
      sgpa:3.17, totalCredits:13.5, majorCredits:12, minorCredits:1.5,
      courses:[
        { code:"CSE 111",name:"Introduction to Computer Studies",credits:3,grade:"B+",point:3.25,marks:66,category:"Major"},
        { code:"CSE 133",name:"Structured Programming Language",credits:3,grade:"B",point:3.00,marks:62,category:"Major"},
        { code:"MAT 111",name:"Differential Calculus & Coordinate Geometry",credits:3,grade:"B",point:3.00,marks:60,category:"Major"},
        { code:"PHY 111",name:"Physics I (Mechanics, Waves & Oscillation)",credits:3,grade:"B+",point:3.25,marks:65,category:"Major"},
        { code:"GED 111",name:"Bangla I",credits:1.5,grade:"A-",point:3.50,marks:73,category:"Minor"}
      ]
    },
    {
      id:2, name:"Trimester 2", session:"Summer 2022", year:"2022",
      sgpa:3.31, totalCredits:13.5, majorCredits:12, minorCredits:1.5,
      courses:[
        { code:"CSE 131",name:"Fundamentals of Data Structures",credits:3,grade:"B+",point:3.25,marks:68,category:"Major"},
        { code:"CSE 134",name:"Object Oriented Programming",credits:3,grade:"A-",point:3.50,marks:72,category:"Major"},
        { code:"MAT 121",name:"Integral Calculus & Ordinary Differential Equations",credits:3,grade:"B+",point:3.25,marks:67,category:"Major"},
        { code:"PHY 121",name:"Physics II (Electricity & Magnetism)",credits:3,grade:"B",point:3.00,marks:63,category:"Major"},
        { code:"GED 121",name:"Bangladesh Studies",credits:1.5,grade:"A",point:3.75,marks:78,category:"Minor"}
      ]
    },
    {
      id:3, name:"Trimester 3", session:"Fall 2022", year:"2022",
      sgpa:3.44, totalCredits:12, majorCredits:12, minorCredits:0,
      courses:[
        { code:"CSE 231",name:"Advanced Data Structures",credits:3,grade:"A-",point:3.50,marks:74,category:"Major"},
        { code:"CSE 233",name:"Algorithm Design & Analysis",credits:3,grade:"A-",point:3.50,marks:71,category:"Major"},
        { code:"CSE 232",name:"Database Management Systems",credits:3,grade:"A",point:3.75,marks:76,category:"Major"},
        { code:"MAT 211",name:"Linear Algebra & Fourier Analysis",credits:3,grade:"B",point:3.00,marks:64,category:"Major"}
      ]
    },
    {
      id:4, name:"Trimester 4", session:"Spring 2023", year:"2023",
      sgpa:3.50, totalCredits:12, majorCredits:12, minorCredits:0,
      courses:[
        { code:"CSE 234",name:"Discrete Mathematics",credits:3,grade:"A-",point:3.50,marks:73,category:"Major"},
        { code:"CSE 235",name:"Digital Logic & Circuit Design",credits:3,grade:"A-",point:3.50,marks:72,category:"Major"},
        { code:"CSE 236",name:"Theory of Computation",credits:3,grade:"B+",point:3.25,marks:68,category:"Major"},
        { code:"MAT 361",name:"Statistics & Probability",credits:3,grade:"A",point:3.75,marks:76,category:"Major"}
      ]
    },
    {
      id:5, name:"Trimester 5", session:"Summer 2023", year:"2023",
      sgpa:3.53, totalCredits:13.5, majorCredits:12, minorCredits:1.5,
      courses:[
        { code:"CSE 311",name:"Computer Architecture & Organization",credits:3,grade:"A",point:3.75,marks:77,category:"Major"},
        { code:"CSE 331",name:"Software Engineering",credits:3,grade:"A-",point:3.50,marks:74,category:"Major"},
        { code:"CSE 332",name:"Operating Systems",credits:3,grade:"A-",point:3.50,marks:72,category:"Major"},
        { code:"EEE 111",name:"Electrical Circuits I",credits:3,grade:"B+",point:3.25,marks:69,category:"Major"},
        { code:"GED 211",name:"Sociology",credits:1.5,grade:"A",point:3.75,marks:78,category:"Minor"}
      ]
    },
    {
      id:6, name:"Trimester 6", session:"Fall 2023", year:"2023",
      sgpa:3.58, totalCredits:13.5, majorCredits:12, minorCredits:1.5,
      courses:[
        { code:"CSE 333",name:"Computer Networking",credits:3,grade:"A",point:3.75,marks:78,category:"Major"},
        { code:"CSE 334",name:"Artificial Intelligence",credits:3,grade:"A",point:3.75,marks:77,category:"Major"},
        { code:"CSE 335",name:"Microprocessors & Assembly Language",credits:3,grade:"B+",point:3.25,marks:69,category:"Major"},
        { code:"CSE 336",name:"Web Engineering",credits:3,grade:"A-",point:3.50,marks:73,category:"Major"},
        { code:"GED 231",name:"Economics",credits:1.5,grade:"A",point:3.75,marks:78,category:"Minor"}
      ]
    },
    {
      id:7, name:"Trimester 7", session:"Spring 2024", year:"2024",
      sgpa:3.69, totalCredits:12, majorCredits:12, minorCredits:0,
      courses:[
        { code:"CSE 411",name:"Machine Learning",credits:3,grade:"A+",point:4.00,marks:83,category:"Major"},
        { code:"CSE 431",name:"Compiler Design",credits:3,grade:"A-",point:3.50,marks:74,category:"Major"},
        { code:"CSE 432",name:"Computer Graphics",credits:3,grade:"A",point:3.75,marks:76,category:"Major"},
        { code:"CSE 433",name:"Information Security & Cryptography",credits:3,grade:"A-",point:3.50,marks:72,category:"Major"}
      ]
    },
    {
      id:8, name:"Trimester 8", session:"Summer 2024", year:"2024",
      sgpa:3.75, totalCredits:12, majorCredits:12, minorCredits:0,
      courses:[
        { code:"CSE 434",name:"Digital Image Processing",credits:3,grade:"A",point:3.75,marks:78,category:"Major"},
        { code:"CSE 435",name:"Numerical Methods",credits:3,grade:"A-",point:3.50,marks:74,category:"Major"},
        { code:"CSE 436",name:"Distributed Systems",credits:3,grade:"A",point:3.75,marks:77,category:"Major"},
        { code:"CSE 441",name:"Cloud Computing",credits:3,grade:"A+",point:4.00,marks:82,category:"Major"}
      ]
    },
    {
      id:9, name:"Trimester 9", session:"Fall 2024", year:"2024",
      sgpa:3.72, totalCredits:12, majorCredits:9, minorCredits:3,
      courses:[
        { code:"CSE 442",name:"Deep Learning",credits:3,grade:"A+",point:4.00,marks:85,category:"Major"},
        { code:"CSE 443",name:"Big Data Analytics",credits:3,grade:"A",point:3.75,marks:78,category:"Major"},
        { code:"CSE 437",name:"Software Development Project",credits:3,grade:"A-",point:3.50,marks:74,category:"Major"},
        { code:"GED 241",name:"Psychology",credits:1.5,grade:"A",point:3.75,marks:76,category:"Minor"},
        { code:"GED 251",name:"English II",credits:1.5,grade:"A-",point:3.50,marks:73,category:"Minor"}
      ]
    },
    {
      id:10, name:"Trimester 10", session:"Spring 2025", year:"2025",
      sgpa:3.75, totalCredits:12, majorCredits:12, minorCredits:0,
      courses:[
        { code:"CSE 444",name:"Internet of Things & Smart Systems",credits:3,grade:"A",point:3.75,marks:78,category:"Major"},
        { code:"CSE 445",name:"Blockchain Technology",credits:3,grade:"A+",point:4.00,marks:81,category:"Major"},
        { code:"CSE 498",name:"Internship",credits:3,grade:"A",point:3.75,marks:79,category:"Major"},
        { code:"CSE 446",name:"Mobile Application Development",credits:3,grade:"A-",point:3.50,marks:73,category:"Major"}
      ]
    },
    {
      id:11, name:"Trimester 11", session:"Summer 2025", year:"2025",
      sgpa:3.75, totalCredits:3, majorCredits:3, minorCredits:0,
      courses:[
        { code:"CSE 499A",name:"Project/Thesis I",credits:3,grade:"A",point:3.75,marks:77,category:"Major"}
      ]
    },
    {
      id:12, name:"Trimester 12", session:"Fall 2025", year:"2025",
      sgpa:4.00, totalCredits:3, majorCredits:3, minorCredits:0,
      courses:[
        { code:"CSE 499B",name:"Project/Thesis II",credits:3,grade:"A+",point:4.00,marks:88,category:"Major"}
      ]
    }
  ],

  // No live results -- all semesters completed
  liveResults: { semester: "Completed", courses: [] },

  attendance: {
    overall: 92,
    monthlyTrend: [88,90,91,93,92,90,94,93,95,92],
    subjects: [
      { code:"CSE 499B",name:"Project/Thesis II",held:20,present:20,absent:0,percent:100,status:"safe"},
      { code:"CSE 499A",name:"Project/Thesis I",held:22,present:21,absent:1,percent:95,status:"safe"},
      { code:"CSE 498",name:"Internship",held:60,present:58,absent:2,percent:97,status:"safe"},
      { code:"CSE 445",name:"Blockchain Technology",held:40,present:37,absent:3,percent:93,status:"safe"},
      { code:"CSE 444",name:"IoT & Smart Systems",held:38,present:34,absent:4,percent:89,status:"safe"},
      { code:"CSE 442",name:"Deep Learning",held:42,present:39,absent:3,percent:93,status:"safe"}
    ]
  },

  timetable: {
    slots: ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"],
    days: ["Sat","Sun","Mon","Tue","Wed","Thu"],
    schedule: [[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]]
  },

  exams: {
    upcoming: [],
    results: [
      { semester:1,mid:63,end:66,total:65},{ semester:2,mid:66,end:69,total:68},
      { semester:3,mid:70,end:73,total:72},{ semester:4,mid:71,end:74,total:73},
      { semester:5,mid:73,end:76,total:75},{ semester:6,mid:75,end:78,total:77},
      { semester:7,mid:77,end:80,total:79},{ semester:8,mid:78,end:81,total:80},
      { semester:9,mid:80,end:83,total:82},{ semester:10,mid:79,end:82,total:81},
      { semester:11,mid:0,end:77,total:77},{ semester:12,mid:0,end:88,total:88}
    ],
    gradeDistribution: {"A+":5,"A":16,"A-":15,"B+":7,"B":4,"B-":0,"C+":0,"C":0,"D":0,"F":0}
  },

  finance: {
    summary: { totalCharges: 1020450, totalPaid: 1020450, outstanding: 0, nextDueDate: null, nextDueAmount: 0 },
    balance: 0, totalFees: 0, paid: 0, scholarship: 30000,
    feeStructure: [
      { type: "All Dues", amount: 1020450, dueDate: "Completed", status: "Paid" }
    ],
    transactions: [
      { id:1,date:"2022-01-12",description:"Admission Fee",type:"charge",amount:61750,balance:61750,txnId:"ADM2022045"},
      { id:2,date:"2022-01-12",description:"bKash Payment -- Admission",type:"payment",amount:61750,balance:0,txnId:"BKP2022045"},
      { id:3,date:"2022-01-15",description:"Tuition Fee -- T1",type:"charge",amount:85000,balance:85000,txnId:"TXN2022T1"},
      { id:4,date:"2022-01-20",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2022T1"},
      { id:5,date:"2022-05-01",description:"Tuition Fee -- T2",type:"charge",amount:85000,balance:85000,txnId:"TXN2022T2"},
      { id:6,date:"2022-05-08",description:"Nagad Payment",type:"payment",amount:85000,balance:0,txnId:"NGD2022T2"},
      { id:7,date:"2022-09-01",description:"Tuition Fee -- T3",type:"charge",amount:85000,balance:85000,txnId:"TXN2022T3"},
      { id:8,date:"2022-09-05",description:"Merit Scholarship",type:"payment",amount:15000,balance:70000,txnId:"SCH2022T3"},
      { id:9,date:"2022-09-10",description:"Bank Transfer",type:"payment",amount:70000,balance:0,txnId:"BNK2022T3"},
      { id:10,date:"2023-01-01",description:"Tuition Fee -- T4",type:"charge",amount:85000,balance:85000,txnId:"TXN2023T4"},
      { id:11,date:"2023-01-08",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2023T4"},
      { id:12,date:"2023-05-01",description:"Tuition Fee -- T5",type:"charge",amount:85000,balance:85000,txnId:"TXN2023T5"},
      { id:13,date:"2023-05-10",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2023T5"},
      { id:14,date:"2023-09-01",description:"Tuition Fee -- T6",type:"charge",amount:85000,balance:85000,txnId:"TXN2023T6"},
      { id:15,date:"2023-09-08",description:"Merit Scholarship",type:"payment",amount:15000,balance:70000,txnId:"SCH2023T6"},
      { id:16,date:"2023-09-12",description:"Bank Transfer",type:"payment",amount:70000,balance:0,txnId:"BNK2023T6"},
      { id:17,date:"2024-01-01",description:"Tuition Fee -- T7",type:"charge",amount:85000,balance:85000,txnId:"TXN2024T7"},
      { id:18,date:"2024-01-10",description:"bKash Payment",type:"payment",amount:85000,balance:0,txnId:"BKP2024T7"},
      { id:19,date:"2024-05-01",description:"Tuition Fee -- T8",type:"charge",amount:85000,balance:85000,txnId:"TXN2024T8"},
      { id:20,date:"2024-05-08",description:"Nagad Payment",type:"payment",amount:85000,balance:0,txnId:"NGD2024T8"},
      { id:21,date:"2024-09-01",description:"Tuition Fee -- T9",type:"charge",amount:42500,balance:42500,txnId:"TXN2024T9"},
      { id:22,date:"2024-09-10",description:"bKash Payment",type:"payment",amount:42500,balance:0,txnId:"BKP2024T9"},
      { id:23,date:"2025-01-01",description:"Tuition Fee -- T10",type:"charge",amount:42500,balance:42500,txnId:"TXN2025T10"},
      { id:24,date:"2025-01-10",description:"Bank Transfer",type:"payment",amount:42500,balance:0,txnId:"BNK2025T10"},
      { id:25,date:"2025-05-01",description:"Tuition Fee -- T11",type:"charge",amount:21200,balance:21200,txnId:"TXN2025T11"},
      { id:26,date:"2025-05-05",description:"bKash Payment",type:"payment",amount:21200,balance:0,txnId:"BKP2025T11"},
      { id:27,date:"2025-09-01",description:"Tuition Fee -- T12",type:"charge",amount:21200,balance:21200,txnId:"TXN2025T12"},
      { id:28,date:"2025-09-05",description:"Nagad Payment",type:"payment",amount:21200,balance:0,txnId:"NGD2025T12"}
    ],
    chargesPerSemester: [61750,85000,85000,85000,85000,85000,85000,85000,85000,42500,42500,21200,21200],
    paymentsPerSemester: [61750,85000,85000,100000,85000,85000,100000,85000,85000,42500,42500,21200,21200]
  },

  notifications: [
    { id:1,type:"academic",title:"Congratulations -- Degree Awarded!",message:"Your B.Sc. in CSE degree has been awarded. CGPA: 3.55. Pick up your certificate from the Registrar's Office.",time:"1 month ago",read:true},
    { id:2,type:"academic",title:"Convocation Invitation",message:"15th Convocation Ceremony on Feb 28, 2026. Please confirm your attendance.",time:"2 months ago",read:true},
    { id:3,type:"academic",title:"Clearance Approved",message:"Your academic, financial, library, and department clearances are all verified.",time:"3 months ago",read:true},
    { id:4,type:"academic",title:"Thesis Graded -- A+",message:"CSE 499B Project/Thesis II final grade: A+ (88/100).",time:"4 months ago",read:true},
    { id:5,type:"fee",title:"All Dues Cleared",message:"Your financial clearance is complete. Total paid: Tk.10,20,450.",time:"4 months ago",read:true}
  ]
};


// ================================================================
// PROFILE SELECTOR -- reads localStorage to pick active profile
// ================================================================
const _studentType = localStorage.getItem('portal_student_type') || 'current';
const studentData = _studentType === 'new'       ? newStudentData
                  : _studentType === 'completed' ? completedStudentData
                  : currentStudentData;


// ================================================================
// SHARED -- Helper Functions
// ================================================================
const StudentPortal = {
  getGradeFromMarks(marks) {
    return bdGradeScale.find(g => marks >= g.min && marks <= g.max) || bdGradeScale[bdGradeScale.length - 1];
  },

  getGradePoint(letter) {
    return gradeToPoint[letter] || 0;
  },

  getCurrentSemester() {
    return studentData.semesters.find(s => s.id === studentData.profile.currentSemester);
  },

  getSemester(id) {
    return studentData.semesters.find(s => s.id === id);
  },

  calculateCGPA(semesters = studentData.semesters) {
    let totalCredits = 0, totalPoints = 0;
    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  calculateMajorCGPA(semesters = studentData.semesters) {
    let totalCredits = 0, totalPoints = 0;
    semesters.forEach(sem => {
      sem.courses.filter(c => c.category === "Major").forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  calculateMinorCGPA(semesters = studentData.semesters) {
    let totalCredits = 0, totalPoints = 0;
    semesters.forEach(sem => {
      sem.courses.filter(c => c.category === "Minor").forEach(course => {
        totalCredits += course.credits;
        totalPoints += course.credits * course.point;
      });
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  },

  calculateLiveResult(courseCode) {
    const course = studentData.liveResults.courses.find(c => c.code === courseCode);
    if (!course) return null;
    const published = course.components.filter(c => c.published && c.obtained !== null);
    let weightedScore = 0, totalWeight = 0;
    published.forEach(comp => {
      const score = (comp.obtained / comp.total) * comp.weight;
      weightedScore += score;
      totalWeight += comp.weight;
    });
    const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
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

  getNextClass() {
    const now = new Date();
    let dayIndex = now.getDay();
    const dayMap = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
    dayIndex = dayMap[dayIndex];
    if (dayIndex === undefined) return { message: "No classes today! Enjoy your Friday." };
    const schedule = studentData.timetable.schedule[dayIndex];
    const slots = studentData.timetable.slots;
    const currentHour = now.getHours();
    for (let i = 0; i < schedule.length; i++) {
      if (!schedule[i]) continue;
      const slotHour = parseInt(slots[i].split(':')[0]) + (slots[i].includes('PM') && !slots[i].includes('12') ? 12 : 0);
      if (slotHour >= currentHour) return { subject: schedule[i].name, time: slots[i], room: schedule[i].room, faculty: schedule[i].faculty };
    }
    return { message: "No more classes today!" };
  },

  getUnreadCount() {
    return studentData.notifications.filter(n => !n.read).length;
  },

  getDaysUntilExam(examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const diffDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  formatCurrency(amount) {
    return 'Tk.' + new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(amount);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  getGradeScale() {
    return bdGradeScale;
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { studentData, newStudentData, currentStudentData, completedStudentData, StudentPortal, bdGradeScale, gradeToPoint };
}
