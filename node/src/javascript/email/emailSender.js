import {ENV, isProd} from 'util/Environment';

var AWS = require('aws-sdk');
var SES = new AWS.SES({region: 'us-east-1'});

export const VENDOR_INFO_REQUEST_TEMPLATE = 'VendorInfoRequestTemplate'
export const NOTIFICATIONS_EMAIL = 'notifications@oneroost.com'

export function sendTemplate({to=[], bcc=[], from=NOTIFICATIONS_EMAIL, templateName, data}){
    return new Promise((resolve, reject) => {
        if (!templateName){
            return reject(new Error('You must provide a template name when sending a templated email'))
        }
        let toAddresses = isProd() ? to : `neil+${ENV}@oneroost.com`
        let bccAddresses = isProd() ? ['taylor@oneroost.com', 'neil@oneroost.com'] : bcc
        let params = {
            Destination: {
                BccAddresses: bccAddresses,
                ToAddresses: toAddresses,
            },
            Source: from,
            ReplyToAddresses: [from],
            TemplateData: JSON.stringify(data),
            Template: templateName
        }

        console.log('email template data', params)

        SES.sendTemplatedEmail(params, (error, data) => {
            if (error){
                console.error('Something went wrong sending email with params', params)
                return reject(error)
            }
            else {
                console.log('Sent email successfully', data)
                return resolve(data)
            }
        })
    })

}
