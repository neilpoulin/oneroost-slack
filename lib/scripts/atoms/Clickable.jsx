import React from 'react'
import PropTypes from 'prop-types'

class Clickable extends React.Component {
    static propTypes = {
        displayText: PropTypes.string,
        onClick: PropTypes.func,
        styleType: PropTypes.oneOf(['btn', 'link']),
        outline: PropTypes.bool,
        colorType: PropTypes.oneOf(['primary', 'secondary']),
        className: PropTypes.string,
        target: PropTypes.string,
        href: PropTypes.string,
    }

    static defaultProps = {
        styleType: 'btn',
        outline: false,
        colorType: 'primary',
        className: '',
        target: '',
        href:'',
    }

    render () {
        const {
            displayText,
            onClick,
            styleType,
            outline,
            colorType,
            target,
            href,
            className,
        } = this.props
        let classNames = `${styleType} ${styleType}-${outline ? 'outline-' : ''}${colorType} ${className}`
        if(href){
            return <a className={classNames} href={href} target={target}>{displayText}</a>
        }
        return <span className={classNames} onClick={onClick}>{displayText}</span>
    }
}

export default Clickable;
