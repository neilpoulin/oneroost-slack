import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getFullName} from 'selectors/user'

class ThreadView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            subject,
            isLoggedIn,
            fullName,
            vendorFound,
            vendor,
            isLoading,
        } = this.props
        return (
            <div className="ThreadView">
                <div display-if={isLoading}>
                    Loading....
                </div>
                <div display-if={vendorFound}>
                    <h1 className='subject'>Roost Rating: {vendor.roostRating ? vendor.roostRating : 'No Rating'}</h1>
                    <h2>{vendor.companyName}</h2>
                    <div>{vendor.email.name}</div>
                    <div>{vendor.email.emailAddress}</div>
                </div>
                <div display-if={!vendorFound && !isLoading}>
                    WARNING: Vendor has no roost rating
                </div>
            </div>
        );
    }
}

ThreadView.propTypes = {
    subject: PropTypes.string,
    isLoggedIn: PropTypes.bool,
    fullName: PropTypes.string,
    vendor: PropTypes.shape({
        companyName: PropTypes.string,
        roostRating: PropTypes.any,
        email: PropTypes.shape({
            name: PropTypes.string,
            emailAddress: PropTypes.string,
        })
    }),
    vendorFound: PropTypes.bool,
    isLoading: PropTypes.bool,
}

const mapStateToProps = (state) => {
    const thread = state.thread
    const {userId, isLoggedIn} = state.user;
    const {vendor, isLoading} = state.vendor;

    return {
        subject: thread.subject,
        userId,
        isLoggedIn,
        vendorFound: !!vendor,
        vendor,
        isLoading,
        fullName: getFullName(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadView);
