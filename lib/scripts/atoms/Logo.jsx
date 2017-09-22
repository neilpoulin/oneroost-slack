import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
export const HEADING = 'heading'
export const INLINE_TEXT = 'inlineText'

class Logo extends React.Component {
    static propTypes = {
        size: PropTypes.oneOf([HEADING, INLINE_TEXT ]),
    }

    render () {
        const {
            size
        } = this.props
        const classes = classNames('logo', size)
        return <span
            className={classes}>
            OneRoost
        </span>

    }
}

export default Logo;
