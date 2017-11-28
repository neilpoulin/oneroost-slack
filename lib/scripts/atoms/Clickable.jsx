import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {Link} from 'react-router-dom'

const LOOK_BUTTON = 'button'
const LOOK_LINK = 'link'

const COLOR_PRIMARY = 'primary'
const COLOR_SECONDARY = 'secondary'
const COLOR_WHITE = 'white'

class Clickable extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onClick: PropTypes.func,
        look: PropTypes.oneOf([LOOK_BUTTON, LOOK_LINK]),
        outline: PropTypes.bool,
        colorType: PropTypes.oneOf([COLOR_PRIMARY, COLOR_SECONDARY, COLOR_WHITE]),
        className: PropTypes.string,
        target: PropTypes.string,
        href: PropTypes.string,
        inline: PropTypes.bool,
        to: PropTypes.string,
        disabled: PropTypes.bool,
        roundLeft: PropTypes.bool,
        roundRight: PropTypes.bool,
        nowrap: PropTypes.bool,
    }

    static defaultProps = {
        look: LOOK_BUTTON,
        outline: false,
        colorType: COLOR_PRIMARY,
        className: '',
        target: '',
        href:'',
        text: '',
        inline: false,
        to: null,
        disabled: false,
        roundLeft: false,
        roundRight: false,
        nowrap: false,
    }

    constructor(props){
        super(props)
        this._handleClick = this._handleClick.bind(this)
    }

    _handleClick(event) {
        const {disabled, onClick} = this.props
        if (!disabled && onClick){
            onClick(event)
        }
    }

    render () {
        const {
            text,
            look,
            outline,
            colorType,
            target,
            href,
            className,
            inline,
            to,
            disabled,
            roundLeft,
            roundRight,
            nowrap,
        } = this.props
        let classes = classNames(className, {
            [`btn-outline-${colorType}`]: outline,
            'btn': look === LOOK_BUTTON,
            'link': look === LOOK_LINK,
            [`btn-${colorType}`]: !outline && look === LOOK_BUTTON,
            [`link-${colorType}`]: !outline && look === LOOK_LINK,
            'inline': inline,
            'disabled': disabled,
            roundRight: roundRight,
            roundLeft: roundLeft,
            nowrap: nowrap,
        })
        if(to){
            return <Link className={classes} to={to} onClick={this._handleClick}>{text}</Link>
        }
        if(href){
            return <a className={classes} href={href} target={target} onClick={this._handleClick}>{text}</a>
        }
        return <span className={classes} onClick={this._handleClick} disabled={disabled}>{text}</span>
    }
}

export default Clickable;
