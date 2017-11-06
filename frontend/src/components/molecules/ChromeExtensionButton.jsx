import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Clickable from 'atoms/Clickable'

import {
    INSTALL_CHROME_EXTENSION_REQUEST,
    INSTALL_CHROME_EXTENSION_ERROR,
    INSTALL_CHROME_EXTENSION_SUCCESS
} from 'ducks/homePage'

class ChromeExtensionButton extends React.Component {

    static propTypes = {
        extensionUrl: PropTypes.string,
        chromeInstallStart: PropTypes.func.isRequired,
        chromeExtensionInstallError: PropTypes.func.isRequired,
        chromeExtensionInstallSuccess: PropTypes.func.isRequired,
        colorType: PropTypes.oneOf(['primary', 'secondary']),
        inline: PropTypes.bool,
        installing: PropTypes.bool,
        installed: PropTypes.bool,
        installError: PropTypes.any,
        installSuccess: PropTypes.bool,
        disabled: PropTypes.bool,
    }

    static defaultProps = {
        colorType: 'secondary'
    }

    constructor(props){
        super(props)
        this._handleGetExtensionClick = this._handleGetExtensionClick.bind(this)
    }

    _handleGetExtensionClick(event){
        const {extensionUrl, chromeExtensionInstallError, chromeExtensionInstallSuccess, chromeInstallStart} = this.props
        if (window.chrome && window.chrome.webstore && window.chrome.webstore.install){
            chromeInstallStart()
            window.chrome.webstore.install(extensionUrl, () => chromeExtensionInstallSuccess(event), chromeExtensionInstallError)
        }
        else {
            window.open(extensionUrl)
        }
    }

    render () {
        const {
            installing,
            installed,
            installError,
            installSuccess,
            inline,
            colorType,
            disabled,
        } = this.props

        return <div>
            <Clickable text={`${installing ? 'Installing....' : 'Get the Chrome Extenstion'}`}
                colorType={colorType}
                inline={inline}
                onClick={this._handleGetExtensionClick}
                disabled={installing || disabled}
                display-if={!installed}
            />
            <div display-if={installed}>
                {`${installSuccess ? 'Congratulations! ' :''} `}You have the Chrome extension and are ready to start taking full advantage of OneRoost!
            </div>
            <div display-if={installError} className='error'>
                Uh oh! Something went wrong while installing the Chrome extension. Please try again.
            </div>
        </div>
    }
}


const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        ctaButtonText,
        extensionUrl,
        chromeExtension: {
            installing,
            installed,
            error: installError,
            success: installSuccess,
        },
    } = homePage

    return {
        ctaButtonText,
        extensionUrl,
        installing,
        installed,
        installError,
        installSuccess
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        chromeInstallStart: () => {
            dispatch({
                type: INSTALL_CHROME_EXTENSION_REQUEST
            })
        },
        chromeExtensionInstallSuccess: (event) => {
            console.log('installed successfully')
            dispatch({
                type: INSTALL_CHROME_EXTENSION_SUCCESS
            })
        },
        chromeExtensionInstallError: (error) => {
            console.error('failed to install: ', error)
            dispatch({
                type: INSTALL_CHROME_EXTENSION_ERROR,
                payload: error,
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChromeExtensionButton)
