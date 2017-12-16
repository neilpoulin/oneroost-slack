import { combineReducers } from 'redux'
import thread from './thread'
import user from './user'
import gmail from './gmail'
import config from './config'
import vendor from './vendor'

const reducers = combineReducers({
    config,
    gmail,
    thread,
    user,
    vendor,
})

export default reducers
