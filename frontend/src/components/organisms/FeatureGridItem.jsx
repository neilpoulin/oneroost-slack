import React from 'react'
import PropTypes from 'prop-types'

class FeatureGridItem extends React.Component {
    static propTypes = {
        icon: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
    }

    render(){
        const {
            title,
            icon,
            description
        } = this.props
        return <div className={'item'}>
            <p>{icon}</p>
            <p className={'title'}>{title}</p>
            <p className={'description'}>{description}</p>
        </div>
    }

}

export default FeatureGridItem