import Immutable from 'immutable'
import Parse from 'parse'
import Raven from 'raven-js'
import {getDomainFromEmail} from 'util/emailUtil'

import vendorReducer, {initialState} from './vendor'

export const LOAD_ALL_VENDORS_REQUEST = 'oneroost/vendors/LOAD_ALL_VENDORS_REQUEST'
export const LOAD_ALL_VENDORS_ERROR = 'oneroost/vendors/LOAD_ALL_VENDORS_ERROR'
export const LOAD_ALL_VENDORS_SUCCESS = 'oneroost/vendors/LOAD_ALL_VENDORS_SUCCESS'

export default function reducer(state=Immutable.Map({}), action){
    try{
        const vendorEmail = action.vendorEmail
        if (vendorEmail){
            let vendorDomain = getDomainFromEmail(vendorEmail)
            let currentVendorState = state.get(vendorDomain, initialState)
            let vendorState = vendorReducer(currentVendorState, action)
            state = state.set(vendorDomain, vendorState)
        }
        switch (action.type){
            case LOAD_ALL_VENDORS_SUCCESS:
                state = state.merge(action.payload.vendors.reduce((map, vendor) => {
                    let domains = vendor.emailDomains || []
                    domains.forEach(domain => {
                        map[domain] = vendor
                    })
                    return map
                }, {}))
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