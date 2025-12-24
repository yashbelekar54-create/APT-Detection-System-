// APT Detection System JavaScript

// Application data
const appData = {
  "threat_metrics": {
    "total_threats": 1847,
    "active_rules": 11,
    "coverage_percentage": 87,
    "high_severity": 23,
    "medium_severity": 156,
    "low_severity": 45
  },
  "recent_threats": [
    {
      "id": 1,
      "timestamp": "2025-01-24T15:30:00Z",
      "title": "Credential Dumping - Mimikatz Execution",
      "severity": "high",
      "mitre_technique": "T1003.001",
      "source_ip": "192.168.1.100",
      "target": "DC01.company.com",
      "score": 9
    },
    {
      "id": 2,
      "timestamp": "2025-01-24T15:25:00Z", 
      "title": "DNS Tunneling Detection",
      "severity": "high",
      "mitre_technique": "T1048.003",
      "source_ip": "10.0.0.45",
      "target": "malicious-domain.com",
      "score": 8
    },
    {
      "id": 3,
      "timestamp": "2025-01-24T15:20:00Z",
      "title": "Port Scan Detection via Zeek", 
      "severity": "medium",
      "mitre_technique": "T1046",
      "source_ip": "192.168.1.100",
      "target": "192.168.1.0/24",
      "score": 5
    }
  ],
  "mitre_coverage": {
    "Initial Access": {"covered": 2, "total": 9},
    "Execution": {"covered": 3, "total": 7},
    "Persistence": {"covered": 4, "total": 12},
    "Privilege Escalation": {"covered": 3, "total": 8},
    "Defense Evasion": {"covered": 5, "total": 15},
    "Credential Access": {"covered": 6, "total": 10},
    "Discovery": {"covered": 4, "total": 11},
    "Lateral Movement": {"covered": 3, "total": 6},
    "Collection": {"covered": 2, "total": 5},
    "Exfiltration": {"covered": 3, "total": 7}
  },
  "geographic_threats": [
    {"country": "Russia", "lat": 55.7558, "lng": 37.6176, "count": 45, "severity": "high"},
    {"country": "China", "lat": 39.9042, "lng": 116.4074, "count": 32, "severity": "medium"},
    {"country": "North Korea", "lat": 39.0392, "lng": 125.7625, "count": 18, "severity": "high"},
    {"country": "Iran", "lat": 35.6892, "lng": 51.3890, "count": 12, "severity": "medium"}
  ],
  "detection_rules": [
    {
      "id": 1,
      "name": "Credential Dumping - Mimikatz Execution",
      "enabled": true,
      "severity": "high", 
      "mitre_technique": "T1003.001",
      "detection_rate": 94.2,
      "false_positives": 0.8,
      "description": "Detects potential credential dumping via Mimikatz or similar tools"
    },
    {
      "id": 2,
      "name": "Port Scan Detection via Zeek",
      "enabled": true,
      "severity": "medium",
      "mitre_technique": "T1046", 
      "detection_rate": 87.5,
      "false_positives": 2.1,
      "description": "Detects potential reconnaissance activity through port scanning patterns"
    },
    {
      "id": 3,
      "name": "DNS Tunneling Detection",
      "enabled": true,
      "severity": "high",
      "mitre_technique": "T1048.003",
      "detection_rate": 91.3,
      "false_positives": 1.2,
      "description": "Detects potential data exfiltration via DNS tunneling"
    },
    {
      "id": 4,
      "name": "PowerShell Obfuscation Detection",
      "enabled": true,
      "severity": "high",
      "mitre_technique": "T1059.001",
      "detection_rate": 89.7,
      "false_positives": 1.5,
      "description": "Detects obfuscated PowerShell commands and execution"
    },
    {
      "id": 5,
      "name": "Lateral Movement via SMB",
      "enabled": false,
      "severity": "medium",
      "mitre_technique": "T1021.002",
      "detection_rate": 78.3,
      "false_positives": 3.2,
      "description": "Detects suspicious SMB connections for lateral movement"
    },
    {
      "id": 6,
      "name": "Registry Persistence Modification",
      "enabled": true,
      "severity": "medium",
      "mitre_technique": "T1547.001",
      "detection_rate": 82.1,
      "false_positives": 2.8,
      "description": "Detects persistence mechanisms via registry modifications"
    }
  ]
};

// Global variables
let threatMap;
let threatCategoriesChart;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupTabNavigation();
  setupThemeToggle();
  animateMetrics();
  renderMitreCoverage();
  initializeThreatMap();
  renderThreatTimeline();
  initializeThreatCategoriesChart();
  renderDetectionRules();
  setupRuleFilters();
  populateThreatSelect();
  
  // Simulate real-time updates
  setInterval(updateRealTimeData, 5000);
}

// Tab Navigation
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Remove active class from all tabs and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      // Reinitialize charts if switching to dashboard
      if (targetTab === 'dashboard') {
        setTimeout(() => {
          if (threatCategoriesChart) {
            threatCategoriesChart.resize();
          }
        }, 100);
      }
    });
  });
}

// Theme Toggle
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
  
  updateThemeButton(currentTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    updateThemeButton(newTheme);
  });
}

function updateThemeButton(theme) {
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';
}

// Animate Metrics
function animateMetrics() {
  const metrics = [
    { id: 'totalThreats', value: appData.threat_metrics.total_threats },
    { id: 'activeRules', value: appData.threat_metrics.active_rules },
    { id: 'coveragePercent', value: appData.threat_metrics.coverage_percentage, suffix: '%' },
    { id: 'highSeverity', value: appData.threat_metrics.high_severity }
  ];
  
  metrics.forEach(metric => {
    animateCounter(metric.id, metric.value, metric.suffix || '');
  });
}

function animateCounter(elementId, targetValue, suffix) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let currentValue = 0;
  const increment = targetValue / 60; // 60 frames for smooth animation
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      currentValue = targetValue;
      clearInterval(timer);
    }
    element.textContent = Math.floor(currentValue) + suffix;
  }, 25);
}

// MITRE ATT&CK Coverage
function renderMitreCoverage() {
  const container = document.getElementById('mitreHeatmap');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.entries(appData.mitre_coverage).forEach(([technique, coverage]) => {
    const percentage = Math.round((coverage.covered / coverage.total) * 100);
    
    const techniqueElement = document.createElement('div');
    techniqueElement.className = 'mitre-technique';
    techniqueElement.innerHTML = `
      <div class="technique-name">${technique}</div>
      <div class="coverage-info">
        <div class="coverage-text">${coverage.covered}/${coverage.total}</div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    
    container.appendChild(techniqueElement);
  });
}

// Geographic Threat Map
function initializeThreatMap() {
  const mapContainer = document.getElementById('threatMap');
  if (!mapContainer) return;
  
  threatMap = L.map('threatMap').setView([40, 0], 2);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(threatMap);
  
  appData.geographic_threats.forEach(threat => {
    const color = threat.severity === 'high' ? '#ff5459' : '#e68161';
    const marker = L.circleMarker([threat.lat, threat.lng], {
      radius: Math.max(8, threat.count / 5),
      fillColor: color,
      color: 'white',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(threatMap);
    
    marker.bindPopup(`
      <div>
        <strong>${threat.country}</strong><br>
        Threats: ${threat.count}<br>
        Severity: ${threat.severity}
      </div>
    `);
  });
}

// Threat Timeline
function renderThreatTimeline() {
  const container = document.getElementById('threatTimeline');
  if (!container) return;
  
  container.innerHTML = '';
  
  appData.recent_threats.forEach(threat => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item fade-in';
    
    const time = new Date(threat.timestamp).toLocaleTimeString();
    
    timelineItem.innerHTML = `
      <div class="timeline-time">${time}</div>
      <div class="timeline-content">
        <div class="timeline-title">${threat.title}</div>
        <div class="timeline-details">
          <span class="timeline-severity severity-${threat.severity}">${threat.severity.toUpperCase()}</span>
          <span>${threat.mitre_technique}</span>
          <span>Score: ${threat.score}/10</span>
        </div>
      </div>
    `;
    
    container.appendChild(timelineItem);
  });
}

// Threat Categories Chart
function initializeThreatCategoriesChart() {
  const ctx = document.getElementById('threatCategoriesChart');
  if (!ctx) return;
  
  const categories = {
    'Credential Access': 34,
    'Lateral Movement': 28,
    'Persistence': 22,
    'Discovery': 18,
    'Exfiltration': 15,
    'Defense Evasion': 12
  };
  
  threatCategoriesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#1FB8CD',
          '#FFC185', 
          '#B4413C',
          '#ECEBD5',
          '#5D878F',
          '#DB4545'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

// Detection Rules
function renderDetectionRules() {
  const container = document.getElementById('rulesGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  appData.detection_rules.forEach(rule => {
    const ruleCard = document.createElement('div');
    ruleCard.className = 'rule-card fade-in';
    
    ruleCard.innerHTML = `
      <div class="rule-header">
        <div>
          <div class="rule-title">${rule.name}</div>
          <div class="rule-mitre">${rule.mitre_technique}</div>
        </div>
        <div class="rule-toggle ${rule.enabled ? 'enabled' : ''}" data-rule-id="${rule.id}"></div>
      </div>
      <div class="rule-description">${rule.description}</div>
      <div class="rule-metrics">
        <div class="rule-metric">
          <div class="metric-value-small">${rule.detection_rate}%</div>
          <div class="metric-label-small">Detection Rate</div>
        </div>
        <div class="rule-metric">
          <div class="metric-value-small">${rule.false_positives}%</div>
          <div class="metric-label-small">False Positives</div>
        </div>
        <div class="rule-metric">
          <div class="metric-value-small severity-${rule.severity}">${rule.severity.toUpperCase()}</div>
          <div class="metric-label-small">Severity</div>
        </div>
      </div>
    `;
    
    container.appendChild(ruleCard);
  });
  
  // Add toggle functionality
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('rule-toggle')) {
      const ruleId = parseInt(e.target.dataset.ruleId);
      toggleRule(ruleId);
    }
  });
}

function toggleRule(ruleId) {
  const rule = appData.detection_rules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = !rule.enabled;
    
    // Update the toggle visual state
    const toggle = document.querySelector(`[data-rule-id="${ruleId}"]`);
    if (toggle) {
      toggle.classList.toggle('enabled', rule.enabled);
    }
    
    // Update active rules count
    const activeCount = appData.detection_rules.filter(r => r.enabled).length;
    appData.threat_metrics.active_rules = activeCount;
    document.getElementById('activeRules').textContent = activeCount;
  }
}

// Rule Filters
function setupRuleFilters() {
  const searchInput = document.getElementById('ruleSearch');
  const severityFilter = document.getElementById('severityFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterRules);
  }
  
  if (severityFilter) {
    severityFilter.addEventListener('change', filterRules);
  }
}

function filterRules() {
  const searchTerm = document.getElementById('ruleSearch')?.value.toLowerCase() || '';
  const severityFilter = document.getElementById('severityFilter')?.value || '';
  
  const ruleCards = document.querySelectorAll('.rule-card');
  
  ruleCards.forEach((card, index) => {
    const rule = appData.detection_rules[index];
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm) || 
                         rule.description.toLowerCase().includes(searchTerm);
    const matchesSeverity = !severityFilter || rule.severity === severityFilter;
    
    if (matchesSearch && matchesSeverity) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Threat Selection
function populateThreatSelect() {
  const select = document.getElementById('threatSelect');
  if (!select) return;
  
  appData.recent_threats.forEach(threat => {
    const option = document.createElement('option');
    option.value = threat.id;
    option.textContent = threat.title;
    select.appendChild(option);
  });
  
  select.addEventListener('change', (e) => {
    if (e.target.value) {
      updateAttackProgression(parseInt(e.target.value));
    }
  });
}

function updateAttackProgression(threatId) {
  const threat = appData.recent_threats.find(t => t.id === threatId);
  if (!threat) return;
  
  // This would normally update the attack progression visualization
  // For now, we'll just show a simple update
  console.log('Selected threat:', threat);
}

// Real-time Updates
function updateRealTimeData() {
  // Simulate new threat detection
  if (Math.random() > 0.8) {
    appData.threat_metrics.total_threats += Math.floor(Math.random() * 3) + 1;
    document.getElementById('totalThreats').textContent = appData.threat_metrics.total_threats;
    
    // Add new threat to timeline occasionally
    if (Math.random() > 0.9) {
      addNewThreatToTimeline();
    }
  }
  
  // Update system metrics
  updateSystemMetrics();
}

function addNewThreatToTimeline() {
  const newThreats = [
    "Suspicious PowerShell Execution",
    "Unusual Network Traffic Detected", 
    "Potential Data Exfiltration",
    "Suspicious Registry Modification",
    "Anomalous Process Execution"
  ];
  
  const severities = ['high', 'medium', 'low'];
  const techniques = ['T1059.001', 'T1021.001', 'T1048.003', 'T1547.001', 'T1055'];
  
  const newThreat = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    title: newThreats[Math.floor(Math.random() * newThreats.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    mitre_technique: techniques[Math.floor(Math.random() * techniques.length)],
    source_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    target: "internal-host.company.com",
    score: Math.floor(Math.random() * 10) + 1
  };
  
  // Add to beginning of recent threats
  appData.recent_threats.unshift(newThreat);
  
  // Keep only last 10 threats
  if (appData.recent_threats.length > 10) {
    appData.recent_threats = appData.recent_threats.slice(0, 10);
  }
  
  // Re-render timeline
  renderThreatTimeline();
}

function updateSystemMetrics() {
  // Simulate small fluctuations in system metrics
  const fluctuation = () => Math.random() * 10 - 5; // -5 to +5
  
  // Update ingestion rate display
  const currentRate = 10542 + Math.floor(fluctuation() * 100);
  const rateElements = document.querySelectorAll('.perf-value');
  if (rateElements[0]) {
    rateElements[0].textContent = `${currentRate.toLocaleString()} events/sec`;
  }
  
  // Update component CPU usage (simulate)
  const components = document.querySelectorAll('.component-metrics');
  components.forEach(comp => {
    const text = comp.textContent;
    const cpuMatch = text.match(/CPU: (\d+)%/);
    if (cpuMatch) {
      const currentCpu = parseInt(cpuMatch[1]);
      const newCpu = Math.max(0, Math.min(100, currentCpu + Math.floor(fluctuation())));
      comp.textContent = text.replace(/CPU: \d+%/, `CPU: ${newCpu}%`);
    }
  });
}

// Export functionality
function exportReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    metrics: appData.threat_metrics,
    recent_threats: appData.recent_threats,
    mitre_coverage: appData.mitre_coverage,
    detection_rules: appData.detection_rules.filter(r => r.enabled)
  };
  
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `apt-detection-report-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

// Add export button listeners
document.addEventListener('click', (e) => {
  if (e.target.textContent === 'Export') {
    exportReport();
  }
});

// Utility Functions
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function getSeverityColor(severity) {
  const colors = {
    high: '#ff5459',
    medium: '#e68161', 
    low: '#626c71'
  };
  return colors[severity] || colors.low;
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
});

// Handle resize events
window.addEventListener('resize', () => {
  if (threatMap) {
    threatMap.invalidateSize();
  }
  if (threatCategoriesChart) {
    threatCategoriesChart.resize();
  }
});