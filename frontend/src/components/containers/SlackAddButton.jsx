import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getOAuthState} from 'ducks/user'

class SlackAddButton extends React.Component {
    static propTypes = {
        state: PropTypes.string,
        redirectUri: PropTypes.string,
        slackClientId: PropTypes.string,
    }
    render () {
        const {redirectUri, slackClientId, state} = this.props
        return <a href={`https://slack.com/oauth/authorize?&client_id=${slackClientId}&scope=chat:write:bot,channels:write,channels:read&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`}>
            <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/>
        </a>
    }
}


const mapStateToProps = (state, ownProps) => {
    const {config} = state
    return {
        slackClientId: config.get('SLACK_CLIENT_ID'),
        redirectUri: `${config.get('HOSTNAME')}/login`,
        state: getOAuthState()
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SlackAddButton);
