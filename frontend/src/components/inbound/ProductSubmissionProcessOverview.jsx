import React from 'react'
import PropTypes from 'prop-types'
import Clickable from 'atoms/Clickable'
import Header from './Header'

class ProductSubmissionProcessOverview extends React.Component {
    static propTypes = {
        teamId: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        nextRoute: PropTypes.string.isRequired,
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render () {
        const {teamName, nextRoute} = this.props
        return <div className='content'>
            <Header title='Welcome to ' useLogo={true} subtitle='Opportunity Management for Decision Makers'/>
            <div className='instructions'>
                <p className=''>
                    <span className='bold'>{teamName}</span> collects information on products.
                </p>

            </div>
            <div>
                <Clickable to={nextRoute} text='Continue'/>
            </div>
        </div>
    }
}

export default ProductSubmissionProcessOverview;
