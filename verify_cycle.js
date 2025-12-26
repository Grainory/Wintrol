const { execSync, spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const distDir = path.join(projectRoot, 'dist');
const installDir = path.join(distDir, 'app');

console.log('--- Wintrol Verification Cycle ---');

// 0. Kill Running Instances
console.log('[0/4] Checking for running instances...');
try {
    // Force kill wintrol.exe if running
    // /F = Force, /IM = Image Name
    // Redirect stderr to null to avoid noise if not running
    execSync('taskkill /F /IM wintrol.exe 2>NUL', { stdio: 'ignore' });
    console.log('      [PASS] Killed running wintrol.exe instances.');
} catch (e) {
    // If it fails, likely process wasn't running (exit code 128)
    console.log('      [INFO] No running instances found or could not kill (clean start).');
}

// 1. Uninstall if exists
// Look for uninstaller in installDir
// Uninstaller name is typically "Uninstall wintrol.exe"
const uninstallerName = 'Uninstall wintrol.exe';
const uninstallerPath = path.join(installDir, uninstallerName);

if (fs.existsSync(uninstallerPath)) {
    console.log(`[1/4] Found uninstaller: ${uninstallerPath}`);
    console.log('      Running uninstaller silently...');

    // Using /S to run silently. 
    // Note: The uninstaller usually copies itself to temp and exits immediately.
    // We can't easily wait for it unless we use _?= (but that locks files).
    // We will run it and wait for a few seconds or poll until the directory is cleaned?
    // Actually, let's try to wait for the process.

    try {
        // Run uninstaller. It spawns a temp process and exits.
        execSync(`"${uninstallerPath}" /S`, { stdio: 'inherit' });

        console.log('      Uninstaller triggered. Waiting for cleanup...');

        // Wait loop: wait until uninstallerPath is GONE.
        // Or wait for a max timeout.
        let checks = 0;
        while (fs.existsSync(uninstallerPath) && checks < 30) {
            // Sleep 1s
            const start = Date.now();
            while (Date.now() - start < 1000) { }
            checks++;
            process.stdout.write('.');
        }
        console.log('');

        if (fs.existsSync(uninstallerPath)) {
            console.log('      [WARN] Uninstaller did not remove itself yet. Proceeding anyway.');
        } else {
            console.log('      [PASS] Uninstallation appears complete (uninstaller gone).');
        }
    } catch (e) {
        console.error('      [FAIL] Failed to run uninstaller:', e.message);
    }
} else {
    console.log('[1/4] No existing installation found (no uninstaller). Skipping uninstall.');
}

// 2. Build
console.log('[2/4] Running Build (npm run build)...');
try {
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
    console.log('      [PASS] Build complete.');
} catch (e) {
    console.error('      [FAIL] Build failed:', e.message);
    process.exit(1);
}

// 3. Locate Setup
// Find wintrol Setup *.exe in dist
const files = fs.readdirSync(distDir);
const setupFile = files.find(f => f.startsWith('wintrol Setup') && f.endsWith('.exe'));

if (!setupFile) {
    console.error('      [FAIL] Could not find "wintrol Setup *.exe" in dist folder.');
    process.exit(1);
}

const setupPath = path.join(distDir, setupFile);
console.log(`[3/4] Found Setup: ${setupPath}`);

// 4. Install
console.log(`[4/4] Installing to ${installDir}...`);
try {
    // NSIS Silent install: /S /D=Path
    // /D must be the last parameter and must not contain quotes (some versions) or quirks.
    // Actually typically: setup.exe /S /D=C:\Path with spaces
    // The convention: quotes around the whole arg? or just the path?
    // Electron-builder NSIS: /D=... should work.

    const cmd = `"${setupPath}" /S /D=${installDir}`;
    console.log(`      Executing: ${cmd}`);

    execSync(cmd, { stdio: 'inherit' });

    console.log('      Installation triggered.');
    console.log('      Waiting for installation to complete (checking for main executable)...');

    // Poll for the app executable: wintrol.exe
    const appExe = path.join(installDir, 'wintrol.exe'); // Or whatever the productName is. 
    // package.json "name" is "wintrol". product name? "wintrol" (implied).

    let checks = 0;
    while (!fs.existsSync(appExe) && checks < 60) {
        const start = Date.now();
        while (Date.now() - start < 1000) { }
        checks++;
        process.stdout.write('.');
    }
    console.log('');

    if (fs.existsSync(appExe)) {
        console.log(`      [PASS] Installation successful. Found ${appExe}`);
    } else {
        console.error('      [FAIL] Installation timed out or failed. App executable not found.');
        process.exit(1);
    }

} catch (e) {
    console.error('      [FAIL] Installation process failed:', e.message);
    process.exit(1);
}

console.log('--- Cycle Complete ---');
