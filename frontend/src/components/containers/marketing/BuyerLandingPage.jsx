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
        videos: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            caption: PropTypes.string,
            url: PropTypes.string.isRequired,
        })),

        isLoading: PropTypes.bool.isRequired,

        isValidEmail: PropTypes.bool,
        sections: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            description: PropTypes.string,
            showWaitlist: PropTypes.bool,
        })),
        testimonials: PropTypes.arrayOf(PropTypes.shape({
            quote: PropTypes.string.isRequired,
            imageUrl: PropTypes.string,
            name: PropTypes.string.isRequired,
            title: PropTypes.string,
            companyName: PropTypes.string.isRequired,
            companyUrl: PropTypes.string,
        })),
        //actions
        setNav: PropTypes.func,
        getToken: PropTypes.func,
        setEmail: PropTypes.func.isRequired,
        submitEmail: PropTypes.func.isRequired
    }

    constructor(props){
        super(props)
    }

    componentWillMount(){
        this.props.setNav()
    }

    componentDidMount(){
        document.title = 'OneRoost | Buyers'
        this.props.loadPage()
    }

    render () {
        const {
            isLoading,
            sections,
            testimonials,
        } = this.props

        if (isLoading){
            return null
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
                <div>
                    {sections.map(({title, showWaitlist, description, imageUrl}, i) =>
                        <section key={`section_${i}`}>
                            <div display-if={imageUrl} className={'image'}>
                                <img src={`${imageUrl}`}/>
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
                </div>
                <div className={'testimonials'} display-if={testimonials}>
                    {testimonials.map(({quote, imageUrl, name, title, companyName, companyUrl}, i) =>
                        <div key={`testimonial_${i}`} className={'testimonial'}>
                            <div className={'avatar'}>
                                <img src={imageUrl}/>
                            </div>
                            <div className={'text'}>
                                <q className='quote'>{quote}</q>
                                <p className='user'>
                                    {name} <span className="title" display-if={title}> - {title}</span>
                                </p>
                                <p className='company'>
                                    <Clickable display-if={companyUrl}
                                        look={'link'}
                                        colorType={'white'}
                                        text={companyName}
                                        to={companyUrl}
                                    />
                                    <span display-if={!companyUrl}>{companyName}</span>
                                </p>
                            </div>

                        </div>
                    )}
                </div>
                <div className={'signup'}>
                    <h2>Sign up now</h2>
                    <JoinWaitlist buttonText='Join the Beta'
                        inline={true}
                    />
                </div>
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
            testimonials=[],
        },
        isLoading,
    } = homePage

    return {
        isLoading,
        sections,
        testimonials,
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
