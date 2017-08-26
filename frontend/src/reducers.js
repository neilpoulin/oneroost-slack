import { combineReducers } from 'redux'
import login from './ducks/login'
import config from './ducks/config'
import channels from './ducks/channels'

const reducers = combineReducers({
    channels,
    config,
    login
})

export default reducers
