import { createStore, applyMiddleware, compose } from 'redux'
import {alias} from 'react-chrome-redux';
import reducers from './../ducks'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let middlewares = []

const store = createStore(reducers, composeEnhancers(applyMiddleware(...middlewares)));

export default store;
