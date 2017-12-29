import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';
import PopupView from 'PopupView';

const proxyStore = new Store({
    portName: 'oneroost'
});

proxyStore.ready().then(() => {
    render(
        <Provider store={proxyStore}>
            <PopupView/>
        </Provider>
        , document.getElementById('popup_app'))
})
