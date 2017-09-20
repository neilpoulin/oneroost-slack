import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {submitInbound} from 'ducks/inbound'
import Header from './Header'
import {withRouter} from 'react-router-dom'
import Clickable from 'atoms/Clickable'


class Review extends React.Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
    }

    render () {
        const {
            teamName,
            submitted,
            saving,
            hasError,
            errorText,
            //actions
            submit,
        } = this.props

        return <div className='content'>
            <Header title="Review the Opportunity" subtitle={`This is your last chance to add, modify, or remove any of the information before OneRoost packages and shares the opportunity with ${teamName}`}/>
            <div display-if={!submitted || true}>
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
                    Success!
                </div>
            </div>
            <div display-if={hasError} className='error'>
                {errorText}
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    const {submitted, saving, error,} = state.inbound.toJS()
    const errorText = (error && error.friendlyText ) ? error.friendlyText : 'Something went wrong, please try again later.';
    return {
        submitted,
        saving,
        hasError: !!error,
        errorText,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        saveAndContinue: () => {
            dispatch(saveInbound()).then(saved => {
                ownProps.history.push(ownProps.nextRoute)
            })
        },
        submit: () => {
            dispatch(submitInbound())
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Review))
