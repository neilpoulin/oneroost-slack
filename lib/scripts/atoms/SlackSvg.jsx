import React from 'react'
import PropTypes from 'prop-types'

class SlackSvg extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    }

    render () {
        const {className} = this.props
        return <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            viewBox="0 0 270 270" style={{enableBackground:'new 0 0 270 270'}} className={className} xmlSpace="preserve">
            <g>
                <g>
                    <path className="st0" d="M154.3,87.1c-1.9-5.7-8-8.8-13.7-7c-5.7,1.9-8.8,8-7,13.7l28.1,86.4c1.9,5.3,7.7,8.3,13.2,6.7
                        c5.8-1.7,9.3-7.8,7.4-13.4C182.3,173.3,154.3,87.1,154.3,87.1z"/>
                    <path className="st1" d="M110.8,101.2c-1.9-5.7-8-8.8-13.7-7c-5.7,1.9-8.8,8-7,13.7l28.1,86.4c1.9,5.3,7.7,8.3,13.2,6.7
                        c5.8-1.7,9.3-7.8,7.4-13.4C138.8,187.4,110.8,101.2,110.8,101.2z"/>
                    <path className="st2" d="M189.7,158.6c5.7-1.9,8.8-8,7-13.7c-1.9-5.7-8-8.8-13.7-7l-86.5,28.2c-5.3,1.9-8.3,7.7-6.7,13.2
                        c1.7,5.8,7.8,9.3,13.4,7.4C103.4,186.7,189.7,158.6,189.7,158.6z"/>
                    <path className="st3" d="M114.5,183.1c5.6-1.8,12.9-4.2,20.7-6.7c-1.8-5.6-4.2-12.9-6.7-20.7l-20.7,6.7L114.5,183.1z"/>
                    <path className="st4" d="M158.1,168.9c7.8-2.5,15.1-4.9,20.7-6.7c-1.8-5.6-4.2-12.9-6.7-20.7l-20.7,6.7L158.1,168.9z"/>
                    <path className="st5" d="M175.5,115.1c5.7-1.9,8.8-8,7-13.7c-1.9-5.7-8-8.8-13.7-7l-86.4,28.1c-5.3,1.9-8.3,7.7-6.7,13.2
                        c1.7,5.8,7.8,9.3,13.4,7.4C89.3,143.1,175.5,115.1,175.5,115.1z"/>
                    <path className="st6" d="M100.4,139.5c5.6-1.8,12.9-4.2,20.7-6.7c-2.5-7.8-4.9-15.1-6.7-20.7l-20.7,6.7L100.4,139.5z"/>
                    <path className="st7" d="M143.9,125.4c7.8-2.5,15.1-4.9,20.7-6.7c-2.5-7.8-4.9-15.1-6.7-20.7l-20.7,6.7L143.9,125.4z"/>
                </g>
            </g>
        </svg>
    }
}

export default SlackSvg;
