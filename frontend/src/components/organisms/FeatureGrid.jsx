import React from 'react'
import PropTypes from 'prop-types'
import FeatureGridItem from './FeatureGridItem'

class FeatureGrid extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string,
            imageUrl: PropTypes.string,
            description: PropTypes.string,
        })),
    }

    render() {
        const {
            items,
            title,
        } = this.props
        return <div className={'container'}>
            <h2>{title}</h2>
            <div display-if={items} className={'itemsContainer'}>
                {items.map(({icon, title, description, imageUrl}, i) =>
                    <div className={'gridItem'} key={`feature_grid_item_${i}`}>
                        <FeatureGridItem
                            icon={icon}
                            imageUrl={imageUrl}
                            title={title}
                            description={description}
                        />
                    </div>
                )}
            </div>
        </div>
    }

}

export default FeatureGrid