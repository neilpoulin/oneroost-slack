import {wrapStore} from 'react-chrome-redux'
import store from 'store/configureStore'
import {
    updateServerConfigs,
} from 'ducks/config'
import {SET_SERVER_URL, } from 'actions/config'
import {
    syncTeamRedirects
} from 'ducks/gmail'
import Raven from 'raven-js'
import {loadAllVendors} from 'ducks/vendors'

const oneroostDomain = process.env.HOSTNAME || 'https://www.oneroost.com'
console.log('ONEROOST DOMAIN = ' + oneroostDomain)
wrapStore(store, {
    portName: 'oneroost'
})

store.dispatch({
    type: SET_SERVER_URL,
    payload: {
        serverUrl: oneroostDomain
    }
})

store.dispatch(updateServerConfigs()).then(configs => {
    Raven.config('https://742ac732418c4de7bd0e22903a537a8e@sentry.io/264134', {
        environment: configs.ENV
    }).install()

    window.onunhandledrejection = function(evt) {
        Raven.captureException(evt.reason);
    };

    store.dispatch(loadAllVendors())
})

//poll for new changes every 10 minutes
window.setInterval(() => {
    try{
        store.dispatch(syncTeamRedirects())
        store.dispatch(updateServerConfigs())
    } catch (e){
        console.error('Failed to execute polling', e)
    }
}, 1000 * 60 * 10)