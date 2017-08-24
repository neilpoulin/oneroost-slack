import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

class NavBar extends React.Component {
    render () {
        return <div className="navContainer">
            <ul className="nav">
                <li><Link to="/">Home Page</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
        </div>
    }
}

export default NavBar;
