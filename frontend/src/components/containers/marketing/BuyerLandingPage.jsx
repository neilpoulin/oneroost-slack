import React from 'react'
import PropTypes from 'prop-types'
// import Logo from 'Logo'
import {connect} from 'react-redux'
import {
    loadLandingPage,

} from 'ducks/homePage'
import {setNavProperty} from 'ducks/basePage'
import BasePage from '../BasePage'
import MarketingLandingPage from 'organisms/MarketingLandingPage'

class BuyerLandingPage extends React.Component{
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


        return <BasePage showNav={true}
            fixedNav={false}
            navBackgroundStyle='transparent'
            navTextColor={'default'}
            suppressPadding={true}
            showHome={true}
        >
            <MarketingLandingPage
                sections={sections}
                testimonials={testimonials}
                firstImagePosition={'right'}
                showSignup={true}
            />
        </BasePage>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BuyerLandingPage)
