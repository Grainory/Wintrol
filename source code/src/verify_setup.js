const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const koffi = require('koffi');

app.whenReady().then(() => {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Path Verification
    const userDataPath = app.getPath('userData');
    console.log(`UserData Path: ${userDataPath}`);

    const exePath = app.getPath('exe');
    console.log(`Exe Path: ${exePath}`);

    // 2. Write Permission Test
    const testLogPath = path.join(userDataPath, 'diagnostic_test.txt');
    try {
        fs.writeFileSync(testLogPath, `Test write at ${new Date().toISOString()}`);
        console.log(`[PASS] Write Permission: Can write to ${testLogPath}`);
    } catch (e) {
        console.error(`[FAIL] Write Permission: Cannot write to ${testLogPath}`, e);
    }

    // 3. User32.dll Test
    try {
        const user32 = koffi.load('user32.dll');
        console.log(`[PASS] User32.dll loaded.`);
        // Test binding
        const GetCursorPos = user32.func('GetCursorPos', 'bool', ['void *']);
        console.log(`[PASS] User32 GetCursorPos bound.`);
    } catch (e) {
        console.error(`[FAIL] User32.dll load failed:`, e);
    }

    // 4. XInput Test
    const dlls = ['xinput1_4.dll', 'xinput9_1_0.dll', 'xinput1_3.dll'];
    let xinputLoaded = false;

    dlls.forEach(dll => {
        try {
            const lib = koffi.load(dll);
            xinputLoaded = true;
            console.log(`[PASS] ${dll} loaded successfully.`);
        } catch (e) {
            console.log(`[INFO] ${dll} not found or failed.`);
        }
    });

    if (!xinputLoaded) {
        console.error('[FAIL] NO XInput DLLs could be loaded.');
    } else {
        console.log('[PASS] At least one XInput DLL is available.');
    }

    console.log('--- DIAGNOSTIC END ---');
    app.quit();
});
