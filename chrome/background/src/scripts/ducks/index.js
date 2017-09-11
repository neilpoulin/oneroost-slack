import { combineReducers } from 'redux'
import thread from './thread'
import user from './user'
import gmail from './gmail'
import config from './config'

const reducers = combineReducers({
    config,
    gmail,
    thread,
    user,
})

export default reducers
