import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import SlackTeam from 'models/SlackTeam'
import Cookie from 'js-cookie'

export const SLACK_AUTH_REQUEST = 'oneroost/login/SLACK_AUTH_REQUEST'
export const SLACK_AUTH_SUCCESS = 'oneroost/login/SLACK_AUTH_SUCCESS'
export const SLACK_AUTH_ERROR = 'oneroost/login/SLACK_AUTH_ERROR'
export const SLACK_INSTALL_REQUEST = 'oneroost/user/SLACK_INSTALL_REQUEST'
export const SLACK_INSTALL_ERROR = 'oneroost/user/SLACK_INSTALL_ERROR'
export const SLACK_INSTALL_SUCCESS = 'oneroost/user/SLACK_INSTALL_SUCCESS'

export const SLACK_ADDED_SUCCESS = 'oneroost/login/SLACK_ADDED_SUCCESS'

export const LOGIN_SUCCESS = 'oneroost/login/LOGIN_SUCCESS'
export const SET_PROVIDER_ERROR = 'oneroost/login/PROVIDER_ERROR'
export const SET_HAS_PROVIDER = 'oneroost/login/SET_HAS_PROVIDER'

export const SET_OAUTH_STATE = 'oneroost/login/SET_OAUTH_STATE'

export const LOGOUT = 'oneroost/login/LOGOUT'

const initialState = Immutable.Map({
    isLoggedIn: false,
    isLoading: false,
    installSuccess: false,
    userId: null,
    error: null,
    slackAccessToken: null,
    firstName: null,
    lastName: null,
    email: null,
    teamName: null,
    teamId: null,
    slackTeamId: null,
    parseUserId: null,
    hasSlack: false,
    hasGoogle: false,
    slackAddedSuccess: false,
    oauthState: null,
    hasChromeExtension: false,
    teamImages: {},
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case SLACK_AUTH_REQUEST:
            return state.set('isLoading', true)

        case SLACK_INSTALL_REQUEST:
            state = state.set('isLoading', true)
            break
        case SLACK_INSTALL_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload.get('error'))
            state = state.set('installSuccess', false)
            break
        case SLACK_INSTALL_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('slackAccessToken', action.payload.get('accessToken'))
            state = state.set('error', null)
            state = state.set('isLoggedIn', false)
            state = state.set('installSuccess', true)
            return state
        case SLACK_AUTH_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('slackAccessToken', action.payload.get('accessToken'))
            state = state.set('error', null)
            state = state.set('isLoggedIn', true)
            if (action.payload.get('user')){
                if (action.payload.get('user').name){
                    let splitName =  action.payload.get('user').name.split(' ')
                    let firstName = splitName[0]
                    let lastName = splitName.length > 0 ? splitName[1] : ''
                    state = state.set('firstName', firstName)
                        .set('lastName', lastName)
                }
                state = state.set('email',  action.payload.get('user').email)
            }
            state = state.set('hasSlack', true)
            return state
        case SLACK_AUTH_ERROR:
            state = state.set('isLoading', false)
            state = state.set('error', action.payload.get('error'))
            return state
        case LOGIN_SUCCESS:
            state = state.set('isLoggedIn', true)
            state = state.set('userId', action.payload.get('objectId'))
            state = state.set('firstName', action.payload.get('firstName'))
            state = state.set('lastName', action.payload.get('lastName'))
            state = state.set('email', action.payload.get('email'))
            state = state.set('teamName', action.payload.getIn(['slackTeam', 'name']))
            state = state.set('teamId', action.payload.getIn(['slackTeam', 'objectId']))
            state = state.set('slackTeamId', action.payload.getIn(['slackTeam', 'teamId']))
            state = state.set('teamImages', action.payload.getIn(['slackTeam', 'images'], {}))
            return state;
        case SET_PROVIDER_ERROR:
            state = state.set('error', action.payload)
            return state;
        case SET_HAS_PROVIDER:
            switch (action.payload.get('provider')) {
                case 'google':
                    state = state.set('hasGoogle', true)
                    return state;
                case 'slack':
                    state = state.set('hasSlack', true)
                    return state;
                default:
                    return state;
            }
        case SLACK_ADDED_SUCCESS:
            return state.set('slackAddedSuccess', true)
        case LOGOUT:
            return state = initialState
        case SET_OAUTH_STATE:
            return state.set('oauthState', action.payload)
        default:
            break
    }

    return state;
}

export function loadUser(){
    return dispatch => {
        try{
            let parseUser = Parse.User.current()

            if (parseUser){
                let slackTeam = parseUser.get('slackTeam')
                if (slackTeam){
                    slackTeam.fetch().then(fetched => {
                        dispatch(userLoggedIn(parseUser))
                    }).catch(error => {
                        console.error(error)
                        dispatch(logout()).then(() => window.location = '/')
                    })
                }

            }
        }catch(e){
            console.error(e)
        }
    }
}

export function authorizeSlackTeam(code, redirectUri){
    console.log('authorize slack team')
    return dispatch => {
        axios.post('/tokens/slack', {
            code,
            redirectUri,
        }).then(({data: {access_token: accessToken, user, team, slackTeam}}) => {
            console.log('authorized slack team slack team')
            dispatch({
                type: SLACK_ADDED_SUCCESS,
            })
        })
    }
}

export function installSlack(code, redirectUri){
    return dispatch => {
        dispatch({
            type: SLACK_INSTALL_REQUEST,
        })

        axios.post('/tokens/slack', {
            code,
            redirectUri,
        }).then(({data: {access_token: accessToken, user, team, slackTeam}}) => {
            console.log('slack app install flow - got access token')
            dispatch({
                type: SLACK_INSTALL_SUCCESS,
                payload: {
                    accessToken,
                    user,
                    team,
                    slackTeam,
                }
            })
        }).catch(error => {
            console.log('failed to install slack app')
            dispatch({
                type: SLACK_INSTALL_ERROR,
                error,
            })
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
        }).then(({data: {access_token: accessToken, user, team, slackTeam}}) => {
            dispatch({
                type: SLACK_AUTH_SUCCESS,
                payload: {
                    accessToken,
                    user,
                    team,
                    slackTeam,
                }
            })
            dispatch(linkUserWithProvider('slack', {
                access_token: accessToken,
                // id_token: authData.tokenId,
                id: user.id,
                firstName: user.name ? user.name.split(' ')[0] : '',
                lastName:  user.name ? user.name.split(' ')[1] : '',
                slackUserId: user.id,
                email: user.email,
                username: user.email,
            })).then(parseUser => {
                parseUser.set('slackTeamId', team.id)
                parseUser.set('slackUserId', user.id)
                let parseTeam = new SlackTeam()
                parseTeam.id = slackTeam.objectId
                parseUser.set('slackTeam', parseTeam)
                parseUser.save().then(savedUser => {
                    dispatch(loadUser())
                })
            })
        }).catch(error => {
            console.log(error);
            dispatch({
                type: SLACK_AUTH_ERROR,
                payload: {
                    ...error,
                }
            })
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

        return dispatch(linkUser(user, provider, authData))
    }
}

/**
* Should be a parse user
*/
export function userLoggedIn(user){
    return dispatch => {
        if (!user){
            return null;
        }
        dispatch({
            type: LOGIN_SUCCESS,
            payload: user.toJSON()
        })
        let authData = user.get('authData')
        if (authData){
            Object.keys(authData).forEach(provider => {
                dispatch({
                    type: SET_HAS_PROVIDER,
                    payload: {
                        provider
                    }
                })
            })
        }
    }

}

function linkUser(user, provider, authData){
    return (dispatch) => {
        let options = {
            authData
        }

        return user._linkWith(provider, options).then(savedUser => {
            console.log('Linked with ' + provider, savedUser)
            dispatch({
                type: SET_HAS_PROVIDER,
                payload: {
                    provider
                },
            })
            dispatch(userLoggedIn(savedUser))
            // Parse.Cloud.run('checkEmailAfterOAuth').then((response) => {
            //     dispatch(userLoggedIn(savedUser))
            // }).catch(error => console.error)
            return savedUser
        }).catch(error => {
            let email = user.get('email')
            switch (error.code){
                case 202:
                    console.log('user exists, can\'t link.. need to login first')
                    dispatch(connectExistingUser({email, provider, authData}))
                    break;
                case 206:
                    error.message = 'If you already have an account, you must log in before you can connect via a thrid party.'
                    dispatch(linkUserWithProviderError(provider, error))
                    break
                default:
                    console.error('Failed to link with' + provider, error)
                    dispatch(linkUserWithProviderError(provider, error))
                    break;
            }
        })
    }
}

export function connectExistingUser({email, provider, authData}){
    return (dispatch) => {
        console.warn('this method is not implemented!!!')
        // fetchUserByEmail(email).then(user => {
        //     if (user){
        //         dispatch(linkUser(user, provider, authData))
        //     }
        //     else {
        //         throw new Error('No user found.')
        //     }
        // }).catch(error => {
        //     console.error('Failed to link existing with' + provider, error)
        //     switch(error.code){
        //         case 206:
        //             error.message = 'If you already have an account, you must log in before you can connect via a thrid party.'
        //             break
        //     }
        //     dispatch(linkUserWithProviderError(provider, error))
        // })
    }
}

export function linkUserWithProviderError(providerName, error){
    return (dispatch, getState) => {
        console.error('Failed to link ' + providerName, error)
        dispatch({
            type: SET_PROVIDER_ERROR,
            error: {
                [providerName]: error
            }
        })
    }
}

export function logout(){
    return dispatch => {
        console.log('logging out...')
        let user = Parse.User.current()
        if (user){
            return Parse.User.logOut().then(() => {
                dispatch({
                    type: LOGOUT
                })
            }).catch(console.error)
        }
        return Promise.resolve()
    }
}

export function setOAuthState(){
    return (dispatch, getState) => {
        const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
        Cookie.set('oneroost_state', state)
        dispatch({
            type: SET_OAUTH_STATE,
            payload: state
        })
    }
}

export function getOAuthState(){
    let state = Cookie.get('oneroost_state')
    return state
}
