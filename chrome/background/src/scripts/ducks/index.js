import { combineReducers } from 'redux'
import thread from './thread'
import user from './user'
import gmail from './gmail'
import config from './config'
import vendors from './vendors'

const reducers = combineReducers({
    config,
    gmail,
    thread,
    user,
    vendors,
})

export default reducers
