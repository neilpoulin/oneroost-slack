import React from 'react'
import PropTypes from 'prop-types'
// import Logo from 'Logo'
import {connect} from 'react-redux'
import {
    loadPage,
    INSTALL_CHROME_EXTENSION_REQUEST,
    INSTALL_CHROME_EXTENSION_ERROR,
    INSTALL_CHROME_EXTENSION_SUCCESS
} from 'ducks/homePage'
import Clickable from 'atoms/Clickable'
import Logo from 'atoms/Logo'
import {setNavProperty} from 'ducks/basePage'
import BasePage from './BasePage'

class HomePage extends React.Component{
    static propTypes = {
        loadPage: PropTypes.func.isRequired,
        heroTitle: PropTypes.string,
        heroSubTitle: PropTypes.string,
        ctaSubText: PropTypes.string,
        ctaButtonText: PropTypes.string,
        paragraphs: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            content: PropTypes.string,
        })),
        hasMore: PropTypes.bool,
        isLoading: PropTypes.bool.isRequired,
        extensionUrl: PropTypes.string,
        chromeInstallStart: PropTypes.func.isRequired,
        chromeExtensionInstallError: PropTypes.func.isRequired,
        chromeExtensionInstallSuccess: PropTypes.func.isRequired,
        installing: PropTypes.bool,
        installed: PropTypes.bool,
        installError: PropTypes.any,
        installSuccess: PropTypes.bool,

        //actions
        setNav: PropTypes.func,
    }

    constructor(props){
        super(props)
        this._handleGetExtensionClick = this._handleGetExtensionClick.bind(this)
    }

    componentWillMount(){
        this.props.setNav()
    }

    componentDidMount(){
        document.title = 'OneRoost'
        this.props.loadPage()
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
            heroTitle,
            heroSubTitle,
            ctaSubText,
            ctaButtonText,
            paragraphs,
            hasMore,
            isLoading,
            installing,
            installed,
            installError,
            installSuccess
            //actions
        } = this.props

        const $footer = <div className="container">
            &copy; 2017 OneRoost
        </div>

        if (isLoading){
            return null
        }
        var page =
        <BasePage showNav={true}
            fixedNav={false}
            navBackgroundStyle='transparent'
            navTextColor={'white'}
            suppressPadding={true}
            showHome={false}
            >
            <div className={'main'} >
                <section className="background-primary textured">
                    <div className="container">
                        <div className="logoContainer">
                            <Logo size='heading'/>
                        </div>

                        <div className="heroContainer" display-if={heroTitle}>
                            <h1>{heroTitle}</h1>
                            <p className="tagline" display-if={heroSubTitle}>{heroSubTitle}</p>
                        </div>
                        <div className="emailContainer form-group" display-if={ctaButtonText}>
                            <Clickable text={`${installing ? 'Installing....' : 'Get the Chrome Extenstion'}`}
                                colorType={'secondary'}
                                inline={true}
                                onClick={this._handleGetExtensionClick}
                                disabled={installing}
                                display-if={!installed}
                                />
                            <div display-if={installed}>
                                {`${installSuccess ? 'Congratulations! ' :''} `}You have the Chrome extension and are ready to start taking full advantage of OneRoost!
                            </div>
                            <div display-if={installError} className='error'>
                                Uh oh! Something went wrong while installing the Chrome extension. Please try again.
                            </div>
                        </div>
                        <div display-if={ctaSubText} className={'actionSubTextContainer'}>
                            {ctaSubText}
                        </div>
                    </div>
                    <div className="hasMoreContainer" display-if={hasMore && false}>
                        <div className="hasMore">
                            <i className="fa fa-arrow-down fa-3x"></i>
                        </div>
                    </div>
                    <footer display-if={!hasMore} className="">
                        {$footer}
                    </footer>
                </section>
                <section className="textInfo background-light" display-if={paragraphs && paragraphs.length > 0}>
                    {paragraphs.map(({title, content}, i) =>
                    <div className="info" key={`content_${i}`}>
                        <h3 className="title">{title}</h3>
                        <p className="content">
                            {content}
                        </p>
                    </div>
                    )}
                </section>
                <footer className="" display-if={hasMore}>
                    {$footer}
                </footer>
            </div>
        </BasePage>

        return page;
    }
}

const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        heroTitle,
        heroSubTitle,
        ctaSubText,
        ctaButtonText,
        paragraphs,
        isLoading,
        extensionUrl,
        chromeExtension: {
            installing,
            installed,
            error: installError,
            success: installSuccess,
        },
    } = homePage

    const hasMore = paragraphs && paragraphs.length > 0
    return {
        heroTitle,
        heroSubTitle,
        ctaSubText,
        ctaButtonText,
        paragraphs,
        isLoading,
        hasMore,
        extensionUrl,
        installing,
        installed,
        installError,
        installSuccess
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadPage: () => {
            dispatch(loadPage())
        },
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
        setNav: () => {
            dispatch(setNavProperty({
                name: 'show',
                value: false,
            }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
