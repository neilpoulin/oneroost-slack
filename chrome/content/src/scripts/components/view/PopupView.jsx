import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import Clickable from 'atoms/Clickable';
import {LOG_OUT_ALIAS, LOG_IN_GOOGLE_ALIAS} from 'actions/user'
import {getFullName} from 'selectors/user'
import {REFRESH_SERVER_CONFIG_ALIAS, SET_SERVER_URL} from 'actions/config'

// import {handleSignInClick, handleSignOutClick} from "background/googleAuth"

class PopupView extends Component {
    static propTypes = {
        userId: PropTypes.string,
        fullName: PropTypes.string,
        logOut: PropTypes.func,
        isLoggedIn: PropTypes.bool,
        logInGoogle: PropTypes.func,
        email: PropTypes.string,
        settingsUrl: PropTypes.string,
        isAdmin: PropTypes.bool,
        serverUrl: PropTypes.string,
        setServerUrl: PropTypes.string,
        helpUrl: PropTypes.string,
    }

    render() {
        const {
            userId,
            fullName,
            logOut,
            isLoggedIn,
            logInGoogle,
            email,
            settingsUrl,
            isAdmin,
            serverUrl,
            setServerUrl,
            helpUrl,
        } = this.props
        return (
            <div className="container">
                <div display-if={isLoggedIn} className="">
                    <div className="header">
                        <div display-if={fullName} className="email">
                            {email}
                        </div>
                        <Clickable text="Log Out"
                            onClick={logOut}
                            className="logout"
                            look="link"/>
                    </div>
                </div>
                <div className='logo'>OneRoost</div>
                <div display-if={!isLoggedIn} className="loginContainer">
                    <div className="googleLogin" onClick={logInGoogle}></div>
                </div>
                <div display-if={isLoggedIn} className="">
                    <div display-if={isAdmin} className='admin'>
                        <label className='label'>Admin</label>
                        <label>
                            Server URL
                            <select onChange={(e) => setServerUrl(e.target.value)} value={serverUrl}>
                                <option value='https://stage.oneroost.com'>Stage</option>
                                <option value='https://dev.oneroost.com'>Dev</option>
                                <option value='https://www.oneroost.com'>Prod</option>
                            </select>
                        </label>
                    </div>
                    <div display-if={userId} className="content">
                        <div>
                            <Clickable href={settingsUrl}
                                target="_blank"
                                outline={true}
                                text="Team Settings"/>
                        </div>
                    </div>
                </div>
                <div className='footer'>
                    <Clickable href={helpUrl}
                        target="_blank"
                        look="link"
                        text="help"/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const user = state.user
    const {serverUrl: domain, serverUrl} = state.config
    const {email, isLoggedIn, userId, isAdmin} = user
    const settingsUrl = `${domain}/settings`
    const helpUrl = `${domain}/support`
    return {
        userId,
        fullName: getFullName(state),
        isLoggedIn,
        email,
        settingsUrl,
        isAdmin,
        serverUrl,
        helpUrl,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logOut: () => dispatch({type: LOG_OUT_ALIAS}),
        logInGoogle: () => dispatch({type: LOG_IN_GOOGLE_ALIAS}),
        setServerUrl: (serverUrl) => {
            dispatch({
                type: SET_SERVER_URL,
                payload: {serverUrl}
            })
            dispatch({
                type: REFRESH_SERVER_CONFIG_ALIAS
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PopupView)
