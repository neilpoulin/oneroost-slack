import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logout} from 'ducks/user'
import {Link} from 'react-router-dom'

class LogoutLink extends React.Component {
    static propTypes = {
        doLogout: PropTypes.func.isRequired,
        className: PropTypes.string,
    }
    render () {
        const {doLogout, className} = this.props
        return <Link to='/' onClick={doLogout} className={className}>Logout</Link>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {

    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        doLogout: () => {
            dispatch(logout())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutLink)
