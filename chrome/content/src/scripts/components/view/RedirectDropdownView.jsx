import React from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom';
import {connect} from 'react-redux'
import {CREATE_FILTER_ALIAS} from 'actions/gmail'

function buildHtmlLink(url, senderName){
    let $el = document.createElement('div')
    let jsx = <div>
            Thanks for reaching out{`${senderName ? `, ${senderName}` : ''}`}. I{'\''}m excited to hear what more about your product/service.
            Please provide an overview of your offering by going to <a href={`${url}`}>{url}</a>
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
            channels,
            teamUrl,
        } = this.props
        return <div className="RedirectDropdownView">
            <div display-if={isLoading}>
                Loading....
            </div>
            <div display-if={!isLoading}>
                <span className="title">Redirect User</span>
                <ul className="vanityUrls">
                    <li className='vanityUrl' onClick={() => insertLink(teamUrl, senderName, senderEmail, true)}>Block</li>
                    <li className='vanityUrl' onClick={() => insertLink(teamUrl, senderName, senderEmail, false)}>Do Not Block</li>
                </ul>
                <span className="title">Send to channel</span>
                <ul className="vanityUrls">
                    {channels.map((channel, i) => {
                        return <li key={`channel_${i}`} className='vanityUrl' onClick={() => insertLink(teamUrl, senderName, senderEmail)}>#{channel.name}</li>
                    })}
                </ul>

            </div>
        </div>
    }
}

RedirectDropdownView.propTypes = {
    composeView: PropTypes.object.isRequired,
    insertLink: PropTypes.func.isRequired,
    loadPages: PropTypes.func.isRequired,
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

    return {
        senderName: sender.name,
        senderEmail: sender.emailAddress,
        channels: availableChannels,
        teamUrl,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        insertLink: (vanityUrl, senderName, senderEmail, doBlock) => {
            console.log('TODO: Adding filter')
            ownProps.composeView.insertHTMLIntoBodyAtCursor(buildHtmlLink(vanityUrl, senderName))
            if(doBlock){
                dispatch({
                    type: CREATE_FILTER_ALIAS,
                    senderName,
                    senderEmail,
                    vanityUrl,
                })
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RedirectDropdownView)
