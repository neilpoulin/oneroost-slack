import {Store} from 'react-chrome-redux'
import Kefir from 'kefir'
import {
    SET_SUBJECT,
    SET_BODY,
    SET_SENDER,
} from 'actions/thread'
import {FIND_VENDOR_BY_EMAIL_ALIAS} from 'actions/vendor'
import {
    RESET_USER_REDIRECT
} from 'actions/gmail'
import {composeViewHandler} from 'RedirectButtonController'
import {threadViewHandler} from 'ThreadViewController'
import ThreadView from 'ThreadViewApp'
import {getVendorByEmail} from 'selectors/vendors'

const smallIconUrl = chrome.runtime.getURL('images/logo30x30.png')

const store = new Store({
    portName: 'oneroost'
});

const loadSDK = InboxSDK.load('2', 'sdk_oneroost_f06bd06a99', {
    appName: 'OneRoost',
    appIconUrl: chrome.runtime.getURL('images/oneroost_logo_square_128x128.png')
})
const storeReady = store.ready()
let dispatch = store.dispatch

Promise.all([loadSDK, storeReady]).then(function([sdk, isReady]){
    console.log('SDK and store are loaded')
    dispatch = store.dispatch
    // let oneroostRoute = sdk.Router.createLink(oneroostRouteId, {})
    // console.log("oneroostRoute", oneroostRoute)
    // the SDK has been loaded, now do something with it!
    const currentEmail = sdk.User.getEmailAddress()

    sdk.Compose.registerComposeViewHandler((composeView) => {
        composeViewHandler(composeView, store)
    });

    sdk.Lists.registerThreadRowViewHandler((threadRow) => {
        // make a stream, see example https://gist.github.com/omarstreak/8f9590514f326940e710
        // let labelStream = Kefir.fromPromise()
        let labelPromise = new Promise((resolve, reject) => {
            try {
                // count = count + 1
                let contacts = threadRow.getContacts()
                if (contacts.length > 0) {
                    let {emailAddress: email} = contacts[0]
                    let vendor = getVendorByEmail(store.getState(), email)
                    if (!vendor) {
                        console.log('no vendor found for email ', email)
                        let unsubscribeEmail = store.subscribe(() => {
                            vendor = getVendorByEmail(store.getState(), email)
                            console.log('vendor: ', vendor)
                            if (vendor) {
                                let title = `${vendor.roostRating ? vendor.roostRating : 'N/A'}`
                                console.log('found the vendor, unsubscribing')
                                unsubscribeEmail()
                                return resolve({
                                    title,
                                    iconUrl: smallIconUrl
                                })
                            }
                        })
                        store.dispatch({
                            type: FIND_VENDOR_BY_EMAIL_ALIAS,
                            email
                        })
                    } else {
                        console.log('vendor found for email ', email)
                        let title = `${vendor.roostRating ? vendor.roostRating : 'N/A'}`
                        resolve({
                            title,
                            iconUrl: smallIconUrl
                        })
                    }
                } else {
                    resolve({
                        title: 'N/A',
                        iconUrl: smallIconUrl,
                    })
                }
            } catch(e) {
                console.error('something unexpected went wrong getting vendor info', e)
                reject(e)
            }
        })

        threadRow.addLabel(Kefir.fromPromise(labelPromise))

    })

    sdk.Toolbars.registerThreadButton({
        title: 'OneRoost',
        iconUrl: smallIconUrl,
        onClick: ({selectedThreadViews=[], selectedThreadRowViews=[]}) => {
            // selectedThreadViews.forEach(threadView => {
            //     threadViewHandler(threadView, store)
            // })
            console.warn('thread button click not implemented')
        }
    })

    sdk.Conversations.registerThreadViewHandler(function(threadView){
        // dispatch({type: RESET_THREAD})
        threadViewHandler(threadView, store)
    });

    sdk.Conversations.registerMessageViewHandler(function(messageView){
        const $messageBody = messageView.getBodyElement();
        const sender = messageView.getSender();

        dispatch({type: SET_BODY, payload: $messageBody.innerText})
        dispatch({type: SET_SENDER, payload: sender})
        dispatch({
            type: FIND_VENDOR_BY_EMAIL_ALIAS,
            email: sender.emailAddress
        })
        dispatch({type: RESET_USER_REDIRECT})
    })
});
