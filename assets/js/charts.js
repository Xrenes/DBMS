/**
 * Student Portal - Charts Configuration
 * Uses Chart.js for all visualizations
 */

// Global Chart.js defaults
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6b7280';
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };

// Color palette
const chartColors = {
  primary: '#2563eb',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  purple: '#8b5cf6',
  purpleLight: 'rgba(139, 92, 246, 0.1)',
  gray: '#6b7280',
  grayLight: 'rgba(107, 114, 128, 0.1)',
  border: '#e5e7eb'
};

// Chart instances storage
const chartInstances = {};

/**
 * Create or update a chart
 */
function createChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  // Destroy existing chart if any
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  
  // Create new chart
  chartInstances[canvasId] = new Chart(canvas.getContext('2d'), config);
  return chartInstances[canvasId];
}

/**
 * Mini Sparkline Chart (for metric cards)
 */
function createSparkline(canvasId, data, color = chartColors.primary) {
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data: data,
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        line: { borderCapStyle: 'round' }
      }
    }
  });
}

/**
 * SGPA Trend Line Chart
 */
function createSGPATrendChart(canvasId) {
  const semesters = studentData.semesters;
  
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: semesters.map(s => `Sem ${s.id}`),
      datasets: [{
        label: 'SGPA (out of 4.0)',
        data: semesters.map(s => s.sgpa),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `SGPA: ${ctx.raw} / 4.0`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { padding: 10 }
        },
        y: {
          min: 0,
          max: 4,
          ticks: {
            stepSize: 0.5,
            padding: 10
          },
          grid: {
            color: chartColors.border,
            drawBorder: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

/**
 * Credits Distribution Stacked Bar Chart
 */
function createCreditsChart(canvasId) {
  const semesters = studentData.semesters;
  
  return createChart(canvasId, {
    type: 'bar',
    data: {
      labels: semesters.map(s => `Sem ${s.id}`),
      datasets: [
        {
          label: 'Major Credits',
          data: semesters.map(s => s.majorCredits),
          backgroundColor: chartColors.primary,
          borderRadius: 4,
          barPercentage: 0.6
        },
        {
          label: 'Minor Credits',
          data: semesters.map(s => s.minorCredits),
          backgroundColor: chartColors.purple,
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 20
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          grid: {
            color: chartColors.border,
            drawBorder: false
          }
        }
      }
    }
  });
}

/**
 * Attendance Bar Chart
 */
function createAttendanceChart(canvasId) {
  const subjects = studentData.attendance.subjects;
  
  return createChart(canvasId, {
    type: 'bar',
    data: {
      labels: subjects.map(s => s.code),
      datasets: [{
        label: 'Attendance %',
        data: subjects.map(s => s.percent),
        backgroundColor: subjects.map(s => {
          if (s.percent >= 85) return chartColors.success;
          if (s.percent >= 75) return chartColors.warning;
          return chartColors.danger;
        }),
        borderRadius: 6,
        barPercentage: 0.7
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx) => subjects[ctx[0].dataIndex].name,
            label: (ctx) => `Attendance: ${ctx.raw}%`
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: {
            color: chartColors.border,
            drawBorder: false
          },
          ticks: {
            callback: (value) => value + '%'
          }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Attendance Trend Line Chart
 */
function createAttendanceTrendChart(canvasId) {
  const monthlyData = studentData.attendance.monthlyTrend;
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: months.slice(0, monthlyData.length),
      datasets: [{
        label: 'Attendance %',
        data: monthlyData,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Attendance: ${ctx.raw}%`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          min: 60,
          max: 100,
          ticks: {
            callback: (value) => value + '%'
          },
          grid: {
            color: chartColors.border,
            drawBorder: false
          }
        }
      }
    }
  });
}

/**
 * CGPA Progression Chart with Projection
 */
function createCGPAProgressionChart(canvasId, semesterData, projection = null) {
  const datasets = [{
    label: 'CGPA (out of 4.0)',
    data: semesterData.map(s => s.cgpa),
    borderColor: chartColors.primary,
    backgroundColor: chartColors.primary,
    tension: 0.3,
    pointRadius: 6,
    pointBackgroundColor: chartColors.primary,
    pointBorderColor: '#fff',
    pointBorderWidth: 2
  }];
  
  // Add projection line if provided
  if (projection) {
    datasets.push({
      label: 'Projected',
      data: projection,
      borderColor: chartColors.gray,
      borderDash: [5, 5],
      tension: 0.3,
      pointRadius: 4,
      pointStyle: 'triangle'
    });
  }
  
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: semesterData.map(s => `Sem ${s.semester}`),
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: projection !== null,
          position: 'bottom'
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0,
          max: 4,
          ticks: { stepSize: 0.5 },
          grid: { color: chartColors.border, drawBorder: false }
        }
      }
    }
  });
}

/**
 * Finance Chart - Charges vs Payments
 */
function createFinanceChart(canvasId) {
  const finance = studentData.finance;
  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
  
  return createChart(canvasId, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Charges',
          data: finance.chargesPerSemester,
          backgroundColor: chartColors.danger,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Payments',
          data: finance.paymentsPerSemester,
          backgroundColor: chartColors.success,
          borderRadius: 4,
          barPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: {
            color: chartColors.border,
            drawBorder: false
          },
          ticks: {
            callback: (value) => '₹' + (value / 1000) + 'K'
          }
        }
      }
    }
  });
}

/**
 * Balance Trend Chart
 */
function createBalanceTrendChart(canvasId) {
  const transactions = studentData.finance.transactions;
  const balances = transactions.map(t => t.balance);
  const dates = transactions.map(t => {
    const date = new Date(t.date);
    return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  });
  
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0,
        stepped: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Balance: ₹${ctx.raw.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45 }
        },
        y: {
          grid: {
            color: chartColors.border,
            drawBorder: false
          },
          ticks: {
            callback: (value) => '₹' + (value / 1000) + 'K'
          }
        }
      }
    }
  });
}

/**
 * Grade Distribution Chart
 */
function createGradeDistributionChart(canvasId) {
  const grades = studentData.exams.gradeDistribution;
  const labels = Object.keys(grades);
  const data = Object.values(grades);
  
  return createChart(canvasId, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Courses',
        data: data,
        backgroundColor: [
          chartColors.success,
          chartColors.primary,
          'rgba(139, 92, 246, 0.8)',
          chartColors.warning,
          'rgba(251, 146, 60, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          chartColors.danger
        ],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 5 },
          grid: {
            color: chartColors.border,
            drawBorder: false
          }
        }
      }
    }
  });
}

/**
 * Exam Results Trend Chart
 */
function createExamResultsChart(canvasId) {
  const results = studentData.exams.results;
  
  return createChart(canvasId, {
    type: 'line',
    data: {
      labels: results.map(r => `Sem ${r.semester}`),
      datasets: [
        {
          label: 'Mid Term',
          data: results.map(r => r.mid),
          borderColor: chartColors.primary,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 4
        },
        {
          label: 'End Term',
          data: results.map(r => r.end),
          borderColor: chartColors.success,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 4
        },
        {
          label: 'Total',
          data: results.map(r => r.total),
          borderColor: chartColors.purple,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: (value) => value + '%'
          },
          grid: {
            color: chartColors.border,
            drawBorder: false
          }
        }
      }
    }
  });
}

/**
 * Doughnut Chart for Quick Stats
 */
function createDoughnutChart(canvasId, value, max = 100, color = chartColors.primary) {
  return createChart(canvasId, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: [color, chartColors.grayLight],
        borderWidth: 0,
        cutout: '80%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

/**
 * Initialize Dashboard Charts
 */
function initDashboardCharts() {
  // Mini sparklines for metric cards
  const cgpaData = studentData.semesters.map(s => s.sgpa);
  createSparkline('cgpa-sparkline', cgpaData, chartColors.primary);
  createSparkline('sgpa-sparkline', cgpaData.slice(-4), chartColors.success);
  createSparkline('attendance-sparkline', studentData.attendance.monthlyTrend, chartColors.warning);
  
  // Main charts
  createSGPATrendChart('sgpa-trend-chart');
  createCreditsChart('credits-chart');
  createAttendanceChart('attendance-chart');
}

/**
 * Destroy all charts (for cleanup)
 */
function destroyAllCharts() {
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      delete chartInstances[key];
    }
  });
}

/**
 * Export chart functions
 */
window.PortalCharts = {
  create: createChart,
  createSparkline,
  createSGPATrendChart,
  createCreditsChart,
  createAttendanceChart,
  createAttendanceTrendChart,
  createCGPAProgressionChart,
  createFinanceChart,
  createBalanceTrendChart,
  createGradeDistributionChart,
  createExamResultsChart,
  createDoughnutChart,
  initDashboardCharts,
  destroyAllCharts,
  colors: chartColors
};
