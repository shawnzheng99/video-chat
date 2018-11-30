const port = process.env.PORT || 8080;
const express = require('express');
const app = express();
const app_name = "<NAME>"

app.set('view engine', 'ejs');

app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    if (req.query.channel) {
        res.render('pages/index');
    } else {
        res.render('pages/error');
    }
});

app.listen(port, () => {
    console.info('listening on %d', port);
});
