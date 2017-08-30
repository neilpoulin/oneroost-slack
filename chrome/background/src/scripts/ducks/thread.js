import {fromJS} from "immutable"
import * as ThreadActions from "actions/thread"

export const initialState = {
    subject: null,
    body: null,
    sender: null,
    roostId: null
}

export default function reducer(state=initialState, action){
    state = fromJS(state)
    switch(action.type){
        case ThreadActions.SET_SUBJECT:
            state = state.set("subject", action.payload)
            break;
        case ThreadActions.SET_BODY:
            state = state.set("body", action.payload)
            break;
        case ThreadActions.SET_SENDER:
            state = state.set("sender", action.payload)
            break;
        case ThreadActions.SET_ROOST_ID:
            state = state.set("roostId", action.payload)
            break;
        case ThreadActions.RESET_THREAD:
            state = fromJS(initialState)
            break;
        default:
            state = state;
            break;
    }
    return state.toJS()
}
