import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class FormGroup extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        inline: PropTypes.bool,
    }

    static defaultProps = {
        inline: false,
        label: null,
    }

    render () {
        const {label, inline, children} = this.props
        const classes = classNames('formGroup', {
            inline,
        })
        return <div className={classes} >
            <label>
                <span className='label' display-if={label}>{label}</span>
                <div className='input'>
                    {children}
                </div>
            </label>
        </div>
    }
}

export default FormGroup;