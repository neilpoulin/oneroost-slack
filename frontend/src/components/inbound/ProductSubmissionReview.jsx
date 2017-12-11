import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {submitInbound, submitVendor, loadSellerPlans} from 'ducks/inbound'
import Header from './Header'
import {withRouter} from 'react-router-dom'
import FlexBoxes from 'molecule/FlexBoxes'
import btoa from 'btoa'
import PlanSummaryCard from 'molecules/PlanSummaryCard'

class ProductSubmissionReview extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        plans: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            features: PropTypes.arrayOf(PropTypes.string),
            backgroundColor: PropTypes.string,
            textColor: PropTypes.string,
            encodedPlanId: PropTypes.string.isRequired,
            cta: PropTypes.string,
            price: PropTypes.number,
            period: PropTypes.string,

        })),
        //actions
        loadPage: PropTypes.func.isRequired,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        this.props.loadPage()
    }

    render() {
        const {
            teamName,
            plans,
            //actions

        } = this.props

        return <div className='content'>
            <Header title="Success!"
                subtitle={`Your proposal has been submitted to ${teamName}`}/>
            <div>
                <div className='instructions'>
                    <div className=''>
                        <h3>Level Up Your Sales Strategy</h3>
                        <div>Faster sales cycles. Actionable buyer intelligence. Introducing OneRoost's Seller Services</div>
                    </div>
                </div>
            </div>

            <div className={'pricing'}>
                <FlexBoxes>
                    {plans.map((plan, i) =>
                        <PlanSummaryCard plan={plan} key={`plans_${i}`}/>
                    )}
                </FlexBoxes>
            </div>

            <div className={'how-it-works'}>
                30-day money-back guarantee. No questions asked.
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    let plans = state.inbound.get('sellerPlans', []).map(plan => {
        return plan.set('formattedPrice', `$${plan.get('price', 0).toFixed(2)}`)
            .set('encodedPlanId',  btoa(plan.get('stripePlanId')))
    })

    return {
        plans: plans.toJS(),
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadPage: () => {
            dispatch(loadSellerPlans())
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductSubmissionReview))
