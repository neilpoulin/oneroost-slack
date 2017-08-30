import React from 'react'
import PropTypes from 'prop-types'

class FormInput extends React.Component{
    handleChange = (e) => {
        const el = e.target;
        const value = el.type === 'checkbox' ? el.checked : el.value;
        // state[this.props.fieldName] = value;
        if (this.props.onChange){
            this.props.onChange(value);
        }
    }

    render () {
        return (
            <input
                type={this.props.type}
                className="form-control"
                value={this.props.value}
                placeholder={this.props.placeholder}
                onChange={this.handleChange}
                maxLength={this.props.maxLength}
                onKeyUp={this.props.onKeyUp}
                onKeyDown={this.props.onKeyDown}
                onBlur={this.props.onBlur}
                autoComplete={this.props.autocompleteType}
                autoFocus={this.props.autoFocus}
                />

        )
    }
}

FormInput.propTypes = {
    fieldName: PropTypes.string.isRequired,
    label: PropTypes.string,
    errors: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.any.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    addonBefore: PropTypes.string,
    addonAfter: PropTypes.string,
    maxLength: PropTypes.number,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBlur: PropTypes.func,
    horizontal: PropTypes.bool,
    autocompleteType: PropTypes.string,
    name: PropTypes.string,
    autoFocus: PropTypes.bool,
}

FormInput.defaultProps = {
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    addonBefore: null,
    addonAfter: null,
    maxLength: null,
    onKeyUp: (e) => {},
    onKeyDown: e => {},
    onBlur: e => {},
    onChange: (val) => {
        // log.info("called default onChange", val)
    },
    horizontal: false,

}

export default FormInput
