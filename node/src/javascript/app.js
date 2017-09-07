var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
import setup from 'app/setup'
import {getParseServer, getParseDashboard, getLiveQueryServer} from 'app/parseServer'
var router = express.Router()
import routes from 'app/routes';
import {
    PORT,
    HOSTNAME,
    PARSE_LOCAL_URL,
    PARSE_PUBLIC_URL,
} from 'util/Environment'

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
    console.log(`Listening on public server url: ${PARSE_PUBLIC_URL} and local url: ${PARSE_LOCAL_URL}`);
});
