import React from 'react'
import PropTypes from 'prop-types'
import NavBar from 'NavBar'
import classNames from 'classnames'

class BasePage extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        showNav: PropTypes.bool.isRequired,
        fixedNav: PropTypes.bool.isRequired,
        navBackgroundStyle: PropTypes.string,
        navTextColor: PropTypes.string,
        horizontalPadding: PropTypes.bool,
        bottomPadding: PropTypes.bool,
        suppressPadding: PropTypes.bool,
        showHome: PropTypes.bool,
        //actions,
        reset: PropTypes.func,
    }

    static defaultProps = {
        showNav: true,
        fixedNav: true,
        navStyle: 'default',
        horizontalPadding: true,
        bottomPadding: true,
        suppressPadding: false,
        showHome: true,
    }

    render () {
        const {
            children,
            showNav,
            fixedNav,
            navBackgroundStyle,
            navTextColor,
            horizontalPadding,
            bottomPadding,
            suppressPadding,
            showHome
        } = this.props
        const pageClasses = classNames('pageBase', {
            'navPadding': showNav && fixedNav,
            'horizontalPadding': horizontalPadding && !suppressPadding,
            'paddedBottom': bottomPadding && !suppressPadding,
        })
        return <div className='container'>
            <NavBar fixed={fixedNav}
                backgroundStyle={navBackgroundStyle}
                textColor={navTextColor}
                display-if={showNav}
                showHome={showHome}
                />
            <div className={pageClasses}>
                {children}
            </div>
        </div>
    }
}

export default BasePage
