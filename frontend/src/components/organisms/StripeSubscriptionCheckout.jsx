import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {injectStripe} from 'react-stripe-elements'
import {CardElement} from 'react-stripe-elements'
import Clickable from 'atoms/Clickable'
import FormGroup from 'molecule/FormGroup'
import TextInput from 'atoms/form/TextInput'
import {setFormValue, getCoupon, RESET_COUPON} from 'ducks/payment'
import classNames from 'classnames'

class StripeSubscriptionCheckout extends React.Component {
    static propTypes = {
        stripe: PropTypes.object.isRequired,
        onToken: PropTypes.func.isRequired,
        couponCode: PropTypes.string,
        errors: PropTypes.object,
        couponValid: PropTypes.bool,
        couponChecked: PropTypes.bool,
        couponTerms: PropTypes.string,
        //actions
        createSetter: PropTypes.func.isRequired,
        checkCoupon: PropTypes.func.isRequired
    }

    _handleSubmit = (ev) => {
        // We don't want to let default form submission happen here, which would refresh the page.
        ev.preventDefault();

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        this.props.stripe.createToken().then(({token}) => {
            console.log('Received Stripe token:', token);
            this.props.onToken(token)
        });

        // However, this line of code will do the same thing:
        // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    }

    render() {
        const {
            couponCode,
            checkCoupon,
            errors,
            couponChecked,
            couponTerms,
            couponValid,
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
                    <TextInput fieldName={'couponCode'} errors={errors} value={couponCode} onChange={checkCoupon} stripeStyle={true}/>
                </FormGroup>
                <Clickable text="Pay" onClick={this._handleSubmit} disabled={!couponValid && couponChecked}/>
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
        errors: {}
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        createSetter: (name) => value => {
            dispatch(setFormValue(name, value))
        },
        checkCoupon: (couponCode) => {
            if (!couponCode){
                dispatch({
                    type: RESET_COUPON
                })
                return
            }
            dispatch(setFormValue('couponCode', couponCode))
            if (window.ONEROOST_COUPON_CHECK)
            {
                window.clearTimeout(window.ONEROOST_COUPON_CHECK)
            }

            window.ONEROOST_COUPON_CHECK = window.setTimeout(() => {
                dispatch(getCoupon(couponCode))
            }, 500)
        }
    }
}

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(StripeSubscriptionCheckout))