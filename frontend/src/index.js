import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/containers/App';
import { Provider } from 'react-redux'
import {getStore} from './store'


const store = getStore()
// let unsubscribe =
store.subscribe(() => {

})


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById('root'));
