import React from 'react'
import PropTypes from 'prop-types'
import GoogleLogin from 'react-google-login'
import {connect} from 'react-redux'
import {
    linkUserWithProvider,
    linkUserWithProviderError
} from 'ducks/login'

class GoogleLoginButton extends React.Component {
    static propTypes = {
        hostedDomain: PropTypes.string,
    }
    render () {
        const {googleSuccess, googleError, hostedDomain, error, googleClientId} = this.props;
        return <div>
            <p display-if={error}>
                {error.message}
            </p>
            <GoogleLogin
                clientId={googleClientId}
                onSuccess={googleSuccess}
                onFailure={googleError}
                offline={false}
                responseType="id_token"
                isSignedIn={true}
                className="googleLogin"
                style={false}
                tag="span"
                buttonText={null}
                hostedDomain={hostedDomain}
                />
        </div>
    }
}

const mapStateToProps = (state) => {
    // const user = state.user.toJS()
    const googleClientId = state.config.get('GOOGLE_CLIENT_ID')
    // const error = user.providerErrors['google']
    return {
        error: null,
        googleClientId,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        googleSuccess: (authData) => {
            const {familyName, givenName, email} = authData.profileObj || {}
            dispatch(linkUserWithProvider('google', {
                access_token: authData.accessToken,
                id_token: authData.tokenId,
                id: authData.googleId,
                firstName: givenName,
                lastName: familyName,
                email,
                username: email,
            }))
        },
        googleError: (error) => {
            dispatch(linkUserWithProviderError('google', error))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoogleLoginButton);
