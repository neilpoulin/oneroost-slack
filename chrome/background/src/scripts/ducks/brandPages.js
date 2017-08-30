import Parse from "parse"
import Pointer from "Pointer"

import {
    LOAD_PAGES_ERROR,
    LOAD_PAGES_SUCCESS,
    LOAD_PAGES_REQUEST,
    LOAD_PAGES_ALIAS,
} from "actions/brandPages"

const initialState = {
    isLoading: false,
    hasLoaded: false,
    pages: []
}

export default function reducer(state=initialState, action){
    switch (action.type) {
        case LOAD_PAGES_REQUEST:
            state.isLoading = true
            break;
        case LOAD_PAGES_SUCCESS:
            state.isLoading = false
            state.hasLoaded = true
            state.pages = action.payload
            break;
        case LOAD_PAGES_ERROR:
            state.isLoading = false
            break;
        default:
            break;
    }
    return state;
}
// Queries
const getPagesQuery = (accountId) => {
    let query = new Parse.Query("BrandPage")
    query.equalTo("account", Pointer(accountId, "Account"))
    query.include("templates")
    return query.find()
}

export function loadPages(){
    return (dispatch, getState) => {
        const state = getState()
        if (state.brandPages.hasLoaded || !state.user.accountId) {
            console.warn("Not loading pages.. already loaded or the account id was not available")
            return null
        }
        dispatch({type: LOAD_PAGES_REQUEST})
        getPagesQuery(state.user.accountId).then(pages => {
            let pagesJson = pages.map(page => page.toJSON())
            dispatch({
                type: LOAD_PAGES_SUCCESS,
                payload: pagesJson
            })
        }).catch(error => {
            console.error(error)
            dispatch({
                type: LOAD_PAGES_ERROR,
                error
            })
        })
    }
}

export const aliases = {
    [LOAD_PAGES_ALIAS]: loadPages
}
