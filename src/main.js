const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const LOG_FILE = path.join(app.getPath('userData'), 'wintrol_debug.log');

// Ensure directory exists
try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
} catch (e) {
    console.error('Failed to create log directory:', e);
}

function log(msg) {
    const time = new Date().toISOString();
    try {
        fs.appendFileSync(LOG_FILE, `[${time}] ${msg}\n`);
    } catch (e) {
        console.error(`[LOG FAIL] ${msg}`, e);
    }
}

log('--- Wintrol Started ---');
log(`App Path: ${app.getAppPath()}`);
log(`Exe Path: ${app.getPath('exe')}`);

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    const isLite = app.getName().includes('Lite');

    // Main App (Premium) vs Lite App (Utility)
    const windowConfig = isLite ? {
        // LITE: Standard Window
        width: 800,
        height: 600,
        frame: true,
        transparent: false,
        backgroundColor: '#202020'
    } : {
        // MAIN: Frameless & Transparent (Mica-ready)
        width: 850,
        height: 700,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000', // Transparent for rounded corners
        hasShadow: true,
        resizable: true
    };

    mainWindow = new BrowserWindow({
        ...windowConfig,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier IPC in MVP, strictly local app
        },
        show: false,
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle minimize/close to tray
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        // If quitting, let it close
        return false;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Wintrol', click: () => mainWindow.show() },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Wintrol System');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC listeners for settings
// Config Persistence
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_SETTINGS = {
    sensitivityX: 50,
    sensitivityY: 50,
    scrollSpeed: 50,
    deadzone: 5000,
    mapA: 'left',
    mapB: 'right',
    mapX: 'none',
    mapY: 'none',
    mapLB: 'none',
    mapRB: 'none',
    mapLT: 'none',
    mapRT: 'none',
    mapBack: 'none',
    mapStart: 'none',
    mapLStick: 'none',
    mapRStick: 'none',
    mapDPadUp: 'none',
    mapDPadDown: 'none',
    mapDPadLeft: 'none',
    mapDPadRight: 'none',
    enabled: true
};

let settings = { ...DEFAULT_SETTINGS };

function loadSettings() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            const loaded = JSON.parse(data);
            settings = { ...DEFAULT_SETTINGS, ...loaded };
            log('Settings loaded from config.json');
        }
    } catch (e) {
        log(`Failed to load settings: ${e.message}`);
    }
}

function saveSettings() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2));
        // log('Settings saved to config.json'); // Too verbose to log every save?
    } catch (e) {
        log(`Failed to save settings: ${e.message}`);
    }
}

// Load initial
loadSettings();

// IPC listeners for settings
ipcMain.handle('get-settings', () => {
    return settings;
});

ipcMain.on('save-settings', (event, newSettings) => {
    const oldEnabled = settings.enabled;
    settings = { ...settings, ...newSettings };

    saveSettings(); // Persist to disk

    if (oldEnabled !== settings.enabled) {
        log(`Settings Updated: Enabled = ${settings.enabled}`);
    }
    if (oldEnabled !== settings.enabled) {
        log(`Settings Updated: Enabled = ${settings.enabled}`);
    }
});

// Window Controls
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

// Import native modules
const xinput = require('./xinput');
const mouse = require('./mouse');
const keyboard = require('./keyboard');

// Polling loop
const POLLING_RATE = 16; // ms (~60Hz)
setInterval(() => {
    // Log once
    if (!global.loggedStart) {
        log(`Polling started. Available: ${xinput.isAvailable}`);
        global.loggedStart = true;
    }

    if (!xinput.isAvailable) return;

    // Poll 0-3 to find first connected
    let state = null;
    let activeIndex = -1;
    let lastErr = 0;

    for (let i = 0; i < 4; i++) {
        const s = xinput.getState(i);
        if (s) {
            state = s;
            activeIndex = i;
            break;
        } else {
            lastErr = xinput.getLastError();
        }
    }

    // Debug logging for disconnection
    if (!state && settings.enabled) {
        if (!global.loggedDisconnect) {
            log(`No controller found. Last Error Code: ${lastErr} (1167=NotConnected)`);
            global.loggedDisconnect = true;
        }
    } else if (state) {
        if (global.loggedDisconnect) {
            log(`Controller connected at index ${activeIndex}`);
            global.loggedDisconnect = false;
        }
    }

    // Update UI (Throttled to ~2 times per second)
    const now = Date.now();
    if (!global.lastUiUpdate || now - global.lastUiUpdate > 500) {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
            const statusData = {
                connected: !!state,
                enabled: settings.enabled,
                activeIndex: activeIndex,
                timestamp: now
            };
            mainWindow.webContents.send('status-update', statusData);
            global.lastUiUpdate = now;
        }
    }

    // Logic Gate: If disabled or disconnected, stop here
    if (!settings.enabled || !state || !state.Gamepad) return;

    const gamepad = state.Gamepad;
    // Left Stick
    const lx = gamepad.sThumbLX;
    const ly = gamepad.sThumbLY; // Y is up positive

    // Apply Deadzone
    let rawX = 0;
    let rawY = 0;

    if (Math.abs(lx) > settings.deadzone) {
        rawX = (lx > 0) ? (lx - settings.deadzone) : (lx + settings.deadzone);
    }
    if (Math.abs(ly) > settings.deadzone) {
        rawY = (ly > 0) ? (ly - settings.deadzone) : (ly + settings.deadzone);
    }

    // Move Mouse Logic
    if (rawX !== 0 || rawY !== 0) {
        // Normalize (approx 32767 max)
        const maxVal = 32767 - settings.deadzone;
        const normX = rawX / maxVal;
        const normY = rawY / maxVal;

        // Calculate speed (Quadratic curve for precision)
        // Sensitivity 1-100 map to speed factor?
        const speedFactorX = settings.sensitivityX / 5;
        const speedFactorY = settings.sensitivityY / 5;

        const moveX = Math.pow(Math.abs(normX), 2) * Math.sign(normX) * speedFactorX;
        const moveY = Math.pow(Math.abs(normY), 2) * Math.sign(normY) * -speedFactorY; // Invert Y for screen coords

        // Move Mouse
        const current = mouse.getPos();
        mouse.move(Math.round(current.x + moveX), Math.round(current.y + moveY));
    }

    // Buttons
    // A (0x1000), B (0x2000), X (0x4000), Y (0x8000)
    const buttons = gamepad.wButtons;
    if (!global.prevButtons) global.prevButtons = 0;

    // Check if state changed
    if (buttons !== global.prevButtons) {
        log(`Button changed: ${buttons.toString(16)} (MapA: ${settings.mapA}, MapB: ${settings.mapB})`);
    }

    const A_MASK = 0x1000;
    const B_MASK = 0x2000;

    function triggerAction(action, isDown) {
        if (!action || action === 'none') return;

        // Mouse Actions
        if (action === 'left') isDown ? mouse.leftDown() : mouse.leftUp();
        if (action === 'right') isDown ? mouse.rightDown() : mouse.rightUp();

        // Keyboard Actions
        // Format: "key:65" (A) or "combo:17,67" (Ctrl+C)
        if (action.startsWith('key:')) {
            const vk = parseInt(action.split(':')[1]);
            keyboard.sendKey(vk, isDown);
        }

        if (action.startsWith('combo:')) {
            // Combos are tricky for "hold". 
            // Simple approach: When button DOWN, press combo down. When button UP, release combo.
            // But usually combos are "tapped".
            // Let's implement holding behavior:
            // Down -> Press modifiers then key.
            // Up -> Release key then modifiers.

            const parts = action.split(':')[1].split(',').map(Number);
            // parts = [MOD1, MOD2, KEY]

            if (isDown) {
                parts.forEach(vk => keyboard.sendKey(vk, true));
            } else {
                [...parts].reverse().forEach(vk => keyboard.sendKey(vk, false));
            }
        }
    }

    // A(0x1000), B(0x2000), X(0x4000), Y(0x8000)
    // LB(0x0100), RB(0x0200), BACK(0x0020), START(0x0010)
    // LS_PRESS(0x0040), RS_PRESS(0x0080)

    const BUTTON_MAP = [
        { mask: 0x1000, setting: 'mapA' },
        { mask: 0x2000, setting: 'mapB' },
        { mask: 0x4000, setting: 'mapX' },
        { mask: 0x8000, setting: 'mapY' },
        { mask: 0x0100, setting: 'mapLB' },
        { mask: 0x0200, setting: 'mapRB' },
        { mask: 0x0020, setting: 'mapBack' },
        { mask: 0x0010, setting: 'mapStart' },
        { mask: 0x0040, setting: 'mapLStick' },
        { mask: 0x0080, setting: 'mapRStick' },
        { mask: 0x0001, setting: 'mapDPadUp' },
        { mask: 0x0002, setting: 'mapDPadDown' },
        { mask: 0x0004, setting: 'mapDPadLeft' },
        { mask: 0x0008, setting: 'mapDPadRight' }
    ];

    BUTTON_MAP.forEach(({ mask, setting }) => {
        const isDown = (buttons & mask) !== 0;
        const wasDown = (global.prevButtons & mask) !== 0;

        if (isDown !== wasDown) {
            triggerAction(settings[setting], isDown);
        }
    });

    global.prevButtons = buttons;

    // Triggers (Analog -> Digital)
    // Threshold 40/255 is approx 15% pull
    const TRIGGER_THRESHOLD = 40;
    const lt = gamepad.bLeftTrigger > TRIGGER_THRESHOLD;
    const rt = gamepad.bRightTrigger > TRIGGER_THRESHOLD;

    if (!global.prevTriggers) global.prevTriggers = { lt: false, rt: false };

    if (lt !== global.prevTriggers.lt) {
        triggerAction(settings.mapLT, lt);
        global.prevTriggers.lt = lt;
    }

    if (rt !== global.prevTriggers.rt) {
        triggerAction(settings.mapRT, rt);
        global.prevTriggers.rt = rt;
    }

    // Scrolling (Right Stick Y)
    const ry = gamepad.sThumbRY;
    if (Math.abs(ry) > settings.deadzone) {
        const maxVal = 32767 - settings.deadzone;
        const rawScrollY = (ry > 0) ? (ry - settings.deadzone) : (ry + settings.deadzone);
        const normScrollY = rawScrollY / maxVal;

        // Scroll speed
        // Base multiplier was 50
        const scrollFactor = settings.scrollSpeed || 50;
        const scrollSpeed = Math.pow(Math.abs(normScrollY), 2) * Math.sign(normScrollY) * scrollFactor;

        if (Math.abs(scrollSpeed) > 1) {
            mouse.scroll(Math.round(scrollSpeed));
        }
    }

}, POLLING_RATE);
