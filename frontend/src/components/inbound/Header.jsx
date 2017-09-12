import React from 'react'
import PropTypes from 'prop-types'

class Header extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.string,
    }
    render () {
        const {title, subtitle} = this.props
        return <div className='header'>
            <h2 display-if={title}>{title}</h2>
            <p className='subtitle' display-if={subtitle}>{subtitle}</p>
        </div>
    }
}

export default Header;
