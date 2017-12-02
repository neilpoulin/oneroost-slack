import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {submitInbound, submitVendor} from 'ducks/inbound'
import Header from './Header'
import {withRouter} from 'react-router-dom'
import FlexBoxes from 'molecule/FlexBoxes'
import PriceCircle from 'atoms/checkout/PriceCircle'
import Clickable from 'atoms/Clickable'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'
import CheckoutForm from 'organisms/CheckoutForm'


class ProductSubmissionReview extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        submitted: PropTypes.bool,
        saving: PropTypes.bool,
        hasError: PropTypes.bool,
        errorText: PropTypes.string,
        email: PropTypes.string,
        vendorSignupSuccess: PropTypes.bool,
        //actions
        submit: PropTypes.func.isRequired,
        vendorSignUp: PropTypes.func.isRequired,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render() {
        const {
            teamName,
            submitted,
            saving,
            hasError,
            errorText,
            email,
            vendorSignupSuccess,
            //actions
            submit,
            vendorSignUp,
        } = this.props

        return <div className='content'>
            <Header display-if={!submitted} title="Success!"
                subtitle={`Your proposal has been submitted to ${teamName}`}/>

            <div display-if={!submitted}>
                <div className='instructions'>
                    <div className=''>
                        <h3>Success!</h3>
                        <div>Your proposal has been submitted to {teamName}</div>
                    </div>
                </div>
            </div>

            <div className={'pricing'}>
                <FlexBoxes>
                    <div className={'tier'}>
                        <div className={'content'}>
                            <h3 className={'tierName'}>OneRoost Basic</h3>
                            <div className={'priceCircle'}>
                                <PriceCircle price={9.99} period={'month'} backgroundColor={'lightgreen'}
                                    textColor={'white'}/>
                            </div>
                            <ul className={'features'}>
                                <li>Ability to update product details monthly</li>
                                <li>Instant notifications of a demo request</li>
                            </ul>
                        </div>
                        <div className={'actions'}>
                            <Clickable text={'Choose Basic'}/>
                        </div>
                    </div>
                    <div className={'tier'}>
                        <div className={'content'}>
                            <h3 className={'tierName'}>OneRoost Plus</h3>
                            <div className={'priceCircle'}>
                                <PriceCircle price={19.99} period={'month'} backgroundColor={'lightskyblue'}
                                    textColor={'white'}/>
                            </div>

                            <ul className={'features'}>
                                <li>Everything in OneRoost Basic</li>
                                <li>Block notifications</li>
                                <li>Follow-up notifications</li>
                            </ul>
                        </div>
                        <div className={'actions'}>
                            <Clickable text={'Choose Plus'}/>
                        </div>
                    </div>
                    <div className={'tier'}>
                        <div className={'content'}>
                            <h3 className={'tierName'}>OneRoost Enterprise</h3>
                            <div className={'priceCircle'}>
                                <PriceCircle price={79.99} period={'month'} backgroundColor={'#ef5b25'}
                                    textColor={'white'}/>
                            </div>
                            <ul className={'features'}>
                                <li>Everything in OneRoost Basic + Oneroost Plus</li>
                                <li>Adding multiple products</li>
                                <li>Roost Ranking slippage alerts</li>
                            </ul>
                        </div>
                        <div className={'actions'}>
                            <Clickable text={'Choose Enterprise'}/>
                        </div>
                    </div>
                </FlexBoxes>
            </div>


            <div className={'how-it-works'}>
                30-day money-back guarantee. No questions asked.

            </div>
            <div display-if={hasError} className='error'>
                {errorText}
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    const {
        submitted,
        saving,
        error,
        formInput: {email},
        vendorSignupSuccess
    } = state.inbound.toJS()
    const errorText = (error && error.friendlyText) ? error.friendlyText : 'Something went wrong, please try again later.';

    return {
        submitted,
        saving,
        hasError: !!error,
        errorText,
        email,
        vendorSignupSuccess,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        submit: () => {
            dispatch(submitInbound())
        },
        vendorSignUp: () => {
            dispatch(submitVendor())
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductSubmissionReview))
