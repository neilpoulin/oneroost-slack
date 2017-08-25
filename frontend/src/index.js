import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/containers/App';
import { Provider } from 'react-redux'
import {getStore} from './store'
import {loadUser} from 'ducks/login'
import {loadServerConfigs} from 'ducks/config'
import Parse from 'parse'

const store = getStore()

store.dispatch(loadUser())
// let unsubscribe =
store.subscribe(() => {

})

store.dispatch(loadServerConfigs()).then(({PARSE_PUBLIC_URL, PARSE_APP_ID}) => {
    Parse.initialize(PARSE_APP_ID);
    Parse.serverUrl = PARSE_PUBLIC_URL
    console.log(Parse.User.current())

    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>, document.getElementById('root'));
})
