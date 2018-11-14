const port = process.env.PORT || 8080;
const express = require('express');
const app = express();
const api_router = express.Router();
const room_router = express.Router();
const app_name = "<NAME>"

app.set('view engine', 'ejs');

// API routing
api_router.get('/generatelink', (req, res) => {
    let roomid = Math.random()
        .toString(36)
        .slice(2) + Date.now()
    res.json({
        url: 'localhost:8080/chatroom?roomid=' + roomid
    });
});
api_router.get('/testing1', (req, res) => {
    res.json({
        message: 'Sample GET request'
    });
});
room_router.get('/', (req, res) => {
    res.render('pages/index');
});

room_router.use(express.static('views/partials/scripts'));

app.use('/api', api_router);
app.use('/chatroom', room_router)

app.listen(port, () => {
    console.info('listening on %d', port);
});
