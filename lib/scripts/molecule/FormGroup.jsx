import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class FormGroup extends React.Component {
    static propTypes = {
        label: PropTypes.string,
        inline: PropTypes.bool,
        helperText: PropTypes.string,
    }

    static defaultProps = {
        inline: false,
        label: null,
    }

    render () {
        const {
            label,
            inline,
            children,
            helperText
        } = this.props
        const classes = classNames('formGroup', {
            inline,
        })
        return <div className={classes} >
            <label>
                <span className='label' display-if={label}>{label}</span>
                <div className='input'>
                    {children}
                    <p className='helper' display-if={helperText}>{helperText}</p>
                </div>
            </label>
        </div>
    }
}

export default FormGroup;
