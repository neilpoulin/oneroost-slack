import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import ThreadView from 'ThreadView';
import {Store} from 'react-chrome-redux'

const store = new Store({
    portName: 'oneroost'
});

const anchor = document.createElement('div');
anchor.className = 'ThreadViewApp'

store.ready().then(() => {
    render(<Provider store={store} className="">
            <ThreadView/>
        </Provider>,
        anchor)

    return anchor
})

export default anchor;
