// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (command === 'toggle-grid') {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleGrid'});
    }
  });
});
