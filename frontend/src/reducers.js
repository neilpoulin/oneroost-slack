import { combineReducers } from 'redux'
import user from './ducks/user'
import config from './ducks/config'
import slack from './ducks/slack'
import inbound from './ducks/inbound'

const reducers = combineReducers({
    config,
    inbound,
    slack,
    user
})

export default reducers
