const koffi = require('koffi');
const user32 = koffi.load('user32.dll');

const POINT = koffi.struct('POINT', {
    x: 'int32',
    y: 'int32'
});

const SetCursorPos = user32.func('SetCursorPos', 'bool', ['int', 'int']);
const GetCursorPos = user32.func('GetCursorPos', 'bool', ['POINT *']);
const mouse_event = user32.func('mouse_event', 'void', ['uint32', 'uint32', 'uint32', 'uint32', 'ulong']);

// Constants
const MOUSEEVENTF_LEFTDOWN = 0x0002;
const MOUSEEVENTF_LEFTUP = 0x0004;
const MOUSEEVENTF_RIGHTDOWN = 0x0008;
const MOUSEEVENTF_RIGHTUP = 0x0010;
const MOUSEEVENTF_WHEEL = 0x0800;

function move(x, y) {
    const res = SetCursorPos(x, y);
    // console.log(`move(${x}, ${y}) -> ${res}`);
    return res;
}

function getPos() {
    let pt = { x: 0, y: 0 };
    if (GetCursorPos(pt)) {
        return { x: pt.x, y: pt.y };
    }
    return { x: 0, y: 0 };
}

function leftDown() { mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0); }
function leftUp() { mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0); }
function rightDown() { mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0); }
function rightUp() { mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0); }
function scroll(amount) { mouse_event(MOUSEEVENTF_WHEEL, 0, 0, amount, 0); }

module.exports = {
    move,
    getPos,
    leftDown,
    leftUp,
    rightDown,
    rightUp,
    scroll
};
