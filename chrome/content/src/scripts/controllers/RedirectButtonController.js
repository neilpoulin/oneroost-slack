import * as RedirectDropdownApp from "RedirectDropdownApp"
import {RESET_THREAD} from "actions/thread"
const iconUrl = "https://www.oneroost.com/favicon.ico"

export function composeViewHandler(composeView, store){
    // a compose view has come into existence, do something with it!
    if (!composeView.isInlineReplyForm()){
        store.dispatch({type: RESET_THREAD})
        console.log("compose view is an inline thread, not resetting info")
    }
    composeView.addButton({
        title: "OneRoost Redirect",
        iconUrl,
        hasDropdown: true,
        enabled: true,
        type: "MODIFIER",
        onClick: handleRedirectClick,
    });
}

export function handleRedirectClick(e){
    console.log("handling click", e)
    const composeView = e.composeView
    const dropdown = e.dropdown
    //NOTE: you can't set the text or subject of the email in composeView unless you want the dropdown to close
    dropdown.setPlacementOptions({
        position: "top",
    })

    RedirectDropdownApp.fromElement(dropdown.el, composeView).then(() => {
        console.log("registered the React component")
    })
}
