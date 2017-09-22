import React from 'react'
import PropTypes from 'prop-types'
import Logo from 'atoms/Logo'
class Header extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.string,
        useLogo: PropTypes.bool,
    }
    render () {
        const {title, subtitle, useLogo} = this.props
        return <div className='header'>
            <h2 display-if={title}>{title}<Logo display-if={useLogo}/></h2>
            <p className='subtitle' display-if={subtitle}>{subtitle}</p>
        </div>
    }
}

export default Header;
