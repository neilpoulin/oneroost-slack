import React from 'react'
import PropTypes from 'prop-types'

class PriceCircle extends React.Component {
    static propTypes = {
        formattedPrice: PropTypes.string,
        period: PropTypes.string,
        backgroundColor: PropTypes.string,
        textColor: PropTypes.string,
    }

    static defaultProps = {
        backgroundColor: 'blue'
    }

    render(){
        const {formattedPrice, period, backgroundColor, textColor} = this.props
        return <div className={'container'} style={{backgroundColor, color: textColor}}>
            <div className='price'>{formattedPrice}</div>
            <div display-if={period} className='period'>{period}</div>
        </div>
    }

}

export default PriceCircle