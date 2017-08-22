var path = require('path');
var axios = require('axios');
var qs = require('qs');
var router = require('express').Router()

var slackConfig = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    verificationToken: process.env.SLACK_VERIFICATION_TOKEN
}
console.log('Slack Config:', slackConfig)
router.post('/tokens/slack', (req, res) => {
    let code = req.body.code
    if(!code){
        return res.error({error: {
            code: 'An auth code is required'
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
        const slackbot_channel = 'https://hooks.slack.com/services/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'
        const random_channel = 'https://hooks.slack.com/services/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'
        axios.post(slackbot_channel, {
            text: `${user.name} has logged into OneRoost via Slack`
        })
        axios.post('https://slack.com/api/channels.create', qs.stringify({
            token: access_token,
            name: 'OneRoost Testing 1',
            validate: true
        }))

    })
    .catch(function (error) {
        console.log(error);
        res.status(403)
        res.send({error})
    });
})

router.get('*', function(req, res) {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});


module.exports = router;
