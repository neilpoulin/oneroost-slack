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


export const STATUS_NONE = 'not subscribed'
export const STATUS_ACTIVE = 'active'
export const STATUS_TRIALING = 'trialing'
export const STATUS_PAST_DUE = 'past_due'
export const STATUS_CANCELED = 'canceled'
export const STATUS_UNPAID = 'unpaid'

export const ACTIVE_STATUSES = [STATUS_ACTIVE, STATUS_TRIALING]

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
            break
        case SAVE_PAYMENT_SUCCESS:
            state = state.set('isSaving', false)
            state = state.set('saveSuccess', true)
            state = state.set('hasPayment', true)
            state = state.set('subscriberStatus', STATUS_ACTIVE)
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
            state = state.set('plan', action.payload.toJS())
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
            state = state.setIn(['formInput', 'couponCode'], null)
            break;
        default:
            break
    }
    return state
}

export function processPayment(planId, token){
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
            dispatch(fetchUserSubscriptionInfo())
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
            dispatch({
                type: LOAD_PLAN_SUCCESS,
                payload: plan,
            })
        }).catch(error => {
            dispatch({
                type: LOAD_PLAN_ERROR,
                payload: error,
            })
        })
    }
}

export function fetchUserSubscriptionInfo(){
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
    return dispatch => {
        return axios.get(`/coupons/${couponCode}`).then(({data: coupon}) => {
            dispatch({
                type: SET_COUPON,
                payload: coupon
            })
            return coupon
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