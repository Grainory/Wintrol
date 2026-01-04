const koffi = require('koffi');

// List of DLLs to try
const DLL_NAMES = ['xinput1_4.dll', 'xinput1_3.dll', 'xinput9_1_0.dll'];
const loadedFuncs = [];

DLL_NAMES.forEach(dll => {
    try {
        const lib = koffi.load(dll);
        // Try to bind XInputGetState
        // void* used for simple buffer passing
        // Use auto calling convention (usually correct for Windows DLLs via Koffi)
        const func = lib.func('XInputGetState', 'uint32', ['uint32', 'void *']);
        loadedFuncs.push({ name: dll, func, lib }); // Keep lib alive
    } catch (e) {
        // console.log(`Failed to load ${dll}`);
    }
});

const ERROR_SUCCESS = 0;
let lastErrorCode = 0;

function getState(userIndex) {
    // Try all loaded libraries until one reports success
    for (const item of loadedFuncs) {
        const buffer = Buffer.alloc(16);
        const result = item.func(userIndex, buffer);

        lastErrorCode = result;

        if (result === ERROR_SUCCESS) {
            return {
                dwPacketNumber: buffer.readUInt32LE(0),
                Gamepad: {
                    wButtons: buffer.readUInt16LE(4),
                    bLeftTrigger: buffer.readUInt8(6),
                    bRightTrigger: buffer.readUInt8(7),
                    sThumbLX: buffer.readInt16LE(8),
                    sThumbLY: buffer.readInt16LE(10),
                    sThumbRX: buffer.readInt16LE(12),
                    sThumbRY: buffer.readInt16LE(14)
                },
                source: item.name // Debug info to know which DLL worked
            };
        }
    }

    return null; // Not connected on any library
}

module.exports = {
    getState,
    isAvailable: loadedFuncs.length > 0,
    getLastError: () => lastErrorCode
};
