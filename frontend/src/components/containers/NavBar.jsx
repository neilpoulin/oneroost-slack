import React from 'react'
import PropTypes from 'prop-types'
import {
    Link,
    NavLink,
    withRouter,
} from 'react-router-dom'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Logo from 'atoms/Logo'

class NavBar extends React.Component {
    static propTypes = {
        fixed: PropTypes.bool,
        isLoggedIn: PropTypes.bool,
        hasSlack: PropTypes.bool,
        backgroundStyle: PropTypes.oneOf(['default', 'transparent']),
        textColor: PropTypes.oneOf(['white', 'default']),
        showHome: PropTypes.bool,
    }

    static defaultProps = {
        fixed: true,
        backgroundStyle: 'default',
        showHome: true,
    }

    render () {
        const {isLoggedIn, fixed, backgroundStyle, textColor, showHome} = this.props

        const containerClasses = classNames('navContainer', {
            'fixed': fixed,
            'transparent': backgroundStyle === 'transparent',
            [`color-${textColor}`]: textColor
        })

        return <div className={containerClasses}>
            <ul className="nav">
                <li className='navLink' display-if={showHome}><Link to="/"><Logo/></Link></li>
            </ul>
            <ul className='nav'>
                <li className='navLink' display-if={isLoggedIn}><NavLink to="/settings">Settings</NavLink></li>
                <li className='navLink' display-if={!isLoggedIn}><NavLink to="/login">Login</NavLink></li>
            </ul>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        hasSlack: state.user.get('hasSlack'),
        isLoggedIn: state.user.get('isLoggedIn'),
    }
}

export default withRouter(connect(mapStateToProps)(NavBar));
