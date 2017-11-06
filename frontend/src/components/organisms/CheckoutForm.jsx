import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Clickable from 'atoms/Clickable'
import StripeCheckout from 'react-stripe-checkout'
import {processPayment, loadPlan, fetchUserSubscriptionInfo, STATUS_ACTIVE} from 'ducks/payment';
import {getSubscriptionStatus} from 'selectors/payment'
import {StripeProvider, Elements} from 'react-stripe-elements'
import StripeSubscriptionCheckout from './StripeSubscriptionCheckout'

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
            email,
            STRIPE_PUBLISH_KEY,
            isSaving,
            hasPayment,
            saveSuccess,
            error,
            planAmount,
            planDescription,
            planId,
            planName,
            planLoading,
            planInterval,
            subscription,
            subscriptionStatus,
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
                            <th>Plan</th><td>{planName} - {planDescription}</td>
                        </tr>
                        <tr>
                            <th>Price</th><td>${(planAmount / 100).toFixed(2)} / {planInterval}</td>
                        </tr>
                        <tr>
                            <th>Status</th><td>{subscriptionStatus}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div display-if={!hasPayment && !isSaving && !planLoading && subscriptionStatus !== STATUS_ACTIVE}>
                <StripeProvider apiKey={STRIPE_PUBLISH_KEY}>
                    <Elements>
                        <StripeSubscriptionCheckout onToken={this._onToken}/>
                    </Elements>
                </StripeProvider>
            </div>

            <div display-if={!hasPayment && !isSaving && !planLoading && subscriptionStatus !== STATUS_ACTIVE && false}>
                <StripeCheckout
                    name={'OneRoost'}
                    description={`${planName} - ${planDescription}`}
                    ComponentClass="div"
                    panelLabel="Subscribe"
                    amount={planAmount}
                    currency="USD"
                    stripeKey={STRIPE_PUBLISH_KEY}
                    locale="auto"
                    zipCode={false}
                    allowRememberMe
                    token={this._onToken}
                    reconfigureOnUpdate={false}
                    email={email}
                    opened={this._onOpened} // called when the checkout popin is opened (no IE6/7)
                    closed={this._onClosed}
                >
                    <Clickable text={'Old Popup Subscribe'} outline/>
                </StripeCheckout>

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
        }
    }

    return response
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