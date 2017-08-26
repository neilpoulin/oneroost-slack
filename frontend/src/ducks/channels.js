import Immutable from 'immutable'

export const LOAD_CHANNELS_REQUEST = 'oneroost/channels/LOAD_CHANNELS_REQUEST'
export const LOAD_CHANNELS_SUCCESS = 'oneroost/channels/LOAD_CHANNELS_SUCCESS'
export const LOAD_CHANNELS_ERROR = 'oneroost/channels/LOAD_CHANNELS_ERROR'

const initialState = Immutable.fromJS({
    isLoading: false,
    selectedChannels: [],
    slackChannels: [],
})

export default function reducer(state=initialState, action){
    switch(action.type){
        case LOAD_CHANNELS_REQUEST:
            break;
        case LOAD_CHANNELS_REQUEST:
            break;
        case LOAD_CHANNELS_REQUEST:
            break;
        default:
            break;
    }
    return state;
}

export function loadChannels(){

}
