const port = process.env.PORT || 8080;
const express = require('express');
const app = express();
const api_router = express.Router();
let bodyParser = require('body-parser');
const config = require('./config');
const app_name = "<NAME>";


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
// API routing
api_router.post('/generatelink', (req, res) => {
    if(req.headers['token'] === config.video_token){
        let roomid = Math.random()
        .toString(36)
        .slice(2) + Date.now();
    res.json({
        url: 'https://comp4711-video-chat.herokuapp.com/chatroom?roomid=' + roomid
    });       
    }else{
        res.json(
            {
                error: 'Access Denied, No Token Found'
            });
    }
});
api_router.get('/testing1', (req, res) => {
    res.json({
        message: 'Sample GET request'
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
