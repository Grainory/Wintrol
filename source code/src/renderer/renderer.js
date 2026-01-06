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
function getKeyName(keyCode) {
    const code = parseInt(keyCode);

    // Letters
    if (code >= 65 && code <= 90) return String.fromCharCode(code);
    // Numbers
    if (code >= 48 && code <= 57) return String.fromCharCode(code);
    // Function Keys
    if (code >= 112 && code <= 123) return `F${code - 111}`;

    // Special Keys Map
    const keyMap = {
        8: 'Back', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Ctrl', 18: 'Alt',
        19: 'Pause', 20: 'Caps', 27: 'Esc', 32: 'Space', 33: 'PgUp', 34: 'PgDn',
        35: 'End', 36: 'Home', 37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down',
        45: 'Ins', 46: 'Del', 91: 'Win', 93: 'Menu',
        // Numpad
        96: 'Num0', 97: 'Num1', 98: 'Num2', 99: 'Num3', 100: 'Num4',
        101: 'Num5', 102: 'Num6', 103: 'Num7', 104: 'Num8', 105: 'Num9',
        106: 'Num*', 107: 'Num+', 109: 'Num-', 110: 'Num.', 111: 'Num/',
        // Syntax
        186: ';', 187: '=', 188: ',', 189: '-', 190: '.', 191: '/',
        192: '`', 219: '[', 220: '\\', 221: ']', 222: "'"
    };

    return keyMap[code] || `Key ${code}`;
}

function formatMapping(val) {
    if (!val || val === 'none') return 'None';
    if (val === 'left') return 'Left Click';
    if (val === 'right') return 'Right Click';
    if (val === 'middle') return 'Middle Click';
    if (val.startsWith('key:')) {
        const code = val.split(':')[1];
        return getKeyName(code);
    }
    if (val.startsWith('combo:')) {
        const codes = val.split(':')[1].split(',');
        return codes.map(getKeyName).join('+');
    }
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

// --- ANIMATION CONTROLLER ---
function playEntryAnimation() {
    const container = document.querySelector('.app-container');
    container.classList.remove('closing');

    // Force Reflow/Replay
    container.style.animation = 'none';
    container.offsetHeight; /* trigger reflow */
    container.style.animation = 'scaleIn 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) forwards';
}

function playExitAnimation(onComplete) {
    const container = document.querySelector('.app-container');
    container.classList.add('closing');

    // CRITICAL FIX: Override previous inline animation (scaleIn)
    container.style.animation = 'none';
    container.offsetHeight; /* trigger reflow */
    container.style.animation = 'scaleOut 0.3s cubic-bezier(0.1, 0.9, 0.2, 1) forwards';

    // Match CSS duration (0.3s)
    setTimeout(() => {
        // Prevent stutter on restore by hiding content logic if needed
        // container.style.opacity = '0'; // (Handled by CSS keyframe mostly, but good to ensure)
        if (onComplete) onComplete();
    }, 300);
}

// Window Controls
document.getElementById('minBtn').addEventListener('click', () => {
    playExitAnimation(() => ipcRenderer.send('window-minimize'));
});

document.getElementById('closeBtn').addEventListener('click', () => {
    playExitAnimation(() => ipcRenderer.send('window-close'));
});

// System Close Request (Alt+F4 or Taskbar)
ipcRenderer.on('request-close', () => {
    playExitAnimation(() => ipcRenderer.send('window-close-confirmed'));
});

// Restore Animation (Re-entry)
ipcRenderer.on('window-restored', () => {
    playEntryAnimation();
});

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

    // Force standard entry animation on launch
    playEntryAnimation();
}

init();
