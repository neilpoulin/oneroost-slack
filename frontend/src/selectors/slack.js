import Immutable from 'immutable'

export function getTeamId(state){
    return state.user.get('teamId')
}

export function getSelectedChannels(state){
    return state.slack.get('selectedChannels', Immutable.List())
}

export function isChannelSelected(state, channelId){
    return getSelectedChannels(state).includes(channelId)
}

export function getChannels(state){
    const selectedChannels = getSelectedChannels(state)
    return state.slack.get('channels', Immutable.List()).toJS().map(c => {
        c.selected = selectedChannels.includes(c.id)
        return c
    })
}
