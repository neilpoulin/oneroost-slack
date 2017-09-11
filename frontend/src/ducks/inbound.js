import Immutable from 'immutable'
// import axios from 'axios'

export const LOAD_TEAM_REQUEST = 'oneroost/inbound/LOAD_TEAM_REQUEST'
export const LOAD_TEAM_SUCCESS = 'oneroost/inbound/LOAD_TEAM_SUCCESS'
export const LOAD_TEAM_ERROR = 'oneroost/inbound/LOAD_TEAM_ERROR'

const initialState = Immutable.fromJS({
    teamId: null,
    isLoading: false,
    hasLoaded: false,
})

export default function reducer(state=initialState, action){
    switch (action.type) {
        case LOAD_TEAM_REQUEST:
            state = state.set('isLoading', true)
            state = state.set('teamId', action.payload.get('teamId'))
            break
        default:
            break
    }
    return state
}

export function loadTeam(teamId){
    return dispatch => {
        dispatch({
            type: LOAD_TEAM_REQUEST,
            payload: {
                teamId
            }
        })
    }
}
