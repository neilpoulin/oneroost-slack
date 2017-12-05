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

class SellerLandingPage extends React.Component{
    static propTypes = {
        loadPage: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,

        sections: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            description: PropTypes.string,
            showVendorLink: PropTypes.bool,
            vendorInboundUrl: PropTypes.string,
            testimonials: PropTypes.arrayOf(PropTypes.shape({
                quote: PropTypes.string,
                name: PropTypes.string,
                companyName: PropTypes.string,
                title: PropTypes.string,
                companyUrl: PropTypes.string,
            }))
        })),
        featureGrid: PropTypes.shape({
            items: PropTypes.array,
            title: PropTypes.string,
        }),
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
        document.title = 'OneRoost | Sellers'
        this.props.loadPage()
    }

    render () {
        const {
            isLoading,
            sections,
            featureGrid,
        } = this.props

        if (isLoading){
            return null
        }


        return <BasePage showNav={true}
            fixedNav={true}
            navBackgroundStyle=''
            navTextColor={'primary'}
            suppressPadding={true}
            showHome={true}
            navProps={{showSellers: false, showBuyers: true}}
        >
            <MarketingLandingPage
                sections={sections}
                featureGrid={featureGrid}
                firstImagePosition='left'
                showSignup={false}
            />
        </BasePage>
    }
}

const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        sellerLandingPage: {
            sections=[],
            featureGrid={},
        },
        isLoading,
    } = homePage

    return {
        isLoading,
        sections,
        featureGrid,
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

export default connect(mapStateToProps, mapDispatchToProps)(SellerLandingPage)
