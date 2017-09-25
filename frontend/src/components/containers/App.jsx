import React from 'react'
import PropTypes from 'prop-types'
import {
    BrowserRouter as Router,
    Route,
    withRouter,
} from 'react-router-dom'
import LoginPage from 'LoginPage'
import {connect} from 'react-redux'
import HomePage from './HomePage'
import SettingsPage from './SettingsPage'
import TeamInboundPage from './TeamInboundPage'
import PrivateRoute from './PrivateRoute'
import SupportPage from './SupportPage'
import PrivacyPage from './PrivacyPage'

const App = ({
    hasLoaded,
}) => (
    <Router>
        <div display-if={hasLoaded}>
            <Route exact path="/" component={HomePage}/>
            <Route path="/login" component={LoginPage}/>
            <Route path="/install-success" render={() => <LoginPage installSuccess={true}/>}/>
            <Route path={'/teams/:teamId'} component={TeamInboundPage}/>
            <PrivateRoute path='/settings' component={SettingsPage}/>
            <Route path='/support' component={SupportPage}/>
            <Route path='/privacy' component={PrivacyPage}/>
        </div>
    </Router>
)

App.propTypes = {
    hasLoaded: PropTypes.bool.isRequired,
}


const mapStateToProps = (state, ownProps) => {
    const {config} = state;
    const isLoading = config.get('isLoading')
    const hasLoaded = config.get('hasLoaded')
    return {
        isLoading,
        hasLoaded,
    }
}

export default connect(mapStateToProps)(App)
