const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const inputPath = path.join(__dirname, '../build/icon.png');
const outputPath = path.join(__dirname, '../build/icon.ico');

console.log('Reading ' + inputPath);
try {
    const file = fs.readFileSync(inputPath);
    toIco([file], {
        resize: true,
        sizes: [256, 128, 64, 48, 32, 16]
    }).then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Created ' + outputPath);
    }).catch(err => {
        console.error('Conversion failed:', err);
        process.exit(1);
    });
} catch (e) {
    console.error('File read error:', e);
    process.exit(1);
}
