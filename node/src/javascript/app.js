var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var setup = require('./app/setup');
import {getParseServer, getParseDashboard, getLiveQueryServer} from './app/parseServer'
var router = express.Router()
import routes from './app/routes';
import {
    PORT,
    HOSTNAME,
} from './Environment'

var app = express();
setup(app);
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/parse', getParseServer());
app.use('/admin/dashboard', getParseDashboard());
app.use(router)
app.use('/', routes);
app.listen(PORT, function(err) {
    if (err) {
        return console.error(err);
    }
    console.log(`Listening on ${HOSTNAME}:${PORT}`);
});
