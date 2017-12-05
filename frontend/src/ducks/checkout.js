import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import {getInboundEmail} from "selectors/inbound";

export const LOAD_PLAN_REQUEST = 'oneroost/checkout/LOAD_PLAN_REQUEST'
export const LOAD_PLAN_SUCCESS = 'oneroost/checkout/LOAD_PLAN_SUCCESS'
export const LOAD_PLAN_ERROR = 'oneroost/checkout/LOAD_PLAN_ERROR'
export const SET_PLAN_CONFIG = 'oneroost/checkout/SET_PLAN_CONFIG'
export const RESET_STATE = 'oneroost/checkout/RESET_STATE'
export const SET_VALUE = 'oneroost/checkout/SET_VALUE'

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    planId: null,
    plan: null,
    email: null,
    error: null,
    planConfig: null
})

export default function reducer(state=initialState, action){
    const payload = action.payload
    switch(action.type){
        case RESET_STATE:
            state = initialState.merge(action.payload)
            break
        case LOAD_PLAN_REQUEST:
            state = state.set('planId', payload.get('planId'))
            state = state.set('isLoading', true)
            break
        case LOAD_PLAN_SUCCESS:
            state = state.set('plan', payload)
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('error', null)
            break
        case LOAD_PLAN_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload.get('error'))
            break
        case SET_PLAN_CONFIG:
            state = state.set('planConfig', action.payload)
            break
        case SET_VALUE:
            state = state.setIn([...action.payload.get('name', '').split('.')], action.payload.get('value'))
            state = state.set('error', null)
            break
        default:
            break
    }
    return state
}

export function loadPlanFromState(){
    return (dispatch, getState) => {
        let planId = getState().checkout.get('planId')
        dispatch(loadPlanById(planId))
    }
}

export function loadPlanById(planId){
    return dispatch => {
        dispatch({
            type: LOAD_PLAN_REQUEST,
            payload: {
                planId
            }
        })

        Parse.Config.get().then(config => {
            let plans = config.get('sellerPlans')
            if (plans) {
                let planConfig = plans.find(p => p.stripePlanId === planId)
                dispatch({
                    type: SET_PLAN_CONFIG,
                    payload: planConfig
                })
            }
        })

        axios.get(`/plans/stripe/${planId}`).then(({data: plan}) => {
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

export function reset(){
    return {type: RESET_STATE}
}

export function setEmailFromInbound(){
    return (dispatch, getState) => {
        let state = getState()
        let email = getInboundEmail(state)
        dispatch({
            type: SET_VALUE,
            payload: {value: email, name: 'email'}
        })
    }
}

export function setValue({name, value}){
    return {
        type: SET_VALUE,
        payload: {name, value}
    }
}