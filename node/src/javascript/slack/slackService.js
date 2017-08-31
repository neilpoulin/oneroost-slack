import {WebClient} from '@slack/client'
import {SLACK_OAUTH_TOKEN} from './../Environment'
import axios from 'axios'
import qs from 'qs'
import {SLACK_CHANNEL_CLASSNAME} from './../models/ModelConstants'

const web = new WebClient(SLACK_OAUTH_TOKEN)

export function postToChannel(channelId, message){
    console.log('posting to channel ', channelId)
    web.chat.postMessage(channelId, message, function(err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent: ', res);
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

export async function saveChannel(teamId, channelId, selected=true){
    console.log('saving channel ' + chanelId + ' as ' + (selected ? 'selected' : 'not-selected') + ' for  teamId = ' + teamId )

}
