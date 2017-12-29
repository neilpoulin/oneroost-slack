import {Parse} from 'parse/node'
import {
    getChannels,
    postToChannel,
} from 'slack/slackService'
import Inbound from 'models/Inbound'
import Timeout from 'util/Timeout'
import {USER_CLASSNAME, REDIRECT_CLASSNAME} from 'models/ModelConstants'
import Redirect from 'models/Redirect'
import AWS from 'aws-sdk'
import {
    DOCUMENT_BUCKET
} from 'util/Environment'
import uuid from 'uuid'
import {
    handleRequest as handleSubscription,
    handleVendorRequest as handleVendorSubscription,
    getSubscriptionById,
    cancelSubscription,
    getUpcomingInvoice
} from './subscriptionService';

import requestVendorInfo from 'cloud/requestVendorInfo'
import {roostOrange} from 'util/variables'

var s3Client = new AWS.S3({computeChecksums: true, signatureVersion: 'v4'}); // this is the default setting

export function initialize(){
    console.log('setting up cloud functions')
    //adding imported cloud functions
    requestVendorInfo()

    Parse.Cloud.define('cancelSubscription', async function(request, response){
        let user = request.user
        if (!user){
            return response.error({message: 'You must be logged in to create a subscription'})
        }
        let slackTeam = await user.get('slackTeam').fetch()
        let subscriptionId = slackTeam.get('stripeSubscriptionId')
        if (!subscriptionId){
            return response.error({message: 'The team does not have an active subscription, nothing to cancel'})
        }
        let confirmation = await cancelSubscription(subscriptionId)
        if(confirmation){
            return response.success(confirmation)
        }
    })

    Parse.Cloud.define('getUpcomingInvoice', async function(request, response){
        console.log('fetching upcoming invoice')
        let user = request.user
        if (!user){
            console.log('no user present on request, exiting')
            return response.error({message: 'You must be logged in to create a subscription'})
        }

        let slackTeam = await user.get('slackTeam').fetch()
        let customerId = slackTeam.get('stripeCustomerId')

        if (!customerId){
            console.log('no customer id found on slackTeam, exiting')
            return response.success({message: 'The slackTeam does not have an active customer id, nothing to fetch'})
        }
        console.log('fetching upcoming invoice for stripe customer id = ' + customerId)
        let upcoming = await getUpcomingInvoice(customerId)
        console.log('found upcoming invoice, returning', upcoming)
        return response.success(upcoming)
    })

    Parse.Cloud.define('getSubscription', async function(request, response){
        let user = request.user
        if (!user){
            return response.error({message: 'You must be logged in to create a subscription'})
        }
        let slackTeam = await user.get('slackTeam').fetch()
        let subscriptionId = slackTeam.get('stripeSubscriptionId')
        if (!subscriptionId){
            return response.success({})
        }
        let subscription = await getSubscriptionById(subscriptionId)
        return response.success(subscription)
    })

    Parse.Cloud.define('subscribe', async function (request, response){
        let user = request.user
        if (!user){
            return response.error({message: 'You must be logged in to create a subscription'})
        }
        user = await user.fetch()
        let slackTeam = await user.get('slackTeam').fetch()
        let {planId, token, couponCode} = request.params
        return handleSubscription({user, slackTeam, planId, token, couponCode}).then(success => {
            response.success(success)
        }).catch(error => {
            response.error(error)
        })
    })

    Parse.Cloud.define('subscribeVendor', async function (request, response){
        let {planId, token, couponCode, email, inboundId} = request.params
        return handleVendorSubscription({planId, token, couponCode, inboundId, email}).then(success => {
            response.success(success)
        }).catch(error => {
            response.error(error)
        })
    })

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
            // const accessToken = user.get('authData').slack.access_token
            await user.get('slackTeam').fetch()
            let slackTeam = user.get('slackTeam')
            try{
                let channels = await getChannels(slackTeam.get('accessToken'))
                console.log('got channels', channels)
                if( slackTeam ){
                    slackTeam.setChannels(channels)
                    slackTeam.save()
                }
                return response.success({
                    channels: channels || [],
                })

            } catch(e){
                console.warn('failed to get the channels', e);
                return response.success({
                    unauthorized: true,
                    code: 403,
                    message: 'User did not have permissions needed'
                })
            }

        } catch (e){
            console.error('Error running refreshSlackChannels', e)
            if ( e.code){
                response.status(e.code)
            }
            return response.error({
                message: 'Failed to run cloud code: refreshSlackChannels',
                error: e
            })
        }
    })
    console.log('added refreshSlackChannels to cloud code')

    Parse.Cloud.define('submitInboundProposal', async function (request, response) {
        new Timeout(async (resolve, reject) => {
            try{
                console.log('attempting to run cloud function submintInboundProposal')
                let inboundId = request.params.inboundId
                let inbound = new Inbound()
                inbound.id = inboundId
                await inbound.fetch()
                if (!inbound){
                    reject({
                        message: 'no Inbound was found'
                    })
                }

                console.log('fetched inbound', inbound.toJSON())
                let team = inbound.get('slackTeam')
                await team.fetch()
                console.log('team fetched successfully')
                let inboundChannelId = inbound.get('channelId')
                if (team.get('selectedChannels').indexOf(inboundChannelId) !== -1){
                    let messageInfo = buildSubmitMessage(inbound)
                    await postToChannel(inboundChannelId, messageInfo.message, messageInfo.payload, team.get('accessToken'))
                    resolve({
                        message: 'Successfully posted message'
                    })
                }
                reject({
                    friendlyText: 'You must select a team to submit the proposal to.'
                })

            } catch (e){
                console.error('something unexpected happened running submitInboundProposal', e)
                reject({
                    message: 'failed to process request'
                })
            }
        }, 5000).then(body => {
            return response.success(body)
        }).catch(error => {
            return response.error({error})
        })
    })

    Parse.Cloud.define('getPresignedUploadUrl', async (request, response) => {
        new Timeout(async (resolve, reject) => {
            console.log(`getPresignedUploadUrl: params: ${request.params}`);
            const {filename, contentType, pathPrefix} = request.params
            const id = uuid.v4()
            const s3Key = `${pathPrefix}/${id}/${filename}`

            var params = {
                Bucket: DOCUMENT_BUCKET,
                Key: s3Key,
                ContentType: contentType
            };

            console.log('generating s3 key with params:', params);
            s3Client.getSignedUrl('putObject', params, (err, url) =>{
                if (err){
                    return reject({
                        error: err,
                        message: 'Failed to sign the url'
                    })
                }
                resolve({
                    signedUrl: url,
                    s3Key
                })
            });

        }, 2000).then(({signedUrl, s3Key}) => {
            return response.success({
                signedUrl,
                filePath: s3Key
            })
        }).catch(error => {
            return response.error(error)
        })
    })

    Parse.Cloud.define('teamExtensionConfig', async (request, response) => {
        Parse.Config.get().then(config => {
            let redirectMessage = config.get('redirectMessage')
            return response.success({
                redirectMessage
            })
        })
    })

    Parse.Cloud.define('logRedirect', async (request, response) => {
        new Timeout(async (resolve, reject) => {
            console.log('attempting to save the redirect')
            let user = request.user;
            if (!user){
                reject({message: 'user must be logged in to save filters'})
            }
            let userQuery = new Parse.Query(USER_CLASSNAME)
            userQuery.include('slackTeam')
            user = await userQuery.get(user.id)

            let slackTeam = user.get('slackTeam')

            const {
                senderName,
                senderEmail,
                blocked,
                destinationUrl
            } = request.params
            let redirectQuery = new Parse.Query(REDIRECT_CLASSNAME);
            redirectQuery.include('slackTeam')
            redirectQuery.include('createdBy')
            redirectQuery.equalTo('senderEmail', senderEmail)

            if (slackTeam){
                redirectQuery.equalTo('slackTeam', slackTeam)
            } else {
                redirectQuery.equalTo('createdBy', user)
            }

            let existingRedirect = await redirectQuery.first()
            if (existingRedirect){
                existingRedirect.set({
                    updatedBy: user,
                    blocked,
                    destinationUrl
                })
                let saved = await existingRedirect.save()
                resolve({success: 'successfully updated existing redirect', redirect: saved})
            }
            else {
                let redirect = new Redirect()
                redirect.set({
                    createdBy: user,
                    slackTeam,
                    senderName,
                    senderEmail,
                    blocked,
                    destinationUrl,
                    updatedBy: user,
                })
                let saved = await redirect.save()
                resolve({success: 'successfully saved new the redirect', redirect: saved})
            }

        }, 10000).then(body => {
            return response.success(body)
        }).catch(error => {
            return response.error({error})
        })
    })
}

function buildSubmitMessage(inbound){
    let message = ''

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
            title: 'Website',
            value: inbound.get('website'),
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
            title: 'Case Study',
            value: inbound.get('caseStudyUrl')
        },
        {
            title: 'Case Study',
            value: createSlackS3DownloadLink(inbound.get('caseStudyFilePath'))
        },
        {
            title: 'Pitch Materials',
            value: inbound.get('pitchDeckUrl')
        },
        {
            title: 'Pitch Materials',
            value: createSlackS3DownloadLink(inbound.get('pitchDeckFilePath'))
        },
        {
            title: 'Tags',
            value: inbound.get('tags').join(', ')
        }
    ];

    fields = fields.filter(field => !!field.value)

    inbound.get('testimonials').forEach(testimonial => {
        fields.push({
            title: `${testimonial.customerName} Testimonial`,
            value: testimonial.comment
        })
    })


    let payload = {
        'attachments': [
            {
                'text': '',
                'title': `${inbound.get('fullName')} at ${inbound.get('companyName')} has submitted a proposal`,
                'fallback': 'You are unable to set your company\'s interest level',
                'callback_id': `inbound::${inbound.id}`,
                'color': roostOrange,
                'attachment_type': 'default',
                'fields': fields,
                'mrkdwn_in': ['fields'],
                'actions': []
            },
            {
                'text': 'Are you interested?',
                'callback_id': `interest_level::${inbound.id}`,
                'color': roostOrange,
                'actions': [
                    {
                        'name': 'interest',
                        'text': 'Interested!',
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

export function createSlackS3DownloadLink(path){
    if (path){
        //TODO: use cloudfront and maybe sign urls
        let parts = path.split('/')
        let filename = parts[parts.length - 1]
        return  `<https://documents.oneroost.com/${path}|${filename}>`
    }
    return null
}
