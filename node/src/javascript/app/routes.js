var path = require('path');
var axios = require('axios');
var router = require('express').Router()
var viewRoot = path.join(__dirname, '..', '..', 'view')

import {
    SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET,
    SLACK_VERIFICATION_TOKEN,
    PARSE_PUBLIC_URL,
    PARSE_APP_ID,
    ENV,
    ENV_NAME,
    GOOGLE_CLIENT_ID,
    HOSTNAME,
    INTERCOM_APP_ID,
    GA_TRACKING_ID,
} from 'util/Environment'
import {
    postToChannel,
    getChannels,
    saveChannel,
    getSlackTeamBySlackTeamId,
    getImagesFromTeam,
    handleInboundInterestLevel,
} from 'slack/slackService'
import SlackTeam from 'models/SlackTeam'
import {
    INBOUND_CLASSNAME,
    USER_CLASSNAME,
} from 'models/ModelConstants'

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
        const {data: {ok, access_token, scope, team, user, error, user_id, team_id, team_name, user_name}} = userResponse
        console.log(userResponse.data)
        if (!ok){
            throw error
        }
        console.log('user access token', access_token)
        console.log('slack team', team)
        let slackTeam = await getSlackTeamBySlackTeamId(team_id || team.id)

        //Not all users will be giving the channel permission at this point,
        //so dont' fail if we can't get channels.
        if (!slackTeam){
            slackTeam = new SlackTeam({
                teamId: team_id || team.id,
                selectedChannels: [],
                accessToken: access_token,
            })
        }
        slackTeam.set('name', team_name || team.name)
        if (team){
            slackTeam.set('images', getImagesFromTeam(team))
        }

        try {
            let channels = await getChannels(access_token)
            slackTeam.setChannels(channels)
        } catch(e){
            console.warn('Failed to get channels for user: ', e)
        }

        slackTeam = await slackTeam.save()
        const info = {
            access_token,
            scope,
            team: team || {id: team_id, name: team_name},
            user: user || {id: user_id, name: user_name},
            slackTeam
        }

        res.cookie('slack_token', access_token)
        return res.send(info)

    }catch(e){
        console.error(e);
        res.status(403)
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
        HOSTNAME,
        INTERCOM_APP_ID,
        GA_TRACKING_ID,
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
    const body = req.body

    console.log('POST: /webhooks/slack request body.payload', body.payload, null, 4)
    const payload = JSON.parse(body.payload)
    const {
        callback_id,
        token,
    } = payload

    if (SLACK_VERIFICATION_TOKEN !== token){
        return res.send({
            'response_type': 'ephemeral',
            'replace_original': false,
            'text': 'Could not validate the message authenticity'
        });
    }

    const [actionType] = callback_id.split('::')
    console.log('actionType', actionType)

    let responsePayload = {}
    switch (actionType){
        case 'interest_level':
            responsePayload = await handleInboundInterestLevel(payload)
            break;
        default:
            responsePayload = {
                'response_type': 'ephemeral',
                'replace_original': false,
                'text': 'Unknown action type'
            }
            break;
    }

    return res.send(responsePayload)
})

router.get('/googleUsers', async (req, res) => {
    
})

router.get('*', function(req, res) {
    res.sendFile(path.join(viewRoot, 'index.html'));
});

module.exports = router;
