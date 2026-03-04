/**
 * API Client - Frontend API Integration
 * Handles all HTTP requests to the backend
 */

const API = {
  baseURL: 'http://localhost:3000/api',
  token: localStorage.getItem('authToken') || null,
  
  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },
  
  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  },
  
  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          window.location.href = '/index.html';
        }
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  // POST request
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  
  // PUT request
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },
  
  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
  
  // ============ AUTH ============
  auth: {
    async login(username, password) {
      const response = await API.post('/auth/login', { username, password });
      if (response.success && response.data.token) {
        API.setToken(response.data.token);
      }
      return response;
    },
    
    async logout() {
      await API.post('/auth/logout', {});
      API.setToken(null);
    },
    
    async getCurrentUser() {
      return API.get('/auth/me');
    },
    
    async changePassword(currentPassword, newPassword) {
      return API.post('/auth/change-password', { currentPassword, newPassword });
    },
    
    isLoggedIn() {
      return !!API.token;
    }
  },
  
  // ============ DASHBOARD ============
  dashboard: {
    async getStudentDashboard() {
      return API.get('/dashboard/student');
    },
    
    async getAdminDashboard() {
      return API.get('/dashboard/admin');
    }
  },
  
  // ============ STUDENT PROFILE ============
  student: {
    async getProfile() {
      return API.get('/students/profile');
    },
    
    async getEnrollments() {
      return API.get('/students/enrollments/current');
    }
  },
  
  // ============ ACADEMIC ============
  academic: {
    async getTimetable(semesterId) {
      const params = semesterId ? `?semesterId=${semesterId}` : '';
      return API.get(`/academic/timetable${params}`);
    },
    
    async getCourses() {
      return API.get('/academic/courses');
    },
    
    async getSemesters() {
      return API.get('/academic/semesters');
    },
    
    async getGradeScale() {
      return API.get('/academic/grade-scale');
    }
  },
  
  // ============ RESULTS ============
  results: {
    async getCGPA() {
      return API.get('/results/cgpa');
    },
    
    async getSGPA(semesterId) {
      const params = semesterId ? `?semesterId=${semesterId}` : '';
      return API.get(`/results/sgpa${params}`);
    },
    
    async getTranscript() {
      return API.get('/results/transcript');
    },
    
    async getLiveMarks() {
      return API.get('/results/live');
    }
  },
  
  // ============ ATTENDANCE ============
  attendance: {
    async getSummary(semesterId) {
      const params = semesterId ? `?semesterId=${semesterId}` : '';
      return API.get(`/attendance/summary${params}`);
    },
    
    async getRecords(courseId, month) {
      let params = [];
      if (courseId) params.push(`courseId=${courseId}`);
      if (month) params.push(`month=${month}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      return API.get(`/attendance/records${queryString}`);
    }
  },
  
  // ============ FINANCE ============
  finance: {
    async getSummary() {
      return API.get('/finance/summary');
    },
    
    async getInvoices() {
      return API.get('/finance/invoices');
    },
    
    async getInvoiceDetails(invoiceId) {
      return API.get(`/finance/invoices/${invoiceId}`);
    },
    
    async getPayments() {
      return API.get('/finance/payments');
    }
  },
  
  // ============ EXAMS ============
  exams: {
    async getUpcoming() {
      return API.get('/results/live');
    }
  },
  
  // ============ HOSTEL ============
  hostel: {
    async getDetails() {
      return API.get('/hostel/details');
    },
    
    async getHostelList() {
      return API.get('/hostel/list');
    }
  },
  
  // ============ TRANSPORT ============
  transport: {
    async getSubscription() {
      return API.get('/transport/subscription');
    },
    
    async getRoutes() {
      return API.get('/transport/routes');
    }
  }
};

// Make API globally available
window.API = API;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
