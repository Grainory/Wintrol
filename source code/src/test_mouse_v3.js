const koffi = require('koffi');
const user32 = koffi.load('user32.dll');

const POINT = koffi.struct('POINT', {
    x: 'int32',
    y: 'int32'
});

const GetCursorPos = user32.func('GetCursorPos', 'bool', ['POINT *']);
const SetCursorPos = user32.func('SetCursorPos', 'bool', ['int', 'int']);

console.log('--- TEST V3 START ---');

console.log('Reading Pos...');
let pt = {};
const res = GetCursorPos(pt);
console.log('GetCursorPos Result:', res);
console.log('Pos:', pt);

console.log('Moving to 200,200...');
const moveRes = SetCursorPos(200, 200);
console.log('SetCursorPos Result:', moveRes);

console.log('Reading Pos again...');
let pt2 = {};
GetCursorPos(pt2);
console.log('Pos2:', pt2);

console.log('--- TEST V3 END ---');
