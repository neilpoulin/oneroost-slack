import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getOAuthState} from 'ducks/user'

class SlackLoginButton extends React.Component {
    static propTypes = {
        state: PropTypes.string,
        redirectUri: PropTypes.string,
        slackClientId: PropTypes.string,
    }

    render () {
        const {redirectUri, slackClientId, state} = this.props
        return <a href={`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team&client_id=${slackClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`}>
            <img alt="Sign in with Slack"
                height="40"
                width="172"
                src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"/>
        </a>
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config} = state
    return {
        slackClientId: config.get('SLACK_CLIENT_ID'),
        redirectUri: `${window.location.origin}/login`,
        state: getOAuthState()
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SlackLoginButton);
