import {WebClient} from '@slack/client'
import {SLACK_OAUTH_TOKEN} from './slackConstants'
import * as slackConfig from './slackConstants'

const web = new WebClient(SLACK_OAUTH_TOKEN)
console.log('slackConfig',slackConfig)

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
