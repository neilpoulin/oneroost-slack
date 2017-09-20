import {fromJS} from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import {
    CREATE_FILTER_ALIAS,
    GET_FILTERS_ALIAS,
    GET_FILTERS_SUCCESS,
    GET_FILTERS_ERROR,
    GET_FILTERS_REQUEST,
    CREATE_FILTER_SUCCESS,
    CREATE_FILTER_ERROR,
    SAVE_REDIRECT_ERROR,
    SAVE_REDIRECT_SUCCESS,
    LOAD_REDIRECTS_REQUEST,
    LOAD_REDIRECTS_SUCCESS,
    LOAD_REDIRECTS_ERROR,
} from 'actions/gmail'

const initialState = {
    filters: [],
    redirects: [],
    error: null,
}

export default function reducer(state=initialState, action){
    state = fromJS(state)
    switch (action.type) {
        case GET_FILTERS_REQUEST:
            break;
        case GET_FILTERS_ERROR:
            break;
        case GET_FILTERS_SUCCESS:
            state = state.set('filters', action.payload)
            break;
        case CREATE_FILTER_SUCCESS:
            state = state.set('filters', state.get('filters').push(action.payload))
            state = state.set('error', null)
            break;
        case CREATE_FILTER_ERROR:
            state = state.set('error', action.error)
            break;
        case SAVE_REDIRECT_SUCCESS:
        case SAVE_REDIRECT_ERROR:
            break;
        case LOAD_REDIRECTS_SUCCESS:
            state = state.set('redirects', action.payload)
            break;
        case LOAD_REDIRECTS_ERROR:
            state = state.set('error', action.error)
            break;
        default:
            break;
    }
    return state.toJS()
}

export const aliases = {
    [GET_FILTERS_ALIAS]: getGmailFilters,
    [CREATE_FILTER_ALIAS]: createFilter,
}

export function getGmailFilters(){
    return (dispatch, getState) => {
        axios.get('https://www.googleapis.com/gmail/v1/users/me/settings/filters')
            .then(({data}) => {
                console.log('filters!', data)
                dispatch({
                    type: GET_FILTERS_SUCCESS,
                    payload: data.filter
                })
            }).catch(error => {
                console.error(error)
                dispatch({
                    type: GET_FILTERS_ERROR,
                    error,
                })
            })
    }
}

export function syncTeamRedirects(){
    return dispatch => {
        dispatch(getTeamRedirects()).then((redirects) => {
            //do the syncing
            console.log('got redirects.. now to sync')
        })
    }
}

export function getTeamRedirects(){
    return (dispatch, getState) => {
        let user = Parse.User.current()
        if (!user){
            console.error('user is not logged in')
            return null
        }
        let query = new Parse.Query('Redirect')
        query.equalTo('slackTeam', user.get('slackTeam'))
        return query.find().then(redirects => {
            dispatch({
                type: LOAD_REDIRECTS_SUCCESS,
                payload: redirects.map(r => r.toJSON())
            })
            return redirects
        }).catch(error => {
            dispatch({
                type: LOAD_REDIRECTS_ERROR,
                error,
                payload: error,
            })
        })
    }
}

export function logRedirect({
    senderName,
    senderEmail,
    blocked,
    destinationUrl
}){
    return dispatch => {
        Parse.Cloud.run('logRedirect', {
            senderName,
            senderEmail,
            blocked,
            destinationUrl
        }).then(() => {
            dispatch({
                type: SAVE_REDIRECT_SUCCESS
            })
        }).catch(error => {
            console.error(error)
            dispatch({
                type: SAVE_REDIRECT_ERROR
            })
        })
    }
}

// https://developers.google.com/gmail/api/v1/reference/users/settings/filters#resource
export function createFilter({senderName, senderEmail, vanityUrl, blocked}){
    return (dispatch, getState) => {
        if (!senderEmail){
            return null;
        }
        const labelName = `OneRoost | ${blocked ? 'Blocked' : 'Not Blocked'}`
        dispatch(logRedirect({
            senderName,
            senderEmail,
            blocked,
            destinationUrl: vanityUrl,
        }))
        axios.post('https://www.googleapis.com/gmail/v1/users/me/labels', {
            name: labelName
        }).then(({data}) => {
            console.log('created label!', data);
            return data;
        }).catch(error => {
            console.warn('failed to create label...trying to find it', error)
            return axios.get('https://www.googleapis.com/gmail/v1/users/me/labels')
                .then(({data}) => {
                    let foundLabel = data.labels.find(label => label.name === labelName)
                    if (foundLabel){
                        return foundLabel
                    }
                    throw new Error('Failed to create or find a label with name: ' + labelName)
                })
        }).then(label => {
            let action = {
                addLabelIds: [label.id],
            }
            if (blocked){
                action.removeLabelIds = ['INBOX']
            }

            let filter = {
                criteria: {
                    from: senderEmail
                },
                action,
            }
            return axios.post('https://www.googleapis.com/gmail/v1/users/me/settings/filters', filter)
        }).then(({data: filter}) => {
            dispatch({
                type: CREATE_FILTER_SUCCESS,
                payload: filter
            })
            return
        }).catch(error => {
            console.error(error)
            dispatch({
                type: CREATE_FILTER_ERROR,
                error
            })
        })
    }
}
