const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;

const inputPath = path.join(__dirname, '../build/icon.png');
const outputPath = path.join(__dirname, '../build/icon.ico');

console.log('Converting ' + inputPath);

pngToIco(inputPath)
    .then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Created ' + outputPath);
    })
    .catch(err => {
        console.error('Conversion failed:');
        console.error(err);
        process.exit(1);
    });
