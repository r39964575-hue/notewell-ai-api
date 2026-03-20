// Content script for AI tool detection

// AI Tool detection configuration
const DETECTION_CONFIG = {
  // DOM selectors for AI tools
  selectors: {
    chatgpt: [
      '#prompt-textarea',
      '[data-testid="send-button"]',
      '.markdown',
      'textarea[placeholder*="Send a message"]'
    ],
    claude: [
      '[contenteditable="true"]',
      '.ProseMirror',
      'button[type="submit"]',
      'div[role="textbox"]'
    ],
    copilot: [
      '.cm-content',
      '.suggestions-widget',
      '.copilot-chat-input',
      '[aria-label*="Ask Copilot"]'
    ],
    bard: [
      'textarea[aria-label*="Enter a prompt"]',
      '.send-button',
      '.model-response',
      'div[contenteditable="true"]'
    ],
    midjourney: [
      '[data-slate-string="true"]',
      '.messageContent-2qWWxC',
      'textarea[placeholder*="Imagine"]'
    ]
  },
  
  // Keywords that indicate AI tool usage
  keywords: {
    chatgpt: ['chatgpt', 'openai', 'gpt-', 'dall-e'],
    claude: ['claude', 'anthropic'],
    copilot: ['copilot', 'github copilot'],
    bard: ['bard', 'gemini', 'palm'],
    midjourney: ['midjourney', '/imagine', '--ar', '--v']
  },
  
  // Data patterns to detect (PII, sensitive data)
  dataPatterns: {
    ssn: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,
    creditCard: /\b(?:\d[ -]*?){13,16}\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/,
    apiKey: /\b(sk-|AKIA|ghp_|xoxb-)[A-Za-z0-9_\-]{20,}\b/
  }
};

// State management
let detectedTools = new Set();
let monitoringInterval = null;
let lastDetectionTime = 0;

// Initialize monitoring
function initializeMonitoring() {
  // Check for AI tools on page load
  checkForAITools();
  
  // Set up MutationObserver for dynamic content
  const observer = new MutationObserver((mutations) => {
    // Throttle detection to avoid performance issues
    const now = Date.now();
    if (now - lastDetectionTime > 1000) {
      checkForAITools();
      lastDetectionTime = now;
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });
  
  // Monitor form submissions and input events
  document.addEventListener('submit', handleFormSubmit);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('paste', handlePaste, true);
  document.addEventListener('copy', handleCopy, true);
  
  console.log('Sentinel AI monitoring initialized');
}

// Check for AI tool presence
function checkForAITools() {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  // Check by domain
  for (const [toolName, toolConfig] of Object.entries(DETECTION_CONFIG.selectors)) {
    // Check if current domain matches known AI tool domains
    if (isAIToolDomain(hostname, toolName)) {
      reportToolDetection(toolName, 'domain_match', { hostname });
      continue;
    }
    
    // Check for selectors
    for (const selector of toolConfig) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        reportToolDetection(toolName, 'selector_match', { 
          selector, 
          count: elements.length 
        });
        break;
      }
    }
  }
  
  // Check for keywords in page content
  checkForKeywords();
}

// Check if domain matches AI tool patterns
function isAIToolDomain(hostname, toolName) {
  const domainPatterns = {
    chatgpt: [/chat\.openai\.com$/, /chatgpt\.com$/],
    claude: [/claude\.ai$/, /console\.anthropic\.com$/],
    copilot: [/github\.com$/, /copilot\.github\.com$/],
    bard: [/bard\.google\.com$/, /gemini\.google\.com$/],
    midjourney: [/midjourney\.com$/, /discord\.com$/]
  };
  
  const patterns = domainPatterns[toolName] || [];
  return patterns.some(pattern => pattern.test(hostname));
}

// Check for AI-related keywords in page
function checkForKeywords() {
  const pageText = document.body.innerText.toLowerCase();
  
  for (const [toolName, keywords] of Object.entries(DETECTION_CONFIG.keywords)) {
    for (const keyword of keywords) {
      if (pageText.includes(keyword.toLowerCase())) {
        reportToolDetection(toolName, 'keyword_match', { keyword });
        break;
      }
    }
  }
}

// Handle form submissions
function handleFormSubmit(event) {
  const form = event.target;
  const formData = new FormData(form);
  const formText = Array.from(formData.values())
    .filter(value => typeof value === 'string')
    .join(' ');
  
  checkForSensitiveData(formText, 'form_submission', { formId: form.id || form.name });
}

// Handle input events for data detection
function handleInput(event) {
  const target = event.target;
  const value = target.value || target.textContent || '';
  
  // Only check longer inputs (likely prompts)
  if (value.length > 20) {
    checkForSensitiveData(value, 'input', {
      elementType: target.tagName,
      id: target.id,
      name: target.name
    });
  }
}

// Handle paste events
function handlePaste(event) {
  const pastedText = event.clipboardData.getData('text');
  if (pastedText) {
    checkForSensitiveData(pastedText, 'paste', {
      elementType: event.target.tagName
    });
  }
}

// Handle copy events
function handleCopy(event) {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    checkForSensitiveData(selectedText, 'copy', {
      length: selectedText.length
    });
  }
}

// Check text for sensitive data patterns
function checkForSensitiveData(text, source, metadata) {
  const detectedPatterns = [];
  
  for (const [patternName, regex] of Object.entries(DETECTION_CONFIG.dataPatterns)) {
    const matches = text.match(regex);
    if (matches) {
      detectedPatterns.push({
        pattern: patternName,
        matches: matches.length,
        sample: matches[0].substring(0, 50) + (matches[0].length > 50 ? '...' : '')
      });
    }
  }
  
  if (detectedPatterns.length > 0) {
    reportDataExposure(detectedPatterns, source, metadata);
  }
}

// Report AI tool detection to background script
function reportToolDetection(toolName, detectionMethod, details) {
  if (detectedTools.has(toolName + detectionMethod)) {
    return; // Already reported this detection
  }
  
  detectedTools.add(toolName + detectionMethod);
  
  const toolInfo = {
    chatgpt: { riskLevel: 'medium', name: 'ChatGPT' },
    claude: { riskLevel: 'medium', name: 'Claude' },
    copilot: { riskLevel: 'low', name: 'GitHub Copilot' },
    bard: { riskLevel: 'medium', name: 'Google Bard/Gemini' },
    midjourney: { riskLevel: 'high', name: 'Midjourney' }
  }[toolName] || { riskLevel: 'medium', name: toolName };
  
  chrome.runtime.sendMessage({
    type: 'AI_TOOL_DETECTED',
    data: {
      tool: toolInfo.name,
      domain: window.location.hostname,
      riskLevel: toolInfo.riskLevel,
      detectionMethod,
      details,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  });
}

// Report data exposure to background script
function reportDataExposure(patterns, source, metadata) {
  chrome.runtime.sendMessage({
    type: 'DATA_EXPOSURE',
    data: {
      dataType: patterns.map(p => p.pattern).join(', '),
      patterns,
      source,
      metadata,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  });
}

// Get settings from background script
function getSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, resolve);
  });
}

// Initialize with settings check
getSettings().then(settings => {
  if (settings.enabled) {
    initializeMonitoring();
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
});