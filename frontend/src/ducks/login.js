import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'

export const SLACK_AUTH_REQUEST = 'oneroost/login/SLACK_AUTH_REQUEST'
export const SLACK_AUTH_SUCCESS = 'oneroost/login/SLACK_AUTH_SUCCESS'
export const SLACK_AUTH_ERROR = 'oneroost/login/SLACK_AUTH_ERROR'

export const LOGIN_SUCCESS = 'oneroost/login/LOGIN_SUCCESS'
export const SET_PROVIDER_ERROR = 'oneroost/login/PROVIDER_ERROR'

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
            state = state.set('channels', action.payload.get('channels', Immutable.List()))
            return state
        case SLACK_AUTH_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload.get('error'))
            return state
        case LOGIN_SUCCESS:
            state = state.set('isLoggedIn', true)
            return state;
        case SET_PROVIDER_ERROR:
            state = state.set('error', action.payload)
            return state;
        default:
            break
    }

    return state;
}

export function loadUser(){
    return dispatch => {
        if (!document.cookie || document.cookie.indexOf('slack_token=') === -1)
        {
            console.log('user is not logged in, not fetching data')
            return null;
        }

        axios.get('slack/userInfo').then(({data}) => {
            console.log('data!', data)
            dispatch({
                type: SLACK_AUTH_SUCCESS,
                payload: {
                    user: data.user,
                    team: data.team,
                    accessToken: data.access_token,
                    channels: data.channels,
                }
            })
        }).catch(error => {
            console.error(error)
        })
    }
}

export function loginWithSlack(code, redirectUri){
    return dispatch => {
        dispatch({
            type: SLACK_AUTH_REQUEST,
        })

        axios.post('/tokens/slack', {
            code,
            redirectUri,
        })
        .then( ({data: {
            access_token: accessToken, user, team, channels
        }}) => {
            dispatch({
                type: SLACK_AUTH_SUCCESS,
                payload: {
                    accessToken,
                    user,
                    team,
                    channels,
                }
            })
        })
        .catch( error => {
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


export function linkUserWithProvider(provider, authData){
    return (dispatch, getState) => {
        console.log('authData:', authData)
        if(!authData || !authData.access_token){
            console.log('no valid auth data present, exit')
            return null;
        }
        const {firstName, lastName, email} = authData || {}
        let user = Parse.User.current() || new Parse.User({
            email,
            firstName,
            lastName,
            username: email
        });
        dispatch(linkUser(user, provider, authData))
    }
}

export function userLoggedIn(user){
    return {
        type: LOGIN_SUCCESS,
        payload: user
    }
}

function linkUser(user, provider, authData){
    return (dispatch) => {
        let options = {
            authData
        }

        return user._linkWith(provider, options).then(savedUser => {
            console.log('Linked with ' + provider, savedUser)
            dispatch(userLoggedIn(savedUser))
            // Parse.Cloud.run('checkEmailAfterOAuth').then((response) => {
            //     dispatch(userLoggedIn(savedUser))
            // }).catch(error => log.error)
        }).catch(error => {
            switch (error.code){
                case 202:
                    log.warn('user exists, can\'t link.. need to login first')
                    let email = user.get('email')
                    dispatch(connectExistingUser({email, provider, authData}))
                    break;
                case 206:
                    error.message = 'If you already have an account, you must log in before you can connect via a thrid party.'
                    dispatch(linkUserWithProviderError(provider, error))
                    break
                default:
                    log.error('Failed to link with' + provider, error)
                    dispatch(linkUserWithProviderError(provider, error))
                    break;
            }
        })
    }
}

export function connectExistingUser({email, provider, authData}){
    return (dispatch) => {
        fetchUserByEmail(email).then(user => {
            if (user){
                dispatch(linkUser(user, provider, authData))
            }
            else {
                throw new Error('No user found.')
            }
        }).catch(error => {
            log.error('Failed to link existing with' + provider, error)
            switch(error.code){
                case 206:
                    error.message = 'If you already have an account, you must log in before you can connect via a thrid party.'
                    break
            }
            dispatch(linkUserWithProviderError(provider, error))
        })
    }
}


export function linkUserWithProviderError(providerName, error){
    return (dispatch, getState) => {
        log.error('Failed to link ' + providerName, error)
        dispatch({
            type: SET_PROVIDER_ERROR,
            error: {
                [providerName]: error
            }
        })
    }
}
