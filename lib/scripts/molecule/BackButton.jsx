import React from 'react'
import PropTypes from 'prop-types'
import Clickable from 'atoms/Clickable'
import {withRouter} from 'react-router-dom'

class BackButton extends React.Component {
    static propTypes = {
        text: PropTypes.string,
    }
    static defaultProps = {
        text: '< Back',
        look: 'link',
    }
    render () {
        const {history} = this.props
        if (!history){
            return null
        }
        return <Clickable onClick={this.props.history.goBack} {...this.props}/>
    }
}

export default withRouter(BackButton);
