import {wrapStore} from 'react-chrome-redux'
import store from 'store/configureStore'
import {
    updateServerConfigs,
} from 'ducks/config'
import {SET_SERVER_URL, } from 'actions/config'
import {
    syncTeamRedirects
} from 'ducks/gmail'

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

store.dispatch(updateServerConfigs())

//poll for new changes every 10 minutes
window.setInterval(() => {
    try{
        store.dispatch(syncTeamRedirects())
        store.dispatch(updateServerConfigs())
    } catch (e){
        console.error('Failed to execute polling', e)
    }
}, 1000 * 60 * 10)
