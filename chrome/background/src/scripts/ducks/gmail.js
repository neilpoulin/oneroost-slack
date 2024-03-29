import {fromJS} from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import Raven from 'raven-js'
import {
    CREATE_FILTER_ALIAS,
    GET_FILTERS_ALIAS,
    GET_FILTERS_SUCCESS,
    GET_FILTERS_ERROR,
    GET_FILTERS_REQUEST,
    CREATE_FILTER_SUCCESS,
    CREATE_FILTER_ERROR,
    SAVE_REDIRECT_REQUEST,
    SAVE_REDIRECT_ERROR,
    SAVE_REDIRECT_SUCCESS,
    LOAD_REDIRECTS_REQUEST,
    LOAD_REDIRECTS_SUCCESS,
    LOAD_REDIRECTS_ERROR,
    RESET_USER_REDIRECT,
} from 'actions/gmail'

const GMAIL_LABEL_NAME_BLOCKED = 'OneRoost | Blocked'
const GMAIL_LABEL_NAME_NOT_BLOCKED = 'OneRoost | Not Blocked'

export const aliases = {
    [GET_FILTERS_ALIAS]: getGmailFilters,
    [CREATE_FILTER_ALIAS]: createFilter,
}

const initialState = {
    filters: [],
    redirectsSaving: false,
    redirectsLoading: false,
    redirectSaveSuccess: false,
    filterSaveSuccess: false,
    redirects: [],
    redirectsByEmail: {},
    error: null,
    userBlocked: false,
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
            state = state.set('filterSaveSuccess', true)
            break;
        case CREATE_FILTER_ERROR:
            state = state.set('error', action.error)
            state = state.set('filterSaveSuccess', false)
            break;
        case SAVE_REDIRECT_REQUEST:
            state = state.set('redirectsSaving', true)
            state = state.set('userBlocked', action.payload.blocked)
            break;
        case SAVE_REDIRECT_SUCCESS:
            state = state.set('redirectsSaving', false)
            state = state.set('redirectSaveSuccess', true)
            state = state.setIn(['redirectsByEmail'], {[action.payload.senderEmail] : action.payload} )
            break;
        case SAVE_REDIRECT_ERROR:
            state = state.set('redirectsSaving', false)
            state = state.set('redirectSaveSuccess', false)
            break;
        case LOAD_REDIRECTS_REQUEST:
            state = state.set('redirectsLoading', true)
            break;
        case LOAD_REDIRECTS_SUCCESS:
            state = state.set('redirects', action.payload)
            state = state.mergeIn(['redirectsByEmail'], action.payload.reduce((byEmail, redirect) => {
                byEmail[redirect.senderEmail] = redirect
                return byEmail
            }, {}))
            state = state.set('redirectsLoading', false)
            break;
        case LOAD_REDIRECTS_ERROR:
            state = state.set('error', action.error)
            state = state.set('redirectsLoading', false)
            break;
        case RESET_USER_REDIRECT:
            state = state.set('userBlocked', false)
            state = state.set('redirectSaveSuccess', false)
            state = state.set('redirectsSaving', false)
            break;
        default:
            break;
    }
    return state.toJS()
}


export function getCurrentFilters() {
    return axios.get('https://www.googleapis.com/gmail/v1/users/me/settings/filters').then(({data: {filter=[]}}) => filter)
}

export function getGmailFilters(){
    return (dispatch, getState) => {
        getCurrentFilters
            .then((filters) => {
                console.log('filters!', filters)
                dispatch({
                    type: GET_FILTERS_SUCCESS,
                    payload: filters
                })
            }).catch(error => {
                console.error(error)
                Raven.captureException(error)
                dispatch({
                    type: GET_FILTERS_ERROR,
                    error,
                })
            })
    }
}

export function syncTeamRedirects(){
    console.log('syncing team redirects')
    return (dispatch, getState) => {
        console.log('syncing team info')
        let token = getState().user.google_access_token
        console.log('setting up axios headers with token ', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        dispatch({
            type: LOAD_REDIRECTS_REQUEST
        })
        let teamRedirectsAsync = dispatch(getTeamRedirects())
            .then(results => {
                console.log('teamRedirectSync results', results)
                return results.map(r => {
                    console.log('result', r)
                    return r.toJSON()
                })
            }).catch(error => {
                console.error('failed to sync team redirects', error)
                Raven.captureException(error)
            })

        let labelsAsync = getCurrentLabels()
        let filtersAsync = getCurrentFilters()
        return Promise.all([teamRedirectsAsync, labelsAsync, filtersAsync]).then(([redirects, labels, filters]) => {
            //do the syncing
            console.log('got redirects and current labels.. now to sync', redirects, labels, filters)
            const labelsByName = labels.reduce((labelMap, label) => {
                labelMap[label.name] = label
                return labelMap
            }, {})
            let blockedLabel = labelsByName[GMAIL_LABEL_NAME_BLOCKED]
            let notBlockedLabel = labelsByName[GMAIL_LABEL_NAME_NOT_BLOCKED]

            console.log('blockedLabel', blockedLabel)
            console.log('notBlockedLabel', notBlockedLabel)
            let labelAsyncs = []
            if (!blockedLabel){
                labelAsyncs.push(createLabel({labelName: GMAIL_LABEL_NAME_BLOCKED}))
            } else {
                labelAsyncs.push(Promise.resolve(blockedLabel))
            }

            if(!notBlockedLabel){
                labelAsyncs.push(createLabel({labelName: GMAIL_LABEL_NAME_NOT_BLOCKED}))
            } else {
                labelAsyncs.push(Promise.resolve(notBlockedLabel))
            }

            let filtersByEmail = filters.reduce((map, filter) => {
                if (filter.criteria && filter.criteria.from)
                {
                    map[filter.criteria.from] = filter
                }
                return map;
            }, {})
            //TODO go though redirects first and decide what to do about it
            Promise.all(labelAsyncs).then(([blockedLabel, notBlockedLabel]) => {
                redirects.forEach(redirect => {
                    // let redirect = redirectsByEmail[filter.criteria.from]
                    let filter = filtersByEmail[redirect.senderEmail]

                    let addLabelIds = filter ? new Set(filter.action.addLabelIds || []) : new Set()
                    let removeLabelIds = filter  ?new Set(filter.action.removeLabelIds || []) : new Set()
                    let hasBlockedLabel = addLabelIds.has(blockedLabel.id)
                    let hasNotBlockedLabel = addLabelIds.has(notBlockedLabel.id)
                    let hasSkipInbox = removeLabelIds.has('INBOX')
                    // let hasRemoveLabel = removeLabelIds.filter(id => oneroostLabelIdSet.has(id))
                    let action = {}
                    let doCreateFilter = false
                    let doDeleteFilter = false

                    if (redirect.blocked){
                        if (!hasSkipInbox){
                            action.removeLabelIds =['INBOX']
                            doCreateFilter = true;
                        }
                        if (hasNotBlockedLabel){
                            doDeleteFilter = true
                        }
                        if (!hasBlockedLabel){
                            doCreateFilter = true;
                            action.addLabelIds = [blockedLabel.id]
                        }
                    } else {
                        if (hasSkipInbox){
                            doDeleteFilter = true
                        }
                        if (hasBlockedLabel){
                            doDeleteFilter = true
                        }
                        if (!hasNotBlockedLabel){
                            action.addLabelIds = [notBlockedLabel.id]
                            doCreateFilter = true
                        }
                    }
                    if (doDeleteFilter){
                        console.log('deleting filter after sync!!', filter)
                        deleteFilter(filter)
                    }
                    if(doCreateFilter){
                        console.log('creating filter after sync!!', action)
                        createGmailFilter({senderEmail: redirect.senderEmail, action})
                    }
                })
            }).catch(error => {
                console.warn('Unable to sync filters', error)
                Raven.captureException(error)
            })

            dispatch({
                type: LOAD_REDIRECTS_SUCCESS,
                payload: redirects
            })
        }).catch(error => {
            console.error('failed to sync team vendor filters')
            Raven.captureException(error)
            dispatch({
                type: LOAD_REDIRECTS_ERROR,
                error,
                payload: {
                    error,
                    message: 'Failed to sync team vendor filters'
                }
            })
        })
    }
}

export function getTeamRedirects(){
    return (dispatch, getState) => {
        let user = Parse.User.current()
        if (!user){
            console.error('user is not logged in')
            return Promise.resolve([])
        }
        let query = new Parse.Query('Redirect')
        query.include('updatedBy')
        query.equalTo('slackTeam', user.get('slackTeam'))
        query.equalTo('createdBy', user)
        dispatch({
            type: LOAD_REDIRECTS_REQUEST
        })
        return query.find().then(redirects => {
            dispatch({
                type: LOAD_REDIRECTS_SUCCESS,
                payload: redirects.map(r => r.toJSON())
            })
            return redirects
        }).catch(error => {
            Raven.captureException(error)
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
        dispatch({
            type: SAVE_REDIRECT_REQUEST,
            payload: {
                blocked,
                senderEmail,
                senderName
            }
        })
        Parse.Cloud.run('logRedirect', {
            senderName,
            senderEmail,
            blocked,
            destinationUrl
        }).then(({redirect}) => {
            dispatch({
                type: SAVE_REDIRECT_SUCCESS,
                payload: redirect.toJSON()
            })
        }).catch(error => {
            console.error(error)
            Raven.captureException(error)
            dispatch({
                type: SAVE_REDIRECT_ERROR
            })
        })
    }
}

export function getCurrentLabels(){
    return axios.get('https://www.googleapis.com/gmail/v1/users/me/labels').then(({data: {labels=[]}}) => labels)
}

export function createLabel({labelName}){
    return axios.post('https://www.googleapis.com/gmail/v1/users/me/labels', {
        name: labelName
    }).then(({data}) => data)
}

export function createGmailFilter({
    senderEmail,
    action
}){
    let filter = {
        criteria: {
            from: senderEmail
        },
        action,
    }
    return axios.post('https://www.googleapis.com/gmail/v1/users/me/settings/filters', filter).then(({data}) => data).catch(({message, response}) => {
        switch(response.status){
            case 400:
                console.log('filter already exists', response.data)
                break
            default:
                console.error(message, response.data)
                break;
        }
    })
}

export function deleteFilter({id}){
    return axios.delete(`https://www.googleapis.com/gmail/v1/users/me/settings/filters/${id}`).then(({data}) => data)
}

// https://developers.google.com/gmail/api/v1/reference/users/settings/filters#resource
export function createFilter({senderName, senderEmail, destinationUrl, blocked}){
    console.log('Creating filter...')
    return (dispatch, getState) => {
        if (!senderEmail){
            console.log('sender email is null, cannot create a filter')
            return null;
        }
        const labelName = blocked ? GMAIL_LABEL_NAME_BLOCKED : GMAIL_LABEL_NAME_NOT_BLOCKED
        dispatch(logRedirect({
            senderName,
            senderEmail,
            blocked,
            destinationUrl,
        }))
        createLabel({
            labelName
        }).then(data => {
            console.log('created label!', data);
            return data;
        }).catch(error => {
            console.warn('failed to create label...trying to find it', error)
            return getCurrentLabels()
                .then(labels => {
                    let foundLabel = labels.find(label => label.name === labelName)
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
            Raven.captureException(error)
            dispatch({
                type: CREATE_FILTER_ERROR,
                error
            })
        })
    }
}
