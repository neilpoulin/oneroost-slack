import {wrapStore} from 'react-chrome-redux'
import store from 'store/configureStore'
import Parse from 'parse'
import {loadCachedUser} from 'ducks/user'
import {
    SET_SERVER_URL,
    loadServerConfigs,
} from 'ducks/config'

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

store.dispatch(loadServerConfigs()).then(configs => {
    console.log(configs)
    console.log('NODE_ENV', process.env.NODE_ENV)
    Parse.initialize(configs.PARSE_APP_ID);
    Parse.serverURL = configs.PARSE_PUBLIC_URL;
    store.dispatch(loadCachedUser())
})
