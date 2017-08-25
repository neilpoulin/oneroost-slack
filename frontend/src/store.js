import reducers from './reducers'
import thunkMiddleware from 'redux-thunk'
import immutableAction from './middleware/immutable-action'
import { createStore, applyMiddleware, compose } from 'redux'

export const getStore = preloadedState => {
    let middlewares = [thunkMiddleware, immutableAction]
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(reducers, composeEnhancers(applyMiddleware(...middlewares)));
    return store
}
