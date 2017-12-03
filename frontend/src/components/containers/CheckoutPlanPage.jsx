import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import BasePage from 'BasePage'
import CheckoutForm from 'organisms/CheckoutForm'
import {loadPlanById} from 'ducks/checkout';
import atob from 'atob'

class CheckoutPlanPage extends React.Component {
    static propTypes = {
        plan: PropTypes.shape({
            name: PropTypes.string,
            price: PropTypes.string,
            period: PropTypes.string,
        }),
        //actions
        loadPlan: PropTypes.func.isRequired,
    }

    componentDidMount(){
        this.props.loadPlan()
    }

    render(){
        const {
            plan,
        } = this.props
        return <BasePage>
            <div>
                <h1>Checkout</h1>
                <div display-if={plan}>
                    <p>Plan: {plan.name}</p>
                    <p>${plan.price} / {plan.period}</p>
                </div>

            </div>
        </BasePage>
    }

}

const mapStateToProps = (state, ownProps) => {
    let checkout = state.checkout.toJS();
    let plan = checkout.plan
    let planInfo = {}
    if (plan){
        planInfo = {
            name: plan.name,
            price: (plan.amount / 100).toFixed(2),
            period: plan.interval,
        }
    }

    return {
        isLoading: checkout.isLoading,
        plan: planInfo,
        error: checkout.error,

    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const {match} = ownProps
    return {
        loadPlan: () => {
            // console.log(match)
            let planId = atob(match.params.planId)
            dispatch(loadPlanById(planId))
            // dispatch(loadPlanFromState())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutPlanPage)