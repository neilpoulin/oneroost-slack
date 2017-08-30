import React, {Component} from 'react';
import {connect} from 'react-redux';
import ClickableG from 'scripts/atoms/Clickable';
import {LOG_OUT_ALIAS, LOG_IN_GOOGLE_ALIAS} from 'actions/user'
import {getFullName} from 'selectors/user'

// import {handleSignInClick, handleSignOutClick} from "background/googleAuth"

class PopupView extends Component {
    render() {
        const {userId, fullName, logOut, isLoggedIn, logInGoogle, email, pages, brandPagesLoading} = this.props
        return (
            <div className="container-fluid PopupView">
                <div display-if={!isLoggedIn} className="loginContainer">
                    <div className="googleLogin" onClick={logInGoogle}></div>
                </div>
                <div display-if={isLoggedIn} className="">
                    <div className="header">
                        <div display-if={fullName} className="email">
                            {email}
                        </div>
                        <ClickableG displayText="Log Out"
                            onClick={logOut}
                            className="logout"
                            styleType="link"/>
                    </div>

                    <div display-if={userId} className="content">
                        <div>
                            <ClickableG href={'https://www.oneroost.com/settings/templates'}
                                target="_blank"
                                styleType="btn"
                                displayText="Manage Tempaltes"/>
                        </div>

                        <div display-if={!brandPagesLoading && pages} className="brandPages">
                            <h3>Brand Pages</h3>
                            <ul className="list-unstyled">
                                {pages.map((page, i) =>
                                    <li><ClickableG target="_blank" styleType="link" key={`page_${i}`} displayText={page.vanityUrl} href={`https://www.oneroost.com/${page.vanityUrl}`}/></li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                TESTING
                <ClickableG displayText="Test Clickable"/>
                AFTER CCLICABLE
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const user = state.user
    const {email, isLoggedIn, userId} = user
    const brandPages = state.brandPages

    return {
        userId,
        fullName: getFullName(state),
        isLoggedIn,
        email,
        brandPagesLoading: brandPages.isLoading,
        pages: brandPages.pages,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logOut: () => dispatch({type: LOG_OUT_ALIAS}),
        logInGoogle: () => dispatch({type: LOG_IN_GOOGLE_ALIAS}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PopupView)
