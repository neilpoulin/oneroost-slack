import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {injectStripe} from 'react-stripe-elements'
import {CardElement} from 'react-stripe-elements'
import Clickable from 'atoms/Clickable'
import FormGroup from 'molecule/FormGroup'
import TextInput from 'atoms/form/TextInput'
import {setFormValue, getCoupon, RESET_COUPON, SAVE_PAYMENT_ERROR} from 'ducks/payment'
import classNames from 'classnames'

class StripeSubscriptionCheckout extends React.Component {
    static propTypes = {
        stripe: PropTypes.object.isRequired,
        couponCode: PropTypes.string,
        error: PropTypes.object,
        couponValid: PropTypes.bool,
        couponChecked: PropTypes.bool,
        couponTerms: PropTypes.string,
        isSaving: PropTypes.bool,
        //own props
        validate: PropTypes.func,
        onToken: PropTypes.func.isRequired,
        enabled: PropTypes.bool,
        //actions
        checkCoupon: PropTypes.func.isRequired,
        setError: PropTypes.func.isRequired
    }

    _handleSubmit = (ev) => {
        // We don't want to let default form submission happen here, which would refresh the page.
        ev.preventDefault();

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        this.props.stripe.createToken().then(({token}) => {
            console.log('Received Stripe token:', token);
            if (token){
                this.props.onToken(token)
            } else {
                this.props.setError('Unable to process payment. Please ensure all fields are filled out.')
            }
        });

    }

    render() {
        const {
            couponCode,
            checkCoupon,
            error,
            couponChecked,
            couponTerms,
            couponValid,
            isSaving,
            enabled,
        } = this.props
        let couponClass = classNames({
            coupon: couponChecked && couponCode,
            valid: couponValid,
            'not-valid': !couponValid
        })
        return (
            <div>
                <FormGroup>
                    Card
                    <CardElement style={{base: {fontSize: '18px'}}} className={'StripeElement'}/>
                </FormGroup>
                <FormGroup >
                    <span className={couponClass}><span display-if={!couponChecked}>Coupon Code</span> <span display-if={couponChecked}>{`${couponValid ? couponTerms : 'Not Valid'}`}</span></span>
                    <TextInput fieldName={'couponCode'} errors={error} value={couponCode} onChange={checkCoupon} stripeStyle={true}/>
                </FormGroup>
                <Clickable text={`${isSaving ? 'Saving...' : 'Subscribe'}`} onClick={this._handleSubmit} disabled={(!couponValid && couponChecked) || isSaving || !enabled}/>
                <div display-if={error}>
                    {error.message}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const payment = state.payment.toJS()
    const coupon = payment.coupon
    let couponValid = false
    let couponTerms = null
    if (coupon){
        couponValid = coupon.valid
        couponTerms = `${coupon.percent_off}% off for ${coupon.duration_in_months} months`
    }
    return {
        couponCode: payment.formInput.couponCode,
        couponValid,
        couponChecked: payment.couponChecked,
        couponTerms,
        isSaving: payment.isSaving,
        error: payment.error,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        checkCoupon: (couponCode='') => {
            if (window.ONEROOST_COUPON_CHECK)
            {
                window.clearTimeout(window.ONEROOST_COUPON_CHECK)
            }
            couponCode = couponCode.trim().toUpperCase()
            dispatch(setFormValue('couponCode', couponCode))

            if (!couponCode){
                dispatch({
                    type: RESET_COUPON
                })
                return
            }
            window.ONEROOST_COUPON_CHECK = window.setTimeout(() => {
                if (couponCode){
                    dispatch(getCoupon(couponCode))
                }
            }, 500)
        },
        setError: (message) => {
            dispatch({
                type: SAVE_PAYMENT_ERROR,
                payload: {
                    error: {
                        message,
                    }
                }
            })
        }
    }
}

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(StripeSubscriptionCheckout))