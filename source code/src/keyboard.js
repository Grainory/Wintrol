const koffi = require('koffi');

// Load User32
let user32;
try {
    user32 = koffi.load('user32.dll');
} catch (e) {
    console.error('Failed to load user32.dll for keyboard');
}

// Structs for SendInput
// typedef struct tagINPUT {
//   DWORD type;
//   union {
//     MOUSEINPUT    mi;
//     KEYBDINPUT    ki;
//     HARDWAREINPUT hi;
//   } DUMMYUNIONNAME;
// } INPUT, *PINPUT, *LPINPUT;

// KEYBDINPUT
// WORD      wVk;
// WORD      wScan;
// DWORD     dwFlags;
// DWORD     time;
// ULONG_PTR dwExtraInfo;

const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;

// We need to define the struct carefully for 64-bit alignment if needed.
// koffi handles 'union' inside structs a bit specifically, but for simple SendInput we can flatten if we only use Keyboard.
// Actually, SendInput is tricky with unions in FFI. 
// A safer robust way for simple usage is keybd_event (deprecated but reliable for simple apps) 
// OR constructing the buffer manually for SendInput. 
// Given we used Buffer for joystick/mouse successfully, let's use Buffer for SendInput too if we go that route.
// BUT keybd_event is much simpler to bind. Let's try keybd_event first, it supports combos fine.

let keybd_event = null;

if (user32) {
    try {
        // void keybd_event(BYTE bVk, BYTE bScan, DWORD dwFlags, ULONG_PTR dwExtraInfo);
        keybd_event = user32.func('keybd_event', 'void', ['uint8', 'uint8', 'uint32', 'size_t']);
    } catch (e) {
        console.error('Failed to bind keybd_event', e);
    }
}

// Virtual Key Codes Mapping
const VK = {
    LBUTTON: 0x01, RBUTTON: 0x02, CANCEL: 0x03, MBUTTON: 0x04,
    BACK: 0x08, TAB: 0x09, CLEAR: 0x0C, RETURN: 0x0D, SHIFT: 0x10, CONTROL: 0x11, MENU: 0x12, PAUSE: 0x13, CAPITAL: 0x14,
    ESCAPE: 0x1B, SPACE: 0x20, PRIOR: 0x21, NEXT: 0x22, END: 0x23, HOME: 0x24, LEFT: 0x25, UP: 0x26, RIGHT: 0x27, DOWN: 0x28,
    SELECT: 0x29, PRINT: 0x2A, EXECUTE: 0x2B, SNAPSHOT: 0x2C, INSERT: 0x2D, DELETE: 0x2E, HELP: 0x2F,
    0: 0x30, 1: 0x31, 2: 0x32, 3: 0x33, 4: 0x34, 5: 0x35, 6: 0x36, 7: 0x37, 8: 0x38, 9: 0x39,
    A: 0x41, B: 0x42, C: 0x43, D: 0x44, E: 0x45, F: 0x46, G: 0x47, H: 0x48, I: 0x49, J: 0x4A, K: 0x4B, L: 0x4C, M: 0x4D,
    N: 0x4E, O: 0x4F, P: 0x50, Q: 0x51, R: 0x52, S: 0x53, T: 0x54, U: 0x55, V: 0x56, W: 0x57, X: 0x58, Y: 0x59, Z: 0x5A,
    LWIN: 0x5B, RWIN: 0x5C, APPS: 0x5D, SLEEP: 0x5F,
    NUMPAD0: 0x60, NUMPAD1: 0x61, NUMPAD2: 0x62, NUMPAD3: 0x63, NUMPAD4: 0x64, NUMPAD5: 0x65, NUMPAD6: 0x66, NUMPAD7: 0x67, NUMPAD8: 0x68, NUMPAD9: 0x69,
    MULTIPLY: 0x6A, ADD: 0x6B, SEPARATOR: 0x6C, SUBTRACT: 0x6D, DECIMAL: 0x6E, DIVIDE: 0x6F,
    F1: 0x70, F2: 0x71, F3: 0x72, F4: 0x73, F5: 0x74, F6: 0x75, F7: 0x76, F8: 0x77, F9: 0x78, F10: 0x79, F11: 0x7A, F12: 0x7B,
    NUMLOCK: 0x90, SCROLL: 0x91,
    LSHIFT: 0xA0, RSHIFT: 0xA1, LCONTROL: 0xA2, RCONTROL: 0xA3, LMENU: 0xA4, RMENU: 0xA5
};

// State tracking to prevent rapid firing if not desired, though main loop handles debounce usually.
// For combos, we need to handle hold/release logic.

function sendKey(vkCode, isDown) {
    if (!keybd_event) return;
    const flags = isDown ? 0 : KEYEVENTF_KEYUP;
    keybd_event(vkCode, 0, flags, 0);
}

// Helper to tap a key (down and up)
function tapKey(vkCode) {
    sendKey(vkCode, true);
    setTimeout(() => sendKey(vkCode, false), 50);
}

// Helper for combinations: e.g. [VK.CONTROL, VK.C]
function sendCombo(vkCodes) {
    if (!keybd_event) return;

    // Press all down
    vkCodes.forEach(vk => sendKey(vk, true));

    // Release all up (in reverse order roughly good practice)
    setTimeout(() => {
        [...vkCodes].reverse().forEach(vk => sendKey(vk, false));
    }, 50);
}

module.exports = {
    VK,
    sendKey,
    tapKey,
    sendCombo,
    isAvailable: !!keybd_event
};
