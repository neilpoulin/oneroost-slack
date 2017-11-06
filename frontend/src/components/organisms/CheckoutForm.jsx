import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {processPayment, loadPlan, fetchUserSubscriptionInfo, ACTIVE_STATUSES} from 'ducks/payment';
import {getSubscriptionStatus} from 'selectors/payment'
import {StripeProvider, Elements} from 'react-stripe-elements'
import StripeSubscriptionCheckout from './StripeSubscriptionCheckout'
import moment from 'moment'

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
        showPayment: PropTypes.bool,
        //actions
        processPayment: PropTypes.func.isRequired,
        loadPaymentInfo: PropTypes.func.isRequired,
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
            showPayment,
        } = this.props
        return <div>
            <div display-if={saveSuccess}>
                Completed Payment
            </div>
            <div display-if={isSaving}>
                Saving...
            </div>
            <div display-if={planLoading}>
                Loading...
            </div>
            <div display-if={!planLoading}>
                <table>
                    <tbody>
                        <tr>
                            <th>Price</th><td>${(planAmount / 100).toFixed(2)} / {planInterval}</td>
                        </tr>
                        <tr>
                            <th>Trial Period</th><td>{trialDays} days</td>
                        </tr>
                        <tr>
                            <th>Status</th><td>{subscriptionStatus} <span display-if={trialEndDate}>(Ends {trialEndDate})</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div display-if={showPayment}>
                <StripeProvider apiKey={STRIPE_PUBLISH_KEY}>
                    <Elements>
                        <StripeSubscriptionCheckout onToken={this._onToken}/>
                    </Elements>
                </StripeProvider>
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
        subscriptionStatus: getSubscriptionStatus(state)
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
        }
    }

    if (subscription){
        let {
            trial_end: trialEndMs,
        } = subscription

        response = {
            ...response,
            trialEndDate: trialEndMs ? moment(trialEndMs * 1000).format('MM/DD/YY') : null
        }
    }

    let showPayment = ACTIVE_STATUSES.indexOf(response.subscriptionStatus) === -1
    // !hasPayment && !isSaving && !planLoading && ACTIVE_STATUSES.indexOf(subscriptionStatus) > -1

    return {...response, showPayment}
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
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm)