document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  // Get current viewport info
  updateViewportInfo();
  
  // Setup button event listeners
  document.getElementById('toggleGrid').addEventListener('click', toggleGrid);
  document.getElementById('measureMode').addEventListener('click', toggleMeasureMode);
  document.getElementById('checkContrast').addEventListener('click', checkContrast);
  
  // Setup settings listeners
  document.getElementById('gridSize').addEventListener('change', saveSettings);
  document.getElementById('gridColor').addEventListener('change', saveSettings);
  
  // Load saved settings
  loadSettings();
}

function updateViewportInfo() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: document.getElementById('breakpoint-indicator')?.textContent || ''
      })
    }, (result) => {
      if (result && result[0] && result[0].result) {
        const {width, height, breakpoint} = result[0].result;
        document.getElementById('dimensions').textContent = `${width} × ${height}px`;
        document.getElementById('breakpoint').textContent = breakpoint;
      }
    });
  });
}

function toggleGrid() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleGrid'});
  });
}

function toggleMeasureMode() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleMeasureMode'});
  });
}

function checkContrast() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'checkContrast'});
  });
}

function saveSettings() {
  const settings = {
    gridSize: parseInt(document.getElementById('gridSize').value) || 24,
    gridColor: document.getElementById('gridColor').value
  };
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'updateSettings',
      settings: settings
    });
  });
  
  chrome.runtime.sendMessage({
    type: 'saveSettings',
    settings: settings
  });
}

function loadSettings() {
  chrome.runtime.sendMessage({type: 'loadSettings'}, (settings) => {
    if (settings.gridSize) {
      document.getElementById('gridSize').value = settings.gridSize;
    }
    if (settings.gridColor) {
      document.getElementById('gridColor').value = settings.gridColor;
    }
  });
}