const koffi = require('koffi');

let user32;
try {
    user32 = koffi.load('user32.dll');
} catch (e) {
    console.error('Failed to load user32.dll', e);
}

// Use void* + Buffer for robust reading
const GetCursorPos = user32 ? user32.func('GetCursorPos', 'bool', ['void *']) : null;
const SetCursorPos = user32 ? user32.func('SetCursorPos', 'bool', ['int', 'int']) : null;
const mouse_event = user32 ? user32.func('mouse_event', 'void', ['uint32', 'uint32', 'uint32', 'uint32', 'ulong']) : null;

// Constants
const MOUSEEVENTF_LEFTDOWN = 0x0002;
const MOUSEEVENTF_LEFTUP = 0x0004;
const MOUSEEVENTF_RIGHTDOWN = 0x0008;
const MOUSEEVENTF_RIGHTUP = 0x0010;
const MOUSEEVENTF_WHEEL = 0x0800;

function move(x, y) {
    if (SetCursorPos) SetCursorPos(x, y);
}

function getPos() {
    if (!GetCursorPos) return { x: 0, y: 0 };

    const ptBuf = Buffer.alloc(8); // 2 * int32
    if (GetCursorPos(ptBuf)) {
        const x = ptBuf.readInt32LE(0);
        const y = ptBuf.readInt32LE(4);
        return { x, y };
    }
    return { x: 0, y: 0 };
}

function leftDown() {
    if (mouse_event) mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
}

function leftUp() {
    if (mouse_event) mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
}

function rightDown() {
    if (mouse_event) mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
}

function rightUp() {
    if (mouse_event) mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
}

function scroll(amount) {
    if (mouse_event) {
        mouse_event(MOUSEEVENTF_WHEEL, 0, 0, amount, 0);
    }
}

module.exports = {
    move,
    getPos,
    leftDown,
    leftUp,
    rightDown,
    rightUp,
    scroll
};
