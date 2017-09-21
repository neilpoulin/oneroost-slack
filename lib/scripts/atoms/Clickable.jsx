import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {Link} from 'react-router-dom'

const LOOK_BUTTON = 'button'
const LOOK_LINK = 'link'

const COLOR_PRIMARY = 'primary'
const COLOR_SECONDARY = 'secondary'

class Clickable extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onClick: PropTypes.func,
        look: PropTypes.oneOf([LOOK_BUTTON, LOOK_LINK]),
        outline: PropTypes.bool,
        colorType: PropTypes.oneOf([COLOR_PRIMARY, COLOR_SECONDARY]),
        className: PropTypes.string,
        target: PropTypes.string,
        href: PropTypes.string,
        inline: PropTypes.bool,
        to: PropTypes.string,
        disabled: PropTypes.bool,
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
    }

    constructor(props){
        super(props)
        this._handleClick = this._handleClick.bind(this)
    }

    _handleClick() {
        const {disabled, onClick} = this.props
        if (!disabled && onClick){
            onClick()
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
        } = this.props
        let classes = classNames(className, {
            [`btn-outline-${colorType}`]: outline,
            'btn': look === LOOK_BUTTON,
            'link': look === LOOK_LINK,
            [`btn-${colorType}`]: !outline && look === LOOK_BUTTON,
            [`link-${colorType}`]: !outline && look === LOOK_LINK,
            'inline': inline,
            'disabled': disabled,
        })
        if(to){
            return <Link className={classes} to={to}>{text}</Link>
        }
        if(href){
            return <a className={classes} href={href} target={target}>{text}</a>
        }
        return <span className={classes} onClick={this._handleClick} disabled={disabled}>{text}</span>
    }
}

export default Clickable;
