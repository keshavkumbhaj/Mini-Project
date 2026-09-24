/**
 * ROZ MARRA - Dashboard Controller
 * Lead Frontend Engineering for ROZ MARRA
 */

document.addEventListener('DOMContentLoaded', () => {
  initLogo();
  initHeaderGreeting();
  initSpendingChart();
  initHabitsInteraction();
  initGlobalInputParser();
  initMobileSidebar();
});

/**
 * 1. Logo fallback handler
 * Automatically prioritizes custom official logo.png if provided by the owner,
 * otherwise falls back cleanly to the geometric rozmarra-logo.svg.
 */
function initLogo() {
  const logoImg = document.getElementById('rozmarra-logo');
  if (!logoImg) return;

  // Attempt to check if custom logo.png exists
  const customImg = new Image();
  customImg.src = 'assets/logo/logo.png';
  customImg.onload = () => {
    logoImg.src = 'assets/logo/logo.png';
  };
  customImg.onerror = () => {
    // Keep fallback rozmarra-logo.svg
  };
}

/**
 * 2. Header dynamic greeting and current date
 */
function initHeaderGreeting() {
  const greetingEl = document.getElementById('user-greeting');
  const datePillEl = document.getElementById('current-date-pill');

  const now = new Date();
  const hours = now.getHours();

  let timeGreeting = 'Good evening';
  if (hours < 12) {
    timeGreeting = 'Good morning';
  } else if (hours < 17) {
    timeGreeting = 'Good afternoon';
  }

  if (greetingEl) {
    greetingEl.textContent = `${timeGreeting}, Keshav`;
  }

  if (datePillEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    datePillEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

/**
 * 3. Spending Overview Chart using Chart.js
 */
let spendingChartInstance = null;

const spendingDatasets = {
  '7d': {
    labels: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Today'],
    data: [420, 850, 1240, 960, 310, 520, 350],
    total: '₹4,650'
  },
  '30d': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [3800, 4900, 4250, 3950],
    total: '₹16,900'
  },
  'month': {
    labels: ['Sep 01', 'Sep 06', 'Sep 11', 'Sep 16', 'Sep 21', 'Sep 23'],
    data: [650, 1100, 450, 1420, 890, 350],
    total: '₹4,860'
  }
};

function initSpendingChart() {
  const ctx = document.getElementById('spendingChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const chartCtx = ctx.getContext('2d');

  // Gradient fill for area under line
  const gradientFill = chartCtx.createLinearGradient(0, 0, 0, 200);
  gradientFill.addColorStop(0, 'rgba(96, 224, 255, 0.22)');
  gradientFill.addColorStop(1, 'rgba(79, 139, 255, 0.0)');

  const chartData = spendingDatasets['7d'];

  spendingChartInstance = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Spending (₹)',
        data: chartData.data,
        borderColor: '#60E0FF',
        borderWidth: 2.2,
        tension: 0.35,
        fill: true,
        backgroundColor: gradientFill,
        pointBackgroundColor: '#10151C',
        pointBorderColor: '#60E0FF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#60E0FF',
        pointHoverBorderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#151B23',
          titleColor: '#F5F7FA',
          bodyColor: '#8B95A5',
          borderColor: '#252D38',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Spent: ₹${context.parsed.y.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(37, 45, 56, 0.4)',
            drawBorder: false
          },
          ticks: {
            color: '#8B95A5',
            font: {
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(37, 45, 56, 0.4)',
            drawBorder: false
          },
          ticks: {
            color: '#8B95A5',
            font: {
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 11
            },
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      }
    }
  });

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.card-filter-group .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const period = btn.dataset.period;
      if (spendingDatasets[period] && spendingChartInstance) {
        spendingChartInstance.data.labels = spendingDatasets[period].labels;
        spendingChartInstance.data.datasets[0].data = spendingDatasets[period].data;
        spendingChartInstance.update();
      }
    });
  });
}

/**
 * 4. Interactive Habits Checklist & Streak progression
 */
function initHabitsInteraction() {
  const habitItems = document.querySelectorAll('.habit-item');

  habitItems.forEach(item => {
    const checkBtn = item.querySelector('.habit-check-btn');
    const streakEl = item.querySelector('.habit-streak-pill');
    const percentEl = item.querySelector('.habit-percentage');
    const progressBar = item.querySelector('.habit-progress-bar');

    if (!checkBtn) return;

    checkBtn.addEventListener('click', () => {
      const isCompleted = item.classList.toggle('completed');
      let basePercent = parseInt(item.dataset.basePercent || '70', 10);
      let baseStreak = parseInt(item.dataset.baseStreak || '5', 10);

      if (isCompleted) {
        const newPercent = Math.min(100, basePercent + 10);
        const newStreak = baseStreak + 1;
        percentEl.textContent = `${newPercent}%`;
        streakEl.textContent = `${newStreak} day streak`;
        progressBar.style.width = `${newPercent}%`;
        showToast(`Habit marked complete: ${item.querySelector('.habit-name').textContent}`);
      } else {
        percentEl.textContent = `${basePercent}%`;
        streakEl.textContent = `${baseStreak} day streak`;
        progressBar.style.width = `${basePercent}%`;
      }
    });
  });
}

/**
 * 5. Global "Add anything..." Natural Language Input Parser
 * Simulates intelligent cross-domain intent extraction
 */
function initGlobalInputParser() {
  const inputField = document.getElementById('global-input-field');
  const modalBackdrop = document.getElementById('parse-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');

  // Parsed field displays
  const rawInputDisplay = document.getElementById('parsed-raw-text');
  const parsedType = document.getElementById('parsed-type');
  const parsedAmount = document.getElementById('parsed-amount');
  const parsedCategory = document.getElementById('parsed-category');
  const parsedDesc = document.getElementById('parsed-desc');
  const parsedDate = document.getElementById('parsed-date');

  function openParseModal(rawText) {
    const parsed = parseInputHeuristic(rawText);

    rawInputDisplay.textContent = `"${rawText}"`;
    parsedType.textContent = parsed.type;
    parsedAmount.textContent = parsed.amount;
    parsedCategory.textContent = parsed.category;
    parsedDesc.textContent = parsed.description;
    parsedDate.textContent = parsed.date;

    modalBackdrop.classList.add('active');
  }

  function closeParseModal() {
    modalBackdrop.classList.remove('active');
  }

  if (inputField) {
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = inputField.value.trim();
        if (value) {
          openParseModal(value);
        } else {
          // Default demonstration query if empty
          openParseModal('Spent ₹350 on dinner yesterday');
        }
      }
    });
  }

  // Keyboard shortcut Ctrl + K or Cmd + K to focus global input
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      inputField?.focus();
    }
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeParseModal();
    }
  });

  modalCloseBtn?.addEventListener('click', closeParseModal);
  modalCancelBtn?.addEventListener('click', closeParseModal);

  modalConfirmBtn?.addEventListener('click', () => {
    const type = parsedType.textContent;
    const desc = parsedDesc.textContent;
    closeParseModal();
    if (inputField) inputField.value = '';
    showToast(`Successfully logged ${type.toLowerCase()}: ${desc}`);
  });

  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeParseModal();
    }
  });
}

/**
 * Lightweight deterministic heuristic parser simulating AI extraction
 */
function parseInputHeuristic(text) {
  const lower = text.toLowerCase();

  // 1. Amount extraction (e.g. ₹350, 350 rs, 350)
  let amount = '₹0';
  const amountMatch = text.match(/(?:₹|rs\.?|inr\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (amountMatch && (lower.includes('spent') || lower.includes('paid') || lower.includes('bought') || lower.includes('₹') || lower.includes('rs'))) {
    amount = `₹${amountMatch[1]}`;
  }

  // 2. Date extraction
  let date = 'Today';
  if (lower.includes('yesterday')) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    date = `Yesterday (${y.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
  } else if (lower.includes('today')) {
    date = 'Today';
  }

  // 3. Category & Description
  let category = 'General';
  let type = 'Expense';
  let description = text;

  if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('food') || lower.includes('coffee') || lower.includes('burger')) {
    category = 'Food & Dining';
    type = 'Expense';
    description = lower.includes('dinner') ? 'Dinner' : lower.includes('coffee') ? 'Coffee' : 'Food';
  } else if (lower.includes('uber') || lower.includes('metro') || lower.includes('auto') || lower.includes('petrol') || lower.includes('fuel')) {
    category = 'Transport';
    type = 'Expense';
    description = 'Transit / Commute';
  } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('movie')) {
    category = 'Entertainment';
    type = 'Subscription / Expense';
    description = 'Streaming Entertainment';
  } else if (lower.includes('gym') || lower.includes('exercise') || lower.includes('read') || lower.includes('dsa') || lower.includes('meditat')) {
    type = 'Habit Activity';
    category = 'Productivity & Health';
    amount = 'N/A';
    description = text;
  }

  return { type, amount, category, description, date };
}

/**
 * 6. Toast Notification Manager
 */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60E0FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * 7. Mobile Sidebar Drawer Toggle
 */
function initMobileSidebar() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}
