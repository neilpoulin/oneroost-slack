import ThreadViewApp from 'ThreadViewApp'
import {SET_SUBJECT} from 'actions/thread';

const iconUrl = chrome.runtime.getURL('images/logo30x30.png')

export function threadViewHandler(threadView, store){
    const subject = threadView.getSubject()
    store.dispatch({type: SET_SUBJECT, payload: subject})
    let {vendor: {
        companyName='Company X'
    }} = store.getState().vendor

    threadView.addSidebarContentPanel({
        el: ThreadViewApp,
        title: companyName,
        iconUrl,
    })
}