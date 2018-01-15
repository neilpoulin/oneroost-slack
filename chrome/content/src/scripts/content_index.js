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
import * as RedirectDropdownApp from './components/app/RedirectDropdownApp'
import {roostOrange} from 'util/variables'
import {showRoostInfoForEmail} from './selectors/config';

const manifest = chrome.runtime.getManifest()

const smallIconUrl = chrome.runtime.getURL('images/logo30x30.png')
const smallIconWhiteUrl = chrome.runtime.getURL('images/logo30x30_white.png')

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
        const configState = store.getState()
        sdk.Lists.registerThreadRowViewHandler((threadRow) => {

            const labelState  = store.getState()
            let labelPromise = new Promise((resolve, reject) => {
                try {
                    // count = count + 1
                    let contacts = threadRow.getContacts()
                    if (contacts.length > 0) {
                        let {emailAddress: email} = contacts[0]

                        let showLabel = showRoostInfoForEmail(email, configState)
                        if (!showLabel){
                            return reject('Not showing label for sender')
                        }


                        // we can assume the vendors are in memory already since we fetch them all after login
                        let vendor = getVendorByEmail(labelState, email)

                        if (vendor && vendor.objectId){
                            let title = `${vendor.roostRating ? vendor.roostRating : 'N/A'}`
                            if (vendor.roostRating){
                                return resolve({
                                    title,
                                    foregroundColor: 'white',
                                    backgroundColor: roostOrange,
                                    iconUrl: smallIconWhiteUrl
                                })
                            } else {
                                // return reject('No roost rating found')
                                return resolve({
                                    title: 'N/A',
                                    iconUrl: smallIconUrl,
                                })
                            }

                        } else {
                            return reject('no vendor found')
                            // return resolve({
                            //     title: 'N/A',
                            //     iconUrl: smallIconUrl,
                            // })
                        }
                    } else {
                        return reject('no vendor found')
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
            positions: ['THREAD', 'ROW'],
            onClick: ({selectedThreadViews = [], selectedThreadRowViews = [], dropdown}) => {
                console.log('handling click')
                // selectedThreadRowViews[0].get
                let contacts = selectedThreadRowViews.length > 0 ?  selectedThreadRowViews[0].getContacts() : []
                contacts = [...contacts, selectedThreadViews.length > 0 ? selectedThreadViews[0].getMessageViewsAll()[0].getSender() : []]
                if (contacts.length > 0) {
                    store.dispatch({type: SET_SENDER, payload: contacts[0]})
                    store.dispatch({
                        type: FIND_VENDOR_BY_EMAIL_ALIAS,
                        email: contacts[0].emailAddress
                    })
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