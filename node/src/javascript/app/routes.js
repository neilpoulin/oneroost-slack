var path = require('path');
var axios = require('axios');
var qs = require('qs');
var router = require('express').Router()
var viewRoot = path.join(__dirname, '..', '..', 'view')
import {
    SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET,
    PARSE_PUBLIC_URL,
    PARSE_APP_ID,
    ENV,
    ENV_NAME,
    GOOGLE_CLIENT_ID,
} from './../Environment'
import {
    postToChannel,
    getUserInfo,
    createChannel,
} from './../slack/slackService'

router.post('/tokens/slack', async (req, res) => {
    console.log('POST: /tokens/slack')
    let code = req.body.code
    let redirectUri = req.body.redirectUri;
    if(!code){
        return res.error({error: {
            code: 'An auth code is required'
        }})
    }

    try{
        let userResponse = await axios.get(`https://slack.com/api/oauth.access?client_id=${SLACK_CLIENT_ID}&client_secret=${SLACK_CLIENT_SECRET}&code=${code}&redirect_uri=${redirectUri}`)
        const {data: {ok, access_token, scope, team, user, error}} = userResponse

        if (!ok){
            throw error
        }

        let channelResponse = await axios.post('https://slack.com/api/channels.list', qs.stringify({
            token: access_token,
            exclude_archived: true,
            exclude_members: true,
        }))
        let channels = channelResponse.data.channels
        const info = {
            access_token,
            scope,
            team,
            user,
            channels,
        }
        let channel = getChannel(channels)
        if (channel){
            postToChannel(channel.id, `${user.name} has logged into OneRoost via Slack`)
        }

        res.cookie('slack_token', access_token)
        return res.send(info)

    }catch(e){
        console.error(e);
        res.status(403)
        return res.send({error})
    }
})

function getChannel(channels){
    if (channels && channels.length > 0){
        let channel = channels.find(c => {
            return c.name.indexOf('oneroost') !== -1
        })
        return channel
    }
    return null
}

router.get('/slack/userInfo', async (req, res) => {
    console.log('GET: /slack/userInfo')
    let accessToken = req.cookies.slack_token
    if (!accessToken){
        return res.sendStatus(401);
    }
    try{
        const {team, user} = await getUserInfo(accessToken);
        try{
            await createChannel(accessToken)
            console.log('creataed channel!')
        } catch(e) {
            console.error(e)
        }

        let channelResponse = await axios.post('https://slack.com/api/channels.list', qs.stringify({
            token: accessToken,
            exclude_archived: true,
            exclude_members: true,
        }))
        let channels = channelResponse.data.channels
        let info = {
            access_token: accessToken,
            team,
            user,
            channels,
        }
        let channel = getChannel(channels)

        console.log('channel to post to = ', channel)
        if (channel){
            postToChannel(channel.id, `${user.name} has logged into OneRoost via Slack`)
        }

        return res.send(info)
    } catch(e){
        return res.send({error: e})
    }
})

router.post('/slack/channels/:channelId', (req, res) => {
    const channelId = req.params.channelId
    const message = req.body.message
    postToChannel(channelId, message)
})

router.get('/configs', (req, res) => {
    res.send({
        PARSE_PUBLIC_URL,
        PARSE_APP_ID,
        ENV,
        ENV_NAME,
        SLACK_CLIENT_ID,
        GOOGLE_CLIENT_ID,
    })
})

router.get('*', function(req, res) {
    res.sendFile(path.join(viewRoot, 'index.html'));
});

module.exports = router;
