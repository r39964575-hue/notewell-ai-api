// Background service worker for Sentinel AI extension

// AI Tool detection patterns
const AI_TOOL_PATTERNS = {
  'chatgpt': {
    name: 'ChatGPT',
    domains: ['chat.openai.com', 'chatgpt.com'],
    selectors: ['#prompt-textarea', '[data-testid="send-button"]', '.markdown'],
    riskLevel: 'medium'
  },
  'claude': {
    name: 'Claude',
    domains: ['claude.ai', 'console.anthropic.com'],
    selectors: ['[contenteditable="true"]', '.ProseMirror', 'button[type="submit"]'],
    riskLevel: 'medium'
  },
  'copilot': {
    name: 'GitHub Copilot',
    domains: ['github.com', 'copilot.github.com'],
    selectors: ['.cm-content', '.suggestions-widget', '.copilot-chat-input'],
    riskLevel: 'low'
  },
  'bard': {
    name: 'Google Bard/Gemini',
    domains: ['bard.google.com', 'gemini.google.com'],
    selectors: ['textarea[aria-label*="Enter a prompt"]', '.send-button', '.model-response'],
    riskLevel: 'medium'
  },
  'midjourney': {
    name: 'Midjourney',
    domains: ['midjourney.com', 'discord.com'],
    selectors: ['[data-slate-string="true"]', '.messageContent-2qWWxC'],
    riskLevel: 'high'
  }
};

// Store for detected events
let detectedEvents = [];
let settings = {
  enabled: true,
  alertLevel: 'medium',
  autoBlock: false,
  reportingEndpoint: 'http://localhost:3000/api/events'
};

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sentinel AI extension installed');
  chrome.storage.local.set({ settings, detectedEvents: [] });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'AI_TOOL_DETECTED':
      handleAIDetection(message.data, sender.tab);
      break;
    case 'DATA_EXPOSURE':
      handleDataExposure(message.data, sender.tab);
      break;
    case 'GET_SETTINGS':
      sendResponse(settings);
      break;
    case 'UPDATE_SETTINGS':
      settings = { ...settings, ...message.settings };
      chrome.storage.local.set({ settings });
      sendResponse({ success: true });
      break;
  }
  return true; // Keep message channel open for async response
});

// Handle AI tool detection
function handleAIDetection(detectionData, tab) {
  const event = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    type: 'AI_TOOL_DETECTION',
    tool: detectionData.tool,
    domain: detectionData.domain,
    url: tab.url,
    tabId: tab.id,
    riskLevel: detectionData.riskLevel,
    details: detectionData.details
  };

  detectedEvents.push(event);
  
  // Store in local storage
  chrome.storage.local.set({ detectedEvents });
  
  // Send to backend if configured
  if (settings.reportingEndpoint) {
    sendToBackend(event);
  }
  
  // Show notification if risk level matches alert settings
  if (shouldAlert(event.riskLevel)) {
    showNotification(event);
  }
  
  // Update badge
  updateBadge();
}

// Handle potential data exposure
function handleDataExposure(data, tab) {
  const event = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    type: 'DATA_EXPOSURE',
    dataType: data.dataType,
    snippet: data.snippet.substring(0, 100) + '...',
    url: tab.url,
    tabId: tab.id,
    riskLevel: 'high'
  };

  detectedEvents.push(event);
  chrome.storage.local.set({ detectedEvents });
  
  if (settings.reportingEndpoint) {
    sendToBackend(event);
  }
  
  showNotification(event);
  updateBadge();
}

// Send event to backend
function sendToBackend(event) {
  fetch(settings.reportingEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event)
  })
  .then(response => {
    if (!response.ok) {
      console.error('Failed to send event to backend:', response.status);
    }
  })
  .catch(error => {
    console.error('Error sending event:', error);
  });
}

// Show browser notification
function showNotification(event) {
  const notificationId = 'sentinel-ai-' + event.id;
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `Sentinel AI: ${event.type === 'AI_TOOL_DETECTION' ? 'AI Tool Detected' : 'Data Exposure Risk'}`,
    message: `${event.tool || 'Unknown tool'} detected on ${new URL(event.url).hostname}`,
    priority: 2,
    buttons: [
      { title: 'View Details' },
      { title: 'Ignore' }
    ]
  });
  
  // Handle notification click
  chrome.notifications.onClicked.addListener((id) => {
    if (id === notificationId) {
      chrome.tabs.create({ url: `popup.html?event=${event.id}` });
    }
  });
  
  chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
    if (id === notificationId) {
      if (buttonIndex === 0) {
        chrome.tabs.create({ url: `popup.html?event=${event.id}` });
      }
      chrome.notifications.clear(id);
    }
  });
}

// Update extension badge
function updateBadge() {
  const highRiskCount = detectedEvents.filter(e => e.riskLevel === 'high').length;
  
  if (highRiskCount > 0) {
    chrome.action.setBadgeText({ text: highRiskCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // Red
  } else {
    const mediumRiskCount = detectedEvents.filter(e => e.riskLevel === 'medium').length;
    if (mediumRiskCount > 0) {
      chrome.action.setBadgeText({ text: mediumRiskCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' }); // Orange
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
}

// Check if event should trigger alert based on settings
function shouldAlert(riskLevel) {
  const riskLevels = { low: 1, medium: 2, high: 3 };
  const alertLevels = { low: 1, medium: 2, high: 3 };
  
  return riskLevels[riskLevel] >= alertLevels[settings.alertLevel];
}

// Load settings from storage
chrome.storage.local.get(['settings', 'detectedEvents'], (result) => {
  if (result.settings) {
    settings = result.settings;
  }
  if (result.detectedEvents) {
    detectedEvents = result.detectedEvents;
    updateBadge();
  }
});

// Periodic cleanup of old events (keep last 1000 events)
setInterval(() => {
  if (detectedEvents.length > 1000) {
    detectedEvents = detectedEvents.slice(-1000);
    chrome.storage.local.set({ detectedEvents });
  }
}, 60000); // Run every minute