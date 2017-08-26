import React from 'react'
import PropTypes from 'prop-types'

class Clickable extends React.Component {
    static propTypes = {
        displayText: PropTypes.string,
        onClick: PropTypes.func,
        styleType: PropTypes.oneOf(['btn', 'link']),
        outline: PropTypes.bool,
        colorType: PropTypes.oneOf(['primary'])
    }

    static defaultProps = {
        styleType: 'btn',
        outline: false,
        colorType: 'primary'
    }

    render () {
        const {
            displayText,
            onClick,
            styleType,
            outline,
            colorType,
        } = this.props
        let classNames = `${styleType}  ${styleType}-${outline ? 'outline-' : ''}${colorType}`
        return <span className={classNames}>{displayText}</span>
    }
}

export default Clickable;
