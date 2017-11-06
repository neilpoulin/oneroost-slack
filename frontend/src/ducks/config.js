import Immutable from 'immutable'
import axios from 'axios'

export const CONFIGS_LOAD_REQUEST = 'oneroost/config/CONFIGS_LOAD_REQUEST'
export const CONFIGS_LOAD_SUCCESS = 'oneroost/config/CONFIGS_LOAD_SUCCESS'
export const CONFIGS_LOAD_ERROR = 'oneroost/config/CONFIGS_LOAD_ERROR'

const initialState = Immutable.fromJS({
    PARSE_PUBLIC_URL: null,
    ENV: null,
    ENV_NAME: null,
    SLACK_CLIENT_ID: null,
    STRIPE_PUBLISH_KEY: null,
    PARSE_APP_ID: null,
    GA_TRACKING_ID: null,
    isLoading: false,
    hasLoaded: false,
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case CONFIGS_LOAD_REQUEST:
            state = state.set('isLoading', true)
            break;
        case CONFIGS_LOAD_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.merge(action.payload)
            break;
        case CONFIGS_LOAD_ERROR:
            state = state.set('isLoading', true)
            break;
        default:
            break
    }

    return state;
}

export function loadServerConfigs(){
    return dispatch => {
        dispatch({
            type: CONFIGS_LOAD_REQUEST
        })

        return axios.get('/configs').then(({data}) => {
            dispatch({
                type: CONFIGS_LOAD_SUCCESS,
                payload: data,
            })
            return data
        }).catch(error => {
            dispatch({
                type: CONFIGS_LOAD_ERROR,
                payload: {
                    error,
                }
            })
        })
    }
}
