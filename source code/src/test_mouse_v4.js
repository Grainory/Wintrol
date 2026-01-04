const koffi = require('koffi');
const user32 = koffi.load('user32.dll');

// Use void* or explicit ptr to bypass struct object mapping if failing
const GetCursorPos = user32.func('GetCursorPos', 'bool', ['void *']);
const SetCursorPos = user32.func('SetCursorPos', 'bool', ['int', 'int']);

console.log('--- TEST V4 START ---');

const ptBuf = Buffer.alloc(8); // 2 * int32
const res = GetCursorPos(ptBuf);
console.log('GetCursorPos Result:', res);

const x = ptBuf.readInt32LE(0);
const y = ptBuf.readInt32LE(4);
console.log(`Pos: ${x}, ${y}`);

console.log('Moving to 300, 300...');
SetCursorPos(300, 300);

const ptBuf2 = Buffer.alloc(8);
GetCursorPos(ptBuf2);
const x2 = ptBuf2.readInt32LE(0);
const y2 = ptBuf2.readInt32LE(4);
console.log(`Pos2: ${x2}, ${y2}`);

if (x2 === 300 && y2 === 300) {
    console.log('RESULT: PASS');
} else {
    console.log('RESULT: FAIL');
}
console.log('--- TEST V4 END ---');
