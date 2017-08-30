import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import {alias} from 'react-chrome-redux';
// import logger from './middleware/logger'
import reducers from './../ducks'
import {aliases as userAliases} from './../ducks/user'
import {aliases as brandPagesAliases} from './../ducks/brandPages'
import {aliases as gmailAliases} from './../ducks/gmail'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const aliases = {
    ...userAliases,
    ...brandPagesAliases,
    ...gmailAliases,
}
let middlewares = [alias(aliases),
    thunkMiddleware, 
    // logger
]

const store = createStore(reducers, composeEnhancers(applyMiddleware(...middlewares)));
export default store;
