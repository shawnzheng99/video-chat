const port = process.env.PORT || 8080;
const express = require('express');
const cors = require('cors');
const app = express();
const api_router = express.Router();
let bodyParser = require('body-parser');
const config = require('./config');
const app_name = "<NAME>";
let username = 'mo ren';

// allow CORS req.
app.use(cors);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
// API routing
api_router.post('/generatelink', (req, res) => {
    username = req.body.username;
    if(req.headers['token'] === config.video_token){
        let roomid = Math.random()
        .toString(36)
        .slice(2) + Date.now();
    res.json({
        url: 'https://videochat-4711.herokuapp.com/chatroom?roomid=' + roomid,
        nameOfUser: username
    });       

    }else{
        res.json(
            {
                error: 'Access Denied, No Token Found'
            });
    }
});


// testing route

api_router.post('/test', (req, res) => {
    let name = 'moren';
    name = req.body.username;
    res.json({
        message: 'Sample POST request',
        name: name
    });
});

app.set('view engine', 'ejs');

app.use('/chatroom', express.static(__dirname + '/public'));

app.use('/api', api_router);

app.get('/chatroom', (req, res) => {
    if (req.query.roomid) {
        res.render('pages/index');
    } else {
        res.render('pages/error');
    }
});

app.listen(port, () => {
    console.info('listening on %d', port);
});
