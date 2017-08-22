import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {loginWithSlack} from 'ducks/login'
import {Redirect} from 'react-router'

class LoginPage extends React.Component{
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        getToken: PropTypes.func.isRequired
    }


    componentDidMount(){
        const {code} = this.props
        if (code){
            this.props.getToken(code)
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
            teamImageUrl,
            userImageUrl,
            location,
        } = this.props

        if ((isLoggedIn || error) && location.search){
            return <Redirect to={{
                    pathname: '/login',
                    state: { from: location }
                  }}/>
        }

        return (
            <div>
                <h1>Hello Login</h1>
                <div display-if={isLoggedIn}>
                    <div display-if={userImageUrl}>
                        <img src={userImageUrl} />
                    </div>
                    Welcome, {userName} @ {teamName}
                </div>
                <div display-if={error}>
                    Something went wrong while authenticating with Slack: {error}
                </div>
                <div display-if={isLoading}>
                    Loading...
                </div>
                <div display-if={!isLoggedIn}>
                    <a href={`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${slackClientId}`}>
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
        userEmail: login.getIn(['slackUser', 'email'])
    }
}

const mapDispatchToprops = (dispatch, ownProps) => {
    return {
        getToken: (code) => dispatch(loginWithSlack(code))
    }
}

export default connect(mapStateToProps, mapDispatchToprops)(LoginPage)
