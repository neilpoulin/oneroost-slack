import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import setup from 'app/setup'
import * as cloud from 'app/cloud'
import {getParseServer, getParseDashboard} from 'app/parseServer'
import {getSignedWebhookEvent} from 'app/subscriptionService';
import Raven from 'raven'

var router = express.Router()
import routes from 'app/routes';
import {
    PORT,
    PARSE_LOCAL_URL,
    PARSE_PUBLIC_URL,
} from 'util/Environment'

var app = express();
//Raven.config(____DSN____)
setup(app);
app.post('/webhooks/stripe', bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

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

cloud.initialize()
