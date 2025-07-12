// State management
let isGridVisible = false;
let isMeasuring = false;
let currentMeasureElement = null;

// Create UI elements
const breakpointIndicator = createBreakpointIndicator();
const gridOverlay = createGridOverlay();
const measureOverlay = createMeasureOverlay();
const contrastChecker = createContrastChecker();

document.body.appendChild(breakpointIndicator);
document.body.appendChild(gridOverlay);
document.body.appendChild(measureOverlay);
document.body.appendChild(contrastChecker);

// Initialize
updateBreakpoint();
loadSettings();

// Event listeners
window.addEventListener('resize', updateBreakpoint);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('click', handleClick);

// Message handling
chrome.runtime.onMessage.addListener((request) => {
  switch(request.action) {
    case 'toggleGrid':
      toggleGridOverlay();
      break;
    case 'toggleMeasureMode':
      toggleMeasureMode();
      break;
    case 'checkContrast':
      activateContrastChecker();
      break;
    case 'updateSettings':
      applySettings(request.settings);
      break;
  }
});

// Core functions
function createBreakpointIndicator() {
  const el = document.createElement('div');
  el.id = 'breakpoint-indicator';
  el.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 6px 12px;
    background: rgba(0,0,0,0.85);
    color: #fff;
    font: 14px monospace;
    z-index: 10000;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    pointer-events: none;
    transition: opacity 0.2s;
  `;
  return el;
}

function createGridOverlay() {
  const el = document.createElement('div');
  el.id = 'grid-overlay';
  el.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    display: none;
    background-image: linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
    background-size: 24px 24px;
  `;
  return el;
}

function createMeasureOverlay() {
  const el = document.createElement('div');
  el.id = 'measure-overlay';
  el.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10001;
    display: none;
  `;
  
  // Create measurement info box
  const infoBox = document.createElement('div');
  infoBox.id = 'measure-info';
  infoBox.style.cssText = `
    position: absolute;
    background: rgba(0,0,0,0.85);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font: 14px monospace;
    white-space: nowrap;
    transform: translate(-50%, -100%);
    pointer-events: none;
  `;
  
  el.appendChild(infoBox);
  return el;
}

function createContrastChecker() {
  const el = document.createElement('div');
  el.id = 'contrast-checker';
  el.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 10002;
    display: none;
    min-width: 300px;
    font-family: sans-serif;
  `;
  
  el.innerHTML = `
    <h3 style="margin-top:0">Contrast Checker</h3>
    <div id="contrast-result" style="margin: 10px 0; padding: 15px; border-radius: 4px;"></div>
    <div style="display:flex; justify-content: space-between">
      <button id="contrast-copy" style="padding: 8px 12px">Copy Values</button>
      <button id="contrast-close" style="padding: 8px 12px">Close</button>
    </div>
  `;
  
  el.querySelector('#contrast-close').addEventListener('click', () => {
    el.style.display = 'none';
  });
  
  el.querySelector('#contrast-copy').addEventListener('click', () => {
    const text = el.querySelector('#contrast-result').textContent;
    navigator.clipboard.writeText(text);
  });
  
  return el;
}

function updateBreakpoint() {
  const width = window.innerWidth;
  let breakpoint = 'XS';
  
  if (width >= 576) breakpoint = 'SM';
  if (width >= 768) breakpoint = 'MD';
  if (width >= 992) breakpoint = 'LG';
  if (width >= 1200) breakpoint = 'XL';
  
  breakpointIndicator.textContent = `${width}px | ${breakpoint}`;
}

function toggleGridOverlay() {
  isGridVisible = !isGridVisible;
  gridOverlay.style.display = isGridVisible ? 'block' : 'none';
  saveSetting('gridVisible', isGridVisible);
}

function toggleMeasureMode() {
  isMeasuring = !isMeasuring;
  measureOverlay.style.display = isMeasuring ? 'block' : 'none';
  
  if (!isMeasuring && currentMeasureElement) {
    currentMeasureElement.style.outline = '';
    currentMeasureElement = null;
  }
  
  saveSetting('measureMode', isMeasuring);
}

function activateContrastChecker() {
  contrastChecker.style.display = 'block';
  document.body.style.cursor = 'crosshair';
}

function handleMouseMove(e) {
  if (isMeasuring) {
    updateMeasureOverlay(e);
  }
  
  if (contrastChecker.style.display === 'block') {
    updateContrastPreview(e);
  }
}

function handleClick(e) {
  if (contrastChecker.style.display === 'block') {
    checkContrast(e.target);
    e.stopPropagation();
    e.preventDefault();
  }
}

function updateMeasureOverlay(e) {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  if (currentMeasureElement && currentMeasureElement !== element) {
    currentMeasureElement.style.outline = '';
  }
  
  currentMeasureElement = element;
  element.style.outline = '2px dashed #4a90e2';
  
  const rect = element.getBoundingClientRect();
  const infoBox = measureOverlay.querySelector('#measure-info');
  
  infoBox.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}px`;
  infoBox.style.left = `${e.pageX}px`;
  infoBox.style.top = `${e.pageY}px`;
}

function updateContrastPreview(e) {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  element.style.outline = '2px solid #ff9900';
}

function checkContrast(element) {
  const styles = window.getComputedStyle(element);
  const bgColor = getBackgroundColor(element);
  const textColor = styles.color;
  
  const contrastRatio = calculateContrast(textColor, bgColor);
  const result = contrastChecker.querySelector('#contrast-result');
  
  result.innerHTML = `
    <div>Text: ${textColor}</div>
    <div>Background: ${bgColor}</div>
    <div>Contrast Ratio: ${contrastRatio.toFixed(2)}:1</div>
    <div>WCAG Rating: ${getWCAGRating(contrastRatio)}</div>
  `;
  
  result.style.backgroundColor = bgColor;
  result.style.color = textColor;
  document.body.style.cursor = '';
}

// Helper functions
function calculateContrast(color1, color2) {
  // Simplified contrast calculation
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

function getLuminance(color) {
  // Simplified luminance calculation
  const rgb = hexToRgb(color);
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

function getBackgroundColor(element) {
  // Traverse parents until we find a background color
  while (element) {
    const bg = window.getComputedStyle(element).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    element = element.parentElement;
  }
  return '#ffffff'; // Default to white
}

function getWCAGRating(ratio) {
  if (ratio >= 7) return 'AAA (Excellent)';
  if (ratio >= 4.5) return 'AA (Good)';
  if (ratio >= 3) return 'AA Large Text';
  return 'Fail';
}

function saveSetting(key, value) {
  chrome.storage.local.get('settings', (result) => {
    const settings = result.settings || {};
    settings[key] = value;
    chrome.storage.local.set({settings});
  });
}

async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || {};
  
  if (settings.gridVisible) {
    isGridVisible = true;
    gridOverlay.style.display = 'block';
  }
  
  if (settings.measureMode) {
    isMeasuring = true;
    measureOverlay.style.display = 'block';
  }
}

function applySettings(settings) {
  if ('gridVisible' in settings) {
    isGridVisible = settings.gridVisible;
    gridOverlay.style.display = isGridVisible ? 'block' : 'none';
  }
  
  if ('measureMode' in settings) {
    isMeasuring = settings.measureMode;
    measureOverlay.style.display = isMeasuring ? 'block' : 'none';
  }
}
