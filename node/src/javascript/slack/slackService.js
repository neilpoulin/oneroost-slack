import {WebClient} from '@slack/client'
import axios from 'axios'
import qs from 'qs'
import Timeout from 'util/Timeout'
import SlackTeam from 'models/SlackTeam'
import {
    SLACK_TEAM_CLASSNAME,
    INBOUND_CLASSNAME,
    USER_CLASSNAME
} from 'models/ModelConstants'
import {
    getInterestLevelDisplayText,
    getEmoji,
    YES,
    NO,
    NOT_NOW,
} from 'slack/InterestLevel'
import {SLACK_OAUTH_TOKEN} from 'util/Environment';
import Parse from 'parse/node'

//TODO: if needing to use different tokens on a request, create a NEW instance of the web client!!!
export function postToChannel(channelId, message, payload, accessToken){
    console.log('posting to channel ', channelId)
    const web = new WebClient(accessToken)
    return new Timeout((resolve, reject) => web.chat.postMessage(channelId, message, payload, function(err, res) {
        if (err) {
            console.error('Error:', err);
            reject()
        } else {
            console.log('Message sent to channel');
            resolve(res)
        }
    }));
}

export async function getUserInfo(accessToken){
    try{
        const {data: {team, user, ok}} =  await axios.post('https://slack.com/api/users.identity', qs.stringify({
            token: accessToken,
            scope: 'identity.email,identity.avatar,identity.team'
        }))
        if (!ok){
            throw 'The request was not valid'
        }
        console.log('retrieved user info')

        return {
            team,
            user,
        }
    } catch (error){
        console.error('authentication failed', error)
        return {error};
    }
}

export async function createChannel(access_token){
    console.log('Attempting to create channel')
    return axios.post('https://slack.com/api/channels.create', qs.stringify({
        token: access_token,
        name: 'oneroosttesting',
        validate: true
    })).then(({data}) => {
        if (data.ok){
            console.log('successfully created channel', data)
        } else {
            throw data.error
        }
    }).catch(error => console.error(error))
}

export async function getChannels(token){
    let channelResponse = await axios.post('https://slack.com/api/channels.list', qs.stringify({
        token,
        exclude_archived: true,
        exclude_members: true,
    }))
    let channels = channelResponse.data.channels
    if (channelResponse.data.ok){
        return channels
    }
    else {
        throw Error('Could not fetch channels');
    }
    //TODO: if needing to use different tokens on a request, create a NEW instance of the web client!!!
    // return new Timeout((resolve, reject) => web.channels.list({
    //     token,
    // }, async (error, res) => {
    //     if (error){
    //         console.error('Error getting channel list: ', error)
    //         return reject(error)
    //     }
    //     console.log('successfully got channel list', res)
    //     const {channels} = res
    //     return resolve(channels)
    // }), 10000)
}

export async function getChannelInfo(channelId, accessToken){
    console.log('getting channel info')
    return new Timeout((resolve, reject) => {
        let web = new WebClient(accessToken)
        web.channels.info(channelId, async (err, res) => {
            if (err) {
                console.error('Error getting channel info:', err);
                return reject(err);
            }
            console.log('got channel info', res)
            return resolve(res);
        })
    })
}

export async function saveChannel(teamId, channelId, selected=true){
    try{
        console.log('looking for slack team')
        let slackTeam = await getSlackTeamByTeamId(teamId)
        let channelInfo = await getChannelInfo(channelId, slackTeam.get('accessToken'))
        let {channel} = channelInfo
        if (!slackTeam){
            throw 'Can not save channel... teamId = ' + teamId + ' does not exist'
        }
        slackTeam.addChannel(channel, selected)
        console.log('saving channel ' + channelId + ' as ' + (selected ? 'selected' : 'not-selected') + ' for  teamId = ' + teamId )
        let saved = await slackTeam.save()
        console.log('successfully saved slack team', saved.toJSON())
        return saved
    } catch (e){
        console.error('Failed to save the slack team: ', e)
        throw e
    }
}

export async function getSlackTeamBySlackTeamId(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    query.equalTo('teamId', teamId)
    return await query.first()
}

export async function getSlackTeamByTeamId(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    return await query.get(teamId)
}

export async function createOrUpdateTeam(teamId, channel, selected=false){
    let existingTeam = await getSlackTeamByTeamId(teamId)
    if (existingTeam){
        existingTeam.addChannel(channel, selected)
        if (selected){
            existingTeam.selectChannel(channel.id)
        } else {
            existingTeam.removeChannel(channel.id)
        }

        return await existingTeam.save()
    }
    return createSlackTeam(teamId, channel, selected)
}

export async function createSlackTeam(teamId, channel, selected=false){
    let existingTeam = await getSlackTeamByTeamId(teamId)
    if (existingTeam){
        throw new Error('A SlackTeam with teamId = ' + teamId + ' already exists')
    }

    let slackTeam = new SlackTeam({teamId})

    slackTeam.addChannel(channel)
    if (selected){
        slackTeam.selectChannel(channel.id)
    } else {
        slackTeam.removeChannel(channel.id)
    }
    console.log('SlackTeam', slackTeam.toJSON())
    let saved =  await slackTeam.save()
    console.log('Successfully saved slack team!')
    return saved
}

export function getImagesFromTeam(team){
    if (!team){
        return {}
    }
    const {image_34, image_44, image_68, image_88, image_102, image_132, image_230, image_original} = team
    return {image_34, image_44, image_68, image_88, image_102, image_132, image_230, image_original}

}

async function buildDialogInterestResponse(interestLevel, payload){
    console.log('Processing dialog interest response')
    const {
        trigger_id,
        team: {id: slackTeamId},
        token,
    } = payload
    let body = {
        "token": SLACK_OAUTH_TOKEN,
        "trigger_id": trigger_id,
        "dialog": {
            "callback_id": "not_not_form",
            "title": "Request a Ride",
            "submit_label": "Request",
            "elements": [
                {
                    "type": "text",
                    "label": "Pickup Location",
                    "name": "loc_origin"
                },
                {
                    "type": "text",
                    "label": "Dropoff Location",
                    "name": "loc_destination"
                }
            ]
        }
    }
    // let queryString = qs.stringify(body)
    // console.log('dialog query string', queryString)

    let slackTeamQuery = new Parse.Query(SLACK_TEAM_CLASSNAME)
    slackTeamQuery.equalTo('teamId', slackTeamId)
    let slackTeam = await slackTeamQuery.first()
    console.log('found team', slackTeam)
    let accessToken = slackTeam.get('accessToken')

    let dialogResponse = await axios.post('https://slack.com/api/dialog.open', body, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
    console.log('dialog response', dialogResponse.data)
    return {
        replace_original: false,
        text: JSON.stringify(dialogResponse.data)
    }
}

function getInboundIdFromCallbackId(callback_id=""){
    const [, inboundId] = callback_id.split('::')
    return inboundId;
}

async function buildSimpleInterestResponse(interestLevel, payload){
    const {
        callback_id,
        user: {id: slackUserId, name: userName},
        original_message,
    } = payload

    const inboundId = getInboundIdFromCallbackId(callback_id)

    console.log('inboundId', inboundId)
    let interestLevelDisplayText = getInterestLevelDisplayText(interestLevel)
    let inboundQuery = new Parse.Query(INBOUND_CLASSNAME)
    let inbound = await inboundQuery.get(inboundId)
    if (!inbound){
        return {
            'response_type': 'ephemeral',
            'replace_original': false,
            'text': 'this inbound is no longer valid'
        }
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

    return {
        response_type: 'ephemeral',
        replace_original: true,
        text: '',
        attachments: [
            opportunityInfo,
            actionsAttachment
        ],
    }
}

export async function handleInboundInterestLevel(payload){
    const {
        actions,
        // callback_id,
        // team: {id: teamId},
        // channel: {id: channelId},
        // user: {id: slackUserId, name: userName},
        // original_message: original_message,
        // response_url,
    } = payload

    const interestLevel = actions[0].value
    let response = {}
    console.log('interest level', interestLevel)
    switch(interestLevel){
        case NO:
        case YES:
             response = await buildSimpleInterestResponse(interestLevel, payload)
            break;
        case NOT_NOW:
            response = await buildDialogInterestResponse(interestLevel, payload)
            break;
    }
    return response

}