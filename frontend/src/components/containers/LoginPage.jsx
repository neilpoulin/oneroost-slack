import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {loginWithSlack} from 'ducks/user'
import {Redirect} from 'react-router'
import GoogleLoginButton from './GoogleLoginButton'
import BasePage from './BasePage'

class LoginPage extends React.Component{
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        isLoading: PropTypes.bool,
        userName: PropTypes.string,
        teamName: PropTypes.string,
        location: PropTypes.any,
        hasGoogle: PropTypes.bool,
        hasSlack: PropTypes.bool,
        redirectUri: PropTypes.string,        
        //actions
        getToken: PropTypes.func.isRequired,
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
            location,
            hasGoogle,
            hasSlack,
            redirectUri
        } = this.props

        if ((isLoggedIn || error) && location.search){
            return <Redirect to={{
                pathname: '/settings',
                state: { from: location }
            }}/>
        }

        return (
            <BasePage>
                <div display-if={isLoggedIn} className="">
                    Successfully logged in as {userName} @ {teamName}
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
                            srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"/>
                    </a>
                </div>
                <div display-if={!hasGoogle}>
                    <GoogleLoginButton/>
                </div>
            </BasePage>)
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
    return {
        slackClientId: config.get('SLACK_CLIENT_ID'),
        ...params,
        isLoggedIn: user.get('isLoggedIn'),
        isLoading: user.get('isLoading'),
        error: user.get('error'),
        teamName: user.get('teamName'),
        userName: user.get('firstName') + ' ' + user.get('lastName'),
        userEmail: user.get('email'),
        redirectUri: `${config.get('HOSTNAME')}/login`,
        hasGoogle: user.get('hasGoogle', false),
        hasSlack: user.get('hasSlack', false)
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getToken: (code, redirectUri) => dispatch(loginWithSlack(code, redirectUri)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage)
