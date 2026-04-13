/**
 * Faculty Portal Mock Data
 * DIU-style Faculty/Teacher Portal
 */

const facultyData = {
  profile: {
    id: 'FAC-1001',
    name: 'Dr. Md. Hafizur Rahman',
    initials: 'HR',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    faculty: 'Faculty of Science & Information Technology',
    email: 'hafizur@diu.edu.bd',
    phone: '+880 1712-345678',
    officeRoom: 'AB5-710',
    officeHours: 'Sat–Mon, 10:00 AM – 12:00 PM',
    joinDate: '2012-03-15',
    qualification: 'PhD in Computer Science (2010), M.Sc. CSE (2005), B.Sc. CSE (2003)',
    researchInterests: ['Database Systems', 'Machine Learning', 'Cloud Computing', 'Big Data Analytics'],
    publications: 24,
    hIndex: 8,
    ongoingProjects: 2,
  },

  currentSemester: 'Spring 2025',
  academicYear: '2024–2025',

  courses: [
    {
      id: 'CSE401',
      code: 'CSE-401',
      name: 'Algorithm Design',
      credits: 3,
      section: 'A',
      room: 'AB4-304',
      schedule: [{ day: 'Saturday', time: '08:00–09:30' }, { day: 'Monday', time: '08:00–09:30' }],
      studentsCount: 35,
      attendanceSubmitted: true,
      resultSubmitted: false,
    },
    {
      id: 'CSE401B',
      code: 'CSE-401',
      name: 'Algorithm Design',
      credits: 3,
      section: 'B',
      room: 'AB4-306',
      schedule: [{ day: 'Saturday', time: '10:00–11:30' }, { day: 'Monday', time: '10:00–11:30' }],
      studentsCount: 32,
      attendanceSubmitted: false,
      resultSubmitted: false,
    },
    {
      id: 'CSE405',
      code: 'CSE-405',
      name: 'Database Management Systems',
      credits: 3,
      section: 'A',
      room: 'AB5-501',
      schedule: [{ day: 'Sunday', time: '11:30–01:00' }, { day: 'Tuesday', time: '11:30–01:00' }],
      studentsCount: 40,
      attendanceSubmitted: true,
      resultSubmitted: true,
    },
    {
      id: 'CSE301',
      code: 'CSE-301',
      name: 'Data Structures',
      credits: 3,
      section: 'C',
      room: 'AB3-201',
      schedule: [{ day: 'Wednesday', time: '09:00–10:30' }, { day: 'Thursday', time: '09:00–10:30' }],
      studentsCount: 38,
      attendanceSubmitted: true,
      resultSubmitted: false,
    },
  ],

  // Students per course (CSE401 Section A as example full list)
  students: {
    CSE401: [
      { id: '2021-3-60-001', name: 'Iftekhar Hossain', section: 'A', attendance: 85, assign: 18, quiz: 14, midterm: 28, final: null },
      { id: '2021-3-60-002', name: 'Nusrat Jahan', section: 'A', attendance: 90, assign: 20, quiz: 15, midterm: 32, final: null },
      { id: '2021-3-60-003', name: 'Tanvir Ahmed', section: 'A', attendance: 72, assign: 14, quiz: 10, midterm: 22, final: null },
      { id: '2021-3-60-004', name: 'Farida Begum', section: 'A', attendance: 95, assign: 19, quiz: 15, midterm: 35, final: null },
      { id: '2021-3-60-005', name: 'Raihan Islam', section: 'A', attendance: 68, assign: 12, quiz: 9, midterm: 20, final: null },
      { id: '2021-3-60-006', name: 'Sadia Sultana', section: 'A', attendance: 88, assign: 17, quiz: 13, midterm: 30, final: null },
      { id: '2021-3-60-007', name: 'Anik Chowdhury', section: 'A', attendance: 80, assign: 16, quiz: 12, midterm: 27, final: null },
      { id: '2021-3-60-008', name: 'Mitu Akter', section: 'A', attendance: 92, assign: 20, quiz: 15, midterm: 36, final: null },
    ],
    CSE405: [
      { id: '2021-3-60-001', name: 'Iftekhar Hossain', section: 'A', attendance: 88, assign: 18, quiz: 14, midterm: 30, final: 38 },
      { id: '2021-3-60-009', name: 'Sajid Mahmud', section: 'A', attendance: 76, assign: 15, quiz: 12, midterm: 25, final: 32 },
      { id: '2021-3-60-010', name: 'Rimi Khatun', section: 'A', attendance: 94, assign: 20, quiz: 15, midterm: 38, final: 45 },
      { id: '2021-3-60-011', name: 'Shanto Barua', section: 'A', attendance: 60, assign: 10, quiz: 8, midterm: 18, final: 22 },
      { id: '2021-3-60-012', name: 'Puja Das', section: 'A', attendance: 90, assign: 19, quiz: 15, midterm: 34, final: 40 },
    ],
    CSE301: [
      { id: '2022-3-60-001', name: 'Habib Ullah', section: 'C', attendance: 82, assign: 16, quiz: 13, midterm: 28, final: null },
      { id: '2022-3-60-002', name: 'Sumaiya Islam', section: 'C', attendance: 91, assign: 19, quiz: 14, midterm: 33, final: null },
      { id: '2022-3-60-003', name: 'Rafiq Hasan', section: 'C', attendance: 74, assign: 13, quiz: 11, midterm: 24, final: null },
    ],
  },

  // Today's attendance sessions
  attendanceSessions: {
    CSE401: {
      date: '2025-04-13',
      totalClasses: 20,
      students: [
        { id: '2021-3-60-001', name: 'Iftekhar Hossain', status: 'P', totalPresent: 17 },
        { id: '2021-3-60-002', name: 'Nusrat Jahan', status: 'P', totalPresent: 18 },
        { id: '2021-3-60-003', name: 'Tanvir Ahmed', status: 'A', totalPresent: 14 },
        { id: '2021-3-60-004', name: 'Farida Begum', status: 'P', totalPresent: 19 },
        { id: '2021-3-60-005', name: 'Raihan Islam', status: 'L', totalPresent: 13 },
        { id: '2021-3-60-006', name: 'Sadia Sultana', status: 'P', totalPresent: 17 },
        { id: '2021-3-60-007', name: 'Anik Chowdhury', status: 'P', totalPresent: 16 },
        { id: '2021-3-60-008', name: 'Mitu Akter', status: 'P', totalPresent: 18 },
      ],
    },
  },

  schedule: [
    { day: 'Saturday',  time: '08:00–09:30', course: 'CSE-401', section: 'A', room: 'AB4-304', students: 35 },
    { day: 'Saturday',  time: '10:00–11:30', course: 'CSE-401', section: 'B', room: 'AB4-306', students: 32 },
    { day: 'Sunday',    time: '11:30–01:00', course: 'CSE-405', section: 'A', room: 'AB5-501', students: 40 },
    { day: 'Monday',    time: '08:00–09:30', course: 'CSE-401', section: 'A', room: 'AB4-304', students: 35 },
    { day: 'Monday',    time: '10:00–11:30', course: 'CSE-401', section: 'B', room: 'AB4-306', students: 32 },
    { day: 'Tuesday',   time: '11:30–01:00', course: 'CSE-405', section: 'A', room: 'AB5-501', students: 40 },
    { day: 'Wednesday', time: '09:00–10:30', course: 'CSE-301', section: 'C', room: 'AB3-201', students: 38 },
    { day: 'Thursday',  time: '09:00–10:30', course: 'CSE-301', section: 'C', room: 'AB3-201', students: 38 },
  ],

  leaveBalance: {
    casual: { total: 10, used: 2, remaining: 8 },
    medical: { total: 14, used: 0, remaining: 14 },
    earned: { total: 20, used: 5, remaining: 15 },
    special: { total: 3, used: 0, remaining: 3 },
  },

  leaveHistory: [
    { id: 'L-2025-001', type: 'Casual Leave', from: '2025-02-10', to: '2025-02-11', days: 2, reason: 'Personal work', status: 'Approved', approvedBy: 'Prof. Dr. Mahbubul Alam' },
    { id: 'L-2024-018', type: 'Earned Leave', from: '2024-12-22', to: '2024-12-26', days: 5, reason: 'Annual vacation', status: 'Approved', approvedBy: 'Prof. Dr. Mahbubul Alam' },
    { id: 'L-2024-012', type: 'Medical Leave', from: '2024-10-05', to: '2024-10-05', days: 1, reason: 'Medical appointment', status: 'Approved', approvedBy: 'Dr. Kamrul Islam' },
  ],

  notifications: [
    { id: 1, type: 'warning', message: 'Result submission deadline: CSE-401 — April 20, 2025', time: '2 hrs ago', read: false },
    { id: 2, type: 'info', message: 'CSE-401 Sec B: 3 students have attendance below 75%', time: '5 hrs ago', read: false },
    { id: 3, type: 'success', message: 'CSE-405 results successfully submitted', time: '1 day ago', read: true },
    { id: 4, type: 'info', message: 'Faculty meeting — April 15, 2025 at 2:00 PM (AB5 Seminar Hall)', time: '2 days ago', read: true },
    { id: 5, type: 'warning', message: 'Teaching evaluation scores available for review', time: '3 days ago', read: true },
  ],

  gradeScale: [
    { min: 80, letter: 'A+', point: 4.00 },
    { min: 75, letter: 'A',  point: 3.75 },
    { min: 70, letter: 'A-', point: 3.50 },
    { min: 65, letter: 'B+', point: 3.25 },
    { min: 60, letter: 'B',  point: 3.00 },
    { min: 55, letter: 'B-', point: 2.75 },
    { min: 50, letter: 'C+', point: 2.50 },
    { min: 45, letter: 'C',  point: 2.25 },
    { min: 40, letter: 'D',  point: 2.00 },
    { min: 0,  letter: 'F',  point: 0.00 },
  ],
};

function getLetterGrade(total) {
  for (const g of facultyData.gradeScale) {
    if (total >= g.min) return g;
  }
  return { letter: 'F', point: 0.00 };
}

function getTodayDay() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
}
