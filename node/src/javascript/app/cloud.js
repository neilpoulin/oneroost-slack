import {Parse} from 'parse/node'
import {
    getChannels,
    postToChannel,
} from 'slack/slackService'
import Inbound from 'models/Inbound'

const roostOrange = '#ef5b25'

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

    Parse.Cloud.define('submitInboundProposal', async function (request, response) {
        try{
            console.log('attempting to run cloud function submintInboundProposal')
            let inboundId = request.params.inboundId
            let inbound = new Inbound()
            inbound.id = inboundId
            await inbound.fetch()
            if (!inbound){
                return response.error({
                    message: 'no Inbound was found'
                })
            }

            console.log('fetched inbound', inbound.toJSON())
            let team = inbound.get('slackTeam')
            await team.fetch()
            let inboundChannelId = inbound.get('channelId')
            if (team.get('selectedChannels').indexOf(inboundChannelId) !== -1){
                let messageInfo = buildSubmitMessage(inbound)
                await postToChannel(inboundChannelId, messageInfo.message, messageInfo.payload)
                return response.success({
                    message: 'Successfully posted message'
                })
            }

        } catch (e){
            console.error('something unexpected happened running submitInboundProposal', e)
            return response.error({
                message: 'failed to process request'
            })
        }
    })
}

function buildSubmitMessage(inbound){
    let message = `${inbound.get('fullName')} at ${inbound.get('companyName')} has submitted a proposal`

    let fields = [
        {
            title: 'Company',
            value: inbound.get('companyName'),
            short: true
        },
        {
            title: 'Name',
            value: inbound.get('fullName'),
            short: true
        },
        {
            title: 'Email',
            value: inbound.get('email'),
            short: true,
        },
        {
            title: 'Phone Number',
            value: inbound.get('phoneNumber'),
            short: true
        },
        {
            title: 'Elevator Pitch',
            value: inbound.get('elevatorPitch'),
        },
        {
            title: 'Relevancy',
            value: inbound.get('relevancy'),
        },
        {
            title: 'Tags',
            value: inbound.get('tags').join(', ')
        }
    ];

    inbound.get('testimonials').forEach(testimonial => {
        fields.push({
            title: `${testimonial.customerName} Testimonial`,
            value: testimonial.comment
        })
    })


    let payload = {
        'attachments': [
            {
                'text': 'Are you interested?',
                'fallback': 'You are unable to set your company\'s interest level',
                'callback_id': `interest_level::${inbound.id}`,
                'color': roostOrange,
                'attachment_type': 'default',
                'fields': fields,
                'actions': [
                    {
                        'name': 'interest',
                        'text': 'Yes!',
                        'type': 'button',
                        'style': 'primary',
                        'value': 'YES'
                    },
                    {
                        'name': 'interest',
                        'text': 'Not Right Now',
                        'type': 'button',
                        'style': 'default',
                        'value': 'NOT_NOW'
                    },
                    {
                        'name': 'interest',
                        'text': 'No Way',
                        'style': 'danger',
                        'type': 'button',
                        'value': 'NO'
                    }
                ]
            }
        ]
    }
    return {payload, message}
}
