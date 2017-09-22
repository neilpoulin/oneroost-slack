import React from 'react'
import PropTypes from 'prop-types'
import {
    Link,
    NavLink,
    withRouter,
} from 'react-router-dom'
import LogoutLink from './LogoutLink'
import {connect} from 'react-redux'
import classNames from 'classnames'

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
        const {isLoggedIn, hasSlack, fixed, backgroundStyle, textColor, showHome} = this.props

        const containerClasses = classNames('navContainer', {
            'fixed': fixed,
            'transparent': backgroundStyle === 'transparent',
            [`color-${textColor}`]: textColor
        })

        return <div className={containerClasses}>
            <ul className="nav">
                <li className='navLink' display-if={showHome}><Link to="/">OneRoost</Link></li>
            </ul>
            <ul className='nav'>
                <li className='navLink' display-if={isLoggedIn}><NavLink to="/settings">Settings</NavLink></li>
                <li className='navLink' display-if={isLoggedIn}>
                    <LogoutLink/>
                </li>
                <li className='navLink' display-if={!isLoggedIn}><NavLink to="/login">Login</NavLink></li>
                <li display-if={!hasSlack}>
                    <a href="https://slack.com/oauth/authorize?&client_id=225772115667.227177070210&scope=incoming-webhook,chat:write:bot,channels:write,channels:read,files:write:user"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/></a>
                </li>
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
