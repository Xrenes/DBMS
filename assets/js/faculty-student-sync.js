/**
 * Faculty-Student Real-Time Sync via localStorage
 * Daffodil International University — Student Portal DBMS
 *
 * When a faculty member updates marks or attendance, changes are
 * written to localStorage. Student pages listen for these changes
 * and update the UI in real time (cross-tab via 'storage' event,
 * same-tab via custom 'faculty-sync' event).
 */
const FacultyStudentSync = {
  MARKS_KEY: 'diu_faculty_marks',
  ATTENDANCE_KEY: 'diu_faculty_attendance',
  LOG_KEY: 'diu_sync_log',

  // ── Faculty Side ──────────────────────────────────────────────

  /** Publish a marks update (called from faculty-result-management) */
  publishMarks(courseCode, studentId, field, value, extra) {
    const store = JSON.parse(localStorage.getItem(this.MARKS_KEY) || '{}');
    const key = studentId + '_' + courseCode;
    if (!store[key]) {
      store[key] = { studentId, courseCode, studentName: extra?.studentName || '' };
    }
    store[key][field] = value;
    store[key].updatedAt = new Date().toISOString();
    store[key].updatedBy = extra?.faculty || 'Faculty';
    localStorage.setItem(this.MARKS_KEY, JSON.stringify(store));
    this._log('marks', courseCode, studentId, field, value);
    window.dispatchEvent(new CustomEvent('faculty-sync', { detail: { type: 'marks', courseCode, studentId, field, value } }));
  },

  /** Publish full marks row (called on Submit) */
  publishMarksRow(courseCode, student, extra) {
    const store = JSON.parse(localStorage.getItem(this.MARKS_KEY) || '{}');
    const key = student.id + '_' + courseCode;
    store[key] = {
      studentId: student.id,
      studentName: student.name,
      courseCode,
      attendance: student.attendance,
      quiz1: student.quiz1,
      quiz2: student.quiz2,
      quiz3: student.quiz3,
      assign: student.assign,
      presentation: student.presentation,
      midterm: student.midterm,
      final: student.final,
      updatedAt: new Date().toISOString(),
      updatedBy: extra?.faculty || 'Faculty',
      submitted: true
    };
    localStorage.setItem(this.MARKS_KEY, JSON.stringify(store));
    this._log('marks-submit', courseCode, student.id, 'all', 'submitted');
    window.dispatchEvent(new CustomEvent('faculty-sync', { detail: { type: 'marks-submit', courseCode, studentId: student.id } }));
  },

  /** Publish an attendance update (called from faculty-attendance) */
  publishAttendance(courseCode, studentId, status, totalPresent, totalClasses, extra) {
    const store = JSON.parse(localStorage.getItem(this.ATTENDANCE_KEY) || '{}');
    const key = studentId + '_' + courseCode;
    store[key] = {
      studentId,
      studentName: extra?.studentName || '',
      courseCode,
      status,
      totalPresent,
      totalClasses,
      percentage: Math.round((totalPresent / totalClasses) * 100),
      updatedAt: new Date().toISOString(),
      updatedBy: extra?.faculty || 'Faculty'
    };
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(store));
    this._log('attendance', courseCode, studentId, 'status', status);
    window.dispatchEvent(new CustomEvent('faculty-sync', { detail: { type: 'attendance', courseCode, studentId, status, totalPresent } }));
  },

  // ── Student Side ──────────────────────────────────────────────

  /** Get all marks updates for a given student */
  getMarksForStudent(studentId) {
    const store = JSON.parse(localStorage.getItem(this.MARKS_KEY) || '{}');
    return Object.values(store).filter(u => u.studentId === studentId);
  },

  /** Get all attendance updates for a given student */
  getAttendanceForStudent(studentId) {
    const store = JSON.parse(localStorage.getItem(this.ATTENDANCE_KEY) || '{}');
    return Object.values(store).filter(u => u.studentId === studentId);
  },

  /** Listen for real-time updates — works cross-tab */
  onUpdate(callback) {
    // Cross-tab: 'storage' event fires when another tab writes to localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === this.MARKS_KEY || e.key === this.ATTENDANCE_KEY) {
        callback({
          type: e.key === this.MARKS_KEY ? 'marks' : 'attendance',
          data: JSON.parse(e.newValue || '{}')
        });
      }
    });
    // Same-tab: custom event for immediate feedback
    window.addEventListener('faculty-sync', (e) => {
      callback({ type: e.detail.type, detail: e.detail });
    });
  },

  /** Apply faculty marks updates to student liveResults data */
  applyMarksToStudentData(studentData) {
    if (!studentData || !studentData.liveResults || !studentData.profile) return false;
    const studentId = studentData.profile.id || studentData.profile.rollNumber;
    const updates = this.getMarksForStudent(studentId);
    if (updates.length === 0) return false;

    let changed = false;
    updates.forEach(update => {
      const course = studentData.liveResults.courses.find(c =>
        c.code.replace(/\s/g, '') === update.courseCode.replace(/[\s-]/g, '')
      );
      if (!course) return;

      // Map faculty fields to student component names
      const fieldMap = {
        quiz1: 'Quiz 1', quiz2: 'Quiz 2', quiz3: 'Quiz 3',
        assign: 'Assignment', presentation: 'Presentation',
        attendance: 'Attendance', midterm: 'Mid', final: 'Final'
      };
      Object.entries(fieldMap).forEach(([field, compName]) => {
        if (update[field] !== undefined && update[field] !== null) {
          const comp = course.components.find(c => c.name === compName);
          if (comp) {
            comp.obtained = parseFloat(update[field]);
            comp.published = true;
            comp.publishedAt = update.updatedAt;
            changed = true;
          }
        }
      });
    });
    return changed;
  },

  /** Apply attendance updates to student data */
  applyAttendanceToStudentData(studentData) {
    if (!studentData || !studentData.attendance || !studentData.profile) return false;
    const studentId = studentData.profile.id || studentData.profile.rollNumber;
    const updates = this.getAttendanceForStudent(studentId);
    if (updates.length === 0) return false;

    let changed = false;
    updates.forEach(update => {
      const subject = studentData.attendance.subjects.find(s =>
        s.code.replace(/\s/g, '') === update.courseCode.replace(/[\s-]/g, '')
      );
      if (subject && update.percentage !== undefined) {
        subject.percent = update.percentage;
        subject.present = update.totalPresent;
        subject.held = update.totalClasses;
        subject.absent = update.totalClasses - update.totalPresent;
        subject.status = update.percentage >= 75 ? 'safe' : update.percentage >= 60 ? 'warning' : 'danger';
        changed = true;
      }
    });

    // Recalculate overall attendance
    if (changed && studentData.attendance.subjects.length > 0) {
      const totalPct = studentData.attendance.subjects.reduce((sum, s) => sum + s.percent, 0);
      studentData.attendance.overall = Math.round(totalPct / studentData.attendance.subjects.length);
    }
    return changed;
  },

  // ── Sync Log (for UI display) ─────────────────────────────────

  _log(type, courseCode, studentId, field, value) {
    const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
    logs.unshift({
      type, courseCode, studentId, field, value,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 entries
    if (logs.length > 50) logs.length = 50;
    localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
  },

  getRecentLogs(count) {
    const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
    return logs.slice(0, count || 10);
  },

  /** Clear all sync data */
  clearAll() {
    localStorage.removeItem(this.MARKS_KEY);
    localStorage.removeItem(this.ATTENDANCE_KEY);
    localStorage.removeItem(this.LOG_KEY);
  }
};
