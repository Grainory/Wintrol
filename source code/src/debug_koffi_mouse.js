const koffi = require('koffi');
try {
    const user32 = koffi.load('user32.dll');

    const POINT = koffi.struct('POINT', {
        x: 'long',
        y: 'long'
    });

    // Try different signatures or calling conventions if needed ('stdcall' is default for Windows usually)
    const GetCursorPos = user32.func('GetCursorPos', 'bool', ['POINT *']);
    const SetCursorPos = user32.func('SetCursorPos', 'bool', ['int', 'int']);

    console.log('Testing GetCursorPos with empty object...');
    let pt = {};
    const res = GetCursorPos(pt);
    console.log('Result:', res);
    console.log('Point:', pt);

    console.log('Testing GetCursorPos with initialized object...');
    let pt2 = { x: 0, y: 0 };
    const res2 = GetCursorPos(pt2);
    console.log('Result2:', res2);
    console.log('Point2:', pt2);

    console.log('Testing SetCursorPos...');
    const moveRes = SetCursorPos(100, 100);
    console.log('MoveRes:', moveRes);

    // Check if it moved
    let pt3 = {};
    GetCursorPos(pt3);
    console.log('Point3:', pt3);

} catch (e) {
    console.error('Koffi error:', e);
}
