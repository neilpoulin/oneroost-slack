import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {loginWithSlack, setOAuthState, getOAuthState, installSlack} from 'ducks/user'
import {Redirect} from 'react-router'
import {withRouter} from 'react-router-dom'
import BasePage from './BasePage'
import Logo from 'atoms/Logo'
import Clickable from 'atoms/Clickable'
import SlackLoginButton from './SlackLoginButton'
import SlackAddButton from './SlackAddButton'
import FlexBoxes from 'molecule/FlexBoxes'
import GoogleLoginButton from 'GoogleLoginButton'
import SlackSvg from 'atoms/SlackSvg'

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
        installSuccess: PropTypes.bool,
        state: PropTypes.string,
        install: PropTypes.bool,
        //actions
        getToken: PropTypes.func.isRequired,
        generateOAuthState: PropTypes.func,
    }

    static defaultProps = {
        redirectPath: 'login',
        install: false,
    }

    componentDidMount(){
        const {code, redirectUri, state, generateOAuthState} = this.props
        if (code){
            if (state === getOAuthState()){
                this.props.getToken(code, redirectUri)
            } else {
                console.error('state param did not match: returned =' + state + ', saved = ' + getOAuthState())
            }
        } else {
            generateOAuthState()
        }
    }

    render () {
        const {
            isLoggedIn,
            error,
            isLoading,
            userName,
            teamName,
            location,
            hasSlack,
            installSuccess,
        } = this.props

        if ((isLoggedIn || error) && location.search){
            return <Redirect to={{
                pathname: '/settings',
                state: { from: location }
            }}/>
        }

        return (
            <BasePage>
                <div className='container'>
                    <div className='logo'>
                        <Logo size='heading' color='primary'/>
                    </div>
                    <div display-if={isLoggedIn} className="success">
                        <p className=''>Successfully logged in as {userName} <span display-if={teamName}>@ {teamName}</span></p>
                        <div className='action'>
                            <Clickable to='/settings' text='View my settings' inline={true}/>
                        </div>
                    </div>
                    <div display-if={installSuccess}>
                        <p>You have successfully installed OneRoost to your team. Now, please log in below.</p>
                        <div>
                            <SlackLoginButton/>
                        </div>
                    </div>
                    <div display-if={error}>
                        Something went wrong while authenticating with Slack: {error}
                    </div>
                    <div display-if={isLoading}>
                        Loading...
                    </div>
                    <div display-if={!hasSlack && !isLoading && !isLoggedIn && !installSuccess} className='action'>

                        <section className={'siginContainer'}>
                            <div className={'signinActions'} display-if={!installSuccess}>
                                <div className='action'><GoogleLoginButton/></div>
                            </div>
                        </section>
                        <section className={'slackContainer'}>
                            <h2 className='heading title'><SlackSvg className={'slackLogo'}/> Slack</h2>
                            <div className={'slackActions'}>
                                <div>
                                    <SlackLoginButton/>
                                    <p className='description' >Already have OneRoost in Slack? Sign in above.</p>
                                </div>
                                <div >
                                    <SlackAddButton/>
                                    <p className='description'>Does your team need to install OneRoost? Install using the button above.</p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </BasePage>)
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config, user} = state
    const {location, install} = ownProps
    let {redirectPath} = ownProps
    let params = {
        state: getOAuthState()
    }
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
        redirectUri: `${window.location.origin}/${(install && !user.get('installSuccess')) ? 'install-success' : 'login'}`,
        hasSlack: user.get('hasSlack', false),
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getToken: (code, redirectUri) => {
            if (ownProps.install){
                dispatch(installSlack(code, redirectUri))
            }else {
                dispatch(loginWithSlack(code, redirectUri))
            }

        },
        generateOAuthState: () => dispatch(setOAuthState())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginPage))
