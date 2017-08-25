import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {loginWithSlack} from 'ducks/login'
import {Redirect} from 'react-router'
import Immutable from 'immutable'

class LoginPage extends React.Component{
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        getToken: PropTypes.func.isRequired
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
            userEmail,
            teamName,
            teamId,
            teamImageUrl,
            userImageUrl,
            location,
            channels,
            redirectUri,
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
                                {channels.map((c, i) => <div key={`channel_${i}`}>
                                <a href={`slack://channel?id=${c.id}&team=${teamId}`}>#{c.name}</a>
                            </div>)
                        }
                    </div>
                </div>

            </div>
            <div display-if={error}>
                Something went wrong while authenticating with Slack: {error}
            </div>
            <div display-if={isLoading}>
                Loading...
            </div>
            <div display-if={!isLoggedIn}>
                <a href={`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${slackClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`}>
                    <img alt="Sign in with Slack"
                        height="40"
                        width="172"
                        src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                        srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                </a>
            </div>

        </div>
    )
}
}

const mapStateToProps = (state, ownProps) => {
    const {config, login} = state
    const {location} = ownProps
    let params = {}
    if (location.search){
        const {code, state: stateParam, error} = qs.parse(location.search, { ignoreQueryPrefix: true })
        params = {code, state: stateParam, error}
    }

    return {
        slackClientId: config.get('slackClientId'),
        ...params,
        isLoggedIn: login.get('isLoggedIn'),
        isLoading: login.get('isLoading'),
        error: login.get('error'),
        teamName: login.getIn(['slackTeam', 'name']),
        teamImageUrl: login.getIn(['slackTeam', 'image_230']),
        userImageUrl: login.getIn(['slackUser', 'image_72']),
        userName: login.getIn(['slackUser', 'name']),
        userEmail: login.getIn(['slackUser', 'email']),
        channels: login.get('channels', Immutable.List()).toJS(),
        teamId: login.getIn(['slackTeam', 'id']),
        redirectUri: 'https://dev.oneroost.com/login'
    }
}

const mapDispatchToprops = (dispatch, ownProps) => {
    return {
        getToken: (code, redirectUri) => dispatch(loginWithSlack(code, redirectUri))
    }
}

export default connect(mapStateToProps, mapDispatchToprops)(LoginPage)
