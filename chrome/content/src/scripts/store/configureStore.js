import { createStore, applyMiddleware } from 'redux'
import {alias} from 'react-chrome-redux'
import reducers from './../ducks'
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly'

let middlewares = []

const store = createStore(reducers, composeWithDevTools(applyMiddleware(...middlewares)));

export default store;
