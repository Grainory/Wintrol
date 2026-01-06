const { ipcRenderer } = require('electron');

// --- UI ELEMENTS ---
const CONTROLS = [
    { id: 'sensX', valId: 'valX', setting: 'sensitivityX', type: 'int' },
    { id: 'sensY', valId: 'valY', setting: 'sensitivityY', type: 'int' },
    { id: 'scrollSpeed', valId: 'valScroll', setting: 'scrollSpeed', type: 'int' },
    { id: 'deadzone', valId: 'valDeadzone', setting: 'deadzone', type: 'int' }
];

// Mappings (Button ID prefixes)
// Button ID: "btnA", Reset ID: "resetA", Setting: "mapA"
const MAPPING_CONFIG = [
    { id: 'mapA', btnId: 'btnA', resetId: 'resetA' },
    { id: 'mapB', btnId: 'btnB', resetId: 'resetB' },
    { id: 'mapX', btnId: 'btnX', resetId: 'resetX' },
    { id: 'mapY', btnId: 'btnY', resetId: 'resetY' },
    { id: 'mapLB', btnId: 'btnLB', resetId: 'resetLB' },
    { id: 'mapRB', btnId: 'btnRB', resetId: 'resetRB' },
    { id: 'mapLT', btnId: 'btnLT', resetId: 'resetLT' },
    { id: 'mapRT', btnId: 'btnRT', resetId: 'resetRT' },
    { id: 'mapBack', btnId: 'btnBack', resetId: 'resetBack' },
    { id: 'mapStart', btnId: 'btnStart', resetId: 'resetStart' },
    { id: 'mapLStick', btnId: 'btnLStick', resetId: 'resetLStick' },
    { id: 'mapRStick', btnId: 'btnRStick', resetId: 'resetRStick' },
    { id: 'mapDPadUp', btnId: 'btnDPadUp', resetId: 'resetDPadUp' },
    { id: 'mapDPadDown', btnId: 'btnDPadDown', resetId: 'resetDPadDown' },
    { id: 'mapDPadLeft', btnId: 'btnDPadLeft', resetId: 'resetDPadLeft' },
    { id: 'mapDPadRight', btnId: 'btnDPadRight', resetId: 'resetDPadRight' }
];

// Global State
let mappings = {};
let isEnabled = true;

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
    if (type === 'success') toast.innerHTML = '✔ ' + message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

// --- LOGIC: SLIDERS ---
function updateSliderVisual(slider) {
    const min = parseInt(slider.min) || 0;
    const max = parseInt(slider.max) || 100;
    const val = parseInt(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--value-percent', `${percent}%`);
}

function setupSliders() {
    CONTROLS.forEach(ctrl => {
        const slider = document.getElementById(ctrl.id);
        const numberBox = document.getElementById(ctrl.valId);

        updateSliderVisual(slider);

        slider.addEventListener('input', (e) => {
            numberBox.value = e.target.value;
            updateSliderVisual(e.target);
            saveSettings();
        });

        numberBox.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            if (val < min) val = min;
            if (val > max) val = max;
            if (isNaN(val)) val = min;

            slider.value = val;
            updateSliderVisual(slider);
            saveSettings();
        });
    });
}

// --- LOGIC: MAPPINGS (MINECRAFT STYLE) ---
function formatMapping(val) {
    if (!val || val === 'none') return 'None';
    if (val === 'left') return 'Left Click';
    if (val === 'right') return 'Right Click';
    if (val === 'middle') return 'Middle Click';
    if (val.startsWith('key:')) {
        const code = val.split(':')[1];
        // TODO: Map keycodes to names if possible. For now standard codes.
        // We could look up char codes, but let's keep it simple.
        return `Key ${code}`; // e.g. Key 65
    }
    if (val.startsWith('combo:')) return 'Combo';
    return val;
}

function setupMappings() {
    MAPPING_CONFIG.forEach(cfg => {
        const btn = document.getElementById(cfg.btnId);
        const reset = document.getElementById(cfg.resetId); // Optional

        if (btn) {
            btn.addEventListener('click', () => {
                if (isRecording) {
                    cancelRecording();
                } else {
                    startRecording(cfg.id);
                }
            });
        }

        if (reset) {
            reset.addEventListener('click', () => {
                mappings[cfg.id] = 'none';
                saveSettings();
                refreshMappingUI(cfg.id);
                showToast('Reset to None', 'info');
            });
        }
    });
}

function refreshMappingUI(id) {
    const cfg = MAPPING_CONFIG.find(c => c.id === id);
    if (!cfg) return;

    const btn = document.getElementById(cfg.btnId);
    if (btn) {
        const val = mappings[id] || 'none';
        btn.innerText = formatMapping(val);
        btn.classList.remove('recording');
    }
}

function refreshAllMappings() {
    MAPPING_CONFIG.forEach(cfg => refreshMappingUI(cfg.id));
}

// --- RECORDING ---
let isRecording = false;
let recordingTarget = null;
let recordedKeys = new Set();

function startRecording(targetId) {
    if (isRecording) cancelRecording();

    isRecording = true;
    recordingTarget = targetId;
    recordedKeys.clear();

    const cfg = MAPPING_CONFIG.find(c => c.id === targetId);
    if (cfg) {
        const btn = document.getElementById(cfg.btnId);
        if (btn) {
            btn.innerText = '> PRESS KEY <';
            btn.classList.add('recording');
        }
    }

    document.addEventListener('keydown', handleRecordKey);
    document.addEventListener('keyup', handleRecordUp);
    document.addEventListener('mousedown', handleRecordMouse); // Allow binding Mouse clicks

    // Click outside to cancel? Or strictly key press?
    // Let's stick to explicitly pressing.
}

function cancelRecording() {
    if (!isRecording) return;
    const oldId = recordingTarget;
    isRecording = false;
    recordingTarget = null;

    document.removeEventListener('keydown', handleRecordKey);
    document.removeEventListener('keyup', handleRecordUp);
    document.removeEventListener('mousedown', handleRecordMouse);

    if (oldId) refreshMappingUI(oldId);
}

function handleRecordMouse(e) {
    if (!isRecording) return;
    // 0=Left, 1=Middle, 2=Right
    let val = 'none';
    if (e.button === 0) val = 'left';
    if (e.button === 1) val = 'middle';
    if (e.button === 2) val = 'right';

    // Don't bind to interaction clicks if outside app context?
    // Actually, clicking the button itself might trigger this. 
    // We should be careful. Click-to-bind usually waits for *next* input.
    // The click that STARTED recording shouldn't count.
    // We'll rely on keydown mostly, or verify targeting.

    if (val !== 'none') {
        finishRecording(val);
    }
}

function handleRecordKey(e) {
    e.preventDefault();
    if (!isRecording) return;
    recordedKeys.add(e.keyCode);
}

function handleRecordUp(e) {
    e.preventDefault();
    if (!isRecording) return;
    finishRecordingWithKeys();
}

function finishRecordingWithKeys() {
    if (recordedKeys.size > 0) {
        const keys = Array.from(recordedKeys);
        const newVal = keys.length === 1 ? `key:${keys[0]}` : `combo:${keys.join(',')}`;
        finishRecording(newVal);
    } else {
        cancelRecording();
    }
}

function finishRecording(newValue) {
    if (recordingTarget) {
        mappings[recordingTarget] = newValue;
        saveSettings();
        showToast('Mapped!', 'success');
    }
    cancelRecording(); // Cleans up UI
}

// --- MAIN LOGIC ---

function saveSettings() {
    const settings = {
        enabled: isEnabled,
        ...mappings
    };
    CONTROLS.forEach(ctrl => {
        const el = document.getElementById(ctrl.id);
        settings[ctrl.setting] = parseInt(el.value);
    });
    ipcRenderer.send('save-settings', settings);
}

// Window Controls
document.getElementById('minBtn').addEventListener('click', () => ipcRenderer.send('window-minimize'));
document.getElementById('closeBtn').addEventListener('click', () => ipcRenderer.send('window-close'));

// Toggle
document.getElementById('toggleBtn').addEventListener('click', () => {
    isEnabled = !isEnabled;
    updateToggleUI();
    saveSettings();
});

function updateToggleUI() {
    const btn = document.getElementById('toggleBtn');
    const badge = document.getElementById('statusBadge');

    if (isEnabled) {
        btn.innerText = 'STOP';
        btn.className = 'toggle-btn stop';
    } else {
        btn.innerText = 'START';
        btn.className = 'toggle-btn start';
    }
}

ipcRenderer.on('status-update', (event, data) => {
    if (isEnabled !== data.enabled) {
        isEnabled = data.enabled;
        updateToggleUI();
    }
    const badge = document.getElementById('statusBadge');
    const text = document.getElementById('statusText');
    const indicator = badge.querySelector('.status-dot');

    // Only update if not disconnected
    if (data.connected) {
        badge.classList.remove('disconnected');
        text.innerText = isEnabled ? 'CONNECTED' : 'PAUSED';
        indicator.style.background = isEnabled ? '#22c55e' : '#f97316';
        indicator.style.boxShadow = isEnabled ? '0 0 12px #22c55e' : '0 0 12px #f97316';
        badge.style.borderColor = isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)';
        badge.style.color = isEnabled ? '#4ade80' : '#fb923c';
        badge.style.background = isEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)';
    } else {
        badge.classList.add('disconnected');
        badge.style = '';
        indicator.style = '';
        text.innerText = 'DISCONNECTED';
    }
});

// Init
async function init() {
    const settings = await ipcRenderer.invoke('get-settings');
    CONTROLS.forEach(ctrl => {
        document.getElementById(ctrl.id).value = settings[ctrl.setting];
        document.getElementById(ctrl.valId).value = settings[ctrl.setting];
    });
    isEnabled = settings.enabled;
    updateToggleUI();
    MAPPING_CONFIG.forEach(cfg => {
        mappings[cfg.id] = settings[cfg.id];
    });
    setupSliders();
    setupMappings();
    refreshAllMappings();
}

init();
