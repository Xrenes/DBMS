/**
 * Student Portal - Main JavaScript
 * Navigation, Modals, Dropdowns, and General Interactions
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initHeader();
  initModals();
  initDropdowns();
  initTabs();
  initForms();
  highlightActiveNav();
  updateUserInfo();
});

/**
 * Sidebar Navigation
 */
function initSidebar() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
  
  // Close sidebar on nav item click (mobile)
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
      }
    });
  });
}

/**
 * Highlight Active Navigation Item
 */
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === currentPage) {
      item.classList.add('active');
    }
  });
}

/**
 * Header Interactions
 */
function initHeader() {
  // Search functionality
  const searchInput = document.querySelector('.header-search input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          console.log('Search:', query);
          // Implement search functionality
        }
      }
    });
  }
  
  // User dropdown
  const headerUser = document.querySelector('.header-user');
  if (headerUser) {
    headerUser.addEventListener('click', (e) => {
      e.stopPropagation();
      headerUser.closest('.dropdown')?.classList.toggle('active');
    });
  }
}

/**
 * Update User Info in UI
 */
function updateUserInfo() {
  if (typeof studentData === 'undefined') return;
  
  const profile = studentData.profile;
  
  // Update sidebar user
  const sidebarUserName = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarUserName) sidebarUserName.textContent = profile.fullName;
  if (sidebarAvatar) sidebarAvatar.textContent = getInitials(profile.fullName);
  
  // Update header user
  const headerUserName = document.querySelector('.header-user-name');
  const headerAvatar = document.querySelector('.header-avatar');
  if (headerUserName) headerUserName.textContent = profile.fullName;
  if (headerAvatar) headerAvatar.textContent = getInitials(profile.fullName);
  
  // Update notification badge
  if (typeof StudentPortal !== 'undefined') {
    const unreadCount = StudentPortal.getUnreadCount();
    const badge = document.querySelector('.notification-badge');
    if (badge && unreadCount === 0) {
      badge.style.display = 'none';
    }
  }
}

/**
 * Get Initials from Name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Modal Management
 */
function initModals() {
  // Open modal buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      openModal(modalId);
    });
  });
  
  // Close modal buttons
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });
  
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) closeModal(activeModal.id);
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Dropdown Management
 */
function initDropdowns() {
  // Toggle dropdown on click
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest('.dropdown');
      
      // Close other dropdowns
      document.querySelectorAll('.dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });
      
      dropdown.classList.toggle('active');
    });
  });
  
  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.active').forEach(d => {
      d.classList.remove('active');
    });
  });
  
  // Prevent dropdown menu click from closing
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

/**
 * Tabs Management
 */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabsContainer => {
    const tabs = tabsContainer.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        const tabContents = tabsContainer.parentElement.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === targetId) {
            content.classList.add('active');
          }
        });
      });
    });
  });
}

/**
 * Form Handling
 */
function initForms() {
  // Form validation
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          showFieldError(input, 'This field is required');
        } else {
          input.classList.remove('error');
          hideFieldError(input);
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });
  
  // Clear error on input
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      hideFieldError(input);
    });
  });
}

function showFieldError(input, message) {
  let errorEl = input.parentElement.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function hideFieldError(input) {
  const errorEl = input.parentElement.querySelector('.form-error');
  if (errorEl) errorEl.remove();
}

/**
 * Toast Notifications
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(container);
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--bg-card);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        animation: slideIn 0.3s ease forwards;
        min-width: 280px;
        max-width: 400px;
      }
      .toast-info { border-left: 4px solid var(--info); }
      .toast-success { border-left: 4px solid var(--success); }
      .toast-warning { border-left: 4px solid var(--warning); }
      .toast-danger { border-left: 4px solid var(--danger); }
      .toast-message { flex: 1; font-size: 0.875rem; }
      .toast-close {
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        color: var(--text-secondary);
        opacity: 0.7;
      }
      .toast-close:hover { opacity: 1; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  return container;
}

/**
 * Confirmation Dialog
 */
function confirmAction(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 400px;">
      <div class="modal-header">
        <h3 class="modal-title">Confirm Action</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
        <button class="btn btn-primary" id="confirm-ok">Confirm</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
    if (onConfirm) onConfirm();
  });
  
  overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
    if (onCancel) onCancel();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
      if (onCancel) onCancel();
    }
  });
}

/**
 * Format Number with Commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format Currency (INR)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(amount).replace('BDT', '৳');
}

/**
 * Format Date
 */
function formatDate(dateString, format = 'short') {
  const date = new Date(dateString);
  const options = format === 'long' 
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Get Relative Time
 */
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
}

/**
 * Calculate Days Until Date
 */
function daysUntil(dateString) {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffMs = target - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Copy to Clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'danger');
  });
}

/**
 * Debounce Function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle Function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Local Storage Helpers
 */
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

/**
 * Export functions for global use
 */
window.PortalUtils = {
  openModal,
  closeModal,
  showToast,
  confirmAction,
  formatNumber,
  formatCurrency,
  formatDate,
  getRelativeTime,
  daysUntil,
  copyToClipboard,
  debounce,
  throttle,
  Storage,
  getInitials
};
