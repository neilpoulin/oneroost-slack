import React from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom';
import {connect} from 'react-redux'
import {LOAD_PAGES_ALIAS} from 'actions/brandPages'
import {CREATE_FILTER_ALIAS} from 'actions/gmail'

function buildHtmlLink(vanityUrl, senderName){
    let $el = document.createElement('div')
    let jsx = <div>
            Thanks for reaching out{`${senderName ? `, ${senderName}` : ''}`}. I{'\''}m excited to hear what more about your product/service.
            Please provide an overview of your offering by going to <a href={`https://www.oneroost.com/${vanityUrl}`}>{'my page'}</a>
        </div>
    render(jsx, $el)
    return $el;
}
class RedirectDropdownView extends React.Component {
    componentDidMount(){
        this.props.loadPages()
    }
    render () {
        const {isLoading, pages, insertLink, senderName, senderEmail} = this.props
        return <div className="RedirectDropdownView">
            <div display-if={isLoading}>
                Loading....
            </div>
            <div display-if={!isLoading}>
                <span className="title">Send to page:</span>
                <ul className="vanityUrls">
                    {pages.map((page, i) => {
                        return <li key={`page_${i}`} className='vanityUrl' onClick={() => insertLink(page.vanityUrl, senderName, senderEmail)}>/{page.vanityUrl}</li>
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
    const brandPages = state.brandPages
    if (brandPages.isLoading){
        return {
            isLoading: true
        }
    }
    // const {composeView} = ownProps
    const sender = state.thread.sender || {}

    return {
        isLoading: brandPages.isLoading,
        pages: brandPages.pages,
        senderName: sender.name,
        senderEmail: sender.emailAddress,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadPages: () => {
            dispatch({
                type: LOAD_PAGES_ALIAS
            })
        },
        insertLink: (vanityUrl, senderName, senderEmail) => {
            console.log('TODO: Adding filter')
            ownProps.composeView.insertHTMLIntoBodyAtCursor(buildHtmlLink(vanityUrl, senderName))
            dispatch({
                type: CREATE_FILTER_ALIAS,
                senderName,
                senderEmail,
                vanityUrl,
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RedirectDropdownView)
