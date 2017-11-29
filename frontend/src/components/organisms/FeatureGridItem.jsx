import React from 'react'
import PropTypes from 'prop-types'

class FeatureGridItem extends React.Component {
    static propTypes = {
        icon: PropTypes.string,
        imageUrl: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
    }

    render(){
        const {
            title,
            icon,
            imageUrl,
            description
        } = this.props
        return <div className={'item'}>
            <div className={'icon'} display-if={imageUrl}>
                <img src={imageUrl}/>
            </div>
            <p className={'title'}>{title}</p>
            <p className={'description'}>{description}</p>
        </div>
    }

}

export default FeatureGridItem