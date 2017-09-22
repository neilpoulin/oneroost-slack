import React from 'react'
import PropTypes from 'prop-types'
import {withRouter, NavLink} from 'react-router-dom'

class PageTabs extends React.Component {
    static propTypes = {
        match: PropTypes.any,
    }
    render () {
        const {
            match
        } = this.props
        return <ul className='tabs list-unstyled'>
            <li className='tab'><NavLink className='link' exact to={`${match.url}`}>Overview</NavLink></li>
            <li className='tab'><NavLink className='link' to={`${match.url}/company`}>Company</NavLink></li>
            <li className='tab'><NavLink className='link' to={`${match.url}/product`}>Product /{'\u00a0'}Service</NavLink></li>
            <li className='tab'><NavLink className='link' to={`${match.url}/case-studies`}>Customer Validation</NavLink></li>
            <li className='tab'><NavLink className='link' to={`${match.url}/review`}>Review &{'\u00a0'}Submit</NavLink></li>
        </ul>
    }
}

export default withRouter(PageTabs);
