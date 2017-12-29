import Immutable from 'immutable'
import Parse from 'parse'
import Raven from 'raven-js'
import * as VendorActions from 'actions/vendor'
import {getDomainFromEmail} from 'util/emailUtil'
import {VENDOR_CLASSNAME, VENDOR_INFO_REQUEST} from 'models/ModelConstants'
import Pointer from 'model/Pointer'

export const aliases = {
    [VendorActions.FIND_VENDOR_BY_EMAIL_ALIAS]: findVendorByEmail,
    [VendorActions.REQUEST_VENDOR_INFO_ALIAS]: requestVendorInfo,
}

export const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    companyName: null,
    roostRating: null,
    email: null,
    emailDomains: [],
    savingInfoRequest: false,
    infoRequest: null,
    objectId:  null,
    loadedInfoRequest: false,
})

export default function reducer(state=initialState, action){
    try{
        switch(action.type){
            case VendorActions.FIND_VENDOR_REQUEST:
                state = state.set('isLoading', true)
                break
            case VendorActions.SET_EMPTY_VENDOR:
                state = state.set('isLoading', false)
                state = state.set('hasLoaded', true)
                break
            case VendorActions.FIND_VENDOR_SUCCESS:
                state = state.set('isLoading', false)
                state = state.set('hasLoaded', true)
                state = state.merge(action.payload)
                break
            case VendorActions.FIND_VENDOR_ERROR:
                state = state.set('isLoading', false)
                state = state.set('error', action.payload)
                break
            case VendorActions.REQUEST_VENDOR_INFO_REQUEST:
                state = state.set('savingInfoRequest', true)
                break;
            case VendorActions.REQUEST_VENDOR_INFO_SUCCESS:
                state = state.set('savingInfoRequest', false)
                state = state.set('infoRequest', action.payload)
                state = state.set('loadedInfoRequest', true)
                break;
            case VendorActions.REQUEST_VENDOR_INFO_ERROR:
                state = state.set('savingInfoRequest', false)
                break;
            case VendorActions.FIND_VENDOR_INFO_SUCCESS:
                state = state.set('infoRequest', action.payload)
                state = state.set('loadedInfoRequest', true)
                break
            case VendorActions.FIND_VENDOR_INFO_REQUEST:
                break;
            case VendorActions.FIND_VENDOR_INFO_ERROR:
                state = state.set('loadedInfoRequest', true)
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
    let query = new Parse.Query(VENDOR_CLASSNAME)
    query.equalTo('emailDomains', domain)
    query.include('inbound')
    query.include('emailDomains')
    return query.first()
}

function fetchVendorInfoRequest({vendorId, vendorEmail}){
    let query = new Parse.Query(VENDOR_INFO_REQUEST)
    query.equalTo('requestedBy', Parse.User.current)
    if (vendorId){
        query.equalTo('vendor', Pointer(vendorId, VENDOR_CLASSNAME))
    }
    query.equalTo('vendorEmail', vendorEmail)
    return query.first()
}

export function findVendorInfoRequestForVendor({vendorId, vendorEmail}){
    return dispatch => {
        dispatch({
            type: VendorActions.FIND_VENDOR_INFO_REQUEST,
            vendorEmail,
        })
        fetchVendorInfoRequest({vendorId, vendorEmail}).then(infoRequest => {
            if (infoRequest){
                dispatch({
                    type: VendorActions.FIND_VENDOR_INFO_SUCCESS,
                    vendorEmail,
                    payload: infoRequest.toJSON()
                })

                return infoRequest.toJSON()
            }
            return null
        }).catch(error => {
            Raven.captureException(error)
            console.log('failed to find vendor info request')
            dispatch({
                type: VendorActions.FIND_VENDOR_INFO_ERROR,
                vendorEmail,
                error,
            })
            return null
        })
    }
}

export function findVendorByEmail({email='unknown@unknown.com'}){
    return (dispatch, getState) => {

        let vendors = getState().vendors
        let domain = getDomainFromEmail(email)
        let foundVendor = vendors.get(domain) || vendors.get(email)
        if (foundVendor && foundVendor.get('infoRequest')){
            console.log('vendor already loaded, with info', foundVendor)
            return Promise.resolve()
        }

        if (foundVendor && !foundVendor.get('loadedInfoRequest') && !foundVendor.get('isLoading')){
            console.log('vendor existed, but the info request had not been made')
            return dispatch(findVendorInfoRequestForVendor({vendorId: foundVendor.get('objectId'), vendorEmail: email}))
        }
        else if (foundVendor){
            console.log('vendor found for email and no info needs to be requested' + email + '... not loading', foundVendor.toJS())
            return Promise.resolve(foundVendor)
        }
        console.log('no vendor found for email ' + email)
        dispatch({
            type: VendorActions.FIND_VENDOR_REQUEST,
            vendorEmail: email,
        })

        return fetchVendorByDomain(domain).then(vendor => {
            if (!vendor){
                console.info('no vendor found domain = ' + domain + ' email = ' + email)
                dispatch({
                    type: VendorActions.SET_EMPTY_VENDOR,
                    vendorEmail: email,
                    payload: {}
                })
                return dispatch(findVendorInfoRequestForVendor({vendorEmail: email}))
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

            return dispatch(findVendorInfoRequestForVendor({vendorId: vendor.id, vendorEmail: email})).then(infoRequest => {
                if (infoRequest){
                    return {...payload, infoRequest}
                }
                return payload
            }).catch(error => {
                Raven.captureException(error)
                console.log('failed to find vendor info request')
                return payload
            })
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


export function requestVendorInfo({vendorEmail, vendorId}){
    return dispatch => {
        dispatch({type: VendorActions.REQUEST_VENDOR_INFO_REQUEST, vendorEmail})

        Parse.Cloud.run('requestVendorInfo', {
            vendorEmail,
            vendorId,
        }).then(({vendorInfoRequest}) => {
            console.log('successfully requested vendor info', vendorInfoRequest)
            dispatch({
                type: VendorActions.REQUEST_VENDOR_INFO_SUCCESS,
                vendorEmail,
                payload: vendorInfoRequest.toJSON()
            })
        }).catch(error => {
            console.log('failed to save vendor info request', error)
            Raven.captureException(error)
            dispatch({
                type: VendorActions.REQUEST_VENDOR_INFO_ERROR,
                vendorEmail,
                error,
            })
        })
    }
}
