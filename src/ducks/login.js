import Immutable from 'immutable'
import axios from 'axios'


export const SLACK_AUTH_REQUEST = 'oneroost/login/SLACK_AUTH_REQUEST'
export const SLACK_AUTH_SUCCESS = 'oneroost/login/SLACK_AUTH_SUCCESS'
export const SLACK_AUTH_ERROR = 'oneroost/login/SLACK_AUTH_ERROR'

const initialState = Immutable.Map({
    isLoggedIn: false,
    isLoading: false,
    userId: null,
    error: null,
    slackAccessToken: null,
    slackUser: null,
    slackTeam: null,
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case SLACK_AUTH_REQUEST:
        return state.set('isLoading', true)
        case SLACK_AUTH_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('slackAccessToken', action.payload.get('accessToken'))
            state = state.set('error', null)
            state = state.set('isLoggedIn', true)
            state = state.set('slackUser', action.payload.get('user'))
            state = state.set('slackTeam', action.payload.get('team'))
            return state
        case SLACK_AUTH_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload.get('error'))
            return state
        default:
        break
    }

    return state;
}

export function loginWithSlack(code){
    return dispatch => {
        dispatch({
            type: SLACK_AUTH_REQUEST,
        })

        axios.post('/tokens/slack', {
            code,
        })
        .then(function ({data: {
            accessToken, user, team
        }}) {
            dispatch({
                type: SLACK_AUTH_SUCCESS,
                payload: {
                    accessToken,
                    user,
                    team,
                }
            })
        })
        .catch(function ({response: {data: error}}) {
            console.log(error);
            dispatch({
                type: SLACK_AUTH_ERROR,
                payload: {
                    ...error,
                }
            })
        }).then(() => {

        })
    }
}
