import Immutable from 'immutable'
import Parse from 'parse'
import Raven from 'raven-js'
import * as VendorActions from 'actions/vendor'
import {getDomainFromEmail} from 'util/emailUtil'


export const aliases = {
    [VendorActions.FIND_VENDOR_BY_EMAIL_ALIAS]: findVendorByEmail
}

export const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    companyName: null,
    roostRating: null,
    email: null,
    emailDomains: []
})

export default function reducer(state=initialState, action){
    try{
        switch(action.type){
            case VendorActions.FIND_VENDOR_REQUEST:
                state = state.set('isLoading', true)
                break
            case VendorActions.FIND_VENDOR_SUCCESS:
                state = state.set('isLoading', false)
                state = state.set('hasLoaded', true)
                // state = state.set('vendor', action.payload)
                state = state.merge(action.payload)
                break
            case VendorActions.FIND_VENDOR_ERROR:
                state = state.set('isLoading', false)
                state = state.set('error', action.payload)
                break
            default:
                console.log('not a Vendor supported action', action)
                break
        }
    } catch (error) {
        Raven.captureException(error)
    }

    return state
}

function fetchVendorByDomain(domain){
    let query = new Parse.Query('Vendor')
    query.equalTo('emailDomains', domain)
    query.include('inbound')
    query.include('emailDomains')
    return query.first()
}

export function findVendorByEmail({email='unknown@unknown.com'}){
    return (dispatch, getState) => {

        let vendors = getState().vendors

        if (vendors.get(email)){
            console.log('vendor already loaded', email)
            return null
        }

        let domain = getDomainFromEmail(email)
        dispatch({
            type: VendorActions.FIND_VENDOR_REQUEST,
            vendorEmail: email,
        })
        return fetchVendorByDomain(domain).then(vendor => {
            if (!vendor){
                console.info('no vendor found')
                dispatch({
                    type: VendorActions.FIND_VENDOR_SUCCESS,
                    vendorEmail: email,
                    payload: {}
                })
                return null
            }

            let inbound = vendor.get('inbound').toJSON()
            let payload = {
                companyName: inbound.companyName,
                email: email,
                ...vendor.toJSON()
            }
            dispatch({
                type: VendorActions.FIND_VENDOR_SUCCESS,
                vendorEmail: email,
                payload
            })
            return payload
        }).catch(error => {
            console.error('Failed to fetch vendors', error)
            Raven.captureException(error)
            dispatch({
                type: VendorActions.FIND_VENDOR_ERROR,
                error,
            })
        })
    }
}