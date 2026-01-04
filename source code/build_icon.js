
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const inputPng = path.join(__dirname, 'src/assets/icon.png');
const outputIco = path.join(__dirname, 'build/icon.ico');

// Ensure input exists
if (!fs.existsSync(inputPng)) {
    console.error(`Input file not found: ${inputPng}`);
    process.exit(1);
}

// Read the PNG
const files = [fs.readFileSync(inputPng)];

// Convert to ICO (default sizes: 16, 24, 32, 48, 64, 128, 256)
toIco(files)
    .then(buf => {
        fs.writeFileSync(outputIco, buf);
        console.log(`Successfully created ${outputIco}`);
    })
    .catch(err => {
        console.error('Error converting to ICO:', err);
        process.exit(1);
    });
