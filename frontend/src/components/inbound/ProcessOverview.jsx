import React from 'react'
import PropTypes from 'prop-types'
import Clickable from 'atoms/Clickable'
import Header from './Header'

class ProcessOverview extends React.Component {
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
                    You’re here because <span className='bold'>{teamName}</span> uses OneRoost to simplify how they review opportunities from vendors and prospective partners.  OneRoost collects, organizes and shares information in Slack on behalf of the company - generating significant time savings.
                </p>
                <p>
                    If you have the standard messaging and collateral handy, submitting an opportunity to <span className='bold'>{teamName}</span> through OneRoost shouldn’t take more than 10 minutes.  We will be asking for company data, product/service information, and customer validation.
                </p>
                <p>
                    Once your information is submitted, OneRoost presents your opportunity to the entire team most applicable to your solution/offering.  95% of the time the decision maker will indicate their level of interest in 48 hours.
                </p>
                <p>
                    In the event you have any questions, ask away via the orange chat icon in the lower right.
                </p>
            </div>
            <div className='actions'>
                <Clickable to={nextRoute} text='Continue'/>
            </div>
        </div>
    }
}

export default ProcessOverview;
