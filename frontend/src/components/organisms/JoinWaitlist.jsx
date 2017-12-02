import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import Clickable from 'atoms/Clickable'
import TextInput from 'atoms/form/TextInput'
import {
    setWaitlistEmail,
    submitWaitlist,
} from 'ducks/homePage'

class JoinWaitlist extends React.Component {
    static propTypes = {
        waitlistSaving: PropTypes.bool,
        waitlistSaveSuccess: PropTypes.bool,
        waitlistError: PropTypes.any,
        email: PropTypes.string,
        isValidEmail: PropTypes.bool,

        //ownprops
        buttonText: PropTypes.string,
        buttonSuccessText: PropTypes.string,
        inline: PropTypes.bool,

        //actions:
        setEmail: PropTypes.func.isRequired,
        submitEmail: PropTypes.func.isRequired,
    }

    static defaultProps = {
        buttonText: 'Join the Waitlist',
        buttonSuccessText: 'Thanks!',
        inline: true,
    }

    render() {
        const {
            buttonText,
            buttonSuccessText,
            email,
            isValidEmail,
            inline,
            waitlistSaving,
            waitlistSaveSuccess,
            waitlistError,
            //actions
            setEmail,
            submitEmail,
        } = this.props

        let containerClassName = classnames('container', {
            inline: inline
        })

        return <div className={containerClassName}>
            <div className={'emailInputContainer'}>
                <TextInput onChange={setEmail}
                    value={email}
                    type={'email'}
                    placeholder={'enter your work email'}
                    roundLeft={true}
                    className={'emailInput' + (email ? ' active' : '')}
                />
            </div>
            <div className={'actionContainer'}>
                <Clickable onClick={submitEmail}
                    text={waitlistSaveSuccess ? buttonSuccessText : buttonText}
                    colorType={'primary'}
                    disabled={waitlistSaveSuccess}
                    roundRight={true}
                    nowrap={true}
                />
            </div>
        </div>
    }

}

const mapStateToProps = (state, ownProps) => {
    const homePage = state.homePage.toJS()
    let {
        waitlist: {
            email,
            emailValid: isValidEmail,
            saving: waitlistSaving,
            saveSuccess: waitlistSaveSuccess,
            error: waitlistError,
        },
    } = homePage

    return {
        email,
        isValidEmail,
        waitlistSaving,
        waitlistSaveSuccess,
        waitlistError,
    }

}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setEmail: (email) => dispatch(setWaitlistEmail(email)),
        submitEmail: () => {
            dispatch(submitWaitlist())
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinWaitlist)