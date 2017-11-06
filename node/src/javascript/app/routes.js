var path = require('path');
var axios = require('axios');
var router = require('express').Router()
var viewRoot = path.join(__dirname, '..', '..', 'view')
import Parse from 'parse/node'
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
    STRIPE_PUBLISH_KEY
} from 'util/Environment'
import {
    postToChannel,
    getChannels,
    saveChannel,
    getSlackTeamBySlackTeamId,
    getImagesFromTeam,
} from 'slack/slackService'
import SlackTeam from 'models/SlackTeam'
import {
    INBOUND_CLASSNAME,
    USER_CLASSNAME,
} from 'models/ModelConstants'
import {getInterestLevelDisplayText, getEmoji} from 'slack/InterestLevel'
import {getExtensionPlan, getSubscriptionById} from './subscriptionService'

router.post('/tokens/slack', async (req, res) => {
    console.log('POST: /tokens/slack')
    let code = req.body.code
    let redirectUri = req.body.redirectUri;
    console.log('redirectUri:', redirectUri)
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
        STRIPE_PUBLISH_KEY
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
    // console.log('Slack webhook body:', req.body)
    const body = req.body

    console.log('request body.payload', body.payload)
    const payload = JSON.parse(body.payload)
    const {
        actions,
        callback_id,
        team: {id: teamId},
        channel: {id: channelId},
        user: {id: slackUserId, name: userName},
        token,
        original_message: original_message,
        response_url,
    } = payload

    if (SLACK_VERIFICATION_TOKEN !== token){
        return res.send({
            'response_type': 'ephemeral',
            'replace_original': false,
            'text': 'Could not validate the message authenticity'
        });
    }

    const [actionType, inboundId] = callback_id.split('::')
    console.log('actionType', actionType)
    console.log('inboundId', inboundId)
    let interestLevel = null;
    switch (actionType){
        case 'interest_level':
            interestLevel = actions[0].value
            break;
        default:
            return res.send({
                'response_type': 'ephemeral',
                'replace_original': false,
                'text': 'Unknown action type'
            });
    }
    let interestLevelDisplayText = getInterestLevelDisplayText(interestLevel)
    let inboundQuery = new Parse.Query(INBOUND_CLASSNAME)
    let inbound = await inboundQuery.get(inboundId)
    if (!inbound){
        return res.send({
            'response_type': 'ephemeral',
            'replace_original': false,
            'text': 'this inbound is no loger valid'
        });
    }
    console.log('inbound = ', inbound.toJSON())

    let [opportunityInfo, actionsAttachment] = original_message.attachments

    delete actionsAttachment.actions;
    actionsAttachment.text = `${getEmoji(interestLevel)} *${userName}* said ${interestLevelDisplayText.toLowerCase()} to ${inbound.get('companyName')}.`
    actionsAttachment.mrkdwn_in = ['text', 'footer']
    let slackUserQuery = new Parse.Query(USER_CLASSNAME)
    slackUserQuery.equalTo('slackUserId', slackUserId)
    let user = await slackUserQuery.first()

    inbound.set({
        replies: original_message.replies,
        interestLevel,
        responseFromSlackUserId: slackUserId,
        responseFrom: user,
    })
    inbound.save()

    return res.send({
        response_type: 'ephemeral',
        replace_original: true,
        text: '',
        attachments: [
            opportunityInfo,
            actionsAttachment
        ],
    })
})

router.get('/googleUsers', async (req, res) => {
    
})

router.get('/plans/extension/current', async (req, res) => {
    return getExtensionPlan().then(plan => {
        res.send(plan);
    }).catch(error => {
        res.status(500)
        res.send(error)
    })
})

router.get('/subscriptions/:subscriptionId', async (req, res) =>{
    return getSubscriptionById(req.params.subscriptionId).then(subscription => {
        res.send(subscription)
    }).catch(error => {
        res.status(500)
        res.send(error)
    })
})

router.get('*', function(req, res) {
    res.sendFile(path.join(viewRoot, 'index.html'));
});

module.exports = router;
