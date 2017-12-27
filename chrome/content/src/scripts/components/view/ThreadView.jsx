import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getDomainFromEmail} from 'util/emailUtil'
import WarningIcon from 'atoms/icon/warning'
import {roostOrange} from 'util/variables'
import Clickable, {COLOR_GREEN} from 'atoms/Clickable'

class ThreadView extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        vendor: PropTypes.shape({
            companyName: PropTypes.string,
            roostRating: PropTypes.any,
            email: PropTypes.string,
        }),
        email: PropTypes.string,
        domain: PropTypes.string,
        vendorFound: PropTypes.bool,
        isLoading: PropTypes.bool,
    }

    render() {
        const {
            vendorFound,
            vendor,
            isLoading,
            email,
            domain,
        } = this.props
        return (
            <div className="container">
                <div display-if={isLoading}>
                    Loading....
                </div>

                <div className={'title'}>
                    <h2 display-if={vendorFound}>{vendor.companyName}</h2>
                    <h2 display-if={domain && !vendorFound}>{domain}</h2>
                    <div className={'roostRating'} display-if={vendorFound}>
                        <span className='rating'>{vendor.roostRating ? vendor.roostRating : 'N/A'}</span>
                        <span className="caption">Roost Rating</span>
                    </div>
                    <div className={'roostRating'} display-if={!vendorFound}>
                        <span className="caption">Roost Rating not available</span>
                    </div>
                </div>

                <div display-if={vendorFound}>
                    <div display-if={vendor && vendor.inbound}>
                        <section>
                            <ul className={'tags'} display-if={vendor.inbound.tags}>
                                {vendor.inbound.tags.map((tag, i) =>
                                    <li className='tag' key={`tags_${i}`}>{tag}</li>
                                )}
                            </ul>
                        </section>
                        <section display-if={vendor.inbound.website}>
                            <Clickable href={vendor.inbound.website} target={'_blank'} text={'View Website'}/>
                        </section>
                        <section display-if={vendor.inbound.elevatorPitch}>
                            <h3>Elevator Pitch</h3>
                            <p>{vendor.inbound.elevatorPitch}</p>
                        </section>
                        <section display-if={vendor.inbound.relevancy}>
                            <h3>Integrations</h3>
                            <p>{vendor.inbound.relevancy}</p>
                        </section>
                        <section className={'actions'}>
                            <Clickable text={'Request Info'} outline={true} colorType={COLOR_GREEN}/>
                            <Clickable text={'Block'}/>
                        </section>
                        <section display-if={vendor.inbound.testimonials} className='testimonials'>
                            <h3>Testimonials</h3>
                            {vendor.inbound.testimonials.map((testimonial, i) =>
                                <div key={`testimonial_${i}`} className='testimonial'>
                                    <h4>{testimonial.customerName}</h4>
                                    <q>{testimonial.comment}</q>
                                </div>)}
                        </section>
                    </div>
                </div>
                <div display-if={!vendorFound && !isLoading}>
                    <div className={'senderInfo'}>
                        <label>Sender</label>
                        <p>{email}</p>
                    </div>
                    <div className={'warning'}>
                        <h2 className={'header'}><WarningIcon color={roostOrange}/> Caution</h2>
                        There is no data on this vendor. We recommend requesting more details below for more information.
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const thread = state.thread
    let email = thread.sender ? thread.sender.emailAddress : null

    if (!email)
    {
        return {
            isLoading: false,
            vendorFound: false,
        }
    }
    let vendor = state.vendors[email];
    let domain = getDomainFromEmail(email)
    if (!vendor)
    {
        return {
            isLoading: false,
            vendorFound: false,
            email,
            domain,
        }
    }

    return {
        vendorFound: !!vendor.roostRating,
        email,
        domain,
        vendor,
        isLoading: vendor.isLoading,
    }
}

export default connect(mapStateToProps)(ThreadView);
