/**
 * Student Portal - Data Loader
 * Bridges API with frontend, falls back to mock data
 */

const DataLoader = {
  // Cache for loaded data
  cache: {},
  useAPI: true, // Set to false to use mock data only
  
  // Initialize data loader
  async init() {
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
    }
    
    return this;
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
    return {
      id: apiData.student_code,
      name: apiData.full_name,
      fullName: apiData.full_name,
      email: apiData.email,
      phone: apiData.phone,
      dob: apiData.dob,
      gender: apiData.gender,
      bloodGroup: apiData.blood_group,
      address: apiData.address,
      program: apiData.program_name,
      department: apiData.dept_name,
      batch: apiData.batch,
      enrollmentDate: apiData.admission_date,
      rollNumber: apiData.student_code,
      photoUrl: apiData.photo_url
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
  }
};

// Initialize data loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await DataLoader.init();
});

// Make DataLoader globally available
window.DataLoader = DataLoader;
