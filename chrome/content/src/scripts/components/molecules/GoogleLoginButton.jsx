import React from 'react'
import PropTypes from 'prop-types'
import {LOG_IN_GOOGLE_ALIAS} from 'actions/user'
import {connect} from 'react-redux'


class GoogleLoginButton extends React.Component {

    static propTypes = {
        logInGoogle: PropTypes.func.isRequired,
        isLoggedIn: PropTypes.bool,
    }

    render(){
        const {
            logInGoogle,
            isLoggedIn,
        } = this.props
        return <div display-if={!isLoggedIn} className="loginContainer">
            <div className="googleLogin" onClick={logInGoogle}></div>
            <div className="image_preload">
                <img src="https://images.oneroost.com/images/chrome/google_signin_buttons/web/1x/btn_google_signin_dark_disabled_web.png" width="0" height="" alt="Image 01"/>
                <img src="https://images.oneroost.com/images/chrome/google_signin_buttons/web/1x/btn_google_signin_dark_focus_web.png" width="0" height="0" alt="Image 02"/>
                <img src="https://images.oneroost.com/images/chrome/google_signin_buttons/web/1x/btn_google_signin_dark_normal_web.png" width="0" height="0" alt="Image 03"/>
                <img src="https://images.oneroost.com/images/chrome/google_signin_buttons/web/1x/btn_google_signin_dark_pressed_web.png" width="0" height="0" alt="Image 04"/>
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    let user = state.user
    return {
        isLoggedIn: user.isLoggedIn,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logInGoogle: () => dispatch({type: LOG_IN_GOOGLE_ALIAS})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoogleLoginButton)
