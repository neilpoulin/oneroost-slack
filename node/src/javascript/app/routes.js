var path = require('path');
var axios = require('axios');
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
    HOSTNAME,
} from 'util/Environment'
import {
    postToChannel,
    getChannels,
    saveChannel,
    getSlackTeamBySlackTeamId,
} from 'slack/slackService'
import SlackTeam from 'models/SlackTeam'

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

        // let channelResponse = await axios.post('https://slack.com/api/channels.list', qs.stringify({
        //     token: access_token,
        //     exclude_archived: true,
        //     exclude_members: true,
        // }))
        // let channels = channelResponse.data.channels
        let channels = await getChannels(access_token)
        let slackTeam = await getSlackTeamBySlackTeamId(team.id)
        if (!slackTeam){
            slackTeam = new SlackTeam({
                teamId: team.id,
                selectedChannels: []
            })
            slackTeam.setChannels(channels)
            slackTeam = await slackTeam.save()
        }
        const info = {
            access_token,
            scope,
            team,
            user,
            channels,
            slackTeam
        }

        res.cookie('slack_token', access_token)
        return res.send(info)

    }catch(e){
        console.error(e);
        res.status(403)
        return res.send({error})
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
        HOSTNAME,
    })
})

router.post('/slackTeams', async (req, res) => {
    console.log('posting to slack teams', req.body)
    try{
        const {
            channelId,
            selected=false,
            teamId
        } = req.body
        var slackTeam = await saveChannel(teamId, channelId, selected)
        res.send({
            success: true,
            slackTeam: slackTeam.toJSON(),
        })
    } catch (e){
        console.error('Failed to save the channel', e)
        res.status(500)
        res.send({success: false, error: e})
    }
})

router.post('/webhooks/slack', async (req, res) => {
    console.log('Slack webhook:', req)
    res.send();
})

router.get('*', function(req, res) {
    res.sendFile(path.join(viewRoot, 'index.html'));
});

module.exports = router;
