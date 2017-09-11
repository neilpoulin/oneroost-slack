import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import {alias} from 'react-chrome-redux';
import logger from './middleware/logger'
import reducers from './../ducks'
import {aliases as userAliases} from './../ducks/user'
import {aliases as gmailAliases} from './../ducks/gmail'
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly'

const aliases = {
    ...userAliases,
    ...gmailAliases,
}
let middlewares = [alias(aliases),
    thunkMiddleware,
    logger
]

const store = createStore(reducers, composeWithDevTools(applyMiddleware(...middlewares)));
export default store;
