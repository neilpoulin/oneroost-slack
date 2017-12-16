import Immutable from 'immutable'

import * as VendorActions from 'actions/vendor'

export const aliases = {
    [VendorActions.FIND_VENDOR_BY_EMAIL_ALIAS]: findVendorByEmail
}

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    vendor: null,
    error: null,
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case VendorActions.FIND_VENDOR_REQUEST:
            state = state.set('isLoading', true)
            break
        case VendorActions.FIND_VENDOR_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('vendor', action.payload)
            break
        case VendorActions.FIND_VENDOR_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload)
            break
        default:
            break
    }
    return state
}

export function findVendorByEmail({email}){
    return (dispatch) => {
        dispatch({
            type: VendorActions.FIND_VENDOR_REQUEST
        })
        let address = email.emailAddress || 'unknown@unknown.com'
        let domain = address.split('@')[1]
        setTimeout(() => {
            dispatch({
                type: VendorActions.FIND_VENDOR_SUCCESS,
                payload: {
                    companyName: domain,
                    email,
                    roostRating: domain.length,
                }
            })
        }, 1000)
    }
}