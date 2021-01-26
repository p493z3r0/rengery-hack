let g_browser;

/// gets the API Key from Energy :)
const targetUrl = 'https://api.energy.ch/broadcast/channels/bern/playouts'
const getToken = async () => {
    try {
        const url = 'https://energy.ch/play/bern';

        const puppeteer = require('puppeteer');

        const browser = await puppeteer.launch({headless: true});
        g_browser = browser;
        const pages = await browser.pages();
        const page = pages[0];
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.url().includes(targetUrl)) {
                getApiData(request.url())
                return;
            }
            request.continue();
        });
        await page.goto(url);
    } catch (e) {
        console.log(e);
    }
}


getToken().then();

function getApiData(url) {
    const request = require('request');


    let options = {json: true};


    request(url, options, (error, res, body) => {
        if (error) {
            return console.log(error)
        }

        if (!error && res.statusCode === 200) {
            const song = getCurrentSongFromApiData(body);
            console.log('song title: ' + song.title);
            console.log('artist name: ' + song.artists[0].name);

            checkIfSongIsInBlackList(song);
        }

        console.log(res.statusCode);
    });

}

function isFutureDate(date) {
    let d_now = new Date();
    return d_now.getTime() <= date.getTime();
}


function getCurrentSongFromApiData(tracks) {
    g_browser.close();
    for (const track of tracks) {
        const trackDate = new Date(Date.parse(track.created_at));
        if (!isFutureDate(trackDate)) {
            return track.song;
        }
    }
}

function checkIfSongIsInBlackList(song){

    const fs = require('fs');
    const readline = require('readline');
    const readInterface = readline.createInterface({
        input: fs.createReadStream('blacklist.txt'),
        output: undefined,
        console: false
    });

    readInterface.on('line', function(line) {
        if(line.includes(song.title) || line.includes(song.artists[0].name) ){
            console.log('blocked song found, running TOTO');
            overturnWithTotoAfrica();
        }
    });
}

function overturnWithTotoAfrica(){
    const { spawn } = require('child_process');
    spawn('ssh', ['pi@raspberrypi', 'sudo toto.sh'], { stdio: 'inherit' });

}



