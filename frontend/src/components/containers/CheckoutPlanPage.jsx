import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import BasePage from 'BasePage'
import CheckoutForm from 'organisms/CheckoutForm'
import {isValidEmail} from 'util/Validators';
import {loadPlanById, reset, setValue, setEmailFromInbound} from 'ducks/checkout';
import atob from 'atob'
import PlanSummaryCard from 'molecules/PlanSummaryCard'
import SubscriptionPaymentForm from 'organisms/SubscriptionPaymentForm'
import TextInput from 'atoms/form/TextInput';


class CheckoutPlanPage extends React.Component {
    static propTypes = {
        plan: PropTypes.shape({
            name: PropTypes.string,
            price: PropTypes.string,
            period: PropTypes.string,
        }),
        planId: PropTypes.string.isRequired,
        planConfig: PropTypes.shape({
            name: PropTypes.string,
            features: PropTypes.arrayOf(PropTypes.string),
            backgroundColor: PropTypes.string,
            textColor: PropTypes.string,
            cta: PropTypes.string,
            price: PropTypes.number,
            period: PropTypes.string,

        }),
        email: PropTypes.string,
        error: PropTypes.object,
        validEmail: PropTypes.bool,
        checkoutSuccess: PropTypes.bool,
        vendor: PropTypes.shape({
            objectId: PropTypes.string,
            stripeSubscriptionId: PropTypes.string,
        }),
        //own props
        initialEmail: PropTypes.string,

        //actions
        loadPlan: PropTypes.func.isRequired,
        createSetter: PropTypes.func.isRequired
    }

    componentDidMount(){
        this.props.loadPlan()
    }

    render(){
        const {
            plan,
            planId,
            planConfig,
            email,
            error,
            createSetter,
            validEmail,
            checkoutSuccess,
            vendor,
        } = this.props
        return <BasePage navProps={{showLoginLink: false}}>
            <div className='container'>
                <h1>Checkout</h1>
                <div className={'main'}>
                    <section className='payment' display-if={!checkoutSuccess}>
                        <h3 className='title'>Payment Information</h3>
                        <div className={'personalInfo'}>
                            Confirm Your Email
                            <TextInput fieldName={'email'} errors={error} value={email} onChange={createSetter('email')}/>
                        </div>

                        <div display-if={plan} className={'billingInfo'}>
                            <SubscriptionPaymentForm planId={planId} email={email} paymentType={'PRODUCT'} enabled={validEmail}/>
                        </div>
                    </section>
                    <section display-if={checkoutSuccess}>
                        <h3>Congratulations!</h3>
                        <div>
                            You have successfully subscribed to OneRoost.
                        </div>
                        <div display-if={vendor} className={'vendor'}>
                            <h4>Your Vendor ID is</h4>
                            <div className='vendorId'>
                                {vendor.objectId}
                            </div>
                        </div>
                    </section>
                    <section className='planContainer'>
                        <h3 className={'title'}>Selected Plan</h3>
                        <div className='planCard'>
                            <PlanSummaryCard plan={planConfig} showCheckoutLink={false} display-if={planConfig}/>
                        </div>
                    </section>
                </div>
                <div className={'how-it-works'} display-if={!checkoutSuccess}>
                    30-day money-back guarantee. No questions asked.
                </div>
            </div>
        </BasePage>
    }

}

const mapStateToProps = (state, ownProps) => {
    let checkout = state.checkout.toJS();
    let plan = checkout.plan
    let planConfig = checkout.planConfig
    if (checkout.planConfig)
    {
        planConfig = {
            ...checkout.planConfig,
            formattedPrice: `$${checkout.planConfig.price}`
        }
    }

    let planInfo = {}
    if (plan){
        let formattedPrice = `$${(plan.amount / 100).toFixed(2)}`
        planInfo = {
            name: plan.name,
            formattedPrice,
            period: plan.interval
        }

        planConfig = {
            ...checkout.planConfig,
            formattedPrice,
            period: plan.interval
        }

    }

    let validEmail = isValidEmail(checkout.email)
    let checkoutSuccess = state.payment.get('hasVendorPayment')
    let vendor = state.payment.get('vendor').toJS()

    return {
        isLoading: checkout.isLoading,
        plan: planInfo,
        planId: planInfo.planId || atob(ownProps.match.params.planId),
        planConfig,
        error: checkout.error,
        email: checkout.email || '',
        validEmail,
        checkoutSuccess,
        vendor,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const {match} = ownProps
    return {
        loadPlan: () => {
            // console.log(match)
            let planId = atob(match.params.planId)
            dispatch(reset())
            dispatch(setEmailFromInbound())
            dispatch(loadPlanById(planId))
        },
        createSetter: (name) => (value) => {
            dispatch(setValue({name, value}))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutPlanPage)