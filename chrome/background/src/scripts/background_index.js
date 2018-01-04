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
import {loadCachedUser} from 'ducks/user'
import {loadTeamConfigs} from 'ducks/config'

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

const dispatch = store.dispatch

store.dispatch(updateServerConfigs()).then(configs => {
    Raven.config('https://742ac732418c4de7bd0e22903a537a8e@sentry.io/264134', {
        environment: configs.ENV
    }).install()

    window.onunhandledrejection = function(evt) {
        Raven.captureException(evt.reason);
    };

    if (store.getState().user.userId){
        console.log('user is logged in, fetching user info')
        store.dispatch(syncTeamRedirects())
        dispatch(loadTeamConfigs())
    } else {
        console.log('user is not logged in, attempting to fetch cached user')
        dispatch(loadCachedUser())
    }
    console.log('loading non-user specific items')
    store.dispatch(loadAllVendors())
}).catch(error => {
    console.log('Something went wrong while fetching configs', error)
})

//poll for new changes every 10 minutes
window.setInterval(() => {
    try{
        if (store.getState().user.userId){
            store.dispatch(syncTeamRedirects())
        }
        store.dispatch(updateServerConfigs())
        store.dispatch(loadAllVendors())
    } catch (e){
        console.error('Failed to execute polling', e)
    }
}, 1000 * 60 * 10)