import Immutable from 'immutable'

export function getTeamId(state){
    return state.login.getIn(['slackTeam', 'id'])
}

export function getSelectedChannels(state){
    return state.channels.get('selectedChannels', Immutable.List())
}

export function isChannelSelected(state, channelId){
    return getSelectedChannels(state).includes(channelId)
}
