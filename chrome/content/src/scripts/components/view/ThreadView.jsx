import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getDomainFromEmail} from 'util/emailUtil'
import WarningIcon from 'atoms/icon/warning'
import {roostOrange} from 'util/variables'
import Clickable, {COLOR_GREEN} from 'atoms/Clickable'
import {CREATE_FILTER_ALIAS} from 'actions/gmail'
import {formatDateShort} from 'util/timeUtil'

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
        blockOnly: PropTypes.func.isRequired,
        unblock: PropTypes.func.isRequired,
        redirect: PropTypes.shape({
            blocked: PropTypes.bool,
        }),
        senderBlocked: PropTypes.bool,
    }

    render() {
        const {
            vendorFound,
            vendor,
            isLoading,
            email,
            domain,
            blockOnly,
            unblock,
            redirect,
            senderBlocked,
        } = this.props
        return (
            <div className="container">
                <div display-if={isLoading}>
                    Loading....
                </div>

                <div className={'title'}>
                    <h2 display-if={vendorFound && vendor && vendor.inbound }>{vendor.inbound.companyName}</h2>
                    <h2 display-if={domain && !vendorFound}>{domain}</h2>
                    <div className={'roostRating'} display-if={vendorFound}>
                        <span className='rating'>{vendor.roostRating ? vendor.roostRating : 'N/A'}</span>
                        <span className="caption">Roost Rating</span>
                    </div>
                    <div className={'roostRating'} display-if={!vendorFound}>
                        <span className="caption">Roost Rating not available</span>
                    </div>
                    <div>
                        {email}
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
                            <Clickable display-if={!senderBlocked} text={`Block\n${email}`} onClick={() => blockOnly({senderEmail: email})}/>
                            <Clickable display-if={senderBlocked} text={`UnBlock\n${email}`} colorType={COLOR_GREEN} onClick={() => unblock({senderEmail: email})}/>
                            <div display-if={redirect}>
                                {redirect.blocked ? 'blocked' : 'unblocked'} by {redirect.updatedBy.username} on {formatDateShort(redirect.updatedAt)}
                            </div>
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
                    <section className={'warning'}>
                        <h2 className={'header'}><WarningIcon color={roostOrange}/> Caution</h2>
                        There is no data on this vendor. We recommend requesting more details below for more information.
                    </section>
                    <section className={'actions'}>
                        <Clickable text={'Request Info'} outline={true} colorType={COLOR_GREEN}/>
                        <Clickable display-if={!senderBlocked} text={`Block\n${email}`} onClick={() => blockOnly({senderEmail: email})}/>
                        <Clickable display-if={senderBlocked} text={`UnBlock\n${email}`} colorType={COLOR_GREEN} onClick={() => unblock({senderEmail: email})}/>
                        <div display-if={redirect}>
                            {redirect.blocked ? 'blocked' : 'unblocked'} by {redirect.updatedBy.username} on {formatDateShort(redirect.updatedAt)}
                        </div>
                    </section>
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
    let redirect = state.gmail.redirectsByEmail[email]
    let domain = getDomainFromEmail(email)
    let vendor = state.vendors[domain];

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
        redirect,
        senderBlocked: redirect && redirect.blocked
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        blockOnly: ({senderName, senderEmail}) => {
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                destinationUrl: null,
                blocked: true,
            })
        },
        unblock: ({senderName, senderEmail}) => {
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                destinationUrl: null,
                blocked: false,
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadView);
