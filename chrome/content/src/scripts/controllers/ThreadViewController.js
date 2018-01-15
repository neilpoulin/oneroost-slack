import ThreadViewApp from 'ThreadViewApp'
import {SET_SUBJECT} from 'actions/thread'
import {FIND_VENDOR_BY_EMAIL_ALIAS} from 'actions/vendor';
import {SET_SENDER} from 'actions/thread';
import {RESET_USER_REDIRECT} from 'actions/gmail';
import {showRoostInfoForEmail} from '../selectors/config';

const iconUrl = chrome.runtime.getURL('images/logo30x30.png')

export function threadViewHandler(threadView, store){
    const subject = threadView.getSubject()
    store.dispatch({type: SET_SUBJECT, payload: subject})

    let sender = threadView.getMessageViews()[0].getSender()
    store.dispatch({type: SET_SENDER, payload: sender})
    store.dispatch({type: RESET_USER_REDIRECT})
    // let {companyName='Company X'} = state.vendors[sender.emailAddress]
    let email = sender.emailAddress
    store.dispatch({
        type: FIND_VENDOR_BY_EMAIL_ALIAS,
        email,
        vendorEmail: email,
    })

    let showSidebar = showRoostInfoForEmail(email, store.getState())
    if (showSidebar){
        threadView.addSidebarContentPanel({
            el: ThreadViewApp,
            title: 'Test Title',
            hideTitleBar: true,
            iconUrl,
        })
    } else {
        console.log('not showing sidebar for sender', email)
    }


}