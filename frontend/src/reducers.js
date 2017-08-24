import { combineReducers } from 'redux'
import login from './ducks/login'
import config from './ducks/config'

const reducers = combineReducers({
    config,
    login
})

export default reducers
