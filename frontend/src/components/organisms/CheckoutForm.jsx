import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    processPayment,
    loadPlan,
    fetchUserSubscriptionInfo,
    fetchUpcomingInvoice,
    cancelSubscription,
    STATUS_TRIALING
} from 'ducks/payment'
import {
    getStatusDisplayName,
    getSubscriptionStatus,
    hasActiveSubscription
} from 'selectors/payment'
import {} from 'selectors/payment'
import {StripeProvider, Elements} from 'react-stripe-elements'
import StripeSubscriptionCheckout from './StripeSubscriptionCheckout'
import moment from 'moment'
import Clickable from 'atoms/Clickable'

class CheckoutForm extends React.Component {
    static propTypes = {
        email: PropTypes.string,
        STRIPE_PUBLISH_KEY: PropTypes.string,
        name: PropTypes.string,
        isSaving: PropTypes.bool,
        saveSuccess: PropTypes.bool,
        hasPayment: PropTypes.bool,
        error: PropTypes.any,
        planAmount: PropTypes.number,
        planId: PropTypes.string,
        planName: PropTypes.string,
        planLoading: PropTypes.bool,
        planDescription: PropTypes.string,
        planInterval: PropTypes.string,
        subscription: PropTypes.object,
        subscriptionStatus: PropTypes.string,
        trialDays: PropTypes.number,
        trialEndDate: PropTypes.string,
        isActive: PropTypes.bool,
        currentPeriodEndDate: PropTypes.string,
        cancelAtPeriodEnd: PropTypes.bool,
        trialDaysRemaining: PropTypes.string,
        invoiceTotal: PropTypes.string,
        invoiceLoaded: PropTypes.bool,
        invoiceSubTotal: PropTypes.string,
        appliedCoupon: PropTypes.shape({
            couponCode: PropTypes.string.isRequired,
            amountOff: PropTypes.number,
            percentOff: PropTypes.number,
            couponTerms: PropTypes.string,
        }),
        //actions
        processPayment: PropTypes.func.isRequired,
        loadPaymentInfo: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
    }

    constructor(props){
        super(props)
        this._onToken= this._onToken.bind(this)
        this._onOpened= this._onOpened.bind(this)
        this._onClosed= this._onClosed.bind(this)
    }

    componentDidMount(){
        this.props.loadPaymentInfo()
    }

    _onToken(token) {
        const {planId} = this.props
        this.props.processPayment(planId, token)
    }

    _onOpened(args){
        console.log('stripe popup opened', args)
    }

    _onClosed(args){
        console.log('stripe popup closed', args)
    }

    render(){
        const {
            STRIPE_PUBLISH_KEY,
            isSaving,
            hasPayment,
            saveSuccess,
            error,
            planAmount,
            planLoading,
            planInterval,
            trialDays,
            subscriptionStatus,
            trialEndDate,
            isActive,
            cancel,
            currentPeriodEndDate,
            trialDaysRemaining,
            cancelAtPeriodEnd,
            invoiceTotal,
            invoiceLoaded,
            invoiceSubTotal,
            appliedCoupon,
        } = this.props
        return <div>
            <div display-if={planLoading}>
                Loading...
            </div>
            <div display-if={!planLoading && !isActive}>
                <table>
                    <tbody>
                        <tr>
                            <th>Price</th><td>${(planAmount / 100).toFixed(2)} / {planInterval}</td>
                        </tr>
                        <tr>
                            <th>Trial Period</th><td>{trialDays} days</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>
                                {subscriptionStatus} <span display-if={trialDaysRemaining}>({trialDaysRemaining})</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div display-if={isActive && invoiceLoaded} className='currentSubscription'>
                <div className={'status'}>
                    <div className={'statusName'}>{subscriptionStatus}</div>
                    <div display-if={trialDaysRemaining}>{trialDaysRemaining}</div>
                </div>
                <div display-if={cancelAtPeriodEnd}>
                    Subscription will not renew and will end on: {currentPeriodEndDate}
                </div>
                <div display-if={!cancelAtPeriodEnd}>
                    <div className={'invoiceHeader'}>Next Invoice on {currentPeriodEndDate}</div>
                    <div className='billingSummary'>
                        <table display-if={invoiceTotal !== invoiceSubTotal}>
                            <tbody>
                                <tr display-if={invoiceTotal !== invoiceSubTotal}>
                                    <td>Monthly Cost</td><td>${invoiceSubTotal}</td>
                                </tr>
                                <tr display-if={invoiceTotal !== invoiceSubTotal}>
                                    <td>Discount</td><td>-${(invoiceSubTotal - invoiceTotal).toFixed(2)}</td>
                                </tr>
                                <tr className={'total'}>
                                    <td>Amount Due</td><td>${invoiceTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div display-if={invoiceTotal === invoiceSubTotal}>
                            Amount Due ${invoiceTotal}
                        </div>
                        <div display-if={appliedCoupon} className={'couponInfo'}>
                            Applied Coupon {appliedCoupon.couponCode}: <span>{appliedCoupon.couponTerms}</span>
                        </div>
                    </div>
                </div>
                <div className='actions'>
                    <Clickable onClick={cancel} look={'link'} text={'Cancel Subscription'}/>
                </div>
            </div>

            <div display-if={!isActive}>
                <StripeProvider apiKey={STRIPE_PUBLISH_KEY}>
                    <Elements>
                        <StripeSubscriptionCheckout onToken={this._onToken}/>
                    </Elements>
                </StripeProvider>
            </div>
            <div display-if={saveSuccess}>
                Payment Successful
            </div>
            <div display-if={isSaving}>
                Saving...
            </div>
            <div display-if={error}>
                Ooops, something went wrong
            </div>
        </div>
    }

}

const mapStateToProps = (state, ownProps) => {
    const {email} = state.user.toJS()
    const {STRIPE_PUBLISH_KEY} = state.config.toJS()
    const {
        isSaving,
        saveSuccess,
        error,
        hasPayment,
        plan={},
        isLoading: planLoading,
        hasLoaded: planHasLoaded,
        subscription,
        invoice,
    } = state.payment.toJS()

    let response = {
        email,
        STRIPE_PUBLISH_KEY,
        isSaving,
        saveSuccess,
        error,
        hasPayment,
        planLoading,
        subscription,
        subscriptionStatus: getStatusDisplayName(getSubscriptionStatus(state))
    }
    if (!planLoading && planHasLoaded && plan){
        let {
            amount: planAmount,
            id: planId,
            interval: planInterval,
            trial_period_days: trialDays,
            metadata: {
                planName,
                planDescription,
            }
        } = plan

        response = {...response,
            planAmount,
            planDescription,
            planId,
            planName,
            planInterval,
            trialDays,
            invoiceLoaded: false,
        }
    }

    if (subscription){
        const {
            trial_end: trialEndMs,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
        } = subscription

        response = {
            ...response,
            currentPeriodEndDate: currentPeriodEnd ? moment(currentPeriodEnd * 1000).format('MM/DD/YY') : null,
            cancelAtPeriodEnd,
        }
        if (getSubscriptionStatus(state) === STATUS_TRIALING){
            response = {
                ...response,
                trialEndDate: trialEndMs ? moment(trialEndMs * 1000).format('MM/DD/YY') : null,
                trialDaysRemaining: trialEndMs ? `${moment(trialEndMs * 1000).fromNow(true)} remaining` : null,
            }
        }
    }

    if (invoice){
        const {
            total: invoiceTotal,
            subtotal: invoiceSubTotal,
            discount,
        } = invoice

        response = {
            ...response,
            invoiceTotal: (invoiceTotal / 100).toFixed(2),
            invoiceSubTotal: (invoiceSubTotal / 100).toFixed(2),
            invoiceLoaded: true,
        }

        if (discount){
            const {coupon} = discount
            if (coupon){
                response = {
                    ...response,
                    appliedCoupon: {
                        couponCode: coupon.id,
                        percentOff: coupon.percent_off,
                        amountOff: coupon.amount_off,
                        couponTerms: `${coupon.percent_off}% off for ${coupon.duration_in_months} months`
                    }
                }
            }
        }

    }
    let isActive = hasActiveSubscription(state)

    return {...response, isActive}
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        processPayment: (planId, token) => {
            dispatch(processPayment(planId, token))
            console.log(token)
        },
        loadPaymentInfo: () => {
            dispatch(loadPlan())
            dispatch(fetchUserSubscriptionInfo())
            dispatch(fetchUpcomingInvoice())
        },
        cancel: () => {
            dispatch(cancelSubscription())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm)