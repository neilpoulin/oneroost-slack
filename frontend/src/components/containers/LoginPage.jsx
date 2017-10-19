import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import qs from 'qs'
import {loginWithSlack, setOAuthState, getOAuthState} from 'ducks/user'
import {Redirect} from 'react-router'
import {withRouter} from 'react-router-dom'
import BasePage from './BasePage'
import Logo from 'atoms/Logo'
import Clickable from 'atoms/Clickable'
import SlackLoginButton from './SlackLoginButton'
import SlackAddButton from './SlackAddButton'
import FlexBoxes from 'molecule/FlexBoxes'

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
        //actions
        getToken: PropTypes.func.isRequired,
        generateOAuthState: PropTypes.func,
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
                        <p className=''>Successfully logged in as {userName} @ {teamName}</p>
                        <div className='action'>
                            <Clickable to='/settings' text='View my settings' inline={true}/>
                        </div>
                    </div>
                    <div display-if={installSuccess}>
                        <p>You have successfully installed OneRoost to your team. Now, please log in below.</p>
                    </div>
                    <div display-if={error}>
                        Something went wrong while authenticating with Slack: {error}
                    </div>
                    <div display-if={isLoading}>
                        Loading...
                    </div>
                    <div display-if={!hasSlack && !isLoading} className='action'>
                        <FlexBoxes columns={2}>
                            <section>
                                <h3 className='title'>Login</h3>
                                <SlackLoginButton/>
                                <p className='description'>Already have OneRoost in Slack? Sign in above.</p>
                            </section>
                            <section>
                                <h3 className='title'>Install</h3>
                                <SlackAddButton/>
                                <p className='description'>Does your team need to install OneRoost? Install using the button above.</p>
                            </section>
                        </FlexBoxes>
                    </div>
                </div>
            </BasePage>)
    }
}

const mapStateToProps = (state, ownProps) => {
    const {config, user} = state
    const {location} = ownProps
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
        redirectUri: `${config.get('HOSTNAME')}/login`,
        hasSlack: user.get('hasSlack', false),
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getToken: (code, redirectUri) => dispatch(loginWithSlack(code, redirectUri)),
        generateOAuthState: () => dispatch(setOAuthState())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginPage))
