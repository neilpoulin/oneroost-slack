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
    render () {
        const {
            isLoading,
            insertLink,
            senderName,
            senderEmail,
            teamUrl,
            message,
        } = this.props
        return <div className="RedirectDropdownView">
            <div display-if={isLoading}>
                Loading....
            </div>
            <div display-if={!isLoading}>
                <h2 className="title logo">OneRoost</h2>
                <ul className="vanityUrls">
                    <li className='vanityUrl' onClick={() => insertLink({message, teamUrl, senderName, senderEmail, doBlock: true})}>Redirect and Block</li>
                    <li className='vanityUrl' onClick={() => insertLink({message, teamUrl, senderName, senderEmail, doBlock: false})}>Redirect and Do Not Block</li>
                </ul>
            </div>
        </div>
    }
}

RedirectDropdownView.propTypes = {
    composeView: PropTypes.object.isRequired,
    insertLink: PropTypes.func.isRequired,
    loadPages: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    senderName: PropTypes.string,
    senderEmail: PropTypes.string,
    teamUrl: PropTypes.string,
    message: PropTypes.string,
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
        channels: availableChannels,
        teamUrl,
        message,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        insertLink: ({message, teamUrl, senderName, senderEmail, doBlock}) => {
            ownProps.composeView.insertHTMLIntoBodyAtCursor(buildHtmlMessage(message))
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                destinationUrl: teamUrl,
                blocked: doBlock,
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RedirectDropdownView)
