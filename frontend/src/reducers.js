import { combineReducers } from 'redux'
import user from './ducks/user'
import config from './ducks/config'
import slack from './ducks/slack'
import inbound from './ducks/inbound'
import homePage from './ducks/homePage'
import basePage from './ducks/basePage'
import payment from './ducks/payment'

const reducers = combineReducers({
    basePage,
    config,
    inbound,
    homePage,
    payment,
    slack,
    user
})

export default reducers
