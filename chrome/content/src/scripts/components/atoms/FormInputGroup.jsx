import React from "react"
import PropTypes from "prop-types"
import FormGroup from "FormGroup"
// import * as log from "LoggingUtil"

const FormInputGroup = React.createClass({
    propTypes: {
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
    },
    getDefaultProps(){
        return {
            label: "",
            type: "text",
            placeholder: "",
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
    },
    handleChange(e){
        const el = e.target;
        const value = el.type === "checkbox" ? el.checked : el.value;

        let state = {};
        state[this.props.fieldName] = value;
        this.props.onChange(value);
    },
    getAddonBefore(){
        if (this.props.addonBefore){
            return <span className="input-group-addon">{this.props.addonBefore}</span>
        }
        return null;
    },
    getAddonAfter(){
        if (this.props.addonAfter){
            return <span className="input-group-addon">{this.props.addonAfter}</span>
        }
        return null;
    },
    render () {
        let input = <input
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

        if (this.props.addonBefore || this.props.addonAfter){
            input =
            <div className="input-group">
                {this.getAddonBefore()}
                {input}
                {this.getAddonAfter()}
            </div>
        }

        let form =
        <FormGroup
            label={this.props.label}
            errors={this.props.errors}
            fieldName={this.props.fieldName}
            required={this.props.required}
            horizontal={this.props.horizontal}
            >
            {input}
            {this.props.children}
        </FormGroup>
        return form
    }
})

export default FormInputGroup
