import React from 'react'
import PropTypes from 'prop-types'
// import Logo from 'Logo'
import {connect} from 'react-redux'
import {Redirect} from 'react-router'
import qs from 'qs'
import {
    loadLandingPage,
    INSTALL_CHROME_EXTENSION_REQUEST,
    INSTALL_CHROME_EXTENSION_ERROR,
    INSTALL_CHROME_EXTENSION_SUCCESS,
    setWaitlistEmail,
    submitWaitlist,
} from 'ducks/homePage'
import Clickable from 'atoms/Clickable'
import Logo from 'atoms/Logo'
import {setNavProperty} from 'ducks/basePage'
import BasePage from '../BasePage'
import {authorizeSlackTeam, getOAuthState, setOAuthState} from 'ducks/user'
import TextInput from 'atoms/form/TextInput'
import JoinWaitlist from 'organisms/JoinWaitlist'

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
            imageUrl: PropTypes.string,
        })),
        videos: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            caption: PropTypes.string,
            url: PropTypes.string.isRequired,
        })),
        hasMore: PropTypes.bool,
        isLoading: PropTypes.bool.isRequired,
        extensionUrl: PropTypes.string,
        slackCopy: PropTypes.string,
        showWaitlist: PropTypes.bool,
        waitlistCopy: PropTypes.string,
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
        waitlistSaving: PropTypes.bool,
        waitlistSaveSuccess: PropTypes.bool,
        waitlistError: PropTypes.any,
        email: PropTypes.string,
        isValidEmail: PropTypes.bool,
        sections: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            description: PropTypes.string,
            showWaitlist: PropTypes.bool,
        })),
        //actions
        setNav: PropTypes.func,
        getToken: PropTypes.func,
        generateOAuthState: PropTypes.func,
        setEmail: PropTypes.func.isRequired,
        submitEmail: PropTypes.func.isRequired
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
            isLoading,
            slackAddedSuccess,
            location,
            email,
            isValidEmail,
            waitlistSaving,
            waitlistSaveSuccess,
            waitlistError,
            sections,
            //actions
            setEmail,
            submitEmail,
        } = this.props

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
            navTextColor={'default'}
            suppressPadding={true}
            showHome={true}
        >
            <div className={'main'} >
                {sections.map(({title, showWaitlist, description, imageUrl}, i) =>
                    <section key={`section_${i}`}>
                        <div display-if={imageUrl} className={'image'}>
                            <img src={`/static/images/${imageUrl}`}/>
                        </div>
                        <div display-if={showWaitlist} className="copy">
                            <h2>{title}</h2>
                            <p>{description}</p>
                            <JoinWaitlist display-if={showWaitlist}
                                buttonText='Join the Beta'
                                inline={true}
                            />
                        </div>
                    </section>)}
                <footer className="">
                    <Logo/>
                    <div className="links">
                        <Clickable look='link' text='Privacy' to='/privacy' colorType={'white'}/>
                        <Clickable to='/support' look='link' text='Support' colorType={'white'}/>
                        <Clickable to='/login' look='link' text='Log In' colorType={'white'}/>
                    </div>
                </footer>
            </div>
        </BasePage>

        return page;
    }
}

const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        buyerLandingPage: {
            sections=[],
        },
        chromeExtension: {
            installing,
            installed,
            error: installError,
            success: installSuccess,
        },
        waitlist: {
            email,
            emailValid: isValidEmail,
            saving: waitlistSaving,
            saveSuccess: waitlistSaveSuccess,
            error: waitlistError,
        },
        isLoading,
    } = homePage
    const redirectUri = `${window.location.origin}`
    let params = {state: getOAuthState()}
    if (location.search){
        const {code, state: stateParam, error} = qs.parse(location.search, { ignoreQueryPrefix: true })
        params = {code, state: stateParam, error}
    }
    return {
        ...params,
        redirectUri,
        isLoading,
        sections,
        installing,
        installed,
        installError,
        installSuccess,
        email,
        isValidEmail,
        waitlistSaving,
        waitlistSaveSuccess,
        waitlistError,
        slackAddedSuccess: state.user.get('slackAddedSuccess'),
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadPage: () => {
            dispatch(loadLandingPage())
        },

        setNav: () => {
            dispatch(setNavProperty({
                name: 'show',
                value: false,
            }))
        },
        setEmail: (email) => dispatch(setWaitlistEmail(email)),
        submitEmail: () => {
            dispatch(submitWaitlist())
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)
