var path = require('path');
var axios = require('axios');
var qs = require('qs');
var router = require('express').Router()
var viewRoot = path.join(__dirname, '..', '..', 'view')
var slackConfig = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    verificationToken: process.env.SLACK_VERIFICATION_TOKEN
}
console.log('Slack Config:', slackConfig)
router.post('/tokens/slack', async (req, res) => {
    let code = req.body.code
    if(!code){
        return res.error({error: {
            code: 'An auth code is required'
        }})
    }

    try{
        let userResponse = await axios.get(`https://slack.com/api/oauth.access?client_id=${slackConfig.clientId}&client_secret=${slackConfig.clientSecret}&code=${code}`)
        const {data: {ok, access_token, scope, team, user, error}} = userResponse

        if (!ok){
            throw error
        }

        let channelResponse = await axios.post('https://slack.com/api/channels.list', qs.stringify({
            token: access_token,
            exclude_archived: true,
            exclude_members: true,
        }))
        
        const info = {
            access_token,
            scope,
            team,
            user,
            channels: channelResponse.data.channels
        }

        // postToChannel(access_token)

        res.cookie('slack_token', access_token)
        res.send(info)

    }catch(e){
        console.error(e);
        res.status(403)
        res.send({error})
    }
})

async function postToChannel(access_token){
    //this is to the #random channel
    const slackbot_channel = 'https://hooks.slack.com/services/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'
    const random_channel = 'https://hooks.slack.com/services/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'

    return axios.post(slackbot_channel, {
        text: `${user.name} has logged into OneRoost via Slack`
    })
    // axios.post('https://slack.com/api/channels.create', qs.stringify({
    //     token: access_token,
    //     name: 'OneRoost Testing 1',
    //     validate: true
    // }))
}

router.get('/slack/userInfo', (req, res) => {
    let accessToken = req.cookies.slack_token
    if (!accessToken){
        return res.sendStatus(401);
    }
    axios.post('https://slack.com/api/users.identity', qs.stringify({
        token: accessToken,
        scope: 'identity.email,identity.avatar,identity.team'
    })).then(({data: {team, user, ok}}) => {
        console.log('got user info', user)
        if (!ok){
            throw data.error
        }

        return axios.post('https://slack.com/api/channels.list', qs.stringify({
            token: accessToken,
            exclude_archived: true,
            exclude_members: true,
        })).then(({data: {channels, ok}}) => {
            const info = {
                accessToken,
                team,
                user,
                channels
            }
            res.send(info)
            return info
        })
    }).catch(error => {
        res.send({error})
    })

})

router.get('*', function(req, res) {
    res.sendFile(path.join(viewRoot, 'index.html'));
});


module.exports = router;
