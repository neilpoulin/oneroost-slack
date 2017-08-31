import { combineReducers } from 'redux'
import thread from './thread'
import user from './user'
import brandPages from './brandPages'
import gmail from './gmail'
import config from './config'

const reducers = combineReducers({
    brandPages,
    config,
    gmail,
    thread,
    user,
})

export default reducers
