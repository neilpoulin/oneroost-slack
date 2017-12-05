import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Clickable from 'atoms/Clickable'
import {submitInbound} from 'ducks/inbound';


class SubmitInboundButton extends React.Component {
    static propTypes = {
        hasError: PropTypes.bool,
        saving: PropTypes.bool,
        vendorSignupSuccess: PropTypes.bool,
        errorText: PropTypes.string,
        buttonText: PropTypes.string,
        //own props
        afterSave: PropTypes.func,
        //actions
        submit: PropTypes.func.isRequired,
    }

    static defaultProps = {
        buttonText: 'Submit',
        afterSave: () => {
            console.warn('not implemented')
        }
    }

    render() {
        const {
            hasError,
            errorText,
            saving,
            buttonText,
            submit,
        } = this.props
        return <div>
            <div><Clickable text={saving ? 'Saving...' : `${buttonText}`} onClick={submit} disabled={saving}/></div>
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
        vendorSignupSuccess
    } = state.inbound.toJS()
    const errorText = (error && error.friendlyText) ? error.friendlyText : 'Something went wrong, please try again later.';

    return {
        submitted,
        saving,
        hasError: !!error,
        errorText,
        vendorSignupSuccess,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        submit: () => {
            dispatch(submitInbound()).then(() => {
                if (ownProps.afterSave) {
                    ownProps.afterSave()
                }
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmitInboundButton)