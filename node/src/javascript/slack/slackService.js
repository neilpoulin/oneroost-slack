import {WebClient} from '@slack/client'
import {SLACK_OAUTH_TOKEN} from 'util/Environment'
import axios from 'axios'
import qs from 'qs'
import Timeout from 'util/Timeout'
import SlackTeam from 'models/SlackTeam'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'
import Parse from 'parse/node'

const web = new WebClient(SLACK_OAUTH_TOKEN)

export function postToChannel(channelId, message){
    console.log('posting to channel ', channelId)
    web.chat.postMessage(channelId, message, function(err, res) {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Message sent to channel');
        }
    });
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
        console.log('successfully created channel', data)
    }).catch(error => console.error(error))
}

export async function getChannelInfo(channelId){
    console.log('getting channel info')
    return new Timeout((resolve, reject) => {
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
        let channelInfo = await getChannelInfo(channelId)
        let {channel} = channelInfo
        console.log('saving channel ' + channelId + ' as ' + (selected ? 'selected' : 'not-selected') + ' for  teamId = ' + teamId )
        let saved = await createOrUpdateTeam(teamId, channel, selected);
        return saved
    } catch (e){
        console.error('Failed to save the slack team: ', e)
        throw e
    }
}

export async function getSlackTeamByTeamId(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    query.equalTo('teamId', teamId)
    let result = await query.first()
    return result
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

    let slackTeam = new SlackTeam(teamId)
    slackTeam.set('name', 'Test Name')

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
