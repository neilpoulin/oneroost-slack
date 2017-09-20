import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import SlackTeam from 'models/SlackTeam'

export const SLACK_AUTH_REQUEST = 'oneroost/login/SLACK_AUTH_REQUEST'
export const SLACK_AUTH_SUCCESS = 'oneroost/login/SLACK_AUTH_SUCCESS'
export const SLACK_AUTH_ERROR = 'oneroost/login/SLACK_AUTH_ERROR'

export const LOGIN_SUCCESS = 'oneroost/login/LOGIN_SUCCESS'
export const SET_PROVIDER_ERROR = 'oneroost/login/PROVIDER_ERROR'
export const SET_HAS_PROVIDER = 'oneroost/login/SET_HAS_PROVIDER'

export const LOGOUT = 'oneroost/login/LOGOUT'

const initialState = Immutable.Map({
    isLoggedIn: false,
    isLoading: false,
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
            let slackUser = action.payload.get('user')
            if (slackUser){
                if ( slackUser.name){
                    let splitName = slackUser.name.split(' ')
                    let firstName = slitName[0]
                    let lastName = splitName.length > 0 ? splitName[1] : ''
                    state = state.set('firstName', firstName)
                        .set('lastName', lastName)
                }
                state = state.set('email', slackUser.email)
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
            break;
        case LOGOUT:
            return state = initialState
        default:
            break
    }

    return state;
}

export function loadUser(){
    return dispatch => {
        let parseUser = Parse.User.current()

        if (parseUser){
            let slackTeam = parseUser.get('slackTeam')
            if (slackTeam){
                slackTeam.fetch().then(fetched => {
                    dispatch(userLoggedIn(parseUser))
                })
            }

        }
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
        }).then( ({data: {access_token: accessToken, user, team, channels, slackTeam}}) => {
            dispatch({
                type: SLACK_AUTH_SUCCESS,
                payload: {
                    accessToken,
                    user,
                    team,
                    channels,
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
        }).catch( error => {
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
            switch (error.code){
                case 202:
                    console.log('user exists, can\'t link.. need to login first')
                    let email = user.get('email')
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
        fetchUserByEmail(email).then(user => {
            if (user){
                dispatch(linkUser(user, provider, authData))
            }
            else {
                throw new Error('No user found.')
            }
        }).catch(error => {
            console.error('Failed to link existing with' + provider, error)
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
            Parse.User.logOut().then(() => {
                dispatch({
                    type: LOGOUT
                })
            }).catch(console.error)
        }
    }
}
