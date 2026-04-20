/**
 * Student Portal - Data Loader
 * Bridges API with frontend, falls back to mock data
 */

const DataLoader = {
  // Cache for loaded data
  cache: {},
  useAPI: true, // Set to false to use mock data only
  _initPromise: null,
  
  // Initialize data loader (safe to call multiple times)
  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  },

  async _doInit() {
    // Check if API is available
    if (this.useAPI && typeof API !== 'undefined') {
      try {
        const health = await fetch(`${API.baseURL}/health`);
        if (!health.ok) {
          console.warn('API not available, using mock data');
          this.useAPI = false;
        }
      } catch (error) {
        console.warn('API not available, using mock data');
        this.useAPI = false;
      }
    } else {
      this.useAPI = false;
    }
    
    // Check authentication
    if (this.useAPI && API.isLoggedIn && API.isLoggedIn()) {
      await this.loadUserData();
      // Populate global data objects with API data for backward compatibility
      await this.populateGlobals();
    }
    
    return this;
  },
  
  // Populate global studentData/facultyData with API data
  async populateGlobals() {
    if (!this.useAPI) return;
    const user = this.cache.currentUser;
    if (!user) return;

    try {
      const isFaculty = user.roles && user.roles.includes('faculty');
      
      if (isFaculty && typeof facultyData !== 'undefined') {
        // Populate faculty globals
        try {
          const profile = await API.faculty.getProfile();
          if (profile.success && profile.data) {
            const p = profile.data;
            facultyData.profile = Object.assign(facultyData.profile || {}, {
              name: p.full_name || facultyData.profile?.name,
              email: p.email || facultyData.profile?.email,
              phone: p.phone || facultyData.profile?.phone,
              designation: p.designation || facultyData.profile?.designation,
              department: p.department_name || facultyData.profile?.department,
              specialization: p.specialization || facultyData.profile?.specialization,
              officeRoom: p.office_room || facultyData.profile?.officeRoom,
              officeHours: p.office_hours || facultyData.profile?.officeHours
            });
          }
        } catch (e) { /* keep mock */ }
        
        try {
          const courses = await API.faculty.getCourses();
          if (courses.success && courses.data && courses.data.length > 0) {
            facultyData.courses = courses.data.map(c => ({
              code: c.course_code, name: c.title, section: c.section,
              credits: c.credits, type: c.type || 'Theory',
              studentsCount: c.enrolled_students || 0,
              room: 'AB5-501', schedule: 'See Routine',
              attendanceSubmitted: c.sessions_held > 0,
              resultSubmitted: false,
              offering_id: c.offering_id
            }));
          }
        } catch (e) { /* keep mock */ }
        
        try {
          const leaves = await API.leave.getAll();
          if (leaves.success && leaves.data) {
            facultyData.leaveHistory = leaves.data.map(l => ({
              type: l.leave_type, from: l.start_date, to: l.end_date,
              reason: l.reason, status: l.status, approvedBy: l.approved_by_name || 'N/A'
            }));
          }
        } catch (e) { /* keep mock */ }
      }
      
      if (!isFaculty && typeof studentData !== 'undefined') {
        // Populate student globals from API (reset all to avoid stale mock data)
        try {
          const resp = await API.student.getProfile();
          if (resp.success && resp.data) {
            const prof = resp.data.profile;
            const acad = resp.data.academic;

            // Fully reset profile so no mock data leaks through
            Object.assign(studentData.profile, {
              id: prof.studentCode || '',
              name: prof.name || '',
              firstName: (prof.name || '').split(' ')[0] || '',
              lastName: (prof.name || '').split(' ').slice(1).join(' ') || '',
              fullName: prof.name || '',
              email: prof.email || '',
              phone: prof.phone || '',
              dob: '',
              gender: '',
              bloodGroup: '',
              address: '',
              program: prof.program ? prof.program.name : '',
              department: prof.department ? prof.department.name : '',
              faculty: prof.department ? prof.department.faculty : '',
              university: 'Daffodil International University',
              batch: prof.batchYear ? prof.batchYear + 'th' : '',
              section: prof.section || '',
              currentSemester: acad.currentEnrollments > 0 ? 1 : 0,
              enrollmentDate: prof.enrollmentDate || '',
              advisor: prof.advisor ? (prof.advisor.name || 'To be assigned') : 'To be assigned',
              rollNumber: prof.studentCode || '',
              photoUrl: prof.photoUrl || null,
              guardianName: '',
              guardianPhone: '',
              guardianRelation: ''
            });

            // Reset academic data
            Object.assign(studentData.academic, {
              cgpa: acad.cgpa || 0,
              totalCredits: prof.program ? prof.program.totalCredits : 0,
              earnedCredits: acad.totalCredits || 0,
              completedSemesters: 0,
              majorCredits: 0,
              minorCredits: 0,
              majorCGPA: 0,
              minorCGPA: 0
            });

            // Clear semester / attendance / exam / timetable / finance arrays
            // so stale mock data from another student does not appear
            studentData.semesters = [];
            studentData.notifications = [];
            if (studentData.attendance) {
              studentData.attendance = { overall: 0, monthlyTrend: [], subjects: [] };
            }
            if (studentData.exams) {
              studentData.exams = { upcoming: [], results: [], gradeDistribution: {} };
            }
            if (studentData.timetable) {
              studentData.timetable = {
                slots: studentData.timetable.slots || [],
                days: studentData.timetable.days || [],
                schedule: (studentData.timetable.days || []).map(() =>
                  (studentData.timetable.slots || []).map(() => null))
              };
            }
            if (studentData.finance) {
              studentData.finance = {
                summary: { totalCharges: 0, totalPaid: 0, outstanding: 0, nextDueDate: null, nextDueAmount: 0 },
                balance: 0, totalFees: 0, paid: 0, scholarship: 0,
                feeStructure: [], transactions: [],
                chargesPerSemester: [], paymentsPerSemester: []
              };
            }
            if (studentData.liveResults) {
              studentData.liveResults = { semester: '', courses: [] };
            }
          }
        } catch (e) { /* keep mock */ }
      }
    } catch (e) {
      console.warn('Could not populate globals from API:', e);
    }
  },
  
  // Load user data from API
  async loadUserData() {
    if (!this.useAPI) return;
    
    try {
      const response = await API.auth.getCurrentUser();
      if (response.success) {
        this.cache.currentUser = response.data;
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  },
  
  // Get student profile
  async getProfile() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.student.getProfile();
        if (response.success) {
          // Transform API data to match mock data format
          return this.transformProfile(response.data);
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.profile;
  },
  
  // Transform API profile to frontend format
  transformProfile(apiData) {
    const prof = apiData.profile || apiData;
    return {
      id: prof.studentCode || '',
      name: prof.name || '',
      fullName: prof.name || '',
      email: prof.email || '',
      phone: prof.phone || '',
      dob: '',
      gender: '',
      bloodGroup: '',
      address: '',
      program: prof.program ? prof.program.name : '',
      department: prof.department ? prof.department.name : '',
      batch: prof.batchYear ? prof.batchYear + 'th' : '',
      section: prof.section || '',
      enrollmentDate: prof.enrollmentDate || '',
      advisor: prof.advisor ? (prof.advisor.name || 'To be assigned') : 'To be assigned',
      rollNumber: prof.studentCode || '',
      photoUrl: prof.photoUrl || null
    };
  },
  
  // Get dashboard data
  async getDashboard() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.dashboard.getStudentDashboard();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    
    // Return from mock data
    return {
      cgpa: studentData.academic.cgpa,
      totalCredits: studentData.academic.earnedCredits,
      totalCourses: studentData.academic.earnedCredits / 3,
      attendancePercentage: studentData.attendance?.overall?.attendancePercent || 88.5,
      totalDues: studentData.finance?.feeBalance || 0,
      currentCourses: studentData.currentCourses?.length || 6,
      upcomingExams: studentData.exams?.filter(e => new Date(e.date) >= new Date()) || [],
      recentResults: []
    };
  },
  
  // Get CGPA data
  async getCGPA() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.results.getCGPA();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.academic;
  },
  
  // Get semester SGPA data
  async getSemesters() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.results.getSGPA();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.semesters;
  },
  
  // Get transcript
  async getTranscript() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.results.getTranscript();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.semesters;
  },
  
  // Get attendance summary
  async getAttendanceSummary() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.attendance.getSummary();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.attendance;
  },
  
  // Get attendance records
  async getAttendanceRecords(courseId, month) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.attendance.getRecords(courseId, month);
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.attendance?.records || [];
  },
  
  // Get timetable
  async getTimetable() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.academic.getTimetable();
        if (response.success) {
          return this.transformTimetable(response.data);
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.timetable;
  },
  
  // Transform timetable to frontend format
  transformTimetable(apiData) {
    const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const timetable = {};
    
    days.forEach(day => {
      timetable[day] = apiData
        .filter(item => item.day_of_week.toLowerCase() === day)
        .map(item => ({
          time: `${item.start_time}-${item.end_time}`,
          subject: item.course_name,
          code: item.course_code,
          room: item.room_no,
          instructor: item.faculty_name,
          type: item.session_type
        }));
    });
    
    return timetable;
  },
  
  // Get finance summary
  async getFinanceSummary() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.finance.getSummary();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.finance;
  },
  
  // Get invoices
  async getInvoices() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.finance.getInvoices();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.finance?.payments || [];
  },
  
  // Get payments
  async getPayments() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.finance.getPayments();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.finance?.payments || [];
  },
  
  // Get exam schedule
  async getExams() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.exams.getUpcoming();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.exams;
  },
  
  // Get live results
  async getLiveResults() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.results.getLiveMarks();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.liveResults || [];
  },
  
  // Get hostel details
  async getHostelDetails() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.hostel.getDetails();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.hostel;
  },
  
  // Get transport subscription
  async getTransportSubscription() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.transport.getSubscription();
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.warn('API error, falling back to mock data:', error);
      }
    }
    return studentData.transport;
  },

  // ========= NEW MODULE LOADERS =========

  // Get notices
  async getNotices(params = {}) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.notices.getAll(params);
        if (response.success) return response.data;
      } catch (e) { console.warn('Notices API error:', e); }
    }
    return typeof studentData !== 'undefined' ? (studentData.notices || []) : [];
  },

  async getNotice(id) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.notices.getById(id);
        if (response.success) return response.data;
      } catch (e) { console.warn('Notice API error:', e); }
    }
    return null;
  },

  // Get evaluation forms
  async getEvaluationForms() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.evaluation.getForms();
        if (response.success) return response.data;
      } catch (e) { console.warn('Evaluation API error:', e); }
    }
    return typeof studentData !== 'undefined' ? (studentData.evaluationForms || []) : [];
  },

  async getEvaluationSummary() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.evaluation.getSummary();
        if (response.success) return response.data;
      } catch (e) { console.warn('Eval summary API error:', e); }
    }
    return [];
  },

  // Faculty loaders
  async getFacultyProfile() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.faculty.getProfile();
        if (response.success) return response.data;
      } catch (e) { console.warn('Faculty profile API error:', e); }
    }
    return typeof facultyData !== 'undefined' ? facultyData.profile : {};
  },

  async getFacultyCourses(semesterId) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.faculty.getCourses(semesterId);
        if (response.success) return response.data;
      } catch (e) { console.warn('Faculty courses API error:', e); }
    }
    return typeof facultyData !== 'undefined' ? facultyData.courses : [];
  },

  async getFacultyCourseStudents(offeringId) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.faculty.getCourseStudents(offeringId);
        if (response.success) return response.data;
      } catch (e) { console.warn('Course students API error:', e); }
    }
    return [];
  },

  async getFacultyRoutine() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.faculty.getRoutine();
        if (response.success) return response.data;
      } catch (e) { console.warn('Faculty routine API error:', e); }
    }
    return typeof facultyData !== 'undefined' ? facultyData.routine : {};
  },

  async getFacultyList() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.faculty.getList();
        if (response.success) return response.data;
      } catch (e) { console.warn('Faculty list API error:', e); }
    }
    return [];
  },

  // Leave loaders
  async getLeaveRequests(params = {}) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.leave.getAll(params);
        if (response.success) return response.data;
      } catch (e) { console.warn('Leave API error:', e); }
    }
    return typeof facultyData !== 'undefined' ? (facultyData.leaveRequests || []) : [];
  },

  async getLeaveBalance() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.leave.getBalance();
        if (response.success) return response.data;
      } catch (e) { console.warn('Leave balance API error:', e); }
    }
    return [];
  },

  // Registration loaders
  async getRegistrationRequests() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.registration.getAll();
        if (response.success) return response.data;
      } catch (e) { console.warn('Registration API error:', e); }
    }
    return typeof studentData !== 'undefined' ? (studentData.registration || []) : [];
  },

  async getRegistrationItems(id) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.registration.getItems(id);
        if (response.success) return response.data;
      } catch (e) { console.warn('Reg items API error:', e); }
    }
    return [];
  },

  // Clearance loaders
  async getClearanceRequests() {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.clearance.getAll();
        if (response.success) return response.data;
      } catch (e) { console.warn('Clearance API error:', e); }
    }
    return typeof studentData !== 'undefined' ? (studentData.clearance || []) : [];
  },

  async getClearanceSteps(id) {
    if (this.useAPI && API.isLoggedIn()) {
      try {
        const response = await API.clearance.getSteps(id);
        if (response.success) return response.data;
      } catch (e) { console.warn('Clearance steps API error:', e); }
    }
    return [];
  }
};

// Initialize data loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await DataLoader.init();
});

// Make DataLoader globally available
window.DataLoader = DataLoader;
