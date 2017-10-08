import {Store} from 'react-chrome-redux'
import {
    SET_SUBJECT,
    SET_BODY,
    SET_SENDER,
} from 'actions/thread'
import {
    RESET_USER_REDIRECT
} from 'actions/gmail'
import {composeViewHandler} from 'RedirectButtonController'

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
    if(store.getState().user.email !== currentEmail){
        console.log('not the current user, exiting: ', currentEmail)
        return;
    }

    sdk.Compose.registerComposeViewHandler((composeView) => {
        composeViewHandler(composeView, store)
    });

    sdk.Conversations.registerThreadViewHandler(function(threadView){
        // dispatch({type: RESET_THREAD})
        const subject = threadView.getSubject()
        dispatch({type: SET_SUBJECT, payload: subject})
    });

    sdk.Conversations.registerMessageViewHandler(function(messageView){
        const $messageBody = messageView.getBodyElement();
        const sender = messageView.getSender();

        dispatch({type: SET_BODY, payload: $messageBody.innerText})
        dispatch({type: SET_SENDER, payload: sender})
        dispatch({type: RESET_USER_REDIRECT})
    })
});
