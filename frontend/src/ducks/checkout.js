import Immutable from 'immutable'
import axios from 'axios'

export const LOAD_PLAN_REQUEST = 'oneroost/checkout/LOAD_PLAN_REQUEST'
export const LOAD_PLAN_SUCCESS = 'oneroost/checkout/LOAD_PLAN_SUCCESS'
export const LOAD_PLAN_ERROR = 'oneroost/checkout/LOAD_PLAN_ERROR'

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    planId: null,
    plan: null,
    error: null,
})

export default function reducer(state=initialState, action){
    const payload = action.payload
    switch(action.type){
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