import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import CompanyInfo from 'inbound/CompanyInfo'
import ProductService from 'inbound/ProductService'
import ProcessOverview from 'inbound/ProcessOverview'
import CustomerValidation from 'inbound/CustomerValidation'
import Review from 'inbound/Review'
import ProductReview from 'inbound/ProductSubmissionReview'
import PageTabs from 'inbound/PageTabs'
import {
    Route,
} from 'react-router-dom'
import BasePage from './BasePage'
import BackButton from 'molecule/BackButton'
import Logo from 'atoms/Logo'
import {Link, withRouter} from 'react-router-dom'
import {loadTeam, setFormValue} from 'ducks/inbound'

const links = [
    {
        text: 'Overview',
        path: '',
    },
    {
        text: 'Company',
        path: 'company'
    },
    {
        text: `Product /${'\u00a0'}Service`,
        path: 'product'
    },
    {
        text: 'Customer Validation',
        path: 'case-studies'
    },
    {
        text: 'Review',
        path: '/review'
    }
]

class TeamInboundPage extends React.Component {
    static propTypes = {
        teamName: PropTypes.string,
        match: PropTypes.any,
        location: PropTypes.any,
        isLoading: PropTypes.bool,
        teamId: PropTypes.string,
        //actions
        loadTeam: PropTypes.func.isRequired,

    }

    componentDidMount() {
        this.props.loadTeam()
    }

    render () {
        const {
            match,
            location,
            isLoading,
            teamId,
            teamName,
        } = this.props

        if (isLoading){
            return null
        }

        return <BasePage showNav={false}>
            <div className="container">
                <div className='tabs'>
                    <PageTabs links={links} fixed={true}/>
                </div>
                <div className='backContainer' display-if={match.url !== location.pathname}>
                    <BackButton/>
                </div>
                <Route onChange={() => window.scrollTo(0, 0)} exact path={`${match.url}`} render={() => <ProcessOverview
                    teamId={teamId}
                    teamName={teamName}
                    nextRoute={`${match.url}/company`}/>}
                />
                <Route path={`${match.url}/company`} render={() => <CompanyInfo teamName={teamName} nextRoute={`${match.url}/product`}/>}/>
                <Route path={`${match.url}/product`} render={()=> <ProductService teamName={teamName} nextRoute={`${match.url}/case-studies`}/>}/>
                <Route path={`${match.url}/case-studies`} render={()=> <CustomerValidation teamName={teamName} nextRoute={`${match.url}/review`}/>}/>
                <Route path={`${match.url}/review`} render={()=> <Review teamName={teamName} nextRoute={`${match.url}/plans`}/>}/>
                <Route path={`${match.url}/plans`} render={()=> <ProductReview teamName={teamName}/>}/>
            </div>
            <footer>
                <Link to='/' className='link'>Powered by <Logo/></Link>
            </footer>
        </BasePage>
    }
}

const mapStateToProps = (state, ownProps) => {
    const inbound = state.inbound
    const teamId = inbound.get('teamId')
    const isLoading = inbound.get('isLoading')
    const hasLoaded = inbound.get('hasLoaded')
    const teamName = inbound.get('teamName')
    return {
        teamId,
        isLoading: isLoading || !hasLoaded,
        teamName,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const {match} = ownProps
    return {
        loadTeam: () => {
            console.log(match)
            dispatch(setFormValue('inboundType', 'TEAM'))
            dispatch(loadTeam(match.params.teamId))
        },
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamInboundPage))
