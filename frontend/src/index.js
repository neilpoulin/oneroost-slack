import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/containers/App';
import { Provider } from 'react-redux'
import {getStore} from './store'
import {loadUser} from 'ducks/user'
import {loadServerConfigs} from 'ducks/config'
import Parse from 'parse'
import {initialize as initializeAnalytics} from 'analytics'

const store = getStore()
// let unsubscribe =
store.subscribe(() => {

})

store.dispatch(loadServerConfigs())
    .then((config) => {
        const {PARSE_APP_ID, } = config
        Parse.initialize(PARSE_APP_ID);
        Parse.serverURL = window.location.origin + '/parse';
        store.dispatch(loadUser())
        let currentUser = Parse.User.current()
        console.log(currentUser)

        initializeAnalytics(config, Parse.User.current())

        ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>, document.getElementById('root'));
    })
