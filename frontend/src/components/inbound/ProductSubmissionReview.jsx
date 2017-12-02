import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {submitInbound, submitVendor, loadSellerPlans} from 'ducks/inbound'
import Header from './Header'
import {withRouter} from 'react-router-dom'
import FlexBoxes from 'molecule/FlexBoxes'
import PriceCircle from 'atoms/checkout/PriceCircle'
import Clickable from 'atoms/Clickable'

class ProductSubmissionReview extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        plans: PropTypes.arrayOf(PropTypes.shape({
            stripePlanId: PropTypes.string.isRequired,
            name: PropTypes.string,
            features: PropTypes.arrayOf(PropTypes.string),
            color: PropTypes.string,
            price: PropTypes.string,
            period: PropTypes.string,
        })),
        //actions
        submit: PropTypes.func.isRequired,
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

            <div >
                <div className='instructions'>
                    <div className=''>
                        <h3>Success!</h3>
                        <div>Your proposal has been submitted to {teamName}</div>
                    </div>
                </div>
            </div>

            <div className={'pricing'}>
                <FlexBoxes>
                    {plans.map((plan, i) =>
                        <div key={`seller_plans_${i}`} className={'tier'}>
                            <div className={'content'}>
                                <h3 className={'tierName'}>{plan.name}</h3>
                                <div className={'priceCircle'}>
                                    <PriceCircle price={plan.price} period={plan.period}
                                        backgroundColor={plan.backgroundColor}
                                        textColor={plan.textColor}/>
                                </div>

                                <ul className={'features'} display-if={plan.features}>
                                    {plan.features.map((feature, j) =>
                                        <li key={`plan_${i}_featre_${j}`}>{feature}</li>
                                    )}
                                </ul>
                            </div>
                            <div className={'actions'}>
                                <Clickable text={`Choose ${plan.name}`} to={`/checkout/${plan.stripePlanId}`}/>
                            </div>
                        </div>
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
        return plan.set('price', plan.get('price').toFixed(2))
    })

    return {
        plans: plans.toJS(),
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        submit: () => {
            dispatch(submitInbound())
        },
        vendorSignUp: () => {
            dispatch(submitVendor())
        },
        loadPage: () => {
            dispatch(loadSellerPlans())
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductSubmissionReview))
