const port = process.env.PORT || 8080;
const config = require('./config');
const bodyParser = require('body-parser');
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
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.all('*', function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'token');
    next();
});


app.get('/channelKey', (req, res) => {
    res.header('Access-Control-Allow-Origin', "*");
    let channel = req.query.channel;
    new Promise((resolve, reject) => {
        if (!channel) {
            res.redirect('https://rankup.pro/Login.html');
        }
        database.database().ref('/').once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.key == channel) {
                    resolve();
                }else{
                    res.status(404);
                };
            });
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

app.post('/generateLink', (req, res) => {
    // expect token from main app used to verify user
    //let token = req.query.accessToken;
    //let channel = decode(token).channel
    //let username = req.body.username;
    if(req.headers['token'] === config.video_token){
        let channel = '1000';
        database.database().ref('/' + channel).set('SAMPLE_HOST_ID');
        res.json({
            url: 'https://videochat-4711.herokuapp.com/?channel=' + channel
            //nameOfUser: username
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