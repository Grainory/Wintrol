const { ipcRenderer } = require('electron');

// Standard Inputs
const sensXInput = document.getElementById('sensX');
const sensYInput = document.getElementById('sensY');
const scrollInput = document.getElementById('scrollSpeed');
const deadzoneInput = document.getElementById('deadzone');

// Stats
const valX = document.getElementById('valX');
const valY = document.getElementById('valY');
const valScroll = document.getElementById('valScroll');
const valDeadzone = document.getElementById('valDeadzone');

// Mapping UI
const targetInput = document.getElementById('targetInput');
const actionSelect = document.getElementById('actionSelect');
const recordBtn = document.getElementById('recordBtn');
const currentRealMap = document.getElementById('currentRealMap');
const currentDisplay = document.getElementById('currentDisplay');

// State for mappings
let mappings = {}; // Will load from main

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    // Add info icon or check
    if (type === 'success') toast.innerHTML = '✔ ' + message;

    toastContainer.appendChild(toast);

    // Fade out
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function formatMapping(val) {
    if (!val) return 'NONE';
    if (val === 'left') return 'LEFT CLICK';
    if (val === 'right') return 'RIGHT CLICK';
    if (val === 'middle') return 'MIDDLE CLICK';
    if (val === 'none') return 'NONE';
    if (val.startsWith('key:')) return `KEY ${val.split(':')[1]}`;
    if (val.startsWith('combo:')) return `COMBO ${val.split(':')[1]}`;
    return val;
}

// UI Sync Functions
function loadMappingForTarget() {
    const target = targetInput.value; // e.g., 'mapA'
    const val = mappings[target] || 'none';

    // Update Hidden Input (Source of Truth for Logic)
    currentRealMap.value = val;

    // Update visual Dropdown
    if (['left', 'right', 'middle', 'none'].includes(val)) {
        actionSelect.value = val;
    } else {
        actionSelect.value = 'record'; // It's a key/combo
    }

    // Update Display Text
    currentDisplay.innerText = `MAPPED: ${formatMapping(val)}`;

    // Visual tweak to mapping box
    const controls = document.getElementById('mappingControls');
    if (controls) {
        controls.style.borderColor = '#444';
        setTimeout(() => controls.style.borderColor = '#333', 200);
    }
}

function saveCurrentMapping() {
    const target = targetInput.value;
    const val = currentRealMap.value;

    if (mappings[target] !== val) {
        mappings[target] = val;
        // Send FULL update to main
        updateSettings();

        // Show Toast
        const targetName = targetInput.options[targetInput.selectedIndex].text;
        showToast(`${targetName} mapped to ${formatMapping(val)}`, 'success');
    }
}

// Global update function
function updateSettings() {
    const settings = {
        sensitivityX: parseInt(sensXInput.value),
        sensitivityY: parseInt(sensYInput.value),
        scrollSpeed: parseInt(scrollInput.value),
        deadzone: parseInt(deadzoneInput.value),
        enabled: isEnabled, // Global enabled state

        // Spread all mappings
        ...mappings
    };

    valX.innerText = settings.sensitivityX;
    valY.innerText = settings.sensitivityY;
    valScroll.innerText = settings.scrollSpeed;
    valDeadzone.innerText = settings.deadzone;

    ipcRenderer.send('save-settings', settings);
}

// Event Listeners

// 1. Selector Change -> Load new data (don't save!)
targetInput.addEventListener('change', loadMappingForTarget);

// 2. Action Select Change -> Save data
actionSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'record') return; // Handled by button

    currentRealMap.value = val;
    currentDisplay.innerText = `MAPPED: ${formatMapping(val)}`;
    saveCurrentMapping();
});

// 3. Recording Logic
let isRecording = false;
let recordedKeys = new Set();

function startRecording() {
    if (isRecording) stopRecording();

    isRecording = true;
    recordBtn.classList.add('recording');
    recordBtn.innerText = '■';
    recordedKeys.clear();

    document.addEventListener('keydown', handleRecordKey);
    document.addEventListener('keyup', handleRecordUp);

    showToast('Recording... Press keys.', 'info');
}

function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordBtn.innerText = '●';

    document.removeEventListener('keydown', handleRecordKey);
    document.removeEventListener('keyup', handleRecordUp);

    if (recordedKeys.size > 0) {
        const keys = Array.from(recordedKeys);
        const newVal = keys.length === 1 ? `key:${keys[0]}` : `combo:${keys.join(',')}`;

        currentRealMap.value = newVal;
        actionSelect.value = 'record'; // Ensure dropdown shows record context
        currentDisplay.innerText = `MAPPED: ${formatMapping(newVal)}`;

        saveCurrentMapping();
    }
}

function handleRecordKey(e) {
    e.preventDefault();
    if (!isRecording) return;
    const code = e.keyCode;
    if (!recordedKeys.has(code)) recordedKeys.add(code);
}

function handleRecordUp(e) {
    e.preventDefault();
    if (!isRecording) return;
    stopRecording();
}

recordBtn.addEventListener('click', () => {
    if (isRecording) stopRecording();
    else startRecording();
});

// Standard Inputs
[sensXInput, sensYInput, scrollInput, deadzoneInput].forEach(el => {
    el.addEventListener('input', updateSettings);
});

// Toggle Logic
const toggleBtn = document.getElementById('toggleBtn');
const controllerStatus = document.getElementById('controllerStatus');
let isEnabled = true;

toggleBtn.addEventListener('click', () => {
    isEnabled = !isEnabled;
    updateSettings(); // Sends enabled state
    updateToggleUI();

    showToast(isEnabled ? 'System Started' : 'System Stopped', isEnabled ? 'success' : 'info');
});

function updateToggleUI() {
    if (isEnabled) {
        toggleBtn.innerText = "STOP";
        toggleBtn.className = "toggle-btn running";
    } else {
        toggleBtn.innerText = "START";
        toggleBtn.className = "toggle-btn stopped";
    }
}

// IPC Status Update
ipcRenderer.on('status-update', (event, data) => {
    // Force toggle visual sync 
    if (isEnabled !== data.enabled) {
        isEnabled = data.enabled;
        updateToggleUI();
    }

    const ts = new Date(data.timestamp).toLocaleTimeString();

    if (data.connected) {
        if (!data.enabled) {
            controllerStatus.innerText = `PAUSED (CONNECTED) [${ts}]`;
            controllerStatus.style.color = "#ffaa00"; // Orange
        } else {
            controllerStatus.innerText = `CONNECTED [${ts}]`;
            controllerStatus.style.color = "#44ff44"; // Green
        }
    } else {
        controllerStatus.innerText = `DISCONNECTED [${ts}]`;
        controllerStatus.style.color = "#666";
    }
});

// --- INITIALIZATION ---
async function init() {
    // Fetch settings from main process
    const settings = await ipcRenderer.invoke('get-settings');

    // Apply to UI
    sensXInput.value = settings.sensitivityX;
    sensYInput.value = settings.sensitivityY;
    scrollInput.value = settings.scrollSpeed;
    deadzoneInput.value = settings.deadzone;
    isEnabled = settings.enabled;

    // Apply mappings
    mappings = {
        mapA: settings.mapA,
        mapB: settings.mapB,
        mapX: settings.mapX,
        mapY: settings.mapY,
        mapLB: settings.mapLB,
        mapRB: settings.mapRB,
        mapLT: settings.mapLT,
        mapRT: settings.mapRT,
        mapBack: settings.mapBack,
        mapStart: settings.mapStart,
        mapLStick: settings.mapLStick,
        mapRStick: settings.mapRStick,
        mapDPadUp: settings.mapDPadUp,
        mapDPadDown: settings.mapDPadDown,
        mapDPadLeft: settings.mapDPadLeft,
        mapDPadRight: settings.mapDPadRight
    };

    updateToggleUI();
    loadMappingForTarget(); // Update mapping UI

    // Update labels
    valX.innerText = settings.sensitivityX;
    valY.innerText = settings.sensitivityY;
    valScroll.innerText = settings.scrollSpeed;
    valDeadzone.innerText = settings.deadzone;
}

init();
