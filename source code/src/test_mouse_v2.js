const mouse = require('./mouse_fixed');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('--- TEST START ---');
    const p1 = mouse.getPos();
    console.log('P1_X: ' + p1.x);
    console.log('P1_Y: ' + p1.y);

    console.log('Moving to 500,500...');
    mouse.move(500, 500);

    await sleep(100);

    const p2 = mouse.getPos();
    console.log('P2_X: ' + p2.x);
    console.log('P2_Y: ' + p2.y);

    if (p2.x === 500 && p2.y === 500) {
        console.log('RESULT: PASS');
    } else {
        console.log('RESULT: FAIL');
    }
}

run();
