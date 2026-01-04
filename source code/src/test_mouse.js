const mouse = require('./mouse');

console.log('--- TEST START ---');
const initial = mouse.getPos();
console.log('Initial Pos:', initial);

console.log('Attempting move to 500, 500...');
mouse.move(500, 500);

const after = mouse.getPos();
console.log('After Move:', after);

if (after.x === 500 && after.y === 500) {
    console.log('SUCCESS: Moved to 500,500');
} else {
    console.log('FAIL: Position mismatch');
}
console.log('--- TEST END ---');
