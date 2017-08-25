import {WebClient} from '@slack/client'
import {SLACK_OAUTH_TOKEN} from './../Environment'
import axios from 'axios'
import qs from 'qs'

const web = new WebClient(SLACK_OAUTH_TOKEN)

export function postToChannel(channelId, message){
    console.log('slack oauth token', SLACK_OAUTH_TOKEN)
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
