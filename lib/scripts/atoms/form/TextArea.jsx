import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class TextArea extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        maxLength: PropTypes.number,
        rows: PropTypes.number,
    }

    static defaultProps = {
        rows: 4,
    }

    constructor(props){
        super(props)
        this._handleChange = this._handleChange.bind(this);
    }

    _handleChange(e) {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value;
        if (this.props.onChange){
            this.props.onChange(value)
        }
    }

    render () {
        const {
            value,
            placeholder,
            className,
            maxLength,
            rows,
        } = this.props
        let classes = classNames(className, 'inset')
        return <div className='container'>
            <textarea
                className={classes}
                value={value}
                placeholder={placeholder}
                onChange={this._handleChange}
                maxLength={maxLength}
                rows={rows}
                />
        </div>

    }
}

export default TextArea;
