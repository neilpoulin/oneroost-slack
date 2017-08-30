import React from 'react'
import PropTypes from 'prop-types'
// import FormUtil from "FormUtil"

const FormGroup = React.createClass({
    propTypes: {
        // fieldName: PropTypes.string.isRequired,
        label: PropTypes.string,
        errors: PropTypes.object.isRequired,
        children: PropTypes.any.isRequired,
        required: PropTypes.bool,
        horizontal: PropTypes.bool,
        labelWidth: PropTypes.number,
        labelAlign: PropTypes.oneOf(['left', 'right'])
    },
    getDefaultProps(){
        return {
            label: '',
            required: false,
            horizontal: false,
            labelWidth: 3,
            labelAlign: 'left'
        }
    },
    render () {
        let labelClass = ''
        let formClass = ''
        let requiredLabelClass = this.props.required ? ' required' : ''
        let children = this.props.children

        if (this.props.horizontal){
            labelClass = `col-sm-${this.props.labelWidth}`
            formClass = 'form-inline';
            let valueClass = 12 - this.props.labelWidth;
            children = <div className={`col-sm-${valueClass}`}>{children}</div>
        }

        let form =
        <div className={`form-group ${formClass}`}>
            <label display-if={this.props.label}
                className={`control-label ${requiredLabelClass} ${labelClass} label-${this.props.labelAlign}`}>
                {this.props.label}
            </label>
            {children}
        </div>

        return form;
    }
})

export default FormGroup
