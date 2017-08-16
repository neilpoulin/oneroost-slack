var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.config.babel');
var bodyParser = require('body-parser');
var axios = require('axios');
var app = express();
var compiler = webpack(config);

var slackConfig = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    verificationToken: process.env.SLACK_VERIFICATION_TOKEN
}

app.use(bodyParser.json());
app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.post('/tokens/slack', (req, res) => {
    let code = req.body.code
    if(!code){
        return res.error({error: {
            code: "An auth code is required"
        }})
    }
    axios.get(`https://slack.com/api/oauth.access?client_id=${slackConfig.clientId}&client_secret=${slackConfig.clientSecret}&code=${code}`)
    .then(({data: {ok, access_token, scope, team, user, error}}) => {
        if (!ok){
            throw error
        }
        const info = {
            access_token,
            scope,
            team,
            user
        }
        res.send(info)
        return info
    })
    .then(({ok, access_token, scope, team, user, error}) => {
        //this is to the #random channel
        axios.post('https://hooks.slack.com/services/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', {
            text: `${user.name} has logged into OneRoost via Slack`
        })
    })
    .catch(function (error) {
        console.log(error);
        res.status(403)
        res.send({error})
    });
})

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function(err) {
    if (err) {
        return console.error(err);
    }

    console.log('Listening at http://localhost:3000/');
});
