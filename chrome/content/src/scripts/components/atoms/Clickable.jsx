import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class Clickable extends Component{
    static propTypes = {
        text: PropTypes.string,
        onClick: PropTypes.func,
        href: PropTypes.string,
        className: PropTypes.string,
        buttonType: PropTypes.string,
        look: PropTypes.oneOf(['button', 'link']),
        target: PropTypes.oneOf(['_blank']),
    }

    static defaultProps = {
        buttonType: 'outline-primary',
        look: 'button',
        target: '_blank',
    }

    _handleClick= (e) => {
        if (this.props.onClick){
            this.props.onClick(e)
        }
    }

    render () {
        const {text, className, look, buttonType, href, target} = this.props
        const classes = classnames(className, {
            link: look === 'link',
            btn: look === 'button',
            [`btn-${buttonType}`]: look == 'button'
        })
        if(href){
            return <a className={classes} href={href} target={target}>{text}</a>
        }
        return (
            <span className={classes}
                onClick={this._handleClick}
                >{text}</span>
        )
    }
}

export default Clickable
