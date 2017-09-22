import React from 'react'
import PropTypes from 'prop-types'
import Clickable from 'atoms/Clickable'
import {withRouter} from 'react-router-dom'

class BackButton extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        history: PropTypes.any,
    }
    static defaultProps = {
        text: '< Back',
        look: 'link',
    }

    constructor(props){
        super(props)
        this._handleClick = this._handleClick.bind(this)
    }

    _handleClick(){
        this.props.history.goBack()
    }

    render () {
        const {history} = this.props
        if (!history){
            return null
        }
        return <Clickable onClick={this._handleClick} {...this.props}/>
    }
}

export default withRouter(BackButton);
