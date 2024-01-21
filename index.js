const rpc = require('discord-rpc');
const express = require('express');
const axios = require('axios');
const client = new rpc.Client({ transport: 'ipc' });
const app = express();
var song = 'Waiting for music...';
var artist = 'No Artist';
var tempTime = '0:00';

console.log('Starting YouTubeMusicDiscordRichPresence...');

client.login({ clientId: 'applicationID' });

update(song, artist);

app.use(express.json());
app.post("/", (request, response) => {
    let content = request.body;
    if (content.song == undefined || content.song == null || tempTime == content.timeMax.replace(' ', '') || content.timeMax.replace(' ', '') == '0:00') {
        response.sendStatus(200);
        return;
    }

    if (song == content.song) {
        response.sendStatus(200);
        return;
    }
    tempTime = content.timeMax.replace(' ', '');
    song = content.song;

    console.log(`Playing now:\n"${content.song}"\nby\n${content.artist}\nTime left: ${content.timeMax.replace(' ', '')}`);
    update(content.song, content.artist, Date.now(), timeToMilli(content.timeMax.replace(' ', '')));
    response.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Ready Senpai! Listening on port 3000...');
    setInterval(() => {
        update(song, artist, Date.now(), timeToMilli(tempTime));
    }, 60000);
});

function update(song, artist, timeNow, timeMax) {
    // Use YouTube API to get the video thumbnail URL
    axios.get(`https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(song)}&key=AIzaSyCYSqTEq4Hjdx0qqokab8Lq7xgwYfvWXK8&type=video&part=snippet&maxResults=1`)
        .then(response => {
            const videoId = response.data.items[0].id.videoId; // Define videoId here
            const thumbnailUrl = response.data.items[0].snippet.thumbnails.high.url;

            client.setActivity({
                details: song,
                state: artist,
                startTimestamp: timeNow,
                endTimestamp: timeMax,
                largeImageKey: thumbnailUrl,
                largeImageText: 'Listening to YouTube Music', // Tooltip text
                largeImageScale: 0.95, // 5% smaller
                instance: true,
                buttons: [
                    { label: 'Listen Along', url: `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(timeNow / 1000)}` }
                ],
            });
        })
        .catch(error => {
            console.error('Error fetching YouTube video thumbnail:', error.message);
        });
}

function timeToMilli(time) {
    var temp = Date.now();
    if (time.split(':').length == 2) {
        temp += Math.round(parseFloat(time.split(':')[0]) * 60000);
        temp += Math.round(parseFloat(time.split(':')[1]) * 1000);
    } else if (time.split(':').length == 3) {
        temp += Math.round(parseFloat(time.split(':')[0]) * 3600000);
        temp += Math.round(parseFloat(time.split(':')[1]) * 60000);
        temp += Math.round(parseFloat(time.split(':')[2]) * 1000);
    }
    return temp;
}
