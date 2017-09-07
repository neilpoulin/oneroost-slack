import Immutable from 'immutable'
import axios from 'axios'
import Parse from 'parse'
import {getTeamId} from 'selectors/slack'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'

export const LOAD_CHANNELS_REQUEST = 'oneroost/channels/LOAD_CHANNELS_REQUEST'
export const LOAD_CHANNELS_SUCCESS = 'oneroost/channels/LOAD_CHANNELS_SUCCESS'
export const LOAD_CHANNELS_ERROR = 'oneroost/channels/LOAD_CHANNELS_ERROR'
export const ADD_SELECTED_CHANNEL = 'oneroost/channels/ADD_SELECTED_CHANNEL'
export const REMOVE_SELECTED_CHANNEL = 'oneroost/channels/REMOVE_SELECTED_CHANNEL'

const initialState = Immutable.fromJS({
    isLoading: false,
    selectedChannels: [],
    slackChannels: [],
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case LOAD_CHANNELS_REQUEST:
            state = state.set('isLoading', true)
            break;
        case LOAD_CHANNELS_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('slackChannels', action.payload.get('channels', Immutable.Map()))
            state = state.set('selectedChannels', action.payload.get('selectedChannels', Immutable.List()))
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
