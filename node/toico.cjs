const fs = require('fs');
const pngToIco = require('png-to-ico');

pngToIco('./static/curtain_logo.png')
    .then(buf => {
        fs.writeFileSync('./src/icon.ico', buf);
    })
    .catch(console.error);

