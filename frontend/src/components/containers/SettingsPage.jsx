import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {postMessage, refreshChannels, setVanityChannelName, saveTeam, clearSaveMessages} from 'ducks/slack'
import {toggleChannel} from 'ducks/slack'
import {getChannels} from 'selectors/slack'
import GoogleLoginButton from './GoogleLoginButton'
import Parse from 'parse'
import Checkbox from 'atoms/Checkbox'
import Clickable from 'atoms/Clickable'
import BasePage from 'BasePage'
import ChromeExtensionButton from 'molecules/ChromeExtensionButton'
import FlexBoxes from 'molecule/FlexBoxes'
import LogoutLink from 'containers/LogoutLink'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'
import SlackSvg from 'atoms/SlackSvg'
import GoogleLogo from 'atoms/GoogleLogo'
import Logo from 'atoms/Logo'

class SettingsPage extends React.Component {
    static propTypes = {
        code: PropTypes.string,
        slackClientId: PropTypes.string.isRequired,
        error: PropTypes.any,
        isLoggedIn: PropTypes.bool,
        userName: PropTypes.string,
        teamName: PropTypes.string,
        teamId: PropTypes.string,
        slackTeamId: PropTypes.string,
        channels: PropTypes.array,
        redirectUri: PropTypes.string,
        parseUserId: PropTypes.string,
        hasGoogle: PropTypes.bool,
        hasSlack: PropTypes.bool,
        saveSuccess: PropTypes.bool,
        teamImageUrl: PropTypes.string,
        //actions
        selectChannel: PropTypes.func.isRequired,
        refreshSlack: PropTypes.func.isRequired,
        postToChannel: PropTypes.func.isRequired,
        createChannelVanitySetter: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
    }

    render () {
        const {
            slackClientId,
            userName,
            teamName,
            teamId,
            channels,
            redirectUri,
            hasGoogle,
            hasSlack,
            selectChannel,
            refreshSlack,
            createChannelVanitySetter,
            saveSuccess,
            save,
            teamImageUrl
        } = this.props

        return (
            <BasePage>
                <div>
                    <section className='teamInfo'>
                        <h1>Settings</h1>
                        <div display-if={teamImageUrl} className='teamConnect'>
                            <img src={teamImageUrl} display-if={teamImageUrl}/><span className='plus'>+</span><Logo color='primary'/>
                        </div>
                        <div className='action'>
                            <Clickable to={`/teams/${teamId}`} inline outline text='Vendor Inbound Flow'/>
                        </div>
                        <p className='welcome'>
                            Welcome, {userName} @ {teamName} (<LogoutLink/>)
                        </p>
                    </section>
                    <FlexBoxes defaultContentStyles={true} columns={2}>
                        <div>
                            <h2 className='heading'><SlackSvg className='slackLogo'/>Slack Settings</h2>

                            <Clickable inline={true} outline={false} look='link' onClick={refreshSlack} text='Refresh Channels'/>
                            <div display-if={channels} className='channels'>
                                <h4>Channels</h4>
                                {channels.map((c, i) =>
                                    <div key={`channel_${i}`} className={`channel ${c.selected ? 'selected' : ''}`}>
                                        <Checkbox label={`#${c.name}`} onChange={(selected) => selectChannel(c.id, selected)} selected={c.selected}>
                                            <FormGroup display-if={c.selected} >
                                                <TextInput placeholder={`#${c.name}`} onChange={createChannelVanitySetter(c.id)} value={c.vanityName}/>
                                            </FormGroup>
                                        </Checkbox>
                                    </div>)
                                }
                            </div>
                            <div className='action'>
                                <Clickable text='Save Slack Settings' onClick={save}/>
                                <p display-if={saveSuccess}>Settings saved successfully</p>
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
                        </div>
                        <div>
                            <h2 className='heading'><GoogleLogo/>Google Settings</h2>

                            <div className='action'>
                                Connected with Google: {hasGoogle ? 'Yes!' : 'Not Yet'}
                            </div>
                            <div className='action' display-if={!hasGoogle}>
                                <GoogleLoginButton/>
                            </div>
                            <div className='action' display-if={hasGoogle}>
                                <ChromeExtensionButton/>
                            </div>
                        </div>
                    </FlexBoxes>
                </div>
            </BasePage>)
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config, user, slack} = state
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
        slackTeamId: user.get('slackTeamId'),
        redirectUri: 'https://dev.oneroost.com/login',
        parseUserId: parseUser ? parseUser.id : null,
        hasGoogle: user.get('hasGoogle', false),
        hasSlack: user.get('hasSlack', false),
        saveSuccess: slack.get('saveSuccess'),
        teamImageUrl: user.getIn(['teamImages', 'image_102'])
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
        },
        createChannelVanitySetter: (channelId) => (name) => {
            dispatch(setVanityChannelName({channelId, name}))
        },
        save: () => {
            dispatch(saveTeam()).then(() => {
                window.setTimeout(() => dispatch(clearSaveMessages()), 5000)
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
