import {Parse} from 'parse/node'

const CLASSNAME = 'SlackTeam'

class SlackTeam extends Parse.Object {
    constructor() {
        super(CLASSNAME)

        // other initialization / default values
        this.set('channels', {})
        this.set('selectedChannels', [])
        this.name = null
    }

    setChannels(channels) {
        let channelMap = channels.reduce((map, channel) => {
            map[channel.id] = channel
            return map
        }, {})
        this.set('channels', channelMap)
        return this
    }

    addChannel(channel) {
        let channelMap = this.get('channels')
        channelMap[channel.id] = channel
        return this;
    }

    selectChannel(channelId){
        this.addUnique('selectedChannels', channelId)
        return this
    }
}

Parse.Object.registerSubclass(CLASSNAME, SlackTeam)

export default SlackTeam
