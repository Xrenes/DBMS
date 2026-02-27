/**
 * Student Portal - CGPA Calculator (BD Grading)
 * Bangladesh 4.0 Scale with Major/Minor separation
 */

// Calculator state
let calculatorData = [];
let cgpaChart = null;
let creditsChart = null;

// BD Grade Scale Reference
const BD_GRADE_SCALE = [
  { min: 80, max: 100, letter: 'A+', point: 4.00, remark: 'Outstanding' },
  { min: 75, max: 79,  letter: 'A',  point: 3.75, remark: 'Excellent' },
  { min: 70, max: 74,  letter: 'A-', point: 3.50, remark: 'Very Good' },
  { min: 65, max: 69,  letter: 'B+', point: 3.25, remark: 'Good' },
  { min: 60, max: 64,  letter: 'B',  point: 3.00, remark: 'Satisfactory' },
  { min: 55, max: 59,  letter: 'B-', point: 2.75, remark: 'Above Average' },
  { min: 50, max: 54,  letter: 'C+', point: 2.50, remark: 'Average' },
  { min: 45, max: 49,  letter: 'C',  point: 2.25, remark: 'Below Average' },
  { min: 40, max: 44,  letter: 'D',  point: 2.00, remark: 'Pass' },
  { min: 0,  max: 39,  letter: 'F',  point: 0.00, remark: 'Fail' }
];

// Grade to Point lookup
const GRADE_TO_POINT = {
  'A+': 4.00, 'A': 3.75, 'A-': 3.50,
  'B+': 3.25, 'B': 3.00, 'B-': 2.75,
  'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00
};

/**
 * Initialize Calculator
 */
function initCalculator() {
  // Load existing data from studentData
  if (typeof studentData !== 'undefined') {
    loadExistingData();
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial calculation
  calculateAll();
}

/**
 * Load Existing Semester Data
 */
function loadExistingData() {
  calculatorData = studentData.semesters.map(sem => ({
    semester: sem.id,
    sgpa: sem.sgpa,
    majorCredits: sem.majorCredits,
    minorCredits: sem.minorCredits,
    include: true
  }));
  
  renderTable();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Add row button
  const addRowBtn = document.getElementById('add-row-btn');
  if (addRowBtn) {
    addRowBtn.addEventListener('click', addRow);
  }
  
  // Calculate on input change
  document.getElementById('calculator-table')?.addEventListener('input', (e) => {
    if (e.target.matches('input')) {
      updateRowData(e.target);
      calculateAll();
    }
  });
  
  // Toggle checkbox
  document.getElementById('calculator-table')?.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      updateRowData(e.target);
      calculateAll();
    }
  });
  
  // What-if scenario
  const whatIfBtn = document.getElementById('what-if-btn');
  if (whatIfBtn) {
    whatIfBtn.addEventListener('click', showWhatIfModal);
  }
}

/**
 * Render Calculator Table
 */
function renderTable() {
  const tbody = document.querySelector('#calculator-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = calculatorData.map((row, index) => `
    <tr data-index="${index}">
      <td>
        <input type="number" class="form-input" name="semester" 
               value="${row.semester}" min="1" max="12" style="width: 80px;">
      </td>
      <td>
        <input type="number" class="form-input" name="sgpa" 
               value="${row.sgpa}" min="0" max="4" step="0.01" style="width: 100px;">
      </td>
      <td>
        <input type="number" class="form-input" name="majorCredits" 
               value="${row.majorCredits}" min="0" max="30" style="width: 100px;">
      </td>
      <td>
        <input type="number" class="form-input" name="minorCredits" 
               value="${row.minorCredits}" min="0" max="15" style="width: 100px;">
      </td>
      <td class="text-center">
        <label class="form-check" style="justify-content: center;">
          <input type="checkbox" name="include" ${row.include ? 'checked' : ''}>
        </label>
      </td>
      <td>
        <button class="btn btn-ghost btn-icon" onclick="removeRow(${index})" title="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Add New Row
 */
function addRow() {
  const lastSem = calculatorData.length > 0 
    ? calculatorData[calculatorData.length - 1].semester 
    : 0;
  
  calculatorData.push({
    semester: lastSem + 1,
    sgpa: 0,
    majorCredits: 18,
    minorCredits: 6,
    include: true
  });
  
  renderTable();
  calculateAll();
}

/**
 * Remove Row
 */
function removeRow(index) {
  if (calculatorData.length <= 1) {
    PortalUtils.showToast('Cannot remove the last row', 'warning');
    return;
  }
  
  calculatorData.splice(index, 1);
  renderTable();
  calculateAll();
}

/**
 * Update Row Data from Input
 */
function updateRowData(input) {
  const row = input.closest('tr');
  const index = parseInt(row.dataset.index);
  const name = input.name;
  
  if (name === 'include') {
    calculatorData[index][name] = input.checked;
  } else {
    calculatorData[index][name] = parseFloat(input.value) || 0;
  }
}

/**
 * Calculate All Values
 */
function calculateAll() {
  const includedData = calculatorData.filter(row => row.include);
  
  if (includedData.length === 0) {
    updateOutputCards(0, 0, 0, 0);
    return;
  }
  
  // Calculate Total CGPA
  let totalPoints = 0;
  let totalCredits = 0;
  
  includedData.forEach(row => {
    const semCredits = row.majorCredits + row.minorCredits;
    totalPoints += row.sgpa * semCredits;
    totalCredits += semCredits;
  });
  
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  
  // Calculate Major CGPA
  let majorPoints = 0;
  let majorCreditsTotal = 0;
  
  includedData.forEach(row => {
    // Estimate major SGPA (slightly higher than overall for CSE students)
    const majorSGPA = Math.min(4.00, row.sgpa * 1.02);
    majorPoints += majorSGPA * row.majorCredits;
    majorCreditsTotal += row.majorCredits;
  });
  
  const majorCGPA = majorCreditsTotal > 0 ? (majorPoints / majorCreditsTotal).toFixed(2) : 0;
  
  // Calculate Minor CGPA
  let minorPoints = 0;
  let minorCreditsTotal = 0;
  
  includedData.forEach(row => {
    // Estimate minor SGPA
    const minorSGPA = Math.max(0, row.sgpa * 0.98);
    minorPoints += minorSGPA * row.minorCredits;
    minorCreditsTotal += row.minorCredits;
  });
  
  const minorCGPA = minorCreditsTotal > 0 ? (minorPoints / minorCreditsTotal).toFixed(2) : 0;
  
  // Update UI
  updateOutputCards(cgpa, majorCGPA, minorCGPA, totalCredits);
  updateCharts(includedData);
}

/**
 * Update Output Cards
 */
function updateOutputCards(cgpa, majorCGPA, minorCGPA, totalCredits) {
  const cgpaEl = document.getElementById('calc-cgpa');
  const majorEl = document.getElementById('calc-major-cgpa');
  const minorEl = document.getElementById('calc-minor-cgpa');
  const creditsEl = document.getElementById('calc-total-credits');
  
  if (cgpaEl) animateValue(cgpaEl, parseFloat(cgpaEl.textContent) || 0, parseFloat(cgpa), 500);
  if (majorEl) animateValue(majorEl, parseFloat(majorEl.textContent) || 0, parseFloat(majorCGPA), 500);
  if (minorEl) animateValue(minorEl, parseFloat(minorEl.textContent) || 0, parseFloat(minorCGPA), 500);
  if (creditsEl) creditsEl.textContent = totalCredits;
  
  // Update grade letter
  updateGradeLetter(cgpa);
}

/**
 * Animate Value Change
 */
function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeProgress;
    
    element.textContent = current.toFixed(2);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Update Grade Letter Display
 */
function updateGradeLetter(cgpa) {
  const letterEl = document.getElementById('grade-letter');
  if (!letterEl) return;
  
  let letter = 'F';
  let color = '#ef4444';
  let remark = 'Fail';
  
  // Bangladesh 4.0 Scale
  if (cgpa >= 3.85) { letter = 'A+'; color = '#10b981'; remark = 'Outstanding'; }
  else if (cgpa >= 3.50) { letter = 'A'; color = '#10b981'; remark = 'Excellent'; }
  else if (cgpa >= 3.25) { letter = 'A-'; color = '#22c55e'; remark = 'Very Good'; }
  else if (cgpa >= 3.00) { letter = 'B+'; color = '#2563eb'; remark = 'Good'; }
  else if (cgpa >= 2.75) { letter = 'B'; color = '#3b82f6'; remark = 'Satisfactory'; }
  else if (cgpa >= 2.50) { letter = 'B-'; color = '#60a5fa'; remark = 'Above Average'; }
  else if (cgpa >= 2.25) { letter = 'C+'; color = '#f59e0b'; remark = 'Average'; }
  else if (cgpa >= 2.00) { letter = 'C'; color = '#f97316'; remark = 'Below Average'; }
  else if (cgpa >= 1.50) { letter = 'D'; color = '#ef4444'; remark = 'Pass'; }
  
  letterEl.textContent = letter;
  letterEl.style.color = color;
  
  // Update remark if element exists
  const remarkEl = document.getElementById('grade-remark');
  if (remarkEl) remarkEl.textContent = remark;
}

/**
 * Update Charts
 */
function updateCharts(data) {
  // CGPA Progression Chart
  const cgpaCanvas = document.getElementById('cgpa-progression-chart');
  if (cgpaCanvas) {
    let runningTotal = 0;
    let runningCredits = 0;
    
    const chartData = data.map(row => {
      const semCredits = row.majorCredits + row.minorCredits;
      runningTotal += row.sgpa * semCredits;
      runningCredits += semCredits;
      return {
        semester: row.semester,
        cgpa: (runningTotal / runningCredits).toFixed(2)
      };
    });
    
    if (cgpaChart) cgpaChart.destroy();
    cgpaChart = PortalCharts.createCGPAProgressionChart('cgpa-progression-chart', chartData);
  }
  
  // Credits Distribution Chart
  const creditsCanvas = document.getElementById('credits-distribution-chart');
  if (creditsCanvas) {
    if (creditsChart) creditsChart.destroy();
    creditsChart = new Chart(creditsCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: data.map(d => `Sem ${d.semester}`),
        datasets: [
          {
            label: 'Major',
            data: data.map(d => d.majorCredits),
            backgroundColor: '#2563eb',
            borderRadius: 4
          },
          {
            label: 'Minor',
            data: data.map(d => d.minorCredits),
            backgroundColor: '#8b5cf6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true }
        }
      }
    });
  }
}

/**
 * What-If Scenario Modal
 */
function showWhatIfModal() {
  const currentCGPA = parseFloat(document.getElementById('calc-cgpa')?.textContent) || 0;
  const totalCredits = parseInt(document.getElementById('calc-total-credits')?.textContent) || 0;
  
  const modalHTML = `
    <div class="modal-overlay active" id="what-if-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">What-If Scenario</h3>
          <button class="modal-close" onclick="closeWhatIfModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-secondary mb-3">See how your next semester could affect your CGPA (BD 4.0 Scale)</p>
          
          <div class="form-group">
            <label class="form-label">Current CGPA</label>
            <input type="text" class="form-input" value="${currentCGPA}" disabled>
          </div>
          
          <div class="form-group">
            <label class="form-label">Target SGPA for Next Semester (max 4.00)</label>
            <input type="number" class="form-input" id="target-sgpa" 
                   value="3.75" min="0" max="4" step="0.01">
          </div>
          
          <div class="form-group">
            <label class="form-label">Credits Next Semester</label>
            <input type="number" class="form-input" id="target-credits" 
                   value="21" min="12" max="30">
          </div>
          
          <div class="card" style="background: var(--bg-page); margin-top: 16px; padding: 16px;">
            <div class="text-secondary text-sm">Projected CGPA</div>
            <div class="text-2xl font-bold text-primary" id="projected-cgpa">-</div>
            <div class="text-sm text-secondary mt-1" id="projected-change"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeWhatIfModal()">Close</button>
          <button class="btn btn-primary" onclick="applyWhatIf()">Add to Calculator</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';
  
  // Calculate on input
  const targetSGPA = document.getElementById('target-sgpa');
  const targetCredits = document.getElementById('target-credits');
  
  function calculateProjection() {
    const sgpa = parseFloat(targetSGPA.value) || 0;
    const credits = parseInt(targetCredits.value) || 0;
    
    const currentTotal = currentCGPA * totalCredits;
    const newTotal = currentTotal + (sgpa * credits);
    const newCredits = totalCredits + credits;
    const projected = (newTotal / newCredits).toFixed(2);
    
    document.getElementById('projected-cgpa').textContent = projected;
    
    const change = (projected - currentCGPA).toFixed(2);
    const changeEl = document.getElementById('projected-change');
    if (change > 0) {
      changeEl.innerHTML = `<span class="text-success">↑ ${change} increase</span>`;
    } else if (change < 0) {
      changeEl.innerHTML = `<span class="text-danger">↓ ${Math.abs(change)} decrease</span>`;
    } else {
      changeEl.innerHTML = `<span class="text-secondary">No change</span>`;
    }
  }
  
  targetSGPA.addEventListener('input', calculateProjection);
  targetCredits.addEventListener('input', calculateProjection);
  calculateProjection();
}

/**
 * Close What-If Modal
 */
function closeWhatIfModal() {
  const modal = document.getElementById('what-if-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

/**
 * Apply What-If to Calculator
 */
function applyWhatIf() {
  const sgpa = parseFloat(document.getElementById('target-sgpa').value) || 0;
  const credits = parseInt(document.getElementById('target-credits').value) || 24;
  
  const lastSem = calculatorData.length > 0 
    ? calculatorData[calculatorData.length - 1].semester 
    : 0;
  
  calculatorData.push({
    semester: lastSem + 1,
    sgpa: sgpa,
    majorCredits: Math.round(credits * 0.75),
    minorCredits: Math.round(credits * 0.25),
    include: true
  });
  
  closeWhatIfModal();
  renderTable();
  calculateAll();
  
  PortalUtils.showToast('Projected semester added to calculator', 'success');
}

/**
 * Reset Calculator to Original Data
 */
function resetCalculator() {
  PortalUtils.confirmAction(
    'Are you sure you want to reset the calculator to original data?',
    () => {
      loadExistingData();
      calculateAll();
      PortalUtils.showToast('Calculator reset to original data', 'success');
    }
  );
}

/**
 * Export Calculator Data
 */
function exportCalculatorData() {
  const data = {
    semesters: calculatorData,
    results: {
      cgpa: document.getElementById('calc-cgpa')?.textContent,
      majorCGPA: document.getElementById('calc-major-cgpa')?.textContent,
      minorCGPA: document.getElementById('calc-minor-cgpa')?.textContent,
      totalCredits: document.getElementById('calc-total-credits')?.textContent
    },
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cgpa-calculator-data.json';
  a.click();
  URL.revokeObjectURL(url);
  
  PortalUtils.showToast('Data exported successfully', 'success');
}

/**
 * Print Calculator Results
 */
function printCalculatorResults() {
  window.print();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('calculator-table')) {
    initCalculator();
  }
});

// Export functions
window.CGPACalculator = {
  init: initCalculator,
  addRow,
  removeRow,
  calculateAll,
  reset: resetCalculator,
  export: exportCalculatorData,
  print: printCalculatorResults
};
