// Create overlay elements
const breakpointIndicator = document.createElement('div');
breakpointIndicator.id = 'breakpoint-indicator';
breakpointIndicator.style.cssText = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 5px 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  z-index: 9999;
  border-radius: 4px;
`;

document.body.appendChild(breakpointIndicator);

// Update on resize
function updateBreakpoint() {
  const width = window.innerWidth;
  let breakpoint = 'XS';
  
  if (width >= 576) breakpoint = 'SM';
  if (width >= 768) breakpoint = 'MD';
  if (width >= 992) breakpoint = 'LG';
  if (width >= 1200) breakpoint = 'XL';
  
  breakpointIndicator.textContent = `${width}px | ${breakpoint}`;
}

window.addEventListener('resize', updateBreakpoint);
updateBreakpoint();

// Grid overlay toggle
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'toggleGrid') {
    const gridOverlay = document.getElementById('grid-overlay');
    if (gridOverlay) {
      gridOverlay.remove();
    } else {
      createGridOverlay();
    }
  }
});

function createGridOverlay() {
  // Grid implementation would go here
}
