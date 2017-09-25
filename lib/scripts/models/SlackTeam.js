import {SLACK_TEAM_CLASSNAME} from './ModelConstants'

export const create = (Parse) => {
    class SlackTeam extends Parse.Object {
        constructor(args) {
            super(SLACK_TEAM_CLASSNAME)
            if (args) {
                this.set(args);
            }
        }

        setChannels(channels) {
            if (!channels){
                return this;
            }
            let channelMap = channels.reduce((map, channel) => {
                map[channel.id] = channel
                return map
            }, {})

            this.set('channels', channelMap)
            return this
        }

        addChannel(channel, selected=false) {
            if (!this.get('channels')){
                this.set('channels', {})
            }
            let channelMap = this.get('channels') || {}
            channelMap[channel.id] = channel
            if (selected){
                this.selectChannel(channel.id)
            } else {
                this.removeChannel(channel.id)
            }
            return this;
        }

        removeChannel(channelId){
            if (this.get('selectedChannels')){
                this.remove('selectedChannels', channelId)
            }
            return this
        }

        selectChannel(channelId){
            if (!this.get('channels')){
                this.set('channels', {})
            }
            if (!this.get('channels')[channelId]){
                console.warn('No channel with ID ' + channelId + ' found for this team. Please add it before selecting it.')
                return this;
            }
            if (!this.get('selectedChannels')){
                this.set('selectedChannels', [])
            }
            this.addUnique('selectedChannels', channelId)
            return this
        }

        //override
        // validate(attrs){
        //     const {teamId, channels} = attrs
        //     let keys = Object.keys(attrs)
        //     if(keys.indexOf('teamId') !== -1 && !teamId){
        //         return new Parse.Error('You must provide a teamID')
        //     }
        //     if (keys.indexOf('channels') !== -1 && !channels){
        //         return new Parse.Error('Channels must be not be null - empty objects are OK.')
        //     }
        //
        //     return false
        // }
    }

    Parse.Object.registerSubclass(SLACK_TEAM_CLASSNAME, SlackTeam)
    return SlackTeam
}

export default create
