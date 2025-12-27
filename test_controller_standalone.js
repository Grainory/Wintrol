const koffi = require('koffi');
const xinput = require('./src/xinput');

console.log('--- STANDALONE CONTROLLER TEST ---');
console.log(`XInput Available: ${xinput.isAvailable}`);

if (!xinput.isAvailable) {
    console.error('XInput failed to load.');
    process.exit(1);
}

console.log('Polling for controllers (Press Ctrl+C to stop)...');

// Poll once to show status
for (let i = 0; i < 4; i++) {
    const state = xinput.getState(i);
    if (state) {
        console.log(`[CONNECTED] Index ${i}`);
    } else {
        console.log(`[DISCONNECTED] Index ${i} | Error Code: ${xinput.getLastError()} (1167 = Not Connected)`);
    }
}

// Loop
setInterval(() => {
    let connected = false;
    for (let i = 0; i < 4; i++) {
        const state = xinput.getState(i);
        if (state) {
            const btns = state.Gamepad.wButtons;
            const lt = state.Gamepad.bLeftTrigger;
            const rt = state.Gamepad.bRightTrigger;

            console.log(`[CONNECTED] Index ${i} | Buttons: 0x${btns.toString(16)} | LT: ${lt} | RT: ${rt} | LX: ${state.Gamepad.sThumbLX} | LY: ${state.Gamepad.sThumbLY}`);
            connected = true;
        }
    }

    if (!connected) {
        // process.stdout.write('.'); 
    }
}, 100);
