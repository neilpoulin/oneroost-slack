var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var devConfig = require('./app/config');
var router = express.Router()
var routes = require('./routes');

var app = express();
devConfig(app);
app.use(bodyParser.json());
router.use(function(req, res, next) {
    console.log(req.method + ': ' + (req.path || '/'))
    next()
})
app.use(router)
app.use('/', routes);
app.listen(3000, function(err) {
    if (err) {
        return console.error(err);
    }

    console.log('Listening at http://localhost:3000/');
});
