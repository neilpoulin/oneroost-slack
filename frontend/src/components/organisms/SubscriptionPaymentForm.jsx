import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    processPayment,
    processVendorPayment,
    loadPlan,
    fetchSubscriptionInfo,
    fetchUpcomingInvoice,
    cancelSubscription,
    STATUS_TRIALING
} from 'ducks/payment'
import {StripeProvider, Elements} from 'react-stripe-elements'
import StripeSubscriptionCheckout from './StripeSubscriptionCheckout'



class SubscriptionPaymentForm extends React.Component {
    static propTypes = {
        STRIPE_PUBLISH_KEY: PropTypes.string.isRequired,
        planId: PropTypes.string.isRequired,
        //own props
        paymentType: PropTypes.oneOf(['PRODUCT', 'TEAM']),
        email: PropTypes.string,
        enabled: PropTypes.bool,
        //actions
        processPayment: PropTypes.func.isRequired,
    }

    static defaultProps = {
        paymentType: 'TEAM',
        enabled: true,
    }

    constructor(props){
        super(props)
        this._onToken= this._onToken.bind(this)
    }

    _onToken(token) {
        const {planId, email} = this.props
        this.props.processPayment({planId, token, email})
    }
    
    render(){
        const {
            STRIPE_PUBLISH_KEY,
            enabled,
        } = this.props
        return <div>
            <StripeProvider apiKey={STRIPE_PUBLISH_KEY}>
                <Elements>
                    <StripeSubscriptionCheckout onToken={this._onToken} enabled={enabled}/>
                </Elements>
            </StripeProvider>
        </div>   
    }
    
}

const mapStateToProps = (state, ownProps) => {
    const {STRIPE_PUBLISH_KEY} = state.config.toJS()
    return {
        STRIPE_PUBLISH_KEY
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        processPayment: ({planId, token, email}) => {
            switch(ownProps.paymentType){
                case 'TEAM':
                    dispatch(processPayment({planId, token}))
                    break
                case 'PRODUCT':
                    dispatch(processVendorPayment({planId, token, email}))
                    break
                default:
                    console.error('invalid payment type passed to SubscriptionPaymentForm, unable to process ', ownProps.paymentType)
                    break
            }

            console.log(token)
        },
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionPaymentForm)