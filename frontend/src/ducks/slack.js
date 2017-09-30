import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import {getTeamId} from 'selectors/slack'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'
import {LOGIN_SUCCESS} from 'ducks/user'

export const LOAD_CHANNELS_REQUEST = 'oneroost/channels/LOAD_CHANNELS_REQUEST'
export const LOAD_CHANNELS_SUCCESS = 'oneroost/channels/LOAD_CHANNELS_SUCCESS'
export const LOAD_CHANNELS_ERROR = 'oneroost/channels/LOAD_CHANNELS_ERROR'
export const ADD_SELECTED_CHANNEL = 'oneroost/channels/ADD_SELECTED_CHANNEL'
export const REMOVE_SELECTED_CHANNEL = 'oneroost/channels/REMOVE_SELECTED_CHANNEL'
export const SET_VANITY_CHANNEL_NAME = 'oneroost/channels/SET_VANITY_CHANNEL_NAME'
export const SET_VANITY_TEAM_NAME = 'oneroost/slack/SET_VANITY_TEAM_NAME'
export const SET_VANITY_URL = 'oneroost/slack/SET_VANITY_URL'
export const SAVE_TEAM_REQUEST = 'oneroost/slack/SAVE_TEAM_REQUEST'
export const SAVE_TEAM_SUCCESS = 'oneroost/slack/SAVE_TEAM_SUCCESS'
export const SAVE_TEAM_ERROR = 'oneroost/slack/SAVE_TEAM_ERROR'
export const CLEAR_SAVE_MESSAGE = 'oneroost/slack/CLEAR_SAVE_MESSAGE'

const initialState = Immutable.fromJS({
    isLoading: false,
    isSaving: false,
    saveSuccess: false,
    error: null,
    selectedChannels: [],
    channels: [],
    channelVanityNames: {},
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case LOAD_CHANNELS_REQUEST:
            state = state.set('isLoading', true)
            break;
        case LOAD_CHANNELS_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('channels', action.payload.get('channels', Immutable.Map()))
            break;
        case ADD_SELECTED_CHANNEL:
            state = state.set('selectedChannels', state.get('selectedChannels').push(action.payload.get('channelId')))
            break;
        case REMOVE_SELECTED_CHANNEL:
            state = state.set('selectedChannels', state.get('selectedChannels').filter(id => id !== action.payload.get('channelId')))
            break;
        case LOAD_CHANNELS_ERROR:
            state = state.set('isLoading', false)
            break;
        case SET_VANITY_CHANNEL_NAME:
            state = state.setIn(['channelVanityNames', action.payload.get('channelId')], action.payload.get('name'))
            break;
        case LOGIN_SUCCESS:
            state = state.set('channels', action.payload.getIn(['slackTeam', 'channels'], Immutable.Map()).toList())
            state = state.set('selectedChannels', action.payload.getIn(['slackTeam', 'selectedChannels'], Immutable.List()))
            state = state.set('channelVanityNames', action.payload.getIn(['slackTeam', 'channelVanityNames'], Immutable.Map()))
            break;
        case SAVE_TEAM_REQUEST:
            state = state.set('isSaving', true)
            break;
        case SAVE_TEAM_SUCCESS:
            state = state.set('isSaving', false)
            state = state.set('saveSuccess', true)
            break
        case SAVE_TEAM_ERROR:
            state = state.set('error', action.get('error'))
            state = state.set('saveSuccess', false)
            state = state.set('isSaving', false)
            break;
        case CLEAR_SAVE_MESSAGE:
            state = state.set('saveSuccess', false)
            state = state.set('error', null)
            break;
        default:
            break;
    }
    return state;
}

export function toggleChannel(channelId, selected){
    return (dispatch, getState) => {
        dispatch({
            type: selected ? ADD_SELECTED_CHANNEL : REMOVE_SELECTED_CHANNEL,
            payload: {
                channelId,
            }
        })

        const state = getState()
        // const selected = isChannelSelected(state, channelId)
        const teamId = getTeamId(state)
        axios.post('/slackTeams', {
            selected,
            teamId,
            channelId,
        }).then(({data}) => {
            console.log('successfully posted message')
        }).catch(response => {
            console.error('failed to post message', response)
        })
    }
}

export function loadTeam(){
    return (dispatch, getState) => {
        const state = getState()
        const teamId = getTeamId(state)
        dispatch({
            type: LOAD_CHANNELS_REQUEST,
        })
        getSlackTeamByTeamId(teamId).then(team => {
            dispatch({
                type: LOAD_CHANNELS_SUCCESS,
                payload: team.toJSON(),
            })
        }).catch(error => {
            console.error(error)
            dispatch({
                type: LOAD_CHANNELS_ERROR,
                error,
                payload: {error}
            })
        })
    }
}

export function getSlackTeamByTeamId(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    query.equalTo('teamId', teamId)
    return query.first()
}


export function postMessage(channelId, message){
    return dispatch => {
        axios.post(`/slack/channels/${channelId}`, {
            message,
        }).then(({data}) => {
            console.log('successfully posted message')
        }).catch(response => {
            console.error('failed to post message', response)
        })
    }
}

export function requestPermission(permission){
    return dispatch => {
        console.log('requesting permissoins', permission)
    }
}

export function refreshChannels(){
    return dispatch => {
        dispatch({
            type: LOAD_CHANNELS_REQUEST
        })
        Parse.Cloud.run('refreshSlackChannels').then(({channels, code}) => {
            if (code === 403){
                console.warn('need permissions')
                dispatch(requestPermission('channels.list'))
                return;
            }
            console.log('refreshed channels')
            dispatch({
                type: LOAD_CHANNELS_SUCCESS,
                payload: {
                    channels
                }
            })
        }).catch(error => {
            dispatch({
                type: LOAD_CHANNELS_ERROR,
                payload: {
                    error,
                },
                error,
            })
        })
    }
}

export function saveTeam(){
    return (dispatch, getState) => {
        let user = Parse.User.current()
        let channelNames = getState().slack.get('channelVanityNames', {})
        let team = user.get('slackTeam')
        team.set('channelVanityNames', channelNames)
        return team.save().then(saved => {
            dispatch({
                type: SAVE_TEAM_SUCCESS,
                payload: {
                    team: saved.toJSON()
                }
            })
            return saved
        }).catch(error => {
            dispatch({
                type: SAVE_TEAM_ERROR,
                error,
            })
        })
    }
}

export function setVanityChannelName({channelId, name}){
    return (dispatch, getState) => {
        dispatch({
            type: SET_VANITY_CHANNEL_NAME,
            payload: {
                name,
                channelId,
            }
        })

    }
}

export function clearSaveMessages(){
    return {
        type: CLEAR_SAVE_MESSAGE,
    }
}
