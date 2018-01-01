import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import Clickable from 'atoms/Clickable';
import {LOG_OUT_ALIAS, LOG_IN_GOOGLE_ALIAS} from 'actions/user'
import {getFullName} from 'selectors/user'
import {REFRESH_SERVER_CONFIG_ALIAS, SET_SERVER_URL} from 'actions/config'
import GoogleLoginButton from 'molecules/GoogleLoginButton'
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
        setServerUrl: PropTypes.func,
        helpUrl: PropTypes.string,
        popupConfig: PropTypes.shape({
            content: PropTypes.arrayOf(PropTypes.shape({
                title: PropTypes.string,
                sections: PropTypes.arrayOf(PropTypes.shape({
                    heading: PropTypes.string,
                    text: PropTypes.string,
                }))
            }))
        }),
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
            popupConfig,
        } = this.props
        return <div className="container">
            <div display-if={isLoggedIn} className="">
                <div className="header">
                    <div display-if={email} className="email">
                        {email}
                    </div>
                    <Clickable text="Log Out"
                        onClick={logOut}
                        className="logout"
                        look="link"/>
                </div>
            </div>
            <div className='logo'><Clickable href="https://www.oneroost.com" target="_blank" text="OneRoost"
                look={'link'}/>
            </div>
            <GoogleLoginButton/>
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
                <div display-if={popupConfig && popupConfig.content}>
                    {popupConfig.content.map((content, i) =>
                        <div key={`content_${i}`} className="content">
                            <h3>{content.title}</h3>
                            <ul display-if={content.sections}>
                                {content.sections.map((section, j) =>
                                    <li key={`section_${i}_${j}`}>
                                        <h4 display-if={section.heading}>{section.heading}</h4>
                                        <p display-if={section.text}>{section.text}</p>
                                        <p display-if={section.link}>
                                            <Clickable look={'link'} text={section.link.text} href={section.link.href} target="_blank"/>
                                        </p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = (state) => {
    const user = state.user
    const {serverUrl: domain, serverUrl, popupConfig} = state.config
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
        popupConfig,
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
