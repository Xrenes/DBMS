/**
 * Student Portal - AI Assistant
 * Chat interface with context-aware responses
 */

// AI Panel state
let aiPanelOpen = false;
const chatHistory = [];

// AI Response templates based on keywords
const aiResponses = {
  cgpa: {
    keywords: ['cgpa', 'gpa', 'grade point', 'overall grade'],
    response: () => {
      const cgpa = studentData.academic.cgpa;
      const rank = cgpa >= 9 ? 'top 5%' : cgpa >= 8 ? 'top 15%' : cgpa >= 7 ? 'top 30%' : 'average';
      return `Your current CGPA is <strong>${cgpa}</strong>, which places you in the <strong>${rank}</strong> of your batch. 

Your grade point has shown steady improvement across semesters:
• Semester 1: 7.85
• Latest (Sem 6): 8.72

Keep up the good work! Focus on maintaining consistency in your major subjects.`;
    }
  },
  
  sgpa: {
    keywords: ['sgpa', 'semester gpa', 'this semester', 'latest grade'],
    response: () => {
      const current = studentData.semesters[studentData.semesters.length - 1];
      return `Your latest SGPA for <strong>Semester ${current.id}</strong> is <strong>${current.sgpa}</strong>.

This semester breakdown:
• Major Credits: ${current.majorCredits}
• Minor Credits: ${current.minorCredits}
• Total: ${current.totalCredits} credits

Your SGPA has improved by <strong>0.04</strong> points compared to the previous semester. Excellent progress!`;
    }
  },
  
  attendance: {
    keywords: ['attendance', 'present', 'absent', 'classes', 'bunk'],
    response: () => {
      const att = studentData.attendance;
      const danger = att.subjects.filter(s => s.percent < 75);
      const warning = att.subjects.filter(s => s.percent >= 75 && s.percent < 85);
      
      let response = `Your overall attendance is <strong>${att.overall}%</strong>.\n\n`;
      
      if (danger.length > 0) {
        response += `⚠️ <strong>Critical:</strong> ${danger.map(s => s.name).join(', ')} - below 75%\n`;
        danger.forEach(s => {
          const needed = Math.ceil((0.75 * s.held - s.present) / 0.25);
          response += `You need <strong>${needed} more classes</strong> in ${s.code} to reach 75%.\n`;
        });
      }
      
      if (warning.length > 0) {
        response += `\n🔶 <strong>Warning:</strong> ${warning.map(s => s.name).join(', ')} - below 85%\n`;
      }
      
      response += `\n✅ Safe subjects: ${att.subjects.filter(s => s.percent >= 85).length} out of ${att.subjects.length}`;
      
      return response;
    }
  },
  
  balance: {
    keywords: ['balance', 'fee', 'payment', 'due', 'outstanding', 'money', 'pay'],
    response: () => {
      const fin = studentData.finance.summary;
      const format = (n) => '₹' + n.toLocaleString('en-IN');
      
      return `Your current financial summary:

💰 <strong>Outstanding Balance:</strong> ${format(fin.outstanding)}
📅 <strong>Next Due Date:</strong> ${new Date(fin.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Payment History:
• Total Charges: ${format(fin.totalCharges)}
• Total Paid: ${format(fin.totalPaid)}

${fin.outstanding > 0 ? '⚠️ Please clear your dues before the deadline to avoid late fees.' : '✅ You have no pending payments. Great job staying on top of your finances!'}`;
    }
  },
  
  nextClass: {
    keywords: ['next class', 'upcoming class', 'today class', 'schedule', 'what class'],
    response: () => {
      const next = StudentPortal.getNextClass();
      
      if (next.message) {
        return `📚 ${next.message}`;
      }
      
      return `Your next class:

📖 <strong>${next.subject}</strong>
⏰ Time: ${next.time}
📍 Room: ${next.room}
👨‍🏫 Faculty: ${next.faculty}

Would you like me to show your full timetable for today?`;
    }
  },
  
  exam: {
    keywords: ['exam', 'test', 'midterm', 'mid term', 'end term', 'finals'],
    response: () => {
      const exams = studentData.exams.upcoming;
      const upcomingCount = exams.length;
      const nextExam = exams[0];
      const daysLeft = PortalUtils.daysUntil(nextExam.date);
      
      let response = `📝 You have <strong>${upcomingCount} upcoming exams</strong>.\n\n`;
      response += `<strong>Next Exam:</strong>\n`;
      response += `• ${nextExam.name} (${nextExam.type})\n`;
      response += `• Date: ${new Date(nextExam.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}\n`;
      response += `• Time: ${nextExam.time}\n`;
      response += `• Venue: ${nextExam.venue}\n`;
      response += `• ⏳ <strong>${daysLeft} days remaining</strong>\n\n`;
      response += `Syllabus topics: ${nextExam.syllabus.join(', ')}`;
      
      return response;
    }
  },
  
  hostel: {
    keywords: ['hostel', 'room', 'dorm', 'accommodation', 'warden', 'mess'],
    response: () => {
      const h = studentData.hostel.details;
      return `🏠 Your Hostel Details:

<strong>Hostel:</strong> ${h.hostelName}
<strong>Room:</strong> ${h.roomNumber} (${h.roomType})
<strong>Bed:</strong> ${h.bedNumber}

👥 <strong>Roommates:</strong>
${h.roommates.map(r => `• ${r.name} (${r.rollNo})`).join('\n')}

📞 <strong>Warden:</strong> ${h.warden.name}
Phone: ${h.warden.phone}

🍽️ <strong>Mess Timings:</strong>
• Breakfast: ${h.messTimings.breakfast}
• Lunch: ${h.messTimings.lunch}
• Dinner: ${h.messTimings.dinner}`;
    }
  },
  
  transport: {
    keywords: ['transport', 'bus', 'route', 'pickup', 'drop'],
    response: () => {
      const t = studentData.transport.details;
      return `🚌 Your Transport Details:

<strong>Route:</strong> ${t.routeNumber} - ${t.routeName}
<strong>Bus Number:</strong> ${t.busNumber}
<strong>Your Stop:</strong> ${t.pickupPoint}
<strong>Pickup Time:</strong> ${t.pickupTime}
<strong>Drop Time:</strong> ${t.dropTime}

📍 <strong>Route Stops:</strong>
${t.stops.map(s => `• ${s.name} - ${s.time}`).join('\n')}

Driver: ${t.driver.name} (${t.driver.phone})`;
    }
  },
  
  performance: {
    keywords: ['performance', 'how am i doing', 'explain', 'analysis', 'review'],
    response: () => {
      const cgpa = studentData.academic.cgpa;
      const att = studentData.attendance.overall;
      const fin = studentData.finance.summary.outstanding;
      
      let score = 0;
      let feedback = [];
      
      // Academic score
      if (cgpa >= 9) { score += 40; feedback.push('🌟 Outstanding academic performance!'); }
      else if (cgpa >= 8) { score += 35; feedback.push('📚 Great academics - keep pushing for excellence!'); }
      else if (cgpa >= 7) { score += 25; feedback.push('📖 Good performance - room for improvement in a few subjects.'); }
      else { score += 15; feedback.push('⚠️ Academic performance needs attention.'); }
      
      // Attendance score
      if (att >= 90) { score += 35; feedback.push('✅ Excellent attendance record!'); }
      else if (att >= 85) { score += 30; feedback.push('👍 Good attendance - try to maintain above 90%.'); }
      else if (att >= 75) { score += 20; feedback.push('🔶 Attendance is borderline - be careful about absences.'); }
      else { score += 10; feedback.push('❌ Critical attendance issue - immediate action needed!'); }
      
      // Financial score
      if (fin === 0) { score += 25; feedback.push('💰 All fees cleared - excellent financial standing!'); }
      else if (fin < 20000) { score += 15; feedback.push('💳 Minor outstanding balance - please clear soon.'); }
      else { score += 5; feedback.push('⚠️ Significant dues pending - please pay immediately.'); }
      
      return `📊 <strong>Your Overall Portal Score: ${score}/100</strong>\n\n${feedback.join('\n\n')}\n\n<em>This score is calculated based on your academics, attendance, and financial status.</em>`;
    }
  },
  
  help: {
    keywords: ['help', 'what can you do', 'commands', 'options'],
    response: () => {
      return `I can help you with:

📊 <strong>Academics</strong>
• "What's my CGPA?" - Current grade point
• "Explain my performance" - Detailed analysis

📅 <strong>Attendance</strong>
• "Show my attendance" - Subject-wise breakdown
• "Why is my attendance low?" - Analysis & recommendations

💰 <strong>Finance</strong>
• "What's my balance?" - Outstanding dues
• "Fee summary" - Payment history

📚 <strong>Schedule</strong>
• "What's my next class?" - Upcoming class info
• "Upcoming exams" - Exam schedule

🏠 <strong>Campus Life</strong>
• "Hostel details" - Room & facilities
• "Transport info" - Bus route & timing

Try asking me anything about your student portal!`;
    }
  },
  
  default: {
    response: () => {
      return `I'm not sure I understand that question. Here are some things I can help with:

• CGPA and academic performance
• Attendance tracking
• Fee balance and payments
• Class schedule and timetable
• Exam information
• Hostel and transport details

Try asking something like "What's my CGPA?" or "Show my attendance"`;
    }
  }
};

/**
 * Initialize AI Assistant
 */
function initAIAssistant() {
  createAIElements();
  setupAIEventListeners();
}

/**
 * Create AI Panel Elements
 */
function createAIElements() {
  // Check if elements already exist
  if (document.getElementById('ai-fab')) return;
  
  // Floating Action Button
  const fab = document.createElement('button');
  fab.id = 'ai-fab';
  fab.className = 'ai-fab';
  fab.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  `;
  fab.setAttribute('aria-label', 'Open AI Assistant');
  fab.title = 'Ask Portal AI';
  document.body.appendChild(fab);
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'ai-overlay';
  overlay.className = 'ai-panel-overlay';
  document.body.appendChild(overlay);
  
  // AI Panel
  const panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.className = 'ai-panel';
  panel.innerHTML = `
    <div class="ai-panel-header">
      <div class="ai-panel-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>AI Assistant</span>
      </div>
      <button class="modal-close" id="ai-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="ai-panel-body">
      <div class="ai-suggestions" id="ai-suggestions">
        <button class="ai-suggestion" data-query="What's my CGPA?">What's my CGPA?</button>
        <button class="ai-suggestion" data-query="Show my attendance">Show attendance</button>
        <button class="ai-suggestion" data-query="What's my balance?">What's my balance?</button>
        <button class="ai-suggestion" data-query="What's my next class?">Next class</button>
        <button class="ai-suggestion" data-query="Upcoming exams">Upcoming exams</button>
        <button class="ai-suggestion" data-query="Explain my performance">My performance</button>
      </div>
      
      <div class="ai-messages" id="ai-messages">
        <div class="ai-message">
          <div class="ai-message-avatar">AI</div>
          <div class="ai-message-content">
            Hi ${studentData?.profile?.firstName || 'there'}! I'm your AI assistant. I can help you with grades, attendance, fees, schedules, and more. What would you like to know?
          </div>
        </div>
      </div>
    </div>
    
    <div class="ai-panel-footer">
      <div class="ai-input-wrapper">
        <input type="text" id="ai-input" placeholder="Ask me anything..." autocomplete="off">
        <button class="btn btn-primary btn-icon" id="ai-send">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
}

/**
 * Setup Event Listeners
 */
function setupAIEventListeners() {
  const fab = document.getElementById('ai-fab');
  const panel = document.getElementById('ai-panel');
  const overlay = document.getElementById('ai-overlay');
  const closeBtn = document.getElementById('ai-close');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const suggestions = document.getElementById('ai-suggestions');
  
  // Toggle panel
  fab?.addEventListener('click', toggleAIPanel);
  closeBtn?.addEventListener('click', toggleAIPanel);
  overlay?.addEventListener('click', toggleAIPanel);
  
  // Send message
  sendBtn?.addEventListener('click', () => sendMessage());
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Suggestion buttons
  suggestions?.addEventListener('click', (e) => {
    if (e.target.matches('.ai-suggestion')) {
      const query = e.target.dataset.query;
      sendMessage(query);
    }
  });
}

/**
 * Toggle AI Panel
 */
function toggleAIPanel() {
  const panel = document.getElementById('ai-panel');
  const overlay = document.getElementById('ai-overlay');
  const fab = document.getElementById('ai-fab');
  
  aiPanelOpen = !aiPanelOpen;
  
  panel?.classList.toggle('active', aiPanelOpen);
  overlay?.classList.toggle('active', aiPanelOpen);
  
  if (aiPanelOpen) {
    document.getElementById('ai-input')?.focus();
    fab.style.display = 'none';
  } else {
    fab.style.display = 'flex';
  }
}

/**
 * Send Message
 */
function sendMessage(overrideText = null) {
  const input = document.getElementById('ai-input');
  const text = overrideText || input?.value.trim();
  
  if (!text) return;
  
  // Add user message
  addMessage(text, 'user');
  
  // Clear input
  if (input) input.value = '';
  
  // Show typing indicator
  showTyping();
  
  // Generate response (with delay for realism)
  setTimeout(() => {
    hideTyping();
    const response = generateResponse(text);
    addMessage(response, 'ai');
  }, 800 + Math.random() * 800);
}

/**
 * Add Message to Chat
 */
function addMessage(text, sender) {
  const container = document.getElementById('ai-messages');
  if (!container) return;
  
  const message = document.createElement('div');
  message.className = `ai-message ${sender}`;
  
  const avatar = sender === 'ai' ? 'AI' : studentData?.profile?.firstName?.[0] || 'U';
  
  message.innerHTML = `
    <div class="ai-message-avatar">${avatar}</div>
    <div class="ai-message-content">${text}</div>
  `;
  
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  
  // Store in history
  chatHistory.push({ sender, text, timestamp: new Date() });
}

/**
 * Show Typing Indicator
 */
function showTyping() {
  const container = document.getElementById('ai-messages');
  if (!container) return;
  
  const typing = document.createElement('div');
  typing.id = 'ai-typing-indicator';
  typing.className = 'ai-message';
  typing.innerHTML = `
    <div class="ai-message-avatar">AI</div>
    <div class="ai-message-content">
      <div class="ai-typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

/**
 * Hide Typing Indicator
 */
function hideTyping() {
  const typing = document.getElementById('ai-typing-indicator');
  typing?.remove();
}

/**
 * Generate AI Response
 */
function generateResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  // Find matching response category
  for (const [key, config] of Object.entries(aiResponses)) {
    if (key === 'default') continue;
    
    if (config.keywords.some(kw => lowerQuery.includes(kw))) {
      return config.response();
    }
  }
  
  // Default response
  return aiResponses.default.response();
}

/**
 * Clear Chat History
 */
function clearChat() {
  const container = document.getElementById('ai-messages');
  if (!container) return;
  
  container.innerHTML = `
    <div class="ai-message">
      <div class="ai-message-avatar">AI</div>
      <div class="ai-message-content">
        Chat cleared! How can I help you today?
      </div>
    </div>
  `;
  
  chatHistory.length = 0;
}

/**
 * Get Chat History
 */
function getChatHistory() {
  return [...chatHistory];
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for studentData to load
  setTimeout(initAIAssistant, 100);
});

// Export functions
window.AIAssistant = {
  init: initAIAssistant,
  toggle: toggleAIPanel,
  send: sendMessage,
  clear: clearChat,
  getHistory: getChatHistory
};
