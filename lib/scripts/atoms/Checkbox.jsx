import React from 'react'
import PropTypes from 'prop-types'

class Checkbox extends React.Component {
    constructor(props){
        super(props)
        this._handleChange = this._handleChange.bind(this);
    }

    static propTypes = {
        selected: PropTypes.bool.isRequired,
        label: PropTypes.string,
        onChange: PropTypes.func,
        children: PropTypes.any,
    }

    static defaultProps = {
        selected: false,
        label: '',
    }

    _handleChange(e){
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value;
        if (this.props.onChange){
            this.props.onChange(value)
        }
    }

    render () {
        const {selected, label, children} = this.props
        const $input = <input type='checkbox' className={''} checked={selected} onChange={this._handleChange}/>
        return <div>
            <label display-if={label}>
                {$input}
                {label}
                {children}
            </label>
            <div display-if={!label}>
                {$input}
                {children}
            </div>
        </div>
    }
}

export default Checkbox;
