import React from 'react'
import {connect} from 'react-redux'
import {loadTeam} from 'ducks/inbound'
import CompanyInfo from 'inbound/CompanyInfo'
import ProductService from 'inbound/ProductService'
import ProcessOverview from 'inbound/ProcessOverview'
import CustomerValidation from 'inbound/CustomerValidation'
import Review from 'inbound/Review'
import PageTabs from 'inbound/PageTabs'
import {
  Route,
} from 'react-router-dom'

class TeamInboundPage extends React.Component {
    componentDidMount() {
        this.props.loadTeam()
    }

    render () {
        const {
            match,
            isLoading,
            teamId,
            teamName,
        } = this.props

        if (isLoading){
            return null
        }

        return <div className="container">
            <PageTabs/>
            <Route exact path={`${match.url}`} render={() => <ProcessOverview
                    teamId={teamId}
                    teamName={teamName}
                    nextRoute={`${match.url}/company`}/>}
            />
            <Route path={`${match.url}/company`} render={() => <CompanyInfo teamName={teamName} nextRoute={`${match.url}/product`}/>}/>
            <Route path={`${match.url}/product`} render={()=> <ProductService teamName={teamName} nextRoute={`${match.url}/case-studies`}/>}/>
            <Route path={`${match.url}/case-studies`} render={()=> <CustomerValidation nextRoute={`${match.url}/review`}/>}/>
            <Route path={`${match.url}/review`} render={()=> <Review teamName={teamName}/>}/>
        </div>
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
            dispatch(loadTeam(match.params.teamId))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamInboundPage);
