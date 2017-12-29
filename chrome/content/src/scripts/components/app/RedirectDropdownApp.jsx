import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import RedirectDropdownView from 'RedirectDropdownView'
import {Store} from 'react-chrome-redux'
const store = new Store({
    portName: 'oneroost'
});

export const fromElement = ($el, composeView) => {
    return doRender($el, composeView)
}

function doRender($el, composeView){
    return store.ready().then(() => {
        render(<Provider store={store} className="">
            <RedirectDropdownView composeView={composeView}/>
        </Provider>,
        $el)
        return $el
    })
}
