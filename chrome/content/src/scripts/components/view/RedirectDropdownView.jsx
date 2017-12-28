import React from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom';
import {connect} from 'react-redux'
import {CREATE_FILTER_ALIAS} from 'actions/gmail'

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
        } = this.props
        return <div className={'container'}>
            <div display-if={isLoading}>
                Loading....
            </div>
            <div display-if={!isLoading && senderEmail}>
                <p className={`username ${userBlocked ? 'blocked' : (saved ? 'unblocked' : '')}`}>
                    <span className='title'>{senderEmail}</span>
                    <span display-if={saved}>
                        {`${userBlocked ? ' Blocked' : ' Unblocked'}`}
                    </span>
                </p>

                <ul className="vanityUrls">
                    <li className='vanityUrl' onClick={() => blockOnly({senderName, senderEmail})}>Block Only</li>
                    <li className='vanityUrl' onClick={() => handleRequestMoreInfo({message, teamUrl, senderName, senderEmail, doBlock: false})}>Request Info</li>
                    <li className='vanityUrl' onClick={() => handleRequestMoreInfo({message, teamUrl, senderName, senderEmail, doBlock: true})}>Request Info and Block</li>
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

    let availableChannels = selectedChannels.map(id => {
        return channels[id]
    }).filter(c => c !== null)

    const teamUrl = `${state.config.serverUrl}/teams/${teamId}`
    const messageTemplate = state.config.redirectMessage.message

    const message = messageTemplate.replace('$TEAM_LINK', teamUrl)

    return {
        senderName: sender.name,
        senderEmail: sender.emailAddress,
        saved: state.gmail.redirectSaveSuccess,
        channels: availableChannels,
        userBlocked: state.gmail.userBlocked,
        teamUrl,
        message,
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
        blockOnly: ({senderName, senderEmail}) => {
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                destinationUrl: null,
                blocked: true,
            })
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RedirectDropdownView)
