import React from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom';
import {connect} from 'react-redux'
import {CREATE_FILTER_ALIAS} from 'actions/gmail'
import {REQUEST_VENDOR_INFO_ALIAS} from 'actions/vendor'
import {getVendorByEmail} from 'selectors/vendors'

function buildHtmlMessage(message){
    let $el = document.createElement('div')
    let jsx = <div>
        {message}
    </div>
    render(jsx, $el)
    return $el;
}
class RedirectDropdownView extends React.Component {
    componentDidMount(){

    }

    static propTypes = {
        composeView: PropTypes.object,
        handleRequestMoreInfo: PropTypes.func.isRequired,
        loadPages: PropTypes.func.isRequired,
        isLoading: PropTypes.bool,
        senderName: PropTypes.string,
        senderEmail: PropTypes.string,
        teamUrl: PropTypes.string,
        message: PropTypes.string,
        blockOnly: PropTypes.func.isRequired,
        saved: PropTypes.bool,
        userBlocked: PropTypes.bool,
        unblock: PropTypes.func.isRequired,
        vendor: PropTypes.object,
        requestInfo: PropTypes.func.isRequired,
    }


    render () {
        const {
            isLoading,
            handleRequestMoreInfo,
            senderName,
            senderEmail,
            teamUrl,
            message,
            blockOnly,
            saved,
            userBlocked,
            unblock,
            vendor,
            requestInfo,
        } = this.props
        return <div className={'container'}>
            <div display-if={isLoading}>
                Loading....
            </div>
            <div display-if={!isLoading && senderEmail}>
                <div className={'userInfo'}>
                    <div className='title'>{senderEmail}</div>
                    <div display-if={saved} className={`status ${userBlocked ? 'blocked' : (saved ? 'unblocked' : '')}`}>
                        {`${userBlocked ? ' Blocked' : ' Not Blocked'}`}
                    </div>
                </div>

                <ul className="vanityUrls">
                    <li display-if={!userBlocked} className='vanityUrl' onClick={() => blockOnly({senderName, senderEmail})}>Block Sender</li>
                    <li display-if={userBlocked} className='vanityUrl' onClick={() => unblock({senderName, senderEmail})}>Unblock Sender</li>
                    <li display-if={!vendor || !vendor.infoRequest} className='vanityUrl' onClick={() => requestInfo({vendor, email: senderEmail})}>Request Info</li>
                    <li display-if={vendor && vendor.infoRequest} className='vanityUrl no-action' onClick={() => null}>Info has been requested</li>
                </ul>
            </div>
            <div display-if={!senderEmail && !isLoading}>
                Oops, something went wrong this thread could not be processed for blocking
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    // const {composeView} = ownProps
    const sender = state.thread.sender || {}
    const user = state.user;
    const teamId = state.user.teamId
    const {channels, selectedChannels} = user
    const redirectsByEmail = state.gmail.redirectsByEmail

    let redirect = sender ? redirectsByEmail[sender.emailAddress] : null

    let availableChannels = selectedChannels.map(id => {
        return channels[id]
    }).filter(c => c !== null)

    const teamUrl = `${state.config.serverUrl}/teams/${teamId}`
    const messageTemplate = state.config.redirectMessage.message

    const message = messageTemplate.replace('$TEAM_LINK', teamUrl)
    let vendor = getVendorByEmail(state, sender.emailAddress)
    return {
        senderName: sender.name,
        senderEmail: sender.emailAddress,
        saved: !!redirect,
        channels: availableChannels,
        userBlocked: redirect && redirect.blocked,
        teamUrl,
        message,
        vendor,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleRequestMoreInfo: ({message, teamUrl, senderName, senderEmail, doBlock}) => {
            if (ownProps.composeView)
            {
                ownProps.composeView.insertHTMLIntoBodyAtCursor(buildHtmlMessage(message))
            }
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                destinationUrl: teamUrl,
                blocked: doBlock,
            })
        },
        requestInfo: ({vendor, email}) => {
            console.log('requesting vendor info')
            dispatch({
                type: REQUEST_VENDOR_INFO_ALIAS,
                vendorId: vendor ? vendor.objectId : null,
                vendorEmail: email,
            })
        },
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

export default connect(mapStateToProps, mapDispatchToProps)(RedirectDropdownView)
