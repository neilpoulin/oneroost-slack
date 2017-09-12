import Immutable from 'immutable'
import Parse from 'parse'
import {SLACK_TEAM_CLASSNAME} from 'models/ModelConstants'

export const LOAD_TEAM_REQUEST = 'oneroost/inbound/LOAD_TEAM_REQUEST'
export const LOAD_TEAM_SUCCESS = 'oneroost/inbound/LOAD_TEAM_SUCCESS'
export const LOAD_TEAM_ERROR = 'oneroost/inbound/LOAD_TEAM_ERROR'

export const SET_FORM_VALUE = 'oneroost/inbound/SET_FORM_VALUE'

const initialState = Immutable.fromJS({
    isLoading: false,
    hasLoaded: false,
    teamId: null,
    hasLoaded: false,
    teamName: null,
    channels: [],
    formInput: {}
})

export default function reducer(state=initialState, action){
    switch (action.type) {
        case LOAD_TEAM_REQUEST:
            state = state.set('isLoading', true)
            state = state.set('teamId', action.payload.get('teamId'))
            break
        case LOAD_TEAM_SUCCESS:
            state = state.set('isLoading', false)
            state = state.set('hasLoaded', true)
            state = state.set('teamName', action.payload.get('name'))
            state = state.set('channels', action.payload.get('channels').toList().filter(c => action.payload.get('selectedChannels').includes(c.get('id'))))
            break;
        case SET_FORM_VALUE:
            state = state.setIn(action.payload.name.split('.'), action.payload.value)
            break;
        default:
            break
    }
    return state
}

//User dot-delimited to nest values
export function setFormValue(name, value){
    return {
        type: SET_FORM_VALUE,
        payload: {
            name,
            value,
        }
    }
}

export function getSlackTeamById(teamId){
    let query = new Parse.Query(SLACK_TEAM_CLASSNAME)
    return query.get(teamId)
}

export function loadTeam(teamId){
    return dispatch => {
        dispatch({
            type: LOAD_TEAM_REQUEST,
            payload: {
                teamId
            }
        })
        getSlackTeamById(teamId).then(team => {
            dispatch({
                type: LOAD_TEAM_SUCCESS,
                payload: team.toJSON(),
            })
        })
    }
}
