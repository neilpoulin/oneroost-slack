var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var setup = require('./app/setup');
var router = express.Router()
import routes from './app/routes';

var app = express();
setup(app);
app.use(bodyParser.json());
app.use(cookieParser());
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
    console.log('Listening on http://localhost:3000/');
});
