const fs = require('fs');
const pngToIco = require('png-to-ico');

pngToIco('./static/icon-256.png')
    .then(buf => {
        fs.writeFileSync('./src/icon.ico', buf);
        fs.writeFileSync('./static/icon.ico', buf);

    })
    .catch(console.error);

