// Popup JavaScript for Sentinel AI extension

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingElement = document.getElementById('loading');
    const dashboardElement = document.getElementById('dashboard');
    const statusBadge = document.getElementById('statusBadge');
    const highRiskCount = document.getElementById('highRiskCount');
    const mediumRiskCount = document.getElementById('mediumRiskCount');
    const lowRiskCount = document.getElementById('lowRiskCount');
    const totalDetections = document.getElementById('totalDetections');
    const eventsList = document.getElementById('eventsList');
    const emptyEvents = document.getElementById('emptyEvents');
    const monitoringToggle = document.getElementById('monitoringToggle');
    const alertLevel = document.getElementById('alertLevel');
    const autoBlockToggle = document.getElementById('autoBlockToggle');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    // State
    let settings = {};
    let detectedEvents = [];

    // Initialize
    init();

    async function init() {
        await loadSettings();
        await loadEvents();
        renderDashboard();
        
        // Show dashboard
        loadingElement.classList.add('hidden');
        dashboardElement.classList.remove('hidden');
        
        // Set up event listeners
        setupEventListeners();
    }

    // Load settings from storage
    async function loadSettings() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
                settings = response;
                
                // Update UI with current settings
                monitoringToggle.checked = settings.enabled;
                alertLevel.value = settings.alertLevel;
                autoBlockToggle.checked = settings.autoBlock;
                
                // Update status badge
                statusBadge.textContent = settings.enabled ? 'Active' : 'Inactive';
                statusBadge.classList.toggle('inactive', !settings.enabled);
                
                resolve();
            });
        });
    }

    // Load events from storage
    async function loadEvents() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['detectedEvents'], (result) => {
                detectedEvents = result.detectedEvents || [];
                resolve();
            });
        });
    }

    // Render dashboard with current data
    function renderDashboard() {
        // Calculate counts by risk level
        const highRisk = detectedEvents.filter(e => e.riskLevel === 'high').length;
        const mediumRisk = detectedEvents.filter(e => e.riskLevel === 'medium').length;
        const lowRisk = detectedEvents.filter(e => e.riskLevel === 'low').length;
        const total = detectedEvents.length;

        // Update counts
        highRiskCount.textContent = highRisk;
        mediumRiskCount.textContent = mediumRisk;
        lowRiskCount.textContent = lowRisk;
        totalDetections.textContent = total;

        // Render events list
        renderEventsList();
    }

    // Render events list
    function renderEventsList() {
        // Clear current list
        eventsList.innerHTML = '';
        
        if (detectedEvents.length === 0) {
            emptyEvents.classList.remove('hidden');
            return;
        }
        
        emptyEvents.classList.add('hidden');
        
        // Get recent events (last 5)
        const recentEvents = detectedEvents.slice(-5).reverse();
        
        recentEvents.forEach(event => {
            const eventElement = createEventElement(event);
            eventsList.appendChild(eventElement);
        });
    }

    // Create event element
    function createEventElement(event) {
        const div = document.createElement('div');
        div.className = 'event-item';
        
        // Risk level icon
        const icon = document.createElement('div');
        icon.className = `event-icon ${event.riskLevel}`;
        
        let iconClass = 'fa-exclamation-triangle';
        if (event.riskLevel === 'high') iconClass = 'fa-fire';
        if (event.riskLevel === 'medium') iconClass = 'fa-exclamation-circle';
        if (event.riskLevel === 'low') iconClass = 'fa-info-circle';
        
        icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
        
        // Event content
        const content = document.createElement('div');
        content.className = 'event-content';
        
        const tool = document.createElement('div');
        tool.className = 'event-tool';
        tool.textContent = event.tool || 'Unknown Tool';
        
        const domain = document.createElement('div');
        domain.className = 'event-domain';
        
        try {
            const url = new URL(event.url);
            domain.textContent = url.hostname;
        } catch {
            domain.textContent = event.domain || 'Unknown domain';
        }
        
        content.appendChild(tool);
        content.appendChild(domain);
        
        // Time
        const time = document.createElement('div');
        time.className = 'event-time';
        time.textContent = formatTime(event.timestamp);
        
        div.appendChild(icon);
        div.appendChild(content);
        div.appendChild(time);
        
        return div;
    }

    // Format timestamp
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Monitoring toggle
        monitoringToggle.addEventListener('change', function() {
            updateSettings({ enabled: this.checked });
            statusBadge.textContent = this.checked ? 'Active' : 'Inactive';
            statusBadge.classList.toggle('inactive', !this.checked);
        });

        // Alert level
        alertLevel.addEventListener('change', function() {
            updateSettings({ alertLevel: this.value });
        });

        // Auto-block toggle
        autoBlockToggle.addEventListener('change', function() {
            updateSettings({ autoBlock: this.checked });
        });

        // View all button
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') + '?full=true' });
        });

        // Clear data button
        clearDataBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all detection data? This cannot be undone.')) {
                chrome.storage.local.set({ detectedEvents: [] }, () => {
                    detectedEvents = [];
                    renderDashboard();
                });
            }
        });
    }

    // Update settings
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        
        chrome.runtime.sendMessage({
            type: 'UPDATE_SETTINGS',
            settings: newSettings
        }, (response) => {
            if (response && response.success) {
                console.log('Settings updated');
            }
        });
    }

    // Refresh data periodically
    setInterval(async () => {
        await loadEvents();
        renderDashboard();
    }, 5000);
});