import {Parse} from 'parse/node'
// import Raven from 'raven'
import {Config} from 'util/variables'
import {VENDOR_CLASSNAME} from 'models/ModelConstants'
import VendorInfoRequest from 'models/VendorInfoRequest'
import {getDomainFromEmail} from 'util/emailUtil'
import {sendTemplate, VENDOR_INFO_REQUEST_TEMPLATE, NOTIFICATIONS_EMAIL} from '../email/emailSender'
import {getCompanyName, getFullName} from '../util/DataUtil';
import {ENV, isProd} from 'util/Environment';

export default function initialize() {
    Parse.Cloud.define('requestVendorInfo', async (request, response) => {
        try {
            let user = request.user
            let {vendorEmail, vendorId} = request.params
            if (!user){
                return response.error({message: 'User must be logged in to request vendor info'})
            }

            if (!vendorEmail & !vendorId){
                return response.error({
                    message: 'You must provide either a senderEmail or a vendorId'
                })
            }

            let config = await Parse.Config.get()
            let oneRoostTeamId = config.get(Config.inboundProductSlackTeamId)
            let vendor = null
            if (vendorId){
                let vendorQuery = new Parse.Query(VENDOR_CLASSNAME)
                vendorQuery.include('inbound')
                vendor = await vendorQuery.get(vendorId)
            } else {
                console.warn('no vendorId provided, looking up by email')
                let domain = getDomainFromEmail(vendorEmail)
                let vendorQuery = new Parse.Query(VENDOR_CLASSNAME)
                vendorQuery.include('inbound')
                vendorQuery.equalTo('emailDomains', domain)
                vendor = await vendorQuery.first()
            }

            if (!vendor){
                console.warn('No vendor found for given vendorId or senderEmail', vendorId, vendorEmail)
                // Raven.captureMessage(`No vendor found for given vendorId=${vendorId} or senderEmail=${vendorEmail}`)
            }

            let vendorInfoRequest = new VendorInfoRequest()
            vendorInfoRequest.set({
                vendor,
                vendorEmail,
                requestedBy: user,
                requestedByEmail: user.get('username'),
                requestForwarded: false,
            })
            let savedRequest = await vendorInfoRequest.save()

            try{
                sendTemplate({
                    to: [vendorEmail],
                    from: NOTIFICATIONS_EMAIL,
                    templateName: VENDOR_INFO_REQUEST_TEMPLATE,
                    data: {
                        requestedByName: getFullName(user),
                        requestedByCompany: getCompanyName(user),
                        oneroostTeamId: oneRoostTeamId,
                    }
                }).then(result => {
                    console.log('successfully sent vendor request email!', result)
                })
            } catch(e){
                console.error('unexpectd error occurred sending VendorInfoRequest email', e);
            }

            return response.success({
                oneRoostTeamId,
                vendorEmail,
                vendor,
                vendorInfoRequest: savedRequest,
            })
        }
        catch (e) {
            console.error('requestVendorInfo Something unexpected went wrong', e)
            // Raven.captureException(e)
        }
    })
}