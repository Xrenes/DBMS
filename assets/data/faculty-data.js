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
      { id: '241-15-5765', name: 'Iftekhar Hossain', section: 'A', attendance: 6, quiz1: 12, quiz2: 11, quiz3: 13, assign: 4, presentation: 7, midterm: 20, final: null },
      { id: '241-15-5766', name: 'Nusrat Jahan', section: 'A', attendance: 7, quiz1: 14, quiz2: 13, quiz3: 15, assign: 5, presentation: 8, midterm: 22, final: null },
      { id: '221-15-3456', name: 'Tanvir Ahmed', section: 'A', attendance: 5, quiz1: 9, quiz2: 8, quiz3: 10, assign: 3, presentation: 5, midterm: 16, final: null },
      { id: '241-15-5767', name: 'Farida Begum', section: 'A', attendance: 7, quiz1: 14, quiz2: 15, quiz3: 13, assign: 5, presentation: 7, midterm: 23, final: null },
      { id: '241-15-5768', name: 'Raihan Islam', section: 'A', attendance: 4, quiz1: 8, quiz2: 7, quiz3: 9, assign: 3, presentation: 4, midterm: 14, final: null },
      { id: '241-15-5769', name: 'Sadia Sultana', section: 'A', attendance: 6, quiz1: 12, quiz2: 11, quiz3: 12, assign: 4, presentation: 6, midterm: 21, final: null },
      { id: '241-15-5770', name: 'Anik Chowdhury', section: 'A', attendance: 5, quiz1: 10, quiz2: 12, quiz3: 11, assign: 4, presentation: 6, midterm: 18, final: null },
      { id: '241-15-5771', name: 'Mitu Akter', section: 'A', attendance: 7, quiz1: 14, quiz2: 13, quiz3: 14, assign: 5, presentation: 8, midterm: 24, final: null },
    ],
    CSE405: [
      { id: '241-15-5765', name: 'Iftekhar Hossain', section: 'A', attendance: 6, quiz1: 13, quiz2: 12, quiz3: 14, assign: 4, presentation: 7, midterm: 21, final: 34 },
      { id: '241-15-5772', name: 'Sajid Mahmud', section: 'A', attendance: 5, quiz1: 10, quiz2: 11, quiz3: 12, assign: 4, presentation: 5, midterm: 18, final: 28 },
      { id: '241-15-5773', name: 'Rimi Khatun', section: 'A', attendance: 7, quiz1: 14, quiz2: 15, quiz3: 14, assign: 5, presentation: 8, midterm: 24, final: 38 },
      { id: '241-15-5774', name: 'Shanto Barua', section: 'A', attendance: 3, quiz1: 7, quiz2: 6, quiz3: 8, assign: 2, presentation: 3, midterm: 12, final: 18 },
      { id: '241-15-5775', name: 'Puja Das', section: 'A', attendance: 7, quiz1: 14, quiz2: 13, quiz3: 15, assign: 5, presentation: 7, midterm: 23, final: 35 },
    ],
    CSE301: [
      { id: '251-15-6001', name: 'Habib Ullah', section: 'C', attendance: 5, quiz1: 11, quiz2: 12, quiz3: 10, assign: 4, presentation: 6, midterm: 19, final: null },
      { id: '251-15-6002', name: 'Sumaiya Islam', section: 'C', attendance: 7, quiz1: 13, quiz2: 14, quiz3: 12, assign: 5, presentation: 7, midterm: 22, final: null },
      { id: '251-15-6003', name: 'Rafiq Hasan', section: 'C', attendance: 5, quiz1: 9, quiz2: 10, quiz3: 11, assign: 3, presentation: 5, midterm: 17, final: null },
    ],
  },

  // Today's attendance sessions
  attendanceSessions: {
    CSE401: {
      date: '2025-04-13',
      totalClasses: 20,
      students: [
        { id: '241-15-5765', name: 'Iftekhar Hossain', status: 'P', totalPresent: 17 },
        { id: '241-15-5766', name: 'Nusrat Jahan', status: 'P', totalPresent: 18 },
        { id: '221-15-3456', name: 'Tanvir Ahmed', status: 'A', totalPresent: 14 },
        { id: '241-15-5767', name: 'Farida Begum', status: 'P', totalPresent: 19 },
        { id: '241-15-5768', name: 'Raihan Islam', status: 'L', totalPresent: 13 },
        { id: '241-15-5769', name: 'Sadia Sultana', status: 'P', totalPresent: 17 },
        { id: '241-15-5770', name: 'Anik Chowdhury', status: 'P', totalPresent: 16 },
        { id: '241-15-5771', name: 'Mitu Akter', status: 'P', totalPresent: 18 },
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
