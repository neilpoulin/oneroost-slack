import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink
} from 'react-router-dom'
import LogoutLink from './LogoutLink'
import {connect} from 'react-redux'

class NavBar extends React.Component {
    render () {
        const {isLoggedIn, hasSlack} = this.props
        return <div className="navContainer">
            <ul className="nav">
                <li className='navLink'><Link to="/">OneRoost</Link></li>
                <li className='navLink'><NavLink to="/login">Login</NavLink></li>

            </ul>
            <ul className='nav'>
                <li display-if={!hasSlack}>
                    <a href="https://slack.com/oauth/authorize?&client_id=225772115667.227177070210&scope=incoming-webhook,chat:write:bot,channels:write,channels:read,files:write:user"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
                </li>
                <li className='navLink' display-if={isLoggedIn}>
                    <LogoutLink/>
                </li>
            </ul>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        hasSlack: state.login.get('hasSlack'),
        isLoggedIn: state.login.get('isLoggedIn'),
    }
}

export default connect(mapStateToProps)(NavBar);
