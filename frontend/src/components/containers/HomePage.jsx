import React from 'react'
import PropTypes from 'prop-types'
// import Logo from 'Logo'
import {connect} from 'react-redux'
import {Redirect} from 'react-router'
import qs from 'qs'
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
import {authorizeSlackTeam, getOAuthState, setOAuthState} from 'ducks/user'
import SlackAddButton from './SlackAddButton'
import FlexBoxes from 'molecule/FlexBoxes'

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
        videos: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            caption: PropTypes.string,
            url: PropTypes.string.isRequired,
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
        redirectUri: PropTypes.string,
        code: PropTypes.string,
        slackAddedSuccess: PropTypes.bool,
        location: PropTypes.any,
        state: PropTypes.string,
        //actions
        setNav: PropTypes.func,
        getToken: PropTypes.func,
        generateOAuthState: PropTypes.func,
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
            redirectUri,
            slackAddedSuccess,
            location,
            state,
            videos,
            //actions
        } = this.props

        const $footer = <div className="container">
            &copy; 2017 OneRoost | <Clickable look='link' text='Privacy' to='/privacy'/> | <Clickable to='/support' look='link' text='Support'/>
        </div>

        if (isLoading){
            return null
        }

        if (slackAddedSuccess){
            return <Redirect to={{
                pathname: '/install-success',
                state: { from: location }
            }}/>
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
                            <SlackAddButton/>
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
                    </footer> </section>
                <section className='youtubeContainer' display-if={videos}>
                    <FlexBoxes columns={videos.length === 3 ? 3 : 2}>
                        {videos.map((video, i) =>
                            <div className='video' key={`video_${i}`}>
                                <h3 display-if={video.title} className="title">{video.title}</h3>
                                <iframe width="480" height="200" src={video.url} frameBorder="0" allowFullScreen></iframe>
                                <p className='caption' >{video.caption}</p>
                            </div>)
                        }
                    </FlexBoxes>

                </section>
                <section className='youtubeContainer'>

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
        videos,
        isLoading,
        extensionUrl,
        chromeExtension: {
            installing,
            installed,
            error: installError,
            success: installSuccess,
        },
    } = homePage
    const config = state.config
    const redirectUri = `${window.location.origin}`
    let params = {state: getOAuthState()}
    if (location.search){
        const {code, state: stateParam, error} = qs.parse(location.search, { ignoreQueryPrefix: true })
        params = {code, state: stateParam, error}
    }
    const hasMore = paragraphs && paragraphs.length > 0
    return {
        ...params,
        redirectUri,
        heroTitle,
        heroSubTitle,
        ctaSubText,
        ctaButtonText,
        paragraphs,
        videos,
        isLoading,
        hasMore,
        extensionUrl,
        installing,
        installed,
        installError,
        installSuccess,
        slackAddedSuccess: state.user.get('slackAddedSuccess'),
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
        },
        getToken: (code, redirectUri) => dispatch(authorizeSlackTeam(code, redirectUri)),
        generateOAuthState: () => dispatch(setOAuthState()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
