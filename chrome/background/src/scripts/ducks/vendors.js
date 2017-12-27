import Immutable from 'immutable'
import Parse from 'parse'
import Raven from 'raven-js'

import vendorReducer, {initialState} from './vendor'

export const LOAD_ALL_VENDORS_REQUEST = 'oneroost/vendors/LOAD_ALL_VENDORS_REQUEST'
export const LOAD_ALL_VENDORS_ERROR = 'oneroost/vendors/LOAD_ALL_VENDORS_ERROR'
export const LOAD_ALL_VENDORS_SUCCESS = 'oneroost/vendors/LOAD_ALL_VENDORS_SUCCESS'

export default function reducer(state=Immutable.Map({}), action){
    try{
        const vendorEmail = action.vendorEmail
        if (vendorEmail){
            let currentVendorState = state.get(vendorEmail, initialState)
            let vendorState = vendorReducer(currentVendorState, action)
            state = state.set(vendorEmail, vendorState)
        }
        switch (action.type){
            case LOAD_ALL_VENDORS_SUCCESS:
                let updatedMap = action.payload.vendors.map(vendor => {
                    return {
                        [vendor.get('email')]: vendor
                    }
                })
                state = state.merge(updatedMap)
                break;
            default:
                break;
        }
    } catch (error) {
        Raven.captureException(error)
    }

    return state
}


function fetchVendors(){
    let query = new Parse.Query('Vendor')
    query.include('inbound')
    query.include('emailDomains')
    return query.find()
}

export function loadAllVendors(){
    return dispatch => {
        dispatch({
            type: LOAD_ALL_VENDORS_REQUEST
        })
        fetchVendors().then(vendors => {
            dispatch({
                type: LOAD_ALL_VENDORS_SUCCESS,
                payload: {
                    vendors: vendors.map(vendor => vendor.toJSON())
                }
            })
        }).catch(error => {
            Raven.captureException(error)
            dispatch({
                type: LOAD_ALL_VENDORS_ERROR,
                error,
                payload: {
                    error,
                }
            })
        })
    }
}