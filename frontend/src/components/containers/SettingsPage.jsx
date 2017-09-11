import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {postMessage, refreshChannels} from 'ducks/slack'
import {loginWithSlack} from 'ducks/user'
import {toggleChannel} from 'ducks/slack'
import {getChannels} from 'selectors/slack'
import GoogleLoginButton from './GoogleLoginButton'
import Parse from 'parse'
import Checkbox from 'atoms/Checkbox'
import Clickable from 'atoms/Clickable'

class SettingsPage extends React.Component {
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        //actions
        postToChannel: PropTypes.func.isRequired,
    }

    render () {
        const {
            slackClientId,
            userName,
            teamName,
            teamId,
            channels,
            redirectUri,
            parseUserId,
            hasGoogle,
            hasSlack,
            selectChannel,
            refreshSlack,
        } = this.props

        return (
            <div>
                <h1>Settings</h1>
                <p>Welcome, {userName} @ {teamName}</p>
                <div>
                    ParseUserId = {parseUserId}
                </div>
                <div>
                    Slack Team Id = {teamId}
                </div>
                <div display-if={channels} className='channels'>
                    <h4>Channels</h4>
                    {channels.map((c, i) =>
                        <div key={`channel_${i}`} className='channel'>
                            <Checkbox label={`#${c.name}`} onChange={(selected) => selectChannel(c.id, selected)} selected={c.selected}/>
                        </div>)
                    }
                </div>
                <Clickable inline={true} outline={true} onClick={refreshSlack} text='Refresh Channels'/>

                <div display-if={!hasSlack}>
                    <a href={`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${slackClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`}>

                        <img alt="Sign in with Slack"
                            height="40"
                            width="172"
                            src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                            srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                    </a>
                </div>
                <div display-if={!hasGoogle}>
                    <GoogleLoginButton/>
                </div>
            </div>)
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config, user} = state
    let params = {}
    const parseUser = Parse.User.current()
    let channels = getChannels(state)
    return {
        slackClientId: config.get('SLACK_CLIENT_ID'),
        ...params,
        isLoggedIn: user.get('isLoggedIn'),
        isLoading: user.get('isLoading'),
        error: user.get('error'),
        teamName: user.get('teamName'),
        userName: user.get('firstName') + ' ' + user.get('lastName'),
        userEmail: user.get('email'),
        channels,
        teamId: user.get('teamId'),
        redirectUri: 'https://dev.oneroost.com/login',
        parseUserId: parseUser ? parseUser.id : null,
        hasGoogle: user.get('hasGoogle', false),
        hasSlack: user.get('hasSlack', false)
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        postToChannel: (channelId, message) => {
            dispatch(postMessage(channelId, message))
        },
        selectChannel: (channelId, selected) => {
            dispatch(toggleChannel(channelId, selected))
            dispatch(postMessage(channelId, `This channel has been ${selected ? 'added to' : 'removed from'} OneRoost`))
        },
        refreshSlack: () => {
            dispatch(refreshChannels())
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
