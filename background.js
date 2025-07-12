// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    switch(command) {
      case 'toggle-grid':
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleGrid'});
        break;
      case 'measure-mode':
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleMeasureMode'});
        break;
    }
  });
});

// Handle settings sync
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'saveSettings') {
    chrome.storage.local.set({settings: message.settings});
  } else if (message.type === 'loadSettings') {
    chrome.storage.local.get('settings', (result) => {
      sendResponse(result.settings || {});
    });
    return true; // Indicates async response
  }
});
