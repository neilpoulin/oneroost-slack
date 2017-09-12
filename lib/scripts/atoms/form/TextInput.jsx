import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class TextInput extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        placeholder: PropTypes.string,
        type: PropTypes.oneOf(['text', 'number', 'email', 'date']),
        onChange: PropTypes.func,
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
        const {value, placeholder, type, className} = this.props
        let classes = classNames(className, 'inset')
        return <div className='container'>
            <input className={classes} type={type} value={value} placeholder={placeholder} onChange={this._handleChange}/>
        </div>

    }
}

export default TextInput;
