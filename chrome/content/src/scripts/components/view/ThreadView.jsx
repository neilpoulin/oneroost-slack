import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getFullName} from 'selectors/user'

class ThreadView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {subject, sender, body, isLoggedIn, fullName} = this.props
        return (
            <div className="ThreadView">
                <div display-if={isLoggedIn}>
                    <h3>Welcome, {fullName}</h3>
                </div>
                <div className="subject">{subject}</div>
                <div display-if={sender}>
                    From: {sender.name} ({sender.emailAddress})
                </div>
                <div display-if={body}>
                    <h4>Body</h4>
                    <p className="message-body">{body}</p>
                </div>
            </div>
        );
    }
}

ThreadView.propTypes = {
    subject: PropTypes.string,
    body: PropTypes.string,
    sender: PropTypes.shape({
        emailAddress: PropTypes.string,
        name: PropTypes.string
    })
}

const mapStateToProps = (state) => {
    const thread = state.thread
    const {userId, isLoggedIn} = state.user;
    return {
        subject: thread.subject,
        body: thread.body,
        sender: thread.sender,
        userId,
        isLoggedIn,
        fullName: getFullName(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadView);
