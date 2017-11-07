import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import setup from 'app/setup'
import * as cloud from 'app/cloud'
import {getParseServer, getParseDashboard} from 'app/parseServer'
import {getSignedWebhookEvent} from 'app/subscriptionService';

var router = express.Router()
import routes from 'app/routes';
import {
    PORT,
    PARSE_LOCAL_URL,
    PARSE_PUBLIC_URL,
} from 'util/Environment'

var app = express();
setup(app);


app.post('/webhooks/stripe', addRawBody, async (req,res) => {
    console.log('attempting to process stripe webhook event', req.body)
    let sig = req.headers['stripe-signature'];
    let event = await getSignedWebhookEvent(sig, req.rawBody)
    console.log('[Stripe WebHook]', event)
    return res.send({received: true})
})

function addRawBody(req, res, next) {
    console.log('adding raw body', req)
    req.setEncoding('utf8');

    var data = '';

    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        req.rawBody = data;

        next();
    });
}



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
