import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import {alias} from 'react-chrome-redux';
import logger from './middleware/logger'
import reducers from './../ducks'
import {aliases as userAliases} from './../ducks/user'
import {aliases as gmailAliases} from './../ducks/gmail'
import {aliases as configAliases} from './../ducks/config'
import {aliases as vendorAliases} from './../ducks/vendor'
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly'

const aliases = {
    ...userAliases,
    ...gmailAliases,
    ...configAliases,
    ...vendorAliases,
}
let middlewares = [alias(aliases),
    thunkMiddleware,
    logger
]

const store = createStore(reducers, composeWithDevTools(applyMiddleware(...middlewares)));
export default store;
