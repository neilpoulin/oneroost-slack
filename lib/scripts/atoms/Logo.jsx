import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
export const HEADING = 'heading'
export const INLINE_TEXT = 'inlineText'
export const COLOR_PRIMARY = 'primary'
class Logo extends React.Component {
    static propTypes = {
        size: PropTypes.oneOf([HEADING, INLINE_TEXT ]),
        color: PropTypes.oneOf([COLOR_PRIMARY])
    }

    render () {
        const {
            size,
            color,
        } = this.props
        const classes = classNames('logo', size, {
            [`color-${color}`]: color
        })
        return <span
            className={classes}>
            OneRoost
        </span>

    }
}

export default Logo;
