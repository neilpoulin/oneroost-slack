import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {postMessage, refreshChannels} from 'ducks/slack'
import {loginWithSlack} from 'ducks/user'
import {toggleChannel} from 'ducks/slack'
import {getChannels} from 'selectors/slack'
import {Redirect} from 'react-router'
import GoogleLoginButton from './GoogleLoginButton'
import Parse from 'parse'
import Checkbox from 'atoms/Checkbox'
import Clickable from 'atoms/Clickable'

class LoginPage extends React.Component{
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        //actions
        getToken: PropTypes.func.isRequired,
        postToChannel: PropTypes.func.isRequired,
    }

    componentDidMount(){
        const {code, redirectUri} = this.props
        if (code){
            this.props.getToken(code, redirectUri)
        }
    }

    render () {
        const {
            slackClientId,
            isLoggedIn,
            error,
            isLoading,
            userName,
            teamName,
            teamId,
            teamImageUrl,
            userImageUrl,
            location,
            channels,
            redirectUri,
            parseUserId,
            hasGoogle,
            hasSlack,
            selectChannel,
            refreshSlack,
        } = this.props

        if ((isLoggedIn || error) && location.search){
            return <Redirect to={{
                pathname: '/login',
                state: { from: location }
            }}/>
        }

        return (
            <div>
            <h1>OneRoost</h1>
            <div display-if={isLoggedIn} className="">
                <p>Welcome, {userName} @ {teamName}</p>
                <div className="userInfo">
                    <div className="images">
                        <div display-if={userImageUrl}>
                            <img src={userImageUrl} />
                        </div>
                        <div display-if={teamImageUrl}>
                            <img src={teamImageUrl} />
                        </div>
                    </div>
                    <div display-if={channels}>
                        <h4>Channels</h4>
                        {channels.map((c, i) =>
                            <div key={`channel_${i}`}>
                                <Checkbox label={`#${c.name}`} onChange={(selected) => selectChannel(c.id, selected)} selected={c.selected}/>
                            </div>)
                        }
                        <Clickable onClick={refreshSlack} text='Refresh Channels'/>
                    </div>
                </div>
            </div>
            <div display-if={error}>
                Something went wrong while authenticating with Slack: {error}
            </div>
            <div display-if={isLoading}>
                Loading...
            </div>
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
            <div>
                ParseUserId = {parseUserId}
            </div>
            <div>
                Slack Team Id = {teamId}
            </div>

        </div>)
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config, user} = state
    const {location} = ownProps
    let params = {}
    if (location.search){
        const {code, state: stateParam, error} = qs.parse(location.search, { ignoreQueryPrefix: true })
        params = {code, state: stateParam, error}
    }
    const parseUser = Parse.User.current()
    let channels = getChannels(state)
    return {
        slackClientId: config.get('SLACK_CLIENT_ID'),
        ...params,
        isLoggedIn: user.get('isLoggedIn'),
        isLoading: user.get('isLoading'),
        error: user.get('error'),
        teamName: user.get('teamName'),
        teamImageUrl: user.getIn(['slackTeam', 'image_230']),
        userImageUrl: user.getIn(['slackUser', 'image_72']),
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

const mapDispatchToprops = (dispatch, ownProps) => {
    return {
        getToken: (code, redirectUri) => dispatch(loginWithSlack(code, redirectUri)),
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

export default connect(mapStateToProps, mapDispatchToprops)(LoginPage)
