const port = process.env.PORT || 8080;
const config = require('./config');
const { generateMediaChannelKey } = require('./src/DynamicKey5')
const ts = Math.floor(new Date() / 1000);
const r = Math.floor(Math.random() * 0xFFFFFFFF);
const expiredTs = 0;

const firebase = require('firebase');
const database = firebase.initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID
});

const appID = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;

const express = require('express');
const app = express()

app.get('/channelKey', (req, res) => {
    res.header('Access-Control-Allow-Origin', "*");
    let channel = req.query.channel;
    new Promise((resolve, reject) => {
        if (!channel) reject("request channel not specified");
        database.database().ref('/').once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.key == channel) {
                    resolve();
                };
            });
            reject("The requested channel doesnt exist");
        })
    }).then(() => {
        let uid = randomFixedInteger(9);
        let key = generateMediaChannelKey(appID, appCertificate, channel, ts, r, uid, expiredTs);
        res.json({
            channelKey: key,
            uid: uid
        });
    }).catch(err => {
        res.json({
            Error: err
        });
    });
});

app.get('/generateLink', (req, res) => {
    // expect token from main app used to verify user
    //let token = req.query.accessToken;
    //let channel = decode(token).channel
    username = req.body.username;
    if(req.headers['token'] === config.video_token){
        res.header('Access-Control-Allow-Origin', "*");
        let channel = '1000';
        database.database().ref('/' + channel).set('SAMPLE_HOST_ID');
        res.json({
            url: 'https://comp4711-video-chat.herokuapp.com?channel=' + channel,
            nameOfUser: username
        });
    }else{
        res.json({
            error: 'Access Denied, No Token Found'
        });
    }
});

app.listen(port, () => {
    console.info('listening on %d', port);
});

const randomFixedInteger = function (length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
}