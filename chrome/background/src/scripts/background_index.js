import {wrapStore} from 'react-chrome-redux'
import store from 'store/configureStore'
import {
    updateServerConfigs,
} from 'ducks/config'
import {SET_SERVER_URL,} from 'actions/config'

const oneroostDomain = process.env.HOSTNAME || 'https://dev.oneroost.com'
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
