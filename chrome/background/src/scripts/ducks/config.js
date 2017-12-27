import Immutable from 'immutable'
import axios from 'axios'
import {SET_SERVER_URL} from 'actions/config'
import Raven from 'raven-js'
export const CONFIGS_LOAD_REQUEST = 'oneroost/config/CONFIGS_LOAD_REQUEST'
export const CONFIGS_LOAD_SUCCESS = 'oneroost/config/CONFIGS_LOAD_SUCCESS'
export const CONFIGS_LOAD_ERROR = 'oneroost/config/CONFIGS_LOAD_ERROR'
export const TEAM_CONFIGS_LOAD_REQUEST = 'oneroost/config/TEAM_CONFIGS_LOAD_REQUEST'
export const TEAM_CONFIGS_LOAD_SUCCESS = 'oneroost/config/TEAM_CONFIGS_LOAD_SUCCESS'
export const TEAM_CONFIGS_LOAD_ERROR = 'oneroost/config/TEAM_CONFIGS_LOAD_ERROR'

import * as ConfigActions from 'actions/config'
import Parse from 'parse'
import {loadCachedUser} from 'ducks/user'


const initialState = Immutable.fromJS({
    PARSE_PUBLIC_URL: null,
    ENV: null,
    ENV_NAME: null,
    SLACK_CLIENT_ID: null,
    PARSE_APP_ID: null,
    isLoading: false,
    teamConfigLoading: false,
    redirectMessage: {
        'message':'Thanks for reaching out. I\'m excited to hear what more about your product/service. Please provide an overview of your offering by going to $TEAM_LINK.',
        'linkText':'$TEAM_LINK'
    },
    hasLoaded: false,
    serverUrl: 'https://dev.oneroost.com',
    error: null,
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
            break
        case CONFIGS_LOAD_ERROR:
            state = state.set('isLoading', false)
            break
        case SET_SERVER_URL:
            state = state.set('serverUrl', action.payload.serverUrl)
            break
        case TEAM_CONFIGS_LOAD_REQUEST:
            state = state.set('teamConfigLoading', true)
            break
        case TEAM_CONFIGS_LOAD_SUCCESS:
            state = state.set('teamConfigLoading', false)
            state = state.merge(action.payload);
            break
        case TEAM_CONFIGS_LOAD_ERROR:
            state = state.set('teamConfigLoading', false)
            state = state.set('error', action.error)
            break
        default:
            break
    }

    return state;
}


export function loadServerConfigs(){
    return (dispatch, getState) => {
        const serverUrl = getState().config.get('serverUrl')
        dispatch({
            type: CONFIGS_LOAD_REQUEST
        })

        return axios.get(`${serverUrl}/configs`).then(({data}) => {
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

export function loadTeamConfigs(){
    return dispatch => {
        dispatch({
            type: TEAM_CONFIGS_LOAD_REQUEST
        })
        Parse.Cloud.run('teamExtensionConfig').then(({redirectMessage}) => {
            dispatch({
                type: TEAM_CONFIGS_LOAD_SUCCESS,
                payload: {
                    redirectMessage,
                }
            })
        }).catch(error => {
            dispatch({
                type: TEAM_CONFIGS_LOAD_ERROR,
                error,
                payload: {
                    error
                }
            })
        })
    }
}

export function updateServerConfigs(){
    return dispatch => {
        return dispatch(loadServerConfigs()).then(configs => {
            console.log(configs)
            Parse.initialize(configs.PARSE_APP_ID);
            Parse.serverURL = configs.PARSE_PUBLIC_URL;

            dispatch(loadTeamConfigs())
            dispatch(loadCachedUser())
            return configs
        })
    }
}

export const aliases = {
    [ConfigActions.REFRESH_SERVER_CONFIG_ALIAS]: updateServerConfigs,
}
