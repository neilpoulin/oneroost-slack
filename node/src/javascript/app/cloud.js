import {Parse} from 'parse/node'
import {
    getChannels,
} from 'slack/slackService'

export function initialize(){
    console.log('setting up cloud functions')
    Parse.Cloud.define('refreshSlackChannels', async function(request, response) {
        try{
            console.log('attempting to run cloud function refreshSlackChannels')
            let user = request.user
            if (!user){
                return response.error({
                    status: 401,
                    message: 'You must be logged in to perform this function'
                })
            }
            const accessToken = user.get('authData').slack.access_token
            let {channels} = await getChannels(accessToken)
            let slackTeam = user.get('slackTeam')
            if( slackTeam ){
                slackTeam.setChannels(channels)
                slackTeam.save()
            }
            console.log('channels: ', channels)
            return response.success({
                channels,
            })
        } catch (e){
            console.error('Error running refreshSlackChannels', e)
            return response.error({
                message: 'Failed to run cloud code: refreshSlackChannels',
                error: e
            })
        }
    })
    console.log('added refreshSlackChannels to cloud code')
}
