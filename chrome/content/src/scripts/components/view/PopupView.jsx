import React, {Component} from 'react';
import {connect} from 'react-redux';
import Clickable from 'atoms/Clickable';
import {LOG_OUT_ALIAS, LOG_IN_GOOGLE_ALIAS} from 'actions/user'
import {getFullName} from 'selectors/user'

// import {handleSignInClick, handleSignOutClick} from "background/googleAuth"

class PopupView extends Component {
    render() {
        const {userId, fullName, logOut, isLoggedIn, logInGoogle, email} = this.props
        return (
            <div className="container">
                <div display-if={!isLoggedIn} className="loginContainer">
                    <div className="googleLogin" onClick={logInGoogle}></div>
                </div>
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

                    <div display-if={userId} className="content">
                        <div>
                            <Clickable href={'https://www.oneroost.com/settings/templates'}
                                target="_blank"
                                outline={true}
                                text="Manage Tempaltes"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const user = state.user
    const {email, isLoggedIn, userId} = user

    return {
        userId,
        fullName: getFullName(state),
        isLoggedIn,
        email,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logOut: () => dispatch({type: LOG_OUT_ALIAS}),
        logInGoogle: () => dispatch({type: LOG_IN_GOOGLE_ALIAS}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PopupView)
