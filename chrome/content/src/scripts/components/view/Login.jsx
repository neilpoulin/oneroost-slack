import React from 'react'
import PropTypes from 'prop-types'
import Clickable from 'Clickable'
import {LOG_IN_ALIAS} from 'actions/user'
import {connect} from 'react-redux'
import FormInputGroup from 'FormInputGroup'
class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    _handleSubmit = () => {
        const {logIn} = this.props
        const {email, password} = this.state
        logIn({email, password})
    }

    render () {
        return <div>
            <div>
                <FormInputGroup type="email" onChange={(val) => this.setState({email: val})} placeholder="name@company.com" fieldName="email" label="email"/>
                <FormInputGroup type="password" onChange={(val) => this.setState({password: val})} placeholder="password" fieldName="password" label="password"/>
                <Clickable text="Log In" onClick={this._handleSubmit} className="btn-block btn-primary"/>
            </div>
        </div>
    }
}

Login.propTypes = {
    logIn: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => {
    return {

    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        logIn: ({email, password}) => {
            dispatch({
                type: LOG_IN_ALIAS,
                email,
                password
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
