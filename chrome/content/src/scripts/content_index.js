import {Store} from 'react-chrome-redux'
import Kefir from 'kefir'
import Raven from 'raven-js'
import {
    SET_SUBJECT,
    SET_BODY,
    SET_SENDER,
} from 'actions/thread'
import {FIND_VENDOR_BY_EMAIL_ALIAS} from 'actions/vendor'
import {
    RESET_USER_REDIRECT
} from 'actions/gmail'
import {composeViewHandler, handleRedirectClick} from 'RedirectButtonController'
import {threadViewHandler} from 'ThreadViewController'
import {getVendorByEmail} from 'selectors/vendors'
import * as RedirectDropdownApp from "./components/app/RedirectDropdownApp";

const manifest = chrome.runtime.getManifest()

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

store.ready().then(() => {
    let config = store.getState().config
    Raven.config('https://742ac732418c4de7bd0e22903a537a8e@sentry.io/264134', {
        release: manifest.version,
        environment: config.ENV
    }).install()

    Raven.context(() => initialize())
})

function initialize(){
    Promise.all([loadSDK, storeReady]).then(function ([sdk, isReady]) {
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
                            let unsubscribeEmail = store.subscribe(() => {
                                vendor = getVendorByEmail(store.getState(), email)
                                if (vendor) {
                                    let title = `${vendor.roostRating ? vendor.roostRating : 'N/A'}`
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
                            let title = `${vendor.roostRating ? vendor.roostRating : 'N/A'}`
                            return resolve({
                                title,
                                iconUrl: smallIconUrl
                            })
                        }
                    } else {
                        return resolve({
                            title: 'N/A',
                            iconUrl: smallIconUrl,
                        })
                    }
                } catch (e) {
                    Raven.captureException(e)
                    return reject(e)
                }
            })

            threadRow.addLabel(Kefir.fromPromise(labelPromise))

        })

        sdk.Toolbars.registerThreadButton({
            title: 'OneRoost',
            iconUrl: smallIconUrl,
            hasDropdown: true,
            hideFor: (routeView) => {
                return false
            },
            // onClick: ({selectedThreadViews = [], selectedThreadRowViews = []}) => {
            // selectedThreadViews.forEach(threadView => {
            //     threadViewHandler(threadView, store)
            // })
            // console.warn('thread button click not implemented')
            // }
            onClick: ({selectedThreadViews = [], selectedThreadRowViews = [], dropdown}) => {
                console.log('handling click')
                // selectedThreadRowViews[0].get
                let contacts = selectedThreadRowViews.length > 0 ?  selectedThreadRowViews[0].getContacts() : []
                if (contacts.length > 0) {
                    store.dispatch({type: SET_SENDER, payload: contacts[0]})
                    //NOTE: you can't set the text or subject of the email in composeView unless you want the dropdown to close
                    dropdown.setPlacementOptions({
                        position: 'top',
                    })

                    RedirectDropdownApp.fromElement(dropdown.el).then(() => {
                        console.log('registered the React component')
                    })
                }
            }
        })

        sdk.Conversations.registerThreadViewHandler(function (threadView) {
            // dispatch({type: RESET_THREAD})
            threadViewHandler(threadView, store)
        });

        sdk.Conversations.registerMessageViewHandler(function (messageView) {
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
    })
}