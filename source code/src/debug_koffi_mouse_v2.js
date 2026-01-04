const koffi = require('koffi');

const user32 = koffi.load('user32.dll');

const POINT = koffi.struct('POINT', {
    x: 'int32',
    y: 'int32'
});

// Try 1: Standard
const GetCursorPos1 = user32.func('GetCursorPos', 'bool', ['POINT *']);

// Try 2: _Out_
const GetCursorPos2 = user32.func('GetCursorPos', 'bool', ['_Out_ POINT *']);

console.log('Testing 1 (standard)...');
let pt1 = {};
GetCursorPos1(pt1);
console.log('Result 1:', pt1);

console.log('Testing 2 (_Out_)...');
let pt2 = {};
GetCursorPos2(pt2);
console.log('Result 2:', pt2);
