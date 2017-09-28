import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {submitInbound, submitVendor} from 'ducks/inbound'
import Header from './Header'
import {withRouter} from 'react-router-dom'
import Clickable from 'atoms/Clickable'
import TextInput from 'atoms/form/TextInput'
import FormGroup from 'molecule/FormGroup'


class Review extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
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
            <Header display-if={!submitted} title="Review the Opportunity" subtitle={`This is your last chance to add, modify, or remove any of the information before OneRoost packages and shares the opportunity with ${teamName}`}/>
            <div display-if={!submitted}>
                <div className='instructions' >
                    <p>
                        Click on each of the sections above to review.  Once you’re satisfied with the information, click submit below.  We encourage our companies to indicate level of interest within one week.  If {teamName} finds your opportunity interesting, OneRoost will send an email to your supplied email.
                    </p>
                    <p>
                        Note:  OneRoost blocks all subsequent emails from your company until {teamName} has indicated interest in engaging in the opportunity.  Don’t worry though, you can share new materials down the road.
                    </p>
                </div>
                <div>
                    <Clickable text={saving ? 'Saving...' : `Submit to ${teamName}`} onClick={submit} disabled={saving}/>
                </div>
            </div>
            <div display-if={submitted}>
                <div className='instructions'>
                    <div className='success'>
                        <h3>Success!</h3>
                        <div>Your proposal has been submitted to {teamName}</div>
                    </div>
                    <section>
                        <h3>What now?</h3>
                        <p>
                            If there is interest, they will click "Yes!" and you will be notified via email.  Additionally, your email address will get unblocked, allowing you to commence your sales process.
                        </p>
                        <p>
                            If you have any questions, feel free to email <a href="mailto:help@oneroost.com">help@oneroost.com</a> or use the live chat below.
                        </p>
                    </section>

                    <section>
                        <h3>Want to know if they say "No"?</h3>
                        <p>
                            OneRoost is testing a new product that provides sellers insights into why they didn’t get the deal.  If you’re interested in learning more, click below
                        </p>
                        <div display-if={!vendorSignupSuccess}>
                            <FormGroup label='Your Email'>
                                <TextInput placeholder={email} value={email}/>
                            </FormGroup>
                            <Clickable text={'Get Updates'} onClick={vendorSignUp}/>
                        </div>
                        <p display-if={vendorSignupSuccess} className='success'>{'Your information was successfully submitted. We\'ll notify you when we have any updates!'}</p>
                    </section>

                </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Review))
