import { combineReducers } from 'redux'
import user from './ducks/user'
import config from './ducks/config'
import slack from './ducks/slack'

const reducers = combineReducers({
    config,
    slack,
    user
})

export default reducers
