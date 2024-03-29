import Immutable from 'immutable'
import Parse from 'parse'
import axios from 'axios'

export const SAVE_PAYMENT_REQUEST = 'oneroost/payment/SAVE_PAYMENT_REQUEST'
export const SAVE_PAYMENT_SUCCESS= 'oneroost/payment/SAVE_PAYMENT_SUCCESS'
export const SAVE_PAYMENT_ERROR = 'oneroost/payment/SAVE_PAYMENT_ERROR'
export const LOAD_PLAN_REQUEST = 'oneroost/payment/LOAD_PLAN_REQUEST'
export const LOAD_PLAN_SUCCESS = 'oneroost/payment/LOAD_PLAN_SUCCESS'
export const LOAD_PLAN_ERROR = 'oneroost/payment/LOAD_PLAN_ERROR'
export const SET_SUBSCRIPTION = 'oneroost/payment/SET_SUBSCRIPTION'
export const SET_FORM_VALUE = 'oneroost/payment/SET_FORM_VALUE'
export const SET_COUPON = 'oneroost/payment/SET_COUPON'
export const RESET_COUPON = 'oneroost/payment/RESET_COUPON'
export const CLEAR_MESSAGES = 'oneroost/payment/CLEAR_MESSAGES'
export const SET_UPCOMING_INVOICE = 'oneroost/payment/SET_UPCOMING_INVOICE'

export const SAVE_VENDOR_PAYMENT_REQUEST = 'oneroost/payment/SAVE_VENDOR_PAYMENT_REQUEST'
export const SAVE_VENDOR_PAYMENT_SUCCESS = 'oneroost/payment/SAVE_VENDOR_PAYMENT_SUCCESS'
export const SAVE_VENDOR_PAYMENT_ERROR = 'oneroost/payment/SAVE_VENDOR_PAYMENT_ERROR'

export const STATUS_NONE = 'not subscribed'
export const STATUS_ACTIVE = 'active'
export const STATUS_TRIALING = 'trialing'
export const STATUS_PAST_DUE = 'past_due'
export const STATUS_CANCELED = 'canceled'
export const STATUS_UNPAID = 'unpaid'

export const ACTIVE_STATUSES = Immutable.List([STATUS_ACTIVE, STATUS_TRIALING])

const initialState = Immutable.fromJS({
    isSaving: false,
    saveSuccess: false,
    hasPayment: false,
    error: null,
    isLoading: false,
    hasLoaded: true,
    plan: null,
    subscription: null,
    coupon: null,
    couponChecked: false,
    formInput: {},
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case SAVE_PAYMENT_REQUEST:
            state = state.set('isSaving', true)
            state = state.set('error', null)
            state = state.set('invoice', null)
            break
        case SAVE_VENDOR_PAYMENT_REQUEST:
            state = state.set('isSaving', true)
            state = state.set('error', null)
            state = state.set('invoice', null)
            state = state.set('vendor', null)
            break
        case SAVE_PAYMENT_SUCCESS:
            state = state.set('isSaving', false)
            state = state.set('saveSuccess', true)
            state = state.set('hasPayment', true)
            state = state.set('error', null)
            state = state.set('subscriberStatus', STATUS_ACTIVE)
            break
        case SAVE_VENDOR_PAYMENT_SUCCESS:
            state = state.set('isSaving', false)
            state = state.set('saveVendorSuccess', true)
            state = state.set('hasVendorPayment', true)
            state = state.set('vendor', action.payload.get('vendor'))
            state = state.set('error', null)
            state = state.set('vendorSubscriberStatus', STATUS_ACTIVE)
            break
        case SAVE_VENDOR_PAYMENT_ERROR:
            state = state.set('isSaving', false)
            state = state.set('saveVendorSuccess', false)
            state = state.set('error', action.payload.get('error'))
            break
        case SAVE_PAYMENT_ERROR:
            state = state.set('isSaving', false)
            state = state.set('saveSuccess', false)
            state = state.set('error', action.payload.get('error'))
            break
        case LOAD_PLAN_REQUEST:
            state = state.set('isLoading', true)
            break
        case LOAD_PLAN_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('plan', action.payload)
            break
        case SET_SUBSCRIPTION:
            state = state.set('subscription', action.payload)
            break
        case SET_FORM_VALUE:
            state = state.setIn(['formInput', ...action.payload.get('name', '').split('.')], action.payload.get('value'))
            state = state.set('error', null)
            break;
        case SET_COUPON:
            state = state.set('coupon', action.payload)
            state = state.set('couponChecked', true)
            break
        case RESET_COUPON:
            state = state.set('coupon', null)
            state = state.set('couponChecked', false)
            state = state.setIn(['formInput', 'couponCode'], '')
            break;
        case CLEAR_MESSAGES:
            state = state.set('error', null)
            state = state.set('saveSuccess', false)
            state = state.set('isLoading', false)
            state = state.set('isSaving', false)
            break
        case SET_UPCOMING_INVOICE:
            state = state.set('invoice', action.payload);
            state = state.set('hasPayment', true)
            break;
        default:
            break
    }
    return state
}


export function processVendorPayment({planId, token, email}){
    return (dispatch, getState) => {
        console.log('processing gueset payment')
        dispatch({
            type: SAVE_VENDOR_PAYMENT_REQUEST
        })

        const state = getState(0)
        let couponCode =  state.payment.getIn(['formInput', 'couponCode'])
        let inboundId = state.inbound.getIn(['submittedInbound', 'objectId'])

        Parse.Cloud.run('subscribeVendor', {token, planId, couponCode, email, inboundId}).then(resp => {
            console.log('successfully handled payment', resp)
            dispatch({
                type: SAVE_VENDOR_PAYMENT_SUCCESS,
                payload: {
                    vendor: resp.vendor
                }
            })
            // dispatch(fetchSubscriptionInfo())
            // dispatch(fetchUpcomingInvoice())
            setTimeout(() => {
                dispatch({
                    type: CLEAR_MESSAGES,
                }, 5000);
            })
        }).catch(error => {
            console.error(error)
            dispatch({
                type: SAVE_VENDOR_PAYMENT_ERROR,
                payload: {
                    error
                },
            })
        })
    }
}

export function processPayment({planId, token}){
    return (dispatch, getState) => {
        console.log('processing payment')
        dispatch({
            type: SAVE_PAYMENT_REQUEST
        })

        let user = Parse.User.current()
        if (!user){
            dispatch({
                type: SAVE_PAYMENT_ERROR,
                payload:{
                    error: 'You are not logged in - could not process payment'
                }
            })
            return
        }

        let couponCode =  getState().payment.getIn(['formInput', 'couponCode'])

        Parse.Cloud.run('subscribe', {token, planId, couponCode}).then(resp => {
            console.log('successfully handled payment', resp)
            dispatch({
                type: SAVE_PAYMENT_SUCCESS
            })
            dispatch(fetchSubscriptionInfo())
            dispatch(fetchUpcomingInvoice())
            setTimeout(() => {
                dispatch({
                    type: CLEAR_MESSAGES,
                }, 5000);
            })
        }).catch(error => {
            console.error(error)
            dispatch({
                type: SAVE_PAYMENT_ERROR,
                payload: {
                    error
                },
            })
        })
    }
}

export function loadPlan() {
    return dispatch => {
        dispatch({
            type: LOAD_PLAN_REQUEST
        })
        axios.get('/plans/extension/current').then(({data: plan}) => {
            console.log('fetched plan', plan)
            if (plan && typeof plan === 'object'){
                dispatch({
                    type: LOAD_PLAN_SUCCESS,
                    payload: plan,
                })
            }

        }).catch(error => {
            dispatch({
                type: LOAD_PLAN_ERROR,
                payload: error,
            })
        })
    }
}

export function fetchUpcomingInvoice(){
    return dispatch => {
        let user = Parse.User.current()
        if (!user){
            console.log('no user or user id found for user', user)
            return null;
        }
        let slackTeam = user.get('slackTeam');
        if(!slackTeam || !slackTeam.get('stripeCustomerId')){
            console.log('no stripe customer id, so not fetching invoice')
            return null;
        }
        Parse.Cloud.run('getUpcomingInvoice').then(invoice => {
            dispatch({
                type: SET_UPCOMING_INVOICE,
                payload: invoice
            })
        }).catch(error => {
            console.error(error)
        })
    }
}

export function fetchSubscriptionInfo(){
    return dispatch => {

        let user = Parse.User.current()
        if (!user){
            console.log('no user or subscription id found for user', user)
            return null;
        }
        return Parse.Cloud.run('getSubscription').then(subscription => {
            console.log('fetched subscription', subscription)
            dispatch({
                type: SET_SUBSCRIPTION,
                payload: subscription,
            })
            return subscription
        }).catch(error => {
            console.error('failed to get subscription', error)
        })
    }
}

export function setFormValue(name, value){
    return {
        type: SET_FORM_VALUE,
        payload: {
            name,
            value,
        }
    }
}

export function getCoupon(couponCode){
    return (dispatch, getState) => {
        return axios.get(`/coupons/${couponCode}`).then(({data: coupon}) => {
            if (couponCode === getState().payment.getIn(['formInput', 'couponCode'])){
                dispatch({
                    type: SET_COUPON,
                    payload: coupon ? coupon : null
                })
                return coupon ? coupon : null
            }
            return null
        }).catch(error => {
            if (error.response.status === 404){
                dispatch({
                    type: SET_COUPON,
                    payload: null
                })
            } else {
                console.error('failed to get coupon', error)
            }
        })
    }
}

export function cancelSubscription(){
    return dispatch => {
        Parse.Cloud.run('cancelSubscription').then(subscription => {
            dispatch({
                type: SET_SUBSCRIPTION,
                payload: subscription,
            })
            dispatch({
                type: SET_UPCOMING_INVOICE,
                payload: null,
            })
        })
    }
}