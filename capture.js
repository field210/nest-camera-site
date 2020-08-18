const {authGoogle} = require('nest-observe');
const {FileQueue} = require('./utils');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

IMAGE_DIR = path.join(__dirname, '..', 'nest');

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR);
}

function capture() {
    fs.readFile('./config.json', (err, data) => {
        const config = JSON.parse(data);
        authGoogle(config['issueToken'], config['cookies'], config['apiKey']).then(token => {
            const fq = new FileQueue(config['rotation_hours']*3600/config['interval_seconds'], IMAGE_DIR);
            setTimeout(() => getImage(token, fq, config), config['interval_seconds']*1000);
        });
    });
}

function getImage(token, fq, config){
    const now = DateTime.local();;
    if (now < token.expiry) {
        setTimeout(() => getImage(token, fq, config), config['interval_seconds']*1000);
    }
    else {
        token.refresh().then(token => {
            setTimeout(() => getImage(token, fq, config), 0);
        });
        return;
    }

    fetch(`https://nexusapi-${config['server']}.camera.home.nest.com/get_image?uuid=${config['uuid']}&width=${config['resolution']}`, {
        method: 'GET',
        headers: {
            Origin: 'https://home.nest.com',
            Referer: 'https://home.nest.com/',
            Authorization: 'Basic ' + token.token,
            'accept': 'image/webp,image/apng,image/*,*/*;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
        },
    }).then(response => {
        if (response.ok) {
            const ts=now.toFormat('yyyy-MM-dd_HH-mm-ss')
            const filename = path.join(IMAGE_DIR,ts+'.jpg');
            const file = fs.createWriteStream(filename);
            response.body.pipe(file);
            fq.push(filename);
        }
        else {
            console.log(now);
            console.log(response);
        }
    })
}

module.exports = {capture, IMAGE_DIR};
